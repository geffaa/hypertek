

import { Payment } from "../Models/Payment.js";

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
