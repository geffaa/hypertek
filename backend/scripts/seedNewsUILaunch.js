/**
 * Seed: Hyper Tek UI Launch news article
 *
 * Run: node --env-file=Config/.env scripts/seedNewsUILaunch.js
 */

import mongoose from "mongoose";
import News from "../Models/News.js";

const ARTICLE = {
  heading: "The Hyper Tek User Interface Is Here... And It Changes Everything!",
  description: `Three games. One marketplace. One shared economy. One seamless experience. The Hyper Tek User Interface has arrived, and it is the gateway to the most ambitious interconnected gaming universe ever built!

Hyper Tek is not just a game; it is an entire ecosystem. Hyper Racing puts you behind the controls of fully upgradable flying race vehicles across alien worlds with real cash prizes on the line. Hyper Quest launches you into open-world space exploration where you command your own spaceship, mine asteroids, hunt bounties, and build an empire from the cockpit. Overlord of the 7 Realms drops you onto a hostile planet where you rebuild, clone armies, tame beasts, and wage war across three battle dimensions: ground, air, and space. Everything you earn, build, and unlock flows seamlessly between all three games.

The challenge was massive: how do you unify three games, a live marketplace, shared inventories, player progression, and a Web3-powered economy into one interface that feels effortless? That is exactly what the Hyper Tek team delivered. A special shout-out to software engineer Yodhamus Geffananda, who engineered the layout and brought it to life, connecting the games, website, and marketplace into one reactive, seamless experience.

The UI is now live and embedded directly into the Hyper Tek website. While some features remain locked as the games continue development, there is plenty for you to explore right now. Navigate the ecosystem, check out the marketplace, and see how three worlds connect through one powerful interface.

Visit the Hyper Tek website now and try the User Interface for yourself! Explore it, test it, and tell us what you think. This is your universe, help us shape it.

One universe. Three games. Unlimited potential. The future of gaming starts here.`,
  image: "/uploads/news/loading_game.png",
  status: "active",
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB");

  const exists = await News.findOne({ heading: ARTICLE.heading });
  if (exists) {
    console.log("ℹ️  Article already exists, skipping.");
  } else {
    await News.create(ARTICLE);
    console.log("✅ News article inserted successfully.");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
