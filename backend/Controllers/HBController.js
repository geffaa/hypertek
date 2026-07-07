import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";
import { ethers } from "ethers";
import nodemailer from "nodemailer";
import {
  getStripe,
  createConnectedAccount,
  ensureTestCapabilities,
  transfersActive,
  attachAuBankAccount,
  attachDebitCard as attachDebitCardExternal,
} from "../services/stripeConnect.js";
import { convertUsdToAud } from "../services/fxService.js";

// Minimal ERC-20 ABI for USDC transfer
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

// HB conversion constant
const HB_TO_USD = 250; // 250 HB = $1 USD
const MIN_USDC_CASHOUT_HB = 250; // $1 minimum for USDC cashout
const MIN_BANK_CASHOUT_HB = 250; // $1 minimum for bank cashout
const MIN_TOPUP_HB = 250; // $1 minimum top-up

// Bank cashout is AU-only: the platform is an AU Stripe account and Stripe does not support
// cross-border payouts from AU, so connected accounts and payouts are always AUD.
const INSTANT_FEE_RATE_AU = 0.015; // Stripe instant payout fee for AU
const AU_ONLY_BANK_MSG =
  "Bank cashout currently supports Australian (AUD) accounts only. Please use USDC cashout for other countries.";


// ── Stripe Connect helpers (thin wrappers over services/stripeConnect.js) ─────
// The shared, AU-only connected-account logic lives in services/stripeConnect.js.
// These wrappers add User persistence on top.

async function getOrCreateUserConnectedAccount(user, stripe, userIp) {
  if (user.stripeConnectAccountId) {
    await ensureTestCapabilities(stripe, user.stripeConnectAccountId);
    return user.stripeConnectAccountId;
  }
  const account = await createConnectedAccount(stripe, {
    email: user.Email || user.email,
    fullName: user.FullName,
    productDescription:
      "In-game currency (Hyper Bucks) top-up and cashout platform for the Hyper Tek gaming ecosystem.",
    ip: userIp,
  });
  user.stripeConnectAccountId = account.id;
  await user.save();
  await ensureTestCapabilities(stripe, account.id);
  return account.id;
}

async function attachUserDebitCard(user, stripe, accountId) {
  const card = user.debitCard;
  if (!card?.stripeCardId) throw new Error("No debit card saved for this user");
  if (user.stripeExternalAccountId === card.stripeCardId) return card.stripeCardId;
  const extId = await attachDebitCardExternal(stripe, accountId, card.stripeCardId, user.stripeExternalAccountId);
  user.stripeExternalAccountId = extId;
  await user.save();
  return extId;
}

// AU-only: bankDetails.routingNumber holds the BSB, accountNumber the account number.
async function attachUserBankAccount(user, stripe, accountId) {
  const bd = user.bankDetails || {};
  const extId = await attachAuBankAccount(
    stripe,
    accountId,
    { accountHolderName: bd.accountHolderName, bsb: bd.routingNumber, accountNumber: bd.accountNumber },
    user.stripeExternalAccountId
  );
  user.stripeExternalAccountId = extId;
  await user.save();
  return extId;
}

// ------------------ SMTP TRANSPORTER ------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

