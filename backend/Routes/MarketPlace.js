import express from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../Controllers/MarketPlace.js"
const router = express.Router();
router.post("/Market", createItem);
router.get("/getMarket", getItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
// :white_check_mark: Correct export (default)
export default router;