


import express from "express";
import bodyParser from "body-parser";

import { StripeWebhook } from "../Controllers/Stripewebhook.js";


const PaymentHook = express.Router();

PaymentHook.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  StripeWebhook
);
export { PaymentHook }