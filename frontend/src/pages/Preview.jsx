import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo1.png";
import LanguageSwitcher from "../Components/Common/LanguageSwitcher";

/* ─── Skeleton shimmer keyframes (injected once) ──────── */
const shimmerCSS = `
@keyframes htShimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

const GAME_STATIC = [
  { id: "racing",   path: "/preview/racing",   image: "/racing3.png",   accent: "#22c55e", glow: "rgba(34,197,94,0.45)" },
  { id: "quest",    path: "/preview/quest",    image: "/quest1.png",    accent: "#38bdf8", glow: "rgba(56,189,248,0.45)" },
  { id: "overlord", path: "/preview/overlord", image: "/overlord4.png", accent: "#f87171", glow: "rgba(248,113,113,0.45)" },
];

/* ─── Hook: preload a single image ────────────────────── */
function useImageLoaded(src) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
    if (img.complete) setLoaded(true);
  }, [src]);
  return loaded;
}

/* ─── Skeleton overlay component ──────────────────────── */
function SkeletonOverlay() {
  return (
    <div
      className="absolute inset-0 z-[1]"
      style={{
        background: "linear-gradient(90deg, rgba(20,20,40,1) 0%, rgba(40,40,70,0.6) 50%, rgba(20,20,40,1) 100%)",
        backgroundSize: "800px 100%",
        animation: "htShimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

/* ─── Desktop card with skeleton ──────────────────────── */
function DesktopCard({ game, isActive, onEnter, onLeave, onClick, index, t }) {
  const loaded = useImageLoaded(game.image);

  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer rounded-lg"
      style={{
        flex: isActive ? "3 1 0%" : "1 1 0%",
        transition: "flex 0.55s cubic-bezier(0.4,0,0.2,1)",
        background: "#0a0a1a",
      }}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12 + 0.3 }}
    >
      {/* Skeleton shimmer while loading */}
      {!loaded && <SkeletonOverlay />}

      {/* Background image — fades in when loaded */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${game.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: loaded ? 1 : 0,
        }}
      />


      {/* Subtle bottom gradient for text readability */}
      <div
        className="absolute bottom-0 inset-x-0 h-40 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}
      />

      {/* Accent bar bottom */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2px] transition-all duration-500 z-[3]"
        style={{
          background: game.accent,
          boxShadow: isActive ? `0 0 40px 6px ${game.glow}` : `0 0 12px 2px ${game.glow}`,
          opacity: isActive ? 1 : 0.5,
        }}
      />

      {/* Accent top corner line */}
      <div
        className="absolute top-0 left-0 w-12 h-[2px] transition-opacity duration-500 z-[3]"
        style={{ background: game.accent, opacity: isActive ? 1 : 0.3 }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8 z-[4]">
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

        {/* Description + button */}
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
            onClick={(e) => { e.stopPropagation(); onClick(); }}
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
            {t("gaming.learnMore")}
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
            {t("gaming.hoverToExplore")}
          </span>
        </div>
      </div>

      {/* Vertical rotated label when collapsed */}
      <div
        className="absolute top-8 right-4 transition-opacity duration-300 pointer-events-none z-[4]"
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
}

/* ─── Mobile card with skeleton ───────────────────────── */
function MobileCard({ game, index, onClick }) {
  const loaded = useImageLoaded(game.image);

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg cursor-pointer"
      style={{ height: 200, background: "#0a0a1a" }}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
    >
      {/* Skeleton shimmer */}
      {!loaded && <SkeletonOverlay />}

      {/* Background image */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${game.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: loaded ? 1 : 0,
        }}
      />

      <div
        className="absolute bottom-0 inset-x-0 h-[2px] z-[3]"
        style={{ background: game.accent, boxShadow: `0 0 20px ${game.glow}` }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-5 z-[4]">
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
  );
}

/* ─── Main export ─────────────────────────────────────── */
export default function Preview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const rawGames = t("gaming.games", { returnObjects: true });
  const GAMES = GAME_STATIC.map((s, i) => ({
    ...s,
    label:       (Array.isArray(rawGames) && rawGames[i]?.label)       || s.id.toUpperCase(),
    tagline:     (Array.isArray(rawGames) && rawGames[i]?.tagline)     || "",
    description: (Array.isArray(rawGames) && rawGames[i]?.description) || "",
  }));

  return (
    <div className="relative text-white min-h-screen flex flex-col" style={{ background: "#060614" }}>
      {/* Inject shimmer keyframes */}
      <style>{shimmerCSS}</style>

      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0, 42, 168, 0.25)", filter: "blur(500px)", top: "-10%", left: "-10%" }} />
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0, 42, 168, 0.25)", filter: "blur(500px)", bottom: "-10%", right: "-10%" }} />
      </div>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-50" style={{ background: "linear-gradient(to right, transparent, #002AA8, transparent)", boxShadow: "0 0 24px rgba(0,42,168,0.6)" }} />


      {/* Main content */}
      <main className="relative z-10 flex-1 w-full max-w-[1480px] mx-auto px-6 md:px-14 xl:px-18 2xl:px-20 flex flex-col justify-center py-10">

        {/* ── Top brand bar ───────────────────────────────── */}
        <motion.div
          className="pb-6 md:pb-8 flex justify-between items-start"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-8 md:gap-12">
            {/* Logo + HYPER TEK */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="relative">
                <img src={logo} alt="Hyper Tek" className="h-10 w-10 md:h-12 md:w-12 relative z-[1]" />
                <div className="absolute inset-0" style={{ background: "rgba(0,60,220,0.45)", filter: "blur(16px)", borderRadius: "50%" }} />
              </div>
              <span
                className="text-white font-extrabold tracking-[0.22em] uppercase"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(1rem, 1.4vw, 1.25rem)" }}
              >
                HYPER TEK
              </span>
            </div>

            {/* Vertical rule */}
            <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(100,160,255,0.5), transparent)" }} />

            {/* Explore Our Universe + description */}
            <div className="flex flex-col gap-1">
              <span
                className="text-[9px] md:text-[10px] tracking-[0.45em] uppercase font-bold"
                style={{ fontFamily: "Orbitron, sans-serif", color: "#93c5fd" }}
              >
                {t("gaming.preview.exploreUniverse", "Explore Our Universe")}
              </span>
              <p className="text-white/80 text-[13px] md:text-[14px] leading-snug">
                {t("gaming.preview.subtitle", "Three interconnected games, one shared universe.")}{" "}
                <span className="text-white/55">{t("gaming.preview.subtitleClick", "Click to discover the world that calls to you.")}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/waitlist"
              className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 border border-white/25 hover:border-white/40 rounded-lg transition-all duration-200"
              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Waitlist
            </a>
            <LanguageSwitcher />
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px w-full mb-6 md:mb-8" style={{ background: "linear-gradient(to right, transparent, rgba(0,80,220,0.5) 30%, rgba(0,80,220,0.5) 70%, transparent)" }} />

        {/* DESKTOP: Accordion panels */}
        <div className="hidden md:flex gap-3 h-[520px] lg:h-[580px]">
          {GAMES.map((game, i) => (
            <DesktopCard
              key={game.id}
              game={game}
              isActive={active === game.id}
              onEnter={() => setActive(game.id)}
              onLeave={() => setActive(null)}
              onClick={() => navigate(game.path)}
              index={i}
              t={t}
            />
          ))}
        </div>

        {/* MOBILE: Stacked cards */}
        <div className="flex md:hidden flex-col gap-4">
          {GAMES.map((game, i) => (
            <MobileCard key={game.id} game={game} index={i} onClick={() => navigate(game.path)} />
          ))}
        </div>

        {/* ── Section links divider ───────────────────────── */}
        <motion.div
          className="mt-8 md:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(0,80,220,0.4))" }} />
            <span
              className="text-[9px] tracking-[0.5em] uppercase font-bold"
              style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(147,197,253,0.6)" }}
            >
              {t("gaming.preview.exploreMore", "Explore More")}
            </span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(0,80,220,0.4))" }} />
          </div>

          {/* Section cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* About Us */}
            <motion.button
              onClick={() => navigate("/preview/about")}
              className="relative overflow-hidden rounded-lg text-left group"
              style={{
                background: "rgba(10,10,30,0.8)",
                border: "1px solid rgba(56,189,248,0.18)",
                borderTop: "2px solid rgba(56,189,248,0.45)",
                boxShadow: "0 0 30px rgba(56,189,248,0.06)",
                padding: "24px 28px",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(56,189,248,0.04)" }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-5 h-[2px] rounded" style={{ background: "#38bdf8" }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.35em]"
                      style={{ fontFamily: "Orbitron, sans-serif", color: "#38bdf8" }}
                    >
                      {t("gaming.preview.aboutLabel", "About Us")}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: "Goldman, sans-serif" }}>
                    {t("gaming.preview.aboutHeading", "Our Story & Vision")}
                  </h3>
                  <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                    {t("gaming.preview.aboutDesc", "Discover the team, mission, and roadmap behind Hyper Tek 100.")}
                  </p>
                </div>
                <div
                  className="ml-6 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)" }}
                >
                  <span style={{ color: "#38bdf8", fontSize: 18 }}>→</span>
                </div>
              </div>
            </motion.button>

            {/* Gaming UI */}
            <motion.button
              onClick={() => navigate("/preview/ui")}
              className="relative overflow-hidden rounded-lg text-left group"
              style={{
                background: "rgba(10,10,30,0.8)",
                border: "1px solid rgba(167,139,250,0.18)",
                borderTop: "2px solid rgba(167,139,250,0.45)",
                boxShadow: "0 0 30px rgba(167,139,250,0.06)",
                padding: "24px 28px",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(167,139,250,0.04)" }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-5 h-[2px] rounded" style={{ background: "#a78bfa" }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.35em]"
                      style={{ fontFamily: "Orbitron, sans-serif", color: "#a78bfa" }}
                    >
                      {t("gaming.preview.uiLabel", "Game Interface")}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: "Goldman, sans-serif" }}>
                    {t("gaming.preview.uiHeading", "Interactive UI Preview")}
                  </h3>
                  <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                    {t("gaming.preview.uiDesc", "Experience the full game dashboard. Racing, Quest, and Overlord modes.")}
                  </p>
                </div>
                <div
                  className="ml-6 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)" }}
                >
                  <span style={{ color: "#a78bfa", fontSize: 18 }}>→</span>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Minimal footer */}
      <footer className="relative z-10 border-t border-white/6 py-8">
        <div className="w-full max-w-[1480px] mx-auto px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hyper Tek" className="h-6 w-6 opacity-60" />
            <span className="text-white/30 text-xs tracking-wider uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>Hyper Tek 100</span>
          </div>
          <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} Hyper Tek 100. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
