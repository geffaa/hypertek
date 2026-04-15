import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  buyer: String,
  seller: String,
  priceETH: Number,
  royaltyPaid: Number,
  platformFee: { type: Number, default: 0 },
  sellerReceived: { type: Number, default: 0 },
  txHash: String,
  isFirstSale: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Sub-collection schema (NFTs within a collection category)
const subCollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: false },
  image: String,
  description: String,
  tokenId: Number,
  tokenURI: String,
  owner: String,
  listed: { type: Boolean, default: false },
  priceETH: { type: Number, default: 0 },
  isFirstSale: { type: Boolean, default: true },
  salesHistory: [saleSchema],
  // Asset type — set by admin only. NFA = Hypertek-only, NFC = licensed player/Hypertek, NFT = player no license
  assetType: { type: String, enum: ["NFA", "NFC", "NFT"], default: "NFT" },
  // Legacy boolean — kept for backwards compat, derived from assetType
  isNFA: { type: Boolean, default: false },
  nfaFrame: { type: String, default: null },
  // Per-item buyback tracking (NFA/NFC)
  minimumBuybackUSD:  { type: Number, default: 0 },
  reservePriceUSD:    { type: Number, default: 0 },
  buybackPending:     { type: Boolean, default: false },
  // Artist linked to this item — admin selects from Artist model
  // Royalty (4%) on every sale is dispatched using the artist's payment method
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null },
  createdAt: { type: Date, default: Date.now },
});

const nftSystemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Main collection information
    collection: {
      name: String, // This will be used as the category name
      symbol: { type: String, required: false },
      chain: String,
      image: String,
      owner: String,
      royaltyPercent: { type: Number, default: 5 },
      royaltyWallet: String,
      supply: { type: Number, default: 1 },
      creator: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
      },
      salesCount: { type: Number, default: 0 },
    },

    // Category type - automatically set from collection.name
    category: {
      type: String,
      required: false,
    },

    // Is this a parent collection or a single NFT?
    isParentCollection: {
      type: Boolean,
      default: false,
    },

    // Marks collections created by the seed script (not by real users/admins)
    isDummy: {
      type: Boolean,
      default: false,
    },

    // Sub-collections (NFTs within this category)
    subCollections: [subCollectionSchema],

    // For single NFTs (non-parent collections)
    tokenId: Number,
    tokenURI: String,
    creator: {
      type: String,
      required: false,
    },
    owner: {
      type: String,
      required: false,
    },
    seller: String,
    buyer: {
      type: String,
      default: null,
    },
    listed: { type: Boolean, default: false },
    priceETH: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isFirstSale: {
      type: Boolean,
      default: true,
    },
    salesHistory: [saleSchema],

    // Asset type — set by admin only
    assetType: { type: String, enum: ["NFA", "NFC", "NFT"], default: "NFT" },
    // Legacy boolean — kept for backwards compat, derived from assetType
    isNFA: { type: Boolean, default: false },
    nfaFrame: { type: String, default: null }, // frame style key for visual distinction

    // Buyback fields (NFA and NFC)
    reservePriceUSD: { type: Number, default: 0 },
    minimumBuybackUSD: { type: Number, default: 0 },
    buybackPending: { type: Boolean, default: false },
    zeroed: { type: Boolean, default: false },
    removedFromCirculation: { type: Boolean, default: false },

    // CPI history for audit trail
    cpiHistory: [
      {
        year: Number,
        cpiPercent: Number,
        previousMin: Number,
        newMin: Number,
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Pre-save middleware: only set category from collection.name if category was not explicitly provided
nftSystemSchema.pre("save", function (next) {
  if (this.collection && this.collection.name && !this.category) {
    this.category = this.collection.name.toLowerCase().trim();
  }
  next();
});

export default mongoose.model("NFTSystem", nftSystemSchema);