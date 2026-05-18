import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GAME_STATIC = [
  { id: "racing",   path: "/game/racing",   image: "/racing3.png",   accent: "#22c55e", glow: "rgba(34,197,94,0.45)" },
  { id: "quest",    path: "/game/quest",    image: "/quest1.png",    accent: "#38bdf8", glow: "rgba(56,189,248,0.45)" },
  { id: "overlord", path: "/game/overlord", image: "/overlord4.png", accent: "#f87171", glow: "rgba(248,113,113,0.45)" },
];




export default function News() {
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
    <section id="gaming-section" className="w-full pt-4 md:pt-6 pb-12 md:pb-20 relative">
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
            {t("gaming.sectionTitle")}
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



      </div>
    </section>
  );
}
