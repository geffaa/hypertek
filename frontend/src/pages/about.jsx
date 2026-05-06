import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useSiteContentPage } from "../hooks/useSiteContent";
import { getImageUrl } from "../Config";
import LazyImage from "../Components/Common/LazyImage";
import GlowingOrb from "../Components/Common/BgColoring";

import aboutBg   from "../assets/images/aboutpage/about_bg.jpg";
import charImg   from "../assets/images/aboutpage/char.png";
import ourstory1 from "../assets/images/aboutpage/ourstory1.png";
import ourstory2 from "../assets/images/aboutpage/ourstory2.png";
import ourstory3 from "../assets/images/aboutpage/ourstory3.png";
import gamePng   from "../assets/images/aboutpage/game.png";
import iconConnect from "../assets/images/howItsWork/connect.png";
import iconWallet  from "../assets/images/howItsWork/wallet.png";
import iconCard    from "../assets/images/howItsWork/card.png";
import iconEarn    from "../assets/images/howItsWork/earn.png";

// ── Content ───────────────────────────────────────────────────────────────────
const DEFAULT_SUBTITLE = [
  "The Hyper Tek mission was to address multiple issues within the gaming industry and to redefine how gaming ecosystems operate by creating an interconnected universe where players are not limited to a single gameplay style. By combining multiple genres into one progression system, the Hyper Tek project provides a dynamic environment where players can explore, compete, and grow within a unified world.",
  "It sets out to give true ownership to digital assets that have real value, which increases over time with a guaranteed minimum buy-back on all Non-Fungible Artworks, and true play-to-earn designed systems within the ecosystem, which players contribute to.",
  "The project aims to empower players by giving them meaningful ownership over their progress and rewards while encouraging creativity, collaboration, and competition.",
  "Hyper Tek's long-term vision is to build a living digital universe where multiple games, economies, and communities coexist on a single interconnected platform.",
];

const DEFAULT_MISSION = [
  "The Hyper Tek Project was founded by Don Bennett, who envisioned a gaming environment where multiple genres could coexist within a single progression system. Rather than forcing players to remain in one gameplay loop, Hyper Tek allows them to explore different activities while building their character, resources, and reputation across the entire ecosystem, with progression, materials, rewards, and achievements flowing seamlessly across all the games.",
  "The project combines three major game environments: Hyper Racing, Hyper Quest, and Overlord of the Seven Realms. Each game represents a different style of gameplay, yet all operate within the same universe and share the same player economy. This design allows players to engage in the type of gameplay they enjoy most while still contributing to a larger ecosystem to create a new generation of gaming environments that are deeper, more immersive, and more rewarding than traditional standalone games.",
];



const DEFAULT_ADVANTAGE = [
  { icon: iconConnect, title: "Interconnected Ecosystem",   body: "Strategy, racing, and quest-based adventures linked through a shared progression system — move freely between games without losing progress." },
  { icon: iconWallet,  title: "Digital Asset Economy",      body: "NFAs with guaranteed minimum buy-backs. Own, trade, and create assets — land, infrastructure, utilities — that function across the entire ecosystem." },
  { icon: iconCard,    title: "Player-Controlled Economy",  body: "Unlike locked developer inventories, Hyper Tek lets players acquire assets, develop resources, and introduce new utilities into the universe." },
  { icon: iconEarn,    title: "Contributors, Not Players",  body: "Gameplay and digital ownership create a dynamic environment where every participant actively contributes to the growth of the ecosystem." },
];

const GAMES = [
  { name: "Hyper Racing",                tag: "Speed · Dominance", desc: "High-speed racing across hostile terrain. Upgrade your vehicle, build your crew, and claim territory across the galaxy.", img: "/racing3.png",      accent: "#f59e0b", glow: "rgba(245,158,11,0.35)",  mode: "racing"   },
  { name: "Hyper Quest",                 tag: "Explore · Trade",   desc: "Navigate planets, complete quests, and trade resources across an ever-expanding star map. Every delivery shapes the economy.", img: "/quest1.png",       accent: "#22c55e", glow: "rgba(34,197,94,0.35)",   mode: "quest"    },
  { name: "Overlord of the Seven Realms",tag: "Strategy · Power",  desc: "Command armies, forge alliances, and conquer realms. The most powerful Overlord controls the fate of the entire universe.", img: "/overlord_panel.png",accent: "#a78bfa", glow: "rgba(167,139,250,0.35)", mode: "overlord" },
];

