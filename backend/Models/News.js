import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // ✅ BY DEFAULT ACTIVE
    },
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);
