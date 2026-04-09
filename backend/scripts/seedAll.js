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
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });

import SiteContent from "../Models/SiteContent.js";
import News        from "../Models/News.js";
import NFTSystem   from "../Models/NFTSystem.js";
import Nft101      from "../Models/Nft101.js";
import User        from "../Models/User.js";
import { Offer }   from "../Models/Offer.js";
import { Withdrawal } from "../Models/WithdrawalModel.js";
import { Payment } from "../Models/Payment.js";
import Activity    from "../Models/ActivityModel.js";
import Auction     from "../Models/AuctionModel.js";
import Trade       from "../Models/TradeModel.js";
import HireRent    from "../Models/HireRentModel.js";
import Bounty      from "../Models/BountyModel.js";

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
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
    status: "active",
  },
  {
    heading: "Season 1 Specialists Collection — Limited Supply",
    description: "The first wave of Specialist NFAs is now live. Ghost Recon Operators, Cyber Medics, and Sniper Aces are available in limited quantities. Each Specialist comes with unique in-game abilities and full buy-back protection.",
    image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800&q=80",
    status: "active",
  },
  {
    heading: "HyperTek Integrates Transak for Easy Crypto On-Ramp",
    description: "No crypto wallet? No problem. HyperTek now supports Transak — purchase USDC directly with your credit or debit card and start buying NFAs instantly. Your wallet is created automatically when you sign up.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
    status: "active",
  },
  {
    heading: "Spaceships Category Now Open — Own Your Fleet",
    description: "Command the skies with HyperTek's Spaceship NFAs. From the Viper Fighter Mk1 to the Phantom Stealth Ship, each vessel is a tradeable asset with real value and guaranteed buy-back protection for NFA holders.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
    status: "active",
  },
  {
    heading: "Annual CPI Adjustment: Protecting Your Asset Value",
    description: "HyperTek announces its commitment to annual CPI-based adjustments on all NFA minimum buy-back values. This ensures your assets retain real purchasing power over time, making HyperTek NFAs a store of value as well as a gaming asset.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    status: "active",
  },
  {
    heading: "Racing Vehicles Drop: Build Your Championship Team",
    description: "Five new Racing Vehicle NFCs are now on the marketplace — from the HyperBike GT to the Combat Trike. Collect, trade, and race your way to the top of the HyperTek championship leaderboard.",
    image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800&q=80",
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
  {
    name: "General", chain: "Base", symbol: "GEN",
    items: [
      { name: "HyperTek Starter Pack",  symbol: "HSP",  priceETH: 50,  description: "A bundle of miscellaneous items to kick-start your journey." },
      { name: "Collector's Badge",      symbol: "CLB",  priceETH: 30,  description: "Rare collectible badge for dedicated community members." },
      { name: "Mystery Crate",          symbol: "MYC",  priceETH: 75,  description: "Contains a random rare item from the HyperTek universe." },
      { name: "Season Pass Token",      symbol: "SPT",  priceETH: 120, description: "Grants access to exclusive season events and rewards." },
      { name: "Community Tribute",      symbol: "CMT",  priceETH: 25,  description: "A commemorative token for early HyperTek community supporters." },
    ],
  },
];