// ── Bank cashout execution (shared by cashoutHB + admin retry) ───────────────
// Converts the USD-pegged value to AUD, runs the Stripe Connect transfer→payout, and
// updates the ledger. Returns { status, ... }. Emails admin only when left pending.
async function executeBankPayout({ user, ledgerEntry, amount, usdAmount, payoutSpeed, reqIp }) {
  const stripe = getStripe();
  const isInstant = payoutSpeed === "instant";

  // Platform balance and connected account are both AUD, so Stripe charges no
  // cross-currency FX fee on the payout — this rate only sets how many AUD we owe.
  const { rate: fxRate, aud: grossAud } = await convertUsdToAud(usdAmount);

  // Instant payouts incur a Stripe fee deducted from the connected-account balance.
  // Size the payout so payout + fee ≤ the gross we transfer in.
  const payoutAud = isInstant
    ? Math.round((grossAud / (1 + INSTANT_FEE_RATE_AU)) * 100) / 100
    : grossAud;

  await HBLedger.findByIdAndUpdate(ledgerEntry._id, { cashoutAUD: payoutAud, fxRate });

  let result;
  if (process.env.STRIPE_CONNECT_ENABLED === "true") {
    try {
      const connectAccountId = await getOrCreateUserConnectedAccount(user, stripe, reqIp);

      if (isInstant) {
        await attachUserDebitCard(user, stripe, connectAccountId);
      } else {
        await attachUserBankAccount(user, stripe, connectAccountId);
      }

      if (!(await transfersActive(stripe, connectAccountId))) {
        throw new Error("Connected account transfers capability not yet active. Please try again in a few moments.");
      }

      const transfer = await stripe.transfers.create({
        amount: Math.round(grossAud * 100),
        currency: "aud",
        destination: connectAccountId,
        transfer_group: `cashout_${ledgerEntry._id}`,
        metadata: {
          userId: String(user._id),
          hbAmount: String(amount),
          ledgerId: String(ledgerEntry._id),
          payoutSpeed,
          usdAmount: String(usdAmount),
          fxRate: String(fxRate),
        },
      });

      const payoutParams = {
        amount: Math.round(payoutAud * 100),
        currency: "aud",
        statement_descriptor: "HYPERTEK",
        metadata: { userId: String(user._id), transferId: transfer.id, payoutSpeed, ledgerId: String(ledgerEntry._id) },
      };
      if (isInstant) payoutParams.method = "instant";

      const payout = await stripe.payouts.create(payoutParams, { stripeAccount: connectAccountId });

      await HBLedger.findByIdAndUpdate(ledgerEntry._id, {
        cashoutStatus: "processing",
        cashoutTxHash: payout.id,
      });

      result = { status: "processing", stripePayoutId: payout.id, transferId: transfer.id, isInstant, payoutAud, fxRate };
      console.log(`[HB Cashout Connect] Transfer ${transfer.id} | Payout ${payout.id} | A$${payoutAud} (gross A$${grossAud}) → ${connectAccountId} | ${payoutSpeed}`);
    } catch (connectErr) {
      console.error("[HB Cashout Connect] Failed:", connectErr.message);
      result = { status: "pending", error: connectErr.message, payoutAud, fxRate, isInstant };
      await HBLedger.findByIdAndUpdate(ledgerEntry._id, { cashoutStatus: "pending" });
    }
  } else {
    result = { status: "pending", detail: "awaiting_admin", payoutAud, fxRate, isInstant };
  }

  if (result.status === "pending") {
    await notifyAdminBankCashoutPending({ user, amount, usdAmount, payoutAud, fxRate, ledgerEntry, error: result.error });
  }
  return result;
}

// Emails the admin when a bank cashout needs manual handling (Connect disabled or errored).
async function notifyAdminBankCashoutPending({ user, amount, usdAmount, payoutAud, fxRate, ledgerEntry, error }) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.SMTP_EMAIL;
  if (!adminEmail) return;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: adminEmail,
      subject: `[HyperTek] HB Bank Cashout A$${payoutAud} — ACTION REQUIRED`,
      html: `
        <h2>Hyper Bucks Bank Cashout — ACTION REQUIRED: Manual Transfer Needed</h2>
        <table border="1" cellpadding="6" cellspacing="0">
          <tr><td><strong>User ID</strong></td><td>${user._id}</td></tr>
          <tr><td><strong>User Email</strong></td><td>${user.Email || user.email || "N/A"}</td></tr>
          <tr><td><strong>HB Amount</strong></td><td>${amount} HB</td></tr>
          <tr><td><strong>USD (peg)</strong></td><td>$${usdAmount}</td></tr>
          <tr><td><strong>AUD to pay</strong></td><td>A$${payoutAud} (rate ${fxRate})</td></tr>
          <tr><td><strong>Ledger Entry ID</strong></td><td>${ledgerEntry._id}</td></tr>
          <tr><td><strong>Reason</strong></td><td>${error || "Stripe Connect not enabled"}</td></tr>
          <tr style="background:#fff3cd"><td><strong>Account Holder</strong></td><td>${user.bankDetails?.accountHolderName || "N/A"}</td></tr>
          <tr style="background:#fff3cd"><td><strong>Bank Name</strong></td><td>${user.bankDetails?.bankName || "N/A"}</td></tr>
          <tr style="background:#fff3cd"><td><strong>BSB</strong></td><td>${user.bankDetails?.routingNumber || "N/A"}</td></tr>
          <tr style="background:#fff3cd"><td><strong>Account Number</strong></td><td>${user.bankDetails?.accountNumber || "N/A"}</td></tr>
          <tr style="background:#fff3cd"><td><strong>Country</strong></td><td>${user.bankDetails?.country || "N/A"}</td></tr>
        </table>
        <p style="color:red"><strong>ACTION REQUIRED:</strong> Please transfer A$${payoutAud} manually to the Australian bank account above.</p>
      `,
    });
  } catch (emailErr) {
    console.error("Admin notification email failed:", emailErr.message);
  }
}

