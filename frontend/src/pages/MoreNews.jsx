import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowLeft, FaShareAlt, FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getImageUrl, BACKEND_BASE_URL } from "../Config";
import GlowingOrb from "../Components/Common/BgColoring";

export default function NewsDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [newsItem, setNewsItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const articleIdRef = useRef(null);

  // Initial load from navigation state
  useEffect(() => {
    if (location.state?.newsItem) {
      setNewsItem(location.state.newsItem);
      articleIdRef.current = location.state.newsItem._id;
    } else {
      navigate("/news");
    }
  }, [location.state, navigate]);

  // Re-fetch when language changes
  useEffect(() => {
    const id = articleIdRef.current;
    if (!id) return;
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews?lang=${i18n.language}`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.data || []).find((n) => String(n._id) === String(id));
        if (found) setNewsItem(found);
      })
      .catch(() => {});
  }, [i18n.language]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language || "en", {
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
          <span className="text-white/40 text-sm">{t("newsPage.loadingArticle")}</span>
        </div>
      </div>
    );
  }

  // Parse inline bold: split text on **...** markers into React nodes
  const parseBold = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
    );
  };

  // Group lines into typed blocks: subtitle | table | para
  const blocks = (() => {
    const lines = newsItem.description.split("\n").map(l => l.trim());
    const result = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line) { i++; continue; }
      if (line.startsWith("## ")) {
        result.push({ type: "subtitle", text: line.slice(3) });
        i++;
      } else if (line.startsWith("|")) {
        // Collect all consecutive table lines
        const tableLines = [];
        while (i < lines.length && lines[i].startsWith("|")) {
          tableLines.push(lines[i]);
          i++;
        }
        // Parse header (first line), skip separator (---), then rows
        const parseRow = (l) => l.split("|").slice(1, -1).map(c => c.trim());
        const [headerLine, ...rest] = tableLines;
        const headers = parseRow(headerLine);
        const rows = rest
          .filter(l => !/^\|[-| ]+\|$/.test(l))
          .map(parseRow);
        result.push({ type: "table", headers, rows });
      } else {
        result.push({ type: "para", text: line });
        i++;
      }
    }
    return result;
  })();

  return (
    <div className="text-white relative" style={{ background: "#060610" }}>
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
            <FaArrowLeft size={10} /> {t("newsPage.backToNews")}
          </button>
        </div>
      </div>

      {/* ── Article body ── */}
      <main className="relative z-10 max-w-[780px] mx-auto px-6 md:px-10 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-white/35 mb-8 font-medium">
          <button onClick={() => navigate("/")} className="hover:text-white/70 transition-colors">
            {t("newsPage.home")}
          </button>
          <span>›</span>
          <button onClick={() => navigate("/news")} className="hover:text-white/70 transition-colors">
            {t("newsPage.news")}
          </button>
          <span>›</span>
          <span className="text-white/55">{newsItem.heading?.slice(0, 45)}{newsItem.heading?.length > 45 ? "…" : ""}</span>
        </nav>

        {/* Meta */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-5"
        >
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded"
            style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.35)", color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
            {t("newsPage.newsUpdates")}
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
          {blocks.map((block, i) => {
            if (block.type === "subtitle") return (
              <div key={i} className="pt-4 pb-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: "#38bdf8" }} />
                  <h2 className="font-[Goldman] font-bold text-white text-[16px] md:text-[18px] uppercase tracking-wide leading-snug">
                    {block.text}
                  </h2>
                </div>
                <div className="ml-4 h-px" style={{ background: "linear-gradient(to right, rgba(56,189,248,0.3), transparent)" }} />
              </div>
            );
            if (block.type === "table") return (
              <div key={i} className="overflow-x-auto rounded-xl my-2" style={{ border: "1px solid rgba(56,189,248,0.2)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(56,189,248,0.08)" }}>
                      {block.headers.map((h, ci) => (
                        <th key={ci} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-cyan-400/80">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                        {row.map((cell, ci) => (
                          <td key={ci} className={`px-4 py-2.5 text-[13px] ${ci === 0 ? "text-white/80 font-medium" : "text-white/50"}`}>
                            {parseBold(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            return (
              <p key={i} className={i === 0
                ? "text-white/90 text-[16px] md:text-[17px] leading-[1.85] font-medium"
                : "text-white/65 text-[14px] md:text-[15px] leading-[1.9]"
              }>
                {parseBold(block.text)}
              </p>
            );
          })}
        </motion.div>

        {/* Bottom divider + share */}
        <div className="mt-12 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-cyan-400 transition-colors duration-200"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            <FaArrowLeft size={10} /> {t("newsPage.allArticles")}
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
            {copied ? t("newsPage.copied") : t("newsPage.share")}
          </button>
        </div>
      </main>
    </div>
  );
}