// ─── NFT 101 (handled by seedMarketplace.js with full data — here we just clean + re-insert) ──

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
    news_created++;
  }
  if (news_created > 0) console.log(`✅ News: ${news_created} articles created`);

  // 3. NFT Collections
  let nft_created = 0, nft_skipped = 0;
  for (const cat of CATEGORIES) {
    const existing = await NFTSystem.findOne({ "collection.name": cat.name, isParentCollection: true });
    if (existing) { nft_skipped++; continue; }
    await NFTSystem.create({
      collection: { name: cat.name, symbol: cat.symbol, chain: cat.chain, image: "", royaltyPercent: 5, supply: cat.items.length, creator: "admin" },
      isParentCollection: true,
      isDummy: true,
      status: "active",
      subCollections: cat.items.map((item, i) => ({
        name: item.name, symbol: item.symbol, description: item.description,
        priceETH: item.priceETH, listed: true, isFirstSale: true, tokenId: i + 1,
      })),
    });
    console.log(`✅ NFT Collection: ${cat.name} (${cat.items.length} items)`);
    nft_created++;
  }

  // Mark all existing seeded parent collections as isDummy=true.
  // Any collection created by a real user/admin via the panel will be created with isDummy:false by default.
  const migrated = await NFTSystem.updateMany(
    { isParentCollection: true },
    { $set: { isDummy: true } }
  );
  console.log(`✅ Migration: ${migrated.modifiedCount} collections marked isDummy=true`);

  // 4. NFT 101 — delete all old entries and leave clean for seedMarketplace.js
  //    seedMarketplace.js has the full data (images, body, sections).
  const edu_deleted = await Nft101.deleteMany({});
  console.log(`🗑️  NFT 101: ${edu_deleted.deletedCount} old entries removed (run seedMarketplace.js to re-populate)`);

  // 5. Users
  let users_created = 0, users_skipped = 0;
  const USERS = [
    { Email: "alice@hypertek.com",   FullName: "Alice Walker",   Password: "User@1234", Role: "user", Bio: "NFT collector and gaming enthusiast." },
    { Email: "bob@hypertek.com",     FullName: "Bob Martinez",   Password: "User@1234", Role: "user", Bio: "Blockchain developer and digital artist." },
    { Email: "charlie@hypertek.com", FullName: "Charlie Kim",    Password: "User@1234", Role: "user", Bio: "Play-to-earn gamer and crypto investor." },
  ];
  const createdUsers = [];
  for (const u of USERS) {
    const existing = await User.findOne({ Email: u.Email });
    if (existing) { users_skipped++; createdUsers.push(existing); continue; }
    const hashed = await bcrypt.hash(u.Password, 10);
    const user = await User.create({ ...u, Password: hashed });
    createdUsers.push(user);
    users_created++;
  }
  if (users_created > 0) console.log(`✅ Users: ${users_created} created`);

  // 6. Offers
  let offers_created = 0, offers_skipped = 0;
  if (createdUsers.length >= 2) {
    const nfts = await NFTSystem.find({ isParentCollection: true }).limit(3);
    const OFFERS = [
      {
        serialNumber: "OFFER-001",
        gameId: nfts[0]?._id?.toString() || "000000000000000000000001",
        gameTitle: nfts[0]?.collection?.name || "Desert Storm Skin",
        gameActualPrice: 45,
        offerPrice: 38,
        priceDuration: "7 days",
        userId: createdUsers[0]._id,
        userName: createdUsers[0].FullName,
        userEmail: createdUsers[0].Email,
        ownerId: createdUsers[1]._id?.toString(),
        ownerName: createdUsers[1].FullName,
        ownerEmail: createdUsers[1].Email,
        requestStatus: "pending",
        paymentStatus: "unpaid",
      },
      {
        serialNumber: "OFFER-002",
        gameId: nfts[1]?._id?.toString() || "000000000000000000000002",
        gameTitle: nfts[1]?.collection?.name || "Hyper Assault Rifle",
        gameActualPrice: 120,
        offerPrice: 100,
        priceDuration: "3 days",
        userId: createdUsers[1]._id,
        userName: createdUsers[1].FullName,
        userEmail: createdUsers[1].Email,
        ownerId: createdUsers[2]._id?.toString(),
        ownerName: createdUsers[2].FullName,
        ownerEmail: createdUsers[2].Email,
        requestStatus: "accepted",
        paymentStatus: "paid",
      },
      {
        serialNumber: "OFFER-003",
        gameId: nfts[2]?._id?.toString() || "000000000000000000000003",
        gameTitle: nfts[2]?.collection?.name || "Commander's Cross",
        gameActualPrice: 300,
        offerPrice: 270,
        priceDuration: "5 days",
        userId: createdUsers[2]._id,
        userName: createdUsers[2].FullName,
        userEmail: createdUsers[2].Email,
        ownerId: createdUsers[0]._id?.toString(),
        ownerName: createdUsers[0].FullName,
        ownerEmail: createdUsers[0].Email,
        requestStatus: "rejected",
        paymentStatus: "unpaid",
      },
    ];
    for (const o of OFFERS) {
      const existing = await Offer.findOne({ serialNumber: o.serialNumber });
      if (existing) { offers_skipped++; continue; }
      await Offer.create(o);
      offers_created++;
    }
    if (offers_created > 0) console.log(`✅ Offers: ${offers_created} created`);
  }

  // 7. Withdrawals
  let wd_created = 0, wd_skipped = 0;
  if (createdUsers.length >= 2) {
    const WITHDRAWALS = [
      {
        user: createdUsers[0]._id,
        amount: 150,
        type: "crypto",
        status: "pending",
        recipientAddress: "0xAbC123456789DeF0000000000000000000000001",
        token: "USDC",
        currency: "USD",
      },
      {
        user: createdUsers[1]._id,
        amount: 500,
        type: "bank",
        status: "completed",
        bankDetails: {
          accountHolderName: "Bob Martinez",
          bankName: "Commonwealth Bank",
          accountNumber: "1234567890",
          swift: "CTBAAU2S",
          country: "Australia",
        },
        currency: "USD",
      },
      {
        user: createdUsers[2]._id,
        amount: 80,
        type: "crypto",
        status: "rejected",
        recipientAddress: "0xDeF987654321AbC0000000000000000000000003",
        token: "USDC",
        currency: "USD",
      },
    ];
    for (const w of WITHDRAWALS) {
      const existing = await Withdrawal.findOne({ user: w.user, amount: w.amount, type: w.type });
      if (existing) { wd_skipped++; continue; }
      await Withdrawal.create(w);
      wd_created++;
    }
    if (wd_created > 0) console.log(`✅ Withdrawals: ${wd_created} created`);
  }

  // 8. Payments
  let pay_created = 0, pay_skipped = 0;
  if (createdUsers.length >= 2) {
    const nfts = await NFTSystem.find({ isParentCollection: true }).limit(2);
    const PAYMENTS = [
      {
        userId: createdUsers[0]._id,
        productId: nfts[0]?._id || new mongoose.Types.ObjectId(),
        gameTitle: nfts[0]?.collection?.name || "Desert Storm Skin",
        amount: 4500,
        currency: "usd",
        provider: "stripe",
        transactionId: "pi_seed_001_test",
        referenceId: "pi_seed_001_test",
        paymentMethod: "card",
        status: "succeeded",
        itemType: "nft",
        serialNumber: "PAY-SEED-001",
      },
      {
        userId: createdUsers[1]._id,
        productId: nfts[1]?._id || new mongoose.Types.ObjectId(),
        gameTitle: nfts[1]?.collection?.name || "Hyper Assault Rifle",
        amount: 12000,
        currency: "usd",
        provider: "crypto",
        transactionId: "0xSEED_TX_002_HASH",
        referenceId: "0xSEED_TX_002_HASH",
        paymentMethod: "USDC",
        status: "succeeded",
        itemType: "nft",
        serialNumber: "PAY-SEED-002",
      },
      {
        userId: createdUsers[2]._id,
        productId: new mongoose.Types.ObjectId(),
        gameTitle: "Ghost Recon Operator",
        amount: 40000,
        currency: "usd",
        provider: "stripe",
        transactionId: "pi_seed_003_test",
        referenceId: "pi_seed_003_test",
        paymentMethod: "card",
        status: "pending",
        itemType: "nft",
        serialNumber: "PAY-SEED-003",
      },
    ];
    for (const p of PAYMENTS) {
      const existing = await Payment.findOne({ transactionId: p.transactionId });
      if (existing) { pay_skipped++; continue; }
      await Payment.create(p);
      pay_created++;
    }
    if (pay_created > 0) console.log(`✅ Payments: ${pay_created} created`);
  }

  // 9. Activities
  let act_created = 0, act_skipped = 0;
  if (createdUsers.length >= 2) {
    const nfts = await NFTSystem.find({ isParentCollection: true }).limit(3);
    const ACTIVITIES = [
      {
        userId: createdUsers[0]._id,
        name: nfts[0]?.collection?.name || "Desert Storm Skin",
        type: "buy",
        buyer: createdUsers[0].FullName,
        seller: createdUsers[1].FullName,
        price: 45,
        itemType: "NFA",
        itemId: nfts[0]?._id || new mongoose.Types.ObjectId(),
      },
      {
        userId: createdUsers[1]._id,
        name: nfts[1]?.collection?.name || "Hyper Assault Rifle",
        type: "sell",
        buyer: createdUsers[2].FullName,
        seller: createdUsers[1].FullName,
        price: 120,
        itemType: "NFA",
        itemId: nfts[1]?._id || new mongoose.Types.ObjectId(),
      },
      {
        userId: createdUsers[2]._id,
        name: nfts[2]?.collection?.name || "Commander's Cross",
        type: "buy",
        buyer: createdUsers[2].FullName,
        seller: createdUsers[0].FullName,
        price: 300,
        itemType: "NFA",
        itemId: nfts[2]?._id || new mongoose.Types.ObjectId(),
      },
    ];
    for (const a of ACTIVITIES) {
      const existing = await Activity.findOne({ userId: a.userId, name: a.name, type: a.type });
      if (existing) { act_skipped++; continue; }
      await Activity.create(a);
      act_created++;
    }
    if (act_created > 0) console.log(`✅ Activities: ${act_created} created`);
  }

  // 10. Sample Auctions — delete all and re-insert with distinct endTimes
  let auc_created = 0;
  {
    await Auction.deleteMany({});
    const _s = createdUsers.length >= 2 ? createdUsers[0]._id : null;
    const _s2 = createdUsers.length >= 2 ? createdUsers[1]._id : null;
    const now = Date.now();
    // Three distinct countdowns per Don's brief: ~5h31m, ~1d7h18m, ~3d9h45m, then varied
    const SAMPLE_AUCTIONS = [
      {
        title: "Shadow Ops Skin — Legendary",
        description: "Jet black covert operations skin with night-vision accents. Extremely rare limited edition.",
        category: "Skins", isNFA: true,
        startPrice: 250, currentBid: 320, reservePrice: 200, instantBuyPrice: 500,
        endTime: new Date(now + 5 * 3600000 + 31 * 60000),        // ~05:31:00
        seller: _s, sellerWallet: "0xSEED_WALLET_SELLER_001",
        bidHistory: [
          { bidderWallet: "0xBIDDER_001", bidderName: "WarriorX",    amount: 260, placedAt: new Date(now - 86400000 * 2) },
          { bidderWallet: "0xBIDDER_002", bidderName: "SniperElite", amount: 280, placedAt: new Date(now - 86400000) },
          { bidderWallet: "0xBIDDER_003", bidderName: "GhostOps",    amount: 320, placedAt: new Date(now - 3600000) },
        ],
      },
      {
        title: "Rail Sniper X90 — Gold Edition",
        description: "Long-range rail gun sniper with electro-targeting. Gold-plated collector's edition.",
        category: "Weapons", isNFA: false,
        startPrice: 150, currentBid: 180, instantBuyPrice: null,
        endTime: new Date(now + 31 * 3600000 + 18 * 60000 + 30000), // ~1d 07:18:30
        seller: _s2, sellerWallet: "0xSEED_WALLET_SELLER_002",
        bidHistory: [
          { bidderWallet: "0xBIDDER_004", bidderName: "DarkHunter", amount: 160, placedAt: new Date(now - 86400000 * 3) },
          { bidderWallet: "0xBIDDER_005", bidderName: "IronWill",   amount: 180, placedAt: new Date(now - 86400000) },
        ],
      },
      {
        title: "Viper Fighter Mk1 — Commander",
        description: "Fast single-pilot fighter with twin plasma cannons. Commander edition with custom paint.",
        category: "Spaceships", isNFA: true,
        startPrice: 1200, currentBid: 1800, instantBuyPrice: 2500,
        endTime: new Date(now + 81 * 3600000 + 45 * 60000 + 59000), // ~3d 09:45:59
        seller: _s, sellerWallet: "0xSEED_WALLET_SELLER_001",
        bidHistory: [
          { bidderWallet: "0xBIDDER_006", bidderName: "PilotAce",    amount: 1400, placedAt: new Date(now - 86400000 * 2) },
          { bidderWallet: "0xBIDDER_007", bidderName: "StarCommand", amount: 1600, placedAt: new Date(now - 86400000) },
          { bidderWallet: "0xBIDDER_008", bidderName: "NovaPilot",   amount: 1800, placedAt: new Date(now - 7200000) },
        ],
      },
      {
        title: "Desert Outpost Alpha — Fortified",
        description: "Strategic desert base with resource extraction facilities. Fully fortified with defensive turrets.",
        category: "Land & Bases", isNFA: true,
        startPrice: 3000, currentBid: 4500, instantBuyPrice: 6000,
        endTime: new Date(now + 48 * 3600000),                       // ~2d
        seller: _s2, sellerWallet: "0xSEED_WALLET_SELLER_002",
        bidHistory: [
          { bidderWallet: "0xBIDDER_009", bidderName: "LandBaron",   amount: 3500, placedAt: new Date(now - 86400000 * 4) },
          { bidderWallet: "0xBIDDER_010", bidderName: "Conqueror",   amount: 4000, placedAt: new Date(now - 86400000 * 2) },
          { bidderWallet: "0xBIDDER_011", bidderName: "TerraFormer", amount: 4500, placedAt: new Date(now - 86400000) },
        ],
      },
      {
        title: "Ghost Recon Operator — Elite",
        description: "Elite recon specialist with ghost cloak ability. Maximum stealth rating.",
        category: "Specialists", isNFA: false,
        startPrice: 380, currentBid: 420, instantBuyPrice: 600,
        endTime: new Date(now + 22 * 3600000),                       // ~22h
        seller: _s, sellerWallet: "0xSEED_WALLET_SELLER_001",
        bidHistory: [
          { bidderWallet: "0xBIDDER_012", bidderName: "StealthKing", amount: 400, placedAt: new Date(now - 86400000 * 2) },
          { bidderWallet: "0xBIDDER_013", bidderName: "NightOwl",    amount: 420, placedAt: new Date(now - 86400000) },
        ],
      },
      {
        title: "HyperBike GT — Neon Circuit",
        description: "Ultra-fast racing bike built for gravity tracks. Neon Circuit limited edition.",
        category: "Racing Vehicles", isNFA: false,
        startPrice: 550, currentBid: 660, instantBuyPrice: 900,
        endTime: new Date(now + 120 * 3600000),                      // ~5d
        seller: _s2, sellerWallet: "0xSEED_WALLET_SELLER_002",
        bidHistory: [
          { bidderWallet: "0xBIDDER_014", bidderName: "SpeedDemon", amount: 600, placedAt: new Date(now - 86400000 * 3) },
          { bidderWallet: "0xBIDDER_015", bidderName: "RacerX",     amount: 660, placedAt: new Date(now - 86400000) },
        ],
      },
      {
        title: "Star of Honour — Genesis",
        description: "The highest honour awarded in the HyperTek universe. Genesis edition — first batch ever minted.",
        category: "Badges", isNFA: true,
        startPrice: 1500, currentBid: 2100, instantBuyPrice: 3000,
        endTime: new Date(now + 168 * 3600000),                      // ~7d
        seller: _s, sellerWallet: "0xSEED_WALLET_SELLER_001",
        bidHistory: [
          { bidderWallet: "0xBIDDER_016", bidderName: "Collector1",     amount: 1700, placedAt: new Date(now - 86400000 * 5) },
          { bidderWallet: "0xBIDDER_017", bidderName: "MedalHunter",    amount: 1900, placedAt: new Date(now - 86400000 * 3) },
          { bidderWallet: "0xBIDDER_018", bidderName: "PrestigeMax",    amount: 2100, placedAt: new Date(now - 86400000) },
        ],
      },
      {
        title: "Cosmic Battle Scene — 1/1",
        description: "Epic deep-space battle, hand-painted in 8K resolution. One-of-one artwork.",
        category: "Artwork", isNFA: true,
        startPrice: 4000, currentBid: 5200, instantBuyPrice: 8000,
        endTime: new Date(now + 96 * 3600000),                       // ~4d
        seller: _s2, sellerWallet: "0xSEED_WALLET_SELLER_002",
        bidHistory: [
          { bidderWallet: "0xBIDDER_019", bidderName: "ArtLover",       amount: 4500, placedAt: new Date(now - 86400000 * 4) },
          { bidderWallet: "0xBIDDER_020", bidderName: "DigitalGallery", amount: 5200, placedAt: new Date(now - 86400000 * 2) },
        ],
      },
    ];
    const docs = SAMPLE_AUCTIONS.map(a => ({ ...a, status: "active" }));
    await Auction.insertMany(docs);
    auc_created = docs.length;
    console.log(`✅ Auctions: ${auc_created} inserted fresh (distinct countdowns)`);
  }

  // 11. Sample Trades & Quests (in-game feature preview)
  let trade_created = 0, trade_skipped = 0;
  if (createdUsers.length >= 2) {
    const SAMPLE_TRADES = [
      {
        type: "quest",
        title: "Retrieve the Lost Data Core",
        description: "Infiltrate the abandoned tech facility in Sector 7 and recover the encrypted data core. Beware of AI sentinels guarding the perimeter.",
        reward: 250,
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
        poster: createdUsers[0]._id,
        posterWallet: "0xSEED_WALLET_POSTER_001",
        posterName: "Commander Alpha",
        category: "retrieval",
      },
      {
        type: "trade",
        title: "Assault Rifle ↔ Stealth Kit",
        description: "Looking to trade my Hyper Assault Rifle for a Stealth Composite Vest. Willing to negotiate.",
        offering: "Hyper Assault Rifle (120 USDC)",
        requesting: "Stealth Composite Vest",
        image: "https://images.unsplash.com/photo-1614680376408-16afefa3332b?w=800&q=80",
        poster: createdUsers[1]._id,
        posterWallet: "0xSEED_WALLET_POSTER_002",
        posterName: "ShadowTrader_99",
        category: "weapons",
      },
      {
        type: "quest",
        title: "Defend Outpost Alpha — Wave Survival",
        description: "Hold Outpost Alpha for 10 waves against enemy forces. Minimum squad of 3 required. Bonus reward for zero casualties.",
        reward: 500,
        image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
        poster: createdUsers[0]._id,
        posterWallet: "0xSEED_WALLET_POSTER_001",
        posterName: "General Haze",
        category: "defense",
      },
      {
        type: "trade",
        title: "Viper Fighter for Land Plot",
        description: "Offering my Viper Fighter Mk1 spaceship in exchange for a strategic land plot. Desert or Arctic locations preferred.",
        offering: "Viper Fighter Mk1 (600 USDC)",
        requesting: "Any Land Plot (Desert/Arctic)",
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
        poster: createdUsers[1]._id,
        posterWallet: "0xSEED_WALLET_POSTER_002",
        posterName: "PilotZero",
        category: "spaceships",
      },
      {
        type: "quest",
        title: "Hunt the Rogue AI — Intel Required",
        description: "Track down the rogue AI entity 'NEXUS-7' across three map zones. Deliver location coordinates for reward. Time-limited mission.",
        reward: 800,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
        poster: createdUsers[0]._id,
        posterWallet: "0xSEED_WALLET_POSTER_001",
        posterName: "Intel Division",
        category: "intel",
      },
      {
        type: "trade",
        title: "Dual Badge Swap",
        description: "Have Commander's Cross and Iron Shield Badge. Looking for Star of Honour. Will offer both badges plus 100 USDC.",
        offering: "Commander's Cross + Iron Shield Badge + 100 USDC",
        requesting: "Star of Honour",
        image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80",
        poster: createdUsers[1]._id,
        posterWallet: "0xSEED_WALLET_POSTER_002",
        posterName: "MedalCollector",
        category: "military badges",
      },
    ];
    for (const t of SAMPLE_TRADES) {
      const existing = await Trade.findOne({ title: t.title });
      if (existing) { trade_skipped++; continue; }
      await Trade.create({ ...t, status: "open" });
      trade_created++;
    }
    if (trade_created > 0) console.log(`✅ Trades/Quests: ${trade_created} created`);
  }

  // 12. Sample Hire/Rent listings (in-game feature preview)
  let hire_created = 0, hire_skipped = 0;
  if (createdUsers.length >= 2) {
    const SAMPLE_HIRE_RENT = [
      {
        type: "hire",
        itemTitle: "Ghost Recon Operator — S-Tier",
        itemDescription: "Elite recon specialist with ghost cloak ability. Ideal for stealth missions and intel gathering operations.",
        pricePerDuration: 45,
        durationHours: 24,
        owner: createdUsers[0]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_001",
        ownerName: "CommanderX",
        category: "specialists",
      },
      {
        type: "rent",
        itemTitle: "Rail Sniper X90 — Gold Edition",
        itemDescription: "Long-range rail gun sniper with electro-targeting. Perfect for overwatch and defensive positions.",
        pricePerDuration: 25,
        durationHours: 72,
        owner: createdUsers[1]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_002",
        ownerName: "ArmsDealer_42",
        category: "weapons",
      },
      {
        type: "hire",
        itemTitle: "AI Drone Handler — Advanced",
        itemDescription: "Controls a squad of tactical AI combat drones. Provides aerial support and reconnaissance capabilities.",
        pricePerDuration: 60,
        durationHours: 168,
        owner: createdUsers[0]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_001",
        ownerName: "DroneOps",
        category: "specialists",
      },
      {
        type: "rent",
        itemTitle: "Turbo Hovercar X — Competition",
        itemDescription: "Anti-gravity hovercar with turbo boost module. Dominate the racing circuit with this speed machine.",
        pricePerDuration: 80,
        durationHours: 24,
        owner: createdUsers[1]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_002",
        ownerName: "SpeedKing",
        category: "racing vehicles",
      },
      {
        type: "rent",
        itemTitle: "Exo-Skeleton Mk3 — Tactical",
        itemDescription: "Full exoskeleton suit with powered joints. Provides superhuman strength and ballistic protection.",
        pricePerDuration: 55,
        durationHours: 72,
        owner: createdUsers[0]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_001",
        ownerName: "HeavyArms",
        category: "body armour",
      },
      {
        type: "hire",
        itemTitle: "Cyber Medic — Field Support",
        itemDescription: "Field medic with advanced cybernetic healing tools. Essential for squad survival in prolonged missions.",
        pricePerDuration: 35,
        durationHours: 24,
        owner: createdUsers[1]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_002",
        ownerName: "MedCorps",
        category: "specialists",
      },
      {
        type: "rent",
        itemTitle: "Phantom Stealth Ship — Covert",
        itemDescription: "Radar-invisible stealth spacecraft for covert ops. Silent approach and extraction capability.",
        pricePerDuration: 120,
        durationHours: 168,
        owner: createdUsers[0]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_001",
        ownerName: "NavalCommander",
        category: "spaceships",
      },
      {
        type: "hire",
        itemTitle: "Sniper Ace — Long Range",
        itemDescription: "Long-range marksman with zero-wind precision targeting. Maximum effective range specialist.",
        pricePerDuration: 50,
        durationHours: 72,
        owner: createdUsers[1]._id,
        ownerWallet: "0xSEED_WALLET_OWNER_002",
        ownerName: "LongShot",
        category: "specialists",
      },
    ];
    for (const h of SAMPLE_HIRE_RENT) {
      const existing = await HireRent.findOne({ itemTitle: h.itemTitle });
      if (existing) { hire_skipped++; continue; }
      await HireRent.create({ ...h, status: "available" });
      hire_created++;
    }
    if (hire_created > 0) console.log(`✅ Hire/Rent: ${hire_created} created`);
  }

  // 13. Sample Bounties (in-game feature preview)
  let bounty_created = 0, bounty_skipped = 0;
  if (createdUsers.length >= 2) {
    const SAMPLE_BOUNTIES = [
      {
        title: "Eliminate Rogue Commander Vex",
        targetName: "Commander Vex",
        description: "High-priority target operating in Sector 9. Known for ambushing supply convoys. Eliminate and provide proof of defeat.",
        reward: 500,
        poster: createdUsers[0]._id,
        posterWallet: "0xSEED_WALLET_POSTER_001",
        posterName: "HQ Command",
        category: "pvp",
      },
      {
        title: "Destroy Rogue AI Nexus-7",
        targetName: "NEXUS-7 AI Entity",
        description: "Rogue artificial intelligence has taken control of the Eastern Grid. Locate and neutralise its core processor.",
        reward: 1200,
        poster: createdUsers[1]._id,
        posterWallet: "0xSEED_WALLET_POSTER_002",
        posterName: "Intel Division",
        category: "raid",
      },
      {
        title: "Capture Enemy Officer — Intel",
        targetName: "Lt. Shadow Wolf",
        description: "Capture the enemy intelligence officer alive. Prisoner must be delivered to forward operating base for interrogation.",
        reward: 800,
        poster: createdUsers[0]._id,
        posterWallet: "0xSEED_WALLET_POSTER_001",
        posterName: "Special Ops Unit",
        category: "intel",
      },
      {
        title: "Raid Supply Depot — Sector 4",
        targetName: "Supply Depot Echo",
        description: "Enemy supply depot in Sector 4 must be destroyed. Destroy at least 80% of stored materials for full reward.",
        reward: 350,
        poster: createdUsers[1]._id,
        posterWallet: "0xSEED_WALLET_POSTER_002",
        posterName: "Resistance HQ",
        category: "raid",
      },
      {
        title: "Intercept Communications Array",
        targetName: "Comm Array Delta",
        description: "Hack into the enemy communications array in the northern mountains. Extract encryption keys and disable the system.",
        reward: 650,
        poster: createdUsers[0]._id,
        posterWallet: "0xSEED_WALLET_POSTER_001",
        posterName: "Cyber Division",
        category: "intel",
      },
      {
        title: "Escort VIP Through Warzone",
        targetName: "Dr. Elara Chen",
        description: "Safely escort Dr. Chen through contested Sector 12 to the extraction point. Priority one protection — no casualties.",
        reward: 900,
        poster: createdUsers[1]._id,
        posterWallet: "0xSEED_WALLET_POSTER_002",
        posterName: "Defence Ministry",
        category: "escort",
      },
    ];
    for (const b of SAMPLE_BOUNTIES) {
      const existing = await Bounty.findOne({ title: b.title });
      if (existing) { bounty_skipped++; continue; }
      await Bounty.create({ ...b, status: "open" });
      bounty_created++;
    }
    if (bounty_created > 0) console.log(`✅ Bounties: ${bounty_created} created`);
  }

  console.log("\n── Summary ──────────────────────────────────────────────────");
  console.log(`📄 SiteContent:    ${sc_created} created,  ${sc_skipped} skipped`);
  console.log(`📰 News:           ${news_created} created,  ${news_skipped} skipped`);
  console.log(`📦 NFT Collections:${nft_created} created,  ${nft_skipped} skipped`);
  console.log(`📚 NFT 101 cards:  ${edu_deleted.deletedCount} cleaned (use seedMarketplace.js to populate)`);
  console.log(`👤 Users:          ${users_created} created,  ${users_skipped} skipped`);
  console.log(`📝 Offers:         ${offers_created} created,  ${offers_skipped} skipped`);
  console.log(`💸 Withdrawals:    ${wd_created} created,  ${wd_skipped} skipped`);
  console.log(`💳 Payments:       ${pay_created} created,  ${pay_skipped} skipped`);
  console.log(`📊 Activities:     ${act_created} created,  ${act_skipped} skipped`);
  console.log(`🔨 Auctions:       ${auc_created} created (fresh insert)`);
  console.log(`⚔️  Trades/Quests:  ${trade_created} created,  ${trade_skipped} skipped`);
  console.log(`👥 Hire/Rent:      ${hire_created} created,  ${hire_skipped} skipped`);
  console.log(`🎯 Bounties:       ${bounty_created} created,  ${bounty_skipped} skipped`);
  console.log("─────────────────────────────────────────────────────────────\n");
  console.log("🔑 Test user credentials:");
  console.log("   alice@hypertek.com   / User@1234");
  console.log("   bob@hypertek.com     / User@1234");
  console.log("   charlie@hypertek.com / User@1234");

  await mongoose.disconnect();
  console.log("\n✅ Done.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
