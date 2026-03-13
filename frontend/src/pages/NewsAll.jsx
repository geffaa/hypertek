import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import GlowingOrb from "../Components/Common/BgColoring";
import CustomButton5 from "../Components/Buttons/Button5";
const ITEMS_PER_PAGE = 3;

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNews(data.data);
      })
      .catch(console.error);
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleNewsClick = (newsItem) => {
    navigate(`/more-news`, { state: { newsItem } });
  };

  return (
    <div className="min-h-screen text-white relative px-4 sm:px-6 py-24">
      <GlowingOrb Xaxis={800} Yaxis={600} />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto mb-12">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white text-sm"
        >
          Home
        </button>
        <span className="mx-2 text-gray-600">›</span>
        <span className="font-semibold">News</span>
      </div>

      {/* Vertical News List */}
      <div className="max-w-6xl mx-auto space-y-12">
        {news.slice(0, visibleCount).map((item, index) => (
          <div
            key={item._id}
            onClick={() => handleNewsClick(item)}
            className="group cursor-pointer flex flex-col sm:flex-row gap-6 border-b border-gray-800 pb-10"
          >
            {/* Image */}
            <div className="relative w-full sm:w-[320px] h-[200px] overflow-hidden rounded-lg shrink-0">
              <img
                src={getImageUrl(item.image)}
                alt={item.heading}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* LATEST only for first news */}
              {index === 0 && (
                <span className="text-xs text-blue-500 font-semibold">
                  LATEST
                </span>
              )}

              <h3 className="mt-2 text-xl font-semibold leading-snug group-hover:text-blue-400 transition">
                {item.heading}
              </h3>

              <p className="text-gray-400 text-sm mt-2">
                {new Date(item.createdAt).toDateString()}
              </p>

              <p className="text-gray-300 mt-4 line-clamp-3">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* NEXT BUTTON */}
      {visibleCount < news.length && (
        <div className="flex justify-center mt-16">
          <CustomButton5
            text="Next"
            onClick={loadMore}
            className="px-10 py-3"
          />
        </div>
      )}
    </div>
  );
}
