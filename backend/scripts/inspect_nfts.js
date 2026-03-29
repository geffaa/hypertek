
/**
 * Inspect NFT collections & sub-collections in DB
 *
 * Run:
 *   node scripts/inspect_nfts.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });

import NFTSystem from "../Models/NFTSystem.js";

await mongoose.connect(process.env.MONGODB_URL);
console.log("✅ Connected to MongoDB\n");

const parents = await NFTSystem.find({ isParentCollection: true }).sort({ createdAt: -1 });

if (parents.length === 0) {
  console.log("❌ No parent collections found.");
  process.exit(0);
}

for (const p of parents) {
  const name = p.collection?.name || p.name || "(unnamed)";
  console.log(`\n📁 PARENT: ${name}`);
  console.log(`   _id      : ${p._id}`);
  console.log(`   category : ${p.category}`);
  console.log(`   owner    : ${p.collection?.owner || "—"}`);
  console.log(`   subs     : ${p.subCollections.length}`);

  for (const sub of p.subCollections) {
    const listedTag  = sub.listed    ? "🟢 listed"   : "⚪ unlisted";
    const mintedTag  = sub.tokenId   ? `token #${sub.tokenId}` : "not minted";
    console.log(`   └─ ${sub.name || "(unnamed)"}`);
    console.log(`      _id      : ${sub._id}`);
    console.log(`      status   : ${listedTag} | ${mintedTag}`);
    console.log(`      owner    : ${sub.owner || "—"}`);
    console.log(`      priceETH : ${sub.priceETH ?? "—"} USDC`);
  }
}

await mongoose.disconnect();
console.log("\n✅ Done.");
