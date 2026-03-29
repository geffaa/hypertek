import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      required: true,
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

    itemType: {
      type: String,
      default: "NFA",
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    }

  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
