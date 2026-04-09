/**
 * When an item is sold in any channel (marketplace, auction, trade), cancel all
 * other active listings for that same subCollection so it cannot be double-sold.
 *
 * Channels covered:
 *   - MarketListing documents  (status → "cancelled")
 *   - Auction documents        (status → "cancelled")
 *
 * Trade listings have no subCollectionId field so they are not touched here.
 */

import MarketListing from "../Models/MarketListingModel.js";
import Auction       from "../Models/AuctionModel.js";

/**
 * @param {string} subCollectionId   The _id of the subCollection that was sold
 * @param {object} [opts]
 * @param {string} [opts.skipAuctionId]   Auction _id to leave untouched (the one that just sold)
 */
export async function cancelSiblingListings(subCollectionId, { skipAuctionId } = {}) {
  if (!subCollectionId) return;

  try {
    const [mlResult, auctionQuery] = await Promise.all([
      MarketListing.updateMany(
        { subCollectionId: String(subCollectionId), status: "active" },
        { status: "cancelled" }
      ),
      (() => {
        const filter = {
          subCollectionId: String(subCollectionId),
          status: "active",
        };
        if (skipAuctionId) filter._id = { $ne: skipAuctionId };
        return Auction.updateMany(filter, { status: "cancelled" });
      })(),
    ]);

    const cancelled = (mlResult.modifiedCount || 0) + (auctionQuery.modifiedCount || 0);
    if (cancelled > 0) {
      console.log(`🚫 [cancelSiblingListings] Cancelled ${cancelled} sibling listing(s) for subCollection ${subCollectionId}`);
    }
  } catch (err) {
    // Non-blocking — log but do not re-throw
    console.error("❌ [cancelSiblingListings] error:", err.message);
  }
}