// ── Shared button styles ──────────────────────────────────────────────────────
const BTN_PRIMARY = {
  background: "rgba(0,10,40,0.75)",
  border: "1px solid rgba(56,189,248,0.55)",
  borderTop: "2px solid rgba(56,189,248,0.85)",
  clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
  fontFamily: "Orbitron, sans-serif",
  boxShadow: "0 0 28px rgba(56,189,248,0.22)",
  color: "rgba(56,189,248,0.95)",
  letterSpacing: "0.12em",
};
const BTN_SECONDARY = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderTop: "2px solid rgba(255,255,255,0.28)",
  clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
  fontFamily: "Orbitron, sans-serif",
  color: "rgba(255,255,255,0.55)",
  letterSpacing: "0.12em",
};

// ── Motion ────────────────────────────────────────────────────────────────────
const fadeUp    = (delay = 0) => ({ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" } } });
const fadeLeft  = { hidden: { opacity: 0, x: -36 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } } };
const fadeRight = { hidden: { opacity: 0, x:  36 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } } };

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 10, color: "rgba(56,189,248,0.6)", letterSpacing: "0.35em" }}>{number}</span>
      <div className="w-6 h-px" style={{ background: "rgba(56,189,248,0.35)" }} />
      <span className="text-white/35 text-[10px] font-bold tracking-[0.3em] uppercase">{label}</span>
    </div>
  );
}

function CornerAccent({ color = "rgba(56,189,248,0.45)" }) {
  return (
    <>
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 rounded-tl pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 rounded-br pointer-events-none" style={{ borderColor: color }} />
    </>
  );
}



