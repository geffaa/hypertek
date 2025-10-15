import { authMiddleware } from "../Middleware/userAuth.js"

import express from "express";
import {
  getAllPaymentHistory,
  getPaymentHistoryByUserId,
} from "../Controllers/History.js"

const HistoryRoute = express.Router();

// Get all payments (admin)
HistoryRoute.get("/get-history", getAllPaymentHistory);

// Get payments by user ID
HistoryRoute.get("/history/:userId",authMiddleware, getPaymentHistoryByUserId);

export default HistoryRoute;
