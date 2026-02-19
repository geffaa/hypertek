import express from "express";
import { createWithdrawal, getUserWithdrawals, getAllWithdrawals } from "../Controllers/WithdrawalController.js";

const router = express.Router();

router.post("/request", createWithdrawal);
router.get("/history/:userId", getUserWithdrawals);
router.get("/all", getAllWithdrawals); // Protect this with Admin Middleware in production

export default router;
