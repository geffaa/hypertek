import Nft101 from "../Models/Nft101.js";

export const getNft101Items = async (req, res) => {
  try {
    const items = await Nft101.find({ status: "active" }).sort({ order: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNft101ById = async (req, res) => {
  try {
    const item = await Nft101.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
