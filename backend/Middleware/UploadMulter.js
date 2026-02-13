import multer from "multer";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { cloudinary, isCloudinaryEnabled } from "../Config/cloudinary.js";

const require = createRequire(import.meta.url);
const CloudinaryStorage = require("multer-storage-cloudinary").CloudinaryStorage;

// Allow only image files
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const limits = { fileSize: 2 * 1024 * 1024 }; // 2MB

let storage;

if (isCloudinaryEnabled) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "hyper-tek",
      format: async (req, file) => {
        const ext = path.extname(file.originalname).slice(1) || "png";
        return ext === "jpg" ? "jpeg" : ext;
      },
      public_id: (req, file) => {
        const uid = req.user?.id || req.user?._id?.toString() || "guest";
        return `${uid}_${Date.now()}`;
      },
    },
  });
} else {
  const tempDir = path.join(process.cwd(), "uploads", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, tempDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${req.user?.id || req.user?._id?.toString() || "guest"}_${Date.now()}${ext}`;
      cb(null, uniqueName);
    },
  });
}

const uploadTemp = multer({
  storage,
  fileFilter,
  limits,
});

export default uploadTemp;

/**
 * Get image URL from req.file (works for both Cloudinary and local disk uploads)
 * @param {object} file - req.file from multer
 * @returns {string|null} URL or path to save in DB
 */
export function getUploadedImageUrl(file) {
  if (!file) return null;
  if (file.path && typeof file.path === "string" && file.path.startsWith("http"))
    return file.path;
  return `/uploads/temp/${file.filename}`;
}
