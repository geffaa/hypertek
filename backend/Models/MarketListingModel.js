import mongoose from "mongoose";

const offerEntrySchema = new mongoose.Schema({
  offererName:   { type: String, default: "Anonymous" },
  offererWallet: { type: String, default: "" },
  amount:        { type: Number, required: true },
  currency:      { type: String, default: "USDC" },
  offeredAt:     { type: Date, default: Date.now },
  status:        { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { _id: false });

const bidEntrySchema = new mongoose.Schema({
  bidderName:   { type: String, default: "Anonymous" },
  bidderWallet: { type: String, default: "" },
  amount:       { type: Number, required: true },
  placedAt:     { type: Date, default: Date.now },
}, { _id: false });

const marketListingSchema = new mongoose.Schema(
  {
    // Owner
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName:   { type: String, default: "Anonymous" },
    userWallet: { type: String, default: "" },

    // Category (Don's categories)
    category: {
      type: String,
      enum: [
        "skins",
        "military badges",
        "specialists",
        "weapons",
        "body armour",
        "spaceships",
        "racing vehicles",
        "artwork",
        "land and bases",
        "general",
      ],
      required: true,
    },

    // Activity type
    activityType: {
      type: String,
      enum: [
        "selling_general",
        "selling_auction",
        "buying_general",
        "buying_auction",
        "trading",
        "hiring",
      ],
      required: true,
    },

    // Item details
    itemName:        { type: String, required: true },
    itemDescription: { type: String, default: "" },
    itemImage:       { type: String, default: "" },

    // Optional NFT reference
    nftSystemId:     { type: mongoose.Schema.Types.ObjectId, ref: "NFTSystem", default: null },
    subCollectionId: { type: String, default: null },

    // Pricing fields (filled based on activityType)
    price:        { type: Number, default: null }, // selling_general / buying_general price
    currentOffer: { type: Number, default: null }, // best offer received so far
    reservePrice: { type: Number, default: null }, // auction reserve (selling/buying auction)
    currentBid:   { type: Number, default: null }, // current highest bid

    // History & analytics
    offerHistory: [offerEntrySchema],
    bidHistory:   [bidEntrySchema],
    viewCount:    { type: Number, default: 0 },
    soldCount:    { type: Number, default: 0 }, // times this item type sold (analytics)

    // Commission tier chosen by seller
    commissionTier: {
      type: Number,
      enum: [20, 12, 10, 8],
      default: 20,
    },

    // ── Quest integration ────────────────────────────────────────────────────
    // Whether this listing has quest mode enabled (commissionTier < 20 implies quest)
    questEnabled: { type: Boolean, default: false },

    // Quest type: "money" (standard 11% pool) or "resources" (20% pool)
    questType: {
      type: String,
      enum: ["money", "resources", null],
      default: null,
    },

    // Reference to the auto-generated Quest (Trade doc) for this listing
    linkedQuestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: ["active", "pending", "expired", "sold", "cancelled"],
      default: "active",
    },

    // Expiry — 7 days, renewable once
    expiresAt: { type: Date },
    renewed:   { type: Boolean, default: false },

    // Notification sent flag (for expiry warning)
    expiryNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-set 7-day expiry on creation
marketListingSchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Auto-expire listings past their expiry date
marketListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("MarketListing", marketListingSchema);
