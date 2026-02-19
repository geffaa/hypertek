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
    // Status removed as per request
    // For Crypto Withdrawals
    recipientAddress: {
      type: String,
    },
    token: {
        type: String, // USDC, ETH
    },
    // For Bank Withdrawals
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifsc: String,
    },
    txHash: {
        type: String, // For crypto txs
    }
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);
