import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlowingOrb from "../Components/Common/BgColoring";
import { BACKEND_BASE_URL, NewsImage_Url } from "../Config";
import CustomButton5 from "../Components/Buttons/Button5";
import CustomButton6 from "../Components/Buttons/Button6";

export default function NewsAll() {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNews(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nextNews = () => {
    if (currentIndex < news.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevNews = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="min-h-screen  flex items-center justify-center">
        <p className="text-white">Loading news...</p>
      </section>
    );
  }

  if (!news.length) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-white">No news available</p>
      </section>
    );
  }

  const item = news[currentIndex];

  return (
    <div className="min-h-screen text-white font-sans relative mt-24 px-4 sm:px-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-20 right-5 w-40 h-40 rounded-full bg-blue-500/10 blur-[80px]"></div>
        <div className="absolute bottom-20 left-5 w-40 h-40 rounded-full bg-purple-500/10 blur-[80px]"></div>
      </div>

      <GlowingOrb Xaxis={900} Yaxis={700} />

      {/* Featured Image */}
      <div className="mb-8">
        <img
          src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
          alt={item.heading}
          className="w-full max-h-[420px] object-cover"
        />
      </div>

      {/* Header with Breadcrumb */}
      <div className="relative z-20 max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-6">

  <nav className="flex items-center gap-2 text-sm flex-wrap">
    {/* Home (clickable) */}
    <button
      onClick={() => navigate("/")}
      className="text-gray-400 hover:text-white transition-colors font-inter font-medium text-[16px]"
    >
      Home
    </button>

    <span className="text-gray-600">›</span>

    {/* Current Page: News */}
    <span className="text-white font-bold font-inter text-[16px]">
      News
    </span>
  </nav>
</div>


      {/* Main Content */}
      <main className="max-w-6xl mx-auto relative z-10 pb-24">
        {/* Title */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
              LATEST
            </span>
            <h1
  className="text-2xl sm:text-3xl mt-2 sm:mt-0 uppercase"
  style={{
    fontFamily: "Goldman",
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
  }}
>
  {item.heading}
</h1>
          </div >
         {/* Border below heading */}
    <div className="border-t border-gray-800 mt-2"></div>
        </div>

       {/* Full Description */}
<div className="mb-8">
  <div
    className="text-gray-300 leading-relaxed space-y-4"
    style={{
      fontFamily: "Inter",
      fontWeight: 500,
      fontStyle: "medium",
      fontSize: "16px",
      lineHeight: "100%",
      letterSpacing: "0%",
    }}
  >
    {item.description.split("\n").map((p, i) => (
      <p key={i} className="text-base sm:text-lg">
        {p}
      </p>
    ))}

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
  </div>
</div>


        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-12">
  <CustomButton6
    text="Previous"
    onClick={prevNews}
    disabled={currentIndex === 0}
  />

  <div className="text-gray-400 text-sm">
    Page {currentIndex + 1} of {news.length}
  </div>

  <CustomButton5
    text="Next"
    onClick={nextNews}
    disabled={currentIndex === news.length - 1}
  />
</div>

      </main>
    </div>
  );
}
