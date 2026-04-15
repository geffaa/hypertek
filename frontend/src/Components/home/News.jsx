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
        <div className="flex items-end mb-6">
          <h2 className="text-white font-goldman uppercase text-xl pb-1 border-b-2 border-white">NEWS/UPDATES</h2>
          <div className="flex-1 ml-3 mb-[1px] h-[2px] bg-gradient-to-r from-white to-transparent" />
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
        <motion.div className="flex flex-col gap-5 w-[58%]"
          variants={fadeLeft} custom={0} initial="hidden"
          whileInView="visible" viewport={{ once: true, amount: 0.15 }}>

          {/* Gaming Info heading */}
          <div className="flex items-end">
            <h2 className="text-white font-goldman uppercase text-[22px] pb-1 border-b-2 border-white">
              GAMING INFO
            </h2>
            <div className="flex-1 ml-3 mb-[1px] h-[2px] bg-gradient-to-r from-white to-transparent" />
          </div>

          {/* Static promo image with button overlay */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "680/405" }}>
            <img
              src="/ui-game.png"
              alt="HyperTek Game UI"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />
            {/* 3 Buttons — individually positioned to align with each game panel */}
            {[
              { label: "RACING",   path: "/game/racing",   left: "14.7%", accent: "#22c55e", glow: "rgba(34,197,94,0.35)",   bg: "rgba(0,25,10,0.88)" },
              { label: "QUEST",    path: "/game/quest",    left: "48.7%", accent: "#38bdf8", glow: "rgba(56,189,248,0.35)",  bg: "rgba(0,12,32,0.88)" },
              { label: "OVERLORD", path: "/game/overlord", left: "77.7%", accent: "#f87171", glow: "rgba(248,113,113,0.35)", bg: "rgba(32,0,0,0.88)" },
            ].map(({ label, path, left, accent, glow, bg }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{
                  position: "absolute",
                  bottom: "6%",
                  left,
                  transform: "translateX(-50%)",
                  padding: "5px 12px",
                  background: bg,
                  border: `1px solid ${accent}`,
                  borderTop: `2px solid ${accent}`,
                  borderRadius: 2,
                  clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                  color: "#fff",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: 9,
                  fontWeight: "bold",
                  letterSpacing: "0.12em",
                  cursor: "pointer",
                  textAlign: "center",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  boxShadow: `0 0 20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  textShadow: `0 0 10px ${accent}`,
                  transition: "filter 0.18s ease, transform 0.18s ease",
                  zIndex: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.4)"; e.currentTarget.style.transform = "translateX(-50%) translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)";   e.currentTarget.style.transform = "translateX(-50%) translateY(0)"; }}
              >
                {label} LEARN MORE
              </button>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-white font-goldman uppercase leading-tight text-[17px] lg:text-[20px]">
            AWAKEN THE HYPER TEK PLAYER WITHIN
          </h3>

          {/* Description */}
          <div className="flex flex-col gap-3 text-gray-300 text-[13px] lg:text-[14px] leading-relaxed">
            <p>
              As the Hyper Tek movement continues to surge forward, it's time to secure your place in history by grabbing one of our exclusive packages, available for a very limited time.
            </p>
            <p>
              We have already raised nearly $400,000 to get us this far, but we are now launching a crowdfunding campaign to secure the additional funds needed to complete the project. While the donation tiers are outlined here, our exclusive packages are your opportunity to invest and will not be repeated.
            </p>
            <p>
              Don't forget, our Non-Fungible Digital Items come with a minimum money-back guarantee and offer incredible in-game bonuses. Act now and be part of this groundbreaking movement!
            </p>
          </div>

        </motion.div>

        {/* ── Right Column — 42% ── */}
        <div className="flex flex-col gap-4 w-[42%]">

          {/* NEWS heading */}
          <motion.div className="flex items-end"
            variants={fadeRight} custom={0} initial="hidden"
            whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <h2 className="text-white font-goldman uppercase text-[22px] pb-1 border-b-2 border-white">
              NEWS/UPDATES
            </h2>
            <div className="flex-1 ml-3 mb-[1px] h-[2px] bg-gradient-to-r from-white to-transparent" />
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

          {/* 2 compact list cards */}
          <div className="flex flex-col divide-y divide-white/10">
            {news.slice(4, 6).map((item, i) => (
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
                View All News
              </button>
            </Link>
          </motion.div>
        </div>

      </div>
      {/* ═══════════════════ END DESKTOP ═══════════════════ */}

    </section>
  );
}
