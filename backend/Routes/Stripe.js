import express from "express";
import { createCheckoutSession , stripeWebhook } from "../Controllers/Stripe.js";

const StripRoute = express.Router();

StripRoute.post("/create-checkout-session", createCheckoutSession);
StripRoute.post("/webhook", stripeWebhook);


export default StripRoute;
