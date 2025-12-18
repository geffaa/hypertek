// Routes/NFTRoute.js - FIXED VERSION
import express from "express";
import {
  createCollection,
  getAllCollections,
  getSingleCollection,
  updateCollection,
  deleteCollection,
  serverMint,
  createListing,
  getListingDetails,
  recordOnchainSale,
  getRoyaltiesSummary,
  getPlatformRevenue,
  getNFTById,
  getNFTsByOwner,
  getNFTsByCreator,
  updateNFTStatus,
  getAllNFTs,
  getPopularCollections,
  getTotalCounts,
} from "../Controllers/nftController.js";
import uploadTemp from "../Middleware/UploadMulter.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const NFTRouter = express.Router();

// ======================
// PUBLIC ROUTES (No Auth Required)
// ======================
NFTRouter.get("/collection/get", getAllCollections);
NFTRouter.get("/all", getAllNFTs);
NFTRouter.get("/collections/popular", getPopularCollections);
NFTRouter.get("/nft/:id", getNFTById);
NFTRouter.get("/owner", getNFTsByOwner);
NFTRouter.get("/creator", getNFTsByCreator);
NFTRouter.get("/listing/:tokenId", getListingDetails);
NFTRouter.get("/royalties/summary", getRoyaltiesSummary);
NFTRouter.get("/platform/revenue", getPlatformRevenue);

// ======================
// ADMIN ROUTES (Admin Role Required)
// ======================
NFTRouter.post(
  "/admin/collection/create",
  uploadTemp.single("image"),
  createCollection
);

NFTRouter.put(
  "/collection/update/:id",
 uploadTemp.single("image"),
  updateCollection
);

NFTRouter.delete(
  "/collection/delete/:id",
  deleteCollection
);

NFTRouter.get("/dashboard/total-counts", getTotalCounts);

NFTRouter.put("/admin/status/:id", authMiddleware("admin"), updateNFTStatus);

// ======================
// USER ROUTES (User Auth Required)
// ======================
NFTRouter.post(
  "/collection/create",
  authMiddleware("user"), // User only
  uploadTemp.single("image"),
  createCollection
);

NFTRouter.get(
  "/user/collection/get/:id",
  getSingleCollection
);

NFTRouter.get(
  "/user/collection/get/:id",
  authMiddleware("user"),
  getSingleCollection
);

NFTRouter.put(
  "/user/collection/update/:id",
  authMiddleware("user"),
  uploadTemp.single("image"),
  updateCollection
);

NFTRouter.delete(
  "/user/collection/delete/:id",
  authMiddleware("user"),
  deleteCollection
);

NFTRouter.put("/status/:id", updateNFTStatus);
// ======================
// AUTHENTICATED ROUTES (Any logged-in user)
// ======================
NFTRouter.post("/mint", authMiddleware(), serverMint);
NFTRouter.post("/listing/create", authMiddleware(), createListing);
NFTRouter.post("/sale/record", authMiddleware(), recordOnchainSale);

export default NFTRouter;
