import express from "express";
import {
  createWithdrawal,
  getUserWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus,
} from "../Controllers/WithdrawalController.js";
import { auth } from "../Middleware/userAuth.js";
import { adminAuth } from "../Middleware/adminAuth.js";

const router = express.Router();

// User routes (require login)
router.post("/request", auth, createWithdrawal);
router.get("/history/:userId", auth, getUserWithdrawals);

// Admin-only routes
router.get("/all", adminAuth, getAllWithdrawals);
router.patch("/status/:id", adminAuth, updateWithdrawalStatus);

export default router;
