import express from "express";
import { ConnectStripe , SaveStripePayment } from "../Controllers/Stripe.js";

const StripRoute = express.Router();

StripRoute.post("/create-payment", ConnectStripe);
StripRoute.post("/payment-success", SaveStripePayment);


export default StripRoute;
