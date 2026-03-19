/**
 * RoyaltyService.js
 * Records and dispatches royalty payments to artists/creators after each sale.
 *
 * Current behaviour:
 *   - Creates a RoyaltyPayout record (status: "pending")
 *   - Crypto dispatch: queued — requires platform wallet private key (Phase 2)
 *   - Bank dispatch: marked pending for admin to process via Wise
 *
 * Phase 2: once platform wallet key is available, add USDC transfer here.
 */

import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../Config/.env") });

// ── Payout model ──────────────────────────────────────────────────────────────
const royaltyPayoutSchema = new mongoose.Schema(
  {
    subCollectionId: String,
    parentId:        String,
    saleRecordId:    String,
    creatorWallet:   String,
    amount:          { type: Number, required: true },
    currency:        { type: String, default: "USDC" },
    // "crypto" = send USDC to wallet | "bank" = manual Wise transfer
    paymentType:     { type: String, enum: ["crypto", "bank"], default: "crypto" },
    status:          { type: String, enum: ["pending", "dispatched", "failed"], default: "pending" },
    txHash:          String,
    note:            String,
  },
  { timestamps: true },
);

export const RoyaltyPayout =
  mongoose.models.RoyaltyPayout ||
  mongoose.model("RoyaltyPayout", royaltyPayoutSchema);

// ── SMTP transporter ──────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER  || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

async function notifyAdmin(payout) {
  try {
    await transporter.sendMail({
      from:    `"HyperTek" <${process.env.SMTP_EMAIL}>`,
      to:      process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
      subject: `[HyperTek] Royalty Payout Pending — ${payout.amount} USDC`,
      html: `
        <h2>Royalty Payout Queued</h2>
        <table>
          <tr><td><b>Amount</b></td><td>${payout.amount} USDC</td></tr>
          <tr><td><b>Creator Wallet</b></td><td>${payout.creatorWallet || "—"}</td></tr>
          <tr><td><b>Payment Type</b></td><td>${payout.paymentType}</td></tr>
          <tr><td><b>NFT ID</b></td><td>${payout.subCollectionId}</td></tr>
          <tr><td><b>Status</b></td><td>${payout.status}</td></tr>
        </table>
        <p>Log into the admin panel to process this payout.</p>
      `,
    });
  } catch (err) {
    console.warn("⚠️ [RoyaltyService] Admin notification email failed:", err.message);
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * dispatchRoyalty — call after every completed sale.
 *
 * @param {object} opts
 * @param {string} opts.subCollectionId
 * @param {string} opts.parentId
 * @param {string} opts.creatorWallet   — wallet address or "admin"
 * @param {number} opts.amount          — USDC amount (human-readable, e.g. 4.00)
 * @param {string} [opts.saleRecordId]
 * @param {string} [opts.paymentType]   — "crypto" | "bank" (default: "crypto")
 */
export async function dispatchRoyalty({
  subCollectionId,
  parentId,
  creatorWallet,
  amount,
  saleRecordId,
  paymentType = "crypto",
}) {
  if (!amount || amount <= 0) return null;

  // Record the payout
  const payout = await RoyaltyPayout.create({
    subCollectionId,
    parentId,
    saleRecordId,
    creatorWallet,
    amount:      parseFloat(amount.toFixed(6)),
    currency:    "USDC",
    paymentType,
    status:      "pending",
  });

  console.log(
    `💰 [RoyaltyService] Payout queued: ${amount} USDC → ${creatorWallet} (ID: ${payout._id})`
  );

  // ── Phase 2 placeholder: auto-dispatch USDC on-chain ──────────────────────
  // When platform wallet private key is available:
  //   const { ethers } = await import("../Service/blockchain.js");
  //   const provider   = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  //   const signer     = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);
  //   const usdc       = new ethers.Contract(process.env.BASE_USDC_ADDRESS, ERC20_ABI, signer);
  //   const tx         = await usdc.transfer(creatorWallet, ethers.parseUnits(amount.toString(), 6));
  //   await tx.wait();
  //   await RoyaltyPayout.findByIdAndUpdate(payout._id, { status: "dispatched", txHash: tx.hash });
  // ──────────────────────────────────────────────────────────────────────────

  // Notify admin to process manually until Phase 2
  await notifyAdmin(payout);

  return payout;
}
