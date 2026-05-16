/**
 * Seed: Hyper Bucks launch article.
 * Image will be updated via admin panel.
 *
 * Run: node --env-file=Config/.env scripts/seedNewsHyperBucks.js
 */

import mongoose from "mongoose";
import News from "../Models/News.js";

const ARTICLE = {
  heading: "Hyper Tek Goes Hyper Bucks ... The Native Currency That Pays You to Play!",
  description: `Hyper Tek has officially introduced its native currency: Hyper Bucks. This is the tool that powers three interconnected games, a unified marketplace, and a player-driven economy where everything you earn has real-world value. At a rate of 250 Hyper Bucks to 1 USD (USDC), Hyper Bucks are designed for accessibility, high-volume in-game circulation, and seamless conversion into real money.

## What Are Hyper Bucks?

Hyper Bucks are the native currency of the Hyper Tek ecosystem. Every in-game action across all three Hyper Tek games earns Hyper Bucks. Every marketplace transaction uses them. Every reward, prize, and cash-out payment runs through them.

The exchange rate is fixed at 250 Hyper Bucks to 1 USD (USDC). This rate is designed to keep the currency accessible for high-frequency, in-game use while maintaining a clear and predictable conversion path to real-world value. You always know exactly what your Hyper Bucks are worth.

## Play. Earn. Cash Out. In Real Time.

Your Hyper Bucks are not locked behind withdrawal windows or complex trading platforms. Cash-out payments process in real time, directly to your bank account whenever you choose. Buy groceries, cover your power bill, and fuel the car. This is play-to-earn with real utility.

Race flying vehicles across alien worlds in Hyper Racing and get paid for every podium finish. Explore the galaxy in Hyper Quest and earn Hyper Bucks for every quest you complete. Wage war across the three battle dimensions of Overlord of the 7 Realms and earn rewards from daily events, ranked competitions, and legendary tournament brackets. Every action across all three games feeds Hyper Bucks directly into your wallet.

## One Currency. Three Games. An Unstoppable Economy.

Hyper Bucks connect all three Hyper Tek games into a single, unified economy. What you earn in Hyper Racing can be spent in Hyper Quest. What you win in Overlord feeds back into the marketplace. Nothing is siloed. Every Hyper Buck you earn in any game has the same value, the same utility, and the same conversion path to real money across the entire ecosystem.

This shared economy design means that the more active the player base becomes, the more dynamic and rewarding the economy gets. Demand for Hyper Bucks grows as the ecosystem expands, and that growth benefits every player who is already participating.

## How You Earn Hyper Bucks

There are multiple earning paths built into every layer of the Hyper Tek ecosystem. In Hyper Racing, you earn through race results, lap records, faction standings, and seasonal tournament placements. In Hyper Quest, you earn through mission completions, trade deliveries, bounty captures, and faction reputation milestones. In Overlord of the 7 Realms, you earn through territorial conquest, defensive victories, alliance contributions, and championship rankings.

Beyond gameplay, you can earn through the Hyper Tek marketplace. Listing Non-Fungible Assets, completing trades, and participating in marketplace events all generate Hyper Bucks. The more active you are across the ecosystem, the more you earn.

## Non-Fungible Assets and the Buy-Back Guarantee

Every Non-Fungible Asset on the Hyper Tek marketplace carries a guaranteed minimum buy-back value. This means your in-game assets are protected. If you decide to exit the ecosystem or sell an asset, Hyper Tek guarantees it will be repurchased at no less than the minimum floor price.

Hyper Bucks are the currency that makes this system work. The buy-back guarantee is funded and executed through the Hyper Tek platform economy, with Hyper Bucks as the medium of exchange. Your assets have real, protected, convertible value at all times.

## Why Investors and Players Should Pay Attention

Hyper Tek is not a single game with a tacked-on token. It is a multi-genre Web3 gaming ecosystem built around a shared economy, interconnected progression, and a native currency designed for real circulation at scale.

The Hyper Bucks system is built to grow. As the player base expands across all three games, demand for Hyper Bucks increases. As demand increases, the economy becomes more active. As the economy becomes more active, rewards grow, asset values rise, and the ecosystem generates more real-world value for everyone participating. The flywheel is designed to accelerate over time, not stagnate.

For investors, this represents a gaming economy where player activity directly drives platform value. For players, it means every hour spent in the Hyper Tek universe is an hour that can generate real income.

## Get Started Today

Visit the Hyper Tek website now to explore the full project and sign up for the waitlist. Be the first to receive updates, exclusive access, and early opportunities as the ecosystem launches. Do not miss this. The future of play-to-earn gaming is here, and Hyper Bucks are at the heart of it.

One universe. Three games. One currency. Unlimited potential. The future of gaming starts with Hyper Bucks.`,
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
