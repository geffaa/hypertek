/**
 * Public package-purchase routes — mounted at /api/v1/packages/purchase
 *
 * POST /          — create a purchase intent (gated: purchases still locked)
 * GET  /:id       — check status of one purchase (own purchases only)
 */
import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { purchasesLocked } from "../Middleware/purchasesLocked.js";
import { CreatePackagePurchase, GetPackagePurchase } from "../Controllers/PackagePurchaseController.js";

const PackagePurchaseRouter = express.Router();

PackagePurchaseRouter.post("/", authMiddleware(), purchasesLocked, CreatePackagePurchase);
PackagePurchaseRouter.get("/:id", authMiddleware(), GetPackagePurchase);

export default PackagePurchaseRouter;
