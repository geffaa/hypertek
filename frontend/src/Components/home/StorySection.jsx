import { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Network, Gem, Zap, ArrowLeftRight, Layers, Glasses } from "lucide-react";
import useSiteContent from "../../hooks/useSiteContent";
import { useTranslation } from "react-i18next";

const AVATAR_FILES = [
  "commander-elite.webp","dryads-female.webp","dryads-male.webp",
  "fawnus-female.webp","fawnus-male.webp","geodians-female.webp",
  "geodians-male.webp","lithionites-female.webp","lithionites-male.webp",
  "mantasquads-female.webp","mantasquads-male.webp","marmulus-female.webp",
  "marmulus-male.webp","ophidians-female.webp","ophidians-male.webp",
  "overlord.webp","team-specialist-major.webp",
];

import storyBg   from "../../assets/images/herostory/story_bg.webp";
import lineRight from "../../assets/images/herostory/line_right.webp";
import lineLeft  from "../../assets/images/herostory/line_left.webp";

const KEY_HIGHLIGHTS = [
  { Icon: Network,        label: "Interconnected Universe",  desc: "3 games — 1 shared economy and progression system",          color: "#38bdf8" },
  { Icon: Gem,            label: "True Ownership",           desc: "NFAs with guaranteed minimum buy-back",                      color: "#a78bfa" },
  { Icon: Zap,            label: "Play-to-Earn",             desc: "Every action contributes to your real-world rewards",        color: "#fbbf24" },
  { Icon: ArrowLeftRight, label: "Cash-Out Payments",        desc: "Converting in-game currency/rewards to cash-out payments",   color: "#22c55e" },
  { Icon: Layers,         label: "Linked Progression",       desc: "Player progression is linked across all suites of games",   color: "#fb7185" },
  { Icon: Glasses,        label: "VR/AR Integration",        desc: "VR/AR players can join missions and epic battles in real-time", color: "#facc15" },
];

const c = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const up  = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
const lft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
const rgt = { hidden: { opacity: 0, x: 40  }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
const sc  = { hidden: { opacity: 0, scale: 0.9, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } } };

