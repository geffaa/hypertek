import express from "express";
import {
  getAuctions,
  getAuction,
  createAuction,
  placeBid,
  instantBuy,
  cancelAuction,
  getSellerAuctions,
} from "../Controllers/AuctionController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const AuctionRouter = express.Router();

AuctionRouter.get("/",              getAuctions);
AuctionRouter.get("/:id",           getAuction);
AuctionRouter.get("/seller/:wallet",getSellerAuctions);

AuctionRouter.post("/",             authMiddleware(), createAuction);
AuctionRouter.post("/:id/bid",      authMiddleware(), placeBid);
AuctionRouter.post("/:id/instant-buy", authMiddleware(), instantBuy);
AuctionRouter.put("/:id/cancel",    authMiddleware(), cancelAuction);

export default AuctionRouter;
