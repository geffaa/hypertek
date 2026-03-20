import mongoose from "mongoose";

const buybackRequestSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userWallet:       { type: String, default: "" },
  parentId:         { type: String, required: true },
  subCollectionId:  { type: String, required: true },
  itemName:         { type: String, default: "" },
  collectionName:   { type: String, default: "" },
  minimumBuybackUSD: { type: Number, default: 0 },
  requestedAt:      { type: Date, default: Date.now },
  status:           { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  approvedAt:       { type: Date },
  rejectedAt:       { type: Date },
  txHash:           { type: String, default: "" },
  adminNote:        { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("BuybackRequest", buybackRequestSchema);
