import express from "express";
import {
  getBounties,
  getBounty,
  createBounty,
  claimBounty,
  completeBounty,
  cancelBounty,
  getPosterBounties,
} from "../Controllers/BountyController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const BountyRouter = express.Router();

BountyRouter.get("/",               getBounties);
BountyRouter.get("/:id",            getBounty);
BountyRouter.get("/poster/:wallet", getPosterBounties);

BountyRouter.post("/",              authMiddleware(), createBounty);
BountyRouter.post("/:id/claim",     authMiddleware(), claimBounty);
BountyRouter.put("/:id/complete",   authMiddleware(), completeBounty);
BountyRouter.put("/:id/cancel",     authMiddleware(), cancelBounty);

export default BountyRouter;
