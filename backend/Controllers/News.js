import fs from "fs";
import path from "path";
import News from "../Models/News.js";

// ✅ CREATE NEWS
export const createNews = async (req, res) => {
  try {
    const { heading, description } = req.body;

    if (!heading || !description || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Heading, description & image are required",
      });
    }

    const finalDir = path.join(process.cwd(), "uploads", "news");

    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    const oldPath = req.file.path;
    const newPath = path.join(finalDir, req.file.filename);
    fs.renameSync(oldPath, newPath);

    const imagePath = `/uploads/temp/${req.file.filename}`;

    const news = await News.create({
      heading,
      description,
      image: imagePath,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });
  } catch (error) {
    console.log("Create News Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
    const news = await News.find().sort({ createdAt: -1 }); // find all, no filter
    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    console.log("Get All News Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
      return res.status(404).json({ success: false, message: "News not found" });
    }

    // Update image if new file uploaded
    if (req.file) {
      const oldImagePath = path.join(process.cwd(), news.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);

      const finalDir = path.join(process.cwd(), "uploads", "news");
      if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

      const newPath = path.join(finalDir, req.file.filename);
      fs.renameSync(req.file.path, newPath);

      news.image = `/uploads/news/${req.file.filename}`;
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

    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

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

    const imagePath = path.join(process.cwd(), news.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};


