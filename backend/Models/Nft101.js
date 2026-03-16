import mongoose from "mongoose";

const nft101Schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },          // emoji, e.g. "🖼️"
    gradientFrom: { type: String, default: "#1a4fd6" },  // CSS hex color
    gradientTo:   { type: String, default: "#0e2d8a" },
    link: { type: String, default: "#" },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Nft101", nft101Schema);
