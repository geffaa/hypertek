import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";
import { ethers } from "ethers";
import Stripe from "stripe";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "./Config/.env" });

// Minimal ERC-20 ABI for USDC transfer
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

// HB conversion constant
const HB_TO_USD = 250; // 250 HB = $1 USD
const MIN_USDC_CASHOUT_HB = 250; // $1 minimum for USDC cashout
const MIN_BANK_CASHOUT_HB = 2500; // $10 minimum for bank cashout
const MIN_TOPUP_HB = 250; // $1 minimum top-up

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
      from: `"HyperTek" <${process.env.SMTP_USER || process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "HyperTek Cashout Verification Code",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#fff;padding:32px;border-radius:12px">
          <h2 style="color:#fff;margin-bottom:8px">Cashout Verification</h2>
          <p style="color:#aaa;margin-bottom:24px">Use the code below to confirm your HyperBucks cashout. This code expires in <strong>5 minutes</strong>.</p>
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
// Auth required. Body: { amount (in HB), method ("usdc"|"bank"), walletAddress? }
//
// USDC method: on-chain USDC transfer from backend wallet → user's walletAddress
//   Requires: PRIVATE_KEY wallet holds USDC on Base Mainnet.
//
// Bank method: Stripe payout from platform Stripe balance to platform bank,
//   then manual admin disbursement to user. Full user-direct bank transfer
//   requires Stripe Connect (future implementation).
export async function cashoutHB(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const { amount, method, walletAddress, otp } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    if (!["usdc", "bank"].includes(method)) {
      return res.status(400).json({ error: 'Method must be "usdc" or "bank"' });
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

    // Clear OTP immediately — single use
    user.cashoutOtp = { code: null, expiresAt: null };
    await user.save();

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
      if (!user.bankDetails?.verified) {
        return res.status(400).json({
          error: "Bank details not verified. Please add and verify your bank details first.",
        });
      }
    }

    const usdAmount = parseFloat((amount / HB_TO_USD).toFixed(2));

    // Debit HB from user
    user.hyperBucks = currentBalance - amount;
    await user.save();

    // Create pending ledger entry
    const ledgerEntry = await HBLedger.create({
      userId,
      type:          "cashout",
      amount:        -amount,
      balanceAfter:  user.hyperBucks,
      description:   `HB cashout via ${method.toUpperCase()}`,
      cashoutMethod: method,
      cashoutStatus: "pending",
      cashoutUSD:    usdAmount,
    });

    let cashoutResult = { status: "pending", detail: null };

    // ── USDC: on-chain transfer ──────────────────────────────────────────────
    if (method === "usdc") {
      try {
        const rpcUrl     = process.env.BASE_RPC_URL || "https://mainnet.base.org";
        const privateKey = process.env.PRIVATE_KEY;
        const usdcAddr   = process.env.BASE_USDC_ADDRESS;

        if (!privateKey || !usdcAddr) throw new Error("PRIVATE_KEY or BASE_USDC_ADDRESS not configured");

        const provider    = new ethers.JsonRpcProvider(rpcUrl);
        const signer      = new ethers.Wallet(privateKey, provider);
        const usdc        = new ethers.Contract(usdcAddr, ERC20_ABI, signer);
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
        console.log(`✅ [HB Cashout] USDC sent: $${usdAmount} → ${walletAddress} | tx: ${tx.hash}`);
      } catch (usdcErr) {
        console.error("❌ [HB Cashout] USDC on-chain transfer failed:", usdcErr.message);
        await HBLedger.findByIdAndUpdate(ledgerEntry._id, {
          cashoutStatus: "failed",
          cashoutTxHash: `error: ${usdcErr.message}`,
        });
        cashoutResult = { status: "failed", error: usdcErr.message };
      }
    }

    // ── Bank: Stripe payout attempt + admin email ────────────────────────────
    if (method === "bank") {
      let stripePayoutId = null;
      try {
        // stripe.payouts.create() sends from Stripe platform balance → platform bank account.
        // Admin then manually transfers to the user.
        // Full user-direct payout requires Stripe Connect (see docs/remaining-implementation.md).
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

        const stripePayout = await stripe.payouts.create({
          amount:                Math.round(usdAmount * 100), // cents
          currency:              "usd",
          statement_descriptor:  "HYPERTEK HB",
          metadata: {
            userId:      String(userId),
            hbAmount:    String(amount),
            ledgerId:    String(ledgerEntry._id),
            userBank:    user.bankDetails?.bankName || "",
            userAccount: user.bankDetails?.accountHolderName || "",
          },
        });

        stripePayoutId = stripePayout.id;
        await HBLedger.findByIdAndUpdate(ledgerEntry._id, {
          cashoutStatus: "processing",
          cashoutTxHash: stripePayout.id,
        });

        cashoutResult = { status: "processing", stripePayoutId };
        console.log(`✅ [HB Cashout] Stripe payout created: ${stripePayout.id} — $${usdAmount}`);
      } catch (stripeErr) {
        console.warn("⚠️ [HB Cashout] Stripe payout failed:", stripeErr.message);
        // Keep as "pending" — admin processes manually
        cashoutResult = { status: "pending", error: stripeErr.message };
      }

      // Always send admin email for bank cashouts with full bank details
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.SMTP_EMAIL;
      if (adminEmail) {
        try {
          await transporter.sendMail({
            from:    process.env.SMTP_USER || process.env.SMTP_EMAIL,
            to:      adminEmail,
            subject: `[HyperTek] HB Bank Cashout — $${usdAmount} USD — ${cashoutResult.status.toUpperCase()}`,
            html: `
              <h2>Hyper Bucks Bank Cashout ${cashoutResult.status === "processing" ? "✅ Stripe Payout Created" : "⏳ Pending Manual Processing"}</h2>
              <table border="1" cellpadding="6" cellspacing="0">
                <tr><td><strong>User ID</strong></td><td>${userId}</td></tr>
                <tr><td><strong>User Email</strong></td><td>${user.Email || user.email || "N/A"}</td></tr>
                <tr><td><strong>HB Amount</strong></td><td>${amount} HB</td></tr>
                <tr><td><strong>USD Amount</strong></td><td>$${usdAmount}</td></tr>
                <tr><td><strong>Ledger Entry ID</strong></td><td>${ledgerEntry._id}</td></tr>
                <tr><td><strong>Stripe Payout ID</strong></td><td>${stripePayoutId || "N/A — manual processing required"}</td></tr>
                <tr><td><strong>Status</strong></td><td>${cashoutResult.status}</td></tr>
                <tr style="background:#fff3cd"><td><strong>Account Holder</strong></td><td>${user.bankDetails?.accountHolderName || "N/A"}</td></tr>
                <tr style="background:#fff3cd"><td><strong>Bank Name</strong></td><td>${user.bankDetails?.bankName || "N/A"}</td></tr>
                <tr style="background:#fff3cd"><td><strong>Account Number</strong></td><td>${user.bankDetails?.accountNumber || "N/A"}</td></tr>
                <tr style="background:#fff3cd"><td><strong>IBAN</strong></td><td>${user.bankDetails?.iban || "N/A"}</td></tr>
                <tr style="background:#fff3cd"><td><strong>SWIFT/BIC</strong></td><td>${user.bankDetails?.swift || "N/A"}</td></tr>
                <tr style="background:#fff3cd"><td><strong>Routing Number</strong></td><td>${user.bankDetails?.routingNumber || "N/A"}</td></tr>
                <tr style="background:#fff3cd"><td><strong>Country</strong></td><td>${user.bankDetails?.country || "N/A"}</td></tr>
                <tr style="background:#fff3cd"><td><strong>Currency</strong></td><td>${user.bankDetails?.currency || "USD"}</td></tr>
              </table>
              ${cashoutResult.status === "pending" ? '<p style="color:red"><strong>ACTION REQUIRED:</strong> Stripe payout failed — please process this transfer manually via your banking system or Wise.</p>' : ''}
              <p style="color:#888;font-size:12px">For full automated user payouts, implement Stripe Connect (see backend/docs/remaining-implementation.md).</p>
            `,
          });
        } catch (emailErr) {
          console.error("Admin notification email failed:", emailErr.message);
        }
      }
    }

    const finalStatus = cashoutResult.status;
    const messageMap = {
      completed:  `${amount} HB ($${usdAmount}) sent as USDC on-chain successfully.`,
      processing: `${amount} HB ($${usdAmount}) bank payout initiated via Stripe. Admin will process transfer to your account.`,
      pending:    `${amount} HB ($${usdAmount}) cashout request submitted. Admin will process manually.`,
      failed:     `Cashout of ${amount} HB failed: ${cashoutResult.error}. Please contact support — your HB may not have been deducted.`,
    };

    return res.status(200).json({
      success: finalStatus !== "failed",
      ledgerEntry,
      usdAmount,
      newBalance:     user.hyperBucks,
      cashoutStatus:  finalStatus,
      cashoutTxHash:  cashoutResult.txHash || cashoutResult.stripePayoutId || null,
      message:        messageMap[finalStatus] || "Cashout submitted.",
    });
  } catch (error) {
    console.error("cashoutHB error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ GET HB BALANCE ------------------
// GET /api/v1/hb/balance
// Auth required.
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

// ------------------ SAVE BANK DETAILS ------------------
// PUT /api/v1/hb/bank-details
// Auth required. Body: { accountHolderName, bankName, accountNumber, iban, swift, routingNumber, country, currency }
// NOTE: $0 test deposit verification is Phase 2. For now: save details and set verified: false (admin verifies manually).
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

    if (!accountHolderName || !bankName || !accountNumber) {
      return res.status(400).json({
        error: "accountHolderName, bankName, and accountNumber are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        bankDetails: {
          accountHolderName,
          bankName,
          accountNumber,
          iban: iban || "",
          swift: swift || "",
          routingNumber: routingNumber || "",
          country: country || "",
          currency: currency || "USD",
          verified: false, // Phase 2: $0 test deposit verification
        },
      },
      { new: true, select: "bankDetails" }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Bank details saved. Verification is pending (admin will verify manually).",
      bankDetails: user.bankDetails,
    });
  } catch (error) {
    console.error("saveBankDetails error:", error);
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

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmountCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId,
        itemType: "hyperbucks",
        hbAmount: hbAmount.toString(),
        productId: userId,
        gameTitle: "HyperBucks Top-Up",
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