// ── Main ──────────────────────────────────────────────────────────────────────
function About() {
  const navigate = useNavigate();
  const { sections: cms } = useSiteContentPage("about");
  const top   = cms.about_top   || {};
  const story = cms.about_story || {};

  const heroHeading  = top.heading    || "About Us";
  const heroSubtitle = DEFAULT_SUBTITLE;
  const bgImage      = top.bg_image   ? getImageUrl(top.bg_image)   : aboutBg;
  const charImage    = top.char_image ? getImageUrl(top.char_image) : charImg;

  const missionParas = DEFAULT_MISSION;
  const advantages = DEFAULT_ADVANTAGE;

  const story2Image = story.story2_image ? getImageUrl(story.story2_image) : ourstory2;
  const story3Image = story.story3_image ? getImageUrl(story.story3_image) : ourstory3;

  return (
    <div className="relative text-white overflow-hidden" style={{ background: "#060610" }}>

      <GlowingOrb Xaxis={80}   Yaxis={900}  />
      <GlowingOrb Xaxis={1350} Yaxis={2200} />
      <GlowingOrb Xaxis={200}  Yaxis={2800} />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section
        data-edit-section="about_top"
        data-edit-label="About — Top Section"
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center top" }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(115deg,rgba(6,6,16,0.88) 0%,rgba(6,6,16,0.50) 55%,rgba(6,6,16,0.72) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom,transparent,#060610)" }} />
        {/* Neon bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.4) 40%,rgba(56,189,248,0.4) 60%,transparent)" }} />

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20 pt-28 pb-16 flex flex-col md:flex-row items-center gap-8">

          {/* Left */}
          <motion.div
            className="flex-1 flex flex-col gap-5"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {/* Badge */}
            <motion.div variants={fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3"
                style={{ border: "1px solid rgba(56,189,248,0.45)", background: "rgba(56,189,248,0.18)", borderRadius: 99, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-200 text-[11px] font-bold tracking-[0.25em] uppercase">The HYPER TEK UNIVERSE</span>
              </div>
              <h1 className="font-[Goldman] font-bold text-4xl md:text-5xl xl:text-[56px] uppercase text-white leading-[1.1] whitespace-nowrap">
                {heroHeading}
              </h1>
            </motion.div>

            <motion.div variants={fadeUp(0.1)} className="flex flex-col gap-2.5 max-w-[660px]"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
              {(Array.isArray(heroSubtitle) ? heroSubtitle : [heroSubtitle]).map((para, i) => (
                <p key={i} className="text-white/85 text-[10px] md:text-[11.5px] leading-[1.8] text-justify"
                  style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.02em" }}>{para}</p>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp(0.2)} className="flex gap-3 mt-1 flex-wrap sm:flex-nowrap">
              {[{ v: "3", l: "Gaming Worlds" }, { v: "NFA", l: "Guaranteed Min Buy-back" }, { v: "P2E", l: "Play-to-Earn" }].map((s) => (
                <div key={s.l} className="flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                  style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 10 }}>
                  <span className="text-white font-[Goldman] font-bold text-sm">{s.v}</span>
                  <span className="text-white/70 text-xs">{s.l}</span>
                </div>
              ))}
            </motion.div>


          </motion.div>

          {/* Character */}
          <motion.div
            className="hidden md:flex flex-shrink-0 justify-end items-end self-end"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <LazyImage
              src={charImage}
              alt="Character"
              fallback={charImg}
              className="h-[360px] md:h-[480px] lg:h-[580px] xl:h-[680px] w-auto"
              imgClassName="object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          OUR MISSION
      ══════════════════════════════════════════════════════ */}
      <section
        data-edit-section="about_story"
        data-edit-label="About — Our Story"
        className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 pt-16 pb-10"
      >
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          <motion.div className="w-full lg:w-[45%] flex-shrink-0 flex" variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <div className="relative rounded-2xl overflow-hidden w-full">
              <LazyImage src="/about2.png" alt="Our Mission" fallback={ourstory1}
                className="w-full h-full min-h-[280px]" imgClassName="object-cover" />
              <CornerAccent />
              <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ border: "1px solid rgba(56,189,248,0.18)" }} />
            </div>
          </motion.div>

          <motion.div className="flex-1 flex flex-col gap-5" variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <SectionLabel number="01" label="Our Mission" />
            <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[36px] text-white leading-tight">
              Redefining What<br />Gaming Can Be
            </h2>
            <div className="space-y-4">
              {missionParas.map((p, i) => (
                <p key={i} className="text-white/70 text-sm md:text-[14px] leading-[1.9] text-justify">{p}</p>
              ))}
            </div>
            {/* Game badges */}
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                { label: "Hyper Racing",                accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
                { label: "Hyper Quest",                 accent: "#22c55e", glow: "rgba(34,197,94,0.3)"  },
                { label: "Overlord of the Seven Realms",accent: "#a78bfa", glow: "rgba(167,139,250,0.3)"},
              ].map((g) => (
                <span key={g.label}
                  className="px-4 py-2 flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${g.glow}, rgba(255,255,255,0.04))`,
                    border: `1px solid ${g.accent}55`,
                    borderLeft: `3px solid ${g.accent}`,
                    borderRadius: 6,
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: g.accent,
                    textTransform: "uppercase",
                    boxShadow: `0 0 12px ${g.glow}`,
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: g.accent, display: "inline-block", boxShadow: `0 0 6px ${g.accent}` }} />
                  {g.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3 GAMES
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full px-6 md:px-12 xl:px-20 pt-12 pb-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 10, color: "rgba(56,189,248,0.6)", letterSpacing: "0.35em" }}>02</span>
              <div className="w-6 h-px" style={{ background: "rgba(56,189,248,0.35)" }} />
              <span className="text-white/35 text-[10px] font-bold tracking-[0.3em] uppercase">The Universe</span>
            </div>
            <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[36px] text-white">
              Three Worlds. One Economy.
            </h2>
            <p className="text-white/38 text-sm mt-2 max-w-lg mx-auto">
              Each game is a gateway — distinct in gameplay, unified in economy and progression.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="the-universe">
            {GAMES.map((game, i) => (
              <motion.div
                key={game.name}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.09 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/game/${game.mode}`, { state: { backTo: "/about", section: "the-universe" } })}
              >
                {/* Top accent line */}
                <div className="h-0.5 w-full" style={{ background: game.accent }} />
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img src={game.img} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.style.opacity = "0.25"; }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,transparent 30%,rgba(6,6,16,0.97) 100%)" }} />
                </div>
                {/* Content */}
                <div className="px-5 py-4">
                  <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: game.accent, fontFamily: "Orbitron,sans-serif" }}>{game.tag}</p>
                  <h3 className="font-[Goldman] font-bold text-sm text-white mb-2 leading-snug">{game.name}</h3>
                  <p className="text-white/45 text-xs leading-relaxed mb-4">{game.desc}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase transition-opacity group-hover:opacity-100 opacity-60"
                    style={{ color: game.accent, fontFamily: "Orbitron,sans-serif" }}>
                    Discover <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `inset 0 0 0 1px ${game.accent}35, 0 8px 32px ${game.glow}` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════════════════════
          WEB3 GAMING + KEY ADVANTAGE (combined)
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full pt-20 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.35) 35%,rgba(167,139,250,0.35) 65%,transparent)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,8,40,0.35) 0%,rgba(6,6,16,0) 60%)" }} />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">

          {/* Section label */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <SectionLabel number="03" label="Web3 Gaming & Competitive Edge" />
          </motion.div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start mt-2">

            {/* ── LEFT: The Key Advantage ── */}
            <motion.div
              className="w-full lg:w-[44%] flex-shrink-0"
              initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }} viewport={{ once: true }}
            >
              <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[34px] text-white mb-8 leading-tight">
                The Key<br />Advantage
              </h2>

              <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {advantages.map((a, i) => (
                  <motion.div
                    key={a.title}
                    className="flex gap-5 items-start py-5"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.07 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 9, color: "rgba(56,189,248,0.45)", letterSpacing: "0.2em" }}>0{i + 1}</span>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.18)" }}>
                        <img src={a.icon} alt={a.title} className="w-5 h-5 object-contain"
                          style={{ filter: "brightness(0) invert(1) sepia(1) saturate(4) hue-rotate(175deg) opacity(0.85)" }} />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-3 h-0.5 rounded-full" style={{ background: "rgba(56,189,248,0.6)" }} />
                        <p className="text-white font-semibold text-sm">{a.title}</p>
                      </div>
                      <p className="text-white/50 text-[13px] leading-relaxed">{a.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Vertical divider (desktop only) */}
            <div className="hidden lg:block w-px self-stretch flex-shrink-0" style={{ background: "linear-gradient(to bottom,transparent,rgba(56,189,248,0.25) 20%,rgba(167,139,250,0.25) 80%,transparent)" }} />

            {/* ── RIGHT: HYPER TEK, A WEB3 GAMING SOLUTION ── */}
            <motion.div
              className="flex-1 flex flex-col gap-6"
              initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }} viewport={{ once: true }}
            >
              <div>
                <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[34px] text-white leading-tight mb-3">
                  HYPER TEK,<br />A WEB3 GAMING SOLUTION
                </h2>
                <p className="text-white/50 text-[13px] leading-relaxed max-w-[480px]"
                  style={{ fontFamily: "Orbitron, sans-serif" }}>
                  Bridging gaps between immersive gaming, a driven digital marketplace, rewarding players, and investors alike.
                </p>
              </div>

              {/* 3 feature cards — stacked vertically */}
              <div className="flex flex-col gap-4">

                <motion.div
                  className="rounded-xl p-5 flex gap-4 items-start"
                  style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.18)", borderLeft: "3px solid rgba(34,197,94,0.55)" }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} viewport={{ once: true }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="#22c55e" strokeWidth="1.2" /><circle cx="7" cy="7" r="2" fill="#22c55e" /></svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-2" style={{ fontFamily: "Orbitron, sans-serif", color: "#22c55e" }}>
                      Tangible Rewards &amp; Entrepreneurship
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {["True NFT/NFA ownership with guaranteed minimum buy-back", "Revenue sharing through player-controlled digital economy", "Real-world value with evolving in-game asset prices"].map((b, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <div className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0" style={{ background: "#22c55e" }} />
                          <span className="text-white/60 text-[12px] leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-xl p-5 flex gap-4 items-center"
                  style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.22)", borderLeft: "3px solid rgba(56,189,248,0.55)" }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }} viewport={{ once: true }}
                >
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl"
                      style={{ background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.35)", boxShadow: "0 0 18px rgba(56,189,248,0.2)" }}>
                      <img src="/logo-white.png" alt="HyperTek" className="w-5 h-5 object-contain"
                        style={{ filter: "brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(175deg) opacity(0.9)" }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-1" style={{ fontFamily: "Orbitron, sans-serif", color: "#38bdf8" }}>
                      Cash-Out Ecosystem
                    </span>
                    <p className="text-white/60 text-[12px] leading-relaxed">
                      Seamlessly convert in-game earnings to real-world currency — your digital labour has tangible, withdrawable value.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-xl p-5 flex gap-4 items-start"
                  style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.18)", borderLeft: "3px solid rgba(167,139,250,0.55)" }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.19 }} viewport={{ once: true }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#a78bfa" strokeWidth="1.2" /><path d="M4 7h6M7 4v6" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-2" style={{ fontFamily: "Orbitron, sans-serif", color: "#a78bfa" }}>
                      Infinite Gameplay Across Interconnected Worlds
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {["Three unique game genres within one unified universe", "Shared progression, rewards, and achievements across all games", "A living ecosystem where every choice impacts the whole universe"].map((b, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <div className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0" style={{ background: "#a78bfa" }} />
                          <span className="text-white/60 text-[12px] leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CLOSING CTA
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${gamePng})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.05 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,#060610 0%,rgba(6,6,16,0.75) 50%,#060610 100%)" }} />

        <motion.div className="relative z-10 max-w-[680px] mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} viewport={{ once: true }}>

          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left,rgba(56,189,248,0.3),transparent)" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,rgba(56,189,248,0.3),transparent)" }} />
          </div>

          <p className="text-white/48 text-sm md:text-[15px] leading-[1.9] italic mb-8">
            Investors, partners, and innovators who believe in the future of interconnected gaming ecosystems are invited to explore the project and join the journey as Hyper Tek continues to build the next generation of digital worlds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/market-place" className="px-8 py-3 text-[11px] font-bold uppercase transition-all hover:brightness-125" style={BTN_PRIMARY}>
              Explore Marketplace
            </Link>
            <Link to="/gaming" className="px-8 py-3 text-[11px] font-bold uppercase transition-all hover:brightness-110" style={BTN_SECONDARY}>
              View Games
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-10 justify-center">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/12 text-[10px] tracking-[0.5em] font-bold uppercase">Hyper Tek</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
        </motion.div>
      </section>


    </div>
  );
}

export default About;
