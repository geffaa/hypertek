import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import heroImage from "../../assets/images/hero.jpg";
import Logo from "../../assets/logo.png";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../Buttons/Button2";
import "../../App.css";
import { Link } from "react-router-dom";
import useSiteContent from "../../hooks/useSiteContent";

// Renders heading text where the 2nd word is outline-only (stroke, no fill)
function HeadingWithOutlineWord({ text, className }) {
  const words = text.split(" ");
  return (
    <h1 className={className}>
      {words.map((word, i) => (
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
      ))}
    </h1>
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

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut", delay },
  }),
};

export default function Hero() {
  const { data: cms } = useSiteContent("home_hero");

  // Wait for splash screen to finish before starting entry animations
  const [animReady, setAnimReady] = useState(() => window.__splashComplete === true);
  useEffect(() => {
    if (window.__splashComplete) { setAnimReady(true); return; }
    const handler = () => setAnimReady(true);
    window.addEventListener("splashComplete", handler, { once: true });
    return () => window.removeEventListener("splashComplete", handler);
  }, []);

  const headingLine1 = cms.heading_line1 || "Hyper Tek 100:";
  const headingLine2 = cms.heading_line2 || "WHERE LEGENDS Are Forged.";
  const btn1Text = cms.cta_button_1_text || "MarketPlace";
  const btn1Link = cms.cta_button_1_link || "/market-place";
  const btn2Text = cms.cta_button_2_text || "Download Game";
  const btn2Link = cms.cta_button_2_link || "#";
  const bgImage = cms.background_image || heroImage;

  const logoItems = Array(20).fill({ text: "Hyper Tek" });

  return (
    <div
      className="w-full h-screen scale-x-[-1] relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      {/* Hero Content */}
      <div className="scale-x-[-1] z-10 flex flex-col justify-center h-full mx-auto px-8 md:px-16 max-w-[1440px]">
        {/* Text + Buttons block */}
        <div className="flex flex-col md:ml-10 max-w-[700px] items-center">
          {/* Line 1 */}
          <motion.h1
            className="font-[Goldman] font-bold text-[clamp(30px,4.5vw,52px)] text-white leading-[110%] uppercase m-0 text-center w-full"
            variants={fadeLeft}
            initial="hidden"
            animate={animReady ? "visible" : "hidden"}
            custom={0.1}
          >
            {headingLine1}
          </motion.h1>

          {/* Line 2 — second word is outline */}
          <motion.div
            className="mb-8 w-full"
            variants={fadeLeft}
            initial="hidden"
            animate={animReady ? "visible" : "hidden"}
            custom={0.25}
          >
            <HeadingWithOutlineWord
              text={headingLine2}
              className="font-[Goldman] font-bold text-[clamp(30px,4.5vw,52px)] text-white leading-[110%] uppercase m-0 text-center"
            />
          </motion.div>

          {/* Buttons — centered within text block */}
          <motion.div
            className="flex flex-row items-center justify-center gap-4"
            variants={fadeUp}
            initial="hidden"
            animate={animReady ? "visible" : "hidden"}
            custom={0.45}
          >
            <Link to={btn1Link}>
              <CustomButton text={btn1Text} />
            </Link>
            <Link
              to={btn2Link}
              className="hidden md:block"
              onClick={(e) => {
                if (btn2Link === "#") e.preventDefault();
              }}
            >
              <CustomButton2 text={btn2Text} />
            </Link>
          </motion.div>
        </div>
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
              className="flex items-center gap-2 flex-shrink-0 pt-2 scale-x-[-1]"
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
  );
}
