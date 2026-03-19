import express from "express";
import {
  getTrades,
  getTrade,
  createTrade,
  acceptTrade,
  completeTrade,
  cancelTrade,
  getPosterTrades,
} from "../Controllers/TradeController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const TradeRouter = express.Router();

TradeRouter.get("/",                getTrades);
TradeRouter.get("/:id",             getTrade);
TradeRouter.get("/poster/:wallet",  getPosterTrades);

TradeRouter.post("/",               authMiddleware(), createTrade);
TradeRouter.post("/:id/accept",     authMiddleware(), acceptTrade);
TradeRouter.put("/:id/complete",    authMiddleware(), completeTrade);
TradeRouter.put("/:id/cancel",      authMiddleware(), cancelTrade);

export default TradeRouter;
