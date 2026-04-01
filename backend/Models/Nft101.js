import mongoose from "mongoose";

const nft101Schema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: "" },          // short summary shown on card
    body:         [{ type: String }],                     // legacy flat paragraphs
    sections:     [{                                       // structured sub-headings
      heading:    { type: String, required: true },
      paragraphs: [{ type: String }],
    }],
    contentBlocks: [{                                      // rich article content
      type:    { type: String, enum: ["heading", "text", "image"], required: true },
      value:   { type: String, required: true },           // text content or image URL
      caption: { type: String, default: "" },              // optional image caption
    }],
    image:        { type: String, default: "" },          // cover image URL
    category:     { type: String, default: "Basics" },    // e.g. Basics, Security, HyperTek, Blockchain
    readTime:     { type: Number, default: 3 },           // estimated minutes
    icon:         { type: String, default: "" },
    gradientFrom: { type: String, default: "#1a4fd6" },
    gradientTo:   { type: String, default: "#0e2d8a" },
    link:         { type: String, default: "#" },
    order:        { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Nft101", nft101Schema);
