import express from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../Controllers/MarketPlace.js";

const router = express.Router();

// Static routes first (important order)
router.post("/create", createItem);
router.get("/getMarket", getItems);

// Dynamic routes last (so they don't capture 'getMarket')
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
