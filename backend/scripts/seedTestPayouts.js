/**
 * seedTestPayouts.js
 * Inserts dummy RoyaltyPayout and BuybackRequest records for UI testing.
 *
 * Run:
 *   node --env-file=Config/.env scripts/seedTestPayouts.js
 *
 * To wipe and re-seed:
 *   FORCE_RESEED=true node --env-file=Config/.env scripts/seedTestPayouts.js
 *
 * Safe to re-run — skips if records already exist (unless FORCE_RESEED=true).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
// Load Config/.env first (production/server config)
// .env.local overrides only if explicitly set — run with USE_LOCAL=true for staging DB
dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });
if (process.env.USE_LOCAL === "true") {
  dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });
  console.log("⚠️  Using .env.local (staging DB)");
} else {
  console.log("⚠️  Using Config/.env — seeding into the server database");
}

// ── Models ────────────────────────────────────────────────────────────────────

const royaltyPayoutSchema = new mongoose.Schema({
  subCollectionId: String,
  parentId:        String,
  saleRecordId:    String,
  creatorWallet:   String,
  amount:          Number,
  currency:        { type: String, default: "USDC" },
  paymentType:     { type: String, enum: ["crypto", "bank"], default: "crypto" },
  payoutType:      { type: String, enum: ["artist_royalty", "buyback_fund", "company_fee"], default: "artist_royalty" },
  status:          { type: String, enum: ["pending", "dispatched", "failed"], default: "pending" },
  txHash:          String,
  note:            String,
}, { timestamps: true });

const buybackRequestSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userWallet:       String,
  parentId:         String,
  subCollectionId:  String,
  itemName:         String,
  collectionName:   String,
  assetType:        { type: String, default: "NFA" },
  minimumBuybackUSD: Number,
  requestedAt:      { type: Date, default: Date.now },
  status:           { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  approvedAt:       Date,
  rejectedAt:       Date,
  txHash:           String,
  adminNote:        String,
}, { timestamps: true });

const RoyaltyPayout  = mongoose.models.RoyaltyPayout  || mongoose.model("RoyaltyPayout",  royaltyPayoutSchema);
const BuybackRequest = mongoose.models.BuybackRequest || mongoose.model("BuybackRequest", buybackRequestSchema);

// ── Dummy data ────────────────────────────────────────────────────────────────

const DUMMY_WALLET_A = "0x89ed8201b0448b2c94ae0e4d380f08b7ad558ce6";
const DUMMY_WALLET_B = "0xabc123def456abc123def456abc123def456abc1";
const DUMMY_PARENT   = new mongoose.Types.ObjectId();
const DUMMY_SUB_A    = new mongoose.Types.ObjectId();
const DUMMY_SUB_B    = new mongoose.Types.ObjectId();
const DUMMY_USER     = new mongoose.Types.ObjectId();

const PAYOUT_SEED = [
  // ── Crypto payouts ──────────────────────────────────────────────────────────
  {
    subCollectionId: DUMMY_SUB_A.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   DUMMY_WALLET_A,
    amount:          4.00,
    paymentType:     "crypto",
    payoutType:      "artist_royalty",
    status:          "dispatched",
    txHash:          "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    note:            "Auto-dispatched on-chain at 2026-05-01T10:00:00Z",
  },
  {
    subCollectionId: DUMMY_SUB_A.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   DUMMY_WALLET_A,
    amount:          8.50,
    paymentType:     "crypto",
    payoutType:      "artist_royalty",
    status:          "failed",                           // ← Retry button should appear
    note:            "Dispatch failed: Backend wallet USDC balance insufficient. Has: 2.00, needs: 8.50",
  },
  {
    subCollectionId: DUMMY_SUB_B.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   DUMMY_WALLET_B,
    amount:          12.00,
    paymentType:     "crypto",
    payoutType:      "artist_royalty",
    status:          "failed",                           // ← Retry button should appear
    note:            "Dispatch failed: RPC connection timeout",
  },
  // ── Company fee ─────────────────────────────────────────────────────────────
  {
    subCollectionId: DUMMY_SUB_A.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   DUMMY_WALLET_A,
    amount:          16.00,
    paymentType:     "crypto",
    payoutType:      "company_fee",
    status:          "dispatched",
    txHash:          "0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4",
    note:            "Auto-dispatched on-chain at 2026-05-02T14:30:00Z",
  },
  {
    subCollectionId: DUMMY_SUB_B.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   DUMMY_WALLET_A,
    amount:          10.00,
    paymentType:     "crypto",
    payoutType:      "company_fee",
    status:          "pending",
    note:            "Pending dispatch",
  },
  // ── Buyback fund ─────────────────────────────────────────────────────────────
  {
    subCollectionId: DUMMY_SUB_A.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   DUMMY_WALLET_A,
    amount:          10.00,
    paymentType:     "crypto",
    payoutType:      "buyback_fund",
    status:          "dispatched",
    txHash:          "0x111aaa222bbb333ccc444ddd555eee666fff777000111aaa222bbb333ccc444d",
    note:            "Auto-dispatched on-chain at 2026-05-03T09:15:00Z",
  },
  // ── Bank payouts ─────────────────────────────────────────────────────────────
  {
    subCollectionId: DUMMY_SUB_B.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   "bank",                             // ← sentinel for bank payout
    amount:          20.00,
    paymentType:     "bank",
    payoutType:      "artist_royalty",
    status:          "pending",                          // ← Mark Sent button should appear
    note:            "Bank payout pending — process via Wise to artist account",
  },
  {
    subCollectionId: DUMMY_SUB_B.toString(),
    parentId:        DUMMY_PARENT.toString(),
    creatorWallet:   "bank",
    amount:          15.00,
    paymentType:     "bank",
    payoutType:      "artist_royalty",
    status:          "dispatched",
    note:            "Manually marked dispatched by admin on 2026-05-04T11:00:00Z",
  },
];

const BUYBACK_SEED = [
  {
    userId:            DUMMY_USER,
    userWallet:        "0xuser1111222233334444555566667777888899990000",
    parentId:          DUMMY_PARENT.toString(),
    subCollectionId:   DUMMY_SUB_A.toString(),
    itemName:          "Dragon Warlord #001",
    collectionName:    "HyperTek Legends",
    assetType:         "NFA",
    minimumBuybackUSD: 500,
    status:            "pending",
  },
  {
    userId:            DUMMY_USER,
    userWallet:        "0xuser2222333344445555666677778888999900001111",
    parentId:          DUMMY_PARENT.toString(),
    subCollectionId:   DUMMY_SUB_B.toString(),
    itemName:          "Stealth Sniper Skin #007",
    collectionName:    "HyperTek Legends",
    assetType:         "NFC",
    minimumBuybackUSD: 250,
    status:            "pending",
  },
  {
    userId:            DUMMY_USER,
    userWallet:        "0xuser3333444455556666777788889999000011112222",
    parentId:          DUMMY_PARENT.toString(),
    subCollectionId:   new mongoose.Types.ObjectId().toString(),
    itemName:          "Space Cruiser Alpha",
    collectionName:    "HyperTek Spaceships",
    assetType:         "NFA",
    minimumBuybackUSD: 1000,
    status:            "approved",
    approvedAt:        new Date("2026-05-10"),
    txHash:            "0xapproved111222333444555666777888999000aaa",
    adminNote:         "Approved. USDC sent to holder wallet.",
  },
  {
    userId:            DUMMY_USER,
    userWallet:        "0xuser4444555566667777888899990000111122223333",
    parentId:          DUMMY_PARENT.toString(),
    subCollectionId:   new mongoose.Types.ObjectId().toString(),
    itemName:          "Siege Tank Mk3",
    collectionName:    "HyperTek Vehicles",
    assetType:         "NFC",
    minimumBuybackUSD: 150,
    status:            "rejected",
    rejectedAt:        new Date("2026-05-08"),
    adminNote:         "Item does not qualify — purchased after policy change date.",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/hypertek";
  await mongoose.connect(mongoUrl);
  console.log("✅ Connected to MongoDB");

  const force = process.env.FORCE_RESEED === "true";

  // ── RoyaltyPayouts ───────────────────────────────────────────────────────────
  const existingPayouts = await RoyaltyPayout.countDocuments();
  if (existingPayouts > 0 && !force) {
    console.log(`⏭  RoyaltyPayout: ${existingPayouts} records already exist — skipping (use FORCE_RESEED=true to overwrite)`);
  } else {
    if (force) await RoyaltyPayout.deleteMany({});
    await RoyaltyPayout.insertMany(PAYOUT_SEED);
    console.log(`✅ RoyaltyPayout: inserted ${PAYOUT_SEED.length} test records`);
    console.log("   → 2x failed crypto  (Retry button)");
    console.log("   → 1x pending bank   (Mark Sent button)");
    console.log("   → 1x pending crypto (no action)");
    console.log("   → 3x dispatched     (monitoring only)");
  }

  // ── BuybackRequests ──────────────────────────────────────────────────────────
  const existingBuybacks = await BuybackRequest.countDocuments();
  if (existingBuybacks > 0 && !force) {
    console.log(`⏭  BuybackRequest: ${existingBuybacks} records already exist — skipping (use FORCE_RESEED=true to overwrite)`);
  } else {
    if (force) await BuybackRequest.deleteMany({});
    await BuybackRequest.insertMany(BUYBACK_SEED);
    console.log(`✅ BuybackRequest: inserted ${BUYBACK_SEED.length} test records`);
    console.log("   → 2x pending   (Approve/Reject buttons)");
    console.log("   → 1x approved  (with txHash)");
    console.log("   → 1x rejected  (with adminNote)");
  }

  await mongoose.disconnect();
  console.log("\n🎉 Done. Open admin panel to test:");
  console.log("   → /royalty-payouts   — test Retry and Mark Sent buttons");
  console.log("   → /buyback-approval  — test Approve and Reject flow");
}

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
