/**
 * Diagnose why My Listings is empty for a given wallet.
 * Run:  node scripts/debug_listing.js
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

const WALLET = "0x839f4465dab13fa73e6fbee4c4135a86926c9484";

await mongoose.connect(process.env.MONGODB_URL);
console.log("✅ Connected to MongoDB\n");
console.log(`🔍 Searching for all documents with sub-collections owned by:\n   ${WALLET}\n`);

// 1. Find ALL docs that have ANY sub with owner = wallet (no isParentCollection filter)
const docs = await NFTSystem.find({
  "subCollections.owner": WALLET.toLowerCase(),
});

console.log(`Found ${docs.length} parent document(s) containing subs owned by this wallet\n`);

if (docs.length === 0) {
  console.log("❌ No documents found — the owner field may not match. Searching loosely...");

  // Try case-insensitive search
  const docsAny = await NFTSystem.find({
    "subCollections.owner": { $regex: new RegExp(WALLET.replace("0x", ""), "i") },
  });
  console.log(`   Loose search found: ${docsAny.length} document(s)`);
  if (docsAny.length > 0) {
    for (const d of docsAny) {
      const subs = d.subCollections.filter(s => s.owner?.toLowerCase().includes(WALLET.slice(2).toLowerCase()));
      subs.forEach(s => console.log(`   sub owner in DB: "${s.owner}"`));
    }
  }
  process.exit(0);
}

for (const doc of docs) {
  console.log(`\n📁 DOCUMENT: ${doc.collection?.name || "(unnamed)"}`);
  console.log(`   _id             : ${doc._id}`);
  console.log(`   status          : ${doc.status}`);
  console.log(`   isParentColl    : ${doc.isParentCollection}`);
  console.log(`   collection.owner: ${doc.collection?.owner || "—"}`);

  const ownedSubs = doc.subCollections.filter(
    s => s.owner?.toLowerCase() === WALLET.toLowerCase()
  );

  console.log(`\n   Subs owned by wallet (${ownedSubs.length}):`);
  for (const sub of ownedSubs) {
    console.log(`\n   └─ "${sub.name || "(unnamed)"}"`);
    console.log(`      _id      : ${sub._id}`);
    console.log(`      owner    : "${sub.owner}"`);
    console.log(`      listed   : ${sub.listed}     ← must be true`);
    console.log(`      priceETH : ${sub.priceETH}`);
    console.log(`      tokenId  : ${sub.tokenId ?? "null"}`);
    console.log(`      status   : ${sub.status ?? "not set"}`);
  }

  // Simulate exact getListedSubCollections JS filter
  const listedSubs = doc.subCollections.filter(
    s => s.owner && s.owner.toLowerCase() === WALLET.toLowerCase() && s.listed === true
  );
  console.log(`\n   → Would appear in My Listings: ${listedSubs.length > 0 ? "✅ YES" : "❌ NO (listed=false or owner mismatch)"}`);
}

// 2. Check if the query with $elemMatch would find it
const elemMatchResult = await NFTSystem.find({
  subCollections: { $elemMatch: { owner: WALLET.toLowerCase(), listed: true } },
  status: "active",
});
console.log(`\n📊 $elemMatch query result: ${elemMatchResult.length} document(s) found`);
if (elemMatchResult.length > 0) {
  console.log("✅ Query returns results — check CollectionOnSale wallet/token in frontend");
} else {
  console.log("❌ Query returns 0 — listed is still false in DB");
  console.log("   → createSubCollectionListing may not have saved correctly");
  console.log("   → Restart backend and try listing again");
}

await mongoose.disconnect();
console.log("\n✅ Done.");
