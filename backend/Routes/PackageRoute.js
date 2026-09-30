/** Public package browsing — mounted at /api/v1/packages */
import express from "express";
import { ListActivePackages, GetActivePackage } from "../Controllers/PackageController.js";

const PackageRouter = express.Router();

PackageRouter.get("/", ListActivePackages);
PackageRouter.get("/:idOrSlug", GetActivePackage);

export default PackageRouter;
