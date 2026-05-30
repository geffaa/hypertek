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
  if (!subCollectionId) return;

  try {
    const promises = [
      // Cancel active MarketListing documents
      MarketListing.updateMany(
        { subCollectionId: String(subCollectionId), status: "active" },
        { status: "cancelled" }
      ),
      // Cancel active Auction documents (skip the one that triggered this if provided)
      (() => {
        const filter = {
          subCollectionId: String(subCollectionId),
          status: "active",
        };
        if (skipAuctionId) filter._id = { $ne: skipAuctionId };
        return Auction.updateMany(filter, { status: "cancelled" });
      })(),
    ];

    // Cancel matching Trade documents — Trade has no subCollectionId, so we
    // match by offering name + poster wallet (best-effort)
    if (itemName && ownerWallet) {
      promises.push(
        Trade.updateMany(
          {
            type: "trade",
            offering: new RegExp(itemName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
            posterWallet: new RegExp(`^${ownerWallet}$`, "i"),
            status: "open",
          },
          { status: "cancelled" }
        )
      );
    }

    const results = await Promise.all(promises);
    const cancelled = results.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);
    if (cancelled > 0) {
      console.log(`🚫 [cancelSiblingListings] Cancelled ${cancelled} sibling listing(s) for subCollection ${subCollectionId}`);
    }
  } catch (err) {
    // Non-blocking — log but do not re-throw
    console.error(" [cancelSiblingListings] error:", err.message);
  }
}
