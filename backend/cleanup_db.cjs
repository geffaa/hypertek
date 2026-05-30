const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'Config', '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

// ── Safety guard: never run on production ──
if (process.env.NODE_ENV === "production") {
  console.error(" ABORT: cleanup_db.cjs must NOT run in production. This script resets ALL NFT ownership.");
  process.exit(1);
}

if (!MONGODB_URL) {
  console.error(" MONGODB_URL not found in .env");
  process.exit(1);
}

// Minimal Schema for Cleanup
const NFTSchema = new mongoose.Schema({}, { strict: false, collection: 'nfts' });
const NFT = mongoose.model('NFT', NFTSchema);

async function cleanup() {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("Connected!");

    console.log("🧼 Cleaning up stale NFT records (resetting tokenId and owner for testing)...");

    // Reset all sub-collections tokenIds and owners to allow re-minting
    // We target records wheretokenId exists to fix the mismatch
    const result = await NFT.updateMany(
      { "subCollections.tokenId": { $exists: true } },
      {
        $set: {
          "subCollections.$[].tokenId": null,
          "subCollections.$[].owner": null,
          "subCollections.$[].listed": false
        }
      }
    );

    console.log(`Cleanup complete. Updated ${result.modifiedCount} collections.`);

    // Also reset top-level tokenId if it exists (though usually it's in subCollections)
    await NFT.updateMany(
      { tokenId: { $exists: true } },
      { $set: { tokenId: null, owner: null, listed: false } }
    );

    console.log("🏁 All stale records cleared. You can now mint fresh NFAs on the new contract!");
    process.exit(0);
  } catch (err) {
    console.error(" Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();
