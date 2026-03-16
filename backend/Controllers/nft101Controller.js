import Nft101 from "../Models/Nft101.js";

export const getNft101Items = async (req, res) => {
  try {
    const items = await Nft101.find({ status: "active" }).sort({ order: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
