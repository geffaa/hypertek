import mongoose from "mongoose";
import dotenv from "dotenv";
import News from "../Models/News.js";

dotenv.config({ path: ".env.local" });

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");

  // Assign sortOrder based on current createdAt order (newest = highest number)
  const allNews = await News.find({}).sort({ createdAt: -1 }).lean();
  for (let i = 0; i < allNews.length; i++) {
    await News.findByIdAndUpdate(allNews[i]._id, { sortOrder: allNews.length - i });
  }
  console.log(`Set sortOrder for ${allNews.length} articles`);

  // Find the two articles to swap
  const quest = await News.findOne({ heading: /hyper quest.*awakening/i });
  const racing = await News.findOne({ heading: /hyper racing.*velocity/i });

  if (!quest || !racing) {
    console.error("Could not find one or both articles");
    console.log("Quest:", quest?.heading);
    console.log("Racing:", racing?.heading);
    await mongoose.disconnect();
    return;
  }

  console.log("Quest sortOrder:", quest.sortOrder, "| Racing sortOrder:", racing.sortOrder);

  // Swap sortOrder values
  await News.findByIdAndUpdate(quest._id, { sortOrder: racing.sortOrder });
  await News.findByIdAndUpdate(racing._id, { sortOrder: quest.sortOrder });

  console.log("Swapped! Racing now appears before Quest.");
  await mongoose.disconnect();
}

main().catch(console.error);
