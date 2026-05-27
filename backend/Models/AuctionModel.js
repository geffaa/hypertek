import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  bidder:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bidderWallet:  { type: String },
  bidderName:    { type: String, default: "Anonymous" },
  amount:        { type: Number, required: true },
  placedAt:      { type: Date, default: Date.now },
});

const auctionSchema = new mongoose.Schema(
  {
    // Item reference (sub-collection item)
    nftSystemId:      { type: mongoose.Schema.Types.ObjectId, ref: "NFTSystem" },
    subCollectionId:  { type: String }, // _id of the sub-collection item
    title:            { type: String, required: true },
    description:      { type: String, default: "" },
    image:            { type: String, default: "" },
    category:         { type: String, default: "" },
    isNFA:            { type: Boolean, default: false },

    // Seller
    seller:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerWallet:     { type: String, required: true },

    // Pricing
    startPrice:       { type: Number, required: true, min: 0 },
    currentBid:       { type: Number, default: 0 },
    currentBidder:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    currentBidderWallet: { type: String, default: null },
    reservePrice:     { type: Number, default: 0 },   // min acceptable price
    instantBuyPrice:  { type: Number, default: null }, // optional "buy now" price

    // Auction timeline
    durationHours:    { type: Number, enum: [24, 72, 168], default: 24 }, // 1d, 3d, 7d
    startTime:        { type: Date, default: Date.now },
    endTime:          { type: Date, required: true },

    // Bids
    bidHistory:       [bidSchema],

    // Status
    status: {
      type: String,
      enum: ["active", "ended", "cancelled", "sold", "buyback_pending"],
      default: "active",
    },

    listingFee:       { type: Number, default: 2 }, // $2 per brief
    txHash:           { type: String, default: null },

    // Auto-cleanup: MongoDB TTL will delete this document when cleanupAt is reached.
    // Only set when auction enters a terminal state (ended/cancelled/sold).
    cleanupAt:        { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-set endTime from durationHours before save
auctionSchema.pre("save", function (next) {
  if (this.isNew && !this.endTime) {
    this.endTime = new Date(Date.now() + this.durationHours * 60 * 60 * 1000);
  }

  // Auto-set cleanupAt when auction enters a terminal state (30-day retention)
  const TERMINAL_STATES = ["ended", "cancelled", "sold"];
  if (this.isModified("status") && TERMINAL_STATES.includes(this.status) && !this.cleanupAt) {
    this.cleanupAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  }

  next();
});

// TTL index: MongoDB background thread deletes docs where cleanupAt < now
auctionSchema.index({ cleanupAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.model("Auction", auctionSchema);

