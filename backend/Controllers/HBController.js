import User from "../Models/User.js";
import HBLedger from "../Models/HBLedger.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "./Config/.env" });

// HB conversion constant
const HB_TO_USD = 250; // 250 HB = $1 USD
const MIN_USDC_CASHOUT_HB = 250; // $1 minimum for USDC cashout
const MIN_BANK_CASHOUT_HB = 2500; // $10 minimum for bank cashout

// ------------------ SMTP TRANSPORTER ------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS?.replace(/"/g, ""),
  },
});

// ------------------ EARN HB ------------------
// POST /api/v1/hb/earn
// Body: { userId, amount, description, reference }
// Called by game server (no auth — internal)
export async function earnHB(req, res) {
  try {
    const { userId, amount, description, reference } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and a positive amount are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.hyperBucks = (user.hyperBucks || 0) + amount;
    await user.save();

    const ledgerEntry = await HBLedger.create({
      userId,
      type: "earn",
      amount,
      balanceAfter: user.hyperBucks,
      description: description || "HB earned",
      reference,
    });

    return res.status(200).json({
      success: true,
      newBalance: user.hyperBucks,
      ledgerEntry,
    });
  } catch (error) {
    console.error("earnHB error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ SPEND HB ------------------
// POST /api/v1/hb/spend
// Body: { userId, amount, description, reference }
// Called by marketplace (no auth — internal)
export async function spendHB(req, res) {
  try {
    const { userId, amount, description, reference } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and a positive amount are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentBalance = user.hyperBucks || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        error: "Insufficient HB balance",
        balance: currentBalance,
        required: amount,
      });
    }

    user.hyperBucks = currentBalance - amount;
    await user.save();

    const ledgerEntry = await HBLedger.create({
      userId,
      type: "spend",
      amount: -amount, // negative = debit
      balanceAfter: user.hyperBucks,
      description: description || "HB spent",
      reference,
    });

    return res.status(200).json({
      success: true,
      newBalance: user.hyperBucks,
      ledgerEntry,
    });
  } catch (error) {
    console.error("spendHB error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ CASHOUT HB ------------------
// POST /api/v1/hb/cashout
// Auth required. Body: { amount (in HB), method ("usdc"|"bank") }
// NOTE: Actual USDC on-chain transfer is Phase 2. For now: create pending record + send admin notification.
export async function cashoutHB(req, res) {
  try {
    const userId = req.user._id;
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    if (!["usdc", "bank"].includes(method)) {
      return res.status(400).json({ error: 'Method must be "usdc" or "bank"' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentBalance = user.hyperBucks || 0;

    // Validate balance
    if (currentBalance < amount) {
      return res.status(400).json({
        error: "Insufficient HB balance",
        balance: currentBalance,
        required: amount,
      });
    }

    // Validate minimums
    if (method === "usdc" && amount < MIN_USDC_CASHOUT_HB) {
      return res.status(400).json({
        error: `Minimum USDC cashout is ${MIN_USDC_CASHOUT_HB} HB ($${MIN_USDC_CASHOUT_HB / HB_TO_USD})`,
      });
    }

    if (method === "bank") {
      if (amount < MIN_BANK_CASHOUT_HB) {
        return res.status(400).json({
          error: `Minimum bank cashout is ${MIN_BANK_CASHOUT_HB} HB ($${MIN_BANK_CASHOUT_HB / HB_TO_USD})`,
        });
      }
      if (!user.bankDetails?.verified) {
        return res.status(400).json({
          error: "Bank details not verified. Please add and verify your bank details first.",
        });
      }
    }

    const usdAmount = parseFloat((amount / HB_TO_USD).toFixed(2));

    // Debit HB from user
    user.hyperBucks = currentBalance - amount;
    await user.save();

    // Create pending ledger entry
    const ledgerEntry = await HBLedger.create({
      userId,
      type: "cashout",
      amount: -amount, // negative = debit
      balanceAfter: user.hyperBucks,
      description: `HB cashout via ${method.toUpperCase()}`,
      cashoutMethod: method,
      cashoutStatus: "pending",
      cashoutUSD: usdAmount,
    });

    // Send admin notification email (Phase 1: manual processing)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.SMTP_EMAIL;
    if (adminEmail) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER || process.env.SMTP_EMAIL,
          to: adminEmail,
          subject: `[HyperTek] HB Cashout Request — $${usdAmount} USD via ${method.toUpperCase()}`,
          html: `
            <h2>Hyper Bucks Cashout Request</h2>
            <table>
              <tr><td><strong>User ID:</strong></td><td>${userId}</td></tr>
              <tr><td><strong>User Email:</strong></td><td>${user.Email || "N/A"}</td></tr>
              <tr><td><strong>HB Amount:</strong></td><td>${amount} HB</td></tr>
              <tr><td><strong>USD Equivalent:</strong></td><td>$${usdAmount}</td></tr>
              <tr><td><strong>Method:</strong></td><td>${method.toUpperCase()}</td></tr>
              <tr><td><strong>Ledger Entry ID:</strong></td><td>${ledgerEntry._id}</td></tr>
              <tr><td><strong>Status:</strong></td><td>PENDING — requires Phase 2 automation</td></tr>
              ${method === "bank" ? `
              <tr><td><strong>Bank Name:</strong></td><td>${user.bankDetails?.bankName || "N/A"}</td></tr>
              <tr><td><strong>Account Holder:</strong></td><td>${user.bankDetails?.accountHolderName || "N/A"}</td></tr>
              <tr><td><strong>Account Number:</strong></td><td>***${user.bankDetails?.accountNumber?.slice(-4) || "N/A"}</td></tr>
              ` : ""}
            </table>
            <p><em>Phase 2: Automated USDC on-chain transfer pending platform wallet integration.</em></p>
          `,
        });
      } catch (emailErr) {
        console.error("Admin notification email failed:", emailErr.message);
        // Non-fatal — cashout record is still created
      }
    }

    return res.status(200).json({
      success: true,
      ledgerEntry,
      usdAmount,
      newBalance: user.hyperBucks,
      message: `Cashout request of ${amount} HB ($${usdAmount}) submitted. Processing is pending.`,
    });
  } catch (error) {
    console.error("cashoutHB error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ GET HB BALANCE ------------------
// GET /api/v1/hb/balance
// Auth required.
export async function getHBBalance(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("hyperBucks");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hyperBucks = user.hyperBucks || 0;
    const usdEquivalent = parseFloat((hyperBucks / HB_TO_USD).toFixed(2));

    return res.status(200).json({
      success: true,
      hyperBucks,
      usdEquivalent,
    });
  } catch (error) {
    console.error("getHBBalance error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ GET HB HISTORY ------------------
// GET /api/v1/hb/history
// Auth required. Query params: page, limit
export async function getHBHistory(req, res) {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      HBLedger.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HBLedger.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getHBHistory error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// ------------------ SAVE BANK DETAILS ------------------
// PUT /api/v1/hb/bank-details
// Auth required. Body: { accountHolderName, bankName, accountNumber, iban, swift, routingNumber, country, currency }
// NOTE: $0 test deposit verification is Phase 2. For now: save details and set verified: false (admin verifies manually).
export async function saveBankDetails(req, res) {
  try {
    const userId = req.user._id;
    const {
      accountHolderName,
      bankName,
      accountNumber,
      iban,
      swift,
      routingNumber,
      country,
      currency,
    } = req.body;

    if (!accountHolderName || !bankName || !accountNumber) {
      return res.status(400).json({
        error: "accountHolderName, bankName, and accountNumber are required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        bankDetails: {
          accountHolderName,
          bankName,
          accountNumber,
          iban: iban || "",
          swift: swift || "",
          routingNumber: routingNumber || "",
          country: country || "",
          currency: currency || "USD",
          verified: false, // Phase 2: $0 test deposit verification
        },
      },
      { new: true, select: "bankDetails" }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Bank details saved. Verification is pending (admin will verify manually).",
      bankDetails: user.bankDetails,
    });
  } catch (error) {
    console.error("saveBankDetails error:", error);
    return res.status(500).json({ error: error.message });
  }
}
