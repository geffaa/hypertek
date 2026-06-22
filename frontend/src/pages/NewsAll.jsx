import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, X, Calendar } from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import GlowingOrb from "../Components/Common/BgColoring";

// ── Add new game videos here ─────────────────────────────────────────────────
const VIDEO_ITEMS = [
  {
    id: "vid-001",
    src: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/racing_content.mp4",
    tag: "GAME FOOTAGE",
    tagColor: "#38bdf8",
    title: "Hyper Tek — Game Content Preview",
    description: "In-game content of Hyper Racing Universe",
    date: "May 2025",
  },
  {
    id: "vid-002",
    src: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/overlord_content.mp4",
    tag: "GAME FOOTAGE",
    tagColor: "#38bdf8",
    title: "Hyper Tek — Overlord Content Preview",
    description: "An exclusive look at the Overlord game mode in the Hyper Tek universe.",
    date: "May 2025",
  },
  {
    id: "vid-003",
    src: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/quest_video2.webm",
    tag: "GAME FOOTAGE",
    tagColor: "#38bdf8",
    title: "Hyper Tek — Quest Content Preview",
    description: "Explore the Hyper Quest game mode in the Hyper Tek universe.",
    date: "May 2025",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function VideoModal({ item, onClose }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handleKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handleKey);
    const navbar = document.querySelector("nav");
    if (navbar) navbar.style.visibility = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (navbar) navbar.style.visibility = "";
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999999,
        background: "rgba(0,0,0,0.96)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        position: "relative", width: "100%", maxWidth: "960px",
        transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
        transition: "transform 0.3s ease, opacity 0.3s ease",
        opacity: visible ? 1 : 0,
      }}>
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 10,
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: "rgba(0,0,0,0.65)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 6, color: "rgba(255,255,255,0.75)",
            fontSize: 13, cursor: "pointer", backdropFilter: "blur(4px)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.9)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.65)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
        >
          <X style={{ width: 14, height: 14 }} /> {t("newsPage.close", "Close")}
        </button>
        <video
          src={item.src} autoPlay controls playsInline preload="metadata"
          style={{ width: "100%", borderRadius: 12, maxHeight: "80vh", background: "#000", display: "block" }}
        />
        <div style={{ marginTop: 14, paddingLeft: 4 }}>
          <span style={{ fontSize: 10, fontFamily: "Orbitron, sans-serif", fontWeight: 700, letterSpacing: "0.2em", color: item.tagColor, textTransform: "uppercase" }}>
            {item.tag}
          </span>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginTop: 4, fontFamily: "Goldman, sans-serif" }}>
            {item.title}
          </h3>
        </div>
      </div>
    </div>,
    document.body
  );
}

