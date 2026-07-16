import { auth } from "../Middleware/userAuth.js"
import { authMiddleware } from "../Middleware/googleMiddle.js"

import express from "express";
import {
  getAllPaymentHistory,
  getPaymentHistoryByUserId,
  getMarketplaceSales,
} from "../Controllers/History.js"

const HistoryRoute = express.Router();

// Get all payments (admin)
HistoryRoute.get("/get-history", authMiddleware("admin"), getAllPaymentHistory);

// Get on-chain marketplace sales flattened from NFTSystem salesHistory (admin)
HistoryRoute.get("/marketplace-sales", authMiddleware("admin"), getMarketplaceSales);

// Get payments by user ID
HistoryRoute.get("/history/:userId",auth, getPaymentHistoryByUserId);

export default HistoryRoute;
