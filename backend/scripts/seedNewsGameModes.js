/**
 * Seed: Full article content for the 3 game-mode news articles.
 * Uses ## prefix for subtitles. No em dashes.
 * Only updates description — images are left untouched.
 *
 * Run: node --env-file=Config/.env scripts/seedNewsGameModes.js
 */

import mongoose from "mongoose";
import News from "../Models/News.js";

const UPDATES = [
  {
    heading: "Hyper QUEST : the awakening",
    description: `The stars have been waiting. Hyper Quest is now open for exploration, and the universe will never be the same. The first chapter of an ever-expanding cosmic adventure has officially begun.

## What is Hyper Quest?

Hyper Quest is the exploration and trade pillar of the Hyper Tek universe. You take command of your own spacecraft and venture into uncharted star systems filled with ancient ruins, rival factions, dangerous wildlife, and resources worth fighting for. Every planet holds secrets. Some will make you rich. Others will push your survival instincts to their limits.

Unlike a traditional game, Hyper Quest is a living ecosystem. The more players that explore, trade, and compete, the richer and more complex the universe becomes. Your actions have a direct and permanent impact on the world around you.

## How It Works

You begin by selecting your ship class and choosing your starting faction. Each faction offers a different playstyle, from merchant convoys and diplomatic traders to bounty hunters and deep-space raiders. Your reputation with each faction grows or falls based on every decision you make.

From there, the galaxy is yours to navigate. Take on delivery contracts to earn steady income. Hunt bounties to build your combat reputation. Mine asteroid fields for rare materials that fuel upgrades across the entire Hyper Tek economy. Complete ancient ruins missions to unlock exclusive lore, items, and cosmetics tied to the Hyper Tek storyline.

Every mission you complete, every trade you finalize, and every battle you survive earns you experience and in-game currency that feeds directly into the shared Hyper Tek economy.

## Your Role in the Shared Economy

Hyper Quest is not isolated. Every resource you mine, every material you trade, and every mission you complete creates ripple effects across the other two Hyper Tek games.

Racing crews need fuel and parts that come from Quest miners. Overlord armies need raw materials that Quest traders supply. The pricing, availability, and scarcity of resources in the market are shaped by how active the Quest player base is at any given time. You are not just a player. You are a market force.

## Progression and Rewards

Your spacecraft grows with you. As you complete missions and earn experience, you unlock new ship components, crew upgrades, and navigation modules. Your ship becomes a reflection of your playstyle and your history in the galaxy.

Play-to-earn mechanics are built into every layer of Hyper Quest. In-game currency earned through gameplay can be converted to real-world value through the Hyper Tek marketplace. Non-Fungible Assets acquired during exploration carry guaranteed minimum buy-back values, so your progress always has tangible worth.

## What to Expect at Launch

The Awakening launches with three fully explorable star systems, two active faction storylines, a live bounty board updated in real time, and the first chapter of the Hyper Tek lore campaign. Additional systems, factions, and story chapters will unlock as the community grows and milestones are reached.

## Join the Awakening

Your spacecraft is waiting. The galaxy is open. Register your account, choose your faction, and begin your journey across the stars. This is only the beginning of the Hyper Quest story, and you are part of it.`,
  },
  {
    heading: "Hyper racing : the velocity wars",
    description: `Speed is no longer just a game. It is a way of life. Hyper Racing has officially launched its first competitive season, and the leaderboard is already heating up across the galaxy.

## What is Hyper Racing?

Hyper Racing is the speed and competition pillar of the Hyper Tek universe. You pilot fully upgradable flying race vehicles across alien worlds, hostile terrain, and orbital circuits where gravity itself becomes your opponent. Every race is a battle of skill, strategy, and machine.

This is not a casual racing game. Real cash prizes are on the line for top performers in every competitive season. The gap between first place and last place is measured in more than just time. It is measured in territory, resources, and reputation across the entire Hyper Tek universe.

## How It Works

You start by selecting your vehicle class and assembling your crew. Your crew provides passive bonuses to speed, handling, fuel efficiency, and tactical abilities that can be activated mid-race. Building the right crew around your vehicle is just as important as tuning the machine itself.

Races take place across a rotating set of circuits that change each season. Circuits include volcanic plains on molten worlds, zero-gravity orbital rings around gas giants, underwater tunnels on ocean planets, and canyon runs through shattered asteroid fields. Each circuit rewards a different set of skills and vehicle configurations.

Between races, you spend time in the garage. Upgrading your engine, adjusting your aerodynamics, installing new weapon systems for combat circuits, and managing your crew roster are all part of the strategy that separates champions from the rest of the field.

## The Velocity Wars Season

The Velocity Wars is the name of the current competitive season. It introduces faction-based racing leagues alongside individual rankings. You align with one of four racing factions, each with their own circuits, crew types, vehicle aesthetics, and competitive bonuses.

Your individual race results contribute to both your personal ranking and your faction's standing. At the end of the season, the top individual racers and the top faction each claim a share of the prize pool. Faction members who contributed the most to their faction's success receive a bonus allocation on top of their individual earnings.

## Your Earnings, Your Choice

Everything you earn in Hyper Racing flows into the shared Hyper Tek economy. Vehicle parts, performance materials, and in-game currency carry across Hyper Quest and Overlord of the Seven Realms. A strong performance on the track powers your progress everywhere else in the ecosystem.

Play-to-earn is built into the core of Hyper Racing. In-game currency earned through races, tournaments, and territory control can be converted to real-world value through the Hyper Tek marketplace. Non-Fungible Assets tied to your vehicles carry guaranteed minimum buy-back values, protecting the real-world worth of your in-game investment.

## How to Get Started

Register your account, select your starting vehicle class, and join the Velocity Wars season before the entry window closes. New racers receive a starter vehicle, a basic crew, and enough in-game currency to make their first set of upgrades. From there, what you build and how far you go is entirely up to you.

## The Race Is On

The Velocity Wars season is live. The circuits are open. The leaderboard is waiting for your name. Get in the cockpit and show the galaxy what you are made of.`,
  },
  {
    heading: "Overlord Realm : The Final Ascent",
    description: `The Seven Realms have fallen into chaos. Factions clash across three battle dimensions, ancient alliances have shattered, and the throne of the Supreme Overlord sits empty. The Final Ascent has begun, and only one will claim it.

## What is Overlord of the Seven Realms?

Overlord of the Seven Realms is the strategy and conquest pillar of the Hyper Tek universe. You arrive on a hostile alien planet with nothing but ambition and begin building an empire from the ground up. Every decision shapes your power, your alliances, and your legacy.

This is a game of deep strategy. Combat, diplomacy, resource management, and psychological warfare all play equal roles in your rise to dominance. The player who masters all four becomes the most feared force in the Seven Realms.

## How It Works

You begin by establishing your base and choosing your starting specialization. Military commanders focus on army strength and territorial expansion. Engineers focus on fortress construction and defensive systems. Diplomats focus on alliance networks and economic leverage. Each path leads to power through a different route, and the best Overlords combine all three.

From your base, you expand outward by conquering neutral territories, raiding rival Overlords, and negotiating with allied factions. Every territory you control generates resources that fund your expansion. The more territory you hold, the stronger your position becomes, and the larger the target on your back.

## Battle Across Three Dimensions

Combat in Overlord takes place across ground, air, and space simultaneously. Ground forces clash for direct territory control. Air units provide tactical support, reconnaissance, and strike capabilities. Space assets enable orbital bombardment, resource interdiction, and rapid troop deployment across vast distances.

You build and command each layer independently, but the interactions between them define the outcome of every engagement. A superior ground force can be neutralized by effective air denial. A dominant air fleet can be countered by orbital defense platforms. Mastering the interplay between all three dimensions is what separates true Overlords from their rivals.

## The Final Ascent Championship

The Final Ascent introduces the Overlord Championship, a global competition for dominance across all Seven Realms. Each season, players compete for territorial control across a shared map where every Overlord's actions affect every other player.

The player who controls the most total territory at the end of the season earns the title of Supreme Overlord and the largest share of the season prize pool. Faction alliances, territorial agreements, and coordinated campaigns between allied Overlords are all legal strategies. So is betraying your allies the moment it becomes advantageous.

## Shared Economy Impact

Overlord of the Seven Realms operates within the shared Hyper Tek economy. Resources extracted from conquered territories feed into the broader marketplace used by Hyper Racing teams and Hyper Quest traders. Your empire is not just a local achievement. Its output shapes pricing, availability, and scarcity across the entire ecosystem.

Non-Fungible Assets tied to your armies, fortresses, and territory carry guaranteed minimum buy-back values. The in-game currency you earn through conquest and trade can be converted to real-world value through the Hyper Tek marketplace.

## Forge Your Legacy

The Seven Realms are contested. Alliances are forming and breaking across the map. The championship clock is running. Build your empire, command your armies, and claim the realms before someone else does.

The ascent begins now.`,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");

  for (const item of UPDATES) {
    const result = await News.findOneAndUpdate(
      { heading: item.heading },
      { $set: { description: item.description } },
      { new: true }
    );
    if (result) {
      console.log(`Updated: "${item.heading}"`);
    } else {
      console.log(`Not found: "${item.heading}" — skipped`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
