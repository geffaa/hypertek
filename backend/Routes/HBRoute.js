import express from "express";
import {
  spendHB,
  getHBBalance,
  getHBHistory,
  createHBTopupIntent,
  topupViaUSDC,
  getHBPlatformStats,
} from "../Controllers/HBController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Gems (stored as hyperBucks) are bought and spent in-game only. Earning them
// as a reward and cashing them out are both retired: either would make them a
// payment rather than a consumable.
const retired = (_req, res) =>
  res.status(410).json({ success: false, error: "Gems can only be bought and used in-game. Cash-out is not available." });

router.post("/earn", retired);
router.post("/cashout/otp", retired);
router.post("/cashout", retired);
router.get("/fx-rate", retired);
router.get("/bank-details", retired);
router.put("/bank-details", retired);
router.get("/debit-card", retired);
router.put("/debit-card", retired);

router.post("/spend", authMiddleware(), spendHB);
router.get("/balance", authMiddleware(), getHBBalance);
router.get("/history", authMiddleware(), getHBHistory);
router.post("/topup/intent", authMiddleware(), createHBTopupIntent);
router.post("/topup/usdc", authMiddleware(), topupViaUSDC);
router.get("/admin/stats", authMiddleware("admin"), getHBPlatformStats);

export default router;
