import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import StarMapOverlay from "../Components/Gaming/StarMap";

/* ─── Static visual data only ────────────────────────────────── */
const MODES_STATIC = {
  racing: {
    rich: true,
    accent: "#22c55e",
    accentDim: "rgba(34,197,94,0.12)",
    glow: "rgba(34,197,94,0.3)",
    panelImg: "/racing3.webp",
    videoSrc: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/racing_content.mp4",
  },
  quest: {
    rich: true,
    isQuest: true,
    accent: "#38bdf8",
    accentDim: "rgba(56,189,248,0.12)",
    glow: "rgba(56,189,248,0.25)",
    panelImg: "/quest1.webp",
    videoSrc: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/quest_video2.webm",
  },
  overlord: {
    rich: true,
    upgradesBeforeRewards: true,
    accent: "#f87171",
    accentDim: "rgba(248,113,113,0.12)",
    glow: "rgba(248,113,113,0.25)",
    panelImg: "/overlord4.webp",
    videoSrc: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/overlord_content.mp4",
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

/* ─── Inline video section ────────────────────────────────── */
function VideoSection({ src, accent }) {
  const mimeType = src?.endsWith(".webm") ? "video/webm" : "video/mp4";
  return (
    <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pb-24">
      <motion.div
        variants={fadeUp} custom={0} initial="hidden"
        whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        className="relative rounded-xl overflow-hidden"
        style={{ border: `1px solid ${accent}44`, boxShadow: `0 0 32px ${accent}18` }}
      >
        <div className="absolute top-0 inset-x-0 h-[2px] z-10" style={{ background: accent }} />
        <video
          controls
          playsInline
          preload="metadata"
          x-webkit-airplay="allow"
          style={{ width: "100%", display: "block", background: "#000", maxHeight: "540px" }}
        >
          <source src={src} type={mimeType} />
        </video>
      </motion.div>
    </section>
  );
}

/* ─── FAQ accordion item ──────────────────────────────────── */
function FaqItem({ item, accent, accentDim, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp} custom={index * 0.5} initial="hidden"
      whileInView="visible" viewport={{ once: true, amount: 0.2 }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        style={{ borderBottom: `1px solid rgba(255,255,255,${open ? "0.12" : "0.06"})` }}
      >
        <span
          className="text-[15px] font-semibold transition-colors duration-200"
          style={{ color: open ? accent : "rgba(255,255,255,0.85)" }}
        >
          {item.q}
        </span>
        <span
          className="shrink-0 w-6 h-6 flex items-center justify-center border text-[13px] transition-all duration-300"
          style={{
            borderColor: open ? accent : "rgba(255,255,255,0.2)",
            color: open ? accent : "rgba(255,255,255,0.4)",
            background: open ? accentDim : "transparent",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-500"
        style={{ maxHeight: open ? "400px" : "0px" }}
      >
        <p className="py-5 text-white/60 text-[14px] leading-[1.85]">{item.a}</p>
      </div>
    </motion.div>
  );
}

/* ─── Rich detail page (Racing & Quest) ──────────────────── */
function DetailPage({ data }) {
  const { accent, glow, accentDim } = data;
  const { t } = useTranslation();
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="flex flex-col">

      {/* ═══ SECTION 1 — Welcome / Intro ════════════════════════ */}
      <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-36 pb-24">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" className="mb-2">
          <span
            className="text-[11px] tracking-[0.35em] uppercase font-bold"
            style={{ color: accent, fontFamily: "Orbitron, sans-serif" }}
          >
            {t("gamePage.welcomeTo")}
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp} custom={0.5} initial="hidden" animate="visible"
          className="font-goldman uppercase text-5xl md:text-6xl xl:text-[72px] leading-[1.05] mb-8"
          style={{ textShadow: `0 0 80px ${glow}, 0 2px 12px rgba(0,0,0,0.95)` }}
        >
          {data.heading}
        </motion.h1>

        <motion.p
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
          className="text-[18px] md:text-[20px] italic leading-snug mb-12"
          style={{ color: accent, textShadow: `0 0 16px ${accent}66`, maxWidth: 620 }}
        >
          {data.subtitle}
        </motion.p>

        <div className="flex flex-col gap-7">
          {data.intro.map((para, i) => (
            <motion.p
              key={i}
              variants={fadeUp} custom={i + 2} initial="hidden" animate="visible"
              className="text-white/70 text-[16px] leading-[1.95]"
            >
              {para}
            </motion.p>
          ))}

          {data.introClose && (
            <motion.p
              variants={fadeUp} custom={data.intro.length + 2} initial="hidden" animate="visible"
              className="text-white/40 text-[15px] italic pt-2"
            >
              {data.introClose}
            </motion.p>
          )}
        </div>
      </section>

      {/* ═══ VIDEO PREVIEW (if available for this mode) ══════════ */}
      {data.videoSrc && (
        <VideoSection src={data.videoSrc} accent={accent} accentDim={accentDim} />
      )}

      {/* ═══ INTERACTIVE MAP (Quest only) ═══════════════════════ */}
      {data.isQuest && (
        <section className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pb-24">
          <style>{`
            @keyframes mapPulse {
              0%,100% { box-shadow: 0 0 24px ${accent}55, 0 0 60px ${accent}22; }
              50%      { box-shadow: 0 0 40px ${accent}99, 0 0 100px ${accent}44; }
            }
            @keyframes mapBtnPulse {
              0%,100% { box-shadow: 0 0 18px ${accent}66; }
              50%      { box-shadow: 0 0 36px ${accent}cc, 0 0 60px ${accent}55; }
            }
            @keyframes scanLine {
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
              animation: "mapPulse 3s ease-in-out infinite",
            }}
          >
            {/* Map preview as background */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "url('/UI Globe Map_Fixed3.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.22,
            }} />
            {/* Dark overlay gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, rgba(2,6,22,0.92) 0%, rgba(0,20,45,0.75) 50%, rgba(2,6,22,0.92) 100%)`,
            }} />
            {/* Accent top bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, transparent, ${accent}, transparent)`, boxShadow: `0 0 16px ${accent}` }} />
            {/* Scan line animation */}
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: `linear-gradient(to right, transparent, ${accent}44, transparent)`,
              animation: "scanLine 4s linear infinite",
            }} />

            {/* Content */}
            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 p-10 md:p-14">

              {/* Left — text */}
              <div className="flex-1 flex flex-col gap-5">
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(8px,0.75vw,10px)", fontWeight: "bold", letterSpacing: "0.35em", color: accent, opacity: 0.7 }}>
                  ◈ {t("gamePage.interactiveMapLabel", "QUEST FEATURE")}
                </div>
                <h2 className="font-goldman uppercase text-2xl md:text-3xl xl:text-4xl leading-tight"
                  style={{ color: "#fff", textShadow: `0 0 40px ${accent}88` }}>
                  {t("gamePage.interactiveMap", "INTERACTIVE STAR MAP")}
                </h2>
                <div className="flex flex-wrap gap-3 mt-1">
                  {["30+ Locations", "Planet Details", "Hazard Levels", "Mission Briefings"].map(tag => (
                    <span key={tag} style={{
                      fontFamily: "Orbitron, sans-serif", fontSize: "clamp(6px,0.6vw,8px)",
                      padding: "3px 10px", letterSpacing: "0.12em",
                      border: `1px solid ${accent}44`, color: `${accent}bb`,
                      background: `${accent}10`, borderRadius: 2,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Right — CTA button */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <button
                  onClick={() => setMapOpen(true)}
                  style={{
                    padding: "14px 36px",
                    background: `linear-gradient(135deg, ${accent}33, ${accent}18)`,
                    border: `2px solid ${accent}`,
                    borderRadius: 4,
                    clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "clamp(9px,0.95vw,12px)", fontWeight: "bold",
                    letterSpacing: "0.2em", color: "#fff",
                    textShadow: `0 0 14px ${accent}`,
                    animation: "mapBtnPulse 2.5s ease-in-out infinite",
                    cursor: "pointer", whiteSpace: "nowrap",
                    transition: "background 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${accent}55`; e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${accent}33, ${accent}18)`; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  ◈ {t("gamePage.openMap", "OPEN INTERACTIVE MAP")}
                </button>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(6px,0.6vw,8px)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
                  {t("gamePage.mapHint", "CLICK TO EXPLORE THE GALAXY")}
                </div>
              </div>

            </div>
          </motion.div>
          {mapOpen && <StarMapOverlay onClose={() => setMapOpen(false)} />}
        </section>
      )}

      {/* ═══ SECTION 2 — How It Works ═══════════════════════════ */}
      <section
        className="relative py-24"
        style={{ background: "rgba(6,6,20,0.6)", borderTop: `1px solid rgba(255,255,255,0.05)`, borderBottom: `1px solid rgba(255,255,255,0.05)` }}
      >
        <div className="absolute right-0 top-0 select-none pointer-events-none font-goldman leading-none"
          style={{ fontSize: "clamp(140px, 20vw, 260px)", color: "rgba(255,255,255,0.02)", lineHeight: 1 }}>
          HOW
        </div>
        <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.howItWorksTitle || `How ${data.heading} Works`}
            </h2>
          </motion.div>
          <div className="flex flex-col gap-0">
            {data.howItWorks.map((item, i) => (
              <motion.div key={item.num} variants={fadeUp} custom={i * 0.8} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="relative flex gap-8 md:gap-14 pb-16 last:pb-0">
                <div className="flex flex-col items-center shrink-0">
                  <div className="font-goldman text-[13px] w-12 h-12 flex items-center justify-center shrink-0"
                    style={{ border: `1px solid ${accent}`, color: accent, background: accentDim, boxShadow: `0 0 20px ${accentDim}` }}>
                    {item.num}
                  </div>
                  {i < data.howItWorks.length - 1 && (
                    <div className="flex-1 w-px mt-3"
                      style={{ background: `linear-gradient(to bottom, ${accent}44, transparent)` }} />
                  )}
                </div>
                <div className="pt-2 pb-2">
                  <h3 className="font-goldman uppercase text-xl md:text-2xl tracking-wide mb-4"
                    style={{ color: "rgba(255,255,255,0.95)" }}>{item.title}</h3>
                  <p className="text-white/62 text-[15px] leading-[1.9]">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EXTRA SECTION (optional — e.g. Battle Ring for Overlord) ══ */}
      {data.extraSection && (
        <section className="relative py-24 overflow-hidden"
          style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <div className="absolute left-0 bottom-0 select-none pointer-events-none font-goldman leading-none"
            style={{ fontSize: "clamp(120px, 16vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>
            RING
          </div>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
                {data.extraSection.title}
              </h2>
            </motion.div>
            <div className="flex flex-col gap-0">
              {data.extraSection.items.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i * 0.7} initial="hidden"
                  whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                  className="group py-10 border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-6 md:gap-10">
                    <span className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none"
                      style={{ color: `${accent}70`, textShadow: `0 0 20px ${accent}44`, fontVariantNumeric: "tabular-nums" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4"
                        style={{ color: "rgba(255,255,255,0.92)" }}>{item.title}</h3>
                      <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CALLOUT BANNER ════════════════════════════════════ */}
      <div className="relative overflow-hidden py-16 md:py-20"
        style={{ background: `linear-gradient(to right, rgba(6,6,20,0.95), ${accentDim} 50%, rgba(6,6,20,0.95))`,
          borderTop: `1px solid ${accent}22`, borderBottom: `1px solid ${accent}22` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${accentDim} 0%, transparent 70%)` }} />
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}88, transparent)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}88, transparent)` }} />
        <div className="relative text-center px-6">
          <motion.p variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.5 }}
            className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide"
            style={{ color: accent, textShadow: `0 0 40px ${accent}` }}>
            {data.calloutLine1}
          </motion.p>
          <motion.p variants={fadeUp} custom={0.3} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.5 }}
            className="font-goldman uppercase text-2xl md:text-4xl xl:text-5xl tracking-wide mt-1"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: `0 0 30px ${glow}` }}>
            {data.calloutLine2}
          </motion.p>
        </div>
      </div>

      {/* ═══ UPGRADES — first for Overlord ═════════════════════ */}
      {data.upgradesBeforeRewards && (
        <section
          className="relative py-24 overflow-hidden"
          style={{ background: "rgba(6,6,20,0.55)", borderBottom: `1px solid rgba(255,255,255,0.05)` }}
        >
          <div className="absolute right-0 bottom-0 select-none pointer-events-none font-goldman leading-none"
            style={{ fontSize: "clamp(100px, 15vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>UP</div>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
                {data.upgradesTitle}
              </h2>
            </motion.div>
            <div className="flex flex-col gap-0">
              {data.upgrades.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i * 0.7} initial="hidden"
                  whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                  className="group py-10 border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-6 md:gap-10">
                    <span className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none"
                      style={{ color: `${accent}70`, fontVariantNumeric: "tabular-nums", textShadow: `0 0 20px ${accent}44` }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4"
                        style={{ color: "rgba(255,255,255,0.92)" }}>{item.title}</h3>
                      <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ REWARDS ════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <div className="absolute left-0 top-0 select-none pointer-events-none font-goldman leading-none"
          style={{ fontSize: "clamp(100px, 15vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>WIN</div>
        <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.rewardsTitle}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.rewards.map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i * 0.5} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                className="p-8 flex flex-col gap-4"
                style={{ background: "rgba(6,6,20,0.7)", border: `1px solid rgba(255,255,255,0.06)`, borderTop: `2px solid ${accent}` }}>
                <h3 className="font-goldman uppercase text-base md:text-lg tracking-wide"
                  style={{ color: accent }}>{item.title}</h3>
                <p className="text-white/60 text-[14px] leading-[1.9]">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ UPGRADES — after rewards for Racing/Quest ══════════ */}
      {!data.upgradesBeforeRewards && (
        <section
          className="relative py-24 overflow-hidden"
          style={{ background: "rgba(6,6,20,0.55)", borderBottom: `1px solid rgba(255,255,255,0.05)` }}
        >
          <div className="absolute right-0 bottom-0 select-none pointer-events-none font-goldman leading-none"
            style={{ fontSize: "clamp(100px, 15vw, 220px)", color: "rgba(255,255,255,0.018)", lineHeight: 1 }}>UP</div>
          <div className="relative w-full max-w-[1080px] mx-auto px-6 md:px-12">
            <motion.div variants={fadeUp} custom={0} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-16">
              <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
                {data.upgradesTitle}
              </h2>
            </motion.div>
            <div className="flex flex-col gap-0">
              {data.upgrades.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} custom={i * 0.7} initial="hidden"
                  whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                  className="group py-10 border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-6 md:gap-10">
                    <span className="shrink-0 font-goldman text-[36px] md:text-[48px] leading-none select-none"
                      style={{ color: `${accent}70`, fontVariantNumeric: "tabular-nums", textShadow: `0 0 20px ${accent}44` }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 pt-1">
                      <h3 className="font-goldman uppercase text-lg md:text-xl tracking-wide mb-4"
                        style={{ color: "rgba(255,255,255,0.92)" }}>{item.title}</h3>
                      <p className="text-white/60 text-[15px] leading-[1.9]">{item.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FAQ ACCORDION ══════════════════════════════════════ */}
      <section className="py-24">
        <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12">
          <motion.div variants={fadeUp} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mb-14">
            <h2 className="font-goldman uppercase text-3xl md:text-4xl xl:text-5xl" style={{ textShadow: `0 0 50px ${glow}` }}>
              {data.faqTitle}
            </h2>
          </motion.div>
          <div>
            {data.faq.map((item, i) => (
              <FaqItem key={item.q} item={item} accent={accent} accentDim={accentDim} index={i} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

/* ─── Simple page (Quest / Overlord) ─────────────────────── */
function SimplePage({ data }) {
  const { accent } = data;
  return (
    <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pb-24 flex flex-col gap-6 text-center items-center">
      <p className="text-white/80 text-[17px] leading-[1.9] max-w-[620px]">{data.description}</p>
      <div className="w-full flex flex-col gap-5 mt-8 text-left">
        {data.sections.map((s) => (
          <div
            key={s.title}
            className="p-7"
            style={{
              background: "rgba(6,6,16,0.65)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: `3px solid ${accent}`,
            }}
          >
            <h2 className="font-goldman uppercase text-xl tracking-wide mb-2" style={{ color: accent }}>{s.title}</h2>
            <p className="text-white/60 text-[16px] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────── */
export default function GameModePage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const modeKey = mode?.toLowerCase() || "racing";
  const staticData = MODES_STATIC[modeKey] || MODES_STATIC.racing;
  const textData = t(`gamePage.${modeKey}`, { returnObjects: true }) || {};
  const data = { ...staticData, ...textData };

  return (
    <div className="relative text-white min-h-screen" style={{ background: "#060614" }}>

      {/* ── Fixed background image (no attachment:fixed glitch) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${data.panelImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* dark base */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(6,6,20,0.78)" }}
        />
        {/* accent tint */}
        <div
          className="absolute inset-0"
          style={{ background: data.glow, mixBlendMode: "screen" }}
        />
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(6,6,20,0.7) 100%)" }}
        />
      </div>

      {/* Top accent line */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${data.accent}, transparent)`,
          boxShadow: `0 0 24px ${data.accent}`,
          zIndex: 100,
        }}
      />

      {/* ── Fixed back / mode bar — always visible below navbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed left-0 right-0 z-40"
        style={{ top: "var(--navbar-h, 72px)" }}
      >
        <div style={{
          background: `linear-gradient(to right, rgba(6,6,20,0.55), ${data.accentDim} 50%, rgba(6,6,20,0.55))`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${data.accent}22`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        }}>
          {/* accent line at bottom of bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{ background: `linear-gradient(to right, transparent, ${data.accent}55, transparent)` }} />

          <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 py-[12px] flex items-center gap-3 flex-wrap">
            {/* Mode tag */}
            <div
              className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-[5px] shrink-0"
              style={{
                fontFamily: "Orbitron, sans-serif",
                border: `1px solid ${data.accent}55`,
                borderTop: `2px solid ${data.accent}`,
                color: data.accent,
                background: data.accentDim,
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                textShadow: `0 0 12px ${data.accent}88`,
              }}
            >
              {data.label} MODE
            </div>

            <div className="flex-1" />

            {/* ── Primary: Back to Gaming Interface ── */}
            <button
              onClick={() => navigate("/gaming", { state: { startMode: modeKey.toUpperCase() } })}
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
              {t("gamePage.backToGaming", "BACK TO GAMING INTERFACE")}
            </button>

            {/* ── Secondary: Back to Website ── */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase shrink-0 transition-all duration-200"
              style={{
                fontFamily: "Orbitron, sans-serif",
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "7px 14px 7px 10px",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("gamePage.backToWebsite", "BACK TO WEBSITE")}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Scrollable content */}
      <div className="relative z-10">

        {/* ── Page content */}
        {data.rich
          ? <DetailPage data={data} />
          : (
            <>
              {/* Simple mode header */}
              <div className="w-full max-w-[1080px] mx-auto px-6 md:px-12 pt-36 pb-20 flex flex-col gap-5">
                <motion.h1
                  initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-goldman uppercase text-4xl md:text-5xl xl:text-[58px] leading-tight"
                  style={{ textShadow: `0 0 70px ${data.glow}` }}
                >
                  {data.heading}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="uppercase tracking-[0.18em] text-[14px]"
                  style={{ color: data.accent, fontFamily: "Orbitron, sans-serif", textShadow: `0 0 12px ${data.accent}` }}
                >
                  {data.subtitle}
                </motion.p>
              </div>
              <SimplePage data={data} />
            </>
          )
        }
      </div>
    </div>
  );
}
