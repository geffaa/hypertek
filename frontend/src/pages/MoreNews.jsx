import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowLeft, FaShareAlt, FaCheck } from "react-icons/fa";
import { getImageUrl } from "../Config";
import GlowingOrb from "../Components/Common/BgColoring";

export default function NewsDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state?.newsItem) {
      setNewsItem(location.state.newsItem);
    } else {
      navigate("/news");
    }
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: newsItem.heading, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!newsItem) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ background: "#060610" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/40 border-t-cyan-400 animate-spin" />
          <span className="text-white/40 text-sm">Loading article…</span>
        </div>
      </div>
    );
  }

  // Parse description into blocks: subtitle (## prefix) or paragraph
  const blocks = newsItem.description
    .split("\n")
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => p.startsWith("## ")
      ? { type: "subtitle", text: p.slice(3) }
      : { type: "para",     text: p }
    );

  return (
    <div className="min-h-screen text-white relative" style={{ background: "#060610" }}>
      <GlowingOrb Xaxis={100}  Yaxis={600}  />
      <GlowingOrb Xaxis={1300} Yaxis={1200} />

      {/* ── Hero image ── */}
      <div className="relative w-full" style={{ height: "clamp(260px, 40vw, 480px)" }}>
        <img
          src={newsItem.image ? getImageUrl(newsItem.image) : ""}
          alt={newsItem.heading}
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.currentTarget.style.opacity = "0.15"; }}
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(6,6,16,0.5) 0%, rgba(6,6,16,0.15) 35%, rgba(6,6,16,0.9) 100%)" }} />
        <div className="absolute bottom-0 inset-x-0 h-[2px]"
          style={{ background: "linear-gradient(to right, transparent, #38bdf8, transparent)", boxShadow: "0 0 24px rgba(56,189,248,0.5)" }} />

        {/* Back button */}
        <div className="absolute bottom-6 left-6 md:left-12 xl:left-20 z-20">
          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 hover:brightness-125"
            style={{
              background: "rgba(6,6,16,0.75)", border: "1px solid rgba(56,189,248,0.4)",
              borderTop: "2px solid #38bdf8", color: "#38bdf8",
              fontFamily: "Orbitron, sans-serif", backdropFilter: "blur(8px)",
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              boxShadow: "0 0 16px rgba(56,189,248,0.18)",
            }}
          >
            <FaArrowLeft size={10} /> Back to News
          </button>
        </div>
      </div>

      {/* ── Article body ── */}
      <main className="relative z-10 max-w-[780px] mx-auto px-6 md:px-10 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-white/35 mb-8 font-medium">
          <button onClick={() => navigate("/")} className="hover:text-white/70 transition-colors">Home</button>
          <span>›</span>
          <button onClick={() => navigate("/news")} className="hover:text-white/70 transition-colors">News</button>
          <span>›</span>
          <span className="text-white/55">{newsItem.heading?.slice(0, 45)}{newsItem.heading?.length > 45 ? "…" : ""}</span>
        </nav>

        {/* Meta — date only, no hardcoded "LATEST" */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-5"
        >
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded"
            style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.35)", color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
            News & Updates
          </span>
          <div className="flex items-center gap-1.5 text-white/40 text-[12px]">
            <FaCalendarAlt size={11} />
            <span>{formatDate(newsItem.createdAt)}</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[36px] uppercase leading-[1.2] text-white mb-6"
        >
          {newsItem.heading}
        </motion.h1>

        {/* Divider */}
        <div className="mb-8 h-px" style={{ background: "linear-gradient(to right, rgba(56,189,248,0.5), rgba(56,189,248,0.1), transparent)" }} />

        {/* Body text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-5"
        >
          {blocks.map((block, i) =>
            block.type === "subtitle" ? (
              <div key={i} className="pt-4 pb-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: "#38bdf8" }} />
                  <h2 className="font-[Goldman] font-bold text-white text-[16px] md:text-[18px] uppercase tracking-wide leading-snug">
                    {block.text}
                  </h2>
                </div>
                <div className="ml-4 h-px" style={{ background: "linear-gradient(to right, rgba(56,189,248,0.3), transparent)" }} />
              </div>
            ) : (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-white/90 text-[16px] md:text-[17px] leading-[1.85] font-medium"
                    : "text-white/65 text-[14px] md:text-[15px] leading-[1.9]"
                }
              >
                {block.text}
              </p>
            )
          )}
        </motion.div>

        {/* Bottom divider + share */}
        <div className="mt-12 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-cyan-400 transition-colors duration-200"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            <FaArrowLeft size={10} /> All Articles
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 hover:brightness-125"
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)",
              color: copied ? "#22c55e" : "rgba(255,255,255,0.55)",
              fontFamily: "Orbitron, sans-serif", borderRadius: 6,
            }}
          >
            {copied ? <FaCheck size={10} /> : <FaShareAlt size={10} />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </main>
    </div>
  );
}
