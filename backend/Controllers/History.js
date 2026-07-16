

import { Payment } from "../Models/Payment.js";
import NFTSystem from "../Models/NFTSystem.js";

// 📘 Controller 1: Get Complete Payment History (admin)
export const getAllPaymentHistory = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search?.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [
        { gameTitle:     re },
        { transactionId: re },
        { provider:      re },
        { itemType:      re },
        { buyerWallet:   re },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Payment.countDocuments(filter);
    const payments = await Payment
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment history.",
      error: error.message,
    });
  }
};

// 📙 On-chain marketplace sales, flattened from NFTSystem salesHistory
// (both parent-level and per-subCollection records), newest first.
export const getMarketplaceSales = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const saleFields = {
      buyer: "$sale.buyer",
      seller: "$sale.seller",
      priceUSDC: "$sale.priceETH",
      royaltyPaid: "$sale.royaltyPaid",
      platformFee: "$sale.platformFee",
      sellerReceived: "$sale.sellerReceived",
      txHash: "$sale.txHash",
      isFirstSale: "$sale.isFirstSale",
      createdAt: "$sale.createdAt",
    };

    const parentSales = [
      { $unwind: "$salesHistory" },
      { $addFields: { sale: "$salesHistory" } },
      { $project: { _id: 0, itemName: "$name", collectionName: "$name", ...saleFields } },
    ];
    const subSales = [
      { $unwind: "$subCollections" },
      { $unwind: "$subCollections.salesHistory" },
      { $addFields: { sale: "$subCollections.salesHistory" } },
      { $project: { _id: 0, itemName: "$subCollections.name", collectionName: "$name", ...saleFields } },
    ];

    const [parents, subs] = await Promise.all([
      NFTSystem.aggregate(parentSales),
      NFTSystem.aggregate(subSales),
    ]);

    // Sub-collection sales are the canonical records; parent-level entries with
    // the same txHash are duplicates written by older flows.
    const seen = new Set();
    let sales = [...subs, ...parents].filter((s) => {
      if (s.txHash && seen.has(s.txHash)) return false;
      if (s.txHash) seen.add(s.txHash);
      return true;
    });

    if (search?.trim()) {
      const re = new RegExp(search.trim(), "i");
      sales = sales.filter((s) =>
        [s.itemName, s.collectionName, s.buyer, s.seller, s.txHash].some((v) => re.test(v || ""))
      );
    }

    sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = sales.length;
    const skip = (Number(page) - 1) * Number(limit);
    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: sales.slice(skip, skip + Number(limit)),
    });
  } catch (error) {
    console.error("Error fetching marketplace sales:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching marketplace sales.",
      error: error.message,
    });
  }
};

// 📗 Controller 2: Get Payment History by User ID
export const getPaymentHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const userPayments = await Payment.find({ userId })
   

    if (!userPayments.length) {
      return res
        .status(404)
        .json({ message: "No payments found for this user." });
    }

    res.status(200).json({
      success: true,
      total: userPayments.length,
      data: userPayments,
    });
  } catch (error) {
    console.error("Error fetching user payment history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user payment history.",
      error: error.message,
    });
  }
};
