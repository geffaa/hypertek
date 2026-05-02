import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaArrowLeft, FaShareAlt } from "react-icons/fa";
import { getImageUrl } from "../Config";


export default function NewsDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);

  useEffect(() => {
    if (location.state?.newsItem) {
      setNewsItem(location.state.newsItem);
    } else {
      // If no state, redirect back to news list
      navigate("/news");
    }
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.heading,
        text: newsItem.description.substring(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!newsItem) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-xl">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans relative" style={{ background: "#060610" }}>

      {/* Hero image — flush with top, covers navbar area */}
      <div className="relative w-full" style={{ height: "clamp(280px, 42vw, 500px)" }}>
        <img
          src={newsItem.image ? getImageUrl(newsItem.image) : ""}
          alt={newsItem.heading}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient: dark at top (behind navbar) → dark at bottom */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(6,6,16,0.55) 0%, rgba(6,6,16,0.2) 40%, rgba(6,6,16,0.85) 100%)" }}
        />
        {/* neon bottom line */}
        <div
          className="absolute bottom-0 inset-x-0 h-[2px]"
          style={{ background: "linear-gradient(to right, transparent, #38bdf8, transparent)", boxShadow: "0 0 24px rgba(56,189,248,0.5)" }}
        />

        {/* Back button — floating over image */}
        <div className="absolute bottom-6 left-6 md:left-12 xl:left-16 z-20">
          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 hover:brightness-125"
            style={{
              background: "rgba(6,6,16,0.7)",
              border: "1px solid rgba(56,189,248,0.4)",
              borderTop: "2px solid #38bdf8",
              color: "#38bdf8",
              fontFamily: "Orbitron, sans-serif",
              backdropFilter: "blur(8px)",
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              boxShadow: "0 0 16px rgba(56,189,248,0.2)",
            }}
          >
            <FaArrowLeft size={10} />
            Back to News
          </button>
        </div>
      </div>

      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 xl:px-16 py-10 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/40 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
          <span>›</span>
          <button onClick={() => navigate("/news")} className="hover:text-white transition-colors">News</button>
          <span>›</span>
          <span className="text-white/70">{newsItem.heading?.slice(0, 40)}{newsItem.heading?.length > 40 ? "…" : ""}</span>
        </nav>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded"
              style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.45)", color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}
            >
              LATEST
            </span>
          </div>
          <h1 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-4xl uppercase leading-tight text-white mb-4">
            {newsItem.heading}
          </h1>
          <div className="flex items-center gap-4 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt size={12} />
              <span>{formatDate(newsItem.createdAt)}</span>
            </div>
            <span>•</span>
            <span>By Admin</span>
          </div>
          <div className="mt-5 h-px" style={{ background: "linear-gradient(to right, rgba(56,189,248,0.4), transparent)" }} />
        </div>

      
        {/* Full Description */}
        <div className="mb-8">
          <div className="text-gray-300 leading-relaxed space-y-4">
            {newsItem.description.split("\n").map((p, i) => (
              <p key={i} className="text-lg">{p}</p>
            ))}
          </div>
        </div>
{/* Event Launch Details */}
<p>Event Launch Date:</p>
    <ul className="list-disc list-inside">
      <li>Begins Nov 10, 2025, 00:00 (UTC+0)</li>
      <li>Ends Nov 24, 2025, 23:59 (UTC+0)</li>
    </ul>

    <p>What’s Coming:</p>
    <ul className="list-disc list-inside">
      <li>God of War-themed challenges across all Hyper Tek platforms</li>
      <li>Exclusive skins, collectibles, and weapon upgrades</li>
      <li>Mythic Quests — complete missions to earn special rewards</li>
      <li>Community leaderboard with cash and in-game prize drops</li>
    </ul>

    <p>Rewards:</p>
    <ul className="list-disc list-inside">
      <li>1st Place: $2,000 + Limited Edition Kratos NFT</li>
      <li>2nd–5th: $1,000 each + Exclusive Weapon Skins</li>
      <li>6th–20th: $250 each + God of War Digital Collectibles</li>
      <li>Participation Reward: Special “Mark of the Gods” badge</li>
    </ul>

    <p>How to Join:</p>
    <p>
      Register on the Hyper Tek events page and complete in-game challenges between Nov 10–24. Earn points by completing quests, unlocking loot, and participating in community events.
    </p>

    <p>Rules:</p>
    <ul className="list-disc list-inside">
      <li>Only verified Hyper Tek accounts can participate.</li>
      <li>Rewards are distributed based on total quest points.</li>
      <li>Cheating, multi-accounting, or exploit use will result in disqualification.</li>
    </ul>

    <p>Gear up, warriors. Ragnarok is coming and this time, you’re part of the legend.</p>
        {/* Additional content if exists */}
        {newsItem.content && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Additional Details</h2>
            <div className="text-gray-300 leading-relaxed">{newsItem.content}</div>
          </div>
        )}
      </main>
    </div>
  );
}
