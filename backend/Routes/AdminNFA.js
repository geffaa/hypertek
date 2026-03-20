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
 * GET /api/v1/admin/nfa/royalty-payouts?status=pending
 * Returns royalty payout records (filterable by status)
 */
AdminNFARouter.get("/royalty-payouts", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const payouts = await RoyaltyPayout.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, count: payouts.length, data: payouts });
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

export default AdminNFARouter;
