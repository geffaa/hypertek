/**
 * Admin NFA routes:
 * POST /api/v1/admin/nfa/apply-cpi      — Apply annual CPI to all active NFA minimums
 * GET  /api/v1/admin/nfa/buybacks       — List all NFAs pending buyback
 * POST /api/v1/admin/nfa/:id/buyback    — Admin approves and executes a buyback
 */
import express from "express";
import { applyCPI, getPendingBuybacks, executeBuyback } from "../services/NFAService.js";
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

export default AdminNFARouter;
