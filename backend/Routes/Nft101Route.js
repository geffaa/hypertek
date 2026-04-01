import express from "express";
import { getNft101Items, getNft101ById } from "../Controllers/nft101Controller.js";

const router = express.Router();

router.get("/", getNft101Items);
router.get("/:id", getNft101ById);

export default router;
