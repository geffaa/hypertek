import express from "express";
import { PayWithCard, SaveCardData } from "../Controllers/Card.js";
import bodyParser from "body-parser";

const CardRoute = express.Router();

// 1️⃣ Payment endpoint
CardRoute.post("/pay-with-card", bodyParser.json(), PayWithCard);


export { CardRoute };
