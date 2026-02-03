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
  name: String,
  symbol: String,
  image: String,
  description: String,
  tokenId: Number,
  tokenURI: String,
  owner: String,
  listed: { type: Boolean, default: false },
  priceETH: { type: Number, default: 0 },
  isFirstSale: { type: Boolean, default: true },
  salesHistory: [saleSchema],
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
      name: String, // "Characters" or "Land"
      symbol: String,
      Type: String,
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

    // Category type for filtering
    category: {
      type: String,
      enum: ["characters", "land", "weapons", "other"],
      default: "other",
    },

    // Is this a parent collection or a single NFT?
    isParentCollection: {
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
  },
  { timestamps: true }
);

export default mongoose.model("NFTSystem", nftSystemSchema);