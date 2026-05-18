import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import GlowingOrb from "../Components/Common/BgColoring";

const AVATAR_FILES = [
  "commander-elite.png","dryads-female.png","dryads-male.png",
  "fawnus-female.png","fawnus-male.png","geodians-female.png",
  "geodians-male.png","lithionites-female.png","lithionites-male.png",
  "mantasquads-female.png","mantasquads-male.png","marmulus-female.png",
  "marmulus-male.png","ophidians-female.png","ophidians-male.png",
  "overlord.png","team-specialist-major.png",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" },
  }),
};

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function clip(str, n) {
  return str?.length > n ? str.slice(0, n) + "…" : (str || "");
}

function NewsCard({ item, i, go, readLabel }) {
  return (
    <motion.div
      className="group cursor-pointer rounded-xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.3s, box-shadow 0.3s" }}
      onClick={() => go(item)}
      variants={fadeUp} custom={i}
      initial="hidden" whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(56,189,248,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img src={getImageUrl(item.image)} alt={item.heading}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,16,0.6) 0%, transparent 60%)" }} />
      </div>
      <div className="flex flex-col flex-1 p-5 gap-2">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
          {formatDate(item.createdAt)}
        </span>
        <h3 className="font-[Goldman] font-bold text-white text-[15px] leading-snug group-hover:text-[#38bdf8] transition-colors duration-300">
          {clip(item.heading, 65)}
        </h3>
        <p className="text-white/50 text-[13px] leading-relaxed flex-1">{clip(item.description, 110)}</p>
        <div className="flex items-center gap-1.5 mt-2 text-[#38bdf8]/70 text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
          <span>{readLabel}</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 4h10M7 1l4 3-4 3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function NewsList() {
  const [news, setNews]       = useState([]);
  const [activeFaq, setFaq]   = useState(0);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const faqItems = t("newsPage.faq", { returnObjects: true }) || [];

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews`)
      .then(r => r.json())
      .then(d => { if (d.success) setNews(d.data); })
      .catch(console.error);
  }, []);

  const go = (item) => navigate("/more-news", { state: { newsItem: item } });

  const featured   = news[0];
  const newsCards  = news.slice(1, 4);
  const extraNews  = news.slice(4);

  const faqAvatars = useMemo(() =>
    Array.from({ length: 6 }, () => `/avatar/${AVATAR_FILES[Math.floor(Math.random() * AVATAR_FILES.length)]}`),
  []);

  return (
    <div className="min-h-screen text-white relative" style={{ background: "#060610" }}>
      <GlowingOrb Xaxis={200}  Yaxis={400} />
      <GlowingOrb Xaxis={1200} Yaxis={900} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 xl:px-16 pt-32 pb-24">

        {/* ── Page heading ── */}
        <motion.div
          className="flex items-end gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 mb-4 text-white/40 hover:text-[#38bdf8] transition-colors duration-200 text-[11px] font-bold uppercase tracking-[0.25em]"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M13 5H1M5 1L1 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("newsPage.backToHome")}
            </button>
            <p className="text-xs font-bold uppercase tracking-[0.35em] mb-2"
              style={{ color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
              {t("newsPage.latestUpdates")}
            </p>
            <h1 className="font-[Goldman] font-bold text-3xl md:text-4xl xl:text-5xl uppercase text-white">
              {t("newsPage.heading")}
            </h1>
          </div>
          <div className="flex-1 mb-2 h-px" style={{ background: "linear-gradient(to right, rgba(56,189,248,0.4), transparent)" }} />
        </motion.div>

        {/* ── Featured article ── */}
        {featured && (
          <motion.div
            className="relative w-full overflow-hidden rounded-2xl cursor-pointer mb-12 group"
            style={{ height: "clamp(320px, 45vw, 520px)" }}
            onClick={() => go(featured)}
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
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
                <span className="text-white/40 text-xs">{formatDate(featured.createdAt)}</span>
              </div>
              <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-4xl text-white leading-tight mb-3 max-w-3xl group-hover:text-[#38bdf8] transition-colors duration-300">
                {featured.heading}
              </h2>
              <p className="text-white/60 text-sm md:text-[15px] leading-relaxed max-w-2xl line-clamp-2">
                {featured.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-[#38bdf8] text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
                <span>{t("newsPage.readArticle")}</span>
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 5h14M10 1l5 4-5 4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── News: 3 cards + See All ── */}
        {newsCards.length > 0 && (
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
                <NewsCard key={item._id} item={item} i={i} go={go} readLabel={t("newsPage.read")} />
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
                  <NewsCard key={item._id} item={item} i={i} go={go} readLabel={t("newsPage.read")} />
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
            className="rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr]"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
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
            <div className="relative overflow-hidden flex flex-col justify-between min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeFaq}
                  src={faqAvatars[activeFaq]}
                  alt="character"
                  className="absolute bottom-0 right-6 h-[92%] w-auto object-contain object-bottom pointer-events-none select-none"
                  style={{ filter: "drop-shadow(0 0 40px rgba(167,139,250,0.15))" }}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(90deg, rgba(6,6,16,0.0) 30%, rgba(6,6,16,0.75) 100%)" }} />
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(6,6,16,0.5) 0%, transparent 50%)" }} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaq}
                  className="relative z-10 p-8 md:p-10 max-w-[520px]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-[1px]" style={{ background: "#a78bfa" }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: "#a78bfa", fontFamily: "Orbitron, sans-serif" }}>
                      {t("newsPage.faqLabel")}
                    </span>
                  </div>
                  <h3 className="font-[Goldman] font-bold text-white text-xl md:text-2xl leading-snug mb-4">
                    {faqItems[activeFaq]?.q}
                  </h3>
                  <p className="text-gray-400 text-sm leading-[1.85]">
                    {faqItems[activeFaq]?.a}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="relative z-10 flex items-center gap-2 px-8 md:px-10 pb-8">
                {faqItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFaq(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: activeFaq === i ? 20 : 6,
                      height: 6,
                      background: activeFaq === i ? "#a78bfa" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
