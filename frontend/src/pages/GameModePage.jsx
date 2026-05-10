import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ─── Data ────────────────────────────────────────────────── */
const MODES = {
  racing: {
    label: "RACING",
    rich: true,
    accent: "#22c55e",
    accentDim: "rgba(34,197,94,0.12)",
    glow: "rgba(34,197,94,0.3)",
    panelImg: "/racing3.png",
    heading: "Hyper Racing",
    subtitle: "The galaxy's most intense flying vehicle racing experience,\nwhere skill pays, and champions are made.",

    intro: [
      "Hyper Racing is a high-octane competitive racing game set across alien worlds, where players build, upgrade, and pilot fully customisable flying race vehicles through some of the most dangerous circuits in the galaxy. From floating rock formations and volcanic lava tubes to desert wastelands and mountain passes, every race is a test of preparation, reflexes, and strategy.",
      "But Hyper Racing is more than just a game; it is a competitive platform where real rewards are on the line. Top performers can enter ranked events and tournaments with real cash prize pools. The better you race, the more you earn. Whether you are chasing leaderboard glory or building a racing empire, everything you do in Hyper Racing moves you forward.",
      "Upgrade your race vehicles from nose to tail. Recruit and level up your pit crew. Hire a pit manager who matches your racing philosophy. Then take your skills beyond the track, your racing garage doubles as the hangar of your personal spaceship, and every ability you develop carries into space combat across Hyper Quest and Overlord of the 7 Realms.",
    ],
    introClose: "Read on to discover how the game works, what you can win, and how your racing career fuels an entire universe of progression.",

    howItWorks: [
      {
        num: "01",
        title: "Choose Your Vehicle",
        body: "Every race begins in your garage. Pick from a growing roster of flying race vehicles, each with unique handling characteristics and upgrade potential. Strip a hull down for blistering straight-line speed or armour it up to survive the most brutal conditions. Thrusters, stabilisers, shields, cooling systems, aerodynamic fins, the upgrade tree runs deep, and every modification changes how your craft behaves on the track.",
      },
      {
        num: "02",
        title: "Build Your Team",
        body: "Racing is a team sport. Recruit pit crew specialists who bring unique bonuses, faster refuelling, real-time diagnostics, emergency mid-race hull repairs, and between-lap performance tweaks. Each crew member levels up with experience, stacking powerful abilities on top of your vehicle upgrades. Then hire a pit manager to coordinate operations, call race strategy, and unlock team-wide performance boosts that compound over a full season.",
      },
      {
        num: "03",
        title: "Race Across Worlds",
        body: "Circuits span alien planets with wildly different terrain and atmospheric hazards. Weave through Avatar-style floating rock formations, thread volcanic lava tubes at breakneck speed, tear across endless desert plains, and carve through treacherous mountain ranges. Acid rain, radioactive atmospheres, shifting gravity, and turbulent winds, no two races demand the same setup. Tuning your vehicle to match each environment is where strategy meets skill.",
      },
      {
        num: "04",
        title: "Climb the Ranks",
        body: "Victory earns leader points, unlocks new circuits on distant worlds, and opens the door to higher-tier competitions. The deeper you go, the fiercer the opponents and the greater the stakes. Prove yourself across every planet and rise through the global rankings.",
      },
    ],

    rewards: [
      {
        title: "In-Game Rewards",
        body: "Every race you finish pays out. Win, and the rewards multiply. Race victories unlock premium vehicle components, rare upgrade materials, exclusive crew recruitment tokens, and credits to fund your next build. Sell upgraded vehicles for profit, reinvest in new machines, and watch your racing empire grow with every podium finish.",
      },
      {
        title: "Real Cash Events",
        body: "Hyper Racing takes competition to the next level with ranked events and tournaments where real money is on the line. Enter skill-based competitions, prove your ability against the best pilots in the galaxy, and walk away with real cash payouts. The higher you place, the bigger the prize pool. From weekly ranked challenges to seasonal championship events, there are always opportunities for top performers to turn their racing skills into real earnings.",
      },
      {
        title: "How Prize Events Work",
        body: "Players qualify through ranked play, meeting performance thresholds that grant entry to cash-prize tournaments. Events are structured around fair matchmaking, ensuring every competitor faces opponents of similar skill. Entry fees are transparent, prize pools are clearly displayed before you commit, and payouts are processed quickly after each event concludes. It is competitive, it is fair, and the rewards are real.",
      },
      {
        title: "Progression Beyond the Track",
        body: "Rewards earned through racing feed directly into your broader progression. Upgrade your race vehicles, strengthen your pit crew, and funnel winnings into upgrading your main spaceship. Your racing garage is the hangar bay of that ship, so every improvement to your racing operation also powers up the vessel you fly between worlds and into space combat across Hyper Quest and Overlord of the 7 Realms.",
      },
    ],

    upgrades: [
      {
        title: "Racing Vehicle Upgrades",
        body: "Your race vehicle is a fully modular machine. Every component can be swapped, tuned, and upgraded: hulls, thrusters, shields, outer shells, engines, stabilisers, cooling systems, and aerodynamic surfaces. Lightweight composites deliver raw speed; heavy-duty armour keeps you alive through brutal atmospheric conditions. The upgrade path is deep, and the choices you make define your racing identity. Buy new vehicles, build them into championship contenders, race them to victory, and sell them at a profit when you are ready for the next challenge.",
      },
      {
        title: "Main Spaceship Upgrades",
        body: "Your racing garage is not just a workshop; it is the hangar bay of your personal spaceship. The same resources, credits, and materials you earn on the track can be invested into upgrading your main vessel. Better engines for interplanetary travel, stronger weapons systems for space combat, improved navigation for discovering new racing worlds, and reinforced hulls for surviving hostile encounters during transit. Your spaceship is your home base, your transport, and your battleship, and racing makes it stronger.",
      },
      {
        title: "The Upgrade Loop",
        body: "Race to earn. Earn to upgrade. Upgrade to win bigger races with greater rewards. Funnel those rewards into both your racing vehicles and your spaceship. The better your ship, the further you travel and the more dangerous and lucrative the circuits become. It is a progression loop that rewards dedication and skill at every level.",
      },
      {
        title: "Cross-Game Impact",
        body: "Every pilot skill you develop on the track and every upgrade you install on your spaceship carries directly into Hyper Quest and Overlord of the 7 Realms. One universe, multiple games, seamless progression. What you build in Hyper Racing powers everything else.",
      },
    ],

    calloutLine1: "Race to Earn. Earn to Upgrade.",
    calloutLine2: "Upgrade to Dominate.",
    rewardsTitle: "Win Big; Rewards That Matter!",
    upgradesTitle: "Two Machines, One Mission... Upgrade Everything",
    faqTitle: "Hyper Racing — Frequently Asked Questions",

    faq: [
      { q: "What is Hyper Racing?", a: "A high-intensity flying vehicle racing game set across alien worlds. Build, upgrade, and race fully customisable vehicles through hazardous sci-fi circuits while competing for in-game rewards and real cash prizes." },
      { q: "Can I upgrade my race vehicle?", a: "Every component is upgradable: hulls, thrusters, shields, outer shells, engines, stabilisers, cooling systems, and aerodynamic surfaces. Each upgrade changes how your vehicle handles different tracks and conditions." },
      { q: "What does the pit crew do?", a: "Pit crew members provide unique bonuses: faster refuelling, hull diagnostics, emergency repairs, and performance tweaks between laps. They level up over time, unlocking stronger abilities that stack with vehicle upgrades." },
      { q: "How does the pit manager work?", a: "The pit manager coordinates crew operations, calls race strategy, and unlocks team-wide performance boosts. Defensive managers protect your vehicle in harsh conditions; aggressive managers push every system for maximum speed." },
      { q: "Can I win real money?", a: "Yes. Ranked events and tournaments feature real cash prize pools. Qualify through ranked play, compete against similarly skilled opponents, and earn real payouts based on your finishing position. Weekly challenges and seasonal championships run continuously." },
      { q: "How do race rewards work?", a: "Every race pays out credits, upgrade materials, and crew tokens. Victories multiply your earnings. Buy vehicles, upgrade them into racing machines, win races, and sell them at a profit to fund further enhancements and spaceship upgrades." },
      { q: "Can I upgrade my main spaceship too?", a: "Absolutely. Your racing garage is the hangar bay of your spaceship. Race winnings fund upgrades to engines, weapons, navigation, and hull reinforcement on your main vessel, powering up interplanetary travel and space combat." },
      { q: "Does progress carry to other games?", a: "Every pilot skill and spaceship upgrade transfers directly into Hyper Quest and Overlord of the 7 Realms. One universe, multiple games, seamless progression. What you build in Hyper Racing powers everything else." },
      { q: "What racing environments are there?", a: "Circuits span floating rock formations, lava tubes, desert plains, and mountain ranges across alien worlds. Atmospheric hazards include acid rain, radioactive atmospheres, variable gravity, and turbulent winds. Each circuit demands different vehicle setups." },
    ],
  },

  quest: {
    label: "QUEST",
    rich: true,
    accent: "#38bdf8",
    accentDim: "rgba(56,189,248,0.12)",
    glow: "rgba(56,189,248,0.25)",
    panelImg: "/quest1.png",
    heading: "Hyper Quest",
    subtitle: "Your galaxy. Your rules. Your fortune.",

    intro: [
      "Hyper Quest is an open-world space adventure where you command your own fully upgradable spaceship, the Quest Racer, across a vast and dangerous galaxy. You left your home civilisation years ago in search of power, wealth, and fame. Now the entire universe is your playground, and every quest you complete brings you closer to galactic dominance.",
      "But Hyper Quest is not just a game. It is a competitive platform where real cash is on the line. Complete quests, conquer challenges, and walk away with real money in your pocket and or rewards. From quick missions that take minutes to epic multi-day expeditions, every quest pays out. The harder the challenge, the bigger the reward.",
      "Upgrade your spaceship from hull to cockpit. Arm it with devastating weapons systems. Recruit specialists who stack powerful bonuses onto your ship's performance and power level. Mine asteroids, haul dangerous cargo, hunt hidden treasures, kidnap high-value targets, or become a hired gun. How you rule the univise is entirely your choice.",
      "Everything you build in Hyper Quest feeds directly into Hyper Racing and Overlord of the 7 Realms. One universe, seamless progression, unlimited potential. Read on to discover how questing works, what you can earn, and how you and your spaceship become the most feared vessel in the galaxy.",
    ],

    calloutLine1: "Quest to Earn. Earn to Upgrade.",
    calloutLine2: "Upgrade to Conquer.",

    howItWorks: [
      {
        num: "01",
        title: "Accept Quests From the Mission Board",
        body: "The in-game questing board is your gateway to adventure. Browse available missions ranging from quick cargo runs that take just minutes to epic multi-day expeditions deep into uncharted space. Each quest comes with clear objectives, danger ratings, and reward tiers. Pick the missions that match your playstyle, whether that is hauling dangerous cargo, hunting hidden treasures, mining asteroid fields, or going undercover to recover lost artefacts.",
      },
      {
        num: "02",
        title: "Explore the Galaxy",
        body: "Travel through portals to distant planets, each with unique environments, valuable materials, and new racing circuits. Follow galactic maps to chart unexplored regions and earn naming rights for planets you discover first. Mine resources from asteroid fields, salvage parts from ancient relics and abandoned ships, and gather clues that lead to hidden fortunes scattered across the stars.",
      },
      {
        num: "03",
        title: "Build Your Empire From Within Your Ship",
        body: "Your Quest Racer is more than transport. Grow food in hydroponic bays, refine materials mined from distant planets, and build armies from within your cloning labs. Refine your troops and their weapons, defend yourself against pirates, and manage a self-sustaining mobile base that grows more powerful with every mission you complete.",
      },
      {
        num: "04",
        title: "Play Your Way",
        body: "There is no single path to dominance. Become a feared bounty hunter, a cunning smuggler, a master miner, or a legendary explorer. Kidnap high-value targets, become a hired gun, or forge alliances to control entire sectors. The galaxy bends to your will, and every decision shapes your reputation and your fortune.",
      },
    ],

    rewards: [
      {
        title: "In-Game Rewards",
        body: "Every quest you complete pays out. Credits, upgrade materials, rare components, specialist recruitment tokens, and exclusive items flow into your inventory with every successful mission. The harder the quest, the richer the haul. Discover rare materials on distant planets, salvage high-value parts from ancient relics, and stockpile resources that fuel your rise to galactic supremacy.",
      },
      {
        title: "Real Cash Payments",
        body: "Hyper Quest takes gaming beyond entertainment. Certain quests and ranked challenges offer real cash payouts. Complete high-tier missions, dominate leaderboard events, and participate in seasonal quest championships where real money is on the line. The more skilled and daring you become, the bigger the payouts. From weekly quest bounties to epic seasonal tournaments, there are always opportunities to turn your galactic adventures into real earnings.",
      },
      {
        title: "How Quest Payouts Work",
        body: "Players qualify for cash-reward quests by building their reputation and meeting performance thresholds. Quest difficulty, duration, and danger level determine the prize pool. Payouts are transparent, clearly displayed before you accept any mission, and processed quickly upon completion. Whether you are running a ten-minute cargo haul or a week-long deep-space expedition, the rewards match the risk.",
      },
      {
        title: "Progression That Pays Forward",
        body: "Quest rewards feed directly into your ship upgrades, weapons systems, and specialist recruitment. Every payout makes you stronger, which unlocks harder quests with even greater rewards. Earnings also carry across into Hyper Racing and Overlord of the 7 Realms, creating a progression loop that rewards dedication across the entire Hyper Tek ecosystem.",
      },
    ],

    rewardsTitle: "Quest Rewards; Get Paid to Play!",

    upgradesTitle: "Upgrade Your Ship, Arm Your Arsenal, Recruit Your Crew",
    upgrades: [
      {
        title: "Spaceship Upgrades",
        body: "Your Quest Racer is fully modular from engine bay to cockpit. Upgrade the hull for maximum durability, reinforce the outer shell to withstand hostile environments, boost shield generators for combat survivability, and overhaul power systems for peak performance. Better engines mean faster interplanetary travel. Stronger navigation systems reveal hidden routes and uncharted worlds. Every upgrade transforms your ship into a more powerful, more feared vessel.",
      },
      {
        title: "Weapons Systems",
        body: "The galaxy is dangerous, and you need to be more dangerous. Upgrade and refine your weapons systems to protect yourself against pirates, rival players, and hostile forces. Choose between defensive configurations that keep you alive in the worst situations or offensive loadouts designed to inflict maximum damage. Laser arrays, missile batteries, plasma cannons, and experimental energy weapons are all available as you progress through the upgrade tree.",
      },
      {
        title: "Recruit Specialists",
        body: "Specialists are game-changers. Each one brings unique skills that add powerful bonuses to your ship's overall performance and power level. Navigation specialists reveal hidden paths and reduce travel time. Combat specialists boost weapon accuracy and damage output. Engineering specialists increase hull integrity and repair speed. Science specialists improve resource extraction and material refinement. Stack multiple specialists to create devastating combinations that multiply your ship's effectiveness.",
      },
      {
        title: "The Power Loop",
        body: "Quest to earn. Earn to upgrade. Upgrade to conquer harder quests with bigger rewards. Recruit specialists to amplify every system on your ship. The stronger you become, the more of the galaxy opens up, and the greater the fortune that awaits. Ship upgrades and specialist bonuses also carry directly into space combat during Hyper Racing transit and battles across Overlord of the 7 Realms.",
      },
    ],

    faqTitle: "Hyper Quest — Frequently Asked Questions",
    faq: [
      { q: "What is Hyper Quest?", a: "An open-world space adventure where you command a fully upgradable spaceship across a vast galaxy. Complete quests, explore alien worlds, upgrade your ship, recruit specialists, and earn real cash rewards alongside in-game riches." },
      { q: "How do quests work?", a: "Accept missions from the in-game questing board. Quests range from quick cargo runs taking just minutes to epic multi-day expeditions deep into uncharted space. Each quest has clear objectives, danger ratings, and reward tiers displayed before you accept." },
      { q: "Can I earn real cash?", a: "Yes. Certain quests, ranked challenges, and seasonal championships offer real cash payouts. Build your reputation, meet performance thresholds, and qualify for increasingly lucrative cash-reward missions. Weekly bounties and seasonal tournaments run continuously." },
      { q: "What in-game rewards can I earn?", a: "Every completed quest pays out credits, upgrade materials, rare components, specialist recruitment tokens, and exclusive items. The harder and longer the quest, the richer the rewards. Discover rare materials on distant planets and salvage high-value parts from ancient relics." },
      { q: "Can I upgrade my spaceship?", a: "Every system is upgradable: hull, outer shell, shield generators, power systems, engines, cockpit, and navigation. Better engines mean faster travel, stronger hulls survive hostile encounters, and upgraded navigation reveals hidden routes and uncharted worlds." },
      { q: "What weapons are available?", a: "Upgrade and refine weapons systems including laser arrays, missile batteries, plasma cannons, and experimental energy weapons. Choose defensive configurations for survival or offensive loadouts for maximum damage against pirates, rivals, and hostile forces." },
      { q: "How do specialists work?", a: "Recruit specialists with unique skills that add powerful bonuses to your ship's performance and power level. Navigation specialists reveal hidden paths, combat specialists boost weapon damage, engineering specialists increase hull integrity, and science specialists improve resource extraction. Stack multiple specialists for devastating combinations." },
      { q: "What types of quests are available?", a: "Cargo transport, asteroid mining, treasure hunting, bounty hunting, artefact recovery, undercover operations, planetary exploration, pirate defence, salvage missions, and more. Quests range from quick ten-minute runs to multi-day deep-space expeditions." },
      { q: "Can I discover new planets?", a: "Yes. Follow galactic maps into uncharted regions and discover new worlds. First discoverers earn naming rights for the planets they find. New worlds offer unique materials, environments, and racing circuits that no other player has accessed before." },
      { q: "What can I do inside my ship?", a: "Your Quest Racer is a mobile base. Grow food in hydroponic bays, refine materials mined from distant planets, build and train armies in cloning labs, upgrade weapons and defences, and manage a self-sustaining operation that grows more powerful with every mission." },
      { q: "How does the galactic map work?", a: "The galactic map guides your exploration across the universe. Upgrade your map to reveal new sectors, portal locations, and hidden quest zones. As you explore further, the map expands, unlocking increasingly dangerous and rewarding regions of space." },
      { q: "Does my progress carry to other games?", a: "Everything you build in Hyper Quest feeds directly into Hyper Racing and Overlord of the 7 Realms. Ship upgrades, specialist bonuses, combat skills, and resources all transfer seamlessly. One universe, multiple games, unlimited progression." },
      { q: "Can I play as a villain?", a: "Absolutely. Go undercover, kidnap high-value targets, become a hired gun, smuggle dangerous cargo, or raid other players. There is no single path to dominance. How you rule the galaxy is entirely your choice, and every decision shapes your reputation." },
    ],
  },

  overlord: {
    label: "OVERLORD",
    rich: true,
    upgradesBeforeRewards: true,
    accent: "#f87171",
    accentDim: "rgba(248,113,113,0.12)",
    glow: "rgba(248,113,113,0.25)",
    panelImg: "/overlord4.png",
    heading: "Overlord of the 7 Realms",
    subtitle: "Crash-land. Rebuild. Conquer. Become the Overlord.",

    intro: [
      "Overlord of the 7 Realms is a tri-level battle strategy game unlike anything else in gaming. You ventured through a portal into a parallel universe and crash-landed on a hostile alien planet. Your ship is wrecked, your systems are failing, and the planet's creatures are already closing in. Survival is just the beginning. Dominance is the goal.",
      "Rebuild your ship from the wreckage up. Clone and train armies in your onboard labs. Tame the planet's wildlife to create devastating mounted cavalry. Then take the fight across three battle dimensions: ground-to-ground combat against monsters and rival players, ground-to-space assaults on orbital or ground targets, and space-to-space warfare aboard the massive Battle Ring that orbits the planet.",
      "This is not just another strategy game. Overlord features real-time VR interaction, real cash rewards for completing daily events and quests, and fortnightly invasions by the fearsome Hammerongs, the most powerful alien species in existence. Every fortnight, they arrive to strip-mine the planet, and every fortnight, brave players can challenge them for massive bonuses and legendary rewards.",
      "Upgrade your spaceship, arm it with devastating weapons, recruit specialists who amplify your power level, and forge alliances to control entire regions. Everything you build connects directly to Hyper Racing and Hyper Quest through the shared Hyper Tek ecosystem. One universe, three games, unlimited warfare. Read on to discover how the battle system works and why Overlord changes everything.",
    ],

    calloutLine1: "Survival is Just the Beginning.",
    calloutLine2: "Dominance is the Goal.",

    howItWorksTitle: "The Tri-Level Battle System; Three Dimensions of War",
    howItWorks: [
      {
        num: "01",
        title: "Ground-to-Ground Combat",
        body: "The planet's surface is a warzone. Deploy your cloned armies against hostile alien creatures, monstrous beasts, and rival players fighting for territory and resources. Tame and train the planet's wildlife to create mounted cavalry units that give your ground forces a devastating edge. Ground warfare is raw, tactical, and relentless. Every battle you win earns resources, territory, and reputation.",
      },
      {
        num: "02",
        title: "Ground-to-Space Assaults",
        body: "This is where Overlord adds a dimension that no, or almost no, other game offers. Create specialised troop groups designed to launch attacks between the planet's surface and the orbital Battle Ring. Strike at ships stationed in space from your ground position or coordinate combined assaults that hit enemies from above and below simultaneously. This vertical battle layer transforms standard strategy into a multi-dimensional chess match where positioning across both ground and space determines victory.",
      },
      {
        num: "03",
        title: "Space-to-Space Warfare",
        body: "Port your ship into orbit and land on the Battle Ring, a massive orbital structure circling the planet. From here, hunt for unshielded ships and vulnerable targets. Teleport troops through space and directly into enemy vessels to inflict maximum internal damage using specially developed boarding attacks. Space combat rewards are among the highest in the game, and controlling orbital territory gives you a strategic advantage that no ground-only player can match.",
      },
      {
        num: "04",
        title: "Why Tri-Level Changes Everything",
        body: "Most strategy games operate on a single plane. Overlord operates on three. The ability to attack from ground to ground, ground to space, and space to space creates a battlefield with unmatched tactical depth. Skill is everything. Brute force alone will not make you the Overlord. Strategic mastery across all three levels is what separates the dominant from the defeated.",
      },
    ],

    extraSection: {
      title: "The Battle Ring and VR Interaction",
      items: [
        {
          title: "Landing on the Battle Ring",
          body: "The Battle Ring is a colossal orbital structure that circles the planet's system. When you port your ship into space, you can dock on the Battle Ring to gain a massive strategic advantage. From this elevated position, you can hunt for unshielded ships, launch boarding parties into rival vessels, and coordinate devastating attacks on ground targets below. Landing on the Battle Ring opens an entirely new dimension of gameplay that most strategy games simply do not offer, giving Overlord a tactical edge over anything else on the market.",
        },
        {
          title: "Inside the Battle Ring",
          body: "The Battle Ring is not just a docking platform. If you can work out how to breach its interior, hidden quests, extra bonuses, and exclusive rewards await inside. The ring's interior is a labyrinth of corridors, chambers, and ancient technology. Carry out quests and hunting missions within the ring itself, discovering secrets that no surface-bound player will ever access. The Battle Ring rewards the bold, the cunning, and the relentless.",
        },
        {
          title: "Real-Time VR Interaction",
          body: "Like all of the Hyper Tek range of games, Overlord of the 7 Realms supports full VR interaction in real time. Step inside your ship, walk the corridors of the Battle Ring, lead your troops into ground combat, and experience space warfare from the cockpit of your vessel. VR transforms Overlord from a strategy game into a fully immersive battlefield experience. Command your forces, explore alien terrain, and engage in combat with a level of presence and intensity that flat-screen gaming cannot replicate.",
        },
        {
          title: "The Advantage Over Other Games",
          body: "No other game combines tri-level warfare, an explorable orbital battle station, real-time VR, and real cash and or in-game rewards in a single experience. The Battle Ring alone adds a gameplay dimension that competitors cannot match. When you combine that with ground combat, space warfare, VR immersion, and the interconnected Hyper Tek ecosystem, Overlord stands in a category of its own.",
        },
      ],
    },

    upgradesTitle: "Rebuild, Rearm, Recruit; Power Up for War",
    upgrades: [
      {
        title: "Spaceship Upgrades",
        body: "Your crashed ship is where it all begins. Rebuild it system by system, from the engine bay to the command deck. Every component is fully upgradable: hull reinforcement, structural integrity, outer shell composition, shield generators, power systems, and navigation arrays. In Overlord, you build not for speed but for battle. A fully upgraded warship is the foundation of every successful campaign, and the deeper you invest, the more formidable your vessel becomes.",
      },
      {
        title: "Weapons Systems and Tech Levels",
        body: "Upgrade and refine your weapons, skills and tech levels to dominate across all three battle levels. Ground-based artillery for planetary warfare, anti-orbital batteries for ground-to-space assaults, and ship-mounted weapons arrays for space-to-space combat. Each weapons system can be refined for specific tactical roles. Whether you specialise in long-range bombardment, close-quarters boarding actions, or defensive countermeasures, your weapons loadout defines your combat identity.",
      },
      {
        title: "Recruit Specialists",
        body: "Specialists are the force multipliers that separate good players from Overlords. Acquire unique specialists who bring powerful bonuses to your ship's overall performance and power level. Tactical specialists improve troop deployment efficiency, engineering specialists accelerate ship repairs and upgrades, weapons specialists increase damage output across all systems, and intelligence specialists reveal enemy positions and weaknesses. Stack multiple specialists to create devastating synergies that amplify every aspect of your operation.",
      },
      {
        title: "Build Your Armies",
        body: "Clone troops within your ship's onboard cloning labs, then upgrade and refine them and their weapons until they are battle-ready. But troops alone are not enough. Tame and train the planet's wild creatures to create mounted beast cavalry, a force that cannot be cloned or manufactured and must be earned through skill and patience. Your army composition across ground, air, and space is what determines your dominance.",
      },
    ],

    rewardsTitle: "The Hammerongs, rewards, and the Hyper Tek Ecosystem",
    rewards: [
      {
        title: "The Hammerongs: The Most Powerful Species in Existence",
        body: "Every two weeks, the centre arena's force fields drop, and the Hammerongs arrive. They are the strongest alien species in the universe, armed with advanced technology far beyond anything players possess. They come to strip-mine the planet's resources, and they defend the arena with full, overwhelming force. Attacking the Hammerongs is the most dangerous challenge in Overlord, but those who succeed are rewarded with huge bonuses, legendary loot, rare upgrade materials, and exclusive rewards that cannot be obtained any other way. The fortnightly Hammerong invasion is the ultimate test of your power.",
      },
      {
        title: "Daily Events, Quests, and Battle Rewards",
        body: "Overlord delivers rewards constantly. Complete daily tasks to earn credits, upgrade materials, and progression bonuses. Enter special events for premium rewards. Carry out quests across the planet's surface and within the Battle Ring for exclusive loot. Win battles against monsters, alien creatures, and rival players to stockpile resources. Explore the surface to discover hidden artefacts and treasures. The reward structure is designed so that every action you take moves you closer to becoming the ultimate Overlord of the server.",
      },
      {
        title: "Connected to the Hyper Tek Ecosystem",
        body: "Overlord of the 7 Realms does not exist in isolation. It is fully integrated into the Hyper Tek universe alongside Hyper Racing and Hyper Quest. Resources earned in Overlord can be used across all three games. Ship upgrades, specialist bonuses, combat skills, and materials flow seamlessly between titles. Racing abilities gained in Hyper Racing improve your pilot skills in Overlord space combat. Materials gathered in Hyper Quest fuel your upgrades on the planet. The Hyper Tek marketplace connects everything, creating a unified economy where progress in one game powers advancement in all three.",
      },
      {
        title: "One Universe, Three Games, Unlimited Power",
        body: "Players who engage across all three Hyper Tek games build power faster, access exclusive cross-game rewards, and dominate through a breadth of skills and resources that single-game players cannot match. The interconnected ecosystem is the ultimate competitive advantage.",
      },
    ],

    faqTitle: "Overlord of the 7 Realms — Frequently Asked Questions",
    faq: [
      { q: "What is Overlord of the 7 Realms?", a: "A tri-level battle strategy game where you crash-land on an alien planet, rebuild your ship, clone armies, and fight across three dimensions: ground-to-ground, ground-to-space, and space-to-space. Features VR interaction, real cash rewards, and fortnightly Hammerong invasions." },
      { q: "What is the tri-level battle system?", a: "Combat operates across three levels: ground-to-ground against monsters and rival players, ground-to-space assaults targeting orbital ships, and space-to-space warfare on the Battle Ring. This multi-dimensional approach creates tactical depth no single-plane strategy game can match." },
      { q: "What is the Battle Ring?", a: "A massive orbital structure circling the planet. Land your ship on it to hunt unshielded targets, launch boarding parties into enemy vessels, and access hidden quests inside its interior. Controlling the Battle Ring gives you a strategic advantage over ground-only players." },
      { q: "Can I upgrade my spaceship?", a: "Every system is upgradable from engine bay to command deck: hull, structure, outer shell, shield generators, power systems, and navigation. In Overlord you build for battle, not speed. A fully upgraded warship is the foundation of every campaign." },
      { q: "How do specialists work?", a: "Recruit unique specialists who add powerful bonuses to your ship's performance and power level. Tactical, engineering, weapons, and intelligence specialists each boost different systems. Stack multiple specialists for devastating synergies across all battle levels." },
      { q: "Who are the Hammeroungs?", a: "The most powerful alien species in existence. Every fortnight they arrive at the centre arena to strip-mine the planet's resources, defended by overwhelming force and advanced technology. Attacking them is extremely dangerous but rewards players with huge bonuses and legendary loot." },
      { q: "What rewards can I earn?", a: "Daily tasks, quests, battles, and events all pay out credits, upgrade materials, and progression bonuses. Special events and Hammerong invasions offer premium and exclusive rewards. Higher-difficulty challenges and ranked competitions yield greater payouts including real cash." },
      { q: "Does Overlord support VR?", a: "Yes. Full real-time VR interaction lets you walk your ship's corridors, explore the Battle Ring interior, lead troops into ground combat, and pilot your vessel in space warfare. VR transforms Overlord from strategy into a fully immersive battlefield experience." },
      { q: "How do I build my army?", a: "Clone troops in your ship's onboard labs, then upgrade and refine them and their weapons. For mounted cavalry, you must tame and train the planet's wild creatures, as animals cannot be cloned. Army composition across ground, air, and space determines your dominance." },
      { q: "Can I join an alliance?", a: "Yes. Go it alone or join an alliance that increases your power and helps you grow. Alliances offer shared resources, coordinated attacks, and collective defence. Complete daily tasks to upgrade both your ship and the alliance's shared assets." },
      { q: "Is Overlord linked to other Hyper Tek games?", a: "Fully integrated. Resources, ship upgrades, specialist bonuses, and combat skills flow between Overlord, Hyper Racing, and Hyper Quest. Racing abilities improve your space combat, Quest materials fuel your upgrades, and the Hyper Tek marketplace connects the entire economy." },
      { q: "What weapons are available?", a: "Ground-based artillery, anti-orbital batteries, ship-mounted weapons arrays, and specialised boarding-action equipment. Each system can be refined for specific tactical roles including long-range bombardment, close-quarters combat, and defensive countermeasures." },
      { q: "Can I explore the planet's surface?", a: "Yes. The planet is rich with hidden rewards, artefacts, resources, and dangerous wildlife to tame. Explore the surface to find treasures, battle alien creatures and monsters, and discover strategic advantages that strengthen your campaign for Overlord dominance." },
    ],
  },
};

