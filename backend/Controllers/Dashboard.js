import UserModel from "../Models/User.js";
import Activity from "../Models/ActivityModel.js";
import Marketplace from "../Models/MarketPlace.js";
import { Offer } from "../Models/Offer.js";
import LandSchema from "../Models/LandModel.js";
import { Payment } from "../Models/Payment.js";
import NFT from "../Models/NFTSystem.js";


// Helper: Build date filter
const buildMonthFilter = (month, year) => {
  if (!month || !year) return {}; // No filter → return all

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return { createdAt: { $gte: start, $lt: end } };
};

// ------------------ TOTAL USER COUNT ------------------
const GetTotalUsers = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = buildMonthFilter(month, year);

    const totalUsers = await UserModel.countDocuments(filter);

    const users = await UserModel.find(filter)
      .select("Email FullName createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      totalUsers,
      month,
      year,
      users,   // Ab yahan createdAt bhi aayega
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ------------------ TOTAL BUYERS ------------------
const getTotalBuyers = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = buildMonthFilter(month, year);

    // Count
    const totalBuyers = await Activity.countDocuments({
      buyer: { $exists: true, $ne: "" },
      ...filter,
    });

    // Full data with createdAt
    const buyers = await Activity.find({
      buyer: { $exists: true, $ne: "" },
      ...filter,
    })
      .select("buyer seller price createdAt itemType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalBuyers,
      month,
      year,
      buyers, // now createdAt included
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ------------------ TOTAL SELLERS ------------------
const getTotalSellers = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = buildMonthFilter(month, year);

    // Count only
    const totalSellers = await Activity.countDocuments({
      seller: { $exists: true, $ne: "" },
      ...filter,
    });

    // Fetch full seller records with date
    const sellers = await Activity.find({
      seller: { $exists: true, $ne: "" },
      ...filter,
    })
      .select("buyer seller price createdAt itemType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalSellers,
      month,
      year,
      sellers, // now date included
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ------------------ MARKETPLACE COUNT ------------------
const getTotalMarketplaceCount = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = buildMonthFilter(month, year);

    // Total Count
    const totalItems = await NFT.countDocuments(filter);

    // Full Data with createdAt
    const marketplaceItems = await NFT.find(filter)
      .select(`
        title
        serialNumber
        price
        userId
        createdAt
      `)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalItems,
      month,
      year,
      marketplaceItems, // Ab records + createdAt bhi aayega
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ------------------ TOTAL OFFERS ------------------
const getTotalOffers = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = buildMonthFilter(month, year);

    // Total Count
    const totalOffers = await Offer.countDocuments(filter);

    // Full Data with createdAt
    const offers = await Offer.find(filter)
      .select(`
        serialNumber
        gameTitle
        gameActualPrice
        offerPrice
        priceDuration
        userName
        userEmail
        ownerName
        ownerEmail
        requestStatus
        paymentStatus
        createdAt
      `)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalOffers,
      month,
      year,
      offers, // Ab createdAt bhi return hoga
    });

  } catch (error) {
    console.error("Error fetching total offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get total offer count",
    });
  }
};


// ------------------ COMBINED (LAND + MARKETPLACE) ------------------
const getCombinedCounts = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = buildMonthFilter(month, year);

    // Total Counts
    const landCount = await LandSchema.countDocuments(filter);
    const marketplaceCount = await NFT.countDocuments(filter);

    // Full Land Data with createdAt
    const lands = await LandSchema.find(filter)
      .select("title serialNumber price userId createdAt")
      .sort({ createdAt: -1 });

    // Full Marketplace Data with createdAt
    const marketplaceItems = await NFT.find(filter)
      .select("title serialNumber price userId createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      landCount,
      marketplaceCount,
      total: landCount + marketplaceCount,

      month,
      year,

      lands,              // Land ka full data with date
      marketplaceItems,  // Marketplace ka full data with date
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getPayments = async (req, res) => {
  try {
    const {
      userId,
      status,
      provider,
      gameId,
      productId,
      from,
      to,
      page = 1,
      limit = 20,
      month,
      year
    } = req.query;

    // Month/Year Filter (just like other APIs)
    const dateFilter = buildMonthFilter(month, year);

    const filter = { ...dateFilter };

    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    if (gameId) filter.gameId = gameId;
    if (productId) filter.productId = productId;

    // Date range filter (from / to)
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      month,
      year,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all Activities
const getTrades = async (req, res) => {
  try {
    const { month, year, from, to } = req.query;

    // Month / Year filter
    const dateFilter = buildMonthFilter(month, year);

    let filter = { ...dateFilter };

    // Date range filter (from / to)
    if (from || to) {
      filter.createdAt = {};

      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // Fetch records
    const trades = await Activity.find(filter)
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: trades.length,
      month,
      year,
      data: trades,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// const getPaymentById = async (req, res) => {
//   try {
//     const payment = await Payment.findById(req.params.id);

//     if (!payment) {
//       return res.status(404).json({ success: false, message: "Payment not found" });
//     }

//     res.status(200).json({ success: true, data: payment });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getPaymentsByUser = async (req, res) => {
//   try {
//     const payments = await Payment.find({ userId: req.params.userId })
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: payments.length,
//       data: payments,
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// ---------------- EXPORT EVERYTHING ----------------
export {
  GetTotalUsers,
  getTotalBuyers,
  getTotalSellers,
  getTotalMarketplaceCount,
  getTotalOffers,
  getCombinedCounts,
  getTrades,

  // Payment APIs
  getPayments,
  // getPaymentById,
  // getPaymentsByUser,
};
