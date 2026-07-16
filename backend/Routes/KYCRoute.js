import express from "express";
import { createVerificationSession, getKYCStatus } from "../Controllers/KYCController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/session", authMiddleware(), createVerificationSession);
router.get("/status", authMiddleware(), getKYCStatus);

export default router;