/* ─── Framer variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── FAQ accordion item ──────────────────────────────────── */
function FaqItem({ item, accent, accentDim, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp} custom={index * 0.5} initial="hidden"
      whileInView="visible" viewport={{ once: true, amount: 0.2 }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        style={{ borderBottom: `1px solid rgba(255,255,255,${open ? "0.12" : "0.06"})` }}
      >
        <span
          className="text-[15px] font-semibold transition-colors duration-200"
          style={{ color: open ? accent : "rgba(255,255,255,0.85)" }}
        >
          {item.q}
        </span>
        <span
          className="shrink-0 w-6 h-6 flex items-center justify-center border text-[13px] transition-all duration-300"
          style={{
            borderColor: open ? accent : "rgba(255,255,255,0.2)",
            color: open ? accent : "rgba(255,255,255,0.4)",
            background: open ? accentDim : "transparent",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-500"
        style={{ maxHeight: open ? "400px" : "0px" }}
      >
        <p className="py-5 text-white/60 text-[14px] leading-[1.85]">{item.a}</p>
      </div>
    </motion.div>
  );
}

/* ─── Rich detail page (Racing & Quest) ──────────────────── */
function DetailPage({ data }) {
  const { accent, glow, accentDim } = data;

  return (
    <div className="flex flex-col">

      {/* ═══ SECTION 1 — Welcome / Intro ════════════════════════ */}
      <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-36 pb-24">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" className="mb-2">
          <span
            className="text-[11px] tracking-[0.35em] uppercase font-bold"
            style={{ color: accent, fontFamily: "Orbitron, sans-serif" }}
          >
            Welcome to
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp} custom={0.5} initial="hidden" animate="visible"
          className="font-goldman uppercase text-5xl md:text-6xl xl:text-[72px] leading-[1.05] mb-8"
          style={{ textShadow: `0 0 80px ${glow}, 0 2px 12px rgba(0,0,0,0.95)` }}
        >
          {data.heading}
        </motion.h1>

        <motion.p
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
          className="text-[18px] md:text-[20px] italic leading-snug mb-12"
          style={{ color: accent, textShadow: `0 0 16px ${accent}66`, maxWidth: 620 }}
        >
          {data.subtitle}
        </motion.p>

        <div className="flex flex-col gap-7">
          {data.intro.map((para, i) => (
            <motion.p
              key={i}
              variants={fadeUp} custom={i + 2} initial="hidden" animate="visible"
              className="text-white/70 text-[16px] leading-[1.95]"
            >
              {para}
            </motion.p>
          ))}

          {data.introClose && (
            <motion.p
              variants={fadeUp} custom={data.intro.length + 2} initial="hidden" animate="visible"
              className="text-white/40 text-[15px] italic pt-2"
            >
              {data.introClose}
            </motion.p>
          )}
        </div>
      </section>

      {/* ═══ SECTION 2 — How It Works ═══════════════════════════ */}
      <section
        className="relative py-24"
        style={{ background: "rgba(6,6,20,0.6)", borderTop: `1px solid rgba(255,255,255,0.05)`, borderBottom: `1px solid rgba(255,255,255,0.05)` }}
      >
        <div className="absolute right-0 top-0 select-none pointer-events-none font-goldman leading-none"
          style={{ fontSize: "clamp(140px, 20vw, 260px)", color: "rgba(255,255,255,0.02)", lineHeight: 1 }}>
          HOW
        </div>
        <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.howItWorksTitle || `How ${data.heading} Works`}
            </h2>
          </motion.div>
          <div className="flex flex-col gap-0">
            {data.howItWorks.map((item, i) => (
              <motion.div key={item.num} variants={fadeUp} custom={i * 0.8} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="relative flex gap-8 md:gap-14 pb-16 last:pb-0">
                <div className="flex flex-col items-center shrink-0">
                  <div className="font-goldman text-[13px] w-12 h-12 flex items-center justify-center shrink-0"
                    style={{ border: `1px solid ${accent}`, color: accent, background: accentDim, boxShadow: `0 0 20px ${accentDim}` }}>
                    {item.num}
                  </div>
                  {i < data.howItWorks.length - 1 && (
                    <div className="flex-1 w-px mt-3"
                      style={{ background: `linear-gradient(to bottom, ${accent}44, transparent)` }} />
                  )}
                </div>
                <div className="pt-2 pb-2">
                  <h3 className="font-goldman uppercase text-xl md:text-2xl tracking-wide mb-4"
                    style={{ color: "rgba(255,255,255,0.95)" }}>{item.title}</h3>
                  <p className="text-white/62 text-[15px] leading-[1.9]">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EXTRA SECTION (optional — e.g. Battle Ring for Overlord) ══ */}
      {data.extraSection && (
        <section className="relative py-24 overflow-hidden"
          style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <div className="absolute left-0 bottom-0 select-none pointer-events-none font-goldman leading-none"
            style={{ fontSize: "clamp(120px, 16vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>
            RING
          </div>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
                {data.extraSection.title}
              </h2>
            </motion.div>
            <div className="flex flex-col gap-0">
              {data.extraSection.items.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i * 0.7} initial="hidden"
                  whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                  className="group py-10 border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-6 md:gap-10">
                    <span className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none"
                      style={{ color: `${accent}70`, textShadow: `0 0 20px ${accent}44`, fontVariantNumeric: "tabular-nums" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4"
                        style={{ color: "rgba(255,255,255,0.92)" }}>{item.title}</h3>
                      <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CALLOUT BANNER ════════════════════════════════════ */}
      <div className="relative overflow-hidden py-16 md:py-20"
        style={{ background: `linear-gradient(to right, rgba(6,6,20,0.95), ${accentDim} 50%, rgba(6,6,20,0.95))`,
          borderTop: `1px solid ${accent}22`, borderBottom: `1px solid ${accent}22` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${accentDim} 0%, transparent 70%)` }} />
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}88, transparent)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}88, transparent)` }} />
        <div className="relative text-center px-6">
          <motion.p variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.5 }}
            className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide"
            style={{ color: accent, textShadow: `0 0 40px ${accent}` }}>
            {data.calloutLine1}
          </motion.p>
          <motion.p variants={fadeUp} custom={0.3} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.5 }}
            className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide mt-1"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: `0 0 30px ${glow}` }}>
            {data.calloutLine2}
          </motion.p>
        </div>
      </div>

      {/* ═══ UPGRADES — first for Overlord ═════════════════════ */}
      {data.upgradesBeforeRewards && (
        <section
          className="relative py-24 overflow-hidden"
          style={{ background: "rgba(6,6,20,0.55)", borderBottom: `1px solid rgba(255,255,255,0.05)` }}
        >
          <div className="absolute right-0 bottom-0 select-none pointer-events-none font-goldman leading-none"
            style={{ fontSize: "clamp(100px, 15vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>UP</div>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
                {data.upgradesTitle}
              </h2>
            </motion.div>
            <div className="flex flex-col gap-0">
              {data.upgrades.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i * 0.7} initial="hidden"
                  whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                  className="group py-10 border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-6 md:gap-10">
                    <span className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none"
                      style={{ color: `${accent}70`, fontVariantNumeric: "tabular-nums", textShadow: `0 0 20px ${accent}44` }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4"
                        style={{ color: "rgba(255,255,255,0.92)" }}>{item.title}</h3>
                      <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ REWARDS ════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <div className="absolute left-0 top-0 select-none pointer-events-none font-goldman leading-none"
          style={{ fontSize: "clamp(100px, 15vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>WIN</div>
        <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.rewardsTitle}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.rewards.map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i * 0.5} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="p-8 flex flex-col gap-4"
                style={{ background: "rgba(6,6,20,0.7)", border: `1px solid rgba(255,255,255,0.06)`, borderTop: `2px solid ${accent}` }}>
                <h3 className="font-goldman uppercase text-base md:text-lg tracking-wide"
                  style={{ color: accent }}>{item.title}</h3>
                <p className="text-white/60 text-[14px] leading-[1.9]">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ UPGRADES — after rewards for Racing/Quest ══════════ */}
      {!data.upgradesBeforeRewards && (
        <section
          className="relative py-24 overflow-hidden"
          style={{ background: "rgba(6,6,20,0.55)", borderBottom: `1px solid rgba(255,255,255,0.05)` }}
        >
          <div className="absolute right-0 bottom-0 select-none pointer-events-none font-goldman leading-none"
            style={{ fontSize: "clamp(100px, 15vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>UP</div>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
                {data.upgradesTitle}
              </h2>
            </motion.div>
            <div className="flex flex-col gap-0">
              {data.upgrades.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i * 0.7} initial="hidden"
                  whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                  className="group py-10 border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-6 md:gap-10">
                    <span className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none"
                      style={{ color: `${accent}70`, fontVariantNumeric: "tabular-nums", textShadow: `0 0 20px ${accent}44` }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4"
                        style={{ color: "rgba(255,255,255,0.92)" }}>{item.title}</h3>
                      <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FAQ ACCORDION ══════════════════════════════════════ */}
      <section className="py-24">
        <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-14">
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.faqTitle}
            </h2>
          </motion.div>
          <div>
            {data.faq.map((item, i) => (
              <FaqItem key={item.q} item={item} accent={accent} accentDim={accentDim} index={i} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

/* ─── Simple page (Quest / Overlord) ─────────────────────── */
function SimplePage({ data }) {
  const { accent } = data;
  return (
    <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pb-24 flex flex-col gap-6 text-center items-center">
      <p className="text-white/80 text-[17px] leading-[1.9] max-w-[620px]">{data.description}</p>
      <div className="w-full flex flex-col gap-5 mt-8 text-left">
        {data.sections.map((s) => (
          <div
            key={s.title}
            className="p-7"
            style={{
              background: "rgba(6,6,16,0.65)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: `3px solid ${accent}`,
            }}
          >
            <h2 className="font-goldman uppercase text-xl tracking-wide mb-2" style={{ color: accent }}>{s.title}</h2>
            <p className="text-white/60 text-[16px] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────── */
export default function GameModePage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const data = MODES[mode?.toLowerCase()] || MODES.racing;

  return (
    <div className="relative text-white min-h-screen" style={{ background: "#060614" }}>

      {/* ── Fixed background image (no attachment:fixed glitch) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${data.panelImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* dark base */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(6,6,20,0.78)" }}
        />
        {/* accent tint */}
        <div
          className="absolute inset-0"
          style={{ background: data.glow, mixBlendMode: "screen" }}
        />
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(6,6,20,0.7) 100%)" }}
        />
      </div>

      {/* Top accent line */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${data.accent}, transparent)`,
          boxShadow: `0 0 24px ${data.accent}`,
          zIndex: 100,
        }}
      />

      {/* ── Fixed back / mode bar — always visible below navbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed left-0 right-0 z-40"
        style={{ top: "var(--navbar-h, 72px)" }}
      >
        <div style={{
          background: `linear-gradient(to right, rgba(6,6,20,0.55), ${data.accentDim} 50%, rgba(6,6,20,0.55))`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${data.accent}22`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        }}>
          {/* accent line at bottom of bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{ background: `linear-gradient(to right, transparent, ${data.accent}55, transparent)` }} />

          <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 py-[14px] flex items-center gap-4">
            {/* Back button — clearly visible */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase transition-all duration-200 group"
              style={{
                fontFamily: "Orbitron, sans-serif",
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "6px 14px 6px 10px",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <div className="w-px h-4 bg-white/15" />

            {/* Mode tag */}
            <div
              className="text-[11px] font-bold tracking-[0.3em] uppercase px-4 py-[5px]"
              style={{
                fontFamily: "Orbitron, sans-serif",
                border: `1px solid ${data.accent}55`,
                borderTop: `2px solid ${data.accent}`,
                color: data.accent,
                background: data.accentDim,
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                textShadow: `0 0 12px ${data.accent}88`,
              }}
            >
              {data.label} MODE
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Scrollable content */}
      <div className="relative z-10">

        {/* ── Page content */}
        {data.rich
          ? <DetailPage data={data} />
          : (
            <>
              {/* Simple mode header */}
              <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-36 pb-20 flex flex-col gap-5">
                <motion.h1
                  initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-goldman uppercase text-4xl md:text-5xl xl:text-[58px] leading-tight"
                  style={{ textShadow: `0 0 70px ${data.glow}` }}
                >
                  {data.heading}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="uppercase tracking-[0.18em] text-[14px]"
                  style={{ color: data.accent, fontFamily: "Orbitron, sans-serif", textShadow: `0 0 12px ${data.accent}` }}
                >
                  {data.subtitle}
                </motion.p>
              </div>
              <SimplePage data={data} />
            </>
          )
        }
      </div>
    </div>
  );
}
