/**
 * Force-list sub-collections in DB for UI testing (bypasses on-chain requirements)
 *
 * This script marks existing sub-collections as `listed: true` with a fake tokenId
 * so the marketplace and buy page can be tested without real testnet ETH.
 *
 * ⚠️  On-chain buying will STILL fail because the NFT doesn't actually exist on-chain.
 *     This is ONLY for testing the listing UI / marketplace display.
 *
 * Run:
 *   node scripts/force_list_nfts.js
 *
 * Options (edit below):
 *   TARGET_WALLET  — only list items owned by this wallet (or leave blank for all)
 *   DRY_RUN        — set true to preview without writing to DB
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

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const TARGET_WALLET = ""; // e.g. "0xabc..." — leave blank to match all wallets
const DRY_RUN = false; // set true to preview without writing
// ─────────────────────────────────────────────────────────────────────────────

await mongoose.connect(process.env.MONGODB_URL);
console.log("Connected to MongoDB\n");

const parents = await NFTSystem.find({ isParentCollection: true });

let nextFakeTokenId = 1000; // start from 1000 to avoid conflicts
let totalUpdated = 0;

for (const parent of parents) {
  let parentDirty = false;

  for (const sub of parent.subCollections) {
    // Skip already listed
    if (sub.listed) {
      console.log(`⏭  Skip (already listed): ${sub.name} [${sub._id}]`);
      continue;
    }

    // Filter by wallet if specified
    if (TARGET_WALLET && sub.owner?.toLowerCase() !== TARGET_WALLET.toLowerCase()) {
      continue;
    }

    // Skip if no owner set (belongs to nobody)
    if (!sub.owner) {
      console.log(`⏭  Skip (no owner): ${sub.name} [${sub._id}]`);
      continue;
    }

    const fakeTokenId = sub.tokenId || nextFakeTokenId++;

    console.log(`\n🔧 ${DRY_RUN ? "[DRY RUN] " : ""}Listing: ${sub.name}`);
    console.log(`   parent   : ${parent.collection?.name || parent._id}`);
    console.log(`   sub _id  : ${sub._id}`);
    console.log(`   owner    : ${sub.owner}`);
    console.log(`   tokenId  : ${fakeTokenId} (${sub.tokenId ? "existing" : "fake"})`);
    console.log(`   price    : ${sub.priceETH || 1} USDC`);

    if (!DRY_RUN) {
      sub.listed = true;
      sub.tokenId = fakeTokenId;
      sub.tokenURI = sub.tokenURI || `ipfs://fake-uri-${fakeTokenId}`;
      sub.priceETH = sub.priceETH || 1;
      sub.isFirstSale = false;
      parentDirty = true;
      totalUpdated++;
    }
  }

  if (parentDirty) {
    await parent.save();
    console.log(`\n💾 Saved parent: ${parent.collection?.name || parent._id}`);
  }
}

console.log(`\nDone. ${DRY_RUN ? "[DRY RUN] " : ""}Updated ${totalUpdated} sub-collection(s).`);
await mongoose.disconnect();
