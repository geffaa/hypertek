import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import GlowingOrb from "../Components/Common/BgColoring";

const ITEMS_PER_PAGE = 6;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" },
  }),
};

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function clip(str, n) {
  return str?.length > n ? str.slice(0, n) + "…" : (str || "");
}

export default function NewsList() {
  const [news, setNews]           = useState([]);
  const [visibleCount, setVisible] = useState(ITEMS_PER_PAGE);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews`)
      .then(r => r.json())
      .then(d => { if (d.success) setNews(d.data); })
      .catch(console.error);
  }, []);

  const go = (item) => navigate("/more-news", { state: { newsItem: item } });

  const featured = news[0];
  const rest     = news.slice(1, visibleCount + 1);
  const canLoad  = visibleCount + 1 < news.length;

  return (
    <div
      className="min-h-screen text-white relative"
      style={{ background: "#060610" }}
    >
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
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-2"
              style={{ color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}
            >
              Latest Updates
            </p>
            <h1 className="font-[Goldman] font-bold text-3xl md:text-4xl xl:text-5xl uppercase text-white">
              News &amp; Updates
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
            {/* bg image */}
            <img
              src={getImageUrl(featured.image)}
              alt={featured.heading}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(6,6,16,0.97) 0%, rgba(6,6,16,0.55) 55%, rgba(6,6,16,0.1) 100%)" }}
            />

            {/* neon top accent */}
            <div
              className="absolute top-0 inset-x-0 h-[2px]"
              style={{ background: "linear-gradient(to right, transparent, #38bdf8, transparent)", boxShadow: "0 0 24px rgba(56,189,248,0.6)" }}
            />

            {/* content */}
            <div className="absolute bottom-0 inset-x-0 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded"
                  style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.5)", color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}
                >
                  LATEST
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
                <span>Read Article</span>
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 5h14M10 1l5 4-5 4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Section divider ── */}
        {rest.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <div className="w-5 h-[2px]" style={{ background: "#38bdf8" }} />
            <span className="text-white/40 text-xs uppercase tracking-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>All Stories</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>
        )}

        {/* ── News grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((item, i) => (
            <motion.div
              key={item._id}
              className="group cursor-pointer rounded-xl overflow-hidden flex flex-col"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onClick={() => go(item)}
              variants={fadeUp} custom={i}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
                e.currentTarget.style.boxShadow   = "0 0 30px rgba(56,189,248,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow   = "none";
              }}
            >
              {/* image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.heading}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,16,0.6) 0%, transparent 60%)" }} />
              </div>

              {/* content */}
              <div className="flex flex-col flex-1 p-5 gap-2">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
                  {formatDate(item.createdAt)}
                </span>
                <h3 className="font-[Goldman] font-bold text-white text-[15px] leading-snug group-hover:text-[#38bdf8] transition-colors duration-300">
                  {clip(item.heading, 65)}
                </h3>
                <p className="text-white/50 text-[13px] leading-relaxed flex-1">
                  {clip(item.description, 110)}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[#38bdf8]/70 text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  <span>Read</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 4h10M7 1l4 3-4 3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Load more ── */}
        {canLoad && (
          <div className="flex justify-center mt-14">
            <motion.button
              onClick={() => setVisible(v => v + ITEMS_PER_PAGE)}
              className="px-10 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:brightness-125"
              style={{
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.4)",
                borderTop: "2px solid #38bdf8",
                color: "#38bdf8",
                fontFamily: "Orbitron, sans-serif",
                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                boxShadow: "0 0 24px rgba(56,189,248,0.15)",
              }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Load More
            </motion.button>
          </div>
        )}

      </div>
    </div>
  );
}
