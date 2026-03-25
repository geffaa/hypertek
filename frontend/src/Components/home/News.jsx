import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl, BACKEND_BASE_URL } from "../../Config";
import LazyImage from "../Common/LazyImage";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

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
    <section className="w-full z-10 flex justify-center items-start px-0 pt-20 md:pt-28 pb-10 md:pb-16 relative">

      {/* ================= MOBILE NEWS ================= */}
      <div className="flex md:hidden flex-col w-full px-4 space-y-8">

        {news.slice(0, 3).map((item, i) => (
          <motion.div
            key={item._id}
            className="flex flex-col space-y-3 cursor-pointer"
            onClick={() => handleNewsClick(item)}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <LazyImage
              src={getImageUrl(item.image)}
              alt={item.heading}
              className="w-full h-[190px]"
              imgClassName="object-cover"
            />
            <h3 className="text-white text-[15px] font-bold uppercase font-goldman leading-tight">
              {item.heading.length > 38 ? item.heading.slice(0, 38) + "..." : item.heading}
            </h3>
            <p className="text-gray-300 text-[12px] font-inter leading-[18px]">
              {item.description.length > 90 ? item.description.slice(0, 90) + "..." : item.description}
            </p>
          </motion.div>
        ))}

        <div className="flex flex-col divide-y divide-white/10">
          {news.slice(3, 6).map((item, i) => (
            <motion.div
              key={item._id}
              className="flex gap-3 py-4 cursor-pointer"
              onClick={() => handleNewsClick(item)}
              variants={fadeUp}
              custom={i + 3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <LazyImage
                src={getImageUrl(item.image)}
                alt={item.heading}
                className="w-[90px] h-[65px] flex-shrink-0"
                imgClassName="object-cover"
              />
              <div className="flex flex-col gap-1">
                <p className="text-white text-[11px] font-semibold uppercase leading-[14px]">
                  {item.heading.length > 35 ? item.heading.slice(0, 35) + "..." : item.heading}
                </p>
                <p className="text-gray-300 text-[11px] leading-[15px]">
                  {item.description.length > 65 ? item.description.slice(0, 65) + "..." : item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center pt-1"
          variants={fadeUp}
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Link to="/news">
            <button className="px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
              View More
            </button>
          </Link>
        </motion.div>

      </div>
      {/* ================= END MOBILE ================= */}

      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="hidden md:flex flex-row gap-20 w-full max-w-[1520px] mx-auto px-10 lg:px-16 xl:px-20 2xl:px-20">

        {/* Left Column — 60% */}
        <div className="flex flex-col gap-6 w-[60%]">
          {/* Featured large image: 680x405 ratio = ~59.6% height of width */}
          {news.slice(0, 1).map((item, i) => (
            <motion.div
              key={item._id}
              className="flex flex-col gap-6 cursor-pointer"
              onClick={() => handleNewsClick(item)}
              variants={fadeLeft}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <LazyImage
                src={getImageUrl(item.image)}
                alt={item.heading}
                className="w-full"
                imgClassName="object-cover"
                style={{ aspectRatio: "680/405" }}
              />
              <div className="flex flex-col gap-2 pt-1">
                <h3 className="text-white font-bold uppercase font-goldman leading-tight" style={{ fontSize: "15px" }}>
                  {item.heading.length > 60 ? item.heading.slice(0, 60) + "..." : item.heading}
                </h3>
                <p className="text-gray-300" style={{ fontSize: "12px", lineHeight: "1.6" }}>
                  {item.description.length > 130 ? item.description.slice(0, 130) + "..." : item.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* 2 smaller images: 330x262 ratio = ~79.4% height of width */}
          <div className="flex gap-6">
            {news.slice(1, 3).map((item, i) => (
              <motion.div
                key={item._id}
                className="flex flex-col gap-2 w-1/2 cursor-pointer"
                onClick={() => handleNewsClick(item)}
                variants={fadeLeft}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <LazyImage
                  src={getImageUrl(item.image)}
                  alt={item.heading}
                  className="w-full"
                  imgClassName="object-cover"
                  style={{ aspectRatio: "330/262" }}
                />
                <h3 className="text-white font-bold uppercase font-goldman leading-tight" style={{ fontSize: "13px" }}>
                  {item.heading.length > 35 ? item.heading.slice(0, 35) + "..." : item.heading}
                </h3>
                <p className="text-gray-300" style={{ fontSize: "11px", lineHeight: "1.5" }}>
                  {item.description.length > 80 ? item.description.slice(0, 80) + "..." : item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column — 40% */}
        <div className="flex flex-col gap-3 w-[40%]">
          <motion.div
            className="flex items-center mb-1"
            variants={fadeRight}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-white font-goldman uppercase border-b-2 border-white pb-1" style={{ fontSize: "22px" }}>
              NEWS
            </h2>
            <div className="flex-1 ml-3 mt-7 h-[2px] bg-gradient-to-r from-white to-transparent" />
          </motion.div>

          {/* Featured Card */}
          {news.slice(3, 4).map((item, i) => (
            <motion.div
              key={item._id}
              className="flex flex-col gap-2 cursor-pointer"
              onClick={() => handleNewsClick(item)}
              variants={fadeRight}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <LazyImage
                src={getImageUrl(item.image)}
                alt={item.heading}
                className="w-full"
                imgClassName="object-cover"
                style={{ aspectRatio: "462/209" }}
              />
              <h3 className="text-white font-bold uppercase font-goldman leading-tight" style={{ fontSize: "13px" }}>
                {item.heading.length > 65 ? item.heading.slice(0, 65) + "..." : item.heading}
              </h3>
            </motion.div>
          ))}

          {/* 3 Small Cards */}
          <div className="flex flex-col divide-y divide-white/10">
            {news.slice(4, 7).map((item, i) => (
              <motion.div
                key={item._id}
                className="flex gap-3 py-3 cursor-pointer"
                onClick={() => handleNewsClick(item)}
                variants={fadeRight}
                custom={i + 2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <LazyImage
                  src={getImageUrl(item.image)}
                  alt={item.heading}
                  className="flex-shrink-0"
                  imgClassName="object-cover"
                  style={{ width: "229px", aspectRatio: "229/157" }}
                />
                <p className="text-white self-center" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                  {item.description.length > 80 ? item.description.slice(0, 80) + "..." : item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex justify-center mt-1"
            variants={fadeRight}
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Link to="/news">
              <button className="px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20">
                More News
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
      {/* ================= END DESKTOP ================= */}

    </section>
  );
}
