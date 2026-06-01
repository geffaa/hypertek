import mongoose from "mongoose";
import dotenv from "dotenv";
import News from "../Models/News.js";

dotenv.config({ path: ".env.local" });

async function run() {
  const uri = process.env.MONGODB_URL || process.env.MONGO_URI;
  await mongoose.connect(uri);

  const news = await News.findOne({});
  console.log("Heading (EN):", news.heading);
  console.log("---");

  for (const lang of ["ko", "id", "ja", "fr"]) {
    const t = news.translations?.get(lang);
    console.log(`[${lang}] heading: ${t?.heading?.slice(0, 70) || "(empty)"}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
