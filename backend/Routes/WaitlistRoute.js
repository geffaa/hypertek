import express from "express";
import {
  createWaitlistEntry,
  getWaitlistEntries,
  updateWaitlistRole,
  exportWaitlistCSV,
  sendWaitlistNotification,
} from "../Controllers/WaitlistController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const WaitlistRouter = express.Router();

// Public signup; everything else is admin-only.
WaitlistRouter.post("/", createWaitlistEntry);
WaitlistRouter.get("/", authMiddleware("admin"), getWaitlistEntries);
WaitlistRouter.get("/export/csv", authMiddleware("admin"), exportWaitlistCSV);
WaitlistRouter.post("/notify", authMiddleware("admin"), sendWaitlistNotification);
WaitlistRouter.patch("/:id/role", authMiddleware("admin"), updateWaitlistRole);

export default WaitlistRouter;
