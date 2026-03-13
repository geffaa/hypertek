import fs from "fs";
import SiteContent from "../Models/SiteContent.js";
import { cloudinary as getCloudinary, isCloudinaryEnabled as getIsCloudinaryEnabled } from "../Config/cloudinary.js";

/**
 * GET /api/v1/site-content
 * Public — returns all sections grouped by pageGroup
 */
export const getAllContent = async (req, res) => {
    try {
        const sections = await SiteContent.find().sort({ pageGroup: 1 });
        res.json({ success: true, sections });
    } catch (err) {
        console.error("getAllContent error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * GET /api/v1/site-content/:sectionKey
 * Public — returns a single section
 */
export const getSectionByKey = async (req, res) => {
    try {
        const section = await SiteContent.findOne({
            sectionKey: req.params.sectionKey,
        });
        if (!section) {
            return res.status(404).json({ success: false, error: "Section not found" });
        }
        res.json({ success: true, section });
    } catch (err) {
        console.error("getSectionByKey error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * GET /api/v1/site-content/page/:pageGroup
 * Public — returns all sections for a page (e.g. "home", "about")
 */
export const getSectionsByPage = async (req, res) => {
    try {
        const sections = await SiteContent.find({
            pageGroup: req.params.pageGroup,
        });
        res.json({ success: true, sections });
    } catch (err) {
        console.error("getSectionsByPage error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * PUT /api/v1/site-content/:sectionKey
 * Admin only — update fields for a section
 * 
 * Body: { fields: [ { key, value }, { key, value }, ... ] }
 * Only sends the fields that changed. Merges with existing.
 */
export const updateSection = async (req, res) => {
    try {
        const section = await SiteContent.findOne({
            sectionKey: req.params.sectionKey,
        });
        if (!section) {
            return res.status(404).json({ success: false, error: "Section not found" });
        }

        const updates = req.body.fields || [];

        for (const update of updates) {
            const existingField = section.fields.find((f) => f.key === update.key);
            if (existingField) {
                existingField.value = update.value;
            }
        }

        section.markModified("fields");
        await section.save();

        res.json({ success: true, section });
    } catch (err) {
        console.error("updateSection error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * POST /api/v1/site-content/:sectionKey/upload-image
 * Admin only — upload an image for a specific field
 * 
 * Form data: 
 *   - image: file
 *   - fieldKey: string (which field to update)
 * 
 * Uploads to Cloudinary with auto-resize (max 1200px width, quality auto)
 * Stores the URL in the field's value
 */
export const uploadSectionImage = async (req, res) => {
    try {
        if (!getIsCloudinaryEnabled()) {
            return res
                .status(500)
                .json({ success: false, error: "Cloudinary not configured" });
        }

        const { fieldKey } = req.body;
        if (!fieldKey) {
            return res
                .status(400)
                .json({ success: false, error: "fieldKey is required" });
        }

        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, error: "No image file provided" });
        }

        const section = await SiteContent.findOne({
            sectionKey: req.params.sectionKey,
        });
        if (!section) {
            return res.status(404).json({ success: false, error: "Section not found" });
        }

        // Upload to Cloudinary with auto transformation
        let result;
        try {
            result = await getCloudinary().uploader.upload(req.file.path, {
                folder: `hyper-tek/site-content/${req.params.sectionKey}`,
                transformation: [
                    { width: 1200, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                ],
            });
        } finally {
            // Always delete the temp file, even on Cloudinary error
            fs.unlink(req.file.path, () => {});
        }

        // Update field value with Cloudinary URL
        const field = section.fields.find((f) => f.key === fieldKey);
        if (!field) {
            return res
                .status(400)
                .json({ success: false, error: `Field "${fieldKey}" not found in section` });
        }

        field.value = result.secure_url;
        section.markModified("fields");
        await section.save();

        res.json({
            success: true,
            imageUrl: result.secure_url,
            section,
        });
    } catch (err) {
        console.error("uploadSectionImage error:", err);
        res.status(500).json({
            success: false,
            error: "Upload failed",
            // Expose real error in dev so it shows in the browser console
            ...(process.env.NODE_ENV !== "production" && { detail: err.message }),
        });
    }
};
