import express from "express";
import {
  earnHB,
  spendHB,
  cashoutHB,
  requestCashoutOTP,
  getHBBalance,
  getHBHistory,
  saveBankDetails,
  createHBTopupIntent,
} from "../Controllers/HBController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const router = express.Router();

router.post("/earn", earnHB);                             // called by game server (no auth — internal)
router.post("/spend", spendHB);                           // called by marketplace (no auth — internal)
router.post("/cashout/otp", authMiddleware(), requestCashoutOTP);
router.post("/cashout", authMiddleware(), cashoutHB);
router.get("/balance", authMiddleware(), getHBBalance);
router.get("/history", authMiddleware(), getHBHistory);
router.put("/bank-details", authMiddleware(), saveBankDetails);
router.post("/topup/intent", authMiddleware(), createHBTopupIntent);

export default router;
