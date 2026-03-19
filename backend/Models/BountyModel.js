import mongoose from "mongoose";

const bountySchema = new mongoose.Schema(
  {
    // Who posted the bounty
    poster:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    posterWallet: { type: String, required: true },
    posterName:   { type: String, default: "Anonymous" },

    // Target info
    targetName:   { type: String, required: true },  // player IGN or wallet
    targetWallet: { type: String, default: "" },

    // Bounty details
    title:        { type: String, required: true },
    description:  { type: String, default: "" },
    image:        { type: String, default: "" },      // optional screenshot / evidence
    category:     { type: String, default: "" },      // e.g. "pvp", "raid", "intel"

    // Reward in USDC
    reward:       { type: Number, required: true, min: 0 },

    // Commission: 20% per brief
    commission:   { type: Number, default: 0.2 },

    // Fulfilment
    claimedBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    claimedByWallet: { type: String, default: null },
    claimedAt:       { type: Date, default: null },

    status: {
      type: String,
      enum: ["open", "claimed", "completed", "cancelled", "expired"],
      default: "open",
    },

    expiresAt: { type: Date },   // 30 days from creation
    listingFee: { type: Number, default: 2 },  // $2 per brief
  },
  { timestamps: true }
);

// Auto-set expiry 30 days from creation
bountySchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model("Bounty", bountySchema);
