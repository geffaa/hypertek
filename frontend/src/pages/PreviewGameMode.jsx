import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo1.png";
import LanguageSwitcher from "../Components/Common/LanguageSwitcher";

/* ─── Skeleton shimmer keyframes ──────────────────────── */
const shimmerCSS = `
@keyframes htShimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

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
      className="absolute inset-0"
      style={{
        background: "linear-gradient(90deg, rgba(20,20,40,1) 0%, rgba(40,40,70,0.6) 50%, rgba(20,20,40,1) 100%)",
        backgroundSize: "800px 100%",
        animation: "htShimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

/* ─── Static visual data ────────────────────────────────── */
const MODES_STATIC = {
  racing: {
    rich: true,
    accent: "#22c55e",
    accentDim: "rgba(34,197,94,0.12)",
    glow: "rgba(34,197,94,0.3)",
    panelImg: "/racing3.png",
    videoSrc: "/video/racing_content.mp4",
  },
  quest: {
    rich: true,
    accent: "#38bdf8",
    accentDim: "rgba(56,189,248,0.12)",
    glow: "rgba(56,189,248,0.25)",
    panelImg: "/quest1.png",
  },
  overlord: {
    rich: true,
    upgradesBeforeRewards: true,
    accent: "#f87171",
    accentDim: "rgba(248,113,113,0.12)",
    glow: "rgba(248,113,113,0.25)",
    panelImg: "/overlord4.png",
    videoSrc: "/video/overlord_content.mp4",
  },
};

/* ─── Framer variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Video section with skeleton ─────────────────── */
function VideoSection({ src, accent }) {
  const [videoReady, setVideoReady] = useState(false);
  return (
    <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pb-24">
      <motion.div
        variants={fadeUp} custom={0} initial="hidden"
        whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        className="relative rounded-xl overflow-hidden"
        style={{ border: `1px solid ${accent}44`, boxShadow: `0 0 32px ${accent}18` }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] z-10" style={{ background: accent }} />
        {/* Skeleton while video loads */}
        {!videoReady && (
          <div className="relative w-full" style={{ height: "540px", maxHeight: "56vw" }}>
            <SkeletonOverlay />
          </div>
        )}
        <video
          src={src} controls playsInline preload="metadata"
          onLoadedData={() => setVideoReady(true)}
          style={{
            width: "100%", display: videoReady ? "block" : "none",
            background: "#000", maxHeight: "540px",
          }}
        />
      </motion.div>
    </section>
  );
}

/* ─── Background image with skeleton ──────────────────── */
function BackgroundImage({ panelImg, glow }) {
  const loaded = useImageLoaded(panelImg);
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Skeleton shimmer while loading */}
      {!loaded && <SkeletonOverlay />}
      {/* Actual background — fades in */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${panelImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: loaded ? 1 : 0,
        }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(6,6,20,0.78)" }} />
      <div className="absolute inset-0" style={{ background: glow, mixBlendMode: "screen" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(6,6,20,0.7) 100%)" }} />
    </div>
  );
}

/* ─── FAQ accordion item ──────────────────────────────────── */
function FaqItem({ item, accent, accentDim, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} custom={index * 0.5} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        style={{ borderBottom: `1px solid rgba(255,255,255,${open ? "0.12" : "0.06"})` }}
      >
        <span className="text-[15px] font-semibold transition-colors duration-200" style={{ color: open ? accent : "rgba(255,255,255,0.85)" }}>{item.q}</span>
        <span
          className="shrink-0 w-6 h-6 flex items-center justify-center border text-[13px] transition-all duration-300"
          style={{ borderColor: open ? accent : "rgba(255,255,255,0.2)", color: open ? accent : "rgba(255,255,255,0.4)", background: open ? accentDim : "transparent", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >+</span>
      </button>
      <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: open ? "400px" : "0px" }}>
        <p className="py-5 text-white/60 text-[14px] leading-[1.85]">{item.a}</p>
      </div>
    </motion.div>
  );
}

/* ─── Section renderer helpers ─────────────────────────── */
function StepsSection({ data, title, glow, accent, accentDim, items }) {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: "rgba(6,6,20,0.55)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
        <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
          <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>{title}</h2>
        </motion.div>
        <div className="flex flex-col gap-0">
          {items.map((item, i) => (
            <motion.div key={item.title || item.num} variants={fadeUp} custom={i * 0.7} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="group py-10 border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-start gap-6 md:gap-10">
                <span className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none" style={{ color: `${accent}70`, fontVariantNumeric: "tabular-nums", textShadow: `0 0 20px ${accent}44` }}>{item.num || String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 pt-1">
                  <h3 className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4" style={{ color: "rgba(255,255,255,0.92)" }}>{item.title}</h3>
                  <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Detail page content ──────────────────────────────── */
function DetailContent({ data }) {
  const { accent, glow, accentDim } = data;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* Intro */}
      <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-36 pb-24">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" className="mb-2">
          <span className="text-[11px] tracking-[0.35em] uppercase font-bold" style={{ color: accent, fontFamily: "Orbitron, sans-serif" }}>{t("gamePage.welcomeTo")}</span>
        </motion.div>
        <motion.h1 variants={fadeUp} custom={0.5} initial="hidden" animate="visible" className="font-goldman uppercase text-5xl md:text-6xl xl:text-[72px] leading-[1.05] mb-8" style={{ textShadow: `0 0 80px ${glow}, 0 2px 12px rgba(0,0,0,0.95)` }}>{data.heading}</motion.h1>
        <motion.p variants={fadeUp} custom={1} initial="hidden" animate="visible" className="text-[18px] md:text-[20px] italic leading-snug mb-12" style={{ color: accent, textShadow: `0 0 16px ${accent}66`, maxWidth: 620 }}>{data.subtitle}</motion.p>
        <div className="flex flex-col gap-7">
          {data.intro?.map((para, i) => (
            <motion.p key={i} variants={fadeUp} custom={i + 2} initial="hidden" animate="visible" className="text-white/70 text-[16px] leading-[1.95]">{para}</motion.p>
          ))}
          {data.introClose && (
            <motion.p variants={fadeUp} custom={(data.intro?.length || 0) + 2} initial="hidden" animate="visible" className="text-white/40 text-[15px] italic pt-2">{data.introClose}</motion.p>
          )}
        </div>
      </section>

      {/* Video */}
      {data.videoSrc && <VideoSection src={data.videoSrc} accent={accent} />}

      {/* How It Works */}
      {data.howItWorks && (
        <section className="relative py-24" style={{ background: "rgba(6,6,20,0.6)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>{data.howItWorksTitle || `How ${data.heading} Works`}</h2>
            </motion.div>
            <div className="flex flex-col gap-0">
              {data.howItWorks.map((item, i) => (
                <motion.div key={item.num} variants={fadeUp} custom={i * 0.8} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="relative flex gap-8 md:gap-14 pb-16 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="font-goldman text-[13px] w-12 h-12 flex items-center justify-center shrink-0" style={{ border: `1px solid ${accent}`, color: accent, background: accentDim, boxShadow: `0 0 20px ${accentDim}` }}>{item.num}</div>
                    {i < data.howItWorks.length - 1 && <div className="flex-1 w-px mt-3" style={{ background: `linear-gradient(to bottom, ${accent}44, transparent)` }} />}
                  </div>
                  <div className="pt-2 pb-2">
                    <h3 className="font-goldman uppercase text-xl md:text-2xl tracking-wide mb-4" style={{ color: "rgba(255,255,255,0.95)" }}>{item.title}</h3>
                    <p className="text-white/62 text-[15px] leading-[1.9]">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Extra Section (e.g. Battle Ring) */}
      {data.extraSection && (
        <StepsSection data={data} title={data.extraSection.title} glow={glow} accent={accent} accentDim={accentDim} items={data.extraSection.items} />
      )}

      {/* Callout Banner */}
      <div className="relative overflow-hidden py-16 md:py-20" style={{ background: `linear-gradient(to right, rgba(6,6,20,0.95), ${accentDim} 50%, rgba(6,6,20,0.95))`, borderTop: `1px solid ${accent}22`, borderBottom: `1px solid ${accent}22` }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 50%, ${accentDim} 0%, transparent 70%)` }} />
        <div className="relative text-center px-6">
          <motion.p variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide" style={{ color: accent, textShadow: `0 0 40px ${accent}` }}>{data.calloutLine1}</motion.p>
          <motion.p variants={fadeUp} custom={0.3} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide mt-1" style={{ color: "rgba(255,255,255,0.9)", textShadow: `0 0 30px ${glow}` }}>{data.calloutLine2}</motion.p>
        </div>
      </div>

      {/* Upgrades (before rewards for Overlord) */}
      {data.upgradesBeforeRewards && data.upgrades && (
        <StepsSection data={data} title={data.upgradesTitle} glow={glow} accent={accent} accentDim={accentDim} items={data.upgrades} />
      )}

      {/* Rewards */}
      {data.rewards && (
        <section className="relative py-24 overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>{data.rewardsTitle}</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.rewards.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i * 0.5} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="p-8 flex flex-col gap-4" style={{ background: "rgba(6,6,20,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderTop: `2px solid ${accent}` }}>
                  <h3 className="font-goldman uppercase text-base md:text-lg tracking-wide" style={{ color: accent }}>{item.title}</h3>
                  <p className="text-white/60 text-[14px] leading-[1.9]">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upgrades (after rewards for Racing/Quest) */}
      {!data.upgradesBeforeRewards && data.upgrades && (
        <StepsSection data={data} title={data.upgradesTitle} glow={glow} accent={accent} accentDim={accentDim} items={data.upgrades} />
      )}

      {/* FAQ */}
      {data.faq && (
        <section className="py-24">
          <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-14">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>{data.faqTitle}</h2>
            </motion.div>
            <div>
              {data.faq.map((item, i) => (
                <FaqItem key={item.q} item={item} accent={accent} accentDim={accentDim} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────── */
export default function PreviewGameMode() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const backTo = location.state?.backTo || "/preview";
  const modeKey = mode?.toLowerCase() || "racing";
  const staticData = MODES_STATIC[modeKey] || MODES_STATIC.racing;
  const textData = t(`gamePage.${modeKey}`, { returnObjects: true }) || {};
  const data = { ...staticData, ...textData };

  return (
    <div className="relative text-white min-h-screen" style={{ background: "#060614" }}>
      {/* Inject shimmer keyframes */}
      <style>{shimmerCSS}</style>

      {/* Fixed background image with skeleton */}
      <BackgroundImage panelImg={data.panelImg} glow={data.glow} />

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[3px] pointer-events-none" style={{ background: `linear-gradient(to right, transparent, ${data.accent}, transparent)`, boxShadow: `0 0 24px ${data.accent}`, zIndex: 100 }} />

      {/* Fixed bar with back + mode tag */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="fixed left-0 right-0 z-40" style={{ top: 0 }}>
        <div style={{ background: `linear-gradient(to right, rgba(6,6,20,0.55), ${data.accentDim} 50%, rgba(6,6,20,0.55))`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${data.accent}22`, boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
          <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 py-[14px] flex items-center gap-4 justify-between">
            {/* Logo */}
            <img src={logo} alt="Hyper Tek" className="h-8 w-8 mr-2" />

            {/* Back button → smart back based on entry point */}
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase transition-all duration-200 group"
              style={{ fontFamily: "Orbitron, sans-serif", color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", padding: "6px 14px 6px 10px", clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t("gamePage.back")}
            </button>

            <div className="w-px h-4 bg-white/15" />

            {/* Mode tag */}
            <div className="text-[11px] font-bold tracking-[0.3em] uppercase px-4 py-[5px]" style={{ fontFamily: "Orbitron, sans-serif", border: `1px solid ${data.accent}55`, borderTop: `2px solid ${data.accent}`, color: data.accent, background: data.accentDim, clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)", textShadow: `0 0 12px ${data.accent}88` }}>
              {data.label} MODE
            </div>

            <div className="ml-auto">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scrollable content */}
      <div className="relative z-10">
        <DetailContent data={data} />
      </div>

      {/* Minimal footer */}
      <footer className="relative z-10 border-t border-white/6 py-8">
        <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
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
