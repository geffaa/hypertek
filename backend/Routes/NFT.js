import express from "express";
import {
  // Direct item create (single-step user flow)
  createItemDirect,

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
  getNFTsWithSubCollections,
  createSubCollectionListing,
  recordSubCollectionSale,
  cancelSubCollectionListing,
  getOwnedSubCollectionsOnly,
  getListedSubCollections,
  getDashboardStats,
  userUploadNFC,
  getUserTransactions,
  getSubCollectionPriceHistory,
  getSubCollectionById,
  finalizeByPaymentIntent,
} from "../Controllers/nftController.js";

import uploadTemp from "../Middleware/UploadMulter.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const NFTRouter = express.Router();

/* =====================================================
   PARENT COLLECTION ROUTES (NO AUTH)
===================================================== */

// Single-step: create NFT/NFC item — auto-creates parent collection per user+category
NFTRouter.post(
  "/item/create",
  authMiddleware,
  uploadTemp.single("image"),
  createItemDirect
);

NFTRouter.post(
  "/parent-collection/create",
  uploadTemp.single("image"),
  createParentCollection
);

NFTRouter.get("/parent-collections", getParentCollections);

NFTRouter.put(
  "/parent-collection/:id",
  uploadTemp.single("image"),
  updateCollection
);

NFTRouter.delete("/parent-collection/:id", deleteCollection);

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
// In your NFT routes file
NFTRouter.get("/dashboard/stats", getDashboardStats);
// NFTRouter.get("/contract-balances", getContractBalances); // REST view of contract escrow
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
NFTRouter.get("/user/owned-with-subs/:walletAddress", getNFTsWithSubCollections);

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

NFTRouter.get("/user/owned-subs-only/:walletAddress", getOwnedSubCollectionsOnly);

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
NFTRouter.post(
  "/sub-collection/listing/cancel",
  authMiddleware(),
  cancelSubCollectionListing
);
NFTRouter.post("/sub-collection/listing/create", authMiddleware(), createSubCollectionListing);
NFTRouter.post("/sub-collection/sale/record", authMiddleware(), recordSubCollectionSale);
NFTRouter.get(
  "/user/listed-subs/:walletAddress",
  authMiddleware(),
  getListedSubCollections
);

// User NFC upload (no mint, no license, no in-game bonus until Phase 3)
NFTRouter.post(
  "/user-upload",
  authMiddleware("user"),
  uploadTemp.single("image"),
  userUploadNFC
);

// User transaction history (buy/sell from salesHistory)
NFTRouter.get(
  "/user/transactions/:walletAddress",
  authMiddleware(),
  getUserTransactions
);

// NFT price history (public — needed on buy page)
NFTRouter.get("/sub-collection/:subId/price-history", getSubCollectionPriceHistory);

// Fetch a single sub-collection by ID (public — needed by MyOffers → Buy page navigation)
NFTRouter.get("/sub-collection/:subId", getSubCollectionById);

// Finalize NFT purchase directly from frontend after Stripe confirmPayment succeeds
// Backend re-verifies with Stripe before executing (safe even without webhook)
NFTRouter.post("/finalize-by-payment-intent", finalizeByPaymentIntent);

export default NFTRouter;
