import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import heroImage from "../../assets/images/hero.jpg";
import Logo from "/logo-white.png";
import "../../App.css";
import { Link } from "react-router-dom";
import useSiteContent from "../../hooks/useSiteContent";
import { X } from "lucide-react";

function VideoModal({ onClose }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in on next frame
    requestAnimationFrame(() => setVisible(true));
    const handleKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.88)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-4xl"
        style={{
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
        >
          <X className="w-4 h-4" /> Close
        </button>
        <video
          ref={videoRef}
          src="/video/download_page.mp4"
          autoPlay
          playsInline
          className="w-full rounded-xl"
          style={{ maxHeight: "80vh", background: "#000" }}
        />
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay },
  }),
};

export default function Hero() {
  const { data: cms } = useSiteContent("home_hero");
  const [showVideo, setShowVideo] = useState(false);

  // Wait for splash screen to finish before starting entry animations
  const [animReady, setAnimReady] = useState(() => window.__splashComplete === true);
  useEffect(() => {
    if (window.__splashComplete) { setAnimReady(true); return; }
    const handler = () => setAnimReady(true);
    window.addEventListener("splashComplete", handler, { once: true });
    return () => window.removeEventListener("splashComplete", handler);
  }, []);

  const headingLine1 = cms.heading_line1 || "HYPERTEK";
  const headingLine2 = cms.heading_line2 || "WHERE LEGENDS ARE FORGED.";
  const btn1Text = cms.button1_text || cms.cta_button_1_text || "marketplace";
  const btn1Link = cms.button1_link || cms.cta_button_1_link || "/market-place";
  const btn2Text = cms.button2_text || cms.cta_button_2_text || "Download Game";
  const bgImage = cms.background_image || heroImage;

  // Render heading line 2 with the 2nd word (LEGENDS) as outline
  const renderHeadingLine2 = (text) => {
    const words = text.split(" ");
    return words.map((word, i) => (
      <span key={i}>
        {i === 1 ? (
          <span
            style={{
              WebkitTextStroke: "2px white",
              color: "transparent",
            }}
          >
            {word}
          </span>
        ) : (
          word
        )}
        {i < words.length - 1 ? " " : ""}
      </span>
    ));
  };

  const logoItems = Array(20).fill({ text: "HYPER TEK" });

  return (
    <>
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-[1]" />

      {/* Hero Content — centered */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-24 md:pb-28 px-4">
        {/* Line 1 — large heading */}
        <motion.h1
          className="font-[Goldman] font-bold text-[clamp(40px,7vw,80px)] text-white leading-[1] uppercase tracking-wider text-center"
          variants={fadeUp}
          initial="hidden"
          animate={animReady ? "visible" : "hidden"}
          custom={0.1}
        >
          {headingLine1}
        </motion.h1>

        {/* Line 2 — with outline word */}
        <motion.h2
          className="font-[Goldman] font-bold text-[clamp(24px,4.5vw,56px)] text-white leading-[1.2] uppercase tracking-wider text-center mt-2 mb-8"
          variants={fadeUp}
          initial="hidden"
          animate={animReady ? "visible" : "hidden"}
          custom={0.25}
        >
          {renderHeadingLine2(headingLine2)}
        </motion.h2>

        {/* Buttons — simple blue background */}
        <motion.div
          className="flex flex-row items-center justify-center gap-4"
          variants={fadeUp}
          initial="hidden"
          animate={animReady ? "visible" : "hidden"}
          custom={0.45}
        >
          <Link to={btn1Link}>
            <button className="px-8 py-3 bg-[#002AA8] hover:bg-[#003BD4] text-white font-medium text-[15px] md:text-[16px] rounded-md transition-all duration-300 border border-white/20 hover:border-white/40">
              {btn1Text}
            </button>
          </Link>
          <button
            onClick={() => setShowVideo(true)}
            className="px-8 py-3 bg-transparent hover:bg-white/10 text-white font-medium text-[15px] md:text-[16px] rounded-md transition-all duration-300 border border-white/30"
          >
            {btn2Text}
          </button>
        </motion.div>
      </div>

      {/* Bottom Bar with Logos — full width */}
      <motion.div
        className="absolute bottom-0 left-0 w-full bg-[#00134C80] h-10 md:h-12 overflow-hidden z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={animReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex items-center gap-6 animate-marqueeRight whitespace-nowrap">
          {[...logoItems, ...logoItems].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 flex-shrink-0 pt-2"
            >
              <img src={Logo} alt="Logo" className="w-6 h-5 md:w-7 md:h-6" />
              <span className="text-white font-inter font-bold uppercase text-[11.69px] leading-[1] tracking-[0.08em] text-center">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
    {showVideo && <VideoModal onClose={() => setShowVideo(false)} />}
    </>
  );
}
