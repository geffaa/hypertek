import express from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../Controllers/LandController.js";

const Landrouter = express.Router();

// Static routes first
Landrouter.post("/Land", createItem);
Landrouter.get("/getLand", getItems);

// Dynamic routes last
Landrouter.get("/:id", getItemById);
Landrouter.put("/:id", updateItem);
Landrouter.delete("/:id", deleteItem);

export default Landrouter;
