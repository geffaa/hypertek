import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const GAMES = [
  {
    id: "racing",
    label: "RACING",
    path: "/game/racing",
    image: "/racing3.png",
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.45)",
    tagline: "Speed is survival.",
    description:
      "Push beyond the limits of gravity on neon-lit megacities and alien terrain. Tune your machine, master every corner, and leave your rivals in the dust — the leaderboard waits for no one.",
  },
  {
    id: "quest",
    label: "QUEST",
    path: "/game/quest",
    image: "/quest1.png",
    accent: "#38bdf8",
    glow: "rgba(56,189,248,0.45)",
    tagline: "Explore the unknown.",
    description:
      "Navigate uncharted star systems, forge alliances, and uncover the secrets of the Echo Core. Every choice shapes your legacy.",
  },
  {
    id: "overlord",
    label: "OVERLORD",
    path: "/game/overlord",
    image: "/overlord4.png",
    accent: "#f87171",
    glow: "rgba(248,113,113,0.45)",
    tagline: "Command. Conquer. Rule.",
    description:
      "You are the Overlord — reborn from the ashes of a fractured Earth. Raise armies, seize star systems, and bend rival factions to your will. The Echo Core chose you. Prove it was right.",
  },
];

const LIMITED_PACKAGES = [
  { name: "Stage 1 Starter Pack",    price: "TBA", highlight: "Best Entry Value",    bonuses: ["In-game Currency Bonus", "Exclusive Starter NFA", "Early Access Badge"] },
  { name: "Stage 1 Explorer Pack",   price: "TBA", highlight: "Most Popular",         bonuses: ["2× In-game Currency Bonus", "2× Exclusive NFAs", "Explorer Title + Badge"] },
  { name: "Stage 1 Elite Pack",      price: "TBA", highlight: "High Bonus Tier",      bonuses: ["5× In-game Currency Bonus", "5× Exclusive NFAs", "Elite Title + Rare Badge"] },
  { name: "Stage 1 Champion Pack",   price: "TBA", highlight: "Top Bonus Tier",       bonuses: ["10× In-game Currency Bonus", "10× Exclusive NFAs", "Champion Title + Ultra Badge"] },
];

const LIMITED_ITEMS = [
  { name: "Stage 1 Racing Vehicle NFA",   tag: "Hyper Racing",  bonus: "Highest Racing Bonus",  color: "#22c55e" },
  { name: "Stage 1 Quest Ship NFA",        tag: "Hyper Quest",   bonus: "Highest Quest Bonus",   color: "#38bdf8" },
  { name: "Stage 1 Overlord Character NFA",tag: "Overlord",      bonus: "Highest Strategy Bonus",color: "#f87171" },
  { name: "Stage 1 Land Parcel NFA",       tag: "All Games",     bonus: "Passive Yield Bonus",   color: "#a78bfa" },
  { name: "Stage 1 Infrastructure NFA",    tag: "All Games",     bonus: "Revenue Share Bonus",   color: "#f59e0b" },
];

