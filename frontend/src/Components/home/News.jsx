import React, { useEffect, useState } from "react";
import CustomButton from "../Buttons/Button1";
import GlowingOrb from "../Common/BgColoring";
import { Link, useNavigate } from "react-router-dom";
import { NewsImage_Url } from "../../Config";
import { BACKEND_BASE_URL } from "../../Config";

export default function News() {
  const [news, setNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNews(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Function to handle news item click - NO ID IN URL
  const handleNewsClick = (newsItem) => {
    navigate(`/more-news`, { state: { newsItem } });
  };

  return (
    <section className="w-full z-10 flex justify-center items-start px-1 md:px-2 py-10 md:py-12 relative">

      {/* Background effects */}
<div
  style={{ bottom: "890px", right: "110px" }}
  className="absolute -z-10
    w-[120px] h-[120px]
    md:w-[220px] md:h-[220px]
    rounded-full
     from-blue-500/50 via-blue-800/60 to-white/0
    blur-[60px] md:blur-[90px]
    shadow-[0_0_30px_15px_rgba(59,130,246,0.45),
            0_0_80px_40px_rgba(59,130,246,0.3),
            0_0_160px_80px_rgba(59,130,246,0.15)]"
/>

<div
  style={{ bottom: "90px", right: "100px" }}
  className="absolute -z-10
    w-[120px] h-[120px]
    md:w-[220px] md:h-[220px]
    rounded-full
    bg-gradient-to-b from-blue-500/50 via-blue-600/60 to-white/20
    blur-[60px] md:blur-[100px]
    shadow-[0_0_30px_15px_rgba(59,130,246,0.45),
            0_0_80px_40px_rgba(59,130,246,0.3),
            0_0_160px_80px_rgba(59,130,246,0.15)]"
/>


      <GlowingOrb Xaxis={220} Yaxis={400} />

      <div className="flex flex-col md:flex-row gap-20 w-full max-w-[1247px]">
        {/* Left Column */}
        <div className="flex flex-col gap-8 w-full md:w-[680px]">
          {/* First Block */}
          {news.slice(0, 1).map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-5 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleNewsClick(item)}
            >
              <img
  src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
  alt={item.heading}
  className="relative z-10 w-full max-h-[350px] object-cover rounded-lg"
/>

<div className="relative z-20 flex flex-col gap-3 pt-2 w-full">
                <h3 className="text-white text-xl sm:text-2xl font-bold uppercase font-goldman w-full">
                  {item.heading.length > 50
                    ? item.heading.slice(0, 50) + "..."
                    : item.heading}
                </h3>
                <p className="text-white text-sm sm:text-base font-inter leading-relaxed md:w-[400px]">
                  {item.description.length > 120
                    ? item.description.slice(0, 120) + "..."
                    : item.description}
                </p>
              </div>
            </div>
          ))}

          {/* Second Block */}
          <div className="flex flex-col sm:flex-row gap-6">
            {news.slice(1, 3).map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 w-full sm:w-1/2 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleNewsClick(item)}
              >
                <div className="relative">
                  <img
                    src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
                    alt={item.heading}
                    className="relative z-10 w-full max-h-[200px] object-cover rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-[12px] md:w-[247px] md:h-[176px]">
                  <h3 className="text-white text-lg sm:text-xl font-bold uppercase font-goldman">
                    {item.heading.length > 30
                      ? item.heading.slice(0, 30) + "..."
                      : item.heading}
                  </h3>
                  <p className="text-white text-sm pt-2">
                    {item.description.length > 80
                      ? item.description.slice(0, 80) + "..."
                      : item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col z-10 gap-10 w-full md:w-[450px]">
          {/* Heading */}
          <div className="hidden sm:flex items-center w-full">
            <h2 className="text-white font-bold text-2xl sm:text-3xl font-goldman uppercase border-b-2 border-white pb-1">
              News
            </h2>
            <div className="flex-1 ml-3 mt-10 h-[2px] bg-gradient-to-r from-white to-transparent"></div>
          </div>

          {/* Featured Block */}
          {news[3] && (
            <div
              className="hidden sm:flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleNewsClick(news[0])}
            >
              <img
                src={`${NewsImage_Url}${news[0].image.replace("/temp/", "/news/")}`}
                alt={news[0].heading}
                className="w-full max-h-[200px] object-cover rounded-lg"
              />
              <div className="text-white px-3 py-2">
                <h3 className="text-white text-lg sm:text-xl font-bold uppercase font-goldman">
                  {news[0].heading.length > 40
                    ? news[0].heading.slice(0, 40) + "..."
                    : news[0].heading}
                </h3>
              </div>
            </div>
          )}

          {/* Horizontal Blocks */}
          <div className="flex flex-col gap-4">
            {news.slice(3, 6).map((item) => (
              <div
                key={item._id}
                className="flex flex-row gap-3 w-full rounded-lg overflow-hidden p-2 cursor-pointer"
                onClick={() => handleNewsClick(item)}
              >
                <img
                  src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
                  alt={item.heading}
                  className="w-[200px] h-[140px] object-cover"
                />
                <div className="flex p-2">
                  <p className="text-white text-xs sm:text-base font-inter leading-relaxed">
                    {item.description.length > 80
                      ? item.description.slice(0, 80) + "..."
                      : item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* More News Button */}
          <div className="flex justify-start sm:justify-center mt-4">
            <Link to="/news/all">
              <CustomButton text="More News" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
