import express from "express";
import { getArtists, getArtist, createArtist, updateArtist, deleteArtist } from "../Controllers/ArtistController.js";
import { authMiddleware } from "../Middleware/googleMiddle.js";

const router = express.Router();

router.get("/",       authMiddleware("admin"), getArtists);
router.get("/:id",    authMiddleware("admin"), getArtist);
router.post("/",      authMiddleware("admin"), createArtist);
router.put("/:id",    authMiddleware("admin"), updateArtist);
router.delete("/:id", authMiddleware("admin"), deleteArtist);

export default router;