function CrowdfundingSection({ className = "" }) {
  return (
    <motion.div
      className={`${className} flex-col gap-0 mt-5 overflow-hidden rounded-xl`}
      style={{
        background: "linear-gradient(160deg, rgba(0,40,120,0.22) 0%, rgba(0,10,40,0.55) 100%)",
        border: "1px solid rgba(56,189,248,0.22)",
        borderTop: "2px solid rgba(56,189,248,0.5)",
        boxShadow: "0 0 50px rgba(56,189,248,0.08)",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* ── Top text block ── */}
      <div className="px-8 py-7 flex flex-col gap-4" style={{ borderBottom: "1px solid rgba(56,189,248,0.12)" }}>
        {/* Badge */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 9, letterSpacing: "0.3em", color: "rgba(56,189,248,0.7)" }}>
            CROWDFUNDING CAMPAIGN — STAGE 1
          </span>
        </div>

        <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
          We are excited to announce the launch of our highly anticipated crowdfunding campaign to secure funding
          for the completion of the groundbreaking Hyper Tek project, which is making positive strides! This is
          your chance to dive into the Hyper Tek ecosystem as an early participant by choosing from an exclusive
          selection of limited-availability items and packages that you won't want to miss.<br />
          Act quickly! By purchasing directly from us on this platform, you can enjoy reduced rates of 10% by
          allowing us to pass the savings on to you, from avoiding crowdfunding fees, which are listed below!
        </p>

        <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
          As all Hyper Tek Non-Fungible Digital items are backed by a guaranteed minimum buy-back, with most also
          offering substantial in-game bonuses that enhance your experience, to amp things up, we're introducing a
          series of limited-edition Non-Fungible Assets (NFAs) featuring the highest bonus levels that will ever
          be offered. This is a rare opportunity as these offerings will never be repeated! Once these items sell
          out or we hit our funding target, any remaining unminted limited-edition NFAs will be pulled from the
          website for good! This means these Stage 1 NFAs will retain the highest in-game bonuses and remain
          truly unique, offering you and fellow investors the confidence that your purchase is genuinely one of a
          kind.
        </p>

        <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
          We've already raised over $440,000 and are looking to secure an additional $460,000. This is your
          moment to join us in this thrilling initiative; don't let it slip away! Purchase your
          limited-availability items or packages today and be part of the exciting Hyper Tek Ecosystem.
        </p>

        <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
          Remember to sign up for the wishlist and connect with us on social media to stay in the loop! Act now,
          as time is of the essence!
        </p>
      </div>

      {/* ── Two lists ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

        {/* Limited Packages */}
        <div className="px-7 py-6" style={{ borderRight: "1px solid rgba(56,189,248,0.12)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-4 h-[2px]" style={{ background: "#38bdf8" }} />
            <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 10, fontWeight: "bold", letterSpacing: "0.22em", color: "#38bdf8" }}>
              LIMITED PACKAGES
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(56,189,248,0.15)" }} />
          </div>

          <div className="flex flex-col gap-3">
            {LIMITED_PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                className="relative rounded-lg overflow-hidden"
                style={{
                  background: "rgba(56,189,248,0.04)",
                  border: "1px solid rgba(56,189,248,0.18)",
                  borderLeft: "3px solid rgba(56,189,248,0.6)",
                  padding: "12px 14px",
                }}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 11, fontWeight: "bold", color: "rgba(255,255,255,0.92)", letterSpacing: "0.06em" }}>
                    {pkg.name}
                  </span>
                  <span className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", fontFamily: "Orbitron,sans-serif", letterSpacing: "0.1em" }}>
                    {pkg.highlight}
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {pkg.bonuses.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span style={{ color: "#38bdf8", fontSize: 8 }}>▸</span>
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Limited Items */}
        <div className="px-7 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-4 h-[2px]" style={{ background: "#a78bfa" }} />
            <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 10, fontWeight: "bold", letterSpacing: "0.22em", color: "#a78bfa" }}>
              LIMITED ITEMS
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(167,139,250,0.15)" }} />
          </div>

          <div className="flex flex-col gap-3">
            {LIMITED_ITEMS.map((item, i) => (
              <motion.div
                key={item.name}
                className="rounded-lg"
                style={{
                  background: "rgba(167,139,250,0.04)",
                  border: "1px solid rgba(167,139,250,0.18)",
                  borderLeft: `3px solid ${item.color}`,
                  padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                }}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}18`, border: `1px solid ${item.color}44` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: 10, fontWeight: "bold", color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em" }}>{item.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${item.color}18`, color: item.color, fontFamily: "Orbitron,sans-serif", letterSpacing: "0.08em" }}>{item.tag}</span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{item.bonus}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default function News() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  return (
    <section id="gaming-section" className="w-full pt-16 md:pt-24 pb-12 md:pb-20 relative">
      <div className="w-full max-w-[1480px] mx-auto px-6 md:px-14 xl:px-18 2xl:px-20">

        {/* Section heading */}
        <motion.div
          className="flex items-end mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-white font-goldman uppercase text-[22px] pb-1 border-b-2 border-white">
            GAMING INFO
          </h2>
          <div className="flex-1 ml-3 mb-[1px] h-[2px] bg-gradient-to-r from-white to-transparent" />
        </motion.div>

        {/* ── DESKTOP: Accordion panels ── */}
        <div className="hidden md:flex gap-3 h-[520px] lg:h-[600px]">
          {GAMES.map((game, i) => {
            const isActive = active === game.id;
            return (
              <motion.div
                key={game.id}
                className="relative overflow-hidden cursor-pointer rounded-lg"
                style={{
                  flex: isActive ? "3 1 0%" : "1 1 0%",
                  transition: "flex 0.55s cubic-bezier(0.4,0,0.2,1)",
                  backgroundImage: `url(${game.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onClick={() => navigate(game.path, { state: { backTo: "/", section: "gaming-section" } })}
                onMouseEnter={() => setActive(game.id)}
                onMouseLeave={() => setActive(null)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                {/* Dark overlay */}
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    background: isActive
                      ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.08) 100%)"
                      : "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 100%)",
                  }}
                />

                {/* Accent bar bottom */}
                <div
                  className="absolute bottom-0 inset-x-0 h-[2px] transition-all duration-500"
                  style={{
                    background: game.accent,
                    boxShadow: isActive ? `0 0 40px 6px ${game.glow}` : `0 0 12px 2px ${game.glow}`,
                    opacity: isActive ? 1 : 0.5,
                  }}
                />

                {/* Accent top corner line */}
                <div
                  className="absolute top-0 left-0 w-12 h-[2px] transition-opacity duration-500"
                  style={{ background: game.accent, opacity: isActive ? 1 : 0.3 }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">

                  {/* Label */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="h-[2px] transition-all duration-500"
                      style={{ width: isActive ? 24 : 16, background: game.accent }}
                    />
                    <span
                      className="font-bold uppercase tracking-[0.25em] text-xs transition-all duration-300"
                      style={{ color: game.accent, fontFamily: "Orbitron, sans-serif" }}
                    >
                      {game.label}
                    </span>
                  </div>

                  {/* Tagline */}
                  <h3
                    className="text-white font-[Goldman] font-bold leading-tight transition-all duration-500"
                    style={{ fontSize: isActive ? "clamp(1.4rem, 2.2vw, 2rem)" : "clamp(1rem, 1.4vw, 1.3rem)" }}
                  >
                    {game.tagline}
                  </h3>

                  {/* Description + button — slide in when active */}
                  <div
                    className="overflow-hidden transition-all duration-500"
                    style={{
                      maxHeight: isActive ? "180px" : "0px",
                      opacity: isActive ? 1 : 0,
                      marginTop: isActive ? 16 : 0,
                    }}
                  >
                    <p
                      className="text-[13px] lg:text-sm leading-relaxed mb-5"
                      style={{
                        color: "rgba(255,255,255,0.82)",
                        textShadow: `0 0 18px ${game.glow}, 0 0 6px ${game.glow}`,
                      }}
                    >
                      {game.description}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(game.path, { state: { backTo: "/", section: "gaming-section" } }); }}
                      className="px-7 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-125"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: `1px solid ${game.accent}`,
                        borderTop: `2px solid ${game.accent}`,
                        color: game.accent,
                        fontFamily: "Orbitron, sans-serif",
                        clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                        boxShadow: `0 0 24px ${game.glow}`,
                      }}
                    >
                      LEARN MORE
                    </button>
                  </div>

                  {/* "Hover" hint when collapsed */}
                  <div
                    className="mt-2 transition-all duration-300"
                    style={{ opacity: isActive ? 0 : 0.45, height: isActive ? 0 : "auto" }}
                  >
                    <span
                      className="text-[9px] uppercase tracking-[0.35em] font-bold"
                      style={{ color: game.accent, fontFamily: "Orbitron, sans-serif" }}
                    >
                      hover to explore
                    </span>
                  </div>
                </div>

                {/* Vertical rotated label when collapsed */}
                <div
                  className="absolute top-8 right-4 transition-opacity duration-300 pointer-events-none"
                  style={{ opacity: isActive ? 0 : 0.6 }}
                >
                  <span
                    className="block text-[9px] font-bold uppercase tracking-[0.4em]"
                    style={{
                      color: game.accent,
                      fontFamily: "Orbitron, sans-serif",
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {game.label}
                  </span>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* ── Crowdfunding section — desktop ── */}
        <CrowdfundingSection className="hidden md:block" />

        {/* ── MOBILE: Stacked cards ── */}
        <div className="flex md:hidden flex-col gap-4">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              className="relative overflow-hidden rounded-lg cursor-pointer"
              style={{
                height: 200,
                backgroundImage: `url(${game.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={() => navigate(game.path, { state: { backTo: "/", section: "gaming-section" } })}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 100%)" }}
              />
              <div
                className="absolute bottom-0 inset-x-0 h-[2px]"
                style={{ background: game.accent, boxShadow: `0 0 20px ${game.glow}` }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-[2px]" style={{ background: game.accent }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: game.accent, fontFamily: "Orbitron, sans-serif" }}
                  >
                    {game.label}
                  </span>
                </div>
                <h3 className="text-white font-[Goldman] font-bold text-xl leading-tight mb-1.5">
                  {game.tagline}
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">{game.description}</p>
              </div>
            </motion.div>
          ))}
        </div>


        {/* ── Crowdfunding section — mobile ── */}
        <CrowdfundingSection className="flex md:hidden" />

      </div>
    </section>
  );
}
