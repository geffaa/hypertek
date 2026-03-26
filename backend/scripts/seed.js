/**
 * Unified Master Seed Script
 *
 * Seeds (all safe to re-run — never overwrites existing data):
 *   1. SiteContent  — CMS sections (home, about, marketplace, profile, auth)
 *   2. News         — sample news articles
 *   3. NFT parent collections + sub-collections (9 categories)
 *   4. NFT 101 education cards
 *   5. Users        — test accounts
 *   6. Offers       — sample offers
 *   7. Withdrawals  — sample withdrawals
 *   8. Payments     — sample payments
 *   9. Activities   — sample activity log
 *  10. Images       — patch placeholder images onto NFT/News records (only if empty)
 *
 * Run:
 *   node --env-file=Config/.env scripts/seed.js
 *
 * Skip logic:
 *   - SiteContent: if section exists, adds only NEW fields (never overwrites values)
 *   - All other models: skips the entire record if it already exists
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });

import SiteContent  from "../Models/SiteContent.js";
import News         from "../Models/News.js";
import NFTSystem    from "../Models/NFTSystem.js";
import Nft101       from "../Models/Nft101.js";
import User         from "../Models/User.js";
import { Offer }    from "../Models/Offer.js";
import { Withdrawal } from "../Models/WithdrawalModel.js";
import { Payment }  from "../Models/Payment.js";
import Activity     from "../Models/ActivityModel.js";
import Trade        from "../Models/TradeModel.js";
import Bounty       from "../Models/BountyModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SITE CONTENT (CMS)
// ═══════════════════════════════════════════════════════════════════════════════

const SITE_CONTENT = [
    // ── Home: Hero Banner ──
    {
        sectionKey:   "home_hero",
        sectionLabel: "Hero Banner",
        pageGroup:    "home",
        fields: [
            { key: "heading_line1",    label: "Heading Line 1",    type: "text",     value: "Hyper Tek 100:" },
            { key: "heading_line2",    label: "Heading Line 2",    type: "text",     value: "WHERE LEGENDS Are Forged." },
            { key: "button1_text",     label: "Button 1 Text",     type: "text",     value: "MarketPlace" },
            { key: "button1_link",     label: "Button 1 Link",     type: "text",     value: "/market-place" },
            { key: "button2_text",     label: "Button 2 Text",     type: "text",     value: "Download Game" },
            { key: "button2_link",     label: "Button 2 Link",     type: "text",     value: "#" },
            { key: "background_image", label: "Background Image",  type: "image",    value: "" },
        ],
    },

    // ── Home: About HyperTek ──
    {
        sectionKey:   "home_about",
        sectionLabel: "About HyperTek",
        pageGroup:    "home",
        fields: [
            { key: "vertical_label", label: "Vertical Label", type: "text",     value: "HYPER TEK 100" },
            { key: "title",          label: "Title",           type: "text",     value: "The year is 2117." },
            {
                key: "body", label: "Body Text", type: "textarea",
                value: "Humanity didn't conquer the stars—it fractured into them. After Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation, forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you, a reborn Overlord, forged by legacy and technology.",
            },
            { key: "image_left",    label: "Left Image",    type: "image", value: "" },
            { key: "image_right_1", label: "Right Image 1", type: "image", value: "" },
            { key: "image_right_2", label: "Right Image 2", type: "image", value: "" },
        ],
    },

    // ── Home: How It Works ──
    {
        sectionKey:   "home_how_it_works",
        sectionLabel: "How It Works",
        pageGroup:    "home",
        fields: [
            { key: "section_title",    label: "Section Title",    type: "text",     value: "How It Works" },
            { key: "section_subtitle", label: "Section Subtitle", type: "textarea", value: "Get started in just a few steps and unlock the world of digital collectibles." },
            {
                key: "steps", label: "Steps", type: "list",
                value: [
                    { title: "Connect Wallet",      description: "Securely connect your crypto wallet to start buying, selling, and collecting NFTs." },
                    { title: "Explore Collections", description: "Browse trending collections and discover rare digital artworks from top creators." },
                    { title: "Collect & Trade",     description: "Buy your favorite NFTs and showcase or trade them on your profile anytime." },
                    { title: "Earn & Grow",         description: "Earn by selling your collections or gaining popularity in the NFT space." },
                ],
            },
        ],
    },

    // ── Home: Story Section ──
    {
        sectionKey:   "home_story",
        sectionLabel: "Story Section",
        pageGroup:    "home",
        fields: [
            { key: "background_image", label: "Background Image",           type: "image", value: "" },
            { key: "character_image",  label: "Character Image (Center)",   type: "image", value: "" },
            { key: "left_heading",     label: "Left Heading",               type: "text",  value: "STORY" },
            { key: "left_subheading",  label: "Left Subheading",            type: "text",  value: "The year is 2117." },
            {
                key: "left_body", label: "Left Body Text", type: "textarea",
                value: "Humanity didn't conquer the stars it fractured into them. After Earth collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you a reborn Overlord, forged by legacy and technology.",
            },
            { key: "right_heading",    label: "Right Heading",    type: "text", value: "STORY" },
            { key: "right_subheading", label: "Right Subheading", type: "text", value: "The year is 2117." },
            {
                key: "right_body", label: "Right Body Text", type: "textarea",
                value: "Humanity didn't conquer the stars it fractured into them. After Earth collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you a reborn Overlord, forged by legacy and technology.",
            },
            { key: "accent_color", label: "Accent Color (hex, e.g. #b89a00)", type: "text", value: "#b89a00" },
        ],
    },

    // ── Marketplace: Banner ──
    {
        sectionKey:   "marketplace_banner",
        sectionLabel: "Marketplace Banner",
        pageGroup:    "marketplace",
        fields: [
            { key: "heading",          label: "Banner Heading",           type: "text",     value: "A New Era Dawns in Hyper Tek" },
            { key: "description",      label: "Banner Description",       type: "textarea", value: "It's the start of a living, breathing universe where every decision shapes the journey. Whether you're racing at light speed, forging alliances in the Overlord Realm, or uncovering secrets in HyperQuest, this is your chance to leave your mark on the story." },
            { key: "background_image", label: "Banner Background Image",  type: "image",    value: "" },
        ],
    },

    // ── Profile: Banner ──
    {
        sectionKey:   "profile_banner",
        sectionLabel: "Profile Banner",
        pageGroup:    "profile",
        fields: [
            { key: "background_image", label: "Banner Background Image", type: "image", value: "" },
        ],
    },

    // ── About: Hero Section ──
    {
        sectionKey:   "about_top",
        sectionLabel: "About Page — Hero Section",
        pageGroup:    "about",
        fields: [
            { key: "heading",    label: "Heading (e.g. About Us)",      type: "text",     value: "About Us" },
            {
                key: "subtitle", label: "Text below heading", type: "textarea",
                value: "The year is 2117. Humanity didn't conquer the stars — it fractured into them.\nAfter Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies.\nAt the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you — a reborn Overlord, forged by legacy and technology.",
            },
            { key: "bg_image",   label: "Background Image (about_bg.jpg)", type: "image", value: "" },
            { key: "char_image", label: "Character Image (char.png)",       type: "image", value: "" },
        ],
    },

    // ── About: Our Story ──
    {
        sectionKey:   "about_story",
        sectionLabel: "About Page — Our Story",
        pageGroup:    "about",
        fields: [
            { key: "story_image",  label: "Our Story 1 — Image", type: "image",    value: "" },
            { key: "body",         label: "Our Story 1 — Text",  type: "textarea", value: "Humanity didn't conquer the stars — it fractured into them.\nAfter Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies." },
            { key: "story2_image", label: "Our Story 2 — Image", type: "image",    value: "" },
            { key: "story2_body",  label: "Our Story 2 — Text",  type: "textarea", value: "Humanity didn't conquer the stars — it fractured into them.\nAfter Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies." },
            { key: "story3_image", label: "Our Story 3 — Image", type: "image",    value: "" },
            { key: "story3_body",  label: "Our Story 3 — Text",  type: "textarea", value: "Humanity didn't conquer the stars — it fractured into them.\nAfter Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies." },
        ],
    },

    // ── Auth: Left Panel ──
    {
        sectionKey:   "auth_panel",
        sectionLabel: "Auth Left Panel",
        pageGroup:    "auth",
        fields: [
            { key: "tagline",          label: "Tagline (Heading)", type: "text",     value: "Explore Ruins, Clash With Factions, And Uncover Ancient Tech." },
            { key: "subtitle",         label: "Subtitle",          type: "textarea", value: "Your Choices Shape Your Skills, Species Loyalty, And Path — Liberator Or Dominator, Relic Hunter Or Techno Savant." },
            { key: "background_image", label: "Background Image",  type: "image",    value: "" },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 2. NEWS
// ═══════════════════════════════════════════════════════════════════════════════

const NEWS_DATA = [
    {
        heading:     "HyperTek Platform Launches on Base Mainnet",
        description: "We are thrilled to announce the official launch of the HyperTek NFT marketplace on Base mainnet. Players can now buy, sell, and trade digital game assets with full on-chain ownership and guaranteed buy-back protection.",
        image:       "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
        status:      "active",
    },
    {
        heading:     "New Category: Land and Bases Now Available",
        description: "Expand your territory in the HyperTek universe. Land and Bases NFTs are now live on the marketplace, offering players strategic locations with resource extraction capabilities and defensive advantages.",
        image:       "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        status:      "active",
    },
    {
        heading:     "Understanding the HyperTek Buy-Back Guarantee",
        description: "Every NFA (Non-Fungible Asset) on HyperTek comes with a guaranteed minimum buy-back value. This means if you can't sell your asset at or above its reserve price, HyperTek will buy it back at the guaranteed minimum, adjusted for CPI each year.",
        image:       "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
        status:      "active",
    },
    {
        heading:     "Season 1 Specialists Collection — Limited Supply",
        description: "The first wave of Specialist NFAs is now live. Ghost Recon Operators, Cyber Medics, and Sniper Aces are available in limited quantities. Each Specialist comes with unique in-game abilities and full buy-back protection.",
        image:       "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800&q=80",
        status:      "active",
    },
    {
        heading:     "HyperTek Integrates Transak for Easy Crypto On-Ramp",
        description: "No crypto wallet? No problem. HyperTek now supports Transak — purchase USDC directly with your credit or debit card and start buying NFAs instantly. Your wallet is created automatically when you sign up.",
        image:       "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
        status:      "active",
    },
    {
        heading:     "Spaceships Category Now Open — Own Your Fleet",
        description: "Command the skies with HyperTek's Spaceship NFAs. From the Viper Fighter Mk1 to the Phantom Stealth Ship, each vessel is a tradeable asset with real value and guaranteed buy-back protection for NFA holders.",
        image:       "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
        status:      "active",
    },
    {
        heading:     "Annual CPI Adjustment: Protecting Your Asset Value",
        description: "HyperTek announces its commitment to annual CPI-based adjustments on all NFA minimum buy-back values. This ensures your assets retain real purchasing power over time, making HyperTek NFAs a store of value as well as a gaming asset.",
        image:       "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
        status:      "active",
    },
    {
        heading:     "Racing Vehicles Drop: Build Your Championship Team",
        description: "Five new Racing Vehicle NFCs are now on the marketplace — from the HyperBike GT to the Combat Trike. Collect, trade, and race your way to the top of the HyperTek championship leaderboard.",
        image:       "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800&q=80",
        status:      "active",
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NFT COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
    {
        name: "Skins", chain: "Base", symbol: "SKIN",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
        items: [
            { name: "Desert Storm Skin",    symbol: "DSS",  priceETH: 45,   image: "https://images.unsplash.com/photo-1590212151175-e58edd96185b?w=400&q=80",  description: "Camouflage desert warfare skin for elite soldiers." },
            { name: "Arctic Ghost Skin",    symbol: "AGS",  priceETH: 60,   image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",  description: "Icy blue stealth skin for cold-climate operations." },
            { name: "Shadow Ops Skin",      symbol: "SOS",  priceETH: 80,   image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&q=80",  description: "Jet black covert operations skin with night-vision accents." },
            { name: "Urban Assault Skin",   symbol: "UAS",  priceETH: 55,   image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",  description: "City warfare skin with tactical grey patterning." },
            { name: "Jungle Predator Skin", symbol: "JPS",  priceETH: 70,   image: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&q=80",  description: "Dense jungle camouflage skin for rainforest missions." },
        ],
    },
    {
        name: "Weapons", chain: "Base", symbol: "WPNS",
        image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=600&q=80",
        items: [
            { name: "Hyper Assault Rifle",  symbol: "HAR",  priceETH: 120,  image: "https://images.unsplash.com/photo-1525088553748-01d6e210e00b?w=400&q=80",  description: "High-powered assault rifle with hyper-tech optics." },
            { name: "Plasma Pistol Mk2",    symbol: "PPM2", priceETH: 85,   image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&q=80",  description: "Compact plasma pistol with dual-fire mode." },
            { name: "Rail Sniper X90",      symbol: "RSX",  priceETH: 200,  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",  description: "Long-range rail gun sniper with electro-targeting." },
            { name: "Frag Launcher Pro",    symbol: "FLP",  priceETH: 150,  image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",  description: "Grenade launcher with proximity detonation system." },
            { name: "Ion Blade Elite",      symbol: "IBE",  priceETH: 95,   image: "https://images.unsplash.com/photo-1563207153-f403bf289163?w=400&q=80",  description: "Electrified combat blade for close-quarters warfare." },
        ],
    },
    {
        name: "Military Badges and Collectables", chain: "Base", symbol: "MBAC",
        image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&q=80",
        items: [
            { name: "Commander's Cross",    symbol: "CC",   priceETH: 300,  image: "https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=400&q=80",  description: "Rare commander's cross awarded for battlefield leadership." },
            { name: "Purple Valor Medal",   symbol: "PVM",  priceETH: 250,  image: "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=400&q=80",  description: "Medal of valor for exceptional bravery under fire." },
            { name: "HyperTek Coin 2025",   symbol: "HTC",  priceETH: 180,  image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80",  description: "Limited edition collectible coin for season 2025." },
            { name: "Iron Shield Badge",    symbol: "ISB",  priceETH: 140,  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",  description: "Badge denoting mastery of defensive tactics." },
            { name: "Star of Honour",       symbol: "SOH",  priceETH: 500,  image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80",  description: "The highest honour awarded in the HyperTek universe." },
        ],
    },
    {
        name: "Body Armour", chain: "Base", symbol: "BARM",
        image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&q=80",
        items: [
            { name: "Nano-Mesh Vest",           symbol: "NMV",  priceETH: 110,  image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80",  description: "Lightweight nano-fibre vest with ballistic resistance." },
            { name: "Exo-Skeleton Mk3",         symbol: "ESK3", priceETH: 350,  image: "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&q=80",  description: "Full exoskeleton suit with powered joints." },
            { name: "Carbon Plate Armour",      symbol: "CPA",  priceETH: 220,  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",  description: "Hard carbon plates for heavy assault operations." },
            { name: "Stealth Composite Vest",   symbol: "SCV",  priceETH: 175,  image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",  description: "Radar-absorbing composite armour vest." },
            { name: "Titan Full Plate",         symbol: "TFP",  priceETH: 480,  image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&q=80",  description: "Maximum protection titanium alloy full body armour." },
        ],
    },
    {
        name: "Specialists", chain: "Base", symbol: "SPEC",
        image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=600&q=80",
        items: [
            { name: "Ghost Recon Operator",  symbol: "GRO",  priceETH: 400,  image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=400&q=80",  description: "Elite recon specialist with ghost cloak ability." },
            { name: "Cyber Medic",           symbol: "CME",  priceETH: 280,  image: "https://images.unsplash.com/photo-1598550476439-6847ef8edd6d?w=400&q=80",  description: "Field medic with advanced cybernetic healing tools." },
            { name: "Bomb Disposal Expert",  symbol: "BDE",  priceETH: 320,  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",  description: "Specialist trained to neutralise any explosive device." },
            { name: "AI Drone Handler",      symbol: "ADH",  priceETH: 360,  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",  description: "Controls a squad of tactical AI combat drones." },
            { name: "Sniper Ace",            symbol: "SAC",  priceETH: 450,  image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",  description: "Long-range marksman with zero-wind precision targeting." },
        ],
    },
    {
        name: "Spaceships", chain: "Base", symbol: "SSHP",
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
        items: [
            { name: "Viper Fighter Mk1",     symbol: "VFM1", priceETH: 600,  image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80",  description: "Fast single-pilot fighter with twin plasma cannons." },
            { name: "Nexus Cruiser",         symbol: "NCR",  priceETH: 1200, image: "https://images.unsplash.com/photo-1614728263952-84ea256f9d1d?w=400&q=80",  description: "Mid-range cruiser with advanced shield systems." },
            { name: "Hyper Drive Engine",    symbol: "HDE",  priceETH: 250,  image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400&q=80",  description: "Replacement engine part providing 40% speed boost." },
            { name: "Phantom Stealth Ship",  symbol: "PSS",  priceETH: 900,  image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80",  description: "Radar-invisible stealth spacecraft for covert ops." },
            { name: "Ion Thruster Pack",     symbol: "ITP",  priceETH: 180,  image: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&q=80",  description: "Upgradeable ion thruster set for any ship class." },
        ],
    },
    {
        name: "Racing Vehicles", chain: "Base", symbol: "RVEH",
        image: "https://images.unsplash.com/photo-1568772585407-9f217f0d0a5a?w=600&q=80",
        items: [
            { name: "HyperBike GT",          symbol: "HBGT", priceETH: 550,  image: "https://images.unsplash.com/photo-1568772585407-9f217f0d0a5a?w=400&q=80",  description: "Ultra-fast racing bike built for gravity tracks." },
            { name: "Turbo Hovercar X",      symbol: "THX",  priceETH: 780,  image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",  description: "Anti-gravity hovercar with turbo boost module." },
            { name: "Mag-Wheel Upgrade Kit", symbol: "MWU",  priceETH: 120,  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",  description: "Magnetic wheel set for improved cornering speed." },
            { name: "Neon Dragster 5000",    symbol: "ND5K", priceETH: 650,  image: "https://images.unsplash.com/photo-1471479917193-f00955256257?w=400&q=80",  description: "Straight-line speed demon with neon drive system." },
            { name: "Combat Trike",          symbol: "CTR",  priceETH: 430,  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",  description: "Three-wheeled combat racer with front-mounted cannon." },
        ],
    },
    {
        name: "Artwork", chain: "Base", symbol: "ART",
        image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80",
        items: [
            { name: "Genesis Warrior Portrait", symbol: "GWP",  priceETH: 800,  image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&q=80",  description: "Original digital oil portrait of the first HyperTek warrior." },
            { name: "Neon City Skyline",        symbol: "NCS",  priceETH: 600,  image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",  description: "Vibrant neon cityscape from the HyperTek universe." },
            { name: "Cosmic Battle Scene",      symbol: "CBS",  priceETH: 1500, image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&q=80",  description: "Epic deep-space battle, hand-painted in 8K resolution." },
            { name: "Hyper Soldier Sketch",     symbol: "HSS",  priceETH: 400,  image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&q=80",  description: "Concept sketch of the iconic HyperTek soldier." },
            { name: "Abstract Data Stream",     symbol: "ADS",  priceETH: 350,  image: "https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=400&q=80",  description: "Generative art piece representing blockchain data flow." },
        ],
    },
    {
        name: "Land and Bases", chain: "Base", symbol: "LAND",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
        items: [
            { name: "Desert Outpost Alpha",   symbol: "DOA",  priceETH: 2000, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",  description: "Strategic desert base with resource extraction facilities." },
            { name: "Arctic Station Omega",   symbol: "ASO",  priceETH: 3500, image: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80",  description: "Fortified arctic base in the polar zone." },
            { name: "City Block 47",          symbol: "CB47", priceETH: 1800, image: "https://images.unsplash.com/photo-1465829235810-1f912537f253?w=400&q=80",  description: "Prime urban land block in the central HyperTek city." },
            { name: "Mountain Fortress",      symbol: "MFT",  priceETH: 4200, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",  description: "Defensible mountain stronghold with 360-degree visibility." },
            { name: "Ocean Platform Delta",   symbol: "OPD",  priceETH: 2800, image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",  description: "Off-shore naval platform for maritime operations." },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. NFT 101 EDUCATION CARDS
// ═══════════════════════════════════════════════════════════════════════════════

const NFT_101_DATA = [
    { title: "What is an NFT?",           icon: "🖼️", order: 1,  gradientFrom: "#1a4fd6", gradientTo: "#0e2d8a", description: "An NFT (Non-Fungible Token) is a unique digital asset verified on the blockchain. Each one is one-of-a-kind and cannot be replicated." },
    { title: "How to buy an NFT",         icon: "🛒", order: 2,  gradientFrom: "#16a34a", gradientTo: "#064e1e", description: "Connect your crypto wallet, browse the marketplace, select an item and click Buy Now. Confirm the transaction in your wallet." },
    { title: "What is minting?",          icon: "⚡", order: 3,  gradientFrom: "#7c3aed", gradientTo: "#3b0f8a", description: "Minting is the process of creating a new NFT on the blockchain — publishing a unique token that represents ownership of a digital asset." },
    { title: "How to stay protected",     icon: "🛡️", order: 4,  gradientFrom: "#0891b2", gradientTo: "#0c4a6e", description: "Never share your seed phrase. Use hardware wallets for high-value assets and always verify contract addresses before signing transactions." },
    { title: "How to create an NFT",      icon: "✨", order: 5,  gradientFrom: "#ea580c", gradientTo: "#7c2d12", description: "Prepare your digital asset, connect your wallet, use the HyperTek minting tool, set your price, and publish it to the marketplace." },
    { title: "How to sell an NFT",        icon: "💰", order: 6,  gradientFrom: "#dc2626", gradientTo: "#7f1d1d", description: "List your NFT on the marketplace by setting a price, approving the contract, and confirming the listing transaction in your wallet." },
    { title: "What is a crypto wallet?",  icon: "👛", order: 7,  gradientFrom: "#4338ca", gradientTo: "#1e1b4b", description: "A crypto wallet stores your private keys and lets you interact with blockchains. Popular options include MetaMask and Coinbase Wallet." },
    { title: "What is blockchain?",       icon: "⛓️", order: 8,  gradientFrom: "#0f766e", gradientTo: "#042f2e", description: "A blockchain is a distributed ledger that records all transactions transparently and immutably, making it impossible to tamper with records." },
    { title: "What are gas fees?",        icon: "⛽", order: 9,  gradientFrom: "#b45309", gradientTo: "#451a03", description: "Gas fees are payments made to blockchain validators for processing your transaction. They vary based on network congestion." },
    { title: "What is a smart contract?", icon: "📜", order: 10, gradientFrom: "#be185d", gradientTo: "#500724", description: "A smart contract is self-executing code on the blockchain that automatically enforces the rules of a transaction without intermediaries." },
    { title: "What is HyperTek?",         icon: "🚀", order: 11, gradientFrom: "#1d4ed8", gradientTo: "#172554", description: "HyperTek is a play-to-earn NFT gaming universe where soldiers, land, weapons and vehicles are real digital assets you own." },
    { title: "What is Web3?",             icon: "🌐", order: 12, gradientFrom: "#0369a1", gradientTo: "#0c2840", description: "Web3 is the next evolution of the internet built on blockchain technology, giving users ownership of their digital assets and data." },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

// ── Force-reseed flag: set FORCE_RESEED_NFT=true in Config/.env to wipe & re-seed NFT collections
// Remove this flag after QA testing to restore normal skip-if-exists behaviour.
const FORCE_RESEED_NFT = process.env.FORCE_RESEED_NFT === "true";
const QA_PRICE = 0.50; // $0.50 USDC — cheapest amount that works with both Stripe and wallet

async function seed() {
    const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/hypertek";
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected\n");

    // ── 1. SiteContent ──────────────────────────────────────────────────────
    let sc_created = 0, sc_updated = 0, sc_skipped = 0;
    for (const section of SITE_CONTENT) {
        const existing = await SiteContent.findOne({ sectionKey: section.sectionKey });
        if (!existing) {
            await SiteContent.create(section);
            console.log(`✅ SiteContent created: ${section.sectionKey}`);
            sc_created++;
        } else {
            // Add any fields that are missing — never overwrite existing values
            const existingKeys = existing.fields.map((f) => f.key);
            const newFields = section.fields.filter((f) => !existingKeys.includes(f.key));
            if (newFields.length > 0) {
                await SiteContent.updateOne(
                    { sectionKey: section.sectionKey },
                    { $push: { fields: { $each: newFields } } }
                );
                console.log(`🔄 SiteContent updated: ${section.sectionKey} (+${newFields.length} field(s): ${newFields.map((f) => f.key).join(", ")})`);
                sc_updated++;
            } else {
                sc_skipped++;
            }
        }
    }

    // ── 2. News ─────────────────────────────────────────────────────────────
    let news_created = 0, news_skipped = 0;
    for (const article of NEWS_DATA) {
        const existing = await News.findOne({ heading: article.heading });
        if (existing) { news_skipped++; continue; }
        await News.create(article);
        news_created++;
    }
    if (news_created > 0) console.log(`✅ News: ${news_created} articles created`);

    // ── 3. NFT Collections ──────────────────────────────────────────────────
    let nft_created = 0, nft_skipped = 0;

    if (FORCE_RESEED_NFT) {
        const deleted = await NFTSystem.deleteMany({ isParentCollection: true });
        console.log(`🗑  FORCE_RESEED_NFT: removed ${deleted.deletedCount} existing collections`);
        console.log(`💰  All prices set to $${QA_PRICE} USDC for QA testing`);
    }

    for (const cat of CATEGORIES) {
        if (!FORCE_RESEED_NFT) {
            const existing = await NFTSystem.findOne({ "collection.name": cat.name, isParentCollection: true });
            if (existing) { nft_skipped++; continue; }
        }
        await NFTSystem.create({
            collection: {
                name: cat.name, symbol: cat.symbol, chain: cat.chain,
                image: cat.image, royaltyPercent: 5,
                supply: cat.items.length, creator: "admin",
            },
            isParentCollection: true,
            isDummy: true,
            status: "active",
            subCollections: cat.items.map((item, i) => ({
                name: item.name, symbol: item.symbol,
                description: item.description, image: item.image,
                priceETH: FORCE_RESEED_NFT ? QA_PRICE : item.priceETH,
                listed: true,
                isFirstSale: true, tokenId: i + 1,
            })),
        });
        console.log(`✅ NFT Collection: ${cat.name} (${cat.items.length} items @ $${FORCE_RESEED_NFT ? QA_PRICE : item.priceETH} USDC)`);
        nft_created++;
    }

    // Mark all existing seeded parent collections as isDummy=true (migration)
    const migrated = await NFTSystem.updateMany(
        { isParentCollection: true },
        { $set: { isDummy: true } }
    );
    console.log(`🏷️  isDummy migration: ${migrated.modifiedCount} collections updated`);

    // ── 4. NFT 101 ──────────────────────────────────────────────────────────
    let edu_created = 0, edu_skipped = 0;
    for (const edu of NFT_101_DATA) {
        const existing = await Nft101.findOne({ title: edu.title });
        if (existing) { edu_skipped++; continue; }
        await Nft101.create(edu);
        edu_created++;
    }
    if (edu_created > 0) console.log(`✅ NFT 101: ${edu_created} cards created`);

    // ── 5. Users ────────────────────────────────────────────────────────────
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

    // ── 6. Offers ───────────────────────────────────────────────────────────
    let offers_created = 0, offers_skipped = 0;
    if (createdUsers.length >= 3) {
        const nfts = await NFTSystem.find({ isParentCollection: true }).limit(3);
        const OFFERS = [
            {
                serialNumber: "OFFER-001",
                gameId: nfts[0]?._id?.toString() || "000000000000000000000001",
                gameTitle: nfts[0]?.collection?.name || "Desert Storm Skin",
                gameActualPrice: 45, offerPrice: 38, priceDuration: "7 days",
                userId: createdUsers[0]._id, userName: createdUsers[0].FullName, userEmail: createdUsers[0].Email,
                ownerId: createdUsers[1]._id?.toString(), ownerName: createdUsers[1].FullName, ownerEmail: createdUsers[1].Email,
                requestStatus: "pending", paymentStatus: "unpaid",
            },
            {
                serialNumber: "OFFER-002",
                gameId: nfts[1]?._id?.toString() || "000000000000000000000002",
                gameTitle: nfts[1]?.collection?.name || "Hyper Assault Rifle",
                gameActualPrice: 120, offerPrice: 100, priceDuration: "3 days",
                userId: createdUsers[1]._id, userName: createdUsers[1].FullName, userEmail: createdUsers[1].Email,
                ownerId: createdUsers[2]._id?.toString(), ownerName: createdUsers[2].FullName, ownerEmail: createdUsers[2].Email,
                requestStatus: "accepted", paymentStatus: "paid",
            },
            {
                serialNumber: "OFFER-003",
                gameId: nfts[2]?._id?.toString() || "000000000000000000000003",
                gameTitle: nfts[2]?.collection?.name || "Commander's Cross",
                gameActualPrice: 300, offerPrice: 270, priceDuration: "5 days",
                userId: createdUsers[2]._id, userName: createdUsers[2].FullName, userEmail: createdUsers[2].Email,
                ownerId: createdUsers[0]._id?.toString(), ownerName: createdUsers[0].FullName, ownerEmail: createdUsers[0].Email,
                requestStatus: "rejected", paymentStatus: "unpaid",
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

    // ── 7. Withdrawals ──────────────────────────────────────────────────────
    let wd_created = 0, wd_skipped = 0;
    if (createdUsers.length >= 3) {
        const WITHDRAWALS = [
            {
                user: createdUsers[0]._id, amount: 150, type: "crypto", status: "pending",
                recipientAddress: "0xAbC123456789DeF0000000000000000000000001",
                token: "USDC", currency: "USD",
            },
            {
                user: createdUsers[1]._id, amount: 500, type: "bank", status: "completed",
                bankDetails: { accountHolderName: "Bob Martinez", bankName: "Commonwealth Bank", accountNumber: "1234567890", swift: "CTBAAU2S", country: "Australia" },
                currency: "USD",
            },
            {
                user: createdUsers[2]._id, amount: 80, type: "crypto", status: "rejected",
                recipientAddress: "0xDeF987654321AbC0000000000000000000000003",
                token: "USDC", currency: "USD",
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

    // ── 8. Payments ─────────────────────────────────────────────────────────
    let pay_created = 0, pay_skipped = 0;
    if (createdUsers.length >= 3) {
        const nfts = await NFTSystem.find({ isParentCollection: true }).limit(2);
        const PAYMENTS = [
            {
                userId: createdUsers[0]._id, productId: nfts[0]?._id || new mongoose.Types.ObjectId(),
                gameTitle: nfts[0]?.collection?.name || "Desert Storm Skin", amount: 4500, currency: "usd",
                provider: "stripe", transactionId: "pi_seed_001_test", referenceId: "pi_seed_001_test",
                paymentMethod: "card", status: "succeeded", itemType: "nft", serialNumber: "PAY-SEED-001",
            },
            {
                userId: createdUsers[1]._id, productId: nfts[1]?._id || new mongoose.Types.ObjectId(),
                gameTitle: nfts[1]?.collection?.name || "Hyper Assault Rifle", amount: 12000, currency: "usd",
                provider: "crypto", transactionId: "0xSEED_TX_002_HASH", referenceId: "0xSEED_TX_002_HASH",
                paymentMethod: "USDC", status: "succeeded", itemType: "nft", serialNumber: "PAY-SEED-002",
            },
            {
                userId: createdUsers[2]._id, productId: new mongoose.Types.ObjectId(),
                gameTitle: "Ghost Recon Operator", amount: 40000, currency: "usd",
                provider: "stripe", transactionId: "pi_seed_003_test", referenceId: "pi_seed_003_test",
                paymentMethod: "card", status: "pending", itemType: "nft", serialNumber: "PAY-SEED-003",
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

    // ── 9. Activities ───────────────────────────────────────────────────────
    let act_created = 0, act_skipped = 0;
    if (createdUsers.length >= 3) {
        const nfts = await NFTSystem.find({ isParentCollection: true }).limit(3);
        const ACTIVITIES = [
            {
                userId: createdUsers[0]._id, name: nfts[0]?.collection?.name || "Desert Storm Skin",
                type: "buy", buyer: createdUsers[0].FullName, seller: createdUsers[1].FullName,
                price: 45, itemType: "NFA", itemId: nfts[0]?._id || new mongoose.Types.ObjectId(),
            },
            {
                userId: createdUsers[1]._id, name: nfts[1]?.collection?.name || "Hyper Assault Rifle",
                type: "sell", buyer: createdUsers[2].FullName, seller: createdUsers[1].FullName,
                price: 120, itemType: "NFA", itemId: nfts[1]?._id || new mongoose.Types.ObjectId(),
            },
            {
                userId: createdUsers[2]._id, name: nfts[2]?.collection?.name || "Commander's Cross",
                type: "buy", buyer: createdUsers[2].FullName, seller: createdUsers[0].FullName,
                price: 300, itemType: "NFA", itemId: nfts[2]?._id || new mongoose.Types.ObjectId(),
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

    // ── 10. Patch placeholder images (only if empty) ─────────────────────────
    let img_updated = 0, img_skipped = 0;
    const parents = await NFTSystem.find({ isParentCollection: true });
    for (const parent of parents) {
        const cat = CATEGORIES.find((c) => c.name === parent.collection?.name);
        if (!cat) continue;
        let changed = false;
        if (!parent.collection.image && cat.image) {
            parent.collection.image = cat.image;
            changed = true;
        }
        parent.subCollections.forEach((sub, i) => {
            if (!sub.image && cat.items[i]?.image) {
                sub.image = cat.items[i].image;
                changed = true;
            }
        });
        if (changed) {
            await parent.save();
            img_updated++;
        } else {
            img_skipped++;
        }
    }
    if (img_updated > 0) console.log(`✅ NFT images patched: ${img_updated} collections`);

    // ── Trade/Quest content migration ───────────────────────────────────────
    // Remove dollar figures from trade offering fields (Don's brief)
    await Trade.updateMany(
        { offering: /USDC/ },
        [{ $set: { offering: { $replaceAll: { input: "$offering", find: " (120 USDC)", replacement: "" } } } }]
    );
    await Trade.updateMany(
        { offering: /\+ 100 USDC/ },
        [{ $set: { offering: { $replaceAll: { input: "$offering", find: " + 100 USDC", replacement: "" } } } }]
    );
    await Trade.updateMany(
        { offering: /\(600 USDC\)/ },
        [{ $set: { offering: { $replaceAll: { input: "$offering", find: " (600 USDC)", replacement: "" } } } }]
    );

    // Placeholder ObjectId for seed records (satisfies required poster field)
    const SEED_POSTER_ID = new mongoose.Types.ObjectId("000000000000000000000001");

    // Add former bounty missions as quest records (if not already there)
    const QUEST_MIGRATIONS = [
        { title: "Destroy Rogue AI Nexus-7",        type: "quest", description: "Rogue artificial intelligence has taken control of the Eastern Grid. Locate and neutralise its core processor.", posterName: "Intel Division",    posterWallet: "0xSEED_WALLET_POSTER_001" },
        { title: "Escort VIP Through Warzone",       type: "quest", description: "Safely escort Dr. Chen through contested Sector 12 to the extraction point. Priority one mission — no casualties.", posterName: "Defence Ministry", posterWallet: "0xSEED_WALLET_POSTER_002" },
        { title: "Capture Enemy Officer — Intel",    type: "quest", description: "Track down Lt. Shadow Wolf and capture the enemy intelligence officer. Prisoner must be delivered to forward operating base.", posterName: "Special Ops Unit",  posterWallet: "0xSEED_WALLET_POSTER_001" },
        { title: "Intercept Communications Array",   type: "quest", description: "Hack into the enemy communications array in the northern mountains. Extract encryption keys and disable the system.", posterName: "Cyber Division",    posterWallet: "0xSEED_WALLET_POSTER_002" },
        { title: "Eliminate Rogue Commander Vex",    type: "quest", description: "High-priority target operating in Sector 9. Known for ambushing supply convoys. Eliminate and provide proof of defeat.", posterName: "HQ Command",        posterWallet: "0xSEED_WALLET_POSTER_001" },
        { title: "Raid Supply Depot — Sector 4",     type: "quest", description: "Enemy supply depot in Sector 4 must be destroyed. Destroy at least 80% of stored materials for full reward.", posterName: "Resistance HQ",    posterWallet: "0xSEED_WALLET_POSTER_002" },
    ];
    let qm_created = 0;
    for (const q of QUEST_MIGRATIONS) {
        const exists = await Trade.findOne({ title: q.title });
        if (!exists) { await Trade.create({ ...q, poster: SEED_POSTER_ID, status: "open" }); qm_created++; }
    }
    if (qm_created > 0) console.log(`✅ Quest migration: ${qm_created} former bounty items added to Quests/Trades`);

    // Replace bounty records with hit contract themed content
    await Bounty.deleteMany({
        title: { $in: [
            "Eliminate Rogue Commander Vex", "Destroy Rogue AI Nexus-7",
            "Capture Enemy Officer — Intel", "Raid Supply Depot — Sector 4",
            "Intercept Communications Array", "Escort VIP Through Warzone",
        ]}
    });
    const HIT_CONTRACTS = [
        { title: "Hit Contract: IronFist_99",      targetName: "IronFist_99",      description: "This player raided our base and eliminated our best officers. Post a hit and send your 3-4 best officers into battle. Animated battle result provided.", reward: 1200, commission: 0.2, posterName: "Intel Division",    posterWallet: "0xSEED_WALLET_POSTER_001" },
        { title: "Hit Contract: Lt. Shadow Wolf",  targetName: "Lt. Shadow Wolf",   description: "A former ally turned rogue — attacking smaller factions unprovoked. Your officers vs theirs in a battle of power and strength.", reward: 900,  commission: 0.2, posterName: "Defence Ministry", posterWallet: "0xSEED_WALLET_POSTER_002" },
        { title: "Hit Contract: WarHawk_Prime",    targetName: "WarHawk_Prime",     description: "A large faction bully targeting new players. Accept this contract and your 3-4 best officers will battle their squad. Video battle log returned.", reward: 800,  commission: 0.2, posterName: "Special Ops Unit",  posterWallet: "0xSEED_WALLET_POSTER_001" },
        { title: "Hit Contract: Commander Vex",    targetName: "Commander Vex",     description: "High-priority player target in Sector 9. Accept the contract and your best officers engage theirs in an animated strength battle. Proof of win required.", reward: 650,  commission: 0.2, posterName: "HQ Command",        posterWallet: "0xSEED_WALLET_POSTER_002" },
        { title: "Hit Contract: NeonRacer_Pro",    targetName: "NeonRacer_Pro",     description: "Racing champion who has been sabotaging rivals. Your officers will challenge their squad in a battle of power. Accept to engage.", reward: 500,  commission: 0.2, posterName: "TrackOwner_1",     posterWallet: "0xSEED_WALLET_POSTER_001" },
        { title: "Hit Contract: Renegade_Echo",    targetName: "Renegade_Echo",     description: "Disrupting trade routes and raiding merchant factions. Any bounty hunter who defeats their officers in battle earns this reward. Proof of victory required.", reward: 350,  commission: 0.2, posterName: "Resistance HQ",    posterWallet: "0xSEED_WALLET_POSTER_002" },
    ];
    let hc_created = 0;
    for (const hc of HIT_CONTRACTS) {
        const exists = await Bounty.findOne({ title: hc.title });
        if (!exists) {
            await Bounty.create({ ...hc, poster: SEED_POSTER_ID, status: "open", expiresAt: new Date(Date.now() + 30 * 86400000) });
            hc_created++;
        }
    }
    if (hc_created > 0) console.log(`✅ Bounty migration: ${hc_created} hit contracts seeded`);

    // ── 11. Profile NFT ownership — Collectibles & Land ─────────────────────
    // Assigns `owner` on un-owned sub-items so they appear in the
    // /profile/collectibles and /profile/land pages for the seed wallet.
    const SEED_WALLET = (process.env.PLATFORM_WALLET_ADDRESS || "0x89eD8201B0448B2C94ae0e4D380f08b7aD558Ce6").toLowerCase();
    const PROFILE_ITEMS_PER_CAT = 3;
    const COLLECTIBLE_CATS = [
        "military badges and collectables", "artwork", "skins",
        "weapons", "body armour", "specialists", "spaceships", "racing vehicles",
    ];
    const LAND_CATS = ["land and bases"];
    let profile_seeded = 0;

    for (const cat of [...COLLECTIBLE_CATS, ...LAND_CATS]) {
        const parent = await NFTSystem.findOne({ isParentCollection: true, category: cat });
        if (!parent) continue;

        let count = 0;
        for (const sub of parent.subCollections) {
            if (count >= PROFILE_ITEMS_PER_CAT) break;
            if (sub.owner) continue; // already owned
            sub.owner       = SEED_WALLET;
            sub.listed      = false;
            sub.tokenId     = sub.tokenId || (count + 1);
            sub.tokenURI    = sub.tokenURI || `ipfs://seed-${cat.replace(/\s+/g, "-")}-${count + 1}`;
            sub.isFirstSale = true;
            count++;
            profile_seeded++;
        }
        if (count > 0) await parent.save();
    }
    if (profile_seeded > 0) console.log(`✅ Profile NFTs: ${profile_seeded} items assigned to seed wallet (${SEED_WALLET})`);

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log("\n── Summary ─────────────────────────────────────────────────────");
    console.log(`📄 SiteContent:     ${sc_created} created, ${sc_updated} updated, ${sc_skipped} skipped`);
    console.log(`📰 News:            ${news_created} created, ${news_skipped} skipped`);
    console.log(`📦 NFT Collections: ${nft_created} created, ${nft_skipped} skipped`);
    console.log(`📚 NFT 101 cards:   ${edu_created} created, ${edu_skipped} skipped`);
    console.log(`👤 Users:           ${users_created} created, ${users_skipped} skipped`);
    console.log(`📝 Offers:          ${offers_created} created, ${offers_skipped} skipped`);
    console.log(`💸 Withdrawals:     ${wd_created} created, ${wd_skipped} skipped`);
    console.log(`💳 Payments:        ${pay_created} created, ${pay_skipped} skipped`);
    console.log(`📊 Activities:      ${act_created} created, ${act_skipped} skipped`);
    console.log(`🖼️  NFT images:      ${img_updated} patched, ${img_skipped} already set`);
    console.log(`🏷️  Profile NFTs:    ${profile_seeded} items owned by seed wallet`);
    console.log("────────────────────────────────────────────────────────────────");
    console.log("\n🔑 Test user credentials:");
    console.log("   alice@hypertek.com   / User@1234");
    console.log("   bob@hypertek.com     / User@1234");
    console.log("   charlie@hypertek.com / User@1234");

    await mongoose.disconnect();
    console.log("\n✅ Seed complete.");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
