import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // amount in smallest unit (e.g. cents, satoshis, etc.)
  amount: {
    type: Number,
    required: true,
  },

  currency: {
    type: String,
    default: "usd",
  },

  // STRIPE, PAYPAL, or CRYPTO
  provider: {
    type: String,
    enum: ["stripe", "paypal", "crypto"],
    required: true,
  },

  // unique transaction ID depending on provider
  transactionId: {
    type: String,
    required: true,
  },

  // Stripe: paymentIntentId
  // PayPal: orderID or captureID
  // Crypto: wallet hash or txHash
  referenceId: {
    type: String,
  },

  paymentMethod: {
    type: String, // e.g. 'card', 'BTC', 'ETH', 'PayPal Balance'
  },

  status: {
    type: String,
    enum: ["succeeded", "pending", "failed", "cancelled"],
    default: "pending",
  },

  
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


export const Payment = mongoose.model("Payment", PaymentSchema);
