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
  createHBTopupIntent,
  topupViaUSDC,
  getHBPlatformStats,
} from "../Controllers/HBController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const router = express.Router();

router.post("/earn", earnHB);
router.post("/spend", spendHB);
router.post("/cashout/otp", authMiddleware(), requestCashoutOTP);
router.post("/cashout", authMiddleware(), cashoutHB);
router.get("/balance", authMiddleware(), getHBBalance);
router.get("/history", authMiddleware(), getHBHistory);
router.get("/bank-details", authMiddleware(), getBankDetails);
router.put("/bank-details", authMiddleware(), saveBankDetails);
router.post("/topup/intent", authMiddleware(), createHBTopupIntent);
router.post("/topup/usdc", authMiddleware(), topupViaUSDC);
router.get("/admin/stats", authMiddleware(), getHBPlatformStats);

export default router;
