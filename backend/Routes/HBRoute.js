import express from "express";
import {
  earnHB,
  spendHB,
  cashoutHB,
  requestCashoutOTP,
  getHBBalance,
  getHBHistory,
  saveBankDetails,
  getBankDetails,
  saveDebitCard,
  getDebitCard,
  createHBTopupIntent,
  topupViaUSDC,
  getHBPlatformStats,
  getFxRate,
} from "../Controllers/HBController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const router = express.Router();

router.post("/earn", authMiddleware(), earnHB);
router.post("/spend", authMiddleware(), spendHB);
router.post("/cashout/otp", authMiddleware(), requestCashoutOTP);
router.post("/cashout", authMiddleware(), cashoutHB);
router.get("/balance", authMiddleware(), getHBBalance);
router.get("/fx-rate", authMiddleware(), getFxRate);
router.get("/history", authMiddleware(), getHBHistory);
router.get("/bank-details", authMiddleware(), getBankDetails);
router.put("/bank-details", authMiddleware(), saveBankDetails);
router.get("/debit-card", authMiddleware(), getDebitCard);
router.put("/debit-card", authMiddleware(), saveDebitCard);
router.post("/topup/intent", authMiddleware(), createHBTopupIntent);
router.post("/topup/usdc", authMiddleware(), topupViaUSDC);
router.get("/admin/stats", authMiddleware("admin"), getHBPlatformStats);

export default router;
