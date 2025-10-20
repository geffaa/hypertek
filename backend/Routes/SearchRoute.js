


import express from "express";
import { searchByTitle, getItemById } from "../Controllers/searchController.js";

const searchRouter = express.Router();

searchRouter.get("/search", searchByTitle);
searchRouter.get("/item/:id", getItemById);

export { searchRouter };
