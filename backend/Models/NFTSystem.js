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
  { timestamps: true },
);

// Pre-save middleware to automatically set category from collection.name
nftSystemSchema.pre("save", function (next) {
  // Always set category from collection.name if collection exists
  if (this.collection && this.collection.name) {
    this.category = this.collection.name.toLowerCase().trim();
  }
  next();
});

// Also handle updates
nftSystemSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  
  // If collection.name is being updated
  if (update.$set && update.$set["collection.name"]) {
    update.$set.category = update.$set["collection.name"].toLowerCase().trim();
  } else if (update.collection && update.collection.name) {
    if (!update.$set) update.$set = {};
    update.$set.category = update.collection.name.toLowerCase().trim();
  }
  
  next();
});

export default mongoose.model("NFTSystem", nftSystemSchema);