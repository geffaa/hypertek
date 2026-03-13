import express from "express";
import {
  createWaitlistEntry,
  getWaitlistEntries,
  updateWaitlistRole,
  exportWaitlistCSV,
  sendWaitlistNotification,
} from "../Controllers/WaitlistController.js";

const WaitlistRouter = express.Router();

WaitlistRouter.post("/", createWaitlistEntry);
WaitlistRouter.get("/", getWaitlistEntries);
WaitlistRouter.get("/export/csv", exportWaitlistCSV);
WaitlistRouter.post("/notify", sendWaitlistNotification);
WaitlistRouter.patch("/:id/role", updateWaitlistRole);

export default WaitlistRouter;
