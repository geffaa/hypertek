

// routes/paymentRoutes.js
import express from "express";
import { checkPayment } from "../Controllers/PaymentChecking.js";

const PcheckingRoute = express.Router();

PcheckingRoute.post("/create", checkPayment);

export { PcheckingRoute};
