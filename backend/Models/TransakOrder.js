import mongoose from "mongoose";

// TransakOrder — single source of truth for every Transak on/off-ramp order lifecycle.
// Decoupled from HBLedger: HB credit/debit entries reference a TransakOrder via hbLedgerId,
// but this table owns idempotency, reconciliation and audit for the fiat↔crypto rail.
//
// purpose:
//   BUY_USDC   — fiat → USDC delivered to the USER's own wallet (marketplace fund + HB top-up helper) (BUY)
//   HB_CASHOUT — HB debited → USDC sent to USER wallet → user off-ramps USDC → fiat (SELL)
const transakOrderSchema = new mongoose.Schema(
  {
    // Our own id, generated before opening the widget. Passed to Transak as partnerOrderId
    // and echoed back on every webhook/order lookup — the key we map events back on.
    partnerOrderId: { type: String, required: true, unique: true, index: true },
    // Transak's internal order id, learned from the first event/webhook that references us.
    transakOrderId: { type: String, index: true, sparse: true, unique: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: {
      type: String,
      enum: ["BUY_USDC", "HB_CASHOUT"],
      required: true,
    },
    side: { type: String, enum: ["BUY", "SELL"], required: true },

    // Where crypto is delivered (BUY) or sold from (SELL).
    walletAddress: { type: String, required: true },
    cryptoCurrency: { type: String, default: "USDC" },
    network: { type: String, default: "base" },
    expectedCryptoAmount: { type: Number }, // USDC we expect (informational; webhook uses actual)
    fiatAmount: { type: Number },
    fiatCurrency: { type: String, default: "USD" },

    // Internal status, mapped from Transak status. INITIATED = created locally, widget not done yet.
    status: {
      type: String,
      enum: ["INITIATED", "CREATED", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED", "EXPIRED"],
      default: "INITIATED",
      index: true,
    },

    transactionHash: { type: String }, // settlement tx (BUY) or the HB→USDC send tx (SELL leg 1)
    hbAmount: { type: Number },        // HB debited for HB_CASHOUT (BUY_USDC leaves HB untouched)
    hbLedgerId: { type: mongoose.Schema.Types.ObjectId, ref: "HBLedger" },

    rawLastEvent: { type: mongoose.Schema.Types.Mixed }, // last decoded webhook payload, for audit
  },
  { timestamps: true }
);

export default mongoose.models.TransakOrder || mongoose.model("TransakOrder", transakOrderSchema);
