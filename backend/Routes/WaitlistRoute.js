import express from "express";
import { createWaitlistEntry, getWaitlistEntries } from "../Controllers/WaitlistController.js";

const WaitlistRouter = express.Router();

WaitlistRouter.post("/", createWaitlistEntry);
WaitlistRouter.get("/", getWaitlistEntries);

export default WaitlistRouter;
