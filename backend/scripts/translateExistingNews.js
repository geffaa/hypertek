/**
 * One-time script: translate all existing News documents that have no translations yet.
 * Run: node --experimental-vm-modules scripts/translateExistingNews.js
 * (or via: npx ts-node scripts/translateExistingNews.js if using ts-node)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import News from "../Models/News.js";
import { translateNewsContent } from "../utils/translateContent.js";

dotenv.config({ path: ".env.local" });

async function run() {
  const uri = process.env.MONGODB_URL || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const allNews = await News.find({});
  console.log(`Found ${allNews.length} news articles total`);

  for (const item of allNews) {
    const hasTranslations = item.translations && item.translations.size > 0;
    if (hasTranslations) {
      console.log(`[SKIP] "${item.heading.slice(0, 40)}..." already translated`);
      continue;
    }

    console.log(`[Translating] "${item.heading.slice(0, 50)}..."`);
    try {
      const translations = await translateNewsContent(item.heading, item.description);
      item.translations = translations;
      await item.save();
      console.log(`  ✓ Done (${Object.keys(translations).length} languages)`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log("\nAll done!");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