// Re-run a pending bank cashout's Stripe payout (used by the admin retry endpoint).
// Returns the executeBankPayout result. Does not re-debit HB (already debited).
export async function retryBankPayout(ledgerEntry, reqIp) {
  const user = await User.findById(ledgerEntry.userId);
  if (!user) throw new Error("User not found for this cashout");
  const usdAmount = ledgerEntry.cashoutUSD ?? Math.abs(ledgerEntry.amount) / HB_TO_USD;
  const payoutSpeed = ledgerEntry.cashoutSpeed || "standard";
  return executeBankPayout({
    user,
    ledgerEntry,
    amount: Math.abs(ledgerEntry.amount),
    usdAmount,
    payoutSpeed,
    reqIp,
  });
}

// ------------------ EARN HB ------------------
// POST /api/v1/hb/earn
// Body: { userId, amount, description, reference }
// Called by game server (no auth — internal)
export async function earnHB(req, res) {
  try {
    const { userId, amount, description, reference } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and a positive amount are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.hyperBucks = (user.hyperBucks || 0) + amount;
    await user.save();

    const ledgerEntry = await HBLedger.create({
      userId,
      type: "earn",
      amount,
      balanceAfter: user.hyperBucks,
      description: description || "HB earned",
      reference,
    });

    return res.status(200).json({
      success: true,
      newBalance: user.hyperBucks,
      ledgerEntry,
    });
  } catch (error) {
    console.error("earnHB error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ SPEND HB ------------------
// POST /api/v1/hb/spend
// Body: { userId, amount, description, reference }
// Called by marketplace (no auth — internal)
export async function spendHB(req, res) {
  try {
    const { userId, amount, description, reference } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and a positive amount are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentBalance = user.hyperBucks || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        error: "Insufficient HB balance",
        balance: currentBalance,
        required: amount,
      });
    }

    user.hyperBucks = currentBalance - amount;
    await user.save();

    const ledgerEntry = await HBLedger.create({
      userId,
      type: "spend",
      amount: -amount, // negative = debit
      balanceAfter: user.hyperBucks,
      description: description || "HB spent",
      reference,
    });

    return res.status(200).json({
      success: true,
      newBalance: user.hyperBucks,
      ledgerEntry,
    });
  } catch (error) {
    console.error("spendHB error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ CASHOUT OTP ------------------
// POST /api/v1/hb/cashout/otp
// Auth required. Sends a 6-digit OTP to user's email to authorize cashout.
export async function requestCashoutOTP(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const email = user.Email || user.email;
    if (!email) return res.status(400).json({ error: "No email address on account" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Hash before storing
    const { createHash } = await import("crypto");
    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    user.cashoutOtp = { code: hashedOtp, expiresAt };
    await user.save();

    await transporter.sendMail({
      from: `"HyperTek" <${process.env.SMTP_EMAIL}>`,
      to: process.env.DEV_EMAIL_OVERRIDE || email,
      subject: "HyperTek Cashout Verification Code",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#fff;padding:32px;border-radius:12px">
          <h2 style="color:#fff;margin-bottom:8px">Cashout Verification</h2>
          <p style="color:#aaa;margin-bottom:24px">Use the code below to confirm your Hyper Bucks cashout. This code expires in <strong>5 minutes</strong>.</p>
          <div style="background:#1a1a2e;border:1px solid #002AA8;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <p style="color:#aaa;font-size:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:2px">Your OTP Code</p>
            <p style="color:#fff;font-size:36px;font-weight:700;letter-spacing:8px;margin:0">${otp}</p>
          </div>
          <p style="color:#555;font-size:12px">If you did not request this, please secure your account immediately.</p>
          <p style="color:#555;font-size:12px;margin-top:16px">HyperTek — Building Worlds, One Game at a Time</p>
        </div>`,
    });

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("requestCashoutOTP error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ CASHOUT HB ------------------
// POST /api/v1/hb/cashout
// Auth required. Body: { amount (in HB), method ("usdc"|"bank"), walletAddress?, payoutSpeed? ("standard"|"instant") }
//
// USDC method: on-chain USDC transfer from backend wallet → user's walletAddress
// Bank method (standard): Stripe Connect payout, 1-3 business days, $0.25 flat fee (absorbed by Stripe)
// Bank method (instant): Stripe Connect instant payout, minutes, 1.5% fee deducted by Stripe automatically
export async function cashoutHB(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { amount, method, walletAddress, otp, payoutSpeed = "standard" } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    if (!["usdc", "bank"].includes(method)) {
      return res.status(400).json({ error: 'Method must be "usdc" or "bank"' });
    }

    if (method === "bank" && !["standard", "instant"].includes(payoutSpeed)) {
      return res.status(400).json({ error: 'payoutSpeed must be "standard" or "instant"' });
    }

    if (!otp) {
      return res.status(400).json({ error: "OTP is required to authorize cashout" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate OTP
    const { createHash } = await import("crypto");
    const hashedInput = createHash("sha256").update(otp.toString()).digest("hex");

    if (!user.cashoutOtp?.code || user.cashoutOtp.code !== hashedInput) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }
    if (new Date() > new Date(user.cashoutOtp.expiresAt)) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // KYC required before cashout
    if (user.kyc?.status !== "verified") {
      return res.status(403).json({
        error: "Identity verification required before cashout",
        kycStatus: user.kyc?.status || "not_started",
      });
    }

    const currentBalance = user.hyperBucks || 0;

    // Validate balance
    if (currentBalance < amount) {
      return res.status(400).json({
        error: "Insufficient HB balance",
        balance: currentBalance,
        required: amount,
      });
    }

    // Validate minimums
    if (method === "usdc") {
      if (amount < MIN_USDC_CASHOUT_HB) {
        return res.status(400).json({
          error: `Minimum USDC cashout is ${MIN_USDC_CASHOUT_HB} HB ($${MIN_USDC_CASHOUT_HB / HB_TO_USD})`,
        });
      }
      if (!walletAddress) {
        return res.status(400).json({ error: "walletAddress required for USDC cashout" });
      }
    }

    if (method === "bank") {
      if (amount < MIN_BANK_CASHOUT_HB) {
        return res.status(400).json({
          error: `Minimum bank cashout is ${MIN_BANK_CASHOUT_HB} HB ($${MIN_BANK_CASHOUT_HB / HB_TO_USD})`,
        });
      }
      if (payoutSpeed === "instant") {
        if (!user.debitCard?.stripeCardId) {
          return res.status(400).json({
            error: "A debit card is required for instant payouts. Please add your debit card first.",
          });
        }
        // AU-only: instant payouts must go to an Australian debit card.
        const cardCountry = (user.debitCard?.country || "").toUpperCase();
        if (cardCountry && cardCountry !== "AU") {
          return res.status(400).json({ error: AU_ONLY_BANK_MSG });
        }
      }
      if (payoutSpeed === "standard") {
        if (!user.bankDetails?.accountNumber || !user.bankDetails?.routingNumber) {
          return res.status(400).json({
            error: "Australian bank details (BSB + account number) are required. Please add your bank details first.",
          });
        }
        // AU-only: standard bank payouts must go to an Australian (AUD) bank account.
        const bankCountry = (user.bankDetails?.country || "").toUpperCase();
        if (bankCountry !== "AU") {
          return res.status(400).json({ error: AU_ONLY_BANK_MSG });
        }
      }
    }

    // All validations passed — clear OTP (single use)
    user.cashoutOtp = { code: null, expiresAt: null };
    await user.save();

    const usdAmount = parseFloat((amount / HB_TO_USD).toFixed(2));

    // Debit HB from user
    user.hyperBucks = currentBalance - amount;
    await user.save();

    // Create pending ledger entry
    const ledgerEntry = await HBLedger.create({
      userId,
      type: "cashout",
      amount: -amount,
      balanceAfter: user.hyperBucks,
      description: `HB cashout via ${method.toUpperCase()}`,
      cashoutMethod: method,
      cashoutSpeed: method === "bank" ? payoutSpeed : undefined,
      cashoutStatus: "pending",
      cashoutUSD: usdAmount,
    });

    let cashoutResult = { status: "pending", detail: null };

    // ── USDC: on-chain transfer ──────────────────────────────────────────────
    if (method === "usdc") {
      try {
        const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
        const privateKey = process.env.PRIVATE_KEY;
        const usdcAddr = process.env.BASE_USDC_ADDRESS;

        if (!privateKey || !usdcAddr) throw new Error("PRIVATE_KEY or BASE_USDC_ADDRESS not configured");

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(privateKey, provider);
        const usdc = new ethers.Contract(usdcAddr, ERC20_ABI, signer);
        const amountUnits = ethers.parseUnits(usdAmount.toFixed(6), 6);

        const balance = await usdc.balanceOf(await signer.getAddress());
        if (balance < amountUnits) {
          throw new Error(
            `Backend wallet USDC insufficient. Has: ${ethers.formatUnits(balance, 6)} USDC, needs: ${usdAmount}`
          );
        }

        const tx = await usdc.transfer(walletAddress, amountUnits);
        await tx.wait();

        await HBLedger.findByIdAndUpdate(ledgerEntry._id, {
          cashoutStatus: "completed",
          cashoutTxHash: tx.hash,
        });

        cashoutResult = { status: "completed", txHash: tx.hash };
        console.log(`[HB Cashout] USDC sent: $${usdAmount} → ${walletAddress} | tx: ${tx.hash}`);
      } catch (usdcErr) {
        console.error(" [HB Cashout] USDC on-chain transfer failed:", usdcErr.message);

        const isInsufficientBalance = usdcErr.message.includes("insufficient");

        if (isInsufficientBalance) {
          // Platform wallet low — keep HB deducted, mark pending, notify admin
          await HBLedger.findByIdAndUpdate(ledgerEntry._id, {
            cashoutStatus: "pending",
            cashoutTxHash: `pending_admin: ${usdcErr.message}`,
          });
          cashoutResult = { status: "pending", error: usdcErr.message };

          // Notify admin
          const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
          if (adminEmail) {
            transporter.sendMail({
              from: `"HyperTek" <${process.env.SMTP_EMAIL}>`,
              to: adminEmail,
              subject: `[ACTION REQUIRED] HB USDC Cashout Pending — $${usdAmount} USD`,
              html: `
                <h2>Platform Wallet Insufficient — Manual USDC Transfer Required</h2>
                <table border="1" cellpadding="6" cellspacing="0">
                  <tr><td><strong>User ID</strong></td><td>${userId}</td></tr>
                  <tr><td><strong>Wallet</strong></td><td>${walletAddress}</td></tr>
                  <tr><td><strong>HB Amount</strong></td><td>${amount} HB</td></tr>
                  <tr><td><strong>USDC Amount</strong></td><td>$${usdAmount}</td></tr>
                  <tr><td><strong>Ledger ID</strong></td><td>${ledgerEntry._id}</td></tr>
                  <tr><td><strong>Error</strong></td><td>${usdcErr.message}</td></tr>
                </table>
                <p style="color:red"><strong>ACTION REQUIRED:</strong> Platform wallet has insufficient USDC. Please top up the wallet and send $${usdAmount} USDC manually to ${walletAddress}, then update the ledger entry to "completed".</p>
              `,
            }).catch(() => {});
          }
        } else {
          // Other error — restore HB to user, mark failed
          user.hyperBucks = (user.hyperBucks || 0) + amount;
          await user.save();
          await HBLedger.findByIdAndUpdate(ledgerEntry._id, {
            cashoutStatus: "failed",
            cashoutTxHash: `error: ${usdcErr.message}`,
          });
          cashoutResult = { status: "failed", error: usdcErr.message };
        }
      }
    }

    // ── Bank: Stripe Connect (AU-only, AUD) — shared with the admin retry endpoint ──
    if (method === "bank") {
      cashoutResult = await executeBankPayout({ user, ledgerEntry, amount, usdAmount, payoutSpeed, reqIp: req.ip });
    }

    const finalStatus = cashoutResult.status;
    // For bank cashouts the user is paid in AUD (cashoutResult.payoutAud); USDC stays USD.
    const audStr = cashoutResult.payoutAud != null ? `A$${cashoutResult.payoutAud}` : `$${usdAmount}`;
    const messageMap = {
      completed: method === "bank"
        ? `${amount} HB (${audStr}) bank transfer completed successfully.`
        : `${amount} HB ($${usdAmount}) sent as USDC to your wallet successfully.`,
      processing: method === "bank"
        ? `${amount} HB (${audStr}) bank transfer initiated. ${cashoutResult.isInstant ? "Funds typically arrive within minutes." : "Funds will arrive in 1-3 business days."}`
        : `${amount} HB ($${usdAmount}) USDC transfer is being processed on-chain.`,
      pending: method === "bank"
        ? `${amount} HB (${audStr}) cashout request received. Admin will process the bank transfer to your account shortly.`
        : `${amount} HB ($${usdAmount}) USDC cashout is queued — platform wallet is being topped up. Admin will send the funds to your wallet shortly.`,
      failed: method === "bank"
        ? `Bank transfer of ${amount} HB (${audStr}) failed. Your HB balance has been restored. Please try again or contact support.`
        : `USDC cashout of ${amount} HB failed. Your HB balance has been restored. Please try again or contact support.`,
    };

    return res.status(200).json({
      success: finalStatus !== "failed",
      ledgerEntry,
      usdAmount,
      audAmount: cashoutResult.payoutAud ?? null,
      fxRate: cashoutResult.fxRate ?? null,
      newBalance: user.hyperBucks,
      cashoutStatus: finalStatus,
      cashoutTxHash: cashoutResult.txHash || cashoutResult.stripePayoutId || null,
      message: messageMap[finalStatus] || "Cashout submitted.",
    });
  } catch (error) {
    console.error("cashoutHB error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ GET HB BALANCE ------------------
// GET /api/v1/hb/balance
// Auth required.
// ------------------ GET USD→AUD FX RATE ------------------
// GET /api/v1/hb/fx-rate
// Used by the cashout UI to preview the AUD a bank cashout will pay.
export async function getFxRate(req, res) {
  try {
    const { rate } = await convertUsdToAud(1);
    return res.json({ usdToAud: rate, instantFeeRate: INSTANT_FEE_RATE_AU });
  } catch (error) {
    console.error("getFxRate error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getHBBalance(req, res) {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select("hyperBucks");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hyperBucks = user.hyperBucks || 0;
    const usdEquivalent = parseFloat((hyperBucks / HB_TO_USD).toFixed(2));

    return res.status(200).json({
      success: true,
      hyperBucks,
      usdEquivalent,
    });
  } catch (error) {
    console.error("getHBBalance error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ GET HB HISTORY ------------------
// GET /api/v1/hb/history
// Auth required. Query params: page, limit
export async function getHBHistory(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      HBLedger.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HBLedger.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getHBHistory error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ GET BANK DETAILS ------------------
// GET /api/v1/hb/bank-details
// Auth required.
export async function getBankDetails(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select("bankDetails").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ success: true, bankDetails: user.bankDetails || null });
  } catch (error) {
    console.error("getBankDetails error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ SAVE BANK DETAILS ------------------
// PUT /api/v1/hb/bank-details
// Auth required. Body: { accountHolderName, bankName, accountNumber, iban, swift, routingNumber, country, currency }
export async function saveBankDetails(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const {
      accountHolderName,
      bankName,
      accountNumber,
      iban,
      swift,
      routingNumber,
      country,
      currency,
    } = req.body;

    if (!accountHolderName || !bankName || !accountNumber || !routingNumber) {
      return res.status(400).json({
        error: "accountHolderName, bankName, accountNumber and BSB (routingNumber) are required",
      });
    }

    // Bank cashout is AU-only (platform is an AU Stripe account; no cross-border payouts).
    if ((country || "").toUpperCase() !== "AU") {
      return res.status(400).json({ error: AU_ONLY_BANK_MSG });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.bankDetails = {
      accountHolderName,
      bankName,
      accountNumber,
      iban: iban || "",
      swift: swift || "",
      routingNumber: routingNumber || "", // AU BSB
      country: "AU",
      currency: "AUD",
      // Auto-verify when Connect not enabled — admin handles payout manually via email
      verified: process.env.STRIPE_CONNECT_ENABLED !== "true",
    };

    await user.save();

    // If Stripe Connect is enabled, create connected account and attach bank immediately
    let connectMessage = "Bank details saved. Verification is pending.";
    if (process.env.STRIPE_CONNECT_ENABLED === "true") {
      try {
        const stripe = getStripe();
        const connectAccountId = await getOrCreateUserConnectedAccount(user, stripe, req.ip);
        await attachUserBankAccount(user, stripe, connectAccountId);
        user.bankDetails.verified = true;
        await user.save();
        connectMessage = "Bank details saved and verified via Stripe Connect.";
        console.log(`[BankDetails] Connected account ${connectAccountId} ready for user ${userId}`);
      } catch (connectErr) {
        console.error("[BankDetails] Stripe Connect setup failed:", connectErr.message);
        connectMessage = "Bank details saved. Stripe verification pending — admin will verify manually.";
      }
    }

    return res.status(200).json({
      success: true,
      message: connectMessage,
      bankDetails: user.bankDetails,
    });
  } catch (error) {
    console.error("saveBankDetails error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ DEBIT CARD (for instant payouts) ------------------
// GET /api/v1/hb/debit-card
export async function getDebitCard(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select("debitCard");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ debitCard: user.debitCard || null });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/v1/hb/debit-card
// Body: { cardToken } — Stripe card token created on frontend via Stripe.js
export async function saveDebitCard(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { cardToken } = req.body;

    if (!cardToken) {
      return res.status(400).json({ error: "cardToken is required (create via Stripe.js on frontend)" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const stripe = getStripe();

    // Retrieve token details to get card metadata
    const token = await stripe.tokens.retrieve(cardToken);
    const card = token.card;

    if (!card) return res.status(400).json({ error: "Invalid card token" });

    // Instant payouts are AU-only — reject non-Australian debit cards up front.
    if ((card.country || "").toUpperCase() !== "AU") {
      return res.status(400).json({
        error: "Instant payouts require an Australian debit card. Please use USDC cashout instead.",
      });
    }

    // Store token id — will be attached to connected account at cashout time
    user.debitCard = {
      cardHolderName: card.name || "",
      last4: card.last4,
      brand: card.brand,
      stripeCardId: cardToken, // token id used to attach to connected account
      country: card.country,
      currency: (card.currency || "usd").toUpperCase(),
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Debit card saved successfully.",
      debitCard: {
        cardHolderName: user.debitCard.cardHolderName,
        last4: user.debitCard.last4,
        brand: user.debitCard.brand,
        country: user.debitCard.country,
        currency: user.debitCard.currency,
      },
    });
  } catch (error) {
    console.error("saveDebitCard error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ TOPUP VIA USDC (on-chain) ------------------
// POST /api/v1/hb/topup/usdc
// Auth required. Body: { txHash, usdcAmount }
// User sends USDC to platform wallet, submits tx hash. Backend verifies on-chain and credits HB.
export async function topupViaUSDC(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { txHash, usdcAmount } = req.body;

    if (!txHash || !usdcAmount || usdcAmount <= 0) {
      return res.status(400).json({ error: "txHash and usdcAmount are required" });
    }

    // Prevent duplicate credit
    const existing = await HBLedger.findOne({ reference: txHash });
    if (existing) {
      return res.status(400).json({ error: "This transaction has already been credited" });
    }

    const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
    const usdcAddr = process.env.BASE_USDC_ADDRESS;
    const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;

    if (!usdcAddr || !platformWallet) {
      return res.status(500).json({ error: "Platform wallet not configured" });
    }

    // Verify tx on-chain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt || receipt.status !== 1) {
      return res.status(400).json({ error: "Transaction not found or failed on-chain" });
    }

    // Parse USDC Transfer event from receipt
    const usdcInterface = new ethers.Interface([
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]);

    let verifiedAmount = 0;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== usdcAddr.toLowerCase()) continue;
      try {
        const parsed = usdcInterface.parseLog(log);
        if (parsed.name === "Transfer" && parsed.args.to.toLowerCase() === platformWallet.toLowerCase()) {
          verifiedAmount = parseFloat(ethers.formatUnits(parsed.args.value, 6));
          break;
        }
      } catch {}
    }

    if (verifiedAmount <= 0) {
      return res.status(400).json({ error: "No USDC transfer to platform wallet found in this transaction" });
    }

    if (Math.abs(verifiedAmount - usdcAmount) > 0.01) {
      return res.status(400).json({
        error: `Amount mismatch. On-chain: $${verifiedAmount} USDC, claimed: $${usdcAmount} USDC`,
      });
    }

    const hbAmount = Math.floor(verifiedAmount * HB_TO_USD);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.hyperBucks = (user.hyperBucks || 0) + hbAmount;
    await user.save();

    const ledgerEntry = await HBLedger.create({
      userId,
      type: "earn",
      amount: hbAmount,
      balanceAfter: user.hyperBucks,
      description: `USDC Top-up: $${verifiedAmount} USDC → ${hbAmount} HB`,
      reference: txHash,
    });

    console.log(`[USDC TopUp] ${hbAmount} HB credited to ${userId} | tx: ${txHash}`);
    return res.status(200).json({ success: true, hbAmount, newBalance: user.hyperBucks, ledgerEntry });
  } catch (error) {
    console.error("topupViaUSDC error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ CREATE HB TOP-UP PAYMENT INTENT ------------------
// POST /api/v1/hb/topup/intent
// Body: { hbAmount } — must be multiple of 250, minimum 250
export async function createHBTopupIntent(req, res) {
  try {
    const userId = req.user.id || req.user._id.toString();
    const { hbAmount } = req.body;

    if (!hbAmount || hbAmount < MIN_TOPUP_HB || hbAmount % 250 !== 0) {
      return res.status(400).json({ error: "Minimum top-up is 250 HB ($1) and must be a multiple of 250" });
    }

    const usdAmount = hbAmount / HB_TO_USD;
    const stripeAmountCents = Math.round(usdAmount * 100);

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmountCents,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        userId,
        itemType: "hyperbucks",
        hbAmount: hbAmount.toString(),
        productId: userId,
        gameTitle: "Hyper Bucks Top-Up",
        provider: "stripe",
        transactionId: "",
      },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("createHBTopupIntent error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ ADMIN: HB PLATFORM STATS ------------------
// GET /api/v1/hb/admin/stats
// Admin only. Returns total HB in circulation, USD liability, and platform balance info.
export async function getHBPlatformStats(req, res) {
  try {
    const result = await User.aggregate([
      { $group: { _id: null, totalHB: { $sum: "$hyperBucks" }, userCount: { $sum: 1 } } },
    ]);

    const totalHB = result[0]?.totalHB || 0;
    const totalUsers = result[0]?.userCount || 0;
    const totalUSDLiability = parseFloat((totalHB / HB_TO_USD).toFixed(2));

    const pendingCashouts = await HBLedger.aggregate([
      { $match: { type: "cashout", cashoutStatus: "pending" } },
      { $group: { _id: null, totalHB: { $sum: { $abs: "$amount" } } } },
    ]);

    const pendingHB = pendingCashouts[0]?.totalHB || 0;
    const pendingUSD = parseFloat((pendingHB / HB_TO_USD).toFixed(2));

    return res.status(200).json({
      success: true,
      totalHBInCirculation: totalHB,
      totalUSDLiability,
      pendingCashoutsHB: pendingHB,
      pendingCashoutsUSD: pendingUSD,
      totalUsers,
      stripeConnectEnabled: process.env.STRIPE_CONNECT_ENABLED === "true",
      note: "Ensure your Stripe Balance is at least $" + totalUSDLiability + " USD to cover all outstanding Hyper Bucks.",
    });
  } catch (error) {
    console.error("getHBPlatformStats error:", error);
    return res.status(500).json({ error: error.message });
  }
}
