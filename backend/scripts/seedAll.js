/**
 * Master seed script
 *
 * Seeds:
 *   1. SiteContent  — CMS sections for home + about pages
 *   2. News         — sample news articles
 *   3. NFT parent collections + sub-collections (9 categories)
 *   4. NFT 101 education cards
 *
 * Run:
 *   node scripts/seedAll.js
 *
 * Safe to re-run: skips any record that already exists.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });

import SiteContent from "../Models/SiteContent.js";
import News        from "../Models/News.js";
import NFTSystem   from "../Models/NFTSystem.js";
import Nft101      from "../Models/Nft101.js";

// ─── SiteContent ─────────────────────────────────────────────────────────────
const SITE_CONTENT = [
  {
    sectionKey: "home_hero",
    sectionLabel: "Hero Banner",
    pageGroup: "home",
    fields: [
      { key: "heading",    label: "Main Heading",    type: "text",     value: "Welcome to HyperTek" },
      { key: "subheading", label: "Sub Heading",     type: "text",     value: "The Future of Gaming NFTs" },
      { key: "body",       label: "Body Text",       type: "textarea", value: "Own, trade, and battle with real digital assets in the HyperTek universe. Your NFTs. Your rules." },
      { key: "cta_text",   label: "CTA Button Text", type: "text",     value: "Explore Marketplace" },
    ],
  },
  {
    sectionKey: "home_about",
    sectionLabel: "About HyperTek",
    pageGroup: "home",
    fields: [
      { key: "heading",    label: "Section Heading", type: "text",     value: "About HyperTek" },
      { key: "body",       label: "Body Text",       type: "textarea", value: "HyperTek is a next-generation play-to-earn NFT gaming platform built on the Base blockchain. We offer a fully on-chain marketplace where players can buy, sell, and trade digital game assets — from weapons and skins to land and vehicles. Every asset is backed by a guaranteed minimum buy-back value, making HyperTek NFTs a unique blend of gaming and digital investment." },
    ],
  },
  {
    sectionKey: "home_how_it_works",
    sectionLabel: "How It Works",
    pageGroup: "home",
    fields: [
      { key: "heading", label: "Section Heading", type: "text", value: "How It Works" },
      {
        key: "steps", label: "Steps", type: "list",
        value: [
          { title: "Create a Wallet",       description: "Connect your crypto wallet (MetaMask or Coinbase Wallet) to get started." },
          { title: "Browse the Marketplace", description: "Explore thousands of unique gaming NFTs across 9 categories." },
          { title: "Buy or Mint",           description: "Purchase existing NFTs or mint your own unique digital assets." },
          { title: "Play & Earn",           description: "Use your NFTs in-game and earn rewards through trading and gameplay." },
        ],
      },
    ],
  },
  {
    sectionKey: "about_top",
    sectionLabel: "About Page — Top Section",
    pageGroup: "about",
    fields: [
      { key: "heading", label: "Heading",   type: "text",     value: "The HyperTek Story" },
      { key: "body",    label: "Body Text", type: "textarea", value: "Born from a passion for gaming and blockchain technology, HyperTek was built to give players true ownership of their in-game assets." },
    ],
  },
  {
    sectionKey: "about_story",
    sectionLabel: "About Page — Our Story",
    pageGroup: "about",
    fields: [
      { key: "heading", label: "Heading",   type: "text",     value: "Our Mission" },
      { key: "body",    label: "Body Text", type: "textarea", value: "We believe the future of gaming is ownership. HyperTek combines AAA gaming experiences with the security and transparency of blockchain, ensuring every player truly owns what they earn." },
    ],
  },
  {
    sectionKey: "about_ecosystem",
    sectionLabel: "About Page — Ecosystem",
    pageGroup: "about",
    fields: [
      { key: "heading", label: "Heading",   type: "text",     value: "The HyperTek Ecosystem" },
      {
        key: "features", label: "Features", type: "list",
        value: [
          { title: "NFT Marketplace",    description: "Trade digital assets with guaranteed buy-back protection." },
          { title: "Play-to-Earn",       description: "Earn real rewards by playing and competing in the HyperTek universe." },
          { title: "DAO Governance",     description: "HyperTek holders vote on platform decisions and future development." },
          { title: "Base Blockchain",    description: "Built on Coinbase's Base network for fast, low-cost transactions." },
        ],
      },
    ],
  },
];

// ─── News ─────────────────────────────────────────────────────────────────────
const NEWS_DATA = [
  {
    heading: "HyperTek Platform Launches on Base Mainnet",
    description: "We are thrilled to announce the official launch of the HyperTek NFT marketplace on Base mainnet. Players can now buy, sell, and trade digital game assets with full on-chain ownership and guaranteed buy-back protection.",
    image: "/uploads/news/news-placeholder.jpg",
    status: "active",
  },
  {
    heading: "New Category: Land and Bases Now Available",
    description: "Expand your territory in the HyperTek universe. Land and Bases NFTs are now live on the marketplace, offering players strategic locations with resource extraction capabilities and defensive advantages.",
    image: "/uploads/news/news-placeholder.jpg",
    status: "active",
  },
  {
    heading: "Understanding the HyperTek Buy-Back Guarantee",
    description: "Every NFA (Non-Fungible Asset) on HyperTek comes with a guaranteed minimum buy-back value. This means if you can't sell your asset at or above its reserve price, HyperTek will buy it back at the guaranteed minimum, adjusted for CPI each year.",
    image: "/uploads/news/news-placeholder.jpg",
    status: "active",
  },
];

// ─── NFT Categories ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Skins", chain: "Base", symbol: "SKIN",
    items: [
      { name: "Desert Storm Skin",    symbol: "DSS",  priceETH: 45,   description: "Camouflage desert warfare skin for elite soldiers." },
      { name: "Arctic Ghost Skin",    symbol: "AGS",  priceETH: 60,   description: "Icy blue stealth skin for cold-climate operations." },
      { name: "Shadow Ops Skin",      symbol: "SOS",  priceETH: 80,   description: "Jet black covert operations skin with night-vision accents." },
      { name: "Urban Assault Skin",   symbol: "UAS",  priceETH: 55,   description: "City warfare skin with tactical grey patterning." },
      { name: "Jungle Predator Skin", symbol: "JPS",  priceETH: 70,   description: "Dense jungle camouflage skin for rainforest missions." },
    ],
  },
  {
    name: "Weapons", chain: "Base", symbol: "WPNS",
    items: [
      { name: "Hyper Assault Rifle",  symbol: "HAR",  priceETH: 120,  description: "High-powered assault rifle with hyper-tech optics." },
      { name: "Plasma Pistol Mk2",    symbol: "PPM2", priceETH: 85,   description: "Compact plasma pistol with dual-fire mode." },
      { name: "Rail Sniper X90",      symbol: "RSX",  priceETH: 200,  description: "Long-range rail gun sniper with electro-targeting." },
      { name: "Frag Launcher Pro",    symbol: "FLP",  priceETH: 150,  description: "Grenade launcher with proximity detonation system." },
      { name: "Ion Blade Elite",      symbol: "IBE",  priceETH: 95,   description: "Electrified combat blade for close-quarters warfare." },
    ],
  },
  {
    name: "Military Badges and Collectables", chain: "Base", symbol: "MBAC",
    items: [
      { name: "Commander's Cross",    symbol: "CC",   priceETH: 300,  description: "Rare commander's cross awarded for battlefield leadership." },
      { name: "Purple Valor Medal",   symbol: "PVM",  priceETH: 250,  description: "Medal of valor for exceptional bravery under fire." },
      { name: "HyperTek Coin 2025",   symbol: "HTC",  priceETH: 180,  description: "Limited edition collectible coin for season 2025." },
      { name: "Iron Shield Badge",    symbol: "ISB",  priceETH: 140,  description: "Badge denoting mastery of defensive tactics." },
      { name: "Star of Honour",       symbol: "SOH",  priceETH: 500,  description: "The highest honour awarded in the HyperTek universe." },
    ],
  },
  {
    name: "Body Armour", chain: "Base", symbol: "BARM",
    items: [
      { name: "Nano-Mesh Vest",           symbol: "NMV",  priceETH: 110,  description: "Lightweight nano-fibre vest with ballistic resistance." },
      { name: "Exo-Skeleton Mk3",         symbol: "ESK3", priceETH: 350,  description: "Full exoskeleton suit with powered joints." },
      { name: "Carbon Plate Armour",      symbol: "CPA",  priceETH: 220,  description: "Hard carbon plates for heavy assault operations." },
      { name: "Stealth Composite Vest",   symbol: "SCV",  priceETH: 175,  description: "Radar-absorbing composite armour vest." },
      { name: "Titan Full Plate",         symbol: "TFP",  priceETH: 480,  description: "Maximum protection titanium alloy full body armour." },
    ],
  },
  {
    name: "Specialists", chain: "Base", symbol: "SPEC",
    items: [
      { name: "Ghost Recon Operator",  symbol: "GRO",  priceETH: 400,  description: "Elite recon specialist with ghost cloak ability." },
      { name: "Cyber Medic",           symbol: "CME",  priceETH: 280,  description: "Field medic with advanced cybernetic healing tools." },
      { name: "Bomb Disposal Expert",  symbol: "BDE",  priceETH: 320,  description: "Specialist trained to neutralise any explosive device." },
      { name: "AI Drone Handler",      symbol: "ADH",  priceETH: 360,  description: "Controls a squad of tactical AI combat drones." },
      { name: "Sniper Ace",            symbol: "SAC",  priceETH: 450,  description: "Long-range marksman with zero-wind precision targeting." },
    ],
  },
  {
    name: "Spaceships", chain: "Base", symbol: "SSHP",
    items: [
      { name: "Viper Fighter Mk1",     symbol: "VFM1", priceETH: 600,  description: "Fast single-pilot fighter with twin plasma cannons." },
      { name: "Nexus Cruiser",         symbol: "NCR",  priceETH: 1200, description: "Mid-range cruiser with advanced shield systems." },
      { name: "Hyper Drive Engine",    symbol: "HDE",  priceETH: 250,  description: "Replacement engine part providing 40% speed boost." },
      { name: "Phantom Stealth Ship",  symbol: "PSS",  priceETH: 900,  description: "Radar-invisible stealth spacecraft for covert ops." },
      { name: "Ion Thruster Pack",     symbol: "ITP",  priceETH: 180,  description: "Upgradeable ion thruster set for any ship class." },
    ],
  },
  {
    name: "Racing Vehicles", chain: "Base", symbol: "RVEH",
    items: [
      { name: "HyperBike GT",          symbol: "HBGT", priceETH: 550,  description: "Ultra-fast racing bike built for gravity tracks." },
      { name: "Turbo Hovercar X",      symbol: "THX",  priceETH: 780,  description: "Anti-gravity hovercar with turbo boost module." },
      { name: "Mag-Wheel Upgrade Kit", symbol: "MWU",  priceETH: 120,  description: "Magnetic wheel set for improved cornering speed." },
      { name: "Neon Dragster 5000",    symbol: "ND5K", priceETH: 650,  description: "Straight-line speed demon with neon drive system." },
      { name: "Combat Trike",          symbol: "CTR",  priceETH: 430,  description: "Three-wheeled combat racer with front-mounted cannon." },
    ],
  },
  {
    name: "Artwork", chain: "Base", symbol: "ART",
    items: [
      { name: "Genesis Warrior Portrait", symbol: "GWP",  priceETH: 800,  description: "Original digital oil portrait of the first HyperTek warrior." },
      { name: "Neon City Skyline",        symbol: "NCS",  priceETH: 600,  description: "Vibrant neon cityscape from the HyperTek universe." },
      { name: "Cosmic Battle Scene",      symbol: "CBS",  priceETH: 1500, description: "Epic deep-space battle, hand-painted in 8K resolution." },
      { name: "Hyper Soldier Sketch",     symbol: "HSS",  priceETH: 400,  description: "Concept sketch of the iconic HyperTek soldier." },
      { name: "Abstract Data Stream",     symbol: "ADS",  priceETH: 350,  description: "Generative art piece representing blockchain data flow." },
    ],
  },
  {
    name: "Land and Bases", chain: "Base", symbol: "LAND",
    items: [
      { name: "Desert Outpost Alpha",   symbol: "DOA",  priceETH: 2000, description: "Strategic desert base with resource extraction facilities." },
      { name: "Arctic Station Omega",   symbol: "ASO",  priceETH: 3500, description: "Fortified arctic base in the polar zone." },
      { name: "City Block 47",          symbol: "CB47", priceETH: 1800, description: "Prime urban land block in the central HyperTek city." },
      { name: "Mountain Fortress",      symbol: "MFT",  priceETH: 4200, description: "Defensible mountain stronghold with 360-degree visibility." },
      { name: "Ocean Platform Delta",   symbol: "OPD",  priceETH: 2800, description: "Off-shore naval platform for maritime operations." },
    ],
  },
];

// ─── NFT 101 ──────────────────────────────────────────────────────────────────
const NFT_101_DATA = [
  { title: "What is an NFT?",              icon: "🖼️", order: 1,  gradientFrom: "#1a4fd6", gradientTo: "#0e2d8a", description: "An NFT (Non-Fungible Token) is a unique digital asset verified on the blockchain. Each one is one-of-a-kind and cannot be replicated." },
  { title: "How to buy an NFT",            icon: "🛒", order: 2,  gradientFrom: "#16a34a", gradientTo: "#064e1e", description: "Connect your crypto wallet, browse the marketplace, select an item and click Buy Now. Confirm the transaction in your wallet." },
  { title: "What is minting?",             icon: "⚡", order: 3,  gradientFrom: "#7c3aed", gradientTo: "#3b0f8a", description: "Minting is the process of creating a new NFT on the blockchain — publishing a unique token that represents ownership of a digital asset." },
  { title: "How to stay protected",        icon: "🛡️", order: 4,  gradientFrom: "#0891b2", gradientTo: "#0c4a6e", description: "Never share your seed phrase. Use hardware wallets for high-value assets and always verify contract addresses before signing transactions." },
  { title: "How to create an NFT",         icon: "✨", order: 5,  gradientFrom: "#ea580c", gradientTo: "#7c2d12", description: "Prepare your digital asset, connect your wallet, use the HyperTek minting tool, set your price, and publish it to the marketplace." },
  { title: "How to sell an NFT",           icon: "💰", order: 6,  gradientFrom: "#dc2626", gradientTo: "#7f1d1d", description: "List your NFT on the marketplace by setting a price, approving the contract, and confirming the listing transaction in your wallet." },
  { title: "What is a crypto wallet?",     icon: "👛", order: 7,  gradientFrom: "#4338ca", gradientTo: "#1e1b4b", description: "A crypto wallet stores your private keys and lets you interact with blockchains. Popular options include MetaMask and Coinbase Wallet." },
  { title: "What is blockchain?",          icon: "⛓️", order: 8,  gradientFrom: "#0f766e", gradientTo: "#042f2e", description: "A blockchain is a distributed ledger that records all transactions transparently and immutably, making it impossible to tamper with records." },
  { title: "What are gas fees?",           icon: "⛽", order: 9,  gradientFrom: "#b45309", gradientTo: "#451a03", description: "Gas fees are payments made to blockchain validators for processing your transaction. They vary based on network congestion." },
  { title: "What is a smart contract?",    icon: "📜", order: 10, gradientFrom: "#be185d", gradientTo: "#500724", description: "A smart contract is self-executing code on the blockchain that automatically enforces the rules of a transaction without intermediaries." },
  { title: "What is HyperTek?",            icon: "🚀", order: 11, gradientFrom: "#1d4ed8", gradientTo: "#172554", description: "HyperTek is a play-to-earn NFT gaming universe where soldiers, land, weapons and vehicles are real digital assets you own." },
  { title: "What is Web3?",                icon: "🌐", order: 12, gradientFrom: "#0369a1", gradientTo: "#0c2840", description: "Web3 is the next evolution of the internet built on blockchain technology, giving users ownership of their digital assets and data." },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB\n");

  // 1. SiteContent
  let sc_created = 0, sc_skipped = 0;
  for (const section of SITE_CONTENT) {
    const existing = await SiteContent.findOne({ sectionKey: section.sectionKey });
    if (existing) { sc_skipped++; continue; }
    await SiteContent.create(section);
    console.log(`✅ SiteContent: ${section.sectionKey}`);
    sc_created++;
  }

  // 2. News
  let news_created = 0, news_skipped = 0;
  for (const article of NEWS_DATA) {
    const existing = await News.findOne({ heading: article.heading });
    if (existing) { news_skipped++; continue; }
    await News.create(article);
    console.log(`✅ News: ${article.heading.substring(0, 50)}...`);
    news_created++;
  }

  // 3. NFT Collections
  let nft_created = 0, nft_skipped = 0;
  for (const cat of CATEGORIES) {
    const existing = await NFTSystem.findOne({ "collection.name": cat.name, isParentCollection: true });
    if (existing) { nft_skipped++; continue; }
    await NFTSystem.create({
      collection: { name: cat.name, symbol: cat.symbol, chain: cat.chain, image: "", royaltyPercent: 5, supply: cat.items.length, creator: "admin" },
      isParentCollection: true,
      status: "active",
      subCollections: cat.items.map((item, i) => ({
        name: item.name, symbol: item.symbol, description: item.description,
        priceETH: item.priceETH, listed: true, isFirstSale: true, tokenId: i + 1,
      })),
    });
    console.log(`✅ NFT Collection: ${cat.name} (${cat.items.length} items)`);
    nft_created++;
  }

  // 4. NFT 101
  let edu_created = 0, edu_skipped = 0;
  for (const edu of NFT_101_DATA) {
    const existing = await Nft101.findOne({ title: edu.title });
    if (existing) { edu_skipped++; continue; }
    await Nft101.create(edu);
    edu_created++;
  }
  if (edu_created > 0) console.log(`✅ NFT 101: ${edu_created} cards created`);

  console.log("\n── Summary ──────────────────────────────────────────────────");
  console.log(`📄 SiteContent:    ${sc_created} created,  ${sc_skipped} skipped`);
  console.log(`📰 News:           ${news_created} created,  ${news_skipped} skipped`);
  console.log(`📦 NFT Collections:${nft_created} created,  ${nft_skipped} skipped`);
  console.log(`📚 NFT 101 cards:  ${edu_created} created,  ${edu_skipped} skipped`);
  console.log("─────────────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("✅ Done.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
