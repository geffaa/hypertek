/**
 * Fix sub-collection ownership for a wallet that completed an on-chain purchase
 * but the DB was not updated due to the owner.toLowerCase() bug.
 *
 * Run:  node scripts/fix_ownership.js
 *
 * Steps:
 *  1. Set BUYER_WALLET to zaaa's wallet
 *  2. Check Payment collection to see what subCollectionId she paid for
 *  3. Set that sub's owner to her wallet
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
import { Payment } from "../Models/Payment.js";

const BUYER_WALLET = "0x839f4465dab13fa73e6fbee4c4135a86926c9484";
const DRY_RUN = false; // set true to preview without writing

await mongoose.connect(process.env.MONGODB_URL);
console.log("Connected to MongoDB\n");

// 1. Find all successful payments for this buyer
const payments = await Payment.find({
  buyerWallet: { $regex: new RegExp(BUYER_WALLET, "i") },
  status: "succeeded",
}).sort({ createdAt: -1 });

console.log(`Found ${payments.length} succeeded payment(s) for ${BUYER_WALLET}\n`);

if (payments.length === 0) {
  // Also check by userId
  console.log("Checking by userId or email...");
  const allPayments = await Payment.find({ status: "succeeded" }).sort({ createdAt: -1 }).limit(20);
  console.log("Recent succeeded payments:");
  allPayments.forEach(p => {
    console.log(`  - ${p.gameTitle} | buyerWallet: ${p.buyerWallet} | subCollectionId: ${p.subCollectionId} | ${p.createdAt}`);
  });
  await mongoose.disconnect();
  process.exit(0);
}

for (const payment of payments) {
  console.log(`\n💳 Payment: ${payment.gameTitle}`);
  console.log(`   paymentIntentId : ${payment.paymentIntentId}`);
  console.log(`   subCollectionId : ${payment.subCollectionId}`);
  console.log(`   parentId        : ${payment.parentId}`);
  console.log(`   buyerWallet     : ${payment.buyerWallet}`);
  console.log(`   createdAt       : ${payment.createdAt}`);

  if (!payment.subCollectionId) {
    console.log("   ⚠️ No subCollectionId — skipping");
    continue;
  }

  // Find the parent doc
  const parent = payment.parentId
    ? await NFTSystem.findById(payment.parentId)
    : await NFTSystem.findOne({ "subCollections._id": payment.subCollectionId });

  if (!parent) {
    console.log("    Parent not found");
    continue;
  }

  const sub = parent.subCollections.id(payment.subCollectionId);
  if (!sub) {
    console.log("    Sub-collection not found");
    continue;
  }

  console.log(`\n   Sub: "${sub.name}"`);
  console.log(`   current owner : ${sub.owner ?? "undefined"}`);
  console.log(`   listed        : ${sub.listed}`);

  if (sub.owner?.toLowerCase() === BUYER_WALLET.toLowerCase()) {
    console.log("   Already owned by buyer — skipping");
    continue;
  }

  if (!DRY_RUN) {
    sub.owner = BUYER_WALLET.toLowerCase();
    sub.listed = false;
    sub.priceETH = 0;
    sub.isFirstSale = false;
    parent.markModified("subCollections");
    await parent.save();
    console.log(`   FIXED: owner set to ${BUYER_WALLET.toLowerCase()}`);
  } else {
    console.log(`   [DRY RUN] Would set owner to ${BUYER_WALLET.toLowerCase()}`);
  }
}

await mongoose.disconnect();
console.log("\nDone.");