function VideoCarousel() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [modalItem, setModal] = useState(null);
  const [paused, setPaused]   = useState(false);
  const timerRef    = useRef(null);
  const thumbRefs   = useRef([]);
  const dragStartX  = useRef(null);
  const didDrag     = useRef(false);

  const total = VIDEO_ITEMS.length;
  const go = (dir) => setActive(i => (i + dir + total) % total);

  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current = setInterval(() => go(1), 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, total]);

  const handleMeta = (i) => {
    const el = thumbRefs.current[i];
    if (el) el.currentTime = 1;
  };

  // ── Drag / swipe ──────────────────────────────────────────────────────────
  const onPointerDown = (e) => {
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    didDrag.current = false;
    setPaused(true);
  };
  const onPointerUp = (e) => {
    if (dragStartX.current === null) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const delta = endX - dragStartX.current;
    if (Math.abs(delta) > 50) {
      didDrag.current = true;
      go(delta > 0 ? -1 : 1);
    }
    dragStartX.current = null;
    setPaused(false);
  };
  // ─────────────────────────────────────────────────────────────────────────

  if (total === 0) return null;

  const activeItem = VIDEO_ITEMS[active];

  const cardStyle = (d) => {
    const T = "all 0.6s cubic-bezier(0.4,0,0.2,1)";
    if (d === 0) return {
      zIndex: 10, opacity: 1, pointerEvents: "auto",
      transform: "translateX(0%) scale(1) rotateY(0deg)",
      filter: "none", transition: T,
    };
    if (Math.abs(d) === 1) return {
      zIndex: 5, opacity: 0.78, pointerEvents: "auto",
      transform: `translateX(${d > 0 ? "52%" : "-52%"}) scale(0.91) rotateY(${d > 0 ? "-46deg" : "46deg"})`,
      filter: "brightness(0.5)", transition: T,
    };
    return {
      zIndex: 1, opacity: 0, pointerEvents: "none",
      transform: `translateX(${d > 0 ? "130%" : "-130%"}) scale(0.75)`,
      filter: "brightness(0.1)", transition: T,
    };
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.08 }}
        style={{
          width: "100vw", position: "relative",
          left: "50%", marginLeft: "-50vw",
          marginBottom: "5rem",
        }}
      >
        {/* Section label — re-contained */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 xl:px-16 mb-7">
          <div className="flex items-center gap-4">
            <div className="w-5 h-[2px]" style={{ background: "#38bdf8" }} />
            <span className="text-white/40 text-xs uppercase tracking-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>
              {t("newsPage.gameVideos", "Game Videos")}
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            {total > 1 && (
              <div className="flex gap-2">
                {[[-1, "←"], [1, "→"]].map(([dir, lbl]) => (
                  <button key={dir} onClick={() => go(dir)} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "rgba(56,189,248,0.07)",
                    border: "1px solid rgba(56,189,248,0.25)",
                    color: "#38bdf8", fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.18)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.6)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(56,189,248,0.07)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.25)"; }}
                  >{lbl}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Full-width stage ── */}
        <div
          style={{
            width: "100%", overflow: "hidden",
            height: "clamp(220px, 44vw, 620px)",
            perspective: "1300px", perspectiveOrigin: "50% 50%",
            cursor: "grab", userSelect: "none",
          }}
          onMouseDown={onPointerDown}
          onMouseUp={onPointerUp}
          onMouseLeave={(e) => { if (dragStartX.current !== null) onPointerUp(e); }}
          onTouchStart={onPointerDown}
          onTouchEnd={onPointerUp}
        >
          {VIDEO_ITEMS.map((item, i) => {
            const raw = ((i - active + total) % total + total) % total;
            const d   = raw > total / 2 ? raw - total : raw;
            return (
              <div
                key={item.id}
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                style={{ ...cardStyle(d), transformStyle: "preserve-3d" }}
                onClick={() => {
                  if (didDrag.current) return;
                  if (d === 0) setModal(item);
                  else { didDrag.current = false; setActive(i); }
                }}
              >
                {/* Card */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    width: "min(1040px, 80%)",
                    aspectRatio: "16/9",
                    cursor: d === 0 ? "pointer" : "default",
                    boxShadow: d === 0 ? "0 20px 90px rgba(0,0,0,0.85)" : "none",
                  }}
                >
                  <video
                    ref={el => thumbRefs.current[i] = el}
                    src={item.src} preload="metadata" muted playsInline
                    onLoadedMetadata={() => handleMeta(i)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                  />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.05) 55%)" }} />
                  {/* Top accent line */}
                  <div className="absolute top-0 inset-x-0 h-[3px]"
                    style={{ background: item.tagColor, boxShadow: d === 0 ? `0 0 24px ${item.tagColor}aa` : "none", opacity: d === 0 ? 1 : 0.45 }} />
                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span style={{
                      fontSize: 9, fontFamily: "Orbitron, sans-serif", fontWeight: 700,
                      letterSpacing: "0.2em", color: item.tagColor,
                      background: "rgba(0,0,0,0.82)", border: `1px solid ${item.tagColor}55`,
                      borderRadius: 4, padding: "4px 10px", textTransform: "uppercase",
                      backdropFilter: "blur(6px)",
                    }}>{item.tag}</span>
                  </div>
                  {/* Play — active only */}
                  {d === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div style={{
                        width: 68, height: 68, borderRadius: "50%",
                        background: item.tagColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 40px ${item.tagColor}bb`,
                      }}>
                        <Play size={28} style={{ color: "#000", marginLeft: 5 }} fill="currentColor" />
                      </div>
                    </div>
                  )}
                  {/* Info — active only */}
                  {d === 0 && (
                    <div className="absolute bottom-0 inset-x-0 px-6 pb-5">
                      <h3 style={{ color: "#fff", fontFamily: "Goldman, sans-serif", fontSize: "clamp(1rem,1.6vw,1.35rem)", fontWeight: 700, marginBottom: 6 }}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{item.date}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots + description — re-contained */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 xl:px-16">
          {total > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              {VIDEO_ITEMS.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} style={{
                  width: active === i ? 24 : 7, height: 7, borderRadius: 4, border: "none",
                  background: active === i ? "#38bdf8" : "rgba(255,255,255,0.2)",
                  cursor: "pointer", transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                }} />
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-center text-white/40 text-sm mt-3 max-w-2xl mx-auto"
            >
              {activeItem.description}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {modalItem && <VideoModal item={modalItem} onClose={() => setModal(null)} />}
    </>
  );
}

const AVATAR_FILES = [
  "commander-elite.webp","dryads-female.webp","dryads-male.webp",
  "fawnus-female.webp","fawnus-male.webp","geodians-female.webp",
  "geodians-male.webp","lithionites-female.webp","lithionites-male.webp",
  "mantasquads-female.webp","mantasquads-male.webp","marmulus-female.webp",
  "marmulus-male.webp","ophidians-female.webp","ophidians-male.webp",
  "overlord.webp","team-specialist-major.webp",
];


function formatDate(str, lang) {
  return new Date(str).toLocaleDateString(lang || "en", { year: "numeric", month: "short", day: "numeric" });
}

function clip(str, n) {
  return str?.length > n ? str.slice(0, n) + "…" : (str || "");
}

function NewsCard({ item, i, go, readLabel, lang }) {
  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.3s, box-shadow 0.3s" }}
      onClick={() => go(item)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(56,189,248,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img src={getImageUrl(item.image)} alt={item.heading}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-col flex-1 p-5 gap-2">
        {/* date hidden until site goes live */}
        <h3 className="font-[Goldman] font-bold text-white text-[15px] leading-snug group-hover:text-[#38bdf8] transition-colors duration-300">
          {clip(item.heading, 65)}
        </h3>
        <p className="text-white/50 text-[13px] leading-relaxed flex-1 text-justify">{clip(item.excerpt || (item.description?.includes("\n\n") ? item.description.split("\n\n").slice(1).join("\n\n") : item.description), 160)}</p>
        <div className="flex items-center gap-1.5 mt-2 text-[#38bdf8]/70 text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
          <span>{readLabel}</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 4h10M7 1l4 3-4 3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Shimmer skeleton primitives ──────────────────────────────────────────────
const shimmerKeyframes = `
  @keyframes ht-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
`;

function SkimBase({ style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
        backgroundSize: "600px 100%",
        animation: "ht-shimmer 1.6s infinite linear",
        borderRadius: 8,
        ...style,
      }}
    />
  );
}

function FeaturedSkeleton() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl mb-12"
      style={{ height: "clamp(320px,45vw,520px)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <SkimBase style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
      <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 flex flex-col gap-3">
        <SkimBase style={{ width: 80, height: 24 }} />
        <SkimBase style={{ width: "60%", height: 32 }} />
        <SkimBase style={{ width: "80%", height: 18 }} />
        <SkimBase style={{ width: "65%", height: 18 }} />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <SkimBase style={{ aspectRatio: "16/9", borderRadius: 0 }} />
      <div className="flex flex-col gap-2 p-5">
        <SkimBase style={{ height: 18, width: "90%" }} />
        <SkimBase style={{ height: 14, width: "100%" }} />
        <SkimBase style={{ height: 14, width: "80%" }} />
        <SkimBase style={{ height: 14, width: "60%", marginTop: 8 }} />
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsList() {
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setFaq]   = useState(0);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const faqItems = t("newsPage.faq", { returnObjects: true }) || [];

  useEffect(() => {
    const lang = i18n.language || "en";
    setLoading(true);
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews?lang=${lang}`)
      .then(r => r.json())
      .then(d => { if (d.success) setNews(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [i18n.language]);

  const go = (item) => navigate("/more-news", { state: { newsItem: item } });

  const featured   = news[0];
  const newsCards  = news.slice(1, 4);
  const extraNews  = news.slice(4);

  const faqAvatars = useMemo(() =>
    Array.from({ length: 6 }, () => `/avatar/${AVATAR_FILES[Math.floor(Math.random() * AVATAR_FILES.length)]}`),
  []);

  return (
    <div className="min-h-screen text-white relative" style={{ background: "#060610" }}>
      <style>{shimmerKeyframes}</style>
      <GlowingOrb Xaxis={200}  Yaxis={400} />
      <GlowingOrb Xaxis={1200} Yaxis={900} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 xl:px-16 pt-24 pb-24">

        {/* ── Page heading ── */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top row: eyebrow label + back button side by side */}
          <div className="flex items-center gap-6 mb-2">
            <p className="text-xs font-bold uppercase tracking-[0.35em]"
              style={{ color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
              {t("newsPage.latestUpdates")}
            </p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/40 hover:text-[#38bdf8] transition-colors duration-200 text-[11px] font-bold uppercase tracking-[0.25em]"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("newsPage.backToHome")}
            </button>
          </div>
          {/* Heading + decorative line */}
          <div className="flex items-end gap-4">
            <h1 className="font-[Goldman] font-bold text-3xl md:text-4xl xl:text-5xl uppercase text-white whitespace-nowrap">
              {t("newsPage.heading")}
            </h1>
            <div className="flex-1 mb-2 h-px" style={{ background: "linear-gradient(to right, rgba(56,189,248,0.4), transparent)" }} />
          </div>
        </motion.div>

        {/* ── Featured article ── */}
        {loading ? <FeaturedSkeleton /> : featured && (
          <div
            className="relative w-full overflow-hidden rounded-2xl cursor-pointer mb-12 group"
            style={{ height: "clamp(320px, 45vw, 520px)" }}
            onClick={() => go(featured)}
          >
            <img
              src={getImageUrl(featured.image)}
              alt={featured.heading}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ objectPosition: "center 20%" }}
            />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(6,6,16,0.97) 0%, rgba(6,6,16,0.55) 55%, rgba(6,6,16,0.1) 100%)" }} />
            <div className="absolute top-0 inset-x-0 h-[2px]"
              style={{ background: "linear-gradient(to right, transparent, #38bdf8, transparent)", boxShadow: "0 0 24px rgba(56,189,248,0.6)" }} />
            <div className="absolute bottom-0 inset-x-0 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded"
                  style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.5)", color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
                  {t("newsPage.latestBadge")}
                </span>
                {/* date hidden until site goes live */}
              </div>
              <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-4xl text-white leading-tight mb-3 max-w-3xl group-hover:text-[#38bdf8] transition-colors duration-300">
                {featured.heading}
              </h2>
              <p className="text-white/60 text-sm md:text-[15px] leading-relaxed max-w-2xl line-clamp-2 text-justify">
                {featured.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-[#38bdf8] text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
                <span>{t("newsPage.readArticle")}</span>
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 5h14M10 1l5 4-5 4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ── Game Videos carousel ── */}
        <VideoCarousel />

        {/* ── News: 3 cards + See All ── */}
        {loading ? (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-[2px]" style={{ background: "#38bdf8" }} />
              <SkimBase style={{ width: 120, height: 12 }} />
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[0, 1, 2].map(i => <CardSkeleton key={i} />)}
            </div>
          </>
        ) : newsCards.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-[2px]" style={{ background: "#38bdf8" }} />
              <span className="text-white/40 text-xs uppercase tracking-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {t("newsPage.allStories")}
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsCards.map((item, i) => (
                <NewsCard key={item._id} item={item} i={i} go={go} readLabel={t("newsPage.read")} lang={i18n.language} />
              ))}
            </div>

            {showAll && extraNews.length > 0 && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                {extraNews.map((item, i) => (
                  <NewsCard key={item._id} item={item} i={i} go={go} readLabel={t("newsPage.read")} lang={i18n.language} />
                ))}
              </motion.div>
            )}

            {(extraNews.length > 0 || showAll) && (
              <div className="flex justify-center mt-8 mb-16">
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="flex items-center gap-2 px-7 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 hover:brightness-125"
                  style={{
                    background: "rgba(56,189,248,0.07)",
                    border: "1px solid rgba(56,189,248,0.35)",
                    borderTop: "2px solid rgba(56,189,248,0.65)",
                    color: "#38bdf8",
                    fontFamily: "Orbitron, sans-serif",
                    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  }}
                >
                  {showAll ? t("newsPage.showLess") : t("newsPage.seeAll", { count: news.length - 1 })}
                  <svg
                    width="12" height="8" viewBox="0 0 12 8" fill="none"
                    style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}
                  >
                    <path d="M1 1l5 5 5-5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
            {!extraNews.length && !showAll && <div className="mb-16" />}
          </>
        )}

        {/* ── Game Videos ── */}
        {/* ══════════════════════════════════════════
            FAQ SECTION — two-panel half-page layout
        ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true, amount: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-5 h-[2px]" style={{ background: "#a78bfa" }} />
            <span className="text-white/40 text-xs uppercase tracking-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>
              {t("newsPage.frequentlyAsked")}
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <div
            className="rounded-2xl grid grid-cols-1 lg:grid-cols-[260px_1fr]"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* LEFT: Question list */}
            <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}>
              {faqItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setFaq(i)}
                  className="w-full text-left px-5 py-4 flex items-start gap-3 transition-all duration-200 group relative"
                  style={{
                    borderBottom: i < faqItems.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    background: activeFaq === i ? "rgba(167,139,250,0.08)" : "transparent",
                  }}
                >
                  {activeFaq === i && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                      style={{ background: "linear-gradient(to bottom, #a78bfa, rgba(167,139,250,0.3))" }} />
                  )}
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 transition-colors duration-200"
                    style={{
                      background: activeFaq === i ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                      color: activeFaq === i ? "#a78bfa" : "rgba(255,255,255,0.3)",
                      border: `1px solid ${activeFaq === i ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-[12.5px] font-semibold leading-snug transition-colors duration-200"
                    style={{ color: activeFaq === i ? "#fff" : "rgba(255,255,255,0.5)" }}
                  >
                    {item.q}
                  </span>
                </button>
              ))}
            </div>

            {/* RIGHT: Answer + Character */}
            <div className="relative flex flex-col" style={{ minHeight: 580 }}>

              {/* Character — large, pinned to right, full height */}
              <div className="absolute top-0 right-0 bottom-0 hidden lg:block pointer-events-none select-none"
                style={{ width: "clamp(300px, 40%, 460px)" }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeFaq}
                    src={faqAvatars[activeFaq]}
                    alt="character"
                    className="absolute right-0 w-auto object-contain object-bottom"
                    style={{ bottom: "5%", height: "110%" }}
                    initial={{ opacity: 0, x: 30, scale: 0.93 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -15, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </AnimatePresence>
                {/* fade left edge so text reads cleanly */}
                <div className="absolute inset-y-0 left-0 w-20 pointer-events-none"
                  style={{ background: "linear-gradient(to right, rgba(6,6,16,0.95), transparent)" }} />
              </div>

              {/* Scrollable text — max-width keeps it clear of the character */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaq}
                  className="flex-1 overflow-y-auto pt-8 px-8 pb-4 md:pt-10 md:px-10 md:pb-4"
                  style={{ maxHeight: 500, paddingRight: "clamp(2rem, 42%, 480px)" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-[1px]" style={{ background: "#a78bfa" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: "#a78bfa", fontFamily: "Orbitron, sans-serif" }}>
                      {t("newsPage.faqLabel")}
                    </span>
                  </div>
                  <h3 className="font-[Goldman] font-bold text-white text-xl md:text-2xl leading-snug mb-5">
                    {faqItems[activeFaq]?.q}
                  </h3>
                  <div className="text-white/55 text-[13.5px] leading-[1.85] flex flex-col gap-3">
                    {faqItems[activeFaq]?.a?.split("\n\n").map((para, pi) => {
                      const colonMatch = para.match(/^([A-Za-z][^:\n]{0,60}:)\s([\s\S]*)/);
                      if (colonMatch) {
                        return (
                          <p key={pi}>
                            <strong className="text-white/90 font-semibold">{colonMatch[1]}</strong>{" "}{colonMatch[2]}
                          </p>
                        );
                      }
                      if (/^\d+\.\s/.test(para)) {
                        return (
                          <ul key={pi} className="flex flex-col gap-1.5 pl-1">
                            {para.split("\n").map((line, li) => (
                              <li key={li} className="flex gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5"
                                  style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>
                                  {line.match(/^\d+/)?.[0]}
                                </span>
                                <span>{line.replace(/^\d+\.\s*/, "")}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={pi}>{para}</p>;
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>


            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
