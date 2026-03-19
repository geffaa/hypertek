const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["trade", "quest"],
      required: true,
    },

    // Creator
    poster:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    posterWallet: { type: String, required: true },
    posterName:   { type: String, default: "Anonymous" },

    title:        { type: String, required: true },
    description:  { type: String, default: "" },

    // Trade: what they offer and what they want
    offering:     { type: String, default: "" }, // text description of items offered
    requesting:   { type: String, default: "" }, // text description of items wanted

    // Quest: reward amount in USDC
    reward:       { type: Number, default: 0 },

    // Optional image for the item being offered/quested
    image:        { type: String, default: "" },

    // Response
    acceptedBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acceptedByWallet: { type: String, default: null },

    status: {
      type: String,
      enum: ["open", "accepted", "completed", "cancelled", "expired"],
      default: "open",
    },

    expiresAt:    { type: Date },       // 30 days from creation per brief
    listingFee:   { type: Number, default: 2 }, // $2 / 500 HB per brief
    category:     { type: String, default: "" }, // optional category tag
  },
  { timestamps: true }
);

// Auto-set expiry 30 days from creation
tradeSchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("Trade", tradeSchema);
