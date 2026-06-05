import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo1.png";
import Gaming from "./Gaming";
import LanguageSwitcher from "../Components/Common/LanguageSwitcher";

export default function PreviewUI() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative text-white min-h-screen flex flex-col" style={{ background: "#060614" }}>
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.25)", filter: "blur(500px)", top: "-10%", left: "-10%" }} />
        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.25)", filter: "blur(500px)", bottom: "-10%", right: "-10%" }} />
      </div>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-50" style={{ background: "linear-gradient(to right, transparent, #002AA8, transparent)", boxShadow: "0 0 24px rgba(0,42,168,0.6)" }} />

      {/* ── Brand bar ── */}
      <div
        className="relative w-full"
        style={{
          zIndex: 10,
          background: "rgba(6,6,20,0.95)",
          borderBottom: "1px solid rgba(0,80,220,0.25)",
        }}
      >
        <div className="w-full max-w-[1480px] mx-auto px-6 md:px-14 xl:px-18 2xl:px-20">
          <motion.div
            className="py-4 flex items-center"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-8 md:gap-12">
              <div className="flex items-center gap-3.5 shrink-0">
                <div className="relative">
                  <img src={logo} alt="Hyper Tek" className="h-9 w-9 md:h-10 md:w-10 relative z-[1]" />
                  <div className="absolute inset-0" style={{ background: "rgba(0,60,220,0.45)", filter: "blur(16px)", borderRadius: "50%" }} />
                </div>
                <span className="text-white font-extrabold tracking-[0.22em] uppercase" style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(1rem, 1.4vw, 1.25rem)" }}>
                  HYPER TEK
                </span>
              </div>

              <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, rgba(100,160,255,0.5), transparent)" }} />

              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] md:text-[10px] tracking-[0.45em] uppercase font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#a78bfa" }}>
                  {t("gaming.preview.uiLabel", "Game Interface")}
                </span>
                <p className="text-white/80 text-[12px] md:text-[13px] leading-snug">
                  {t("gaming.preview.uiPageSubtitle", "The full-spectrum gaming dashboard.")}{" "}
                  <span className="text-white/55">{t("gaming.preview.uiPageSubtitleSpan", "Three modes. One immersive experience.")}</span>
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
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
        </div>
        {/* Divider */}
        <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(0,80,220,0.5) 30%, rgba(0,80,220,0.5) 70%, transparent)" }} />
      </div>

      {/* ── Gaming UI content ── */}
      <div className="relative z-10">
        <Gaming isPreview />
      </div>

      {/* ── Shortcut section ── */}
      <div className="relative z-10 w-full max-w-[1480px] mx-auto px-6 md:px-14 xl:px-18 2xl:px-20 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
              transition={{ duration: 0.5, delay: 0.5 }}
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
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(56,189,248,0.04)" }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-5 h-[2px] rounded" style={{ background: "#38bdf8" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ fontFamily: "Orbitron, sans-serif", color: "#38bdf8" }}>
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
                <div className="ml-6 shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)" }}>
                  <span style={{ color: "#38bdf8", fontSize: 18 }}>&#x2192;</span>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

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
    </div>
  );
}
