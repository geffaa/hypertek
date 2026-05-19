/**
 * Admin NFA routes:
 * POST /api/v1/admin/nfa/apply-cpi      — Apply annual CPI to all active NFA minimums
 * GET  /api/v1/admin/nfa/buybacks       — List all NFAs pending buyback
 * POST /api/v1/admin/nfa/:id/buyback    — Admin approves and executes a buyback
 */
import express from "express";
import { applyCPI, getPendingBuybacks, executeBuyback } from "../services/NFAService.js";
import { RoyaltyPayout, dispatchRoyaltyOnChain } from "../services/RoyaltyService.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";
import NFTSystem from "../Models/NFTSystem.js";
import MarketListing from "../Models/MarketListingModel.js";
import Artist from "../Models/Artist.js";
import BuybackRequest from "../Models/BuybackRequest.js";
import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";

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
    res.json({
      success:    true,
      year:       Number(year),
      cpiPercent: Number(cpiPercent),
      updated:    result.updatedCount,
      skipped:    result.skippedCount,
    });
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
 * POST /api/v1/admin/nfa/royalty-payouts/:id/retry
 * Admin retries a failed crypto payout — re-attempts on-chain USDC dispatch
 */
AdminNFARouter.post("/royalty-payouts/:id/retry", async (req, res) => {
  try {
    const payout = await RoyaltyPayout.findById(req.params.id);
    if (!payout) return res.status(404).json({ success: false, message: "Payout not found" });
    if (payout.paymentType !== "crypto")
      return res.status(400).json({ success: false, message: "Only crypto payouts can be retried" });
    if (payout.status === "dispatched")
      return res.status(400).json({ success: false, message: "Payout already dispatched" });
    if (!payout.creatorWallet || payout.creatorWallet === "admin")
      return res.status(400).json({ success: false, message: "No valid recipient wallet on this payout" });

    // Reset to pending before retry
    await RoyaltyPayout.findByIdAndUpdate(payout._id, { status: "pending", note: "Retry initiated by admin" });

    const updated = await dispatchRoyaltyOnChain(payout);
    res.json({ success: true, data: updated });
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
 * All marketplace listings — filterable by status, activityType, search; paginated at DB level.
 */
AdminNFARouter.get("/market-listings", async (req, res) => {
  try {
    const { status, activityType, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status)       filter.status       = status;
    if (activityType) filter.activityType = activityType;
    if (search?.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ itemName: re }, { userName: re }, { userWallet: re }];
    }

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
 * PUT /api/v1/admin/nfa/market-listings/:id/cancel
 * Admin force-cancels a listing with an optional reason.
 */
AdminNFARouter.put("/market-listings/:id/cancel", async (req, res) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
    if (!["active", "pending"].includes(listing.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a listing with status "${listing.status}"` });
    }

    listing.status            = "cancelled";
    listing.cancelledByAdmin  = true;
    listing.adminCancelReason = req.body.reason?.trim() || "Cancelled by admin";
    await listing.save();

    res.json({ success: true, message: "Listing cancelled by admin", data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/v1/admin/nfa/notifications
 * Aggregates platform events into admin notification feed.
 * Sources: pending buybacks, pending royalty payouts, expiring listings, recent new users.
 */
AdminNFARouter.get("/notifications", async (req, res) => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [pendingBuybacks, pendingPayouts, expiringListings, newUsers] = await Promise.all([
      BuybackRequest.find({ status: "pending" }).sort({ createdAt: -1 }).limit(20).lean(),
      RoyaltyPayout.find({ status: "pending" }).sort({ createdAt: -1 }).limit(20).lean(),
      MarketListing.find({ status: "active", expiresAt: { $lte: in24h } }).sort({ expiresAt: 1 }).limit(20).lean(),
      User.find({ createdAt: { $gte: last7d } }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const notifications = [];

    for (const r of pendingBuybacks) {
      notifications.push({
        _id: `buyback-${r._id}`,
        type: "warning",
        title: "Buyback Request Pending",
        message: `"${r.itemName || "Item"}" — min. $${(r.minimumBuybackUSD || 0).toFixed(2)} USDC`,
        link: "buyback-approval",
        read: false,
        createdAt: r.createdAt,
      });
    }

    for (const p of pendingPayouts) {
      notifications.push({
        _id: `payout-${p._id}`,
        type: "warning",
        title: "Royalty Payout Pending",
        message: `$${(p.amount || 0).toFixed(2)} USDC — ${p.payoutType?.replace(/_/g, " ") || "payout"}`,
        link: "royalty-payouts",
        read: false,
        createdAt: p.createdAt,
      });
    }

    for (const l of expiringListings) {
      const hoursLeft = Math.ceil((new Date(l.expiresAt) - now) / (1000 * 60 * 60));
      notifications.push({
        _id: `expiry-${l._id}`,
        type: "info",
        title: "Listing Expiring Soon",
        message: `"${l.itemName || "Item"}" by ${l.userName || "seller"} — ${hoursLeft}h left`,
        link: "collection-listed-sale",
        read: false,
        createdAt: l.createdAt,
      });
    }

    for (const u of newUsers) {
      notifications.push({
        _id: `user-${u._id}`,
        type: "success",
        title: "New User Registered",
        message: u.FullName || u.Email || "New member joined the platform",
        link: "users",
        read: false,
        createdAt: u.createdAt,
      });
    }

    // Sort all by createdAt desc
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    console.error("GET /admin/notifications error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HYPERBUCKS ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/nfa/hb/users
 * List all users who have a non-zero HB balance, with pagination + search.
 * Query: page, limit, search (name/email/wallet)
 */
AdminNFARouter.get("/hb/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { hyperBucks: { $gt: 0 } };
    if (search?.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ FullName: re }, { Email: re }, { walletAddress: re }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("FullName Email walletAddress hyperBucks createdAt")
        .sort({ hyperBucks: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalHB = await User.aggregate([{ $group: { _id: null, sum: { $sum: "$hyperBucks" } } }]);

    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
      platformTotalHB: totalHB[0]?.sum || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/v1/admin/nfa/hb/ledger/:userId
 * Full HB transaction history for a specific user.
 * Query: page, limit, type (earn|spend|cashout|admin_adjust|prize)
 */
AdminNFARouter.get("/hb/ledger/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 30, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { userId };
    if (type) filter.type = type;

    const [entries, total, user] = await Promise.all([
      HBLedger.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      HBLedger.countDocuments(filter),
      User.findById(userId).select("FullName Email walletAddress hyperBucks").lean(),
    ]);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user,
      data: entries,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/v1/admin/nfa/hb/adjust
 * Manually credit or debit a user's HB balance.
 * Body: { userId, amount (positive=credit, negative=debit), reason }
 */
AdminNFARouter.post("/hb/adjust", async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "userId is required" });
    if (amount == null || amount === 0) return res.status(400).json({ success: false, message: "amount must be non-zero" });
    if (!reason?.trim()) return res.status(400).json({ success: false, message: "reason is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const previousBalance = user.hyperBucks || 0;
    const newBalance = previousBalance + Number(amount);

    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: `Debit of ${Math.abs(amount)} HB exceeds current balance of ${previousBalance} HB`,
      });
    }

    user.hyperBucks = newBalance;
    await user.save();

    const entry = await HBLedger.create({
      userId,
      type:          "admin_adjust",
      amount:        Number(amount),
      balanceAfter:  newBalance,
      description:   reason.trim(),
      reference:     `admin_adjust_${req.user._id}_${Date.now()}`,
    });

    console.log(`[Admin HB] adjust user ${userId}: ${amount > 0 ? "+" : ""}${amount} HB by admin ${req.user._id}. Reason: ${reason}`);

    res.json({
      success: true,
      message: `${amount > 0 ? "Credited" : "Debited"} ${Math.abs(amount)} HB ${amount > 0 ? "to" : "from"} user`,
      previousBalance,
      newBalance,
      entry,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/v1/admin/nfa/hb/cashouts
 * All HB cashout ledger entries with optional status filter.
 * Query: status (pending|processing|completed|failed), page, limit
 */
AdminNFARouter.get("/hb/cashouts", async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { type: "cashout" };
    if (status) filter.cashoutStatus = status;

    const [entries, total, agg] = await Promise.all([
      HBLedger.find(filter)
        .populate("userId", "FullName Email walletAddress bankDetails")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      HBLedger.countDocuments(filter),
      HBLedger.aggregate([
        { $match: { type: "cashout" } },
        { $group: { _id: "$cashoutStatus", count: { $sum: 1 }, totalUSD: { $sum: "$cashoutUSD" } } },
      ]),
    ]);

    const summary = { pending: 0, processing: 0, completed: 0, failed: 0 };
    for (const row of agg) if (row._id) summary[row._id] = row.count;

    res.json({
      success: true,
      data: entries,
      summary,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/v1/admin/nfa/hb/cashouts/:ledgerId/complete
 * Admin marks a pending/failed cashout as completed (manual payout done outside system).
 * Body: { txHash? (optional), adminNote? }
 */
AdminNFARouter.put("/hb/cashouts/:ledgerId/complete", async (req, res) => {
  try {
    const { txHash, adminNote } = req.body;
    const entry = await HBLedger.findById(req.params.ledgerId);

    if (!entry) return res.status(404).json({ success: false, message: "Ledger entry not found" });
    if (entry.type !== "cashout") return res.status(400).json({ success: false, message: "Entry is not a cashout" });
    if (entry.cashoutStatus === "completed") {
      return res.status(400).json({ success: false, message: "Cashout already completed" });
    }

    entry.cashoutStatus = "completed";
    if (txHash) entry.cashoutTxHash = txHash;
    if (adminNote) entry.description = `${entry.description || ""} | Admin: ${adminNote}`.trim();
    await entry.save();

    console.log(`[Admin HB] cashout ${entry._id} marked completed by admin ${req.user._id}`);
    res.json({ success: true, message: "Cashout marked as completed", entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/v1/admin/nfa/hb/cashouts/:ledgerId/fail
 * Admin marks a cashout as failed and refunds HB back to user.
 * Body: { reason }
 */
AdminNFARouter.put("/hb/cashouts/:ledgerId/fail", async (req, res) => {
  try {
    const { reason } = req.body;
    const entry = await HBLedger.findById(req.params.ledgerId);

    if (!entry) return res.status(404).json({ success: false, message: "Ledger entry not found" });
    if (entry.type !== "cashout") return res.status(400).json({ success: false, message: "Entry is not a cashout" });
    if (["completed", "failed"].includes(entry.cashoutStatus)) {
      return res.status(400).json({ success: false, message: `Cashout already ${entry.cashoutStatus}` });
    }

    // Refund HB to user
    const hbAmount = Math.abs(entry.amount);
    const user = await User.findById(entry.userId);
    if (user) {
      user.hyperBucks = (user.hyperBucks || 0) + hbAmount;
      await user.save();
      await HBLedger.create({
        userId: entry.userId,
        type:        "admin_adjust",
        amount:      hbAmount,
        balanceAfter: user.hyperBucks,
        description: `Refund: failed cashout #${entry._id}${reason ? ` — ${reason}` : ""}`,
        reference:   `refund_${entry._id}`,
      });
    }

    entry.cashoutStatus = "failed";
    entry.description   = `${entry.description || ""} | Failed: ${reason || "Admin marked failed"}`.trim();
    await entry.save();

    console.log(`[Admin HB] cashout ${entry._id} marked failed + ${hbAmount} HB refunded by admin ${req.user._id}`);
    res.json({ success: true, message: `Cashout marked failed. ${user ? `${hbAmount} HB refunded to user.` : "User not found — no refund."}`, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default AdminNFARouter;
