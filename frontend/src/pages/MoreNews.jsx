import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaArrowLeft, FaShareAlt } from "react-icons/fa";
import { NewsImage_Url } from "../Config";


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
    <div className="min-h-screen text-white font-sans relative mt-24">
          {/* Featured Image */}
        <div className="mb-8">
        <img
  src={
    newsItem.image
      ? `${NewsImage_Url}${newsItem.image.replace("/temp/", "/news/")}`
      : ""
  }
  alt={newsItem.heading}
  className="
    w-screen
    max-h-[420px]
    object-cover
    relative
    left-1/2
    right-1/2
    -ml-[50vw]
    -mr-[50vw]
  "
/>


        </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-purple-500/10 blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
         

     <nav className="flex items-center gap-2 text-sm">
       <button onClick={() => navigate("/")} 
       className="text-gray-400 hover:text-white transition-colors" >
         Home </button> <span className="text-gray-600">›</span> 
         <button onClick={() => navigate("/news")}
          className="text-white-400 hover:text-white transition-colors" > 
          News </button> <span className="text-gray-600"></span> 
     </nav>
         
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
              LATEST
            </span>
            <h1 className="text-3xl md:text-xl font-normal uppercase leading-[100%] tracking-[0%] font-goldman">
  {newsItem.heading}
</h1>

          </div>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>{formatDate(newsItem.createdAt)}</span>
            </div>
            <span>•</span>
            <span>By Admin</span>
          </div>
          
  {/* Add the border at the end */}
  <div className="border-t border-gray-800 mt-4"></div>
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
