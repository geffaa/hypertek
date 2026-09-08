/**
 * NFAService.js
 * Handles NFA (Non-Fungible Asset) business logic:
 * - Annual CPI compound interest applied to all active NFA minimums
 * - Admin-approved buyback payout execution
 */

import NFTSystem from "../Models/NFTSystem.js";
import { dispatchRoyalty } from "./RoyaltyService.js";

/**
 * Admin approves a buyback: pays the owner and retires the item.
 *
 * The item is claimed with a single conditional update before anything is
 * paid, so two clicks on the same item cannot both reach the payout — the
 * second one finds nothing left to claim and throws. The payout is awaited
 * rather than fired and forgotten, and if it fails the item is put back
 * exactly as it was, so an item is never left retired with its balance wiped
 * and nothing actually sent.
 *
 * @param {string} nftId - MongoDB _id
 * @returns {object} updated NFA document, the amount paid, and who was paid
 */
export async function executeBuyback(nftId) {
  const nft = await NFTSystem.findById(nftId);
  if (!nft) throw new Error("NFA not found");
  if (nft.zeroed) throw new Error("This item has already been bought back");

  const ownerWallet = nft.owner;
  const payoutAmount = nft.minimumBuybackUSD || 0;

  if (!(payoutAmount > 0) || !ownerWallet || ownerWallet === "admin") {
    throw new Error(
      `Nothing payable for this item (owner: ${ownerWallet || "none"}, amount: ${payoutAmount})`
    );
  }

  const payoutId = `buyback_${nftId}`;

  // Claim the item. The filter is the lock: whichever call matches first is the
  // only one that proceeds, and it also clears minimumBuybackUSD so a retry
  // cannot read a stale balance and pay it a second time.
  const updated = await NFTSystem.findOneAndUpdate(
    { _id: nftId, zeroed: { $ne: true } },
    {
      buybackPending: false,
      zeroed: true,
      removedFromCirculation: true,
      listed: false,
      status: "inactive",
      minimumBuybackUSD: 0,
      buybackPaidAt: new Date(),
      buybackPayoutId: payoutId,
    },
    { new: true }
  );
  if (!updated) throw new Error("This buyback has already been processed");

  try {
    await dispatchRoyalty({
      subCollectionId: String(nftId),
      parentId: String(nftId),
      creatorWallet: ownerWallet,
      amount: payoutAmount,
      saleRecordId: payoutId,
      note: `NFA buyback payout — HyperTek guarantee ($${payoutAmount.toFixed(2)} USDC)`,
    });
  } catch (err) {
    // Payment failed, so the item must not stay retired. Put it back the way
    // it was and surface the failure — the admin panel must not report a
    // success for money that never moved.
    await NFTSystem.findByIdAndUpdate(nftId, {
      buybackPending: nft.buybackPending ?? true,
      zeroed: false,
      removedFromCirculation: false,
      listed: nft.listed ?? false,
      status: nft.status || "active",
      minimumBuybackUSD: payoutAmount,
      buybackPaidAt: null,
      buybackPayoutId: null,
    });
    throw new Error(`Buyback payout failed, item restored: ${err.message}`);
  }

  console.log(`NFA ${nftId}: buyback paid $${payoutAmount.toFixed(2)} to ${ownerWallet}, item retired`);

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
  let updatedCount = 0;
  let skippedCount = 0;

  // ── 1. Standalone NFTSystem docs (non-parent) with minimumBuybackUSD ────────
  const standalones = await NFTSystem.find({
    isParentCollection: { $ne: true },
    zeroed: { $ne: true },
    removedFromCirculation: { $ne: true },
    minimumBuybackUSD: { $gt: 0 },
  });

  for (const doc of standalones) {
    const alreadyApplied = doc.cpiHistory?.some((h) => h.year === year);
    if (alreadyApplied) { skippedCount++; continue; }

    const previousMin = doc.minimumBuybackUSD;
    const newMin = parseFloat((previousMin * multiplier).toFixed(2));

    await NFTSystem.findByIdAndUpdate(doc._id, {
      minimumBuybackUSD: newMin,
      $push: { cpiHistory: { year, cpiPercent, previousMin, newMin, appliedAt: new Date() } },
    });
    updatedCount++;
  }

  // ── 2. Sub-collection items inside parent collections ────────────────────────
  const parents = await NFTSystem.find({ isParentCollection: true });

  for (const parent of parents) {
    let parentModified = false;

    for (const sub of parent.subCollections) {
      if (!sub.minimumBuybackUSD || sub.minimumBuybackUSD <= 0) continue;
      if (sub.zeroed) continue;

      const alreadyApplied = sub.cpiHistory?.some((h) => h.year === year);
      if (alreadyApplied) { skippedCount++; continue; }

      const previousMin = sub.minimumBuybackUSD;
      const newMin = parseFloat((previousMin * multiplier).toFixed(2));

      sub.minimumBuybackUSD = newMin;
      sub.cpiHistory = sub.cpiHistory || [];
      sub.cpiHistory.push({ year, cpiPercent, previousMin, newMin, appliedAt: new Date() });
      parentModified = true;
      updatedCount++;
    }

    if (parentModified) await parent.save();
  }

  console.log(`CPI ${cpiPercent}% applied for ${year}: ${updatedCount} updated, ${skippedCount} skipped`);
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
