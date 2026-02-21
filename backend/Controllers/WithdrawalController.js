import { Withdrawal } from "../Models/WithdrawalModel.js";
import User from "../Models/User.js";
import nodemailer from "nodemailer";

// ─── Email helper ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

const sendEmail = async (to, subject, html) => {
  if (!to) return;
  try {
    await transporter.sendMail({
      from: `"Hyper-Tek Games" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("❌ Withdrawal email error:", err.message);
  }
};

// ─── Create Withdrawal Request ─────────────────────────────────
export const createWithdrawal = async (req, res) => {
  try {
    const { userId, amount, type, recipientAddress, token, bankDetails, txHash } = req.body;

    if (!userId || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newWithdrawal = new Withdrawal({
      user: userId,
      amount,
      type,
      status: "pending",
      recipientAddress,
      token,
      bankDetails,
      txHash,
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

// ─── Get User's Withdrawals ────────────────────────────────────
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

// ─── Get All Withdrawals (Admin) ───────────────────────────────
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("user", "username Email FullName")
      .sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Get All Withdrawals Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Update Withdrawal Status (Admin) ─────────────────────────
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Use: pending | completed | rejected" });
    }

    const withdrawal = await Withdrawal.findById(id).populate("user", "Email FullName");
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    withdrawal.status = status;
    await withdrawal.save();

    // ── Notify user via email ──────────────────────────────────
    const userEmail = withdrawal.user?.Email;
    const userName = withdrawal.user?.FullName || "User";
    const statusLabels = {
      completed: "✅ Completed",
      rejected: "❌ Rejected",
      pending: "⏳ Pending",
    };
    const statusColors = {
      completed: "#22c55e",
      rejected: "#ef4444",
      pending: "#f59e0b",
    };

    if (userEmail) {
      await sendEmail(
        userEmail,
        `Withdrawal ${statusLabels[status]} — Hyper-Tek Games`,
        `
        <div style="font-family:Arial,sans-serif;background:#0f0f0f;padding:40px;">
          <div style="background:#1a1a1a;padding:30px;border-radius:12px;border:1px solid #333;max-width:480px;margin:auto;">
            <h2 style="color:#fff;margin-top:0;">Withdrawal Update</h2>
            <p style="color:#bbb;">Dear ${userName},</p>
            <p style="color:#bbb;">Your withdrawal request has been updated:</p>
            <div style="background:#111;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="margin:4px 0;color:#888;font-size:13px;">Amount</p>
              <p style="margin:4px 0;color:#fff;font-size:18px;font-weight:bold;">${withdrawal.amount} ${withdrawal.token || withdrawal.currency || "USD"}</p>
              <p style="margin:12px 0 4px;color:#888;font-size:13px;">Status</p>
              <p style="margin:4px 0;color:${statusColors[status]};font-size:16px;font-weight:bold;">${statusLabels[status]}</p>
            </div>
            ${status === "rejected" ? '<p style="color:#f87171;font-size:13px;">If you have questions, please contact support.</p>' : ""}
            <p style="color:#555;font-size:12px;margin-top:24px;">© ${new Date().getFullYear()} Hyper-Tek Games</p>
          </div>
        </div>
        `
      );
    }

    res.status(200).json({
      message: `Withdrawal status updated to '${status}'`,
      withdrawal,
    });
  } catch (error) {
    console.error("Update Withdrawal Status Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
