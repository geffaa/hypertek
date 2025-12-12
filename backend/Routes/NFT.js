// Routes/NFTRoute.js - UPDATED WITH NEW ROUTES
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
} from "../Controllers/nftController.js";
import uploadTemp from "../Middleware/UploadMulter.js";
import { authMiddleware } from "../Middleware/userAuth.js";


const NFTRouter = express.Router();
// ======================
// COLLECTION CRUD
// ======================
NFTRouter.post(
  "/collection/create",
  uploadTemp.single("image"), // <-- multer middleware
  createCollection
);
NFTRouter.get("/collection/get", getAllCollections);
NFTRouter.get("/collection/get/:id", getSingleCollection);
NFTRouter.put(
  "/collection/update/:id",
  uploadTemp.single("image"), // <-- multer middleware
  updateCollection
);
NFTRouter.delete("/collection/delete/:id", deleteCollection);
NFTRouter.get("/all", getAllNFTs);
NFTRouter.put("/status/:id", updateNFTStatus);
NFTRouter.get("/collections/popular", getPopularCollections);


//User Dashboard Routes
NFTRouter.post(
  "/collection/create",
  uploadTemp.single("image"), 
  createCollection
);
NFTRouter.put(
  "/collection/update/:id",
  authMiddleware,
  uploadTemp.single("image"), 
  updateCollection
);
NFTRouter.delete("/collection/delete/:id", authMiddleware, deleteCollection);
NFTRouter.get("/collection/get/:id", authMiddleware, getSingleCollection);
NFTRouter.put("/status/:id", authMiddleware, updateNFTStatus);


// ======================
// NFT MINTING
// ======================
NFTRouter.post("/mint", serverMint);


// ======================
// NFT QUERIES
// ======================
NFTRouter.get("/nft/:id", getNFTById);  // Get NFT by MongoDB ID
NFTRouter.get("/owner", getNFTsByOwner);  // Get NFTs by owner wallet
NFTRouter.get("/creator", getNFTsByCreator);  // Get NFTs by creator wallet

// ======================
// MARKETPLACE
// ======================
NFTRouter.post("/listing/create", createListing);
NFTRouter.get("/listing/:tokenId", getListingDetails);  // Get listing by tokenId

// ======================
// SALES & ANALYTICS
// ======================
NFTRouter.post("/sale/record", recordOnchainSale);  // ⭐ Main endpoint for buy flow
NFTRouter.get("/royalties/summary", getRoyaltiesSummary);
NFTRouter.get("/platform/revenue", getPlatformRevenue);

export default NFTRouter;