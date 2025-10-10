
import Activity from "../Models/ActivityModel.js"
 const createActivity = async (req, res) => {
  try {
    const { name, type, buyer, seller, price, time } = req.body;
    console.log("req", req.body)
    const userId = req.user?.id || req.body.userId; // from auth middleware or body
    const activity = await Activity.create({
      userId,
      name,
      type,
      buyer,
      seller,
      price,
      time,
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Get all trades
 const getTrades = async (req, res) => {
  try {
    const trades = await Activity.find().sort({ createdAt: -1 });
    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get a trade by ID
const getTradeById = async (req, res) => {
  try {
    console.log("Requested user ID:", req.params.id);

    // Use .find() to get all activities for this user
    const trades = await Activity.find({ userId: req.params.id });

    if (!trades || trades.length === 0) {
      return res.status(404).json({ success: false, message: "No trades found for this user" });
    }

    res.status(200).json({ success: true, data: trades });
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a trade
 const updateTrade = async (req, res) => {
  try {
    const trade = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!trade) return res.status(404).json({ message: "Trade not found" });
    res.status(200).json(trade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Delete a trade
 const deleteTrade = async (req, res) => {
  try {
    const trade = await Activity.findByIdAndDelete(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found" });
    res.status(200).json({ message: "Trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export { createActivity, getTrades, getTradeById, updateTrade, deleteTrade };