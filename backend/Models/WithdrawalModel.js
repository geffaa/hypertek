import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["crypto", "bank"],
      required: true,
    },
    // Withdrawal status (mainly for bank withdrawals tracked by admin)
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    // For Crypto Withdrawals
    recipientAddress: {
      type: String,
    },
    token: {
      type: String, // USDC, ETH
    },
    // For Bank Withdrawals
    bankDetails: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      iban: String,       // IBAN (international)
      swift: String,      // SWIFT / BIC code
      ifsc: String,       // IFSC (India)
      country: String,
    },
    currency: {
      type: String,       // e.g. USD, EUR, PKR
      default: "USD",
    },
    txHash: {
      type: String,       // For crypto txs
    },
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);
