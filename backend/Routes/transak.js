import express from "express";
import {
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
// Gems cash-out via Transak is retired (Gems are in-game only).
router.post("/cashout/session", (_req, res) =>
  res.status(410).json({ success: false, error: "Cash-out is not available." }));
router.get("/order/:partnerOrderId", authMiddleware(), getOrderStatus);

export default router;
