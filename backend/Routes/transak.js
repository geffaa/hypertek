import express from "express";
import {
  createCashoutSession,
  createFundSession,
  getOrderStatus,
  handleWebhook,
} from "../Controllers/transakController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Webhook is public — authenticity is proven by the signed JWT in the body (verified in the controller).
// Transak sends normal JSON, so the global express.json() parser is fine (no raw body needed).
router.post("/webhook", handleWebhook);

// Authenticated session + status endpoints.
router.post("/fund/session", authMiddleware(), createFundSession); // buy USDC to user wallet (marketplace + top-up)
router.post("/cashout/session", authMiddleware(), createCashoutSession);
router.get("/order/:partnerOrderId", authMiddleware(), getOrderStatus);

export default router;
