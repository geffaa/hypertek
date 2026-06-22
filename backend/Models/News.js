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

    excerpt: {
      type: String,
    },

    image: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    // Auto-translated versions keyed by locale code (e.g. "ko", "id", "ja")
    translations: {
      type: Map,
      of: new mongoose.Schema({
        heading:     { type: String },
        description: { type: String },
      }, { _id: false }),
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);
