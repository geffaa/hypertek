import { Withdrawal } from "../Models/WithdrawalModel.js";
import User from "../Models/User.js"; // Corrected default import

export const createWithdrawal = async (req, res) => {
  try {
    const { userId, amount, type, recipientAddress, token, bankDetails, txHash } = req.body;

    if (!userId || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Optional: Check user balance here if stored in DB
    // const user = await User.findById(userId);
    // if (!user) return res.status(404).json({ error: "User not found" });

    const newWithdrawal = new Withdrawal({
      user: userId,
      amount,
      type,
      // status: "pending", // Removed
      recipientAddress,
      token,
      bankDetails,
      txHash
    });

    await newWithdrawal.save();

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal: newWithdrawal,
    });
  } catch (error) {
    console.error("Create Withdrawal Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserWithdrawals = async (req, res) => {
    try {
        const { userId } = req.params;
        const withdrawals = await Withdrawal.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        console.error("Get Withdrawals Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAllWithdrawals = async (req, res) => {
    try {
        // For Admin
        const withdrawals = await Withdrawal.find().populate("user", "username email").sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        console.error("Get All Withdrawals Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
