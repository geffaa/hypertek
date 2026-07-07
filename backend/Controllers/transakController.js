// Controllers/transakController.js
// Transak on/off-ramp orchestration. Transak only moves USDC to/from the USER's own wallet;
// HyperBucks crediting is handled by the existing on-chain-verified flows, not here.
//
// Surfaces:
//   BUY_USDC   BUY  — fiat → USDC to USER wallet (marketplace fund + HB top-up helper).
//                     User then buys an NFA or tops up HB via "USDC via Wallet" (both verify on-chain).
//   HB_CASHOUT SELL — HB debited + USDC sent to USER wallet here; user then off-ramps to bank via widget
import crypto from "crypto";
import { ethers } from "ethers";
import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";
import TransakOrder from "../Models/TransakOrder.js";
import transak from "../services/transakService.js";

const HB_TO_USD = 250;          // 250 HB = $1 USD (matches HBController peg)
const MIN_HB = 250;             // $1 minimum, in HB
const CRYPTO = "USDC";
// Transak network code. STAGING has no Base — it delivers USDC on Ethereum Sepolia ("ethereum",
// chainId 11155111). PRODUCTION uses Base. HB crediting is driven by the Transak order status
// (not on-chain), so the delivery chain doesn't affect crediting — only what the widget offers.
const NETWORK = transak.isStaging() ? "ethereum" : "base";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

const uid = () => crypto.randomUUID();

// Chain-aware platform USDC signer (testnet in staging, mainnet in prod).
function getUsdcSigner() {
  const chainId = parseInt(process.env.BASE_CHAIN_ID) || 84532;
  const rpc =
    chainId === 8453
      ? process.env.BASE_RPC_URL || "https://mainnet.base.org"
      : process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;
  const usdcAddr = process.env.BASE_USDC_ADDRESS;
  if (!privateKey || !usdcAddr) throw new Error("PRIVATE_KEY or BASE_USDC_ADDRESS not configured");
  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(privateKey, provider);
  const usdc = new ethers.Contract(usdcAddr, ERC20_ABI, signer);
  return { signer, usdc };
}

