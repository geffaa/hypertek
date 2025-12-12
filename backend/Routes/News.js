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

const News = express.Router();

// ✅ CREATE NEWS WITH IMAGE
News.post("/create", uploadTemp.single("image"), createNews);

// ✅ GET ALL NEWS (ACTIVE FOR WEBSITE)
News.get("/getNews", getAllNews);
News.get("/admin", getAllNewsForAdmin);

// ✅ EDIT NEWS CONTENT
News.put("/edit/:id", uploadTemp.single("image"), editNews);

// ✅ UPDATE STATUS ONLY
News.put("/update-status/:id", updateNewsStatus);

// ✅ DELETE NEWS
News.delete("/:id", deleteNews);

export default News;
