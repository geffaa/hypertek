import Activity from "../Models/ActivityModel.js";


// =========================
// CREATE ACTIVITY
// =========================
const createActivity = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      buyer, 
      seller, 
      price, 
      time,
      itemType,   // <-- NEW
      itemId      // <-- NEW
    } = req.body;

    console.log("req.body:", req.body);

    const userId = req.user?.id || req.body.userId;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: "itemType and itemId are required (land/marketplace)"
      });
    }

    const activity = await Activity.create({
      userId,
      name,
      type,
      buyer,
      seller,
      price,
      time,
      itemType,
      itemId
    });

    res.status(201).json({ success: true, data: activity });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



// =========================
// GET ALL TRADES
// =========================
const getTrades = async (req, res) => {
  try {
    const trades = await Activity.find()
      .sort({ createdAt: -1 })
      .populate("itemId"); // auto-populate land or marketplace

    res.status(200).json({ success: true, data: trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// =========================
// GET TRADE BY USER ID
// =========================
const getTradeById = async (req, res) => {
  try {
    console.log("Requested user ID:", req.params.id);

    const trades = await Activity.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .populate("itemId"); // populate based on itemType

    if (!trades || trades.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trades found for this user"
      });
    }

    res.status(200).json({ success: true, data: trades });

  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// =========================
// UPDATE TRADE
// =========================
const updateTrade = async (req, res) => {
  try {
    const trade = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade not found" });
    }

    res.status(200).json({ success: true, data: trade });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



// =========================
// DELETE TRADE
// =========================
const deleteTrade = async (req, res) => {
  try {
    const trade = await Activity.findByIdAndDelete(req.params.id);

    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade not found" });
    }

    res.status(200).json({ success: true, message: "Trade deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// EXPORT
export { 
  createActivity, 
  getTrades, 
  getTradeById, 
  updateTrade, 
  deleteTrade 
};
