import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl, BACKEND_BASE_URL } from "../../Config";
import LazyImage from "../Common/LazyImage";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};
const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};
const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};

/* ── reusable card hover wrapper ── */
function CardHover({ children, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group ${className}`}
      style={{ transition: "opacity 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </div>
  );
}

export default function News() {
  const [news, setNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/news/getNews`)
      .then(res => res.json())
      .then(data => { if (data.success) setNews(data.data); })
      .catch(err => console.error(err));
  }, []);

  const go = (item) => navigate("/more-news", { state: { newsItem: item } });

  const clip = (str, n) => str?.length > n ? str.slice(0, n) + "…" : (str || "");

  return (
    <section className="w-full z-10 flex justify-center items-start pt-16 md:pt-24 pb-12 md:pb-20 relative">

      {/* ═══════════════════ MOBILE ═══════════════════ */}
      <div className="flex md:hidden flex-col w-full px-5 gap-0">

        {/* Mobile: NEWS heading */}
        <div className="flex items-center mb-6">
          <h2 className="text-white font-goldman uppercase border-b-2 border-white pb-1 text-xl">NEWS</h2>
          <div className="flex-1 ml-3 mt-6 h-[2px] bg-gradient-to-r from-white to-transparent" />
        </div>

        {/* Mobile featured articles — top 3 */}
        <div className="flex flex-col gap-8">
          {news.slice(0, 3).map((item, i) => (
            <motion.div
              key={item._id}
              variants={fadeUp} custom={i}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <CardHover onClick={() => go(item)} className="flex flex-col gap-3">
                <LazyImage
                  src={getImageUrl(item.image)} alt={item.heading}
                  className="w-full" imgClassName="object-cover"
                  style={{ aspectRatio: "16/9" }}
                />
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-white text-[15px] font-bold uppercase font-goldman leading-snug">
                    {clip(item.heading, 55)}
                  </h3>
                  <p className="text-gray-300 text-[13px] leading-relaxed">
                    {clip(item.description, 110)}
                  </p>
                </div>
              </CardHover>
            </motion.div>
          ))}
        </div>

        {/* Mobile compact list — items 4-7 */}
        <div className="flex flex-col mt-6 divide-y divide-white/10">
          {news.slice(3, 7).map((item, i) => (
            <motion.div
              key={item._id}
              variants={fadeUp} custom={i + 3}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              <CardHover onClick={() => go(item)} className="flex gap-3 py-4">
                <LazyImage
                  src={getImageUrl(item.image)} alt={item.heading}
                  className="w-[96px] h-[68px] flex-shrink-0"
                  imgClassName="object-cover"
                />
                <div className="flex flex-col gap-1 justify-center">
                  <h4 className="text-white text-[12px] font-bold uppercase font-goldman leading-tight">
                    {clip(item.heading, 40)}
                  </h4>
                  <p className="text-gray-400 text-[11px] leading-snug">
                    {clip(item.description, 70)}
                  </p>
                </div>
              </CardHover>
            </motion.div>
          ))}
        </div>

        <motion.div className="flex justify-center mt-8"
          variants={fadeUp} custom={7} initial="hidden"
          whileInView="visible" viewport={{ once: true }}>
          <Link to="/news">
            <button className="px-7 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
              View More
            </button>
          </Link>
        </motion.div>
      </div>
      {/* ═══════════════════ END MOBILE ═══════════════════ */}

      {/* ═══════════════════ DESKTOP ═══════════════════ */}
      <div className="hidden md:flex flex-row gap-8 lg:gap-12 w-full max-w-[1480px] mx-auto px-8 lg:px-14 xl:px-18 2xl:px-20">

        {/* ── Left Column — 58% ── */}
        <div className="flex flex-col gap-6 w-[58%]">

          {/* Featured article */}
          {news.slice(0, 1).map((item) => (
            <motion.div key={item._id}
              variants={fadeLeft} custom={0} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
              <CardHover onClick={() => go(item)} className="flex flex-col gap-4">
                <div className="overflow-hidden w-full" style={{ aspectRatio: "680/405" }}>
                  <LazyImage
                    src={getImageUrl(item.image)} alt={item.heading}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                    imgClassName="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white font-bold uppercase font-goldman leading-tight text-[17px] lg:text-[18px]">
                    {clip(item.heading, 65)}
                  </h3>
                  <p className="text-gray-300 text-[13px] lg:text-[14px] leading-relaxed">
                    {clip(item.description, 160)}
                  </p>
                </div>
              </CardHover>
            </motion.div>
          ))}

          {/* 2 smaller articles */}
          <div className="flex gap-5">
            {news.slice(1, 3).map((item, i) => (
              <motion.div key={item._id} className="w-1/2"
                variants={fadeLeft} custom={i + 1} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
                <CardHover onClick={() => go(item)} className="flex flex-col gap-3">
                  <div className="overflow-hidden w-full" style={{ aspectRatio: "330/262" }}>
                    <LazyImage
                      src={getImageUrl(item.image)} alt={item.heading}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                      imgClassName="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-white font-bold uppercase font-goldman leading-tight text-[13px] lg:text-[14px]">
                      {clip(item.heading, 45)}
                    </h3>
                    <p className="text-gray-300 text-[12px] lg:text-[13px] leading-relaxed">
                      {clip(item.description, 100)}
                    </p>
                  </div>
                </CardHover>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Right Column — 42% ── */}
        <div className="flex flex-col gap-4 w-[42%]">

          {/* NEWS heading */}
          <motion.div className="flex items-center"
            variants={fadeRight} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <h2 className="text-white font-goldman uppercase border-b-2 border-white pb-1 text-[22px]">
              NEWS
            </h2>
            <div className="flex-1 ml-3 mt-6 h-[2px] bg-gradient-to-r from-white to-transparent" />
          </motion.div>

          {/* Right featured article */}
          {news.slice(3, 4).map((item) => (
            <motion.div key={item._id}
              variants={fadeRight} custom={1} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
              <CardHover onClick={() => go(item)} className="flex flex-col gap-3">
                <div className="overflow-hidden w-full" style={{ aspectRatio: "462/209" }}>
                  <LazyImage
                    src={getImageUrl(item.image)} alt={item.heading}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                    imgClassName="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-white font-bold uppercase font-goldman leading-tight text-[13px] lg:text-[14px]">
                    {clip(item.heading, 60)}
                  </h3>
                  <p className="text-gray-300 text-[12px] lg:text-[13px] leading-relaxed">
                    {clip(item.description, 100)}
                  </p>
                </div>
              </CardHover>
            </motion.div>
          ))}

          {/* 3 compact list cards */}
          <div className="flex flex-col divide-y divide-white/10">
            {news.slice(4, 7).map((item, i) => (
              <motion.div key={item._id}
                variants={fadeRight} custom={i + 2} initial="hidden"
                whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
                <CardHover onClick={() => go(item)} className="flex gap-3 py-3.5">
                  <div className="overflow-hidden flex-shrink-0 w-[38%]" style={{ aspectRatio: "229/157" }}>
                    <LazyImage
                      src={getImageUrl(item.image)} alt={item.heading}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                      imgClassName="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1 justify-center">
                    <h4 className="text-white font-bold uppercase font-goldman leading-tight text-[11px] lg:text-[12px]">
                      {clip(item.heading, 45)}
                    </h4>
                    <p className="text-gray-300 text-[11px] lg:text-[12px] leading-snug">
                      {clip(item.description, 80)}
                    </p>
                  </div>
                </CardHover>
              </motion.div>
            ))}
          </div>

          <motion.div className="flex justify-center mt-2"
            variants={fadeRight} custom={5} initial="hidden"
            whileInView="visible" viewport={{ once: true }}>
            <Link to="/news">
              <button className="px-7 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
                More News
              </button>
            </Link>
          </motion.div>
        </div>

      </div>
      {/* ═══════════════════ END DESKTOP ═══════════════════ */}

    </section>
  );
}
