import express from "express";
import { createCheckoutSession, stripeWebhook } from "../Controllers/Stripe.js";

const StripRoute = express.Router();

// Use express.raw() **only for webhook**, not for normal checkout session
StripRoute.post("/create-checkout-session", createCheckoutSession);

// Stripe webhook requires raw body
StripRoute.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default StripRoute;
