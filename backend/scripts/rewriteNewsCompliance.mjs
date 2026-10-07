// One-off content fix for the live news collection (7 Oct 2026).
// Deletes the two Hyper Bucks articles Don marked DELETE and rewrites the
// other seven in the compliance wording. Stored translations are cleared so
// other languages fall back to the corrected English instead of the old text.
//
//   node scripts/rewriteNewsCompliance.mjs           dry run
//   node scripts/rewriteNewsCompliance.mjs --apply   writes
import "dotenv/config";
import mongoose from "mongoose";

const apply = process.argv.includes("--apply");

const DELETE_IDS = ["6a21fc68ecac52c7d149877d", "6a085b1688e97c84ca7690e6"];

const SUBJECT = "Everything described here is proposed and in development, and is subject to the games being finalised and to the final game rules.";

const REWRITE = {
  "69b80bd841b3ec0a5c21f005": {
    heading: "Hyper Tek Marketplace Is Live on Base Mainnet",
    description: `The Hyper Tek marketplace is live on the Base mainnet. Players can buy and sell digital game items, with ownership of each item recorded on the blockchain.

Eligible items carry a Programmatic Trade-In Value, held in an on-chain escrow that anyone can verify. An owner may trade an eligible item in under the Tiered Loyalty Return Schedule, and the amount returned is always less than the amount allocated to that item. Items are digital collectibles sold as is. They are not an investment, and no profit or financial return is promised.

Player-to-player trading is planned as the next step. The games themselves are in development, and any in-game bonuses listed on an item may only apply if the games are finalised.`,
  },

  "69b80bd841b3ec0a5c21f00b": {
    heading: "Understanding the Programmatic Trade-In Value",
    description: `Eligible Non-Fungible Digital Artworks sold on the Hyper Tek Marketplace carry a Programmatic Trade-In Value. Part of each first sale, plus 5% of every resale, is added to that item's own trade-in allocation, which is held in an on-chain escrow that anyone can verify.

## How a Trade-In Works

The owner of an eligible item may trade it in at any time. The item is surrendered and recycled back into the game, and the owner receives an amount set by the Tiered Loyalty Return Schedule: from 80% of the item's allocation in year one, up to 97% after year five.

## What It Is Not

Because part of the allocation is always retained, the amount returned is always less than the amount allocated. The Programmatic Trade-In Value is a product recycling feature. It is not an investment, not a way to make money, and no profit or financial return is promised.`,
  },

  "69b839b51b1c732fd96d4fd3": {
    heading: "Overlord Realm : The Final Ascent",
    description: `The Seven Realms have fallen into chaos. Factions clash across three battle dimensions, ancient alliances have shattered, and the throne of the Supreme Overlord sits empty. The Final Ascent is the story behind the proposed Overlord of the Seven Realms game.

${SUBJECT}

## What Is the Proposed Overlord of the Seven Realms?

Overlord of the Seven Realms is the planned strategy and conquest pillar of the Hyper Tek universe. The proposed game has you arrive on a hostile alien planet with nothing but ambition and begin building an empire from the ground up, where every decision may shape your power, your alliances, and your legacy.

It is planned as a game of deep strategy. Combat, diplomacy, resource management, and psychological warfare are all proposed to play equal roles in your rise to dominance.

## How It Is Planned to Work

You may begin by establishing your base and choosing a starting specialisation. Military commanders are planned to focus on army strength and territorial expansion, engineers on fortress construction and defensive systems, and diplomats on alliance networks. Each proposed path leads to power through a different route.

From your base, you may be able to expand outward by conquering neutral territories, raiding rival Overlords, and negotiating with allied factions. Territory you control is planned to generate in-game resources that support your expansion.

## Battle Across Three Dimensions

Combat is proposed to occur across three dimensions: ground-to-ground, ground-to-space, and space-to-space. Ground forces may engage in direct battles for territory, air units may offer tactical support and reconnaissance, and space units may allow orbital bombardment and the rapid deployment of troops over long distances.

Players may be able to build and command each layer independently, with the interaction between the layers planned to decide the outcome of each engagement.

## The Proposed Final Ascent Championship

The Final Ascent is planned to introduce the Overlord Championship, a proposed seasonal competition for territorial control on a shared map. At the end of a season, the player who controls the most territory may be awarded the title of Supreme Overlord and in-game rewards. Faction alliances, territorial agreements, and coordinated campaigns are all proposed strategies.

## One Connected Universe

Overlord of the Seven Realms is planned to share progression with Hyper Racing and Hyper Quest. In-game resources gathered from conquered territories may be usable across the other planned games.

Eligible items tied to your armies, fortresses, and territory may carry a Programmatic Trade-In Value. In-game rewards have no cash value and cannot be converted into money.

## Forge Your Legacy

The games are in development. Explore the Hyper Tek website and User Interface now to see what is planned.`,
  },

  "69b839b51b1c732fd96d4fd6": {
    heading: "Hyper Racing : The Velocity Wars",
    description: `Speed is no longer just a game; it's a way of life! The Velocity Wars is the story behind the proposed Hyper Racing game.

${SUBJECT}

## What Is the Proposed Hyper Racing?

Hyper Racing is the planned speed and competition pillar of the Hyper Tek universe. In the proposed game you may pilot fully upgradable flying race vehicles across alien worlds, challenging terrains, and orbital circuits where gravity itself can be an enemy. Every race is planned as a contest of skill, strategy, and machinery.

Ranked events and tournaments are planned to offer in-game rewards, titles, and leaderboard standing. They do not offer cash or money prizes.

## How It Is Planned to Work

You may begin by selecting your vehicle class and assembling your crew. Crew members are proposed to provide bonuses to speed, handling, fuel efficiency, and tactical abilities that may be activated during a race.

Races are planned across a rotating selection of circuits, with proposed environments including volcanic plains on molten worlds, floating rock formations, zero-gravity orbital rings around gas giants, underwater tunnels on ocean planets, and canyon runs through shattered asteroid fields. Each circuit may reward different skills and vehicle configurations.

Between races, you may be able to spend time in the garage upgrading your engine, adjusting your aerodynamics, and managing your crew roster.

## In-Game Rewards

In-game rewards gained in Hyper Racing are planned to carry across Hyper Quest and Overlord of the Seven Realms, so a strong performance on the track may support your progress in the other planned games.

In-game rewards have no cash value and cannot be converted into money. Eligible items tied to your vehicles may carry a Programmatic Trade-In Value, which always returns less than the amount allocated to the item. Items are not an investment.

## The Race Is Planned

The games are in development. Explore the Hyper Tek website and User Interface now to see what is planned.`,
  },

  "69b839b51b1c732fd96d4fd9": {
    heading: "Hyper QUEST : The Awakening",
    description: `The stars have been waiting. The Awakening is the story behind the proposed Hyper Quest game, the planned first chapter of a cosmic adventure.

${SUBJECT}

## What Is the Proposed Hyper Quest?

Hyper Quest is the planned exploration pillar of the Hyper Tek universe. In the proposed game you may take command of your own spacecraft and venture into uncharted star systems filled with ancient ruins, rival factions, dangerous wildlife, and in-game resources.

Hyper Quest is planned as a living world, where the more players explore and compete, the more complex the universe may become.

## How It Is Planned to Work

You may manage your own spaceship, customising upgrades and crew to suit your preferred playstyle, whether as a merchant, bounty hunter, or deep-space raider. Your reputation with each proposed faction may change with the decisions you make.

Proposed activities include delivery missions, bounty hunting, and mining asteroid fields for rare in-game materials. Missions involving ancient ruins may unlock lore, in-game items, and cosmetics tied to the Hyper Tek storyline. Completed missions are planned to give experience points and in-game rewards.

## One Connected Universe

Hyper Quest is planned to be interconnected with the other Hyper Tek games. In-game resources you gather may be usable in Hyper Racing and Overlord of the Seven Realms.

## Progression and In-Game Rewards

Your spacecraft is planned to grow with you. As you complete missions and gain experience, you may unlock new ship components, crew upgrades, and navigation modules.

In-game rewards have no cash value and cannot be converted into money. Eligible items may carry a Programmatic Trade-In Value, which always returns less than the amount allocated to the item.

## What Is Proposed for Launch

The Awakening is proposed to launch with explorable star systems, faction storylines, an in-game questing board, and the first chapter of the Hyper Tek lore campaign. Further systems, factions, and story chapters may follow.

## Join the Awakening

The games are in development. Explore the Hyper Tek website and User Interface now to see what is planned.`,
  },

  "6a0843ece38f19b6c07d5a06": {
    heading: "The Hyper Tek User Interface Is Here... And It Changes Everything!",
    description: `"One Universe. Three Planned Games. A Digital Marketplace. A Seamless Experience."

The Hyper Tek User Interface has arrived, and it is the gateway to the interconnected gaming universe we are developing!

Hyper Tek is planned as more than a single game. The proposed Hyper Racing may put you behind the controls of fully upgradable flying race vehicles across alien worlds, competing for in-game rewards. The proposed Hyper Quest may launch you into open-world space exploration where you command your own spaceship, mine asteroids, and hunt bounties. The proposed Overlord of the 7 Realms may drop you onto a hostile planet where you rebuild, clone armies, tame beasts, and battle across three dimensions: ground, air, and space. Progress is planned to carry between all three games, subject to the games being finalised and to the final game rules.

The challenge was massive: how do you unify three planned games, a live marketplace, shared inventories, and player progression into one interface that feels effortless? That is exactly what the Hyper Tek team delivered. A special shout-out to software engineer Yodhimas Geffananda, who engineered the layout and brought it to life, connecting the games, website, and marketplace into one reactive, seamless experience.

The UI is now live and embedded directly into the Hyper Tek website. While some features remain locked as the games continue development, there is plenty for you to explore right now. Navigate the interface, check out the marketplace, and see how three worlds are planned to connect.

Visit the Hyper Tek website now and try the User Interface for yourself! Explore it, test it, and tell us what you think. [CTA_GAMING]

**"One Universe. Three Planned Games. The Future of Gaming Starts Here."**`,
  },

  "6a085c0c5e23bae6bac96256": {
    heading: "Own Your Items ... Hyper Tek Non-Fungible Digital Artworks Are Here!",
    description: `Three tiers. A Programmatic Trade-In Value. Digital ownership recorded on-chain.

Hyper Tek Non-Fungible Digital Artworks are blockchain-linked, tightly detailed digital artworks. Eligible artworks carry a Programmatic Trade-In Value: part of each first sale, plus 5% of every resale, is added to that item's own trade-in allocation, held in an on-chain escrow that anyone can verify.

## Three Types of Non-Fungible Digital Artworks

Non-Fungible Articles (NFAs) are the rarest tier in the Hyper Tek ecosystem. These are architect-created artworks with the proposed highest in-game bonuses of any artwork tier, from semi rare to ultra rare.

Non-Fungible Collectables (NFCs) are proposed collectibles with in-game bonuses, and can be created by both the game architects and by players who follow specific parameters.

Non-Fungible Tokens (NFTs) are fully player-created artworks. They do not carry direct in-game bonuses, but may be collected and used to decorate a player's base or spaceship for proposed in-game bonuses.

All in-game bonuses are proposed and may only apply if the games are finalised, subject to the final game rules.

## Recyclable On-Chain Items

The owner of an eligible item may trade it in at any time. The item is surrendered and recycled back into the game, and the owner receives an amount set by the Tiered Loyalty Return Schedule, from 80% of the item's allocation in year one up to 97% after year five.

The amount returned is always less than the amount allocated. This is a product recycling feature, not an investment and not a way to make money. No profit or financial return is promised, and resale is not guaranteed.

## Fair by Design

Most of the marketplace commission is planned to go back into the ecosystem: into each item's own trade-in allocation and into royalties for the original artists. Buyers who post quests may lower their commission as a discount, while players who complete quests receive in-game rewards.

## Get Involved Now

The infrastructure is built and the marketplace is live. As we continue to develop the games, we will be releasing capped amounts of limited-edition items with proposed higher-than-normal in-game bonuses, which are not planned to be repeated.

You can also become a creator: make your own NFT and offer it to other players on the marketplace.

Visit www.hypertek.com to browse, buy, or create your own Non-Fungible Digital Artwork.

Browse. Buy. Create. Own Your Items.`,
  },
};

