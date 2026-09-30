/** Mounted at /api/v1/gmbb-claim — escrow config and the caller's own items, read-only. */
import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { GetClaimConfig, GetClaimableItems } from "../Controllers/GmbbClaimController.js";

const GmbbClaimRouter = express.Router();

GmbbClaimRouter.get("/config", GetClaimConfig);
GmbbClaimRouter.get("/items", authMiddleware(), GetClaimableItems);

export default GmbbClaimRouter;
