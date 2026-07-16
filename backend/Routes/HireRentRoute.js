import express from "express";
import {
  getListings,
  getListing,
  createListing,
  rentItem,
  returnItem,
  cancelListing,
  getOwnerListings,
} from "../Controllers/HireRentController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const HireRentRouter = express.Router();

HireRentRouter.get("/",               getListings);
HireRentRouter.get("/:id",            getListing);
HireRentRouter.get("/owner/:wallet",  getOwnerListings);

HireRentRouter.post("/",              authMiddleware(), createListing);
HireRentRouter.post("/:id/rent",      authMiddleware(), rentItem);
HireRentRouter.put("/:id/return",     authMiddleware(), returnItem);
HireRentRouter.put("/:id/cancel",     authMiddleware(), cancelListing);

export default HireRentRouter;
