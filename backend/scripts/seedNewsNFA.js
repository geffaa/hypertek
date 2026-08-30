/**
 * Seed: Non-Fungible Digital Artworks article.
 * Image will be updated via admin panel.
 *
 * Run: node --env-file=Config/.env scripts/seedNewsNFA.js
 */

import mongoose from "mongoose";
import News from "../Models/News.js";

const ARTICLE = {
  heading: "Own the Future ... Hyper Tek Non-Fungible Digital Artworks Are Here!",
  description: `Three Tiers. Guaranteed buy-back. Real value. This is digital ownership done right.

Everything you thought you knew about NFTs is wrong. At Hyper Tek, our Non-Fungible Digital Artworks are not speculative gambles. They are blockchain-linked, tightly detailed digital artworks with something no other project offers: a guaranteed minimum buy-back on every single one. That means the moment you purchase a Hyper Tek artwork, it already has real, protected value, and that value only goes up. Every time an artwork is resold, the guaranteed minimum buy-back increases, ensuring your investment is always growing, never shrinking. This is digital ownership with built-in confidence.

## Three Types of Non-Fungible Digital Artworks

Non-Fungible Assets (NFAs) are the rarest tier in the Hyper Tek ecosystem. These are ultra rare, architect-created artworks with the biggest in-game bonuses of any artwork tier. They are also awarded as exclusive rewards during major in-game events. These are rare, powerful, and highly sought after.

Non-Fungible Collections (NFCs) also deliver in-game bonuses and can be created by both the game architects and by players who follow specific parameters. NFCs open the door for the community to contribute creativity while still earning real gameplay advantages. They are collectibles that combine player expression with competitive utility.

Non-Fungible Tokens (NFTs) are fully player-created artworks. While they do not carry direct in-game bonuses, they can be collected and used to decorate a player's base or spaceship, and that customization contributes to an overall power level bonus. This is where your creativity becomes your competitive edge and the beginning of your play-to-earn journey.

## A Guaranteed Minimum Buy-Back on Every Single Piece

This is what separates Hyper Tek from every other project in the space. Your artwork can never drop below its protected value. It only goes up.

Every resale increases the guaranteed minimum buy-back floor. No other project in the gaming or NFT space offers this level of contractual asset protection. This is not a promise based on market conditions or community sentiment. It is a structural guarantee built into the platform itself.

For investors and early adopters, this represents a ground-floor opportunity in a project that has built genuine asset protection into its foundation from day one.

## A Marketplace Built on Fairness and Social Interaction

Most of the marketplace commission from every transaction doesn't stay with Hyper Tek 100, it's redirected into three areas: increasing guaranteed minimum buy-back values across all artworks, paying royalties directly to the original artists who created them, and funding Questing rewards that drive player engagement and social interaction at every level.

This commission-sharing model is unique to the Hyper Tek Project. It does not just promise a fair economy. It is designed and structured to deliver one. Every transaction on the marketplace actively strengthens the ecosystem for every participant, from the buyer to the artist to the player earning rewards through questing.

## Help Build the Future. Get Involved Now.

Hyper Tek is actively raising early backer support to bring the most ambitious gaming universe to life, and you can be part of it right now. Every artwork purchased on the Hyper Tek website directly funds the development of Hyper Racing, Hyper Quest, and Overlord of the 7 Realms. Your purchase is not a donation. It is a stake in an ecosystem where your digital assets have real, guaranteed, ever-increasing value.

Want to go even further? Create your own NFT and list it on the marketplace. Your support does not just fund a game. It funds an entire ecosystem where every participant benefits, and where every artwork you own is backed by the strongest buy-back guarantee in digital gaming.

## Own Something That Holds Its Value

Most digital assets lose value the moment you buy them. Hyper Tek took a different approach. The buy-back floor increases with every resale. The platform is designed so that holding a Hyper Tek artwork is never a losing position.

Visit www.hypertek.com now to browse, buy, or create your own Non-Fungible Digital Artwork. Back the project. Own the future. Be an early supporter and own artworks that are guaranteed to hold and grow in value. This is your chance to be part of something truly unique.

One Universe. Three Games. Guaranteed Value. The Future of Digital Ownership Starts with Hyper Tek.`,
  image: "/uploads/news/loading_game.png",
  status: "active",
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");

  const exists = await News.findOne({ heading: ARTICLE.heading });
  if (exists) {
    await News.findByIdAndUpdate(exists._id, { $set: { description: ARTICLE.description } });
    console.log("Updated existing article.");
  } else {
    await News.create(ARTICLE);
    console.log("Created new article.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch(err => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
