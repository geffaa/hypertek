import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layers3, Rocket, Network, Gem } from "lucide-react";
import logo from "../assets/logo1.png";
import About from "./about";
import LanguageSwitcher from "../Components/Common/LanguageSwitcher";

const PILLAR_STATIC = [
  { Icon: Layers3, accent: "#38bdf8", glow: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.3)",  key: "pillar1" },
  { Icon: Gem,     accent: "#fbbf24", glow: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.35)", key: "pillar2" },
  { Icon: Network, accent: "#818cf8", glow: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.3)", key: "pillar3" },
  { Icon: Rocket,  accent: "#4ade80", glow: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.3)",  key: "pillar4" },
];

const PILLAR_DEFAULTS = {
  pillar1: { title: "Web3 Technology",  desc: "On-chain assets, real ownership, and a transparent marketplace built on Base." },
  pillar2: { title: "True Asset Value", desc: "Every in-game item is a tradeable asset. Play, earn, and own your progress." },
  pillar3: { title: "Fair Ecosystem",   desc: "Commission splits and buyback mechanics designed to reward every participant." },
  pillar4: { title: "Get Involved",     desc: "From early investors to active players. Multiple pathways to join the Hyper Tek universe." },
};

export default function PreviewAbout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showFullAbout, setShowFullAbout] = useState(false);

  return (
    <div className="relative text-white min-h-screen flex flex-col" style={{ background: "#060614" }}>
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.25)", filter: "blur(500px)", top: "-10%", left: "-10%" }} />
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.25)", filter: "blur(500px)", bottom: "-10%", right: "-10%" }} />
      </div>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-50" style={{ background: "linear-gradient(to right, transparent, #002AA8, transparent)", boxShadow: "0 0 24px rgba(0,42,168,0.6)" }} />

      <main className="relative z-10 flex-1 w-full max-w-[1480px] mx-auto px-6 md:px-14 xl:px-18 2xl:px-20 flex flex-col justify-center py-10">

        {/* ── Brand bar ── */}
        <motion.div
          className="pb-6 md:pb-8 flex justify-between items-start"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-8 md:gap-12">
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="relative">
                <img src={logo} alt="Hyper Tek" className="h-10 w-10 md:h-12 md:w-12 relative z-[1]" />
                <div className="absolute inset-0" style={{ background: "rgba(0,60,220,0.45)", filter: "blur(16px)", borderRadius: "50%" }} />
              </div>
              <span className="text-white font-extrabold tracking-[0.22em] uppercase" style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(1rem, 1.4vw, 1.25rem)" }}>
                HYPER TEK
              </span>
            </div>

            <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(100,160,255,0.5), transparent)" }} />

            <div className="flex flex-col gap-1">
              <span className="text-[9px] md:text-[10px] tracking-[0.45em] uppercase font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#38bdf8" }}>
                {t("gaming.preview.aboutLabel", "About Us")}
              </span>
              <p className="text-white/80 text-[13px] md:text-[14px] leading-snug">
                {t("gaming.preview.aboutPageSubtitle", "The team, mission, and vision.")}{" "}
                <span className="text-white/55">{t("gaming.preview.aboutPageSubtitleSpan", "Building the future of Web3 gaming.")}</span>
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </motion.div>

        {/* Divider */}
        <div className="h-px w-full mb-6 md:mb-8" style={{ background: "linear-gradient(to right, transparent, rgba(0,80,220,0.5) 30%, rgba(0,80,220,0.5) 70%, transparent)" }} />

        {/* ── Hero: About Us Showcase ── */}
        <motion.div
          className="relative overflow-hidden rounded-lg"
          style={{
            background: "#08081a",
            border: "1px solid rgba(56,189,248,0.15)",
            borderTop: "2px solid rgba(56,189,248,0.5)",
            boxShadow: "0 0 60px rgba(56,189,248,0.06)",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ background: "#38bdf8" }} />
          <div className="absolute top-0 left-0 w-[2px] h-16" style={{ background: "#38bdf8" }} />

          {/* Ambient radial glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,0.07) 0%, transparent 70%)" }} />

          <div className="relative z-10 px-8 md:px-14 lg:px-16 py-12 md:py-14">

            {/* Label */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-6 h-[2px]" style={{ background: "#38bdf8" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.45em]" style={{ fontFamily: "Orbitron, sans-serif", color: "#38bdf8" }}>
                {t("gaming.preview.aboutHeading", "Our Story & Vision")}
              </span>
            </motion.div>

            {/* Mission statement */}
            <motion.h2
              className="font-bold leading-[1.15] mb-5"
              style={{
                fontFamily: "Goldman, sans-serif",
                fontSize: "clamp(1.6rem, 3vw, 2.6rem)",
                color: "#fff",
                maxWidth: 760,
                textShadow: "0 0 40px rgba(56,189,248,0.2)",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.45 }}
            >
              {t("gaming.preview.aboutHeroTitle1", "Reimagining Gaming.")}<br />
              <span style={{ color: "#38bdf8" }}>{t("gaming.preview.aboutHeroTitle2", "Powered by Web3.")}</span>
            </motion.h2>

            <motion.p
              className="text-white/60 leading-relaxed mb-10"
              style={{ fontSize: "clamp(0.82rem, 1.1vw, 0.95rem)", maxWidth: 600 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52 }}
            >
              {t("gaming.preview.aboutHeroDesc", "Hyper Tek 100 is a next-generation gaming ecosystem where every asset is real, every trade is on-chain, and every player is a true stakeholder. Three interconnected games. One shared economy. Built for the future.")}
            </motion.p>

            {/* Pillars grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {PILLAR_STATIC.map((pillar, i) => {
                const { Icon, accent, glow, border, key } = pillar;
                const defaults = PILLAR_DEFAULTS[key];
                return (
                  <motion.div
                    key={key}
                    className="relative rounded-lg p-5"
                    style={{ background: glow, border: `1px solid ${border}`, borderTop: `2px solid ${accent}` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: glow, border: `1px solid ${border}` }}
                    >
                      <Icon size={18} color={accent} />
                    </div>
                    <h4 className="text-white font-bold mb-1.5" style={{ fontFamily: "Orbitron, sans-serif", fontSize: 11, letterSpacing: "0.08em" }}>
                      {t(`gaming.preview.${key}Title`, defaults.title)}
                    </h4>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {t(`gaming.preview.${key}Desc`, defaults.desc)}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.button
              onClick={() => setShowFullAbout(true)}
              className="flex items-center gap-3 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-200 hover:brightness-125 active:scale-[0.98]"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(56,189,248,0.5)",
                borderTop: "2px solid rgba(56,189,248,0.85)",
                color: "#38bdf8",
                fontFamily: "Orbitron, sans-serif",
                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                boxShadow: "0 0 32px rgba(56,189,248,0.2)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ boxShadow: "0 0 48px rgba(56,189,248,0.35)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{t("gaming.preview.aboutDiscoverBtn", "Discover Our Story")}</span>
              <span style={{ fontSize: 16 }}>&#x2192;</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Shortcut section ── */}
        <motion.div
          className="mt-8 md:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(0,80,220,0.4))" }} />
            <span className="text-[9px] tracking-[0.5em] uppercase font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(147,197,253,0.6)" }}>
              {t("gaming.preview.exploreMore", "Explore More")}
            </span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(0,80,220,0.4))" }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gaming Info */}
            <motion.button
              onClick={() => navigate("/preview")}
              className="relative overflow-hidden rounded-lg text-left group"
              style={{
                background: "rgba(10,10,30,0.8)",
                border: "1px solid rgba(34,197,94,0.18)",
                borderTop: "2px solid rgba(34,197,94,0.45)",
                boxShadow: "0 0 30px rgba(34,197,94,0.06)",
                padding: "24px 28px",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(34,197,94,0.04)" }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-5 h-[2px] rounded" style={{ background: "#22c55e" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ fontFamily: "Orbitron, sans-serif", color: "#22c55e" }}>
                      {t("gaming.preview.gamingInfoLabel", "Gaming Info")}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: "Goldman, sans-serif" }}>
                    {t("gaming.preview.gamingInfoHeading", "Explore The Games")}
                  </h3>
                  <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                    {t("gaming.preview.gamingInfoDesc", "Racing, Quest, and Overlord. Discover each game world in detail.")}
                  </p>
                </div>
                <div className="ml-6 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <span style={{ color: "#22c55e", fontSize: 18 }}>&#x2192;</span>
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ fontFamily: "Orbitron, sans-serif", color: "#a78bfa" }}>
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
                <div className="ml-6 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)" }}>
                  <span style={{ color: "#a78bfa", fontSize: 18 }}>&#x2192;</span>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 py-8">
        <div className="w-full max-w-[1480px] mx-auto px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hyper Tek" className="h-6 w-6 opacity-60" />
            <span className="text-white/30 text-xs tracking-wider uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>Hyper Tek 100</span>
          </div>
          <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} Hyper Tek 100. All Rights Reserved.</p>
        </div>
      </footer>

      {/* ── Full About overlay ── */}
      <AnimatePresence>
        {showFullAbout && (
          <motion.div
            className="fixed inset-0 z-[9999] overflow-y-auto"
            style={{ background: "#060614" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="fixed top-0 left-0 right-0 z-[10000] flex items-center justify-between px-6 md:px-12 py-3"
              style={{
                background: "rgba(6,6,20,0.9)",
                backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(56,189,248,0.12)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img src={logo} alt="Hyper Tek" className="h-7 w-7 relative z-[1]" />
                  <div className="absolute inset-0" style={{ background: "rgba(0,60,220,0.4)", filter: "blur(10px)", borderRadius: "50%" }} />
                </div>
                <span className="text-white font-extrabold tracking-[0.22em] uppercase text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  HYPER TEK
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="w-4 h-[1px]" style={{ background: "rgba(56,189,248,0.5)" }} />
                <span className="text-[10px] tracking-[0.4em] uppercase font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(56,189,248,0.8)" }}>
                  {t("gaming.preview.aboutLabel", "About Us")}
                </span>
              </div>

              <button
                onClick={() => setShowFullAbout(false)}
                className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-125"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  borderTop: "2px solid rgba(56,189,248,0.6)",
                  color: "rgba(56,189,248,0.9)",
                  fontFamily: "Orbitron, sans-serif",
                  clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                }}
              >
                &#x2190; Back
              </button>
            </div>

            <div style={{ paddingTop: "52px" }}>
              <About isPreview />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