// ── POST /api/v1/transak/cashout/session ─────────────────────────────────────
// Gates OTP + KYC + balance, debits HB, sends USDC to the user's custodial wallet
// (this IS the cashout — irreversible once sent), then returns params to open the
// Transak SELL widget so the user can off-ramp that USDC to their bank.
export async function createCashoutSession(req, res) {
  try {
    if (!transak.isConfigured()) return res.status(503).json({ error: "Transak not configured" });
    const userId = req.user.id || req.user._id;
    const amount = Number(req.body?.amount); // in HB
    const otp = req.body?.otp;

    if (!Number.isFinite(amount) || amount < MIN_HB) {
      return res.status(400).json({ error: `Minimum cashout is ${MIN_HB} HB ($${MIN_HB / HB_TO_USD})` });
    }
    if (!otp) return res.status(400).json({ error: "OTP is required to authorize cashout" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // OTP (same scheme as HBController.cashoutHB)
    const hashedInput = crypto.createHash("sha256").update(otp.toString()).digest("hex");
    if (!user.cashoutOtp?.code || user.cashoutOtp.code !== hashedInput) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }
    if (new Date() > new Date(user.cashoutOtp.expiresAt)) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // KYC gate
    if (user.kyc?.status !== "verified") {
      return res.status(403).json({
        error: "Identity verification required before cashout",
        kycStatus: user.kyc?.status || "not_started",
      });
    }

    const walletAddress = user.WalletAddress || user.MetaMaskAddress;
    if (!walletAddress) return res.status(400).json({ error: "No wallet address on file for USDC delivery" });

    const currentBalance = user.hyperBucks || 0;
    if (currentBalance < amount) {
      return res.status(400).json({ error: "Insufficient HB balance", balance: currentBalance, required: amount });
    }

    // Consume OTP + debit HB
    user.cashoutOtp = { code: null, expiresAt: null };
    user.hyperBucks = currentBalance - amount;
    await user.save();

    const usdAmount = parseFloat((amount / HB_TO_USD).toFixed(2));
    const partnerOrderId = uid();

    const ledger = await HBLedger.create({
      userId,
      type: "cashout",
      amount: -amount,
      balanceAfter: user.hyperBucks,
      description: "HB cashout via Transak off-ramp",
      reference: partnerOrderId,
      cashoutMethod: "usdc", // on-chain USDC leg; off-ramp is a separate user step
      cashoutStatus: "pending",
      cashoutUSD: usdAmount,
    });

    const order = await TransakOrder.create({
      partnerOrderId,
      userId,
      purpose: "HB_CASHOUT",
      side: "SELL",
      walletAddress,
      cryptoCurrency: CRYPTO,
      network: NETWORK,
      expectedCryptoAmount: usdAmount,
      fiatAmount: usdAmount,
      fiatCurrency: "USD",
      hbAmount: amount,
      hbLedgerId: ledger._id,
      status: "INITIATED",
    });

    // Send USDC platform → user wallet. On failure, restore HB and fail the cashout.
    try {
      const { signer, usdc } = getUsdcSigner();
      const amountUnits = ethers.parseUnits(usdAmount.toFixed(6), 6);
      const balance = await usdc.balanceOf(await signer.getAddress());
      if (balance < amountUnits) {
        throw new Error(
          `Platform wallet USDC insufficient. Has ${ethers.formatUnits(balance, 6)}, needs ${usdAmount}`
        );
      }
      const tx = await usdc.transfer(walletAddress, amountUnits);
      await tx.wait();

      await HBLedger.findByIdAndUpdate(ledger._id, { cashoutStatus: "completed", cashoutTxHash: tx.hash });
      order.transactionHash = tx.hash;
      await order.save();

      const widgetUrl = await transak.createWidgetUrl({
        userIp: req.ip,
        widgetParams: {
          referrerDomain: req.body?.referrerDomain,
          productsAvailed: "SELL",
          walletAddress,
          cryptoCurrencyCode: CRYPTO,
          network: NETWORK,
          fiatCurrency: "USD",
          cryptoAmount: usdAmount,
          partnerOrderId,
          partnerCustomerId: String(userId),
          themeColor: "002AA8",
        },
      });

      return res.json({
        partnerOrderId,
        partnerCustomerId: String(userId),
        widgetUrl,
        walletAddress,
        cryptoAmount: usdAmount,
        side: "SELL",
        newBalance: user.hyperBucks,
        message: `${amount} HB ($${usdAmount}) sent as USDC to your wallet. Complete the Transak withdrawal to receive fiat in your bank.`,
      });
    } catch (chainErr) {
      console.error("createCashoutSession USDC transfer failed:", chainErr.message);
      // Restore HB (crypto never left) and mark failed.
      const fresh = await User.findById(userId);
      const restored = (fresh.hyperBucks || 0) + amount;
      await User.findByIdAndUpdate(userId, { $set: { hyperBucks: restored } });
      await HBLedger.findByIdAndUpdate(ledger._id, { cashoutStatus: "failed", cashoutTxHash: `error: ${chainErr.message}` });
      order.status = "FAILED";
      await order.save();
      return res.status(502).json({ error: "USDC transfer failed, HB balance restored", detail: chainErr.message });
    }
  } catch (err) {
    console.error("createCashoutSession error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/transak/fund/session ────────────────────────────────────────
// Buy USDC into the USER's OWN wallet. Used by the marketplace fund modal (to fund an
// on-chain NFA purchase) and by the HB top-up page (buy USDC, then top up HB via the
// existing "USDC via Wallet" flow). No HB is credited here — the user's on-chain USDC is
// the source of truth, and whatever they do next (buy NFA / USDC top-up) verifies on-chain.
export async function createFundSession(req, res) {
  try {
    if (!transak.isConfigured()) return res.status(503).json({ error: "Transak not configured" });
    const userId = req.user.id || req.user._id;
    const walletAddress = req.body?.walletAddress;
    const fiatAmount = Number(req.body?.fiatAmount) || undefined;
    if (!walletAddress) return res.status(400).json({ error: "walletAddress is required" });

    const partnerOrderId = uid();
    await TransakOrder.create({
      partnerOrderId,
      userId,
      purpose: "BUY_USDC",
      side: "BUY",
      walletAddress,
      cryptoCurrency: CRYPTO,
      network: NETWORK,
      fiatAmount,
      fiatCurrency: "USD",
      status: "INITIATED",
    });

    const widgetUrl = await transak.createWidgetUrl({
      userIp: req.ip,
      widgetParams: {
        referrerDomain: req.body?.referrerDomain,
        productsAvailed: "BUY",
        walletAddress,
        cryptoCurrencyCode: CRYPTO,
        network: NETWORK,
        fiatCurrency: "USD",
        defaultFiatAmount: fiatAmount,
        partnerOrderId,
        partnerCustomerId: String(userId),
        disableWalletAddressForm: true,
        themeColor: "002AA8",
      },
    });

    return res.json({ partnerOrderId, widgetUrl, walletAddress, side: "BUY" });
  } catch (err) {
    console.error("createFundSession error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// Advance a TransakOrder's status from a decoded Transak order/event, for audit/display only.
// No money moves here: BUY_USDC lands in the user's wallet (they spend it via on-chain-verified
// flows) and HB_CASHOUT already delivered USDC at session time. Idempotent.
async function applyTransakUpdate(record, { eventID, order }) {
  const newStatus =
    (order?.status && transak.mapStatus(order.status).internal) ||
    transak.statusFromEvent(eventID) ||
    record.status;

  if (order?.id && !record.transakOrderId) record.transakOrderId = order.id;
  if (order?.transactionHash && !record.transactionHash) record.transactionHash = order.transactionHash;
  record.rawLastEvent = { eventID: eventID || "reconcile", status: order?.status, at: new Date() };
  record.status = newStatus;
  await record.save();
  return record;
}

// ── GET /api/v1/transak/order/:partnerOrderId ────────────────────────────────
// Frontend polls this. If the order is not yet terminal we reconcile against Transak's
// Get-Order API (an outbound call — works even from localhost with no webhook). The client
// may pass ?transakOrderId= learned from the SDK success event to seed the lookup; we always
// re-verify server-side and require Transak to echo our partnerOrderId, so the client can't spoof.
export async function getOrderStatus(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    let record = await TransakOrder.findOne({ partnerOrderId: req.params.partnerOrderId });
    if (!record) return res.status(404).json({ error: "Order not found" });
    if (String(record.userId) !== userId) return res.status(403).json({ error: "Forbidden" });

    const isTerminal = ["COMPLETED", "FAILED", "REFUNDED", "EXPIRED"].includes(record.status);
    const transakOrderId = record.transakOrderId || req.query.transakOrderId;
    if (!isTerminal && transakOrderId && transak.isConfigured()) {
      try {
        const remote = await transak.getOrder(transakOrderId);
        // Guard against spoofing: the fetched order must belong to this partnerOrderId.
        if (remote && (!remote.partnerOrderId || remote.partnerOrderId === record.partnerOrderId)) {
          record = await applyTransakUpdate(record, { eventID: null, order: { ...remote, id: transakOrderId } });
        }
      } catch (e) {
        console.warn("Transak reconcile failed:", e.message);
      }
    }

    return res.json({
      partnerOrderId: record.partnerOrderId,
      purpose: record.purpose,
      status: record.status,
      hbAmount: record.hbAmount,
      transactionHash: record.transactionHash,
      updatedAt: record.updatedAt,
    });
  } catch (err) {
    console.error("getOrderStatus error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── POST /api/v1/transak/webhook (public; authenticity via signed JWT) ────────
// Verifies the JWT, resolves our TransakOrder by partnerOrderId, and records its status
// for audit/display. No crediting happens here (see applyTransakUpdate).
export async function handleWebhook(req, res) {
  let eventID, order;
  try {
    ({ eventID, order } = await transak.verifyWebhook(req.body));
  } catch (err) {
    console.error("Transak webhook verification failed:", err.message);
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  // Always 200 after this point so Transak doesn't storm retries on our logic errors.
  try {
    const partnerOrderId = order?.partnerOrderId;
    if (!partnerOrderId) {
      console.warn("Transak webhook without partnerOrderId; event:", eventID);
      return res.status(200).json({ received: true });
    }

    const record = await TransakOrder.findOne({ partnerOrderId });
    if (!record) {
      console.warn("Transak webhook for unknown partnerOrderId:", partnerOrderId);
      return res.status(200).json({ received: true });
    }

    // Audit/display only — no crediting (BUY_USDC lands in the user's wallet; HB_CASHOUT already sent USDC).
    await applyTransakUpdate(record, { eventID, order });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Transak webhook processing error:", err);
    return res.status(200).json({ received: true }); // ack anyway; reconciliation will catch up
  }
}

export default { createCashoutSession, createFundSession, getOrderStatus, handleWebhook };
