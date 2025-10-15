// routes/CryptoSessionRoute.js
import express from "express";
import { createCryptoSession } from "../Controllers/Crypto.js";

const CryptoSessionRoute = express.Router();

CryptoSessionRoute.post("/create-crypto-session", createCryptoSession);

export default CryptoSessionRoute;