import mongoose from "mongoose";
const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // or String if you're not using Mongo _id
      ref: "User", // reference to User model (optional but recommended)
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
      enum: ["buy", "sell"], // restrict allowed values
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
  },
  { timestamps: true }
);
const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
