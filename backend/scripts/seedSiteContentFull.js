/**
 * Full CMS Site Content Seed
 * 
 * Run: node --env-file=Config/.env scripts/seedSiteContentFull.js
 * 
 * This will UPSERT all sections — existing data is overwritten.
 */

import mongoose from "mongoose";
import SiteContent from "../Models/SiteContent.js";

const SECTIONS = [
    // ─── HOME: Hero Banner ───
    {
        sectionKey: "home_hero",
        sectionLabel: "Hero Banner",
        pageGroup: "home",
        fields: [
            { key: "heading_line1", label: "Heading Line 1", type: "text", value: "Hyper Tek 100:" },
            { key: "heading_line2", label: "Heading Line 2", type: "text", value: "WHERE LEGENDS ARE FORGOTTEN" },
            { key: "button1_text", label: "Button 1 Text", type: "text", value: "MarketPlace" },
            { key: "button1_link", label: "Button 1 Link", type: "text", value: "/market-place" },
            { key: "button2_text", label: "Button 2 Text", type: "text", value: "Download Game" },
            { key: "button2_link", label: "Button 2 Link", type: "text", value: "#" },
            { key: "background_image", label: "Background Image", type: "image", value: "" },
        ],
    },

    // ─── HOME: About HyperTek ───
    {
        sectionKey: "home_about",
        sectionLabel: "About HyperTek",
        pageGroup: "home",
        fields: [
            { key: "vertical_label", label: "Vertical Label", type: "text", value: "HYPER TEK 100" },
            { key: "title", label: "Title", type: "text", value: "The year is 19999999" },
            {
                key: "body",
                label: "Body Text",
                type: "textarea",
                value: "Humanity didn't conquer the stars—it fractured into them. After Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation, forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you, a reborn Overlord, forged by legacy and technology.",
            },
            { key: "left_image", label: "Left Image", type: "image", value: "" },
            { key: "right_image1", label: "Right Image 1", type: "image", value: "" },
            { key: "right_image2", label: "Right Image 2", type: "image", value: "" },
        ],
    },

    // ─── HOME: Marketplace Banner ───
    {
        sectionKey: "marketplace_banner",
        sectionLabel: "Marketplace Banner",
        pageGroup: "marketplace",
        fields: [
            { key: "heading", label: "Banner Heading", type: "text", value: "A New Era Dawns in Hyper Tek" },
            {
                key: "description",
                label: "Banner Description",
                type: "textarea",
                value: "It's the start of a living, breathing universe where every decision shapes the journey. Whether you're racing at light speed, forging alliances in the Overlord Realm, or uncovering secrets in HyperQuest, this is your chance to leave your mark on the story.",
            },
            { key: "background_image", label: "Banner Background Image", type: "image", value: "" },
        ],
    },

    // ─── HOME: Profile Banner ───
    {
        sectionKey: "profile_banner",
        sectionLabel: "Profile Banner",
        pageGroup: "profile",
        fields: [
            { key: "background_image", label: "Banner Background Image", type: "image", value: "" },
        ],
    },

    // ─── HOME: Story Section ───
    {
        sectionKey: "home_story",
        sectionLabel: "Story Section",
        pageGroup: "home",
        fields: [
            { key: "background_image", label: "Background Image", type: "image", value: "" },
            { key: "character_image", label: "Character Image (Center)", type: "image", value: "" },
            { key: "left_heading", label: "Left Heading", type: "text", value: "STORY" },
            { key: "left_subheading", label: "Left Subheading", type: "text", value: "The year is 2117." },
            {
                key: "left_body",
                label: "Left Body Text",
                type: "textarea",
                value: "Humanity didn't conquer the stars it fractured into them. After Earth collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you a reborn Overlord, forged by legacy and technology.",
            },
            { key: "right_heading", label: "Right Heading", type: "text", value: "STORY" },
            { key: "right_subheading", label: "Right Subheading", type: "text", value: "The year is 2117." },
            {
                key: "right_body",
                label: "Right Body Text",
                type: "textarea",
                value: "Humanity didn't conquer the stars it fractured into them. After Earth collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you a reborn Overlord, forged by legacy and technology.",
            },
            { key: "accent_color", label: "Accent Color (hex, e.g. #b89a00)", type: "text", value: "#b89a00" },
        ],
    },

    // ─── ABOUT: Top Section ───
    {
        sectionKey: "about_top",
        sectionLabel: "About Page — Top Section",
        pageGroup: "about",
        fields: [
            { key: "heading", label: "Page Heading", type: "text", value: "About Us" },
            {
                key: "subtitle",
                label: "Subtitle",
                type: "textarea",
                value: "Empowering creators and collectors through blockchain technology. Hyper Tek is where innovation meets art.",
            },
        ],
    },

    // ─── ABOUT: Story Section ───
    {
        sectionKey: "about_story",
        sectionLabel: "About Page — Story Section",
        pageGroup: "about",
        fields: [
            { key: "heading", label: "Story Title", type: "text", value: "The year in 2117" },
            {
                key: "body",
                label: "Story Body",
                type: "textarea",
                value: "The year is 2117. Humanity didn't conquer the stars — it fractured into them. After Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you — a reborn Overlord, forged by legacy and technology.",
            },
            { key: "story_image", label: "Story Image", type: "image", value: "" },
        ],
    },

    // ─── ABOUT: Three Fronts of War ───
    {
        sectionKey: "about_war",
        sectionLabel: "About Page — Three Fronts of War",
        pageGroup: "about",
        fields: [
            { key: "heading", label: "War Title", type: "text", value: "Three Fronts of War" },
            {
                key: "war_items",
                label: "War Items",
                type: "list",
                value: [
                    {
                        title: "HyperQuest 100 | The Awakening",
                        description: "Explore ruins, clash with factions, and uncover ancient tech. Your choices shape your skills, species loyalty, and path: liberator or dominator, relic hunter or techno savant.",
                    },
                    {
                        title: "Hyper Racing 100 — The Velocity Wars",
                        description: "On Blacktrack Circuits, speed is war. Factions battle at 900 kph for control of energy routes and warp towers. Your vehicle is your weapon and your rise rewrites the map.",
                    },
                    {
                        title: "Overlord Realm | The Final Ascent",
                        description: "Establish dominion across stars. Conquer with armies, alliances, or fear. Deploy psychic storms, orbital AI, and propaganda to bend entire systems to your rule.",
                    },
                ],
            },
            { key: "war_image", label: "War Image", type: "image", value: "" },
        ],
    },

    // ─── ABOUT: Our Ecosystem ───
    {
        sectionKey: "about_ecosystem",
        sectionLabel: "About Page — Our Ecosystem",
        pageGroup: "about",
        fields: [
            { key: "heading", label: "Heading", type: "text", value: "Our Ecosystem" },
            {
                key: "subtitle",
                label: "Subtitle",
                type: "text",
                value: "Trusted by millions, we bring you a world-class suite of financial products in one platform.",
            },
            {
                key: "cards",
                label: "Ecosystem Cards",
                type: "list",
                value: [
                    { title: "NFA", description: "Discover and own NFAs that are as rare as they are valuable." },
                    { title: "Game", description: "Step into Hyper Tek and be part of a living universe where racing, quests, and realms collide." },
                    { title: "MarketPlace", description: "The Hyper Tek Marketplace is your gateway to rare gear, powerful NFAs, and exclusive upgrades that shape your journey." },
                ],
            },
        ],
    },

    // ─── AUTH: Left Panel ───
    {
        sectionKey: "auth_panel",
        sectionLabel: "Auth Left Panel",
        pageGroup: "auth",
        fields: [
            { key: "tagline", label: "Tagline (Heading)", type: "text", value: "Explore Ruins, Clash With Factions, And Uncover Ancient Tech." },
            { key: "subtitle", label: "Subtitle", type: "textarea", value: "Your Choices Shape Your Skills, Species Loyalty, And Path — Liberator Or Dominator, Relic Hunter Or Techno Savant." },
            { key: "background_image", label: "Background Image", type: "image", value: "" },
        ],
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Connected to MongoDB\n");

        for (const section of SECTIONS) {
            const result = await SiteContent.findOneAndUpdate(
                { sectionKey: section.sectionKey },
                { $set: section },
                { upsert: true, new: true }
            );
            console.log(`✅ ${section.sectionKey} → ${result.sectionLabel}`);
        }

        console.log(`\n🎉 All ${SECTIONS.length} sections seeded successfully!`);
    } catch (err) {
        console.error("❌ Seed error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
