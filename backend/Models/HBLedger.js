import mongoose from "mongoose";

const hbLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["earn", "spend", "cashout", "admin_adjust", "prize"],
      required: true,
    },
    amount: { type: Number, required: true }, // positive=credit, negative=debit (in HB units)
    balanceAfter: { type: Number, required: true }, // HB balance after this tx
    description: String,
    reference: String, // game event ID, order ID, etc.
    // cashout-specific
    cashoutMethod: { type: String, enum: ["usdc", "bank"] },
    cashoutSpeed: { type: String, enum: ["standard", "instant"] }, // bank cashout speed (for retry)
    cashoutStatus: { type: String, enum: ["pending", "processing", "completed", "failed"] },
    cashoutTxHash: String,
    cashoutUSD: Number, // USD equivalent (amount / 250) — the HB peg value
    cashoutAUD: Number, // AUD actually paid for bank cashouts (USD converted at fxRate)
    fxRate: Number, // USD→AUD rate used for this cashout (bank only)
  },
  { timestamps: true }
);

export default mongoose.models.HBLedger || mongoose.model("HBLedger", hbLedgerSchema);
