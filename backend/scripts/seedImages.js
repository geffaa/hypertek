/**
 * Patch placeholder images onto existing NFTSystem records.
 * Safe to re-run — only updates records where image is empty.
 *
 * Run: node scripts/seedImages.js
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
import News from "../Models/News.js";

const NEWS_IMAGES = [
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
  "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800&q=80",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
  "https://images.unsplash.com/photo-1568772585407-9f217f0d0a5a?w=800&q=80",
  "https://images.unsplash.com/photo-1568772585407-9f217f0d0a5a?w=800&q=80",
];

// ── Category images (parent collection banners) ───────────────────────────────
const CATEGORY_IMAGES = {
  "Skins": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
  "Weapons": "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=600&q=80",
  "Military Badges and Collectables": "https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&q=80",
  "Body Armour": "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&q=80",
  "Specialists": "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=600&q=80",
  "Spaceships": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
  "Racing Vehicles": "https://images.unsplash.com/photo-1568772585407-9f217f0d0a5a?w=600&q=80",
  "Artwork": "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80",
  "Land and Bases": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
};

// ── Sub-item images per category ───────────────────────────────────────────────
const ITEM_IMAGES = {
  "Skins": [
    "https://images.unsplash.com/photo-1590212151175-e58edd96185b?w=400&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
    "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
    "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&q=80",
  ],
  "Weapons": [
    "https://images.unsplash.com/photo-1525088553748-01d6e210e00b?w=400&q=80",
    "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80",
    "https://images.unsplash.com/photo-1563207153-f403bf289163?w=400&q=80",
  ],
  "Military Badges and Collectables": [
    "https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=400&q=80",
    "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=400&q=80",
    "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80",
  ],
  "Body Armour": [
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80",
    "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
    "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&q=80",
  ],
  "Specialists": [
    "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=400&q=80",
    "https://images.unsplash.com/photo-1598550476439-6847ef8edd6d?w=400&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
  ],
  "Spaceships": [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80",
    "https://images.unsplash.com/photo-1614728263952-84ea256f9d1d?w=400&q=80",
    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400&q=80",
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80",
    "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&q=80",
  ],
  "Racing Vehicles": [
    "https://images.unsplash.com/photo-1568772585407-9f217f0d0a5a?w=400&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    "https://images.unsplash.com/photo-1471479917193-f00955256257?w=400&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  ],
  "Artwork": [
    "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&q=80",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
    "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&q=80",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&q=80",
    "https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=400&q=80",
  ],
  "Land and Bases": [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
    "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80",
    "https://images.unsplash.com/photo-1465829235810-1f912537f253?w=400&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
  ],
};

async function patchImages() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB\n");

  const parents = await NFTSystem.find({ isParentCollection: true });
  let updated = 0;
  let skipped = 0;

  for (const parent of parents) {
    const catName = parent.collection?.name;
    const catImage = CATEGORY_IMAGES[catName];
    const itemImages = ITEM_IMAGES[catName] || [];

    let changed = false;

    // Patch parent collection image
    if (!parent.collection.image && catImage) {
      parent.collection.image = catImage;
      changed = true;
    }

    // Patch sub-collection images
    parent.subCollections.forEach((sub, i) => {
      if (!sub.image && itemImages[i]) {
        sub.image = itemImages[i];
        changed = true;
      }
    });

    if (changed) {
      await parent.save();
      console.log(`✅ Patched: ${catName}`);
      updated++;
    } else {
      console.log(`⏭️  Skipped (already has images): ${catName}`);
      skipped++;
    }
  }

  // ── Patch News images ──
  const newsDocs = await News.find({});
  let newsUpdated = 0;
  for (const [i, doc] of newsDocs.entries()) {
    if (!doc.image || doc.image.startsWith("/uploads/")) {
      doc.image = NEWS_IMAGES[i % NEWS_IMAGES.length];
      await doc.save();
      newsUpdated++;
    }
  }

  console.log(`\n── Summary ───────────────────────────────────`);
  console.log(`📸 NFT collections updated: ${updated}, skipped: ${skipped}`);
  console.log(`📰 News images updated: ${newsUpdated}`);
  console.log(`──────────────────────────────────────────────\n`);

  await mongoose.disconnect();
  console.log("✅ Done.");
}

patchImages().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
