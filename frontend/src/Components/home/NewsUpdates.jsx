import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Play, X, Calendar, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

// ── Add new articles here (text-only news cards) ────────────────────────────
const ARTICLE_ITEMS = [
  {
    id: "article-001",
    tag: "PLATFORM UPDATE",
    tagColor: "#22c55e",
    title: "HyperBucks — Top-Up & Cashout Now Live",
    date: "June 2025",
    points: [
      "Top up with credit/debit card or USDC crypto",
      "Cash out via bank transfer (1–3 business days) or USDC",
      "Minimum $1 USD (250 HB) for top-up and cashout",
      "OTP email verification protects every cashout",
      "KYC identity check required before first withdrawal",
    ],
    note: "250 HB = $1 USD · All transactions secured by Stripe",
  },
];
// ────────────────────────────────────────────────────────────────────────────

// ── Add new videos here ──────────────────────────────────────────────────────
const VIDEO_ITEMS = [
  {
    id: "news-001",
    src: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/racing_content.mp4",
    tag: "GAME FOOTAGE",
    tagColor: "#38bdf8",
    title: "Hyper Tek — Game Content Preview",
    description: "A first look at in-game footage from the Hyper Tek universe.",
    date: "May 2025",
  },
  {
    id: "news-002",
    src: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/overlord_content.mp4",
    tag: "GAME FOOTAGE",
    tagColor: "#38bdf8",
    title: "Hyper Tek — Overlord Content Preview",
    description: "An exclusive look at the Overlord game mode in the Hyper Tek universe.",
    date: "May 2025",
  },
];
// ────────────────────────────────────────────────────────────────────────────

function VideoModal({ item, onClose }) {
  const videoRef = useRef(null);
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
      <div
        style={{
          position: "relative", width: "100%", maxWidth: "960px",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 10,
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: "rgba(0,0,0,0.65)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 6,
            color: "rgba(255,255,255,0.75)",
            fontSize: 13, cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.9)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.65)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
        >
          <X style={{ width: 14, height: 14 }} /> Close
        </button>

        <video
          ref={videoRef}
          src={item.src}
          autoPlay
          controls
          playsInline
          style={{
            width: "100%", borderRadius: 12,
            maxHeight: "80vh", background: "#000",
            display: "block",
          }}
        />

        <div style={{ marginTop: 16, paddingLeft: 4 }}>
          <span
            style={{
              fontSize: 10, fontFamily: "Orbitron, sans-serif",
              fontWeight: 700, letterSpacing: "0.2em",
              color: item.tagColor,
              textTransform: "uppercase",
            }}
          >
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

function VideoCard({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const thumbRef = useRef(null);

  // Seek to 1s to generate a meaningful thumbnail frame
  const handleMetadata = () => {
    if (thumbRef.current) thumbRef.current.currentTime = 1;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: index * 0.12 }}
        className="relative flex flex-col rounded-xl overflow-hidden cursor-pointer group"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? item.tagColor + "55" : "rgba(255,255,255,0.08)"}`,
          boxShadow: hovered ? `0 0 28px ${item.tagColor}22` : "none",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpenModal(true)}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <video
            ref={thumbRef}
            src={item.src}
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={handleMetadata}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              display: "block",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: hovered
                ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 100%)",
              transition: "background 0.3s",
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300"
            style={{ background: item.tagColor, opacity: hovered ? 1 : 0.4 }}
          />

          {/* Play button */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: hovered ? 1 : 0.7, transition: "opacity 0.3s" }}
          >
            <div
              style={{
                width: 52, height: 52,
                borderRadius: "50%",
                background: hovered ? item.tagColor : "rgba(255,255,255,0.15)",
                border: `2px solid ${hovered ? item.tagColor : "rgba(255,255,255,0.4)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: hovered ? "scale(1.1)" : "scale(1)",
                transition: "all 0.3s",
                boxShadow: hovered ? `0 0 24px ${item.tagColor}88` : "none",
              }}
            >
              <Play
                size={20}
                style={{
                  color: hovered ? "#000" : "#fff",
                  marginLeft: 3,
                  transition: "color 0.3s",
                }}
                fill="currentColor"
              />
            </div>
          </div>

          {/* Tag badge */}
          <div className="absolute top-3 left-3">
            <span
              style={{
                fontSize: 9, fontFamily: "Orbitron, sans-serif",
                fontWeight: 700, letterSpacing: "0.18em",
                color: item.tagColor,
                background: "rgba(0,0,0,0.75)",
                border: `1px solid ${item.tagColor}55`,
                borderRadius: 4,
                padding: "3px 8px",
                textTransform: "uppercase",
                backdropFilter: "blur(4px)",
              }}
            >
              {item.tag}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-2 p-4">
          <h3
            className="text-white font-bold leading-snug"
            style={{
              fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)",
              fontFamily: "Goldman, sans-serif",
            }}
          >
            {item.title}
          </h3>
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-white/30 text-[11px]">{item.date}</span>
          </div>
        </div>
      </motion.div>

      {openModal && <VideoModal item={item} onClose={() => setOpenModal(false)} />}
    </>
  );
}

function ArticleCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg, rgba(0,42,168,0.18) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(0,42,168,0.35)",
      }}
    >
      {/* Tag bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span
          className="text-[10px] font-bold tracking-[0.18em] px-2.5 py-1 rounded-full"
          style={{ color: item.tagColor, background: `${item.tagColor}18`, border: `1px solid ${item.tagColor}35` }}
        >
          {item.tag}
        </span>
        <div className="flex items-center gap-1.5">
          <Calendar size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
          <span className="text-white/30 text-[11px]">{item.date}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 px-4 pb-4 flex-1">
        <h3
          className="text-white font-bold leading-snug"
          style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)", fontFamily: "Goldman, sans-serif" }}
        >
          {item.title}
        </h3>
        <ul className="space-y-1.5">
          {item.points.map((pt) => (
            <li key={pt} className="flex items-start gap-2 text-xs text-white/55">
              <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
              {pt}
            </li>
          ))}
        </ul>
        {item.note && (
          <p className="text-[10px] text-white/30 mt-auto pt-2 border-t border-white/5">{item.note}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function NewsUpdates() {
  const { t } = useTranslation();

  if (!VIDEO_ITEMS.length && !ARTICLE_ITEMS.length) return null;

  return (
    <section className="w-full pt-4 pb-16 md:pb-24 relative">
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
            News & Updates
          </h2>
          <div className="flex-1 ml-3 mb-[1px] h-[2px] bg-gradient-to-r from-white to-transparent" />
        </motion.div>

        {/* Grid */}
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
          }}
        >
          {ARTICLE_ITEMS.map((item, i) => (
            <ArticleCard key={item.id} item={item} index={i} />
          ))}
          {VIDEO_ITEMS.map((item, i) => (
            <VideoCard key={item.id} item={item} index={ARTICLE_ITEMS.length + i} />
          ))}
        </div>

      </div>
    </section>
  );
}
