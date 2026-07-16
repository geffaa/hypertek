import express from "express";
import {
  getTrades,
  getTrade,
  createTrade,
  acceptTrade,
  completeTrade,
  cancelTrade,
  getPosterTrades,
  getQuestStats,
} from "../Controllers/TradeController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import uploadTemp from "../Middleware/UploadMulter.js";

const TradeRouter = express.Router();

// Static routes must be declared before /:id to avoid conflict
TradeRouter.get("/stats/daily",     getQuestStats);       // GET /api/v1/trade/stats/daily?wallet=0x...
TradeRouter.get("/poster/:wallet",  getPosterTrades);
TradeRouter.get("/",                getTrades);
TradeRouter.get("/:id",             getTrade);

TradeRouter.post("/",               authMiddleware(), uploadTemp.single("image"), createTrade);
TradeRouter.post("/:id/accept",     authMiddleware(), acceptTrade);
TradeRouter.put("/:id/complete",    authMiddleware(), completeTrade);
TradeRouter.put("/:id/cancel",      authMiddleware(), cancelTrade);

export default TradeRouter;
