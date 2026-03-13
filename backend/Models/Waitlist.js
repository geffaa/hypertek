import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, trim: true, lowercase: true },
    excitement:   { type: String, trim: true },
    interest:     { type: String, trim: true },
    mustPlay:     { type: String, trim: true },
    crowdfunding: { type: String, enum: ["Yes", "No"] },
    role: { type: String, enum: ["standard", "early_access", "investor", "crowdfund"], default: "standard" },
  },
  { timestamps: true }
);

const Waitlist = mongoose.model("Waitlist", waitlistSchema);
export default Waitlist;
