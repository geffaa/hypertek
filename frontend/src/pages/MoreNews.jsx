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
      <header className="border-b border-gray-800 px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
         

          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <span className="text-gray-600">›</span>
            <button
              onClick={() => navigate("/news")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              News
            </button>
            <span className="text-gray-600">›</span>
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
            <h1 className="text-3xl md:text-xl font-bold">{newsItem.heading}</h1>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>{formatDate(newsItem.createdAt)}</span>
            </div>
            <span>•</span>
            <span>By Admin</span>
          </div>
        </div>

      
        {/* Full Description */}
        <div className="mb-8">
          <div className="text-gray-300 leading-relaxed space-y-4">
            {newsItem.description.split("\n").map((p, i) => (
              <p key={i} className="text-lg">{p}</p>
            ))}
          </div>
        </div>

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
