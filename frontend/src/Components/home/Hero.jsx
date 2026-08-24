import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import heroImage from "../../assets/images/hero.webp";
import { VIDEO_BASE_URL } from "../../Config";
import Logo from "/logo-white.png";
import "../../App.css";
import { Link, useNavigate } from "react-router-dom";
import useSiteContent from "../../hooks/useSiteContent";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

function VideoModal({ onClose }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handleKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handleKey);
    // Hide navbar while modal is open
    const navbar = document.querySelector("nav");
    if (navbar) navbar.style.visibility = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (navbar) navbar.style.visibility = "";
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.96)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          position: "relative", width: "100%", maxWidth: "896px",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Close button — inside video container, top-right corner */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: 10, right: 10,
            zIndex: 10,
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: "rgba(0,0,0,0.65)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 6,
            color: "rgba(255,255,255,0.75)",
            fontSize: 13, cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.9)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.65)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
        >
          <X style={{ width: 14, height: 14 }} /> Close
        </button>
        <video
          ref={videoRef}
          src={`${VIDEO_BASE_URL}/download_page.mp4`}
          autoPlay
          playsInline
          controls
          preload="metadata"
          style={{
            width: "100%", borderRadius: 12,
            maxHeight: "80vh", background: "#000",
            display: "block",
          }}
        />
        {/* Try the UI button below video */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={() => { handleClose(); navigate("/gaming"); }}
            style={{
              padding: "10px 32px",
              background: "rgba(0,42,168,0.85)",
              border: "1px solid rgba(56,189,248,0.45)",
              borderTop: "2px solid rgba(56,189,248,0.8)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "Orbitron, sans-serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.2s, box-shadow 0.2s",
              boxShadow: "0 0 24px rgba(56,189,248,0.2)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,59,212,0.95)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,42,168,0.85)"; }}
          >
            {t("hero.tryUI")}
          </button>
        </div>
      </div>
    </div>,
    document.body
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
  const { t } = useTranslation();
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

  const headingLine1 = cms.heading_line1 || "HYPER TEK 100:";
  const headingLine2 = t("hero.headingLine2") || cms.heading_line2 || "WHERE LEGENDS ARE FORGED";
  const btn1Text = t("hero.marketplace");
  const btn1Link = cms.button1_link || cms.cta_button_1_link || "/market-place";
  const btn2Text = t("hero.downloadGame");
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
      data-edit-section="home_hero"
      data-edit-label="Welcome Banner"
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
