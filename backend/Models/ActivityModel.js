import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["buy", "sell"],
    },

    buyer: {
      type: String,
      required: true,
    },

    seller: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    time: {
      type: Date,
      default: Date.now,
    },

    // ============================
    // 🔥 NEW IMPORTANT FIELDS
    // ============================

    itemType: {
      type: String,
      enum: ["land", "NFA"],
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
      // When itemType = "land" → ref: "Land"
      // When itemType = "marketplace" → ref: "Marketplace"
    }

  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
