/**
 * seedTestAssets.js
 * Creates cheap test NFT collections for QA/testing purposes.
 *
 * Usage:
 *   node scripts/seedTestAssets.js
 *   node scripts/seedTestAssets.js --clean   (removes existing test seeds first)
 *
 * All seeded items are marked isDummy: true so they can be identified and removed easily.
 * Items are priced at $0.50–$2.00 USDC for easy card/wallet testing.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../Config/.env") });

import NFTSystem from "../Models/NFTSystem.js";

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

// ── Test wallet (Don's / platform wallet — owner of seeded items) ──
const TEST_OWNER_WALLET =
  process.env.SEED_OWNER_WALLET ||
  process.env.PLATFORM_WALLET_ADDRESS ||
  "0x0000000000000000000000000000000000000001"; // fallback placeholder

// ── Placeholder image (public URL, no file upload needed) ──
const PLACEHOLDER = "https://placehold.co/400x400/002AA8/FFFFFF/png?text=TEST";

const testCollections = [
  {
    name: "Test Alpha Pack",
    symbol: "TAP",
    chain: "Base",
    price: 0.50,
    items: [
      { name: "Alpha #001", description: "Test item — $0.50 USDC" },
      { name: "Alpha #002", description: "Test item — $0.50 USDC" },
      { name: "Alpha #003", description: "Test item — $0.50 USDC" },
    ],
  },
  {
    name: "Test Beta Pack",
    symbol: "TBP",
    chain: "Base",
    price: 1.00,
    items: [
      { name: "Beta #001", description: "Test item — $1.00 USDC" },
      { name: "Beta #002", description: "Test item — $1.00 USDC" },
    ],
  },
  {
    name: "Test Gamma Pack",
    symbol: "TGP",
    chain: "Base",
    price: 2.00,
    items: [
      { name: "Gamma #001", description: "Test item — $2.00 USDC" },
    ],
  },
];

async function clean() {
  const result = await NFTSystem.deleteMany({ isDummy: true });
  console.log(`🗑  Removed ${result.deletedCount} existing test seed documents.`);
}

async function seed() {
  let created = 0;

  for (const col of testCollections) {
    const subCollections = col.items.map((item) => ({
      name: item.name,
      symbol: col.symbol,
      description: item.description,
      image: PLACEHOLDER,
      owner: TEST_OWNER_WALLET,
      listed: true,
      priceETH: col.price, // priceETH field stores USDC amount in this system
      isFirstSale: true,
    }));

    await NFTSystem.create({
      isDummy: true,
      isParentCollection: true,
      status: "active",
      category: col.name.toLowerCase().replace(/\s+/g, "-"),
      collection: {
        name: col.name,
        symbol: col.symbol,
        chain: col.chain,
        image: PLACEHOLDER,
        owner: TEST_OWNER_WALLET,
        royaltyPercent: 5,
        royaltyWallet: TEST_OWNER_WALLET,
        supply: col.items.length,
        creator: "admin",
      },
      subCollections,
    });

    console.log(`Created "${col.name}" — ${col.items.length} items @ $${col.price} USDC each`);
    created += col.items.length;
  }

  console.log(`\n🎉 Seeded ${created} test items across ${testCollections.length} collections.`);
  console.log(`   Owner wallet: ${TEST_OWNER_WALLET}`);
  console.log(`   To remove: node scripts/seedTestAssets.js --clean\n`);
}

async function main() {
  if (!MONGO_URI) {
    console.error(" MONGODB_URL not found in Config/.env");
    process.exit(1);
  }

  // ── Safety guard: never run on production ──
  if (process.env.NODE_ENV === "production") {
    console.error(" ABORT: seedTestAssets.js must NOT run in production. Set NODE_ENV=development to proceed.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("📦 Connected to MongoDB\n");

  const shouldClean = process.argv.includes("--clean");

  if (shouldClean) {
    await clean();
  } else {
    // Remove old seeds before re-seeding to avoid duplicates
    await clean();
    await seed();
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
