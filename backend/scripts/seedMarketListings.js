/**
 * Seed script — MarketListing demo data
 *
 * Deletes all existing MarketListing documents, then inserts fresh
 * demo rows across all categories with varied activity types.
 *
 * Run:
 *   node scripts/seedMarketListings.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });

import MarketListing from "../Models/MarketListingModel.js";
import User          from "../Models/User.js";

// ── Sample data ───────────────────────────────────────────────────────────────
const LISTINGS = [
  // SKINS
  {
    category: "skins", activityType: "selling_general",
    itemName: "GEN SNAKE SKIN", itemDescription: "Premium serpentine combat skin with bio-luminescent scales.",
    price: 150, currentOffer: 280, status: "pending", commissionTier: 20,
    offerHistory: [
      { offererName: "Player_Xero",  offererWallet: "0xaaa", amount: 200, currency: "USDC" },
      { offererName: "Player_Nova",  offererWallet: "0xbbb", amount: 280, currency: "USDC" },
    ],
  },
  {
    category: "skins", activityType: "selling_auction",
    itemName: "XYZ PHANTOM SKIN", itemDescription: "Rare phantom-class skin with holographic shimmer.",
    reservePrice: 320, currentBid: 280, status: "active", commissionTier: 12,
    bidHistory: [
      { bidderName: "Player_Rush",  bidderWallet: "0xccc", amount: 200 },
      { bidderName: "Player_Storm", bidderWallet: "0xddd", amount: 280 },
    ],
  },
  {
    category: "skins", activityType: "buying_general",
    itemName: "ABC STEALTH SKIN", itemDescription: "Looking to buy any stealth-class skin variant.",
    price: 410, currentOffer: 350, status: "active", commissionTier: 20,
  },
  {
    category: "skins", activityType: "buying_auction",
    itemName: "123 ELITE SKIN", itemDescription: "Bidding on Elite series skins — any variant.",
    reservePrice: 1100, currentBid: 2080, status: "active", commissionTier: 20,
    bidHistory: [
      { bidderName: "Player_Vega",   bidderWallet: "0xeee", amount: 1500 },
      { bidderName: "Me (You)",      bidderWallet: "0xfff", amount: 2080 },
    ],
  },
  {
    category: "skins", activityType: "buying_auction",
    itemName: "SNAKE ROYAL SUIT", itemDescription: "Max bid for Snake Royal collection.",
    reservePrice: 750, currentBid: 880, status: "active", commissionTier: 20,
  },

  // MILITARY BADGES
  {
    category: "military badges", activityType: "selling_auction",
    itemName: "DRAGON SLAYER ELITE", itemDescription: "Ultra-rare Dragon Slayer badge — only 12 in existence.",
    reservePrice: 3500, currentBid: 7880, status: "active", commissionTier: 12,
    bidHistory: [
      { bidderName: "Player_Kael",  bidderWallet: "0x111", amount: 4000 },
      { bidderName: "Player_Zara",  bidderWallet: "0x222", amount: 6000 },
      { bidderName: "Player_Odin",  bidderWallet: "0x333", amount: 7880 },
    ],
  },
  {
    category: "military badges", activityType: "selling_general",
    itemName: "UH45HG COMBAT BADGE", itemDescription: "Standard-issue UH45 combat achievement badge.",
    price: 150, currentOffer: 280, status: "active", commissionTier: 20,
  },
  {
    category: "military badges", activityType: "buying_auction",
    itemName: "G4B45BB TACTICAL BADGE", itemDescription: "Buying tactical-class G4 badges.",
    reservePrice: 2500, currentBid: 5580, status: "active", commissionTier: 20,
  },
  {
    category: "military badges", activityType: "buying_auction",
    itemName: "G45B45RR SPECIALIST BADGE", itemDescription: "Premium specialist badge — high bid.",
    reservePrice: 6500, currentBid: 5980, status: "pending", commissionTier: 20,
  },

  // WEAPONS
  {
    category: "weapons", activityType: "selling_general",
    itemName: "NOVA BLASTER MK-VII", itemDescription: "Energy blaster with plasma core — tier 7.",
    price: 890, currentOffer: 750, status: "active", commissionTier: 20,
  },
  {
    category: "weapons", activityType: "selling_auction",
    itemName: "HYPERION RIFLE", itemDescription: "Long-range hyperion-class rifle. Reserve at market value.",
    reservePrice: 2200, currentBid: 2850, status: "active", commissionTier: 10,
    bidHistory: [
      { bidderName: "Player_Finn", bidderWallet: "0x444", amount: 2200 },
      { bidderName: "Player_Lux",  bidderWallet: "0x555", amount: 2850 },
    ],
  },
  {
    category: "weapons", activityType: "buying_general",
    itemName: "PLASMA SWORD (ANY TIER)", itemDescription: "Looking to buy any plasma sword variant.",
    price: 500, status: "active", commissionTier: 20,
  },

  // BODY ARMOUR
  {
    category: "body armour", activityType: "selling_general",
    itemName: "TITAN CHEST PLATE", itemDescription: "Reinforced titanium chest armour — max defence rating.",
    price: 1200, status: "active", commissionTier: 20,
  },
  {
    category: "body armour", activityType: "buying_auction",
    itemName: "SHADOW ARMOUR SET", itemDescription: "Looking to acquire full Shadow Armour set.",
    reservePrice: 3000, currentBid: 3400, status: "active", commissionTier: 20,
  },

  // SPACESHIPS
  {
    category: "spaceships", activityType: "selling_auction",
    itemName: "VORTEX INTERCEPTOR", itemDescription: "Class-A interceptor — top speed rating.",
    reservePrice: 12000, currentBid: 15500, status: "active", commissionTier: 12,
    bidHistory: [
      { bidderName: "Player_Athos",  bidderWallet: "0x666", amount: 12000 },
      { bidderName: "Player_Zephyr", bidderWallet: "0x777", amount: 15500 },
    ],
  },
  {
    category: "spaceships", activityType: "selling_general",
    itemName: "SCOUT CRUISER MK-II", itemDescription: "Fast scout-class ship. Great for questing runs.",
    price: 4500, status: "active", commissionTier: 20,
  },

  // ARTWORK
  {
    category: "artwork", activityType: "selling_general",
    itemName: "NEBULA SERIES #004", itemDescription: "In-game displayed artwork — Nebula series, edition 4.",
    price: 200, status: "active", commissionTier: 20,
  },

  // GENERAL
  {
    category: "general", activityType: "selling_general",
    itemName: "HYPER TEK SIGNED POSTER", itemDescription: "Limited edition signed promotional poster — not in-game.",
    price: 75, status: "active", commissionTier: 20,
  },
  {
    category: "general", activityType: "trading",
    itemName: "TRADE: DIGITAL ART COLLECTION", itemDescription: "Offering my digital art collection for rare in-game items.",
    status: "active", commissionTier: 20,
  },

  // EXPIRED examples (status set manually; expiresAt kept in future so TTL doesn't delete them)
  {
    category: "racing vehicles", activityType: "selling_general",
    itemName: "RACE SPEEDER X90", itemDescription: "Expired listing — can still be renewed (demo).",
    price: 330, status: "expired", commissionTier: 20,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // future — keeps doc alive for TTL
    renewed: false, // not yet renewed — Renew button should appear
  },
  {
    category: "racing vehicles", activityType: "selling_general",
    itemName: "HOVER BIKE Z55", itemDescription: "Expired listing — already renewed once (demo).",
    price: 180, status: "expired", commissionTier: 20,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // future — keeps doc alive for TTL
    renewed: true, // already renewed — Renew button should NOT appear
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB");

  // Use alice@hypertek.com (password: User@1234) — created by seed.js
  const user = await User.findOne({ Email: "alice@hypertek.com" }).lean();
  if (!user) {
    console.error("❌ alice@hypertek.com not found. Run seed.js first.");
    process.exit(1);
  }
  console.log(`👤 Using user: ${user.Email}`);

  // Delete all existing MarketListing documents
  const deleted = await MarketListing.deleteMany({});
  console.log(`🗑  Deleted ${deleted.deletedCount} existing MarketListing documents`);

  // Insert fresh listings
  const docs = LISTINGS.map((l) => ({
    ...l,
    userId:     user._id,
    userName:   user.FullName || user.Email?.split("@")[0] || "Demo User",
    userWallet: user.WalletAddress || user.MetaMaskAddress || "0x0000",
    viewCount:  Math.floor(Math.random() * 80) + 5,
  }));

  await MarketListing.insertMany(docs);
  console.log(`✅ Inserted ${docs.length} MarketListing documents`);

  await mongoose.disconnect();
  console.log("✅ Done — disconnected from MongoDB");
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
