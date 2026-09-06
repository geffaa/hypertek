import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["trade", "quest"],
      required: true,
    },

    // Creator
    poster:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    posterWallet: { type: String, required: true },
    posterName:   { type: String, default: "Anonymous" },

    title:        { type: String, required: true },
    description:  { type: String, default: "" },

    // Trade: what they offer and what they want (text description)
    offering:     { type: String, default: "" },
    requesting:   { type: String, default: "" },

    // HB components of the trade offer/request
    // e.g. "I'll give 500 HB + my Skin NFT for your Weapon NFT"
    offeringHB:   { type: Number, default: 0, min: 0 },  // HB poster offers
    requestingHB: { type: Number, default: 0, min: 0 },  // HB poster wants in return

    // Structured item references, only set when the offer/request is an actual
    // on-chain item (not just a text description). Required for completeTrade
    // to execute a real ownership transfer instead of just settling HB.
    offeringSubCollectionId:   { type: mongoose.Schema.Types.ObjectId, default: null },
    offeringTokenId:           { type: Number, default: null },
    requestingSubCollectionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    requestingTokenId:         { type: Number, default: null },

    // Quest: reward amount in USDC
    reward:       { type: Number, default: 0 },

    // Optional image for the item being offered/quested
    image:        { type: String, default: "" },

    // ── Quest-specific fields ────────────────────────────────────────────────
    // In-game planet data (synced when game goes live)
    pickupPlanet:  { type: String, default: null },
    dropOffPlanet: { type: String, default: null },

    // Quest type: "money" (11% pool) or "resources" (20% pool)
    questType: {
      type: String,
      enum: ["money", "resources"],
      default: null,
    },

    // Wait tier chosen by buyer: 4, 12, or 24 hours
    waitHours: {
      type: Number,
      enum: [4, 12, 24],
      default: null,
    },

    // Commission split percentages (stored at creation time for audit trail)
    buyerSavePercent:    { type: Number, default: null }, // % buyer saves off sale price
    playerSharePercent:  { type: Number, default: null }, // % player earns on completion
    platformSharePercent:{ type: Number, default: null }, // % platform earns on completion

    // Actual amounts settled on completion (in USDC or HB)
    buyerSavesAmount:    { type: Number, default: null },
    playerEarnsAmount:   { type: Number, default: null },
    platformEarnsAmount: { type: Number, default: null },
    salePrice:           { type: Number, default: null }, // base price the split applies to

    // Reference to the MarketListing that auto-generated this quest
    linkedListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketListing",
      default: null,
    },

    // Daily quest accept limit tracking (key = "YYYY-MM-DD", value = count per player)
    // Stored on the QUEST document — we query acceptedByWallet + dailyQuestDate to count
    dailyQuestDate: { type: String, default: null }, // e.g. "2026-04-14"

    // ── Response ─────────────────────────────────────────────────────────────
    acceptedBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acceptedByWallet: { type: String, default: null },
    acceptedAt:       { type: Date, default: null },
    completedAt:      { type: Date, default: null },

    status: {
      type: String,
      enum: ["open", "accepted", "completed", "cancelled", "expired"],
      default: "open",
    },

    expiresAt:  { type: Date },
    listingFee: { type: Number, default: 2 }, // $2 / 500 HB per brief
    category:   { type: String, default: "" },

    // Auto-cleanup: MongoDB TTL will delete this document when cleanupAt is reached.
    // Only set when trade enters a terminal state (completed/cancelled/expired).
    cleanupAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-set expiry 30 days from creation
tradeSchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // Auto-set cleanupAt when trade enters a terminal state (30-day retention)
  const TERMINAL_STATES = ["completed", "cancelled", "expired"];
  if (this.isModified("status") && TERMINAL_STATES.includes(this.status) && !this.cleanupAt) {
    this.cleanupAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  next();
});

// TTL index: MongoDB background thread deletes docs where cleanupAt < now
tradeSchema.index({ cleanupAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.model("Trade", tradeSchema);

