/**
 * Manually assign a sub-collection to a buyer wallet.
 * Use this to fix purchases where the DB ownership wasn't transferred.
 *
 * Run:   node scripts/assign_item.js
 *
 * Step 1: Run with ASSIGN_SUB_ID = "" to see all available items
 * Step 2: Copy the sub _id of the item zaaa bought
 * Step 3: Set ASSIGN_SUB_ID and run again
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });

import NFTSystem from "../Models/NFTSystem.js";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BUYER_WALLET = "0x839f4465dab13fa73e6fbee4c4135a86926c9484"; // zaaa
const ASSIGN_SUB_ID = "69c80c5f2821bc4ae696d94a"; // planet 1 — GEFFA collection
const PRICE_PAID = 0.001; // price zaaa paid
const DRY_RUN = false;
// ───────────────────────────────────────────────────────────────────────────

await mongoose.connect(process.env.MONGODB_URL);
console.log("Connected to MongoDB\n");

if (!ASSIGN_SUB_ID) {
  // List all sub-collections that are listed (available for purchase) with owner undefined/"admin"
  console.log("📋 Available items (listed=true, no private owner):\n");
  const docs = await NFTSystem.find({ isParentCollection: true }).select("collection.name category subCollections");

  for (const doc of docs) {
    const availSubs = doc.subCollections.filter(s => s.listed === true || !s.owner || s.owner === "admin");
    if (availSubs.length === 0) continue;
    console.log(`\n📁 ${doc.collection?.name} (${doc.category})`);
    for (const sub of availSubs) {
      console.log(`   ├ "${sub.name}"`);
      console.log(`   │  _id     : ${sub._id}`);
      console.log(`   │  owner   : ${sub.owner ?? "undefined"}`);
      console.log(`   │  listed  : ${sub.listed}`);
      console.log(`   │  price   : ${sub.priceETH} USDC`);
    }
  }
  console.log("\n👉 Set ASSIGN_SUB_ID to the _id of the item zaaa bought, then run again.");
  await mongoose.disconnect();
  process.exit(0);
}

// Assign the item
const parent = await NFTSystem.findOne({ "subCollections._id": ASSIGN_SUB_ID });
if (!parent) {
  console.error(` Sub-collection ${ASSIGN_SUB_ID} not found`);
  process.exit(1);
}

const sub = parent.subCollections.id(ASSIGN_SUB_ID);
console.log(`\nAssigning "${sub.name}" to ${BUYER_WALLET}`);
console.log(`  current owner : ${sub.owner ?? "undefined"}`);
console.log(`  listed        : ${sub.listed}`);

if (!DRY_RUN) {
  sub.owner = BUYER_WALLET.toLowerCase();
  sub.listed = false;
  sub.priceETH = 0;
  sub.isFirstSale = false;
  sub.salesHistory = sub.salesHistory || [];
  sub.salesHistory.push({
    buyer: BUYER_WALLET.toLowerCase(),
    seller: sub.owner || "admin",
    priceETH: PRICE_PAID,
    txHash: "manual-recovery",
    isFirstSale: true,
    createdAt: new Date(),
  });
  parent.markModified("subCollections");
  await parent.save();
  console.log(`\nDONE — "${sub.name}" is now owned by ${BUYER_WALLET.toLowerCase()}`);
  console.log("   Restart backend then check zaaa's Collectibles tab.");
} else {
  console.log("\n[DRY RUN] No changes made.");
}

await mongoose.disconnect();