const BANNED = /hyper ?bucks|\bHB\b|buy-?back|guarantee[sd]?\b(?!\.)|real money|real-world|cash ?out|\binvest(or|ors|ing|ed)?\b|donat|\bearn|play-to-earn|recruit|econom|prize pool|\bassets?\b|currency|backer|profit(?! or financial| is promised)/i;

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  const news = mongoose.connection.db.collection("news");
  const oid = (s) => new mongoose.Types.ObjectId(s);

  for (const [id, doc] of Object.entries(REWRITE)) {
    const hit = (doc.heading + "\n" + doc.description).split("\n").filter((l) => BANNED.test(l));
    const old = await news.findOne({ _id: oid(id) }, { projection: { heading: 1 } });
    console.log(`${old ? "REWRITE" : "MISSING"} ${id}\n   was: ${old?.heading}\n   now: ${doc.heading}`);
    hit.forEach((l) => console.log(`   !! check wording: ${l.slice(0, 140)}`));
  }
  for (const id of DELETE_IDS) {
    const old = await news.findOne({ _id: oid(id) }, { projection: { heading: 1 } });
    console.log(`DELETE  ${id}  ${old?.heading ?? "(already gone)"}`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write.");
    return;
  }

  for (const [id, doc] of Object.entries(REWRITE)) {
    await news.updateOne(
      { _id: oid(id) },
      { $set: { heading: doc.heading, description: doc.description, translations: {}, updatedAt: new Date() } },
    );
  }
  const del = await news.deleteMany({ _id: { $in: DELETE_IDS.map(oid) } });
  console.log(`\nApplied. Rewrote ${Object.keys(REWRITE).length}, deleted ${del.deletedCount}.`);
}

main()
  .catch((err) => { console.error(err); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
