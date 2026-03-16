import express from "express";
import { getNft101Items } from "../Controllers/nft101Controller.js";

const router = express.Router();

router.get("/", getNft101Items);

export default router;
