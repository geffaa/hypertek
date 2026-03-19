/**
 * RoyaltyService.js
 * Records and dispatches royalty payments to artists/creators after each sale.
 *
 * Behaviour:
 *   - Creates a RoyaltyPayout record
 *   - Crypto dispatch: sends USDC on-chain from backend wallet → creator wallet
 *     Requires: PRIVATE_KEY wallet holds USDC on Base Mainnet.
 *     Fund it with USDC from platform revenue (0xb0EB...) periodically.
 *   - Bank dispatch: marked pending — admin processes via email notification
 *   - Falls back gracefully: on-chain tx failure → status "failed", admin notified
 */

import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Minimal ERC-20 ABI — only transfer + balanceOf needed
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

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

  // ── Auto-dispatch USDC on-chain (crypto payouts) ────────────────────────────
  // Requires: process.env.PRIVATE_KEY wallet holds USDC on Base Mainnet.
  // Fund the backend wallet with USDC from platform revenue periodically.
  if (paymentType === "crypto" && creatorWallet && creatorWallet !== "admin") {
    try {
      const rpcUrl     = process.env.BASE_RPC_URL || "https://mainnet.base.org";
      const privateKey = process.env.PRIVATE_KEY;
      const usdcAddr   = process.env.BASE_USDC_ADDRESS;

      if (!privateKey || !usdcAddr) {
        throw new Error("PRIVATE_KEY or BASE_USDC_ADDRESS not set in env");
      }

      const provider   = new ethers.JsonRpcProvider(rpcUrl);
      const signer     = new ethers.Wallet(privateKey, provider);
      const usdc       = new ethers.Contract(usdcAddr, ERC20_ABI, signer);

      // USDC has 6 decimals
      const amountUnits = ethers.parseUnits(amount.toFixed(6), 6);

      // Check backend wallet USDC balance before attempting
      const balance = await usdc.balanceOf(await signer.getAddress());
      if (balance < amountUnits) {
        throw new Error(
          `Backend wallet USDC balance insufficient. Has: ${ethers.formatUnits(balance, 6)}, needs: ${amount}`
        );
      }

      const tx = await usdc.transfer(creatorWallet, amountUnits);
      await tx.wait();

      await RoyaltyPayout.findByIdAndUpdate(payout._id, {
        status:  "dispatched",
        txHash:  tx.hash,
        note:    `Auto-dispatched on-chain at ${new Date().toISOString()}`,
      });

      console.log(
        `✅ [RoyaltyService] USDC dispatched on-chain: ${amount} USDC → ${creatorWallet} | tx: ${tx.hash}`
      );

      return await RoyaltyPayout.findById(payout._id);
    } catch (dispatchErr) {
      console.error("❌ [RoyaltyService] On-chain USDC dispatch failed:", dispatchErr.message);
      await RoyaltyPayout.findByIdAndUpdate(payout._id, {
        status: "failed",
        note:   `Auto-dispatch failed: ${dispatchErr.message}`,
      });
      // Fall through to notify admin
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Notify admin (always for bank payouts; for crypto only on failure)
  await notifyAdmin(payout);

  return payout;
}
