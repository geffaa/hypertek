/**
 * Admin NFA routes:
 * POST /api/v1/admin/nfa/apply-cpi      — Apply annual CPI to all active NFA minimums
 * GET  /api/v1/admin/nfa/buybacks       — List all NFAs pending buyback
 * POST /api/v1/admin/nfa/:id/buyback    — Admin approves and executes a buyback
 */
import express from "express";
import { applyCPI, getPendingBuybacks, executeBuyback } from "../services/NFAService.js";
import { RoyaltyPayout } from "../services/RoyaltyService.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";
import NFTSystem from "../Models/NFTSystem.js";
import MarketListing from "../Models/MarketListingModel.js";
import Artist from "../Models/Artist.js";

const AdminNFARouter = express.Router();

// All routes require admin auth
AdminNFARouter.use(authMiddleware("admin"));

/**
 * POST /api/v1/admin/nfa/apply-cpi
 * Body: { cpiPercent: 2.0, year: 2026 }
 */
AdminNFARouter.post("/apply-cpi", async (req, res) => {
  try {
    const { cpiPercent, year } = req.body;
    if (!cpiPercent || !year) {
      return res.status(400).json({ success: false, message: "cpiPercent and year are required" });
    }
    const result = await applyCPI(Number(cpiPercent), Number(year));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/v1/admin/nfa/buybacks
 * Returns all NFAs with buybackPending: true
 */
AdminNFARouter.get("/buybacks", async (req, res) => {
  try {
    const pending = await getPendingBuybacks();
    res.json({ success: true, count: pending.length, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/v1/admin/nfa/:id/buyback
 * Admin approves buyback — zeros out the NFA
 */
AdminNFARouter.post("/:id/buyback", async (req, res) => {
  try {
    const { nft, payoutAmount, ownerWallet } = await executeBuyback(req.params.id);
    res.json({
      success: true,
      message: `Buyback executed. NFA removed from circulation. $${(payoutAmount || 0).toFixed(2)} USDC dispatched to ${ownerWallet || "unknown"}.`,
      data: nft,
      payout: { amount: payoutAmount, recipient: ownerWallet },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/v1/admin/nfa/royalty-payouts?status=pending&payoutType=company_fee
 * Returns payout records filterable by status and/or payoutType.
 * Also returns aggregate totals by type and status for dashboard summary.
 */
AdminNFARouter.get("/royalty-payouts", async (req, res) => {
  try {
    const { status, payoutType } = req.query;
    const filter = {};
    if (status)     filter.status     = status;
    if (payoutType) filter.payoutType = payoutType;

    const [payouts, totals] = await Promise.all([
      RoyaltyPayout.find(filter).sort({ createdAt: -1 }).limit(500),
      RoyaltyPayout.aggregate([
        {
          $group: {
            _id: { payoutType: "$payoutType", status: "$status" },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Shape totals into a nested object: { company_fee: { pending: 0, dispatched: 0, failed: 0 }, ... }
    const summary = {};
    for (const row of totals) {
      const type   = row._id.payoutType || "artist_royalty";
      const stat   = row._id.status     || "pending";
      if (!summary[type]) summary[type] = { pending: 0, dispatched: 0, failed: 0, total: 0 };
      summary[type][stat]  = parseFloat(row.total.toFixed(2));
      summary[type].total  = parseFloat(((summary[type].total || 0) + row.total).toFixed(2));
    }

    res.json({ success: true, count: payouts.length, data: payouts, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/v1/admin/nfa/royalty-payouts/:id/mark-dispatched
 * Admin marks a bank payout as processed manually
 */
AdminNFARouter.put("/royalty-payouts/:id/mark-dispatched", async (req, res) => {
  try {
    const payout = await RoyaltyPayout.findByIdAndUpdate(
      req.params.id,
      { status: "dispatched", note: `Manually marked dispatched by admin on ${new Date().toISOString()}` },
      { new: true }
    );
    if (!payout) return res.status(404).json({ success: false, message: "Payout not found" });
    res.json({ success: true, data: payout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/v1/admin/items
 * Returns all sub-collection items flattened across all parent collections.
 * Query params: assetType, category, listed, status, search, page, limit
 */
AdminNFARouter.get("/items", async (req, res) => {
  try {
    const { assetType, category, listed, status, search, page = 1, limit = 20 } = req.query;

    // Build parent-level match
    const parentMatch = { isParentCollection: true };
    if (category) parentMatch.category = category.toLowerCase().trim();

    // Fetch parents (with subCollections embedded)
    const parents = await NFTSystem.find(parentMatch).lean();

    // Flatten all sub-collections, attaching parent info
    let items = [];
    for (const parent of parents) {
      for (const sub of parent.subCollections || []) {
        items.push({
          _id:          sub._id,
          parentId:     parent._id,
          parentName:   parent.collection?.name || "",
          category:     parent.category || "",
          name:         sub.name,
          image:        sub.image || parent.collection?.image || "",
          assetType:    sub.assetType || "NFT",
          isNFA:        sub.isNFA || false,
          priceETH:     sub.priceETH || 0,
          listed:       sub.listed || false,
          status:       sub.status || "active",
          owner:        sub.owner || "",
          isFirstSale:  sub.isFirstSale !== false,
          minimumBuybackUSD: sub.minimumBuybackUSD || 0,
          reservePriceUSD:   sub.reservePriceUSD || 0,
          buybackPending:    sub.buybackPending || false,
          artistId:     sub.artistId || null,
          artistName:   "",   // populated below
          createdAt:    sub.createdAt,
        });
      }
    }

    // Batch-load artist names for all items that have an artistId
    const artistIds = [...new Set(items.map(i => i.artistId).filter(Boolean).map(String))];
    if (artistIds.length) {
      const artists = await Artist.find({ _id: { $in: artistIds } }).select("name").lean();
      const artistMap = Object.fromEntries(artists.map(a => [a._id.toString(), a.name]));
      for (const item of items) {
        if (item.artistId) item.artistName = artistMap[item.artistId.toString()] || "";
      }
    }

    // Apply filters
    if (assetType)             items = items.filter(i => i.assetType === assetType);
    if (listed !== undefined)  items = items.filter(i => i.listed === (listed === "true"));
    if (status)                items = items.filter(i => i.status === status);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.parentName.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = items.length;
    const skip  = (Number(page) - 1) * Number(limit);
    const paged = items.slice(skip, skip + Number(limit));

    // Summary counts by assetType
    const summary = { NFT: 0, NFC: 0, NFA: 0, total };
    for (const i of items) summary[i.assetType] = (summary[i.assetType] || 0) + 1;

    const totalPages = Math.ceil(total / Number(limit));
    res.json({ success: true, count: paged.length, total, page: Number(page), totalPages, summary, data: paged });
  } catch (err) {
    console.error("GET /admin/items error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/v1/admin/items/:parentId/:subId
 * Deletes a specific sub-collection item from its parent.
 */
AdminNFARouter.delete("/items/:parentId/:subId", async (req, res) => {
  try {
    const { parentId, subId } = req.params;
    const parent = await NFTSystem.findById(parentId);
    if (!parent) return res.status(404).json({ success: false, message: "Parent collection not found" });

    const before = parent.subCollections.length;
    parent.subCollections = parent.subCollections.filter(s => s._id.toString() !== subId);
    if (parent.subCollections.length === before) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    await parent.save();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/v1/admin/items/:parentId/:subId/status
 * Toggle status active/inactive for a sub-collection item.
 */
AdminNFARouter.put("/items/:parentId/:subId/status", async (req, res) => {
  try {
    const { parentId, subId } = req.params;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be active or inactive" });
    }
    const parent = await NFTSystem.findById(parentId);
    if (!parent) return res.status(404).json({ success: false, message: "Parent collection not found" });

    const sub = parent.subCollections.id(subId);
    if (!sub) return res.status(404).json({ success: false, message: "Item not found" });

    sub.status = status;
    await parent.save();
    res.json({ success: true, message: `Item status updated to ${status}`, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/v1/admin/nfa/market-listings
 * All marketplace listings — filterable, paginated at DB level.
 * Query: status, activityType, page, limit
 */
AdminNFARouter.get("/market-listings", async (req, res) => {
  try {
    const { status, activityType, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status)       filter.status       = status;
    if (activityType) filter.activityType = activityType;

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total, agg] = await Promise.all([
      MarketListing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      MarketListing.countDocuments(filter),
      MarketListing.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const summary = { active: 0, pending: 0, expired: 0, sold: 0, cancelled: 0, total: 0 };
    for (const row of agg) {
      if (summary[row._id] !== undefined) summary[row._id] = row.count;
      summary.total += row.count;
    }

    res.json({
      success: true,
      data: listings,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      summary,
    });
  } catch (err) {
    console.error("GET /admin/market-listings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/v1/admin/nfa/market-listings/:id
 * Admin force-cancels a listing (sets status to "cancelled", does not delete).
 */
AdminNFARouter.delete("/market-listings/:id", async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    listing.status = "cancelled";
    await listing.save();

    res.json({ success: true, message: "Listing cancelled by admin", data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default AdminNFARouter;
