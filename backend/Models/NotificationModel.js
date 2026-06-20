import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "purchase",    // someone bought your NFT
        "sale",        // you bought an NFT
        "offer",       // received an offer on your listing
        "offer_accepted", // your offer was accepted
        "bid",         // bid placed on your auction
        "auction_won", // you won an auction
        "auction_sold",// your auction item was sold
        "trade",       // trade request received
        "trade_accepted", // your trade was accepted
        "hb_credit",   // Hyper Bucks credited
        "withdrawal",  // withdrawal processed
        "kyc",         // KYC status update
        "system",      // general system message
      ],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    // Optional deep-link data
    link: { type: String, default: "" },
    // Extra payload (itemName, amount, etc.)
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Keep only last 100 notifications per user (TTL handled by app-level trim)
NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
