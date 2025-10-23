import express from "express";
import { StripeWebhook } from "../Controllers/Stripewebhook.js";

const PaymentHook = express.Router();

// Remove bodyParser from here since we're applying it in index.js
PaymentHook.post("/webhook", StripeWebhook);

export { PaymentHook };