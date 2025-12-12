import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  buyer: String,
  seller: String,
  priceETH: Number,
  royaltyPaid: Number, // Amount paid to creator (5% or 100% on first sale)
  platformFee: { type: Number, default: 0 }, // 10% platform fee (except first sale)
  sellerReceived: { type: Number, default: 0 }, // 85% seller amount (except first sale)
  txHash: String,
  isFirstSale: { type: Boolean, default: false }, // Track if this was the first sale
  createdAt: { type: Date, default: Date.now },
});

const nftSystemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    collection: {
      name: String,
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
    },
    tokenId: Number,
    tokenURI: String,
    creator: {
      type: String,
      required: false,
    }, // Wallet address - NEVER CHANGES
    owner: {
      type: String,
      required: false,
    }, // Current owner wallet
    seller: String, // Current seller (same as owner when not listed)
    buyer: {
      type: String,
      default: null,
    }, // Temporary during purchase
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

// import mongoose from "mongoose";

// // Each sale stored here
// const saleSchema = new mongoose.Schema({
//   buyer: String,               // wallet address of buyer
//   buyerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

//   seller: String,              // wallet address of seller
//   sellerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

//   priceETH: Number,

//   royaltyPaid: Number,         // 5% OR 100% (on first sale)
//   platformFee: Number,         // 10% platform amount
//   sellerReceived: Number,      // 85% seller amount

//   platformWallet: String,      // Admin wallet

//   txHash: String,
//   isFirstSale: { type: Boolean, default: false },

//   createdAt: { type: Date, default: Date.now }
// });

// // NFT Structure
// const nftSystemSchema = new mongoose.Schema({

//   //------------------------------
//   // CREATOR INFORMATION
//   //------------------------------

//   creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
//   creatorWallet: { type: String, required: true },         // wallet address
//   creatorType: { type: String, enum: ["admin", "user"], default: "user" },
//   royaltyPercent: Number,                                  // e.g. 5 %
//   royaltyWallet: String,                                   // where royalty goes (creator wallet)

//   //------------------------------
//   // COLLECTION INFO
//   //------------------------------
//   collection: {
//     name: String,
//     symbol: String,
//     Type: String,
//     chain: String,
//     image: String,
//   },

//   //------------------------------
//   // NFT ON-CHAIN INFO
//   //------------------------------
//   tokenId: Number,
//   tokenURI: String,

//   owner: String,               // current owner wallet
//   listed: Boolean,
//   priceETH: Number,
//   seller: String,              // wallet selling now

//   status: { type: String, default: "active" },
//   isFirstSale: { type: Boolean, default: true },

//   //------------------------------
//   // FULL SALE HISTORY ARRAY
//   //------------------------------
//   salesHistory: [saleSchema],

//   //------------------------------
//   // TOTAL EARNINGS SUMMARY
//   //------------------------------
//   totalCreatorEarnings: { type: Number, default: 0 },
//   totalPlatformEarnings: { type: Number, default: 0 },
//   totalSellerEarnings: { type: Number, default: 0 },

// }, { timestamps: true });

// export default mongoose.model("NFTSystem", nftSystemSchema);
