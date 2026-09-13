/**
 * Public package-purchase routes — mounted at /api/v1/packages/purchase
 *
 * POST /                — create a purchase intent (gated: purchases still locked)
 * POST /:id/confirm-usdc — buyer submits their USDC tx hash, verified on-chain
 * GET  /:id              — check status of one purchase (own purchases only)
 */
import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { purchasesLocked } from "../Middleware/purchasesLocked.js";
import {
  CreatePackagePurchase,
  ConfirmPackageUsdcPurchase,
  GetPackagePurchase,
} from "../Controllers/PackagePurchaseController.js";

const PackagePurchaseRouter = express.Router();

PackagePurchaseRouter.post("/", authMiddleware(), purchasesLocked, CreatePackagePurchase);
PackagePurchaseRouter.post("/:id/confirm-usdc", authMiddleware(), purchasesLocked, ConfirmPackageUsdcPurchase);
PackagePurchaseRouter.get("/:id", authMiddleware(), GetPackagePurchase);

export default PackagePurchaseRouter;
