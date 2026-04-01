import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

// Avatar mapped per feature tab — each tab shows a different character
const AVATARS = {
  nfa101:   "/avatar/dryads-male.png",
  general:  "/avatar/fawnus-female.png",
  auctions: "/avatar/geodians-male.png",
  quests:   "/avatar/lithionites-female.png",
  hire:     "/avatar/mantasquads-male.png",
  bounty:   "/avatar/ophidians-female.png",
};

const FEATURES = [
  {
    key: "nfa101",
    label: "NFAs / NFTs",
    icon: "📚",
    tagline: "New to Web3 assets? Start here",
    details: [
      "NFAs (Non-Fungible Assets) are unique in-game items you truly own on-chain.",
      "NFTs (Non-Fungible Tokens) represent characters, skins, and collectibles with verified rarity.",
      "Learn how to buy, sell, and use Web3 assets safely within the HyperTek ecosystem.",
    ],
    cta: "Learn the Basics",
  },
  {
    key: "general",
    label: "The Marketplace",
    icon: "🛒",
    tagline: "Buy & sell in-game assets instantly",
    details: [
      "Browse a wide catalog of NFAs and NFTs — skins, weapons, specialists, spaceships, and more.",
      "Filter by category, rarity, or price range to find exactly what you need.",
      "Listings are fulfilled on-chain, so ownership transfers are instant and verifiable.",
    ],
    cta: "Browse The Marketplace",
  },
  {
    key: "auctions",
    label: "Auctions",
    icon: "🔨",
    tagline: "Compete for exclusive limited-edition items",
    details: [
      "Bid on rare assets that are only available through time-limited auctions.",
      "A live countdown shows exactly how much time is left — every second counts.",
      "Outbid others to secure legendary items that can't be bought any other way.",
    ],
    cta: "View Auctions",
  },
  {
    key: "quests",
    label: "Quests / Trades",
    icon: "⚔️",
    tagline: "Complete missions, trade assets peer-to-peer",
    details: [
      "Take on quests to earn exclusive rewards and rare in-game assets.",
      "Propose or accept direct trades with other players — no middleman.",
      "Build your collection strategically through skill, not just spending.",
    ],
    cta: "Explore Quests",
  },
  {
    key: "hire",
    label: "For Hire",
    icon: "🤝",
    tagline: "Borrow assets or earn from yours",
    details: [
      "Rent powerful specialists or gear for a single mission without buying outright.",
      "List your own idle assets for rent and earn passive income while you're away.",
      "Flexible durations — hourly, daily, or per-mission agreements.",
    ],
    cta: "Browse For Hire",
  },
  {
    key: "bounty",
    label: "Bounty",
    icon: "🎯",
    tagline: "Hunt targets, claim rewards, top the leaderboard",
    details: [
      "Accept bounties posted by other players or the system to earn crypto rewards.",
      "Climb the bounty leaderboard to unlock exclusive titles and bonus payouts.",
      "Post your own bounties to recruit skilled players for your objectives.",
    ],
    cta: "View Bounties",
  },
];

function OverviewTab({ onTabChange }) {
  const [activeKey, setActiveKey] = useState(FEATURES[0].key);

  const active = FEATURES.find(f => f.key === activeKey);

  return (
    <div className="py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
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
          Welcome to the HyperTek Marketplace. Select a feature to learn more — then jump straight in.
        </p>
      </motion.div>

      {/* Split panel */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="flex flex-col sm:flex-row rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Left — feature list */}
        <div
          className="flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-visible scrollbar-hide flex-shrink-0 sm:w-52"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            scrollbarWidth: "none",
          }}
        >
          {FEATURES.map((f) => {
            const isActive = f.key === activeKey;
            return (
              <button
                key={f.key}
                onClick={() => setActiveKey(f.key)}
                className="flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 flex-shrink-0 sm:flex-shrink relative"
                style={{
                  background: isActive ? "rgba(0,42,168,0.35)" : "transparent",
                  borderLeft: isActive ? "3px solid rgba(0,100,255,0.8)" : "3px solid transparent",
                }}
              >
                <span className="text-lg leading-none">{f.icon}</span>
                <div className="hidden sm:block min-w-0">
                  <p
                    className="text-xs font-semibold leading-tight truncate"
                    style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}
                  >
                    {f.label}
                  </p>
                  <p
                    className="text-[10px] leading-tight mt-0.5 truncate"
                    style={{ color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}
                  >
                    {f.tagline}
                  </p>
                </div>
                {/* mobile: label only below icon */}
                <p
                  className="sm:hidden text-[10px] font-semibold whitespace-nowrap"
                  style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.45)" }}
                >
                  {f.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right — detail panel + avatar */}
        <div className="flex-1 min-w-0 flex" style={{ background: "rgba(0,10,40,0.5)" }}>
          {/* Detail content */}
          <div className="flex-1 min-w-0 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col h-full"
              >
                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl">{active.icon}</span>
                  <h2 className="text-white font-[Goldman] font-bold text-lg sm:text-xl">
                    {active.label}
                  </h2>
                </div>
                <p className="text-white/40 text-xs mb-6">{active.tagline}</p>

                {/* Divider */}
                <div className="mb-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                {/* Detail points */}
                <ul className="flex flex-col gap-4 mb-8">
                  {active.details.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                        style={{
                          background: "rgba(0,80,255,0.25)",
                          border: "1px solid rgba(0,100,255,0.4)",
                          color: "rgba(100,180,255,0.9)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-white/60 text-sm leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-auto">
                  <button
                    onClick={() => onTabChange?.(active.key)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: "rgba(0,60,200,0.4)",
                      border: "1px solid rgba(0,100,255,0.4)",
                      color: "rgba(150,200,255,0.95)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(0,80,220,0.6)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(0,60,200,0.4)";
                      e.currentTarget.style.color = "rgba(150,200,255,0.95)";
                    }}
                  >
                    {active.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Avatar column — hidden on mobile */}
          <div className="hidden lg:flex items-end justify-center flex-shrink-0" style={{ width: 280 }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeKey}
                src={AVATARS[activeKey]}
                alt="Character"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full h-auto max-h-[520px] object-contain drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 0 40px rgba(0,80,255,0.2))" }}
              />
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default OverviewTab;
