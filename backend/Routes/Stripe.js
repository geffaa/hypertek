import express from "express";
import { createCheckoutSession, stripeWebhook } from "../Controllers/Stripe.js";

const StripRoute = express.Router();

// Normal JSON parsing for checkout session
StripRoute.post("/create-checkout-session", createCheckoutSession);



export default StripRoute;