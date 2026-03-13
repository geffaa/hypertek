import fs from "fs";
import path from "path";
import News from "../Models/News.js";
import { cloudinary as getCloudinary, isCloudinaryEnabled as getIsCloudinaryEnabled } from "../Config/cloudinary.js";

// Helper: upload file to Cloudinary and delete temp file
async function uploadToCloudinary(filePath) {
  try {
    const result = await getCloudinary().uploader.upload(filePath, {
      folder: "hyper-tek/news",
      transformation: [
        { width: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
    return result.secure_url;
  } finally {
    fs.unlink(filePath, () => {});
  }
}

// Helper: delete image from Cloudinary by URL
function deleteFromCloudinary(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("http")) return;
  try {
    // Extract public_id from Cloudinary URL
    const parts = imageUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return;
    // Skip version segment (v1234567) if present
    const afterUpload = parts.slice(uploadIndex + 1);
    const startIndex = afterUpload[0]?.match(/^v\d+$/) ? 1 : 0;
    const publicIdWithExt = afterUpload.slice(startIndex).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
    getCloudinary().uploader.destroy(publicId, () => {});
  } catch (_) {}
}

// ✅ CREATE NEWS
export const createNews = async (req, res) => {
  try {
    const { heading, description } = req.body;

    if (!heading || !description || !req.file) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: "Heading, description & image are required",
      });
    }

    let imageUrl;
    if (getIsCloudinaryEnabled()) {
      imageUrl = await uploadToCloudinary(req.file.path);
    } else {
      // Fallback: local storage
      const finalDir = path.join(process.cwd(), "uploads", "news");
      if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
      fs.renameSync(req.file.path, path.join(finalDir, req.file.filename));
      imageUrl = `/uploads/news/${req.file.filename}`;
    }

    const news = await News.create({
      heading,
      description,
      image: imageUrl,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });
  } catch (error) {
    console.log("Create News Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET ONLY ACTIVE NEWS (FOR WEBSITE)
export const getAllNews = async (req, res) => {
  try {
    const news = await News.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ✅ GET ALL NEWS (ALL STATUS) - FOR ADMIN OR FULL LIST
export const getAllNewsAdminOrAll = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: news.length, data: news });
  } catch (error) {
    console.log("Get All News Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET ALL NEWS (FOR ADMIN PANEL)
export const getAllNewsForAdmin = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ✅ UPDATE NEWS CONTENT (EDIT)
export const editNews = async (req, res) => {
  try {
    const { heading, description } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: "News not found" });
    }

    if (req.file) {
      // Delete old image
      if (news.image?.startsWith("http")) {
        deleteFromCloudinary(news.image);
      } else if (news.image) {
        const oldPath = path.join(process.cwd(), news.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      if (getIsCloudinaryEnabled()) {
        news.image = await uploadToCloudinary(req.file.path);
      } else {
        const finalDir = path.join(process.cwd(), "uploads", "news");
        if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
        fs.renameSync(req.file.path, path.join(finalDir, req.file.filename));
        news.image = `/uploads/news/${req.file.filename}`;
      }
    }

    if (heading) news.heading = heading;
    if (description) news.description = description;

    await news.save();

    res.status(200).json({
      success: true,
      message: "News updated successfully",
      data: news,
    });
  } catch (error) {
    console.log("Edit News Error:", error);
    res.status(500).json({ success: false });
  }
};

// ✅ UPDATE STATUS (ACTIVE / INACTIVE)
export const updateNewsStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const news = await News.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    res.status(200).json({
      success: true,
      message: "News status updated successfully",
      data: news,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ✅ DELETE NEWS
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    if (news.image?.startsWith("http")) {
      deleteFromCloudinary(news.image);
    } else if (news.image) {
      const imagePath = path.join(process.cwd(), news.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
