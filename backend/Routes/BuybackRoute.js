import express from "express";
import { submitBuybackRequest, getBuybackRequests, approveBuybackRequest, rejectBuybackRequest } from "../Controllers/BuybackController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const BuybackRouter = express.Router();

BuybackRouter.post("/request", authMiddleware("user"), submitBuybackRequest);
BuybackRouter.get("/admin/requests", authMiddleware("admin"), getBuybackRequests);
BuybackRouter.put("/admin/requests/:id/approve", authMiddleware("admin"), approveBuybackRequest);
BuybackRouter.put("/admin/requests/:id/reject", authMiddleware("admin"), rejectBuybackRequest);

export default BuybackRouter;
