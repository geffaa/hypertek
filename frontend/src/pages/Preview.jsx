import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo1.png";

const GAME_STATIC = [
  { id: "racing",   path: "/preview/racing",   image: "/racing3.png",   accent: "#22c55e", glow: "rgba(34,197,94,0.45)" },
  { id: "quest",    path: "/preview/quest",    image: "/quest1.png",    accent: "#38bdf8", glow: "rgba(56,189,248,0.45)" },
  { id: "overlord", path: "/preview/overlord", image: "/overlord4.png", accent: "#f87171", glow: "rgba(248,113,113,0.45)" },
];

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
    <div
      className="relative text-white min-h-screen flex flex-col"
      style={{ background: "#060614" }}
    >
      {/* Background glow orbs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "rgba(0, 42, 168, 0.25)",
            filter: "blur(500px)",
            top: "-10%",
            left: "-10%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "rgba(0, 42, 168, 0.25)",
            filter: "blur(500px)",
            bottom: "-10%",
            right: "-10%",
          }}
        />
      </div>

      {/* Top accent line */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-50"
        style={{
          background: "linear-gradient(to right, transparent, #002AA8, transparent)",
          boxShadow: "0 0 24px rgba(0,42,168,0.6)",
        }}
      />

      {/* Minimal header with logo */}
      <header
        className="relative z-20 w-full"
        style={{
          background: "rgba(0, 17, 66, 0.55)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="w-full max-w-[1480px] mx-auto px-6 md:px-14 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Hyper Tek" className="h-10 w-10 md:h-12 md:w-12" />
            <div className="flex flex-col">
              <span
                className="text-white font-bold text-lg md:text-xl tracking-[0.2em] uppercase leading-tight"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                HYPER TEK
              </span>
              <span className="text-white/40 text-[9px] md:text-[10px] tracking-[0.3em] uppercase">
                Building Worlds, One Game At A Time
              </span>
            </div>
          </div>


        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 w-full max-w-[1480px] mx-auto px-6 md:px-14 xl:px-18 2xl:px-20">

        {/* Hero text */}
        <motion.div
          className="pt-16 md:pt-24 pb-10 md:pb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-bold text-blue-400 block mb-4"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            Explore Our Universe
          </span>
          <h1
            className="font-goldman uppercase text-3xl md:text-5xl xl:text-[56px] leading-tight mb-5"
            style={{ textShadow: "0 0 80px rgba(0,42,168,0.4)" }}
          >
            Choose Your Path
          </h1>
          <p className="text-white/50 text-[15px] md:text-[17px] max-w-[600px] mx-auto leading-relaxed">
            Three interconnected games, one shared universe. Click to discover the world that calls to you.
          </p>
        </motion.div>

        {/* ── DESKTOP: Accordion panels (exact copy from News.jsx) ── */}
        <div className="hidden md:flex gap-3 h-[520px] lg:h-[600px] pb-20">
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
                onClick={() => navigate(game.path)}
                onMouseEnter={() => setActive(game.id)}
                onMouseLeave={() => setActive(null)}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12 + 0.3 }}
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
                      onClick={(e) => { e.stopPropagation(); navigate(game.path); }}
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

        {/* ── MOBILE: Stacked cards ── */}
        <div className="flex md:hidden flex-col gap-4 pb-16">
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
              onClick={() => navigate(game.path)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
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
      </main>

      {/* Minimal footer */}
      <footer className="relative z-10 border-t border-white/6 py-8">
        <div className="w-full max-w-[1480px] mx-auto px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hyper Tek" className="h-6 w-6 opacity-60" />
            <span className="text-white/30 text-xs tracking-wider uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>
              Hyper Tek 100
            </span>
          </div>
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Hyper Tek 100. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
