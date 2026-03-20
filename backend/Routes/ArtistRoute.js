import express from "express";
import { getArtists, getArtist, createArtist, updateArtist, deleteArtist } from "../Controllers/ArtistController.js";
import { adminAuth } from "../Middleware/adminAuth.js";

const router = express.Router();

router.get("/",       adminAuth, getArtists);
router.get("/:id",    adminAuth, getArtist);
router.post("/",      adminAuth, createArtist);
router.put("/:id",    adminAuth, updateArtist);
router.delete("/:id", adminAuth, deleteArtist);

export default router;
