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
    accent: "#f87171",
    accentDim: "rgba(248,113,113,0.12)",
    glow: "rgba(248,113,113,0.25)",
    panelImg: "/overlord4.png",
    heading: "Overlord of the 7 Realms",
    subtitle: "Rise. Command. Dominate.",

    intro: [
      "Overlord of the 7 Realms is a grand strategy game set across a vast and fractured universe, where you rise as a reborn Overlord with one goal: absolute dominance. Command armies, forge alliances, crush your rivals, and seize control of the Echo Core — the most powerful force in all of existence.",
      "But Overlord is more than a war game. It is a living political battlefield where every decision carries consequence. Build your empire from the ground up, manage resources across multiple realms, and outmanoeuvre opponents who are just as hungry for power as you are. The galaxy bows to strategy, not just strength.",
      "Every skill you developed in Hyper Racing and every upgrade you earned in Hyper Quest feeds directly into your power as an Overlord. Your spaceship, your combat skills, your specialist team — all of it carries forward. One universe, seamless progression. What you built across the other games becomes your foundation for galactic rule.",
      "Read on to discover how the realms work, what you can conquer, and how you build the most feared empire in the galaxy.",
    ],

    calloutLine1: "Rise to Power. Command the Realms.",
    calloutLine2: "Dominate the Echo Core.",

    howItWorks: [
      {
        num: "01",
        title: "Claim Your Realm",
        body: "Every Overlord begins with a single realm. Establish your base of power, secure your borders, and begin expanding outward into the 7 Realms. Each realm offers unique resources, strategic advantages, and hostile forces that must be subdued. The realm you claim first shapes the identity of your empire and the strategies available to you throughout the game.",
      },
      {
        num: "02",
        title: "Build and Command Your Armies",
        body: "Raise armies from within your cloning labs and command them across multiple fronts. Recruit elite units, assign commanders with unique tactical abilities, and deploy forces strategically across the realms. Every battle is a test of preparation and decision-making. Outflank enemies, defend your territories, and crush opposition before they can organise against you.",
      },
      {
        num: "03",
        title: "Forge Alliances and Betray Them",
        body: "Politics is as powerful as any army. Negotiate treaties with rival Overlords, form temporary alliances to take down common threats, then strike when the moment is right. Every alliance is an opportunity, and every betrayal reshapes the balance of power across the 7 Realms. How you navigate loyalty and deception determines whether you rise or fall.",
      },
      {
        num: "04",
        title: "Seize the Echo Core",
        body: "The Echo Core is the ultimate prize — a source of power that grants its controller dominance over all 7 Realms. Reaching it requires defeating the most powerful Overlords in the galaxy, surviving waves of hostile forces, and surviving the politics of the final power struggle. Only the most prepared, most ruthless, and most strategic commander will claim it.",
      },
    ],

    rewards: [
      {
        title: "In-Game Rewards",
        body: "Every battle won, every realm captured, and every alliance forged generates resources, rare materials, and power credits. Victories unlock elite unit blueprints, advanced weapons systems, and exclusive commander abilities. The deeper you push into the 7 Realms, the richer the spoils and the more formidable your empire becomes.",
      },
      {
        title: "Real Cash Events",
        body: "Overlord of the 7 Realms hosts seasonal conquest events and ranked war campaigns where real money is on the line. Dominate leaderboard rankings, lead your alliance to victory in inter-realm wars, and earn real cash payouts based on your empire's performance. The most powerful Overlords earn the greatest rewards.",
      },
      {
        title: "How Conquest Events Work",
        body: "Conquest events run on seasonal cycles. Players qualify through ranked play, build their empires to meet entry thresholds, and compete in structured war campaigns against opponents of comparable strength. Event outcomes are determined by territory controlled, armies deployed, and objectives completed. Prize pools are displayed before the season begins, and payouts are processed at season end.",
      },
      {
        title: "Cross-Game Progression",
        body: "Every resource you earn in Overlord feeds back into your Hyper Racing and Hyper Quest operations. Your spaceship upgrades carry directly into combat, your racing skills influence commander movement speed, and your Quest specialists add powerful bonuses to your army. One ecosystem, complete progression. Everything you build powers everything else.",
      },
    ],

    rewardsTitle: "Conquer and Earn — Rewards of the 7 Realms",

    upgradesTitle: "Build Your Empire, Arm Your Forces, Expand Your Power",
    upgrades: [
      {
        title: "Empire Infrastructure",
        body: "Your empire is only as strong as its foundations. Build and upgrade command centres, resource extraction facilities, weapons forges, cloning labs, and defensive fortifications across every realm you control. Better infrastructure produces stronger armies faster, generates more resources per cycle, and makes your territories significantly harder to invade. The empire you build defines the war you can fight.",
      },
      {
        title: "Army and Weapons Upgrades",
        body: "Every unit in your army can be upgraded with better armour, weapons systems, and combat enhancements. Advance through the weapons tree to unlock plasma artillery, energy shields, orbital strike capabilities, and experimental warfare technology. The further you progress through the 7 Realms, the more devastating the arsenal you can deploy against enemies who stand in your way.",
      },
      {
        title: "Commander Abilities",
        body: "Commanders are the backbone of your military strategy. Each commander brings unique abilities — tactical retreats, ambush formations, siege expertise, or rapid redeployment. Level up your commanders through battle, unlock advanced abilities, and assign them to the fronts where their strengths matter most. A well-placed commander can turn a losing battle into a decisive victory.",
      },
      {
        title: "The Domination Loop",
        body: "Conquer to earn. Earn to upgrade. Upgrade to field stronger armies and seize harder targets with richer rewards. Every realm you capture expands your resource base, every victory funds your next campaign, and every upgrade compounds your military advantage. The stronger your empire grows, the faster the remaining realms fall before you.",
      },
    ],

    faqTitle: "Overlord of the 7 Realms — Frequently Asked Questions",
    faq: [
      { q: "What is Overlord of the 7 Realms?", a: "A grand strategy game set across a fractured galaxy where you rise as a reborn Overlord, command armies, forge alliances, and fight to seize control of the Echo Core and dominate all 7 Realms." },
      { q: "How do I start building my empire?", a: "You begin by claiming your first realm, establishing your command centre, and expanding your infrastructure. Early decisions about resource management and territorial expansion set the foundation for your entire campaign." },
      { q: "Can I play cooperatively with others?", a: "Yes. You can forge alliances with other Overlords, share resources, coordinate military campaigns, and compete together in inter-realm war events. Alliances are powerful — though knowing when to break them is equally important." },
      { q: "Can I earn real money?", a: "Yes. Seasonal conquest events and ranked war campaigns offer real cash prize pools. Qualify through ranked play, dominate leaderboard standings, and earn payouts based on your empire's performance across the season." },
      { q: "How do armies work?", a: "Build and upgrade units in your cloning labs, assign commanders with unique abilities, and deploy forces across multiple realms simultaneously. Every unit type has strengths and weaknesses, and matching your army composition to the terrain and enemy forces is key to victory." },
      { q: "What is the Echo Core?", a: "The Echo Core is the ultimate objective — a source of power at the centre of the 7 Realms that grants its controller dominance over all other Overlords. Reaching it requires defeating the most powerful rivals in the galaxy and surviving the final power struggle." },
      { q: "Does progress carry from other games?", a: "Yes. Skills, ship upgrades, and specialist bonuses from Hyper Racing and Hyper Quest carry directly into Overlord. Your spaceship combat abilities, racing-trained reflexes, and recruited specialists all contribute to your power as an Overlord." },
      { q: "What happens when my realm is attacked?", a: "Defensive fortifications, stationed armies, and commander abilities activate automatically when your realm comes under attack. You can also redirect forces from neighbouring realms to reinforce under pressure. Every realm lost weakens your resource base, so defence is as critical as offence." },
      { q: "How do alliances and betrayals work?", a: "Negotiate treaties directly with rival Overlords, agree on shared objectives, and coordinate attacks. Alliances can be broken at any time, triggering political consequences across the realm network. Reputation matters — Overlords known for betrayal find it harder to form future alliances." },
      { q: "What are commanders and how do I get them?", a: "Commanders are elite leaders unlocked through conquest milestones, seasonal rewards, and in-game events. Each brings unique tactical abilities — ambush, siege, rapid deployment, or fortification. Level them up through battle to unlock increasingly powerful abilities." },
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
      <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-10 pb-24">
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
        {/* BG watermark number */}
        <div
          className="absolute right-0 top-0 select-none pointer-events-none font-goldman leading-none"
          style={{ fontSize: "clamp(140px, 20vw, 260px)", color: "rgba(255,255,255,0.02)", lineHeight: 1 }}
        >
          HOW
        </div>

        <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            className="mb-16"
          >
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              How {data.heading} Works
            </h2>
          </motion.div>

          <div className="flex flex-col gap-0">
            {data.howItWorks.map((item, i) => (
              <motion.div
                key={item.num}
                variants={fadeUp} custom={i * 0.8} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="relative flex gap-8 md:gap-14 pb-16 last:pb-0"
              >
                {/* Left: number + vertical line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="font-goldman text-[13px] w-12 h-12 flex items-center justify-center shrink-0"
                    style={{
                      border: `1px solid ${accent}`,
                      color: accent,
                      background: accentDim,
                      boxShadow: `0 0 20px ${accentDim}`,
                    }}
                  >
                    {item.num}
                  </div>
                  {i < data.howItWorks.length - 1 && (
                    <div
                      className="flex-1 w-px mt-3"
                      style={{ background: `linear-gradient(to bottom, ${accent}44, transparent)` }}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div className="pt-2 pb-2">
                  <h3
                    className="font-goldman uppercase text-xl md:text-2xl tracking-wide mb-4"
                    style={{ color: "rgba(255,255,255,0.95)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/62 text-[15px] leading-[1.9]">
                    {item.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — Rewards ════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute left-0 top-0 select-none pointer-events-none font-goldman leading-none"
          style={{ fontSize: "clamp(120px, 18vw, 240px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}
        >
          WIN
        </div>

        <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            className="mb-16"
          >
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.rewardsTitle}
            </h2>
          </motion.div>

          {/* alternating layout */}
          <div className="flex flex-col gap-16">
            {data.rewards.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp} custom={i * 0.7} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className={`flex flex-col md:flex-row gap-8 items-start ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Large label */}
                <div className="shrink-0 md:w-[200px]">
                  <div
                    className="font-goldman uppercase text-[13px] tracking-widest leading-tight py-3 px-4 inline-block"
                    style={{
                      color: accent,
                      border: `1px solid ${accent}44`,
                      borderLeft: `3px solid ${accent}`,
                      background: accentDim,
                    }}
                  >
                    {item.title}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div
                    className="w-full h-px mb-6"
                    style={{ background: `linear-gradient(to right, ${accent}33, transparent)` }}
                  />
                  <p className="text-white/68 text-[16px] leading-[1.95]">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CALLOUT BANNER ════════════════════════════════════ */}
      <div
        className="relative overflow-hidden py-16 md:py-20"
        style={{
          background: `linear-gradient(to right, rgba(6,6,20,0.95), ${accentDim} 50%, rgba(6,6,20,0.95))`,
          borderTop: `1px solid ${accent}22`,
          borderBottom: `1px solid ${accent}22`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${accentDim} 0%, transparent 70%)` }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}88, transparent)` }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}88, transparent)` }}
        />
        <div className="relative text-center px-6">
          <motion.p
            variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.5 }}
            className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide"
            style={{ color: accent, textShadow: `0 0 40px ${accent}` }}
          >
            {data.calloutLine1}
          </motion.p>
          <motion.p
            variants={fadeUp} custom={0.3} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.5 }}
            className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide mt-1"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: `0 0 30px ${glow}` }}
          >
            {data.calloutLine2}
          </motion.p>
        </div>
      </div>

      {/* ═══ SECTION 4 — Upgrades ═══════════════════════════════ */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "rgba(6,6,20,0.55)", borderBottom: `1px solid rgba(255,255,255,0.05)` }}
      >
        <div
          className="absolute right-0 bottom-0 select-none pointer-events-none font-goldman leading-none"
          style={{ fontSize: "clamp(100px, 15vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}
        >
          UP
        </div>

        <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            className="mb-16"
          >
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.upgradesTitle}
            </h2>
          </motion.div>

          <div className="flex flex-col gap-0">
            {data.upgrades.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp} custom={i * 0.7} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="group py-10 border-b last:border-b-0"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-start gap-6 md:gap-10">
                  {/* Large index */}
                  <span
                    className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none transition-opacity duration-300"
                    style={{ color: `${accent}70`, fontVariantNumeric: "tabular-nums", textShadow: `0 0 20px ${accent}44` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 pt-1">
                    <h3
                      className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4"
                      style={{ color: "rgba(255,255,255,0.92)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — FAQ Accordion ═══════════════════════════ */}
      <section className="py-24">
        <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            className="mb-14"
          >
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

      {/* ── Scrollable content */}
      <div className="relative z-10">

        {/* Sticky header strip */}
        <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-28 pb-6 flex items-center gap-4">
          <motion.button
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 text-[12px] tracking-widest uppercase"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </motion.button>

          <div className="w-px h-4 bg-white/15" />

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[11px] font-bold tracking-[0.3em] uppercase px-4 py-1"
            style={{
              fontFamily: "Orbitron, sans-serif",
              border: `1px solid ${data.accent}55`,
              borderTop: `2px solid ${data.accent}`,
              color: data.accent,
              background: data.accentDim,
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            }}
          >
            {data.label} MODE
          </motion.div>
        </div>

        {/* ── Page content */}
        {data.rich
          ? <DetailPage data={data} />
          : (
            <>
              {/* Simple mode header */}
              <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-8 pb-20 flex flex-col gap-5">
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
