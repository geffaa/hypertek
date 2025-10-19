import express from "express";
import bodyParser from "body-parser";

import { CreatePaymentIntent } from "../Controllers/create-payment-intent.js"
import { StripeWebhook } from "../Controllers/Stripewebhook.js";


const PaymentRotue = express.Router();

PaymentRotue.post("/create-payment-intent",CreatePaymentIntent);
PaymentRotue.post(
  "/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  StripeWebhook
);
export { PaymentRotue }