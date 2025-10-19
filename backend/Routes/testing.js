import { createUnifiedCheckoutSession } from "../Controllers/testing.js"


// routes/unifiedPayment.js
import express from "express";

const unifiedPaymentRoute = express.Router();

// Unified payment session creation
unifiedPaymentRoute.post("/create-payment-session", createUnifiedCheckoutSession);

export { unifiedPaymentRoute};