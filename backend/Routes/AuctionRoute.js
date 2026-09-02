import express from "express";
import {
  getAuctions,
  getAuction,
  createAuction,
  placeBid,
  instantBuy,
  cancelAuction,
  getSellerAuctions,
  finalizeAuction,
} from "../Controllers/AuctionController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { purchasesLocked } from "../Middleware/purchasesLocked.js";

const AuctionRouter = express.Router();

AuctionRouter.get("/",              getAuctions);
AuctionRouter.get("/:id",           getAuction);
AuctionRouter.get("/seller/:wallet",getSellerAuctions);

AuctionRouter.post("/",             authMiddleware(), createAuction);
AuctionRouter.post("/:id/bid",      authMiddleware(), placeBid);
AuctionRouter.post("/:id/instant-buy", authMiddleware(), purchasesLocked, instantBuy);
AuctionRouter.put("/:id/cancel",    authMiddleware(), cancelAuction);
AuctionRouter.post("/:id/finalize", authMiddleware(), purchasesLocked, finalizeAuction);

export default AuctionRouter;
