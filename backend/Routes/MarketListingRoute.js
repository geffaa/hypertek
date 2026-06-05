import express from "express";
import {
  getMyListings,
  getListing,
  createListing,
  updateListing,
  renewListing,
  deleteListing,
  submitOffer,
  submitBid,
  getPublicMarketplaceListings,
} from "../Controllers/MarketListingController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const MarketListingRouter = express.Router();

MarketListingRouter.get("/my",          authMiddleware(), getMyListings);
MarketListingRouter.get("/marketplace", getPublicMarketplaceListings);
MarketListingRouter.get("/:id",         getListing);
MarketListingRouter.post("/",             authMiddleware(), createListing);
MarketListingRouter.put("/:id",           authMiddleware(), updateListing);
MarketListingRouter.put("/:id/renew",     authMiddleware(), renewListing);
MarketListingRouter.delete("/:id",        authMiddleware(), deleteListing);
MarketListingRouter.post("/:id/offer",    authMiddleware(), submitOffer);
MarketListingRouter.post("/:id/bid",      authMiddleware(), submitBid);

export default MarketListingRouter;
