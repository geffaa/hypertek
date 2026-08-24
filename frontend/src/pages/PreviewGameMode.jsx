import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo1.webp";
import { VIDEO_BASE_URL } from "../Config";
import LanguageSwitcher from "../Components/Common/LanguageSwitcher";
import StarMapOverlay from "../Components/Gaming/StarMap";

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
    panelImg: "/racing3.webp",
    videoSrc: `${VIDEO_BASE_URL}/racing_content.mp4`,
  },
  quest: {
    rich: true,
    isQuest: true,
    accent: "#38bdf8",
    accentDim: "rgba(56,189,248,0.12)",
    glow: "rgba(56,189,248,0.25)",
    panelImg: "/quest1.webp",
    videoSrc: `${VIDEO_BASE_URL}/quest_video2.webm`,
  },
  overlord: {
    rich: true,
    upgradesBeforeRewards: true,
    accent: "#f87171",
    accentDim: "rgba(248,113,113,0.12)",
    glow: "rgba(248,113,113,0.25)",
    panelImg: "/overlord4.webp",
    videoSrc: `${VIDEO_BASE_URL}/overlord_content.mp4`,
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
function VideoSection({ src, accent, isQuest }) {
  const [videoReady, setVideoReady] = useState(false);
  const mimeType = src?.endsWith(".webm") ? "video/webm" : "video/mp4";
  return (
    <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pb-24">
      <motion.div
        variants={fadeUp} custom={0} initial="hidden"
        whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Title above video (Quest only) */}
        {isQuest && (
          <h2
            className="font-goldman uppercase text-2xl md:text-3xl xl:text-4xl tracking-wide text-center"
            style={{
              color: accent,
              textShadow: `0 0 40px ${accent}88, 0 0 80px ${accent}44`,
              fontFamily: "Goldman, sans-serif",
            }}
          >
            Galactic Mapping System
          </h2>
        )}

        <div
          className="relative rounded-xl overflow-hidden w-full"
          style={{ border: `1px solid ${accent}44`, boxShadow: `0 0 32px ${accent}18` }}
        >
          <div className="absolute top-0 inset-x-0 h-[2px] z-10" style={{ background: accent }} />
          {!videoReady && (
            <div className="relative w-full" style={{ height: "540px", maxHeight: "56vw" }}>
              <SkeletonOverlay />
            </div>
          )}
          <video
            controls
            playsInline
            preload="metadata"
            x-webkit-airplay="allow"
            onLoadedMetadata={() => setVideoReady(true)}
            style={{
              width: "100%", display: videoReady ? "block" : "none",
              background: "#000", maxHeight: "540px",
            }}
          >
            <source src={src} type={mimeType} />
          </video>
        </div>
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
  const [mapOpen, setMapOpen] = useState(false);

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
      {data.videoSrc && <VideoSection src={data.videoSrc} accent={accent} isQuest={data.isQuest} />}

      {/* Interactive Map (Quest only) */}
      {data.isQuest && (
        <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pb-24">
          <style>{`
            @keyframes mapPulseP {
              0%,100% { box-shadow: 0 0 24px ${accent}55, 0 0 60px ${accent}22; }
              50%      { box-shadow: 0 0 40px ${accent}99, 0 0 100px ${accent}44; }
            }
            @keyframes mapBtnPulseP {
              0%,100% { box-shadow: 0 0 18px ${accent}66; }
              50%      { box-shadow: 0 0 36px ${accent}cc, 0 0 60px ${accent}55; }
            }
            @keyframes scanLineP {
              0%   { top: 0%; opacity: 0.5; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>
          <motion.div
            variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.15 }}
            className="relative overflow-hidden"
            style={{
              borderRadius: 14,
              border: `1.5px solid ${accent}55`,
              animation: "mapPulseP 3s ease-in-out infinite",
            }}
          >
            <div style={{ position:"absolute", inset:0, backgroundImage:"url('/UI Globe Map_Fixed3.webp')", backgroundSize:"cover", backgroundPosition:"center", opacity:0.22 }} />
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg, rgba(2,6,22,0.92) 0%, rgba(0,20,45,0.75) 50%, rgba(2,6,22,0.92) 100%)` }} />
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(to right, transparent, ${accent}, transparent)`, boxShadow:`0 0 16px ${accent}` }} />
            <div style={{ position:"absolute", left:0, right:0, height:2, background:`linear-gradient(to right, transparent, ${accent}44, transparent)`, animation:"scanLineP 4s linear infinite" }} />

            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 p-10 md:p-14">
              <div className="flex-1 flex flex-col gap-5">
                <div style={{ fontFamily:"Orbitron, sans-serif", fontSize:"clamp(8px,0.75vw,10px)", fontWeight:"bold", letterSpacing:"0.35em", color:accent, opacity:0.7 }}>
                  ◈ {t("gamePage.interactiveMapLabel", "QUEST FEATURE")}
                </div>
                <h2 className="font-goldman uppercase text-2xl md:text-3xl xl:text-4xl leading-tight" style={{ color:"#fff", textShadow:`0 0 40px ${accent}88` }}>
                  {t("gamePage.interactiveMap", "INTERACTIVE STAR MAP")}
                </h2>
                <div className="flex flex-wrap gap-3 mt-1">
                  {["30+ Locations", "Planet Details", "Hazard Levels", "Mission Briefings"].map(tag => (
                    <span key={tag} style={{ fontFamily:"Orbitron, sans-serif", fontSize:"clamp(6px,0.6vw,8px)", padding:"3px 10px", letterSpacing:"0.12em", border:`1px solid ${accent}44`, color:`${accent}bb`, background:`${accent}10`, borderRadius:2 }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 shrink-0">
                <button
                  onClick={() => setMapOpen(true)}
                  style={{
                    padding:"14px 36px",
                    background:`linear-gradient(135deg, ${accent}33, ${accent}18)`,
                    border:`2px solid ${accent}`,
                    borderRadius:4,
                    clipPath:"polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
                    fontFamily:"Orbitron, sans-serif",
                    fontSize:"clamp(9px,0.95vw,12px)", fontWeight:"bold",
                    letterSpacing:"0.2em", color:"#fff",
                    textShadow:`0 0 14px ${accent}`,
                    animation:"mapBtnPulseP 2.5s ease-in-out infinite",
                    cursor:"pointer", whiteSpace:"nowrap",
                    transition:"background 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background=`${accent}55`; e.currentTarget.style.transform="scale(1.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background=`linear-gradient(135deg, ${accent}33, ${accent}18)`; e.currentTarget.style.transform="scale(1)"; }}
                >
                  ◈ {t("gamePage.openMap", "OPEN INTERACTIVE MAP")}
                </button>
                <div style={{ fontFamily:"Orbitron, sans-serif", fontSize:"clamp(6px,0.6vw,8px)", color:"rgba(255,255,255,0.3)", letterSpacing:"0.12em" }}>
                  {t("gamePage.mapHint", "CLICK TO EXPLORE THE GALAXY")}
                </div>
              </div>
            </div>
          </motion.div>
          {mapOpen && <StarMapOverlay onClose={() => setMapOpen(false)} />}
        </section>
      )}

      {/* Callout Banner */}
      <div className="relative overflow-hidden py-16 md:py-20" style={{ background: `linear-gradient(to right, rgba(6,6,20,0.95), ${accentDim} 50%, rgba(6,6,20,0.95))`, borderTop: `1px solid ${accent}22`, borderBottom: `1px solid ${accent}22` }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 50%, ${accentDim} 0%, transparent 70%)` }} />
        <div className="relative text-center px-6">
          <motion.p variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide" style={{ color: accent, textShadow: `0 0 40px ${accent}` }}>{data.calloutLine1}</motion.p>
          <motion.p variants={fadeUp} custom={0.3} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide mt-1" style={{ color: "rgba(255,255,255,0.9)", textShadow: `0 0 30px ${glow}` }}>{data.calloutLine2}</motion.p>
        </div>
      </div>

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

      {/* Fixed bar with back + mode tag + actions */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="fixed left-0 right-0 z-40" style={{ top: 0 }}>
        <div style={{ background: `linear-gradient(to right, rgba(6,6,20,0.65), ${data.accentDim} 50%, rgba(6,6,20,0.65))`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${data.accent}33`, boxShadow: "0 4px 24px rgba(0,0,0,0.45)" }}>
          <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${data.accent}55, transparent)` }} />
          <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-[12px] flex items-center gap-3 flex-wrap">

            {/* Logo */}
            <img src={logo} alt="Hyper Tek" className="h-7 w-7 shrink-0" />

            <div className="w-px h-4 bg-white/15 shrink-0" />

            {/* Mode tag */}
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-[5px] shrink-0" style={{ fontFamily: "Orbitron, sans-serif", border: `1px solid ${data.accent}55`, borderTop: `2px solid ${data.accent}`, color: data.accent, background: data.accentDim, clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)", textShadow: `0 0 12px ${data.accent}88` }}>
              {data.label} MODE
            </div>

            <div className="flex-1" />

            {/* ── Primary: Back to UI Interface ── */}
            <button
              onClick={() => navigate("/preview/ui", { state: { startMode: modeKey.toUpperCase() } })}
              className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase shrink-0 transition-all duration-200"
              style={{
                fontFamily: "Orbitron, sans-serif",
                color: "#000",
                background: data.accent,
                border: `1px solid ${data.accent}`,
                padding: "7px 16px 7px 12px",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                boxShadow: `0 0 18px ${data.accent}55`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${data.accent}cc`; e.currentTarget.style.boxShadow = `0 0 28px ${data.accent}88`; }}
              onMouseLeave={e => { e.currentTarget.style.background = data.accent; e.currentTarget.style.boxShadow = `0 0 18px ${data.accent}55`; }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M5 8h6M8 5l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("gamePage.backToUIInterface", "BACK TO UI INTERFACE")}
            </button>

            {/* ── Secondary: Back (browser back) ── */}
            <button
              onClick={() => navigate("/preview")}
              className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase shrink-0 transition-all duration-200"
              style={{
                fontFamily: "Orbitron, sans-serif",
                color: "rgba(255,255,255,0.55)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "7px 14px 7px 10px",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t("gamePage.back")}
            </button>

            <div className="w-px h-4 bg-white/10 shrink-0" />
            <LanguageSwitcher />
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
