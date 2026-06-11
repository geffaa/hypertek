/**
 * When an item is sold or deleted in any channel (marketplace, auction, trade),
 * cancel all other active listings for that same subCollection so it cannot be
 * double-sold or remain as a ghost listing.
 *
 * Channels covered:
 *   - MarketListing documents  (status → "cancelled")
 *   - Auction documents        (status → "cancelled")
 *   - Trade documents          (status → "cancelled") — matched by itemName + ownerWallet
 */

import MarketListing from "../Models/MarketListingModel.js";
import Auction from "../Models/AuctionModel.js";
import Trade from "../Models/TradeModel.js";

/**
 * @param {string} subCollectionId   The _id of the subCollection that was sold/deleted
 * @param {object} [opts]
 * @param {string} [opts.skipAuctionId]   Auction _id to leave untouched (the one that just sold)
 * @param {string} [opts.itemName]        Item name to match Trade.offering (Trade has no subCollectionId)
 * @param {string} [opts.ownerWallet]     Wallet of the item owner to scope Trade cancellation
 */
export async function cancelSiblingListings(subCollectionId, { skipAuctionId, itemName, ownerWallet } = {}) {
  // Need at least one anchor to do anything useful
  if (!subCollectionId && !itemName) return;

  try {
    const promises = [];

    // Cancel active MarketListing and Auction documents — only possible when subCollectionId is known
    if (subCollectionId) {
      promises.push(
        MarketListing.updateMany(
          { subCollectionId: String(subCollectionId), status: "active" },
          { status: "cancelled" }
        )
      );
      const auctionFilter = { subCollectionId: String(subCollectionId), status: "active" };
      if (skipAuctionId) auctionFilter._id = { $ne: skipAuctionId };
      promises.push(Auction.updateMany(auctionFilter, { status: "cancelled" }));
    }

    // Cancel matching Trade documents — Trade has no subCollectionId, so we
    // match by offering name + poster wallet (best-effort).
    // If ownerWallet is missing, fall back to itemName-only match to avoid leaving ghost records.
    if (itemName) {
      const escapedName = itemName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const tradeFilter = {
        type: "trade",
        offering: new RegExp(escapedName, "i"),
        status: { $in: ["open", "accepted"] },
      };
      if (ownerWallet) {
        tradeFilter.posterWallet = new RegExp(`^${ownerWallet}$`, "i");
      }
      promises.push(Trade.updateMany(tradeFilter, { status: "cancelled" }));

      // "trading" MarketListing records created by TradeController have no subCollectionId,
      // so they are not caught by the subCollectionId query above. Cancel them by itemName.
      const tradingListingFilter = {
        activityType: "trading",
        itemName: new RegExp(`^${escapedName}$`, "i"),
        status: { $in: ["active", "pending"] },
      };
      if (ownerWallet) {
        tradingListingFilter.userWallet = new RegExp(`^${ownerWallet}$`, "i");
      }
      promises.push(MarketListing.updateMany(tradingListingFilter, { status: "cancelled" }));
    }

    const results = await Promise.all(promises);
    const cancelled = results.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);
    if (cancelled > 0) {
      console.log(`🚫 [cancelSiblingListings] Cancelled ${cancelled} sibling listing(s) for subCollection ${subCollectionId ?? itemName}`);
    }
  } catch (err) {
    // Non-blocking — log but do not re-throw
    console.error(" [cancelSiblingListings] error:", err.message);
  }
}
