import express from "express";
import { stripeWebhook } from "../Controllers/Stripe.js";

const StripSaveRoute = express.Router();

// Raw body parsing ONLY for webhook - make sure this is applied
StripSaveRoute.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    console.log("Webhook middleware hit - body type:", typeof req.body);
    console.log(
      "Webhook middleware hit - body is buffer:",
      Buffer.isBuffer(req.body)
    );
    console.log(
      "Webhook middleware hit - body is string:",
      typeof req.body === "string"
    );
    next();
  },
  stripeWebhook
);

export default StripSaveRoute;