export default function StorySection() {
  const { t } = useTranslation();
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const { data: cms } = useSiteContent("home_story");

  const randomAvatar = useMemo(() => `/avatar/${AVATAR_FILES[Math.floor(Math.random() * AVATAR_FILES.length)]}`, []);

  const bgImage        = cms.background_image || storyBg;
  const charImage      = cms.character_image  || randomAvatar;
  const leftHeading    = t("story.label")     || cms.left_heading;
  const leftSubheading = t("story.subheading") || cms.left_subheading;
  const leftBody       = t("story.body");

  const rawHighlights = t("story.highlights", { returnObjects: true });
  const highlights = Array.isArray(rawHighlights) ? rawHighlights : [];

  return (
    <section
      ref={ref}
      data-edit-section="home_story"
      data-edit-label="Story Section"
      className="relative w-full min-h-screen overflow-hidden flex items-center"
    >
      {/* Background */}
      <div className="absolute inset-0"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-[#040815]/80" />
      {/* Left-side dark fade so text is always readable */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(4,8,21,0.92) 0%, rgba(4,8,21,0.60) 38%, rgba(4,8,21,0.10) 55%, rgba(4,8,21,0.60) 70%, rgba(4,8,21,0.92) 100%)" }} />
      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, rgba(4,8,21,0.9), transparent)" }} />

      {/* Decorative lines */}
      <img src={lineRight} alt="" loading="lazy" className="absolute top-6 right-0 w-[220px] opacity-30 z-[2] pointer-events-none" />
      <img src={lineLeft}  alt="" loading="lazy" className="absolute bottom-6 left-0 w-[220px] opacity-30 z-[2] pointer-events-none" />

      {/* ── 3-column grid ── */}
      <motion.div
        className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-6"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={c}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_auto_1fr] gap-0 items-center min-h-[calc(100vh-48px)]">

          {/* ══ LEFT: Story text ══ */}
          <motion.div className="flex flex-col gap-6 pr-0 lg:pr-10" variants={c}>

            {/* Label */}
            <motion.div variants={lft} className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-[#38bdf8]/70" />
              <span className="text-[#38bdf8] text-[15px] font-bold tracking-[0.45em] uppercase"
                style={{ fontFamily: "Orbitron, sans-serif", textShadow: "0 0 16px rgba(56,189,248,0.55)" }}>
                The {leftHeading}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={lft}
              className="font-[Goldman] font-bold text-white leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}
            >
              {leftSubheading}
            </motion.h2>

            {/* Divider */}
            <motion.div variants={lft} className="flex items-center gap-3">
              <div className="w-5 h-[1px] bg-[#38bdf8]/50" />
              <div className="w-24 h-[1px] bg-white/10" />
            </motion.div>

            {/* Body */}
            <motion.p
              variants={up}
              className="text-gray-400 text-sm leading-[1.85]"
            >
              {leftBody}
            </motion.p>

            {/* CTA */}
            <motion.div variants={up} className="flex items-center gap-6 mt-2">
              <Link
                to="/about"
                className="group relative px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-300 hover:brightness-125"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  background: "rgba(0,8,30,0.85)",
                  border: "1px solid rgba(56,189,248,0.45)",
                  borderTop: "2px solid rgba(56,189,248,0.80)",
                  clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                  color: "rgba(56,189,248,0.95)",
                  boxShadow: "0 0 24px rgba(56,189,248,0.12)",
                }}
              >
                {t("story.readMore")}
              </Link>
              <span
                className="text-[11px] tracking-[0.45em] uppercase font-bold"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  color: "rgba(56,189,248,0.75)",
                  textShadow: "0 0 10px rgba(56,189,248,0.4)",
                  letterSpacing: "0.45em",
                }}
              >{t("story.brand")}</span>
            </motion.div>
          </motion.div>

          {/* ══ CENTER: Character ══ */}
          <motion.div
            className="hidden lg:flex relative items-end justify-center"
            style={{ width: "clamp(340px, 30vw, 520px)", height: "clamp(600px, 84vh, 920px)" }}
            variants={sc}
          >
            {/* Foot glow */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-10 rounded-full blur-2xl"
              style={{ background: "radial-gradient(ellipse, rgba(56,189,248,0.30) 0%, transparent 70%)" }} />
            {/* Vertical light beam behind character */}
            <div className="absolute inset-x-0 bottom-0 h-full"
              style={{ background: "radial-gradient(ellipse 40% 80% at 50% 80%, rgba(56,189,248,0.08) 0%, transparent 70%)" }} />
            <img
              src={charImage}
              alt="Character"
              loading="lazy"
              className="relative z-[2] h-full w-auto object-contain object-bottom"
              style={{ filter: "drop-shadow(0 0 50px rgba(56,189,248,0.15)) drop-shadow(0 20px 40px rgba(0,0,0,0.8))" }}
            />
          </motion.div>

          {/* ══ RIGHT: Key highlights ══ */}
          <motion.div
            className="flex flex-col pl-0 lg:pl-10"
            variants={c}
          >
            <motion.div
              variants={rgt}
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
              }}
            >
              {KEY_HIGHLIGHTS.map((h, idx) => {
                const tH = highlights[idx] || {};
                const label = tH.label || h.label;
                const desc  = tH.desc  || h.desc;
                const Icon = h.Icon;
                return (
                  <motion.div
                    key={h.label}
                    variants={rgt}
                    className="group flex items-center gap-4 px-5 py-3.5 relative overflow-hidden cursor-default transition-all duration-300 hover:bg-white/[0.03]"
                    style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                  >
                    {/* Left accent */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(to bottom, transparent, ${h.color}, transparent)` }}
                    />
                    {/* Icon */}
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `${h.color}12`,
                        border: `1px solid ${h.color}28`,
                      }}
                    >
                      <Icon style={{ color: h.color, width: 14, height: 14 }} />
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[12px] font-semibold leading-tight">{label}</p>
                      <p className="text-white/40 text-[10.5px] mt-0.5 leading-tight truncate">{desc}</p>
                    </div>
                    {/* Right accent bar */}
                    <div
                      className="w-[3px] h-5 rounded-full flex-shrink-0"
                      style={{ background: `linear-gradient(to bottom, ${h.color}, transparent)`, opacity: 0.55 }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
