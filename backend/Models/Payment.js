import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Game Information
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game", // Reference to your Game model if you have one
    required: false, // Make required if you always have a game
  },

  gameTitle: {
    type: String,
    required: true,
  },

  serialNumber: {
    type: String,
    required: false, // Can be generated after payment
    unique: true,
    sparse: true // Allows multiple null values
  },

  // Purchase Details
  itemType: {
    type: String,
    enum: ["game", "in_game_item", "subscription", "dlc", "other","land"],
    default: "game"
  },

  platform: {
    type: String,
    enum: ["pc", "playstation", "xbox", "nintendo", "mobile", "other"],
    default: "pc"
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
    enum: ["stripe", "paypal", "crypto","card"],
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
    enum: ["succeeded", "pending", "failed", "cancelled", "refunded"],
    default: "pending",
  },

  // Additional metadata for flexibility
  metadata: {
    type: Object,
    default: {}
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

// Update the updatedAt field before saving
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to generate serial number
PaymentSchema.statics.generateSerialNumber = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `GAME-${timestamp}-${random}`.toUpperCase();
};

export const Payment = mongoose.model("Payment", PaymentSchema);