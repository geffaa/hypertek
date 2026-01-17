import React, { useEffect, useState } from "react";
import CustomButton from "../Buttons/Button1";
import GlowingOrb from "../Common/BgColoring";
import { Link, useNavigate } from "react-router-dom";
import { NewsImage_Url, BACKEND_BASE_URL } from "../../Config";

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

  const handleNewsClick = (newsItem) => {
    navigate(`/more-news`, { state: { newsItem } });
  };

  return (
    <section className="w-full z-10 flex justify-center items-start px-0 py-10 md:py-12 relative">

      {/* Background effects */}
      <div
        style={{ bottom: "890px", right: "110px" }}
        className="absolute -z-10 w-[120px] h-[120px] md:w-[220px] md:h-[220px] rounded-full from-blue-500/50 via-blue-800/60 to-white/0 blur-[80px] md:blur-[100px]"
      />
      <div
        style={{ bottom: "90px", right: "100px" }}
        className="absolute -z-10 w-[120px] h-[120px] md:w-[220px] md:h-[220px] rounded-full bg-gradient-to-b from-blue-500/50 via-blue-600/60 to-white/20 blur-[60px] md:blur-[100px]"
      />
      <GlowingOrb Xaxis={250} Yaxis={400} />

 {/* ================= MOBILE NEWS (EXACT DESIGN) ================= */}
<div className="flex md:hidden flex-col w-full px-4 space-y-8">

{/* TOP 3 NEWS — LAST 3 ITEMS */}
{news.slice(-3).map((item) => (
  <div
    key={item._id}
    className="flex flex-col space-y-3 cursor-pointer"
    onClick={() => handleNewsClick(item)}
  >
    <img
  src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
  alt={item.heading}
  className="w-full h-[190px] object-cover block"
/>

    <h3 className="text-white text-[15px] font-bold uppercase font-goldman leading-tight">
      {item.heading.length > 38
        ? item.heading.slice(0, 38) + "..."
        : item.heading}
    </h3>

    <p className="text-gray-300 text-[12px] font-inter leading-[18px]">
      {item.description.length > 90
        ? item.description.slice(0, 90) + "..."
        : item.description}
    </p>
  </div>
))}

{/* UPDATES — FIRST 3 ITEMS */}
<div className="flex flex-col divide-y divide-white/10">
  {news.slice(0, 3).map((item) => (
    <div
      key={item._id}
      className="flex gap-3 py-4 cursor-pointer"
      onClick={() => handleNewsClick(item)}
    >
      <img
        src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
        alt={item.heading}
        className="w-[90px] h-[65px] object-cover "
      />

      {/* TEXT */}
      <div className="flex flex-col gap-1">
        {/* HEADING */}
        <p className="text-white text-[11px] font-semibold uppercase leading-[14px]">
          {item.heading.length > 35
            ? item.heading.slice(0, 35) + "..."
            : item.heading}
        </p>

        {/* DESCRIPTION */}
        <p className="text-gray-300 text-[11px] leading-[15px]">
          {item.description.length > 65
            ? item.description.slice(0, 65) + "..."
            : item.description}
        </p>
      </div>
    </div>
  ))}
</div>

{/* VIEW MORE BUTTON — ORIGINAL */}
<div className="flex justify-start pt-1">
  <Link to="/news/all">
    <CustomButton text="View More" />
  </Link>
</div>

</div>
{/* ================= END MOBILE ================= */}




      {/* ================= DESKTOP LAYOUT (UNCHANGED) ================= */}
      <div className="hidden md:flex flex-col md:flex-row gap-20 w-full max-w-[1480px] mx-auto px-16">


        {/* Left Column */}
        <div className="flex flex-col gap-8 w-full md:w-[680px]">
          {news.slice(0, 1).map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-5"
              onClick={() => handleNewsClick(item)}
            >
              <img
                src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
                alt={item.heading}
                className="w-full max-h-[350px] rounded-lg"
              />
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-white text-2xl font-bold uppercase font-goldman">
                  {item.heading.length > 50 ? item.heading.slice(0, 50) + "..." : item.heading}
                </h3>
                <p className="text-white text-base font-inter md:w-[400px]">
                  {item.description.length > 120 ? item.description.slice(0, 120) + "..." : item.description}
                </p>
              </div>
            </div>
          ))}

          <div className="flex gap-6">
            {news.slice(1, 3).map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 w-1/2 cursor-pointer"
                onClick={() => handleNewsClick(item)}
              >
                <img
                  src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
                  className="w-full max-h-[200px] object-cover rounded-lg"
                  alt={item.heading}
                />
                <h3 className="text-white text-xl font-bold uppercase font-goldman">
                  {item.heading.length > 30 ? item.heading.slice(0, 30) + "..." : item.heading}
                </h3>
                <p className="text-white text-sm">
                  {item.description.length > 80 ? item.description.slice(0, 80) + "..." : item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-16 w-full md:w-[450px]">
          <div className="flex items-center">
            <h2 className="text-white text-3xl font-goldman uppercase border-b-2 border-white pb-1">
              News
            </h2>
            <div className="flex-1 ml-3 mt-10 h-[2px] bg-gradient-to-r from-white to-transparent"></div>
          </div>

          <div className="flex flex-col gap-4">
            {news.slice(3, 6).map((item) => (
              <div
                key={item._id}
                className="flex gap-3 cursor-pointer"
                onClick={() => handleNewsClick(item)}
              >
                <img
                  src={`${NewsImage_Url}${item.image.replace("/temp/", "/news/")}`}
                  className="w-[200px] h-[140px] object-cover"
                  alt={item.heading}
                />
                <p className="text-white text-base">
                  {item.description.length > 80 ? item.description.slice(0, 80) + "..." : item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <Link to="/news">
              <CustomButton text="More News" />
            </Link>
          </div>
        </div>
      </div>
      {/* ================= END DESKTOP ================= */}

    </section>
  );
}
