// routes/CryptoSaveRoute.js  
import express from "express";
import { cryptoWebhook } from "../Controllers/Crypto.js";

const CryptoSaveRoute = express.Router();

CryptoSaveRoute.post(
  "/crypto-webhook",
  express.raw({ type: "application/json" }),
  cryptoWebhook
);

export default CryptoSaveRoute;