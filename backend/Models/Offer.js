import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    // gameId stored as String (references NFT _id, not a separate Game collection)
    gameId: {
      type: String,
      required: true,
    },
    gameTitle: {
      type: String,
      required: true,
    },
    gameActualPrice: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
    },
    priceDuration: {
      type: String,
      required: true,
    },

    // Offer Creator Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },

    // Game/NFT Owner Info — ownerId can be a wallet address or "platform"
    ownerId: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      default: "Platform",
    },
    ownerEmail: {
      type: String,
      default: "",
    },

    requestStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    // Set when seller accepts — buyer has 48 h to complete payment
    acceptedAt:      { type: Date, default: null },
    acceptDeadlineAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Offer = mongoose.model("Offer", offerSchema);
