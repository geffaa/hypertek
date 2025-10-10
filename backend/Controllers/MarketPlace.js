import Marketplace from "../Models/MarketPlace.js"



const createItem = async (req, res) => {
  try {
    const { title, serialNumber, price, userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const item = await Marketplace.create({
      title,
      serialNumber,
      price,
      userId,
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// :white_check_mark: Get all items
const getItems = async (req, res) => {
  try {
    const items = await Marketplace.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// :white_check_mark: Get single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Marketplace.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateItem = async (req, res) => {
  try {
    const { title, serialNumber, price, userId } = req.body;
    // You can optionally check if this item belongs to the same userId before updating
    const updatedItem = await Marketplace.findByIdAndUpdate(
      req.params.id,
      { title, serialNumber, price, userId },
      { new: true }
    );
    console.log("Updating item ID:", req.params.id);
    if (!updatedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// :white_check_mark: Delete item
const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Marketplace.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return res.status(404).json({ message: "Item not found" });
    res
      .status(200)
      .json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export { createItem, getItems, getItemById, updateItem, deleteItem }