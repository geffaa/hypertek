import express from "express";
import {
    getAllContent,
    getSectionByKey,
    getSectionsByPage,
    updateSection,
    uploadSectionImage,
} from "../Controllers/SiteContentController.js";
import uploadTemp from "../Middleware/UploadMulter.js";

const ContentRoute = express.Router();

// PUBLIC — Get all site content
ContentRoute.get("/", getAllContent);

// PUBLIC — Get all sections for a page group (e.g. "home", "about")
ContentRoute.get("/page/:pageGroup", getSectionsByPage);

// PUBLIC — Get single section by key
ContentRoute.get("/:sectionKey", getSectionByKey);

// ADMIN — Update section text fields
ContentRoute.put("/:sectionKey", updateSection);

// ADMIN — Upload image for a section field
ContentRoute.post(
    "/:sectionKey/upload-image",
    (req, res, next) => {
        uploadTemp.single("image")(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message || "File upload error",
                });
            }
            next();
        });
    },
    uploadSectionImage
);

export default ContentRoute;
