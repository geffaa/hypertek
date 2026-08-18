import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Layers3, Gem, Network, Rocket, ArrowRight } from "lucide-react";
import { useSiteContentPage } from "../hooks/useSiteContent";
import { getImageUrl } from "../Config";
import LazyImage from "../Components/Common/LazyImage";
import GlowingOrb from "../Components/Common/BgColoring";
import { useTranslation } from "react-i18next";

import aboutBg from "../assets/images/aboutpage/about_bg.webp";
import charImg from "../assets/images/aboutpage/char.webp";
import ourstory1 from "../assets/images/aboutpage/ourstory1.webp";

// ── Static visual data (no text) ─────────────────────────────────────────────
const NFA_CARDS_STATIC = [
  { Icon: Layers3, accent: "#38bdf8", glow: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.35)", type: "tiers" },
  { Icon: Gem, accent: "#fbbf24", glow: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.4)", type: "value" },
  { Icon: Network, accent: "#818cf8", glow: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.35)", type: "fair" },
  { Icon: Rocket, accent: "#4ade80", glow: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.35)", type: "involved" },
];

const GAMES_STATIC = [
  { img: "/racing3.webp", accent: "#f59e0b", glow: "rgba(245,158,11,0.35)", mode: "racing" },
  { img: "/quest1.webp", accent: "#22c55e", glow: "rgba(34,197,94,0.35)", mode: "quest" },
  { img: "/overlord_panel.webp", accent: "#a78bfa", glow: "rgba(167,139,250,0.35)", mode: "overlord" },
];

