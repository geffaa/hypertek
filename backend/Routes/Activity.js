import express from "express";
import {
  createActivity,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
} from "../Controllers/Activity.js";

// ✅ Typo fixed: should be Router(), not Rotuer()
const ActivityRouter = express.Router();

// ✅ Static routes first
ActivityRouter.post("/AddActivity", createActivity);
ActivityRouter.get("/getActivity", getTrades);

// ✅ Dynamic routes last
ActivityRouter.get("/:id", getTradeById);
ActivityRouter.put("/:id", updateTrade);
ActivityRouter.delete("/:id", deleteTrade);

export default ActivityRouter;
