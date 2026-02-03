import express from "express";
import {
  // Parent Collection Controllers
  createParentCollection,
  getParentCollections,

  // Sub-Collection Controllers
  addSubCollection,
  getSubCollections,
  updateSubCollection,
  deleteSubCollection,
  mintSubCollection,

  // Collection Controllers
  createCollection,
  getAllCollections,
  getSingleCollection,
  updateCollection,
  deleteCollection,

  // NFT + Marketplace Controllers
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
  cancelListing,
  getNFTsByWallet,
} from "../Controllers/nftController.js";

import uploadTemp from "../Middleware/UploadMulter.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const NFTRouter = express.Router();

/* =====================================================
   PARENT COLLECTION ROUTES (NO AUTH)
===================================================== */

NFTRouter.post(
  "/parent-collection/create",
  uploadTemp.single("image"),
  createParentCollection
);

NFTRouter.get("/parent-collections", getParentCollections);

/* =====================================================
   SUB COLLECTION ROUTES (NO AUTH)
===================================================== */

NFTRouter.post(
  "/parent-collection/:parentId/sub-collection",
  uploadTemp.single("image"),
  addSubCollection
);

NFTRouter.get(
  "/parent-collection/:parentId/sub-collections",
  getSubCollections
);

NFTRouter.put(
  "/parent-collection/:parentId/sub-collection/:subCollectionId",
  uploadTemp.single("image"),
  updateSubCollection
);

NFTRouter.delete(
  "/parent-collection/:parentId/sub-collection/:subCollectionId",
  deleteSubCollection
);

NFTRouter.post(
  "/sub-collection/mint",
  authMiddleware(), // logged in user still required
  mintSubCollection
);

/* =====================================================
   PUBLIC ROUTES
===================================================== */

NFTRouter.get("/collection/get", getAllCollections);
NFTRouter.get("/all", getAllNFTs);
NFTRouter.get("/collections/popular", getPopularCollections);

NFTRouter.get("/nft/:id", getNFTById);
NFTRouter.get("/owner", getNFTsByOwner);
NFTRouter.get("/creator", getNFTsByCreator);
NFTRouter.get("/listing/:tokenId", getListingDetails);

NFTRouter.get("/royalties/summary", getRoyaltiesSummary);
NFTRouter.get("/platform/revenue", getPlatformRevenue);

NFTRouter.get("/user/owned/:walletAddress", getNFTsByWallet);

/* =====================================================
   COLLECTION CRUD (NO ADMIN AUTH NOW)
===================================================== */

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

NFTRouter.put("/admin/status/:id", updateNFTStatus);

/* =====================================================
   USER COLLECTION ROUTES (OPTIONAL AUTH – kept same)
===================================================== */

NFTRouter.post(
  "/collection/create",
  authMiddleware("user"),
  uploadTemp.single("image"),
  createCollection
);

NFTRouter.get("/user/collection/get/:id", getSingleCollection);

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

/* =====================================================
   AUTHENTICATED MARKETPLACE ROUTES
===================================================== */

NFTRouter.post("/mint", authMiddleware(), serverMint);

NFTRouter.post("/listing/create", authMiddleware(), createListing);

NFTRouter.post("/sale/record", authMiddleware(), recordOnchainSale);

NFTRouter.post("/listing/cancel", authMiddleware(), cancelListing);

export default NFTRouter;