const GAME_BADGE_ACCENTS = [
  { accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { accent: "#22c55e", glow: "rgba(34,197,94,0.3)" },
  { accent: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
];

// Cycling avatars/vehicles for the Early-Access CTA — mirrors the Crowdfunding
// page: a vehicle (left) + an avatar (right) are picked per page visit and stay
// fixed for the whole visit, advancing one step only on the next visit.
const CTA_AVATARS = [
  "/avatar/commander-elite.webp", "/avatar/dryads-female.webp", "/avatar/dryads-male.webp",
  "/avatar/fawnus-female.webp", "/avatar/fawnus-male.webp", "/avatar/geodians-female.webp",
  "/avatar/geodians-male.webp", "/avatar/lithionites-female.webp", "/avatar/lithionites-male.webp",
  "/avatar/mantasquads-female.webp", "/avatar/mantasquads-male.webp", "/avatar/marmulus-female.webp",
  "/avatar/marmulus-male.webp", "/avatar/ophidians-female.webp", "/avatar/ophidians-male.webp",
  "/avatar/overlord.webp", "/avatar/team-specialist-major.webp",
];
const CTA_VEHICLES = ["/vehicle1.webp", "/vehicle2-1.webp", "/vehicle2.webp", "/vehicle3-1.webp", "/vehicle3.webp"];

// Preload so the src swap is instant with no fetch/layout-shift.
function preloadImages(urls) {
  urls.forEach((src) => { const img = new Image(); img.src = src; });
}



// ── Motion ────────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" } } });
const fadeLeft = { hidden: { opacity: 0, x: -36 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } } };
const fadeRight = { hidden: { opacity: 0, x: 36 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } } };

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 14, fontWeight: "bold", color: "rgba(56,189,248,0.95)", letterSpacing: "0.35em", textShadow: "0 0 12px rgba(56,189,248,0.6)" }}>{number}</span>
      <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />
      <span className="text-white/70 text-[12px] font-bold tracking-[0.3em] uppercase">{label}</span>
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
function About({ isPreview = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { sections: cms } = useSiteContentPage("about");

  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    const el = document.getElementById(target);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "instant" });
  }, [location.state?.scrollTo]);

  // Early-Access CTA avatar: advance one step per visit, then keep it fixed for
  // the whole visit (same per-visit rotation the Crowdfunding page uses).
  const [ctaAvatarSeed] = useState(() => {
    const key = "about_cta_avatar_rotation";
    let prev = 0;
    try { prev = parseInt(localStorage.getItem(key) || "0", 10) || 0; } catch { prev = 0; }
    const next = (prev + 1) % CTA_AVATARS.length;
    try { localStorage.setItem(key, String(next)); } catch { /* ignore */ }
    return next;
  });
  // Flanking the CTA — vehicle left, avatar right, exactly like the Crowdfunding page.
  const ctaVehicleSrc = CTA_VEHICLES[ctaAvatarSeed % CTA_VEHICLES.length];
  const ctaAvatarSrc = CTA_AVATARS[(ctaAvatarSeed + 3) % CTA_AVATARS.length];

  useEffect(() => { preloadImages([...CTA_AVATARS, ...CTA_VEHICLES]); }, []);
  const top = cms.about_top || {};

  const heroHeading = t("aboutPage.heroHeading") || top.heading;
  const bgImage = top.bg_image ? getImageUrl(top.bg_image) : aboutBg;
  const charImage = top.char_image ? getImageUrl(top.char_image) : charImg;


  const subtitle = t("aboutPage.subtitle", { returnObjects: true });
  const stats = t("aboutPage.stats", { returnObjects: true });
  const sec01 = t("aboutPage.section01", { returnObjects: true }) || {};
  const sec02 = t("aboutPage.section02", { returnObjects: true }) || {};
  const sec03 = t("aboutPage.section03", { returnObjects: true }) || {};
  const sec04 = t("aboutPage.section04", { returnObjects: true }) || {};

  const subtitleArr = Array.isArray(subtitle) ? subtitle : [];
  const statsArr = Array.isArray(stats) ? stats : [];
  const sec01Paras = Array.isArray(sec01.paras) ? sec01.paras : [];
  const sec01Games = Array.isArray(sec01.games) ? sec01.games : [];
  const sec03Games = Array.isArray(sec03.games) ? sec03.games : [];
  const sec04Cards = Array.isArray(sec04.cards) ? sec04.cards : [];
  const visionParas = Array.isArray(sec02.vision?.paras) ? sec02.vision.paras : [];
  const missionParas = Array.isArray(sec02.mission?.paras) ? sec02.mission.paras : [];

  return (
    <div className="relative text-white overflow-hidden" style={{ background: "#060610" }}>

      <GlowingOrb Xaxis={80} Yaxis={900} />
      <GlowingOrb Xaxis={1350} Yaxis={2200} />
      <GlowingOrb Xaxis={200} Yaxis={2800} />
      <GlowingOrb Xaxis={1200} Yaxis={3600} />
      <GlowingOrb Xaxis={100} Yaxis={4400} />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section
        data-edit-section="about_top"
        data-edit-label="About — Top Section"
        className="relative min-h-[90vh] flex items-start overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center top" }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(115deg,rgba(6,6,16,0.88) 0%,rgba(6,6,16,0.50) 55%,rgba(6,6,16,0.72) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom,transparent,#060610)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.4) 40%,rgba(56,189,248,0.4) 60%,transparent)" }} />

        <div className={`relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 xl:px-20 ${isPreview ? "pt-[72px]" : "pt-24"} pb-10 flex flex-col md:flex-row items-start gap-8`}>

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
                <span className="text-cyan-200 text-[11px] font-bold tracking-[0.25em] uppercase">{t("aboutPage.badge")}</span>
              </div>
              <h1 className="font-[Goldman] font-bold text-4xl md:text-5xl xl:text-[56px] uppercase text-white leading-[1.1] whitespace-nowrap">
                {heroHeading}
              </h1>
            </motion.div>

            <motion.div variants={fadeUp(0.1)} className="flex flex-col gap-2.5 max-w-[660px]"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
              {subtitleArr.map((para, i) => (
                <p key={i} className="text-white/70 text-sm md:text-[14px] leading-[1.9] text-justify">{para}</p>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp(0.2)} className="flex gap-3 mt-1 flex-wrap sm:flex-nowrap">
              {statsArr.map((s) => (
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
            className="hidden md:flex flex-shrink-0 justify-end items-start self-start"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <LazyImage
              src={charImage}
              alt="Character"
              fallback={charImg}
              className="h-[320px] md:h-[420px] lg:h-[510px] xl:h-[600px] w-auto"
              imgClassName="object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VISION & MISSION
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 pt-16 pb-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
        >
          <SectionLabel number="01" label={sec02.label || "Vision & Mission"} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

          {/* Vision Card */}
          <motion.div
            className="relative rounded-2xl p-7 flex flex-col gap-4 h-full"
            style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.18)", borderTop: "3px solid rgba(56,189,248,0.6)" }}
            initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
          >
            <CornerAccent color="rgba(56,189,248,0.4)" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="2.5" fill="#38bdf8" />
                  <circle cx="8" cy="8" r="6" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ fontFamily: "Orbitron, sans-serif", color: "#38bdf8" }}>
                {sec02.vision?.label || "Vision"}
              </span>
            </div>
            <p className="text-white/95 text-[15px] leading-relaxed font-medium pl-4 py-1"
              style={{ borderLeft: "2px solid rgba(56,189,248,0.55)" }}>
              {sec02.vision?.quote}
            </p>
            <div className="flex flex-col gap-4">
              {visionParas.map((p, i) => (
                <p key={i} className="text-white/80 text-sm leading-[1.9] text-justify">{p}</p>
              ))}
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            className="relative rounded-2xl p-7 flex flex-col gap-4 h-full"
            style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.18)", borderTop: "3px solid rgba(167,139,250,0.6)" }}
            initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
          >
            <CornerAccent color="rgba(167,139,250,0.4)" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.35)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="#a78bfa" strokeWidth="1.2" />
                  <circle cx="8" cy="8" r="2" fill="#a78bfa" />
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ fontFamily: "Orbitron, sans-serif", color: "#a78bfa" }}>
                {sec02.mission?.label || "Mission"}
              </span>
            </div>
            <p className="text-white/95 text-[15px] leading-relaxed font-medium pl-4 py-1"
              style={{ borderLeft: "2px solid rgba(167,139,250,0.55)" }}>
              {sec02.mission?.quote}
            </p>
            <div className="flex flex-col gap-4">
              {missionParas.map((p, i) => (
                <p key={i} className="text-white/80 text-sm leading-[1.9] text-justify">{p}</p>
              ))}
            </div>
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
              <LazyImage src="/about2.webp" alt="Our Mission" fallback={ourstory1}
                className="w-full h-full min-h-[280px]" imgClassName="object-cover" />
              <CornerAccent />
              <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ border: "1px solid rgba(56,189,248,0.18)" }} />
            </div>
          </motion.div>

          <motion.div className="flex-1 flex flex-col gap-5" variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <SectionLabel number="02" label={sec01.label || "Our Mission"} />
            <h2 className="font-[Goldman] font-bold text-4xl md:text-5xl xl:text-[56px] text-white leading-[1.1] uppercase">
              {sec01.heading1 || "Redefining What"}<br />{sec01.heading2 || "Gaming Can Be"}
            </h2>
            <div className="space-y-4">
              {sec01Paras.map((p, i) => (
                <p key={i} className="text-white/70 text-sm md:text-[14px] leading-[1.9] text-justify">{p}</p>
              ))}
            </div>
            {/* Game badges */}
            <div className="flex flex-wrap gap-3 mt-2">
              {sec01Games.map((g, i) => {
                const ba = GAME_BADGE_ACCENTS[i] || GAME_BADGE_ACCENTS[0];
                return (
                  <span key={g.label}
                    className="px-4 py-2 flex items-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${ba.glow}, rgba(255,255,255,0.04))`,
                      border: `1px solid ${ba.accent}55`,
                      borderLeft: `3px solid ${ba.accent}`,
                      borderRadius: 6,
                      fontFamily: "Orbitron,sans-serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      color: ba.accent,
                      textTransform: "uppercase",
                      boxShadow: `0 0 12px ${ba.glow}`,
                    }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: ba.accent, display: "inline-block", boxShadow: `0 0 6px ${ba.accent}` }} />
                    {g.label}
                  </span>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3 GAMES
      ══════════════════════════════════════════════════════ */}
      <section id="the-universe" className="relative w-full px-6 md:px-12 xl:px-20 pt-12 pb-4">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 14, fontWeight: "bold", color: "rgba(56,189,248,0.95)", letterSpacing: "0.35em", textShadow: "0 0 12px rgba(56,189,248,0.6)" }}>03</span>
              <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />
              <span className="text-white/70 text-[12px] font-bold tracking-[0.3em] uppercase">{sec03.label || "The Universe"}</span>
            </div>
            <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[36px] text-white">
              {sec03.heading || "Three Worlds. One Economy."}
            </h2>
            <p className="text-white/38 text-sm mt-2 max-w-lg mx-auto">
              {sec03.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sec03Games.map((game, i) => {
              const gs = GAMES_STATIC[i] || GAMES_STATIC[0];
              return (
                <motion.div
                  key={game.name}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.09 }}
                  viewport={{ once: true }}
                  onClick={() => isPreview ? navigate(`/preview/${gs.mode}`, { state: { backTo: "/preview/about" } }) : navigate(`/game/${gs.mode}`, { state: { backTo: "/about", section: "the-universe" } })}
                >
                  <div className="h-0.5 w-full" style={{ background: gs.accent }} />
                  <div className="relative h-44 overflow-hidden">
                    <img src={gs.img} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.style.opacity = "0.25"; }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,transparent 30%,rgba(6,6,16,0.97) 100%)" }} />
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: gs.accent, fontFamily: "Orbitron,sans-serif" }}>{game.tag}</p>
                    <h3 className="font-[Goldman] font-bold text-sm text-white mb-2 leading-snug">{game.name}</h3>
                    <p className="text-white/45 text-xs leading-relaxed mb-4">{game.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase transition-opacity group-hover:opacity-100 opacity-60"
                        style={{ color: gs.accent, fontFamily: "Orbitron,sans-serif" }}>
                        {sec03.discover || "Discover"} <ChevronRight className="w-3 h-3" />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(isPreview ? "/preview/ui" : "/gaming"); }}
                        className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded transition-all duration-200 hover:brightness-125"
                        style={{
                          fontFamily: "Orbitron,sans-serif",
                          background: `${gs.accent}18`,
                          border: `1px solid ${gs.accent}50`,
                          color: gs.accent,
                        }}
                      >
                        {sec03.tryUI || "Try the UI"}
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `inset 0 0 0 1px ${gs.accent}35, 0 8px 32px ${gs.glow}` }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          NFA QUICK SUMMARY
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full px-6 md:px-12 xl:px-20 pt-6 pb-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-10">
            <SectionLabel number="04" label={sec04.label || "Non-Fungible Digital Artworks"} />
            <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[36px] text-white leading-tight">
              {sec04.heading || "Digital Art With Guaranteed Value"}
            </h2>
            <p className="text-white/45 text-[12px] mt-2 tracking-[0.2em] uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>
              {sec04.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sec04Cards.map((card, i) => {
              const cs = NFA_CARDS_STATIC[i] || NFA_CARDS_STATIC[0];
              return (
                <motion.div
                  key={card.title}
                  className="relative rounded-2xl p-6 flex flex-col gap-4"
                  style={{ background: cs.glow, border: `1px solid ${cs.border}`, borderTop: `3px solid ${cs.accent}` }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cs.accent}18`, border: `1px solid ${cs.accent}45`, boxShadow: `0 0 10px ${cs.accent}20` }}>
                      <cs.Icon size={15} color={cs.accent} strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-[0.18em]"
                      style={{ fontFamily: "Orbitron, sans-serif", color: cs.accent }}>
                      {card.title}
                    </span>
                  </div>
                  {/* Card type: tiers */}
                  {cs.type === "tiers" && card.items && (
                    <div className="flex flex-col gap-2">
                      <p className="text-white/70 text-[13px] leading-relaxed">{card.intro}</p>
                      {card.items.map((r) => (
                        <div key={r.label} className="flex gap-2 text-[13px]">
                          <span className="font-bold text-white/90 flex-shrink-0">{r.label}</span>
                          <span className="text-white/60">{r.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Card type: value (bullets) */}
                  {cs.type === "value" && card.bullets && (
                    <ul className="flex flex-col gap-2">
                      {card.bullets.map((b) => (
                        <li key={b} className="flex gap-2 items-start">
                          <div className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0" style={{ background: cs.accent }} />
                          <span className="text-white/75 text-[13px] leading-relaxed font-semibold">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Card type: fair */}
                  {cs.type === "fair" && (
                    <p className="text-white/70 text-[13px] leading-[1.85]">{card.body}</p>
                  )}
                  {/* Card type: involved */}
                  {cs.type === "involved" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-white/70 text-[13px] leading-[1.85]">{card.body}</p>
                      <span className="text-[12px] font-bold" style={{ color: cs.accent, fontFamily: "Orbitron, sans-serif" }}>
                        {card.link}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.p
            className="text-center text-white/30 text-[12px] italic mt-10 leading-relaxed"
            style={{ fontFamily: "Orbitron, sans-serif" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}
          >
            {sec04.quote}
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          EARLY-ACCESS CTA
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full px-6 md:px-12 xl:px-20 pt-2 pb-6">
        <motion.div
          className="relative mt-0 py-8 md:py-10 text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 75% at 50% 42%, rgba(251,191,36,0.12) 0%, transparent 70%)" }} />

          <div className="relative">
            {/* Decorative left — vehicle (same size + per-visit rotation as the Crowdfunding page) */}
            <img
              src={ctaVehicleSrc}
              alt=""
              aria-hidden="true"
              className="hidden xl:block absolute top-1/2 select-none pointer-events-none"
              style={{ width: "clamp(320px, 38vw, 540px)", transform: "translateY(-50%)", left: "40px" }}
            />
            {/* Decorative right — avatar (same size as Crowdfunding, vertically centered with the vehicle) */}
            <img
              src={ctaAvatarSrc}
              alt=""
              aria-hidden="true"
              className="hidden xl:block absolute top-1/2 object-contain select-none pointer-events-none"
              style={{ width: "clamp(240px, 28vw, 400px)", right: "80px", transform: "translateY(-50%)" }}
            />

            <div className="relative w-full xl:px-[clamp(180px,28vw,420px)]">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px" style={{ background: "rgba(251,191,36,0.6)" }} />
                <span className="text-amber-300 text-[13px] md:text-[15px] font-bold uppercase tracking-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  LIMITED-TIME OPPORTUNITY
                </span>
                <div className="w-12 h-px" style={{ background: "rgba(251,191,36,0.6)" }} />
              </div>

              <h3 className="font-[Goldman] font-bold text-white text-3xl md:text-[44px] leading-tight mb-5 text-center">
                Don&apos;t Miss the Early-Access Window
              </h3>
              <div className="w-20 h-[3px] rounded-full mx-auto mb-10" style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }} />

              <ul className="flex flex-col gap-5 mb-9 text-left">
                {[
                  "Limited-edition NFAs and discounted packages are available now – only while early access stays open.",
                  "Discounts close for good the moment we launch our envisioned crowdfunding campaign.",
                  "Limited-edition items remain only until our funding target is reached – then they're gone for good.",
                ].map((b, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <ArrowRight size={20} color="#fbbf24" strokeWidth={2} className="mt-[3px] flex-shrink-0" />
                    <span className="text-white/80 text-[17px] md:text-[19px] leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              {!isPreview && (
                <div className="text-center mb-8">
                  <Link
                    to="/genesis"
                    onClick={() => window.scrollTo(0, 0)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[12px] md:text-[13px] font-bold uppercase tracking-[0.12em] text-[#0b0b14] transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", fontFamily: "Orbitron, sans-serif", boxShadow: "0 0 32px rgba(251,191,36,0.35)" }}
                  >
                    Learn More
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </Link>
                </div>
              )}

              <p className="text-white/60 text-[15px] md:text-[16px] leading-relaxed max-w-lg mx-auto text-center">
                Watch for updates, read the White Paper, and lock in early pricing before the crowd arrives.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

export default About;
