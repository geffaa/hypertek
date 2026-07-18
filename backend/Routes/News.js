import express from "express";
import {
  createNews,
  getAllNews,
  deleteNews,
  editNews,
  updateNewsStatus,
  getAllNewsForAdmin,
} from "../Controllers/News.js";

import uploadTemp from "../Middleware/UploadMulter.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const News = express.Router();

// CREATE NEWS WITH IMAGE (admin only)
News.post("/create", authMiddleware("admin"), uploadTemp.single("image"), createNews);

// GET ALL NEWS (ACTIVE FOR WEBSITE)
News.get("/getNews", getAllNews);
News.get("/admin", authMiddleware("admin"), getAllNewsForAdmin);

// EDIT NEWS CONTENT (admin only)
News.put("/edit/:id", authMiddleware("admin"), uploadTemp.single("image"), editNews);

// UPDATE STATUS ONLY (admin only)
News.put("/update-status/:id", authMiddleware("admin"), updateNewsStatus);

// DELETE NEWS (admin only)
News.delete("/:id", authMiddleware("admin"), deleteNews);

export default News;
