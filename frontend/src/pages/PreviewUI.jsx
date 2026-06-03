import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import Gaming from "./Gaming";
import LanguageSwitcher from "../Components/Common/LanguageSwitcher";

const GAME_THUMBS = [
  { image: "/racing3.png",   accent: "#22c55e", glow: "rgba(34,197,94,0.5)",    label: "Racing"   },
  { image: "/quest1.png",    accent: "#38bdf8", glow: "rgba(56,189,248,0.5)",   label: "Quest"    },
  { image: "/overlord4.png", accent: "#f87171", glow: "rgba(248,113,113,0.5)",  label: "Overlord" },
];

export default function PreviewUI() {
  const navigate = useNavigate();
  const [showFullUI, setShowFullUI] = useState(false);

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
              <span className="text-[9px] md:text-[10px] tracking-[0.45em] uppercase font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#a78bfa" }}>
                Game Interface
              </span>
              <p className="text-white/80 text-[13px] md:text-[14px] leading-snug">
                The full-spectrum gaming dashboard.{" "}
                <span className="text-white/55">Three modes. One immersive experience.</span>
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </motion.div>

        {/* Divider */}
        <div className="h-px w-full mb-6 md:mb-8" style={{ background: "linear-gradient(to right, transparent, rgba(0,80,220,0.5) 30%, rgba(0,80,220,0.5) 70%, transparent)" }} />

        {/* ── Hero: Gaming Interface Showcase ── */}
        <motion.div
          className="relative overflow-hidden rounded-lg"
          style={{
            minHeight: "520px",
            background: "#08081a",
            border: "1px solid rgba(167,139,250,0.15)",
            borderTop: "2px solid rgba(167,139,250,0.5)",
            boxShadow: "0 0 60px rgba(167,139,250,0.06)",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          {/* Corner accent — top left */}
          <div className="absolute top-0 left-0 w-16 h-[2px]" style={{ background: "#a78bfa" }} />
          <div className="absolute top-0 left-0 w-[2px] h-16" style={{ background: "#a78bfa" }} />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(167,139,250,0.09) 0%, transparent 70%)" }} />

          {/* Content: split on desktop, stacked on mobile */}
          <div className="relative z-10 flex flex-col md:flex-row h-full min-h-[520px]">

            {/* Left: text + CTA */}
            <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 md:py-0 flex-1">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.4 }}
              >
                {/* Label */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-[2px]" style={{ background: "#a78bfa" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.45em]" style={{ fontFamily: "Orbitron, sans-serif", color: "#a78bfa" }}>
                    Interactive Preview
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="font-bold leading-[1.1] mb-4"
                  style={{
                    fontFamily: "Goldman, sans-serif",
                    fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                    color: "#fff",
                    textShadow: "0 0 40px rgba(167,139,250,0.3)",
                  }}
                >
                  The Gaming<br />
                  <span style={{ color: "#a78bfa" }}>Interface</span>
                </h2>

                {/* Description */}
                <p className="text-white/60 leading-relaxed mb-8" style={{ fontSize: "clamp(0.82rem, 1.1vw, 0.95rem)", maxWidth: 400 }}>
                  Step inside the full Hyper Tek 100 dashboard. Switch between Racing, Quest, and Overlord modes — each with its own live marketplace, NFT inventory, and real-time earnings view.
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap gap-3 mb-10">
                  {["3 Game Modes", "Web3 Native", "Live Trading", "NFT Inventory"].map((stat) => (
                    <span
                      key={stat}
                      className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{
                        fontFamily: "Orbitron, sans-serif",
                        background: "rgba(167,139,250,0.08)",
                        border: "1px solid rgba(167,139,250,0.22)",
                        color: "rgba(167,139,250,0.85)",
                        borderRadius: 4,
                      }}
                    >
                      {stat}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  onClick={() => setShowFullUI(true)}
                  className="flex items-center gap-3 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-200 hover:brightness-125 active:scale-[0.98]"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(167,139,250,0.5)",
                    borderTop: "2px solid rgba(167,139,250,0.85)",
                    color: "#a78bfa",
                    fontFamily: "Orbitron, sans-serif",
                    clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                    boxShadow: "0 0 32px rgba(167,139,250,0.2)",
                  }}
                  whileHover={{ boxShadow: "0 0 48px rgba(167,139,250,0.35)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Launch Interface</span>
                  <span style={{ fontSize: 16 }}>→</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Right: game mode thumbnails */}
            <div className="flex flex-row md:flex-col justify-center items-center gap-3 px-8 md:px-10 py-8 md:py-12 shrink-0 md:w-[280px] lg:w-[320px]">
              {GAME_THUMBS.map((g, i) => (
                <motion.div
                  key={g.label}
                  className="relative overflow-hidden rounded-md cursor-pointer group"
                  style={{
                    width: "100%",
                    height: 120,
                    background: "#0a0a1a",
                    border: `1px solid ${g.accent}22`,
                    borderBottom: `2px solid ${g.accent}66`,
                    flexShrink: 0,
                  }}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  onClick={() => setShowFullUI(true)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      backgroundImage: `url(${g.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.55,
                    }}
                  />
                  <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity duration-300" style={{ background: `${g.glow.replace("0.5", "0.08")}` }} />
                  <div className="absolute inset-0 flex items-end p-3 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-[2px]" style={{ background: g.accent }} />
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: g.accent, fontFamily: "Orbitron, sans-serif" }}>
                        {g.label}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-[2px]" style={{ background: g.accent, boxShadow: `0 0 12px ${g.glow}` }} />
                </motion.div>
              ))}
            </div>
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
              Explore More
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
                      Gaming Info
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: "Goldman, sans-serif" }}>
                    Explore The Games
                  </h3>
                  <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                    Racing, Quest, and Overlord — discover each game world in detail.
                  </p>
                </div>
                <div className="ml-6 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <span style={{ color: "#22c55e", fontSize: 18 }}>→</span>
                </div>
              </div>
            </motion.button>

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
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(56,189,248,0.04)" }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-5 h-[2px] rounded" style={{ background: "#38bdf8" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ fontFamily: "Orbitron, sans-serif", color: "#38bdf8" }}>
                      About Us
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg md:text-xl leading-tight" style={{ fontFamily: "Goldman, sans-serif" }}>
                    Our Story & Vision
                  </h3>
                  <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                    Discover the team, mission, and roadmap behind Hyper Tek 100.
                  </p>
                </div>
                <div className="ml-6 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)" }}>
                  <span style={{ color: "#38bdf8", fontSize: 18 }}>→</span>
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

      {/* ── Full-screen Gaming overlay ── */}
      <AnimatePresence>
        {showFullUI && (
          <motion.div
            className="fixed inset-0 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Gaming isPreview />
            <motion.div
              className="fixed top-4 left-4 z-[10000]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 2.5 }}
            >
              <button
                onClick={() => setShowFullUI(false)}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-125"
                style={{
                  background: "rgba(6,6,20,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(167,139,250,0.4)",
                  borderTop: "2px solid rgba(167,139,250,0.65)",
                  color: "rgba(167,139,250,0.9)",
                  fontFamily: "Orbitron, sans-serif",
                  clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                  boxShadow: "0 0 20px rgba(167,139,250,0.15)",
                }}
              >
                <img src={logo} alt="" className="h-4 w-4" />
                ← Back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
