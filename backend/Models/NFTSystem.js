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
  // NFA designation — set by admin only
  isNFA: { type: Boolean, default: false },
  nfaFrame: { type: String, default: null },
  // Per-item buyback tracking (NFA only)
  minimumBuybackUSD:  { type: Number, default: 0 },
  reservePriceUSD:    { type: Number, default: 0 },
  buybackPending:     { type: Boolean, default: false },
  // Artist royalty payout preference (set by admin per item/collection)
  royaltyPaymentPreference: { type: String, enum: ["crypto", "bank"], default: "crypto" },
  royaltyBankDetails: {
    accountHolderName: String,
    bankName:          String,
    accountNumber:     String,
    iban:              String,
    swift:             String,
    country:           String,
  },
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

    // NFA designation — applied by admin, any item in any category can be an NFA
    isNFA: { type: Boolean, default: false },
    nfaFrame: { type: String, default: null }, // frame style key for visual distinction

    // NFA buyback fields
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