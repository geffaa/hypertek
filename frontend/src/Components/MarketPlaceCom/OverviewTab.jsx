import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

const TABS = [
  {
    key: "general",
    label: "General",
    icon: "🛒",
    description: "Browse NFAs and NFCs available for immediate purchase. Skins, weapons, specialists, spaceships, and more.",
  },
  {
    key: "auctions",
    label: "Auctions",
    icon: "🔨",
    description: "Bid on exclusive limited-edition items. Win rare assets through competitive auctions.",
  },
  {
    key: "quests",
    label: "Quests / Trades",
    icon: "⚔️",
    description: "Complete quests and trade assets with other players to build your collection.",
  },
  {
    key: "hire",
    label: "Hire / Rent",
    icon: "🤝",
    description: "Hire specialists or rent in-game assets from other players for your missions.",
  },
  {
    key: "bounty",
    label: "Bounty",
    icon: "🎯",
    description: "Take on bounties, earn rewards, and climb the leaderboards.",
  },
  {
    key: "nfa101",
    label: "NFAs / NFCs 101",
    icon: "📚",
    description: "New to NFAs and NFCs? Learn everything about Web3 assets and how the Hyper Tek ecosystem works.",
  },
];

function OverviewTab({ onTabChange }) {
  return (
    <div className="py-8">
      {/* Header */}
      <motion.div
        className="mb-10"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-white/40" />
          <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">
            Marketplace
          </span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-2">
          Overview
        </h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          Welcome to the Hyper Tek Marketplace. Buy, sell, trade, and discover unique in-game assets across multiple categories.
        </p>
      </motion.div>

      {/* Tab cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TABS.map((tab, i) => (
          <motion.button
            key={tab.key}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={i + 1}
            onClick={() => onTabChange?.(tab.key)}
            className="text-left flex flex-col gap-3 p-5 rounded-xl transition-all duration-200 hover:brightness-125 group"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{tab.icon}</span>
              <ArrowRight
                className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors"
              />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">{tab.label}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{tab.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default OverviewTab;
