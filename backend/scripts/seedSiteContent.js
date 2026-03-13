/**
 * Seed script for SiteContent
 * 
 * Run: node scripts/seedSiteContent.js
 * 
 * Populates default content from the current hardcoded frontend values.
 * Uses upsert so it's safe to run multiple times (won't overwrite existing edits).
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });

// Also load .env.local if present (overwrites .env)
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });

import SiteContent from "../Models/SiteContent.js";

const SECTIONS = [
    // ============================================================
    // HOME PAGE
    // ============================================================
    {
        sectionKey: "home_hero",
        sectionLabel: "Hero Banner",
        pageGroup: "home",
        fields: [
            {
                key: "heading_line1",
                label: "Heading Line 1",
                type: "text",
                value: "Hyper Tek 100:",
            },
            {
                key: "heading_line2",
                label: "Heading Line 2",
                type: "text",
                value: "WHERE LEGENDS Are Forged.",
            },
            {
                key: "cta_button_1_text",
                label: "Button 1 Text",
                type: "text",
                value: "MarketPlace",
            },
            {
                key: "cta_button_1_link",
                label: "Button 1 Link",
                type: "text",
                value: "/market-place",
            },
            {
                key: "cta_button_2_text",
                label: "Button 2 Text",
                type: "text",
                value: "Download Game",
            },
            {
                key: "cta_button_2_link",
                label: "Button 2 Link",
                type: "text",
                value: "#",
            },
            {
                key: "background_image",
                label: "Background Image",
                type: "image",
                value: "", // Will be set via upload
            },
        ],
    },
    {
        sectionKey: "home_about",
        sectionLabel: "About HyperTek",
        pageGroup: "home",
        fields: [
            {
                key: "vertical_label",
                label: "Vertical Label",
                type: "text",
                value: "HYPER TEK 100",
            },
            {
                key: "title",
                label: "Title",
                type: "text",
                value: "The year is 2117.",
            },
            {
                key: "body",
                label: "Body Text",
                type: "textarea",
                value:
                    "Humanity didn't conquer the stars—it fractured into them. After Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation, forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you, a reborn Overlord, forged by legacy and technology.",
            },
            {
                key: "image_left",
                label: "Left Image",
                type: "image",
                value: "",
            },
            {
                key: "image_right_1",
                label: "Right Image 1",
                type: "image",
                value: "",
            },
            {
                key: "image_right_2",
                label: "Right Image 2",
                type: "image",
                value: "",
            },
        ],
    },
    {
        sectionKey: "home_how_it_works",
        sectionLabel: "How It Works",
        pageGroup: "home",
        fields: [
            {
                key: "section_title",
                label: "Section Title",
                type: "text",
                value: "How It Works",
            },
            {
                key: "section_subtitle",
                label: "Section Subtitle",
                type: "textarea",
                value:
                    "Get started in just a few steps and unlock the world of digital collectibles.",
            },
            {
                key: "steps",
                label: "Steps",
                type: "list",
                value: [
                    {
                        title: "Connect Wallet",
                        description:
                            "Securely connect your crypto wallet to start buying, selling, and collecting NFTs.",
                    },
                    {
                        title: "Explore Collections",
                        description:
                            "Browse trending collections and discover rare digital artworks from top creators.",
                    },
                    {
                        title: "Collect & Trade",
                        description:
                            "Buy your favorite NFTs and showcase or trade them on your profile anytime.",
                    },
                    {
                        title: "Earn & Grow",
                        description:
                            "Earn by selling your collections or gaining popularity in the NFT space.",
                    },
                ],
            },
        ],
    },

    // ============================================================
    // MARKETPLACE BANNER
    // ============================================================
    {
        sectionKey: "marketplace_banner",
        sectionLabel: "Marketplace Banner",
        pageGroup: "marketplace",
        fields: [
            {
                key: "heading",
                label: "Banner Heading",
                type: "text",
                value: "A New Era Dawns in Hyper Tek",
            },
            {
                key: "description",
                label: "Banner Description",
                type: "textarea",
                value:
                    "It's the start of a living, breathing universe where every decision shapes the journey. Whether you're racing at light speed, forging alliances in the Overlord Realm, or uncovering secrets in HyperQuest, this is your chance to leave your mark on the story.",
            },
            {
                key: "background_image",
                label: "Banner Background Image",
                type: "image",
                value: "",
            },
        ],
    },

    // ============================================================
    // PROFILE BANNER
    // ============================================================
    {
        sectionKey: "profile_banner",
        sectionLabel: "Profile Banner",
        pageGroup: "profile",
        fields: [
            {
                key: "background_image",
                label: "Banner Background Image",
                type: "image",
                value: "",
            },
        ],
    },

    // ============================================================
    // ABOUT PAGE
    // ============================================================
    {
        sectionKey: "about_top",
        sectionLabel: "About Page — Top Section",
        pageGroup: "about",
        fields: [
            {
                key: "heading",
                label: "Page Heading",
                type: "text",
                value: "About Us",
            },
            {
                key: "subtitle",
                label: "Subtitle",
                type: "textarea",
                value:
                    "Empowering creators and collectors through blockchain technology. Hyper Tek is where innovation meets art.",
            },
        ],
    },
    {
        sectionKey: "about_story",
        sectionLabel: "About Page — Story Section",
        pageGroup: "about",
        fields: [
            {
                key: "title",
                label: "Story Title",
                type: "text",
                value: "The year in 2117",
            },
            {
                key: "body",
                label: "Story Body",
                type: "textarea",
                value:
                    "The year is 2117. Humanity didn't conquer the stars — it fractured into them. After Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you — a reborn Overlord, forged by legacy and technology.",
            },
            {
                key: "story_image",
                label: "Story Image",
                type: "image",
                value: "",
            },
        ],
    },
    {
        sectionKey: "about_war",
        sectionLabel: "About Page — Three Fronts of War",
        pageGroup: "about",
        fields: [
            {
                key: "title",
                label: "War Title",
                type: "text",
                value: "Three Fronts of War",
            },
            {
                key: "war_items",
                label: "War Items",
                type: "list",
                value: [
                    {
                        title: "HyperQuest 100 | The Awakening",
                        description:
                            "Explore ruins, clash with factions, and uncover ancient tech. Your choices shape your skills, species loyalty, and path: liberator or dominator, relic hunter or techno savant.",
                    },
                    {
                        title: "Hyper Racing 100 — The Velocity Wars",
                        description:
                            "On Blacktrack Circuits, speed is war. Factions battle at 900 kph for control of energy routes and warp towers. Your vehicle is your weapon and your rise rewrites the map.",
                    },
                    {
                        title: "Overlord Realm | The Final Ascent",
                        description:
                            "Establish dominion across stars. Conquer with armies, alliances, or fear. Deploy psychic storms, orbital AI, and propaganda to bend entire systems to your rule.",
                    },
                ],
            },
            {
                key: "war_image",
                label: "War Image",
                type: "image",
                value: "",
            },
        ],
    },
    {
        sectionKey: "about_ecosystem",
        sectionLabel: "About Page — Our Ecosystem",
        pageGroup: "about",
        fields: [
            {
                key: "heading",
                label: "Heading",
                type: "text",
                value: "Our Ecosystem",
            },
            {
                key: "subtitle",
                label: "Subtitle",
                type: "textarea",
                value:
                    "Trusted by millions, we bring you a world-class suite of financial products in one platform.",
            },
            {
                key: "ecosystem_items",
                label: "Ecosystem Cards",
                type: "list",
                value: [
                    {
                        title: "NFA",
                        description:
                            "Discover and own NFAs that are as rare as they are valuable.",
                    },
                    {
                        title: "Game",
                        description:
                            "Step into Hyper Tek and be part of a living universe where racing, quests, and realms collide.",
                    },
                    {
                        title: "MarketPlace",
                        description:
                            "The Hyper Tek Marketplace is your gateway to rare gear, powerful NFAs, and exclusive upgrades that shape your journey.",
                    },
                ],
            },
        ],
    },
];

async function seed() {
    try {
        const mongoUrl =
            process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/hypertek";
        console.log("🔗 Connecting to:", mongoUrl.replace(/\/\/.*@/, "//***:***@"));
        await mongoose.connect(mongoUrl);
        console.log("✅ Connected to MongoDB");

        let created = 0;
        let skipped = 0;

        for (const section of SECTIONS) {
            const exists = await SiteContent.findOne({
                sectionKey: section.sectionKey,
            });
            if (exists) {
                console.log(`⏭  Skipping "${section.sectionKey}" (already exists)`);
                skipped++;
            } else {
                await SiteContent.create(section);
                console.log(`✅ Created "${section.sectionKey}"`);
                created++;
            }
        }

        console.log(`\n📊 Done! Created: ${created}, Skipped: ${skipped}`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
}

seed();
