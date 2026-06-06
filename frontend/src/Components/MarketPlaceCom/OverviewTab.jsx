import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GiCrystalBall, GiGavel, GiCrossedSwords, GiShakingHands, GiTargetArrows, GiTrade } from "react-icons/gi";
import { MdStorefront } from "react-icons/md";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

const AVATARS = {
  nfa101:  "/avatar/dryads-male.webp",
  general: "/avatar/fawnus-female.webp",
  auctions:"/avatar/geodians-male.webp",
  trades:  "/avatar/geodians-female.webp",
  quests:  "/avatar/lithionites-female.webp",
  hire:    "/avatar/mantasquads-male.webp",
  bounty:  "/avatar/ophidians-female.webp",
};

const FEATURE_ICONS = [GiCrystalBall, MdStorefront, GiGavel, GiTrade, GiCrossedSwords, GiShakingHands, GiTargetArrows];
const FEATURE_KEYS  = ["nfa101", "general", "auctions", "trades", "quests", "hire", "bounty"];

function OverviewTab({ onTabChange }) {
  const { t } = useTranslation();
  const features = t("marketplace.overview.features", { returnObjects: true }) || [];
  const [activeIdx, setActiveIdx] = useState(0);

  const activeKey  = FEATURE_KEYS[activeIdx]  || "nfa101";
  const activeIcon = FEATURE_ICONS[activeIdx] || GiCrystalBall;
  const active     = features[activeIdx]       || {};

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
            {t("marketplace.sectionLabel")}
          </span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-2">
          {t("marketplace.overview.heading")}
        </h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          {t("marketplace.overview.subtitle")}
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
          {features.map((f, i) => {
            const isActive = i === activeIdx;
            const Icon = FEATURE_ICONS[i] || GiCrystalBall;
            return (
              <button
                key={FEATURE_KEYS[i]}
                onClick={() => setActiveIdx(i)}
                className="flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 flex-shrink-0 sm:flex-shrink relative"
                style={{
                  background: isActive ? "rgba(0,42,168,0.35)" : "transparent",
                  borderLeft: isActive ? "3px solid rgba(0,100,255,0.8)" : "3px solid transparent",
                }}
              >
                <Icon size={20} style={{ color: isActive ? "#60a5fa" : "rgba(255,255,255,0.4)", flexShrink: 0 }} />
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
          <div className="flex-1 min-w-0 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-1">
                  {React.createElement(activeIcon, { size: 32, style: { color: "#60a5fa", filter: "drop-shadow(0 0 6px rgba(96,165,250,0.5))" } })}
                  <h2 className="text-white font-[Goldman] font-bold text-lg sm:text-xl">
                    {active.label}
                  </h2>
                </div>
                <p className="text-white/40 text-xs mb-6">{active.tagline}</p>

                <div className="mb-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                <ul className="flex flex-col gap-4 mb-8">
                  {(active.details || []).map((point, i) => (
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

                <div className="mt-auto">
                  <button
                    onClick={() => onTabChange?.(activeKey)}
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
                key={activeIdx}
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
