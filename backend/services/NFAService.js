/**
 * NFAService.js
 * Handles NFA (Non-Fungible Asset) business logic:
 * - Buyback flagging when auction ends below reserve price
 * - Minimum buyback value tracking (+5% of sale price on each sale above reserve)
 * - Annual CPI compound interest applied to all active NFA minimums
 * - Admin notification emails for buyback events
 */

import nodemailer from "nodemailer";
import NFTSystem from "../Models/NFTSystem.js";
import { dispatchRoyalty } from "./RoyaltyService.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

/**
 * Called after a sale completes.
 * - If sale price >= reserve: increase minimumBuybackUSD by 5% of sale price
 * - If sale price < reserve: flag NFT for buyback, notify admin
 *
 * @param {string} nftId - MongoDB _id of the NFT document
 * @param {number} salePriceUSD - Sale price in USD
 */
export async function handlePostSale(nftId, salePriceUSD) {
  try {
    const nft = await NFTSystem.findById(nftId);
    if (!nft) return;

    const reserve = nft.reservePriceUSD || 0;

    if (salePriceUSD >= reserve) {
      // Increase minimum buyback value by 5% of sale price
      const increment = salePriceUSD * 0.05;
      await NFTSystem.findByIdAndUpdate(nftId, {
        $inc: { minimumBuybackUSD: increment },
      });
      console.log(`✅ NFA ${nftId}: minimumBuybackUSD +${increment.toFixed(2)} (sale ${salePriceUSD})`);
    } else {
      // Sale below reserve — flag for buyback
      await NFTSystem.findByIdAndUpdate(nftId, {
        buybackPending: true,
      });
      console.log(`⚠️ NFA ${nftId}: buyback flagged (sale ${salePriceUSD} < reserve ${reserve})`);
      await notifyAdminBuyback(nft, salePriceUSD);
    }
  } catch (err) {
    console.error("NFAService.handlePostSale error:", err.message);
  }
}

/**
 * Send email notification to HyperTek admin when a buyback is triggered.
 */
async function notifyAdminBuyback(nft, salePriceUSD) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
  if (!adminEmail) return;

  const nftName = nft.collection?.name || `NFT #${nft.tokenId}`;
  const reserve = nft.reservePriceUSD || 0;
  const payout = reserve * 0.8; // 80% of reserve (minus 20% platform commission)

  try {
    await transporter.sendMail({
      from: `"HyperTek System" <${process.env.SMTP_EMAIL}>`,
      to: adminEmail,
      subject: `[ACTION REQUIRED] NFA Buyback Triggered — ${nftName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0a0a1a; color: #fff; padding: 24px; border-radius: 8px;">
          <h2 style="color: #e53e3e;">⚠️ NFA Buyback Required</h2>
          <p>An NFA did not reach its reserve price and requires a buyback.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #aaa;">NFT Name</td><td style="padding: 8px;">${nftName}</td></tr>
            <tr><td style="padding: 8px; color: #aaa;">Token ID</td><td style="padding: 8px;">${nft.tokenId || "N/A"}</td></tr>
            <tr><td style="padding: 8px; color: #aaa;">Sale Price</td><td style="padding: 8px;">$${salePriceUSD.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px; color: #aaa;">Reserve Price</td><td style="padding: 8px;">$${reserve.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px; color: #aaa;">Buyback Payout (est.)</td><td style="padding: 8px; color: #4ade80; font-weight: bold;">$${payout.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px; color: #aaa;">Current Owner</td><td style="padding: 8px; font-family: monospace;">${nft.owner || "Unknown"}</td></tr>
          </table>
          <p style="color: #aaa;">Log in to the admin panel to approve this buyback payout and zero out the NFA.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("NFAService.notifyAdminBuyback email error:", err.message);
  }
}

/**
 * Admin approves a buyback.
 * - Marks NFA as zeroed + removed from circulation
 * - Clears buybackPending flag
 *
 * @param {string} nftId - MongoDB _id
 * @returns {object} updated NFA document
 */
export async function executeBuyback(nftId) {
  // Read first to get owner and payout amount before zeroing
  const nft = await NFTSystem.findById(nftId);
  if (!nft) throw new Error("NFA not found");

  const ownerWallet = nft.owner;
  const payoutAmount = nft.minimumBuybackUSD || 0;

  // Zero out the NFA
  const updated = await NFTSystem.findByIdAndUpdate(
    nftId,
    {
      buybackPending: false,
      zeroed: true,
      removedFromCirculation: true,
      listed: false,
      status: "inactive",
    },
    { new: true }
  );

  console.log(`✅ NFA ${nftId}: buyback executed, removed from circulation`);

  // Dispatch payout to current owner from buyback reserve fund
  if (payoutAmount > 0 && ownerWallet && ownerWallet !== "admin") {
    dispatchRoyalty({
      subCollectionId: String(nftId),
      parentId:        String(nftId),
      creatorWallet:   ownerWallet,
      amount:          payoutAmount,
      saleRecordId:    `buyback_${nftId}`,
      note:            `NFA buyback payout — HyperTek guarantee ($${payoutAmount.toFixed(2)} USDC)`,
    }).catch(err => console.warn("⚠️ [NFAService] buyback payout dispatch error:", err.message));
    console.log(`💸 [Buyback] Dispatching $${payoutAmount.toFixed(2)} USDC → ${ownerWallet}`);
  } else {
    console.warn(`⚠️ [Buyback] No payout dispatched — ownerWallet: ${ownerWallet}, amount: ${payoutAmount}`);
  }

  return { nft: updated, payoutAmount, ownerWallet };
}

/**
 * Apply annual CPI compound interest to all active NFA minimumBuybackUSD values.
 *
 * @param {number} cpiPercent - e.g. 2.0 for 2%
 * @param {number} year - e.g. 2026
 * @returns {object} { updatedCount, skippedCount }
 */
export async function applyCPI(cpiPercent, year) {
  if (!cpiPercent || cpiPercent <= 0) throw new Error("cpiPercent must be > 0");
  if (!year) throw new Error("year is required");

  const multiplier = 1 + cpiPercent / 100;

  // Find all active NFAs with a minimumBuybackUSD > 0 that haven't been zeroed
  const nfas = await NFTSystem.find({
    zeroed: { $ne: true },
    removedFromCirculation: { $ne: true },
    minimumBuybackUSD: { $gt: 0 },
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const nfa of nfas) {
    // Check if CPI for this year was already applied
    const alreadyApplied = nfa.cpiHistory?.some((h) => h.year === year);
    if (alreadyApplied) {
      skippedCount++;
      continue;
    }

    const previousMin = nfa.minimumBuybackUSD;
    const newMin = parseFloat((previousMin * multiplier).toFixed(2));

    await NFTSystem.findByIdAndUpdate(nfa._id, {
      minimumBuybackUSD: newMin,
      $push: {
        cpiHistory: {
          year,
          cpiPercent,
          previousMin,
          newMin,
          appliedAt: new Date(),
        },
      },
    });
    updatedCount++;
  }

  console.log(`✅ CPI ${cpiPercent}% applied for ${year}: ${updatedCount} updated, ${skippedCount} skipped (already applied)`);
  return { updatedCount, skippedCount };
}

/**
 * Get all NFAs pending buyback (for admin panel).
 */
export async function getPendingBuybacks() {
  return NFTSystem.find({ buybackPending: true, zeroed: { $ne: true } })
    .select("collection tokenId owner reservePriceUSD minimumBuybackUSD salesHistory createdAt")
    .sort({ updatedAt: -1 });
}
