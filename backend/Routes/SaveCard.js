import { SaveCardData } from "../Controllers/Card.js";
import express from "express";
import bodyParser from "body-parser";  // Add this

const SaveCardRoute = express.Router();

// Use raw body for Stripe webhook
SaveCardRoute.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  SaveCardData
);

export { SaveCardRoute };
