/**
 * Seed script – local marketplace data
 *
 * Seeds:
 *   1. Parent collections for all 9 HyperTek categories
 *   2. 4-5 sub-collection items per category
 *   3. NFT 101 education cards
 *
 * Run:
 *   node scripts/seedMarketplace.js
 *
 * Safe to re-run: skips any parent collection whose name already exists.
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
import Nft101    from "../Models/Nft101.js";

// ─── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Skins",
    chain: "Ethereum",
    symbol: "SKIN",
    items: [
      { name: "Desert Storm Skin",     symbol: "DSS",  priceETH: 45,  description: "Camouflage desert warfare skin for elite soldiers." },
      { name: "Arctic Ghost Skin",     symbol: "AGS",  priceETH: 60,  description: "Icy blue stealth skin for cold-climate operations." },
      { name: "Shadow Ops Skin",       symbol: "SOS",  priceETH: 80,  description: "Jet black covert operations skin with night-vision accents." },
      { name: "Urban Assault Skin",    symbol: "UAS",  priceETH: 55,  description: "City warfare skin with tactical grey patterning." },
      { name: "Jungle Predator Skin",  symbol: "JPS",  priceETH: 70,  description: "Dense jungle camouflage skin for rainforest missions." },
    ],
  },
  {
    name: "Weapons",
    chain: "Ethereum",
    symbol: "WPNS",
    items: [
      { name: "Hyper Assault Rifle",   symbol: "HAR",  priceETH: 120, description: "High-powered assault rifle with hyper-tech optics." },
      { name: "Plasma Pistol Mk2",     symbol: "PPM2", priceETH: 85,  description: "Compact plasma pistol with dual-fire mode." },
      { name: "Rail Sniper X90",       symbol: "RSX",  priceETH: 200, description: "Long-range rail gun sniper with electro-targeting." },
      { name: "Frag Launcher Pro",     symbol: "FLP",  priceETH: 150, description: "Grenade launcher with proximity detonation system." },
      { name: "Ion Blade Elite",       symbol: "IBE",  priceETH: 95,  description: "Electrified combat blade for close-quarters warfare." },
    ],
  },
  {
    name: "Military Badges and Collectables",
    chain: "Ethereum",
    symbol: "MBAC",
    items: [
      { name: "Commander's Cross",     symbol: "CC",   priceETH: 300, description: "Rare commander's cross awarded for battlefield leadership." },
      { name: "Purple Valor Medal",    symbol: "PVM",  priceETH: 250, description: "Medal of valor for exceptional bravery under fire." },
      { name: "HyperTek Coin 2025",    symbol: "HTC",  priceETH: 180, description: "Limited edition collectible coin for season 2025." },
      { name: "Iron Shield Badge",     symbol: "ISB",  priceETH: 140, description: "Badge denoting mastery of defensive tactics." },
      { name: "Star of Honour",        symbol: "SOH",  priceETH: 500, description: "The highest honour awarded in the HyperTek universe." },
    ],
  },
  {
    name: "Body Armour",
    chain: "Ethereum",
    symbol: "BARM",
    items: [
      { name: "Nano-Mesh Vest",        symbol: "NMV",  priceETH: 110, description: "Lightweight nano-fibre vest with ballistic resistance." },
      { name: "Exo-Skeleton Mk3",      symbol: "ESK3", priceETH: 350, description: "Full exoskeleton suit with powered joints." },
      { name: "Carbon Plate Armour",   symbol: "CPA",  priceETH: 220, description: "Hard carbon plates for heavy assault operations." },
      { name: "Stealth Composite Vest",symbol: "SCV",  priceETH: 175, description: "Radar-absorbing composite armour vest." },
      { name: "Titan Full Plate",      symbol: "TFP",  priceETH: 480, description: "Maximum protection titanium alloy full body armour." },
    ],
  },
  {
    name: "Specialists",
    chain: "Ethereum",
    symbol: "SPEC",
    items: [
      { name: "Ghost Recon Operator",  symbol: "GRO",  priceETH: 400, description: "Elite recon specialist with ghost cloak ability." },
      { name: "Cyber Medic",          symbol: "CME",  priceETH: 280, description: "Field medic with advanced cybernetic healing tools." },
      { name: "Bomb Disposal Expert",  symbol: "BDE",  priceETH: 320, description: "Specialist trained to neutralise any explosive device." },
      { name: "AI Drone Handler",      symbol: "ADH",  priceETH: 360, description: "Controls a squad of tactical AI combat drones." },
      { name: "Sniper Ace",           symbol: "SAC",  priceETH: 450, description: "Long-range marksman with zero-wind precision targeting." },
    ],
  },
  {
    name: "Spaceships",
    chain: "Ethereum",
    symbol: "SSHP",
    items: [
      { name: "Viper Fighter Mk1",     symbol: "VFM1", priceETH: 600, description: "Fast single-pilot fighter with twin plasma cannons." },
      { name: "Nexus Cruiser",         symbol: "NCR",  priceETH: 1200,description: "Mid-range cruiser with advanced shield systems." },
      { name: "Hyper Drive Engine",    symbol: "HDE",  priceETH: 250, description: "Replacement engine part providing 40% speed boost." },
      { name: "Phantom Stealth Ship",  symbol: "PSS",  priceETH: 900, description: "Radar-invisible stealth spacecraft for covert ops." },
      { name: "Ion Thruster Pack",     symbol: "ITP",  priceETH: 180, description: "Upgradeable ion thruster set for any ship class." },
    ],
  },
  {
    name: "Racing Vehicles",
    chain: "Ethereum",
    symbol: "RVEH",
    items: [
      { name: "HyperBike GT",         symbol: "HBGT", priceETH: 550, description: "Ultra-fast racing bike built for gravity tracks." },
      { name: "Turbo Hovercar X",      symbol: "THX",  priceETH: 780, description: "Anti-gravity hovercar with turbo boost module." },
      { name: "Mag-Wheel Upgrade Kit", symbol: "MWU",  priceETH: 120, description: "Magnetic wheel set for improved cornering speed." },
      { name: "Neon Dragster 5000",    symbol: "ND5K", priceETH: 650, description: "Straight-line speed demon with neon drive system." },
      { name: "Combat Trike",          symbol: "CTR",  priceETH: 430, description: "Three-wheeled combat racer with front-mounted cannon." },
    ],
  },
  {
    name: "Artwork",
    chain: "Ethereum",
    symbol: "ART",
    items: [
      { name: "Genesis Warrior Portrait",    symbol: "GWP",  priceETH: 800,  description: "Original digital oil portrait of the first HyperTek warrior." },
      { name: "Neon City Skyline",           symbol: "NCS",  priceETH: 600,  description: "Vibrant neon cityscape from the HyperTek universe." },
      { name: "Cosmic Battle Scene",         symbol: "CBS",  priceETH: 1500, description: "Epic deep-space battle, hand-painted in 8K resolution." },
      { name: "Hyper Soldier Sketch",        symbol: "HSS",  priceETH: 400,  description: "Concept sketch of the iconic HyperTek soldier." },
      { name: "Abstract Data Stream",        symbol: "ADS",  priceETH: 350,  description: "Generative art piece representing blockchain data flow." },
    ],
  },
  {
    name: "Land and Bases",
    chain: "Ethereum",
    symbol: "LAND",
    items: [
      { name: "Desert Outpost Alpha",        symbol: "DOA",  priceETH: 2000, description: "Strategic desert base with resource extraction facilities." },
      { name: "Arctic Station Omega",        symbol: "ASO",  priceETH: 3500, description: "Fortified arctic base in the polar zone." },
      { name: "City Block 47",              symbol: "CB47", priceETH: 1800, description: "Prime urban land block in the central HyperTek city." },
      { name: "Mountain Fortress",          symbol: "MFT",  priceETH: 4200, description: "Defensible mountain stronghold with 360-degree visibility." },
      { name: "Ocean Platform Delta",       symbol: "OPD",  priceETH: 2800, description: "Off-shore naval platform for maritime operations." },
    ],
  },
];

// ─── NFT 101 education data ───────────────────────────────────────────────────
const NFT_101_DATA = [
  {
    title: "What is an NFT?",
    description: "An NFT (Non-Fungible Token) is a unique digital asset verified on the blockchain. Each one is one-of-a-kind and cannot be replicated.",
    icon: "🖼️",
    gradientFrom: "#1a4fd6",
    gradientTo: "#0e2d8a",
    link: "#",
    order: 1,
  },
  {
    title: "How to buy an NFT",
    description: "Connect your crypto wallet, browse the marketplace, select an item and click Buy Now. Confirm the transaction in your wallet.",
    icon: "🛒",
    gradientFrom: "#16a34a",
    gradientTo: "#064e1e",
    link: "#",
    order: 2,
  },
  {
    title: "What is minting?",
    description: "Minting is the process of creating a new NFT on the blockchain — publishing a unique token that represents ownership of a digital asset.",
    icon: "⚡",
    gradientFrom: "#7c3aed",
    gradientTo: "#3b0f8a",
    link: "#",
    order: 3,
  },
  {
    title: "How to stay protected in Web3",
    description: "Never share your seed phrase. Use hardware wallets for high-value assets and always verify contract addresses before signing transactions.",
    icon: "🛡️",
    gradientFrom: "#0891b2",
    gradientTo: "#0c4a6e",
    link: "#",
    order: 4,
  },
  {
    title: "How to create an NFT",
    description: "Prepare your digital asset, connect your wallet, use the HyperTek minting tool, set your price, and publish it to the marketplace.",
    icon: "✨",
    gradientFrom: "#ea580c",
    gradientTo: "#7c2d12",
    link: "#",
    order: 5,
  },
  {
    title: "How to sell an NFT",
    description: "List your NFT on the marketplace by setting a price, approving the contract, and confirming the listing transaction in your wallet.",
    icon: "💰",
    gradientFrom: "#dc2626",
    gradientTo: "#7f1d1d",
    link: "#",
    order: 6,
  },
  {
    title: "What is a crypto wallet?",
    description: "A crypto wallet stores your private keys and lets you interact with blockchains. Popular options include MetaMask and Rainbow Wallet.",
    icon: "👛",
    gradientFrom: "#4338ca",
    gradientTo: "#1e1b4b",
    link: "#",
    order: 7,
  },
  {
    title: "What is blockchain?",
    description: "A blockchain is a distributed ledger that records all transactions transparently and immutably, making it impossible to tamper with records.",
    icon: "⛓️",
    gradientFrom: "#0f766e",
    gradientTo: "#042f2e",
    link: "#",
    order: 8,
  },
  {
    title: "What are gas fees?",
    description: "Gas fees are payments made to blockchain validators for processing your transaction. They vary based on network congestion.",
    icon: "⛽",
    gradientFrom: "#b45309",
    gradientTo: "#451a03",
    link: "#",
    order: 9,
  },
  {
    title: "What is a smart contract?",
    description: "A smart contract is self-executing code on the blockchain that automatically enforces the rules of a transaction without intermediaries.",
    icon: "📜",
    gradientFrom: "#be185d",
    gradientTo: "#500724",
    link: "#",
    order: 10,
  },
  {
    title: "What is HyperTek?",
    description: "HyperTek is a play-to-earn NFT gaming universe where soldiers, land, weapons and vehicles are real digital assets you own.",
    icon: "🚀",
    gradientFrom: "#1d4ed8",
    gradientTo: "#172554",
    link: "#",
    order: 11,
  },
  {
    title: "What is Web3?",
    description: "Web3 is the next evolution of the internet built on blockchain technology, giving users ownership of their digital assets and data.",
    icon: "🌐",
    gradientFrom: "#0369a1",
    gradientTo: "#0c2840",
    link: "#",
    order: 12,
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB");

  // ── Seed parent collections + sub-collections ──
  let createdParents = 0;
  let skippedParents = 0;

  for (const cat of CATEGORIES) {
    const existing = await NFTSystem.findOne({
      "collection.name": cat.name,
      isParentCollection: true,
    });

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${cat.name}`);
      skippedParents++;
      continue;
    }

    const parent = await NFTSystem.create({
      collection: {
        name:   cat.name,
        symbol: cat.symbol,
        chain:  cat.chain,
        image:  "",
        royaltyPercent: 5,
        supply: cat.items.length,
        creator: "admin",
      },
      isParentCollection: true,
      status: "active",
      subCollections: cat.items.map((item, i) => ({
        name:        item.name,
        symbol:      item.symbol,
        description: item.description,
        priceETH:    item.priceETH,
        listed:      true,
        isFirstSale: true,
        tokenId:     i + 1,
      })),
    });

    console.log(`✅ Created: ${cat.name}  (${parent.subCollections.length} items, _id: ${parent._id})`);
    createdParents++;
  }

  // ── Seed NFT 101 ──
  let createdEdu = 0;
  let skippedEdu = 0;

  for (const edu of NFT_101_DATA) {
    const existing = await Nft101.findOne({ title: edu.title });
    if (existing) {
      skippedEdu++;
      continue;
    }
    await Nft101.create(edu);
    createdEdu++;
  }

  console.log("\n── Summary ──────────────────────────────────────────────");
  console.log(`📦 Parent collections: ${createdParents} created, ${skippedParents} skipped`);
  console.log(`📚 NFT 101 cards:      ${createdEdu} created, ${skippedEdu} skipped`);
  console.log("─────────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("✅ Done. Database disconnected.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
