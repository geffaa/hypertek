const mongoose = require("mongoose");

// Duration options per Don's brief: 8h, 1d, 3d, 1w, max 1 month
const VALID_DURATIONS = [8, 24, 72, 168, 720]; // hours

const hireRentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hire", "rent"], // hire = hire a specialist, rent = rent an item
      required: true,
    },

    // Item / specialist being listed
    itemTitle:       { type: String, required: true },
    itemDescription: { type: String, default: "" },
    image:           { type: String, default: "" },
    category:        { type: String, default: "" }, // e.g. "specialists"

    // Owner (lister)
    owner:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerWallet:     { type: String, required: true },
    ownerName:       { type: String, default: "Anonymous" },

    // NFT reference (optional — links to actual asset)
    nftSystemId:     { type: mongoose.Schema.Types.ObjectId, ref: "NFTSystem", default: null },
    subCollectionId: { type: String, default: null },

    // Pricing per duration
    pricePerDuration: { type: Number, required: true, min: 0 }, // USDC
    durationHours: {
      type: Number,
      enum: VALID_DURATIONS,
      required: true,
    },

    // Rental period (filled when rented)
    renter:          { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    renterWallet:    { type: String, default: null },
    startTime:       { type: Date, default: null },
    endTime:         { type: Date, default: null },

    // Cooldown: cannot be re-rented for 2× duration after return
    cooldownUntil:   { type: Date, default: null },

    // Commission: 20% per brief
    commission:      { type: Number, default: 0.2 },

    status: {
      type: String,
      enum: ["available", "rented", "cooldown", "completed", "cancelled"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HireRent", hireRentSchema);
