import { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Network, Gem, Zap } from "lucide-react";
import useSiteContent from "../../hooks/useSiteContent";

const AVATAR_FILES = [
  "commander-elite.png",
  "dryads-female.png",
  "dryads-male.png",
  "fawnus-female.png",
  "fawnus-male.png",
  "geodians-female.png",
  "geodians-male.png",
  "lithionites-female.png",
  "lithionites-male.png",
  "mantasquads-female.png",
  "mantasquads-male.png",
  "marmulus-female.png",
  "marmulus-male.png",
  "ophidians-female.png",
  "ophidians-male.png",
  "overlord.png",
  "team-specialist-major.png",
];

import storyBg   from "../../assets/images/herostory/story_bg.jpg";
import lineRight from "../../assets/images/herostory/line_right.png";
import lineLeft  from "../../assets/images/herostory/line_left.png";

const KEY_HIGHLIGHTS = [
  { Icon: Network, label: "Interconnected Universe", desc: "3 games — 1 shared economy and progression system", color: "rgba(56,189,248,0.85)" },
  { Icon: Gem,     label: "True Ownership",           desc: "NFAs with guaranteed minimum buy-back",            color: "rgba(167,139,250,0.85)" },
  { Icon: Zap,     label: "Play-to-Earn",             desc: "Every action contributes to your real-world rewards", color: "rgba(251,191,36,0.85)" },
];

const containerVariants = {
  hidden:   { opacity: 0 },
  visible:  { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const fadeRight = { hidden: { opacity: 0, x: 80 }, visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } } };
const scaleIn   = { hidden: { opacity: 0, scale: 0.8, y: 40 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } } };
const fadeUp    = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } };

export default function StorySection() {
  const ref       = useRef(null);
  const isInView  = useInView(ref, { once: true, margin: "-60px" });
  const { data: cms } = useSiteContent("home_story");

  const randomAvatar = useMemo(() => {
    const file = AVATAR_FILES[Math.floor(Math.random() * AVATAR_FILES.length)];
    return `/avatar/${file}`;
  }, []);

  const bgImage        = cms.background_image || storyBg;
  const charImage      = cms.character_image  || randomAvatar;
  const leftHeading    = cms.left_heading     || "STORY";
  const leftSubheading = cms.left_subheading  || "The year is 2117.";
  const leftBody       = cms.left_body        ||
    "Humanity didn't conquer the stars — it fractured into them. After Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. At the center of it all lies the Echo Core — a quantum relic that awakens you as a reborn Overlord, forged by legacy and technology.";

  return (
    <section
      ref={ref}
      data-edit-section="home_story"
      data-edit-label="Story Section"
      className="relative w-full min-h-screen overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#060a1f]/75 z-[1]" />

      {/* Decorative lines */}
      <img src={lineRight} alt="" className="absolute top-8 right-0 w-[200px] md:w-[300px] opacity-40 z-[2]" />
      <img src={lineLeft}  alt="" className="absolute bottom-8 left-0 w-[200px] md:w-[300px] opacity-40 z-[2]" />

      <motion.div
        className="relative z-10 h-full min-h-screen flex items-center"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

            {/* LEFT: Character */}
            <motion.div className="hidden lg:flex relative items-center justify-end" variants={scaleIn}>
              <img
                src={charImage}
                alt="Character"
                loading="lazy"
                className="relative z-[2] w-[420px] lg:w-[600px] 2xl:w-[680px] h-auto object-contain"
                style={{ filter: "drop-shadow(0 0 50px rgba(255,255,255,0.1))" }}
              />
            </motion.div>

            {/* RIGHT: Content */}
            <div className="flex flex-col gap-5 lg:pl-8">

              {/* Heading */}
              <motion.div variants={fadeRight}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-[2px] bg-white/50" />
                  <span className="text-white/70 font-bold text-sm tracking-[0.3em] uppercase">{leftHeading}</span>
                </div>
                <h2 className="text-white font-[Goldman] font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
                  {leftSubheading}
                </h2>
              </motion.div>

              {/* Story body — single concise card */}
              <motion.div
                className="rounded-xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.10)" }}
                variants={fadeRight}
              >
                <p className="text-gray-300 text-sm md:text-[15px] leading-relaxed text-justify">
                  {leftBody}
                </p>
              </motion.div>

              {/* Key highlights */}
              <motion.div
                className="rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.10)" }}
                variants={fadeUp}
              >
                {KEY_HIGHLIGHTS.map((h, idx) => {
                  const Icon = h.Icon;
                  return (
                    <div
                      key={h.label}
                      className="flex items-center gap-3 px-5 py-3"
                      style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.07)" : "none" }}
                    >
                      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-lg"
                        style={{ background: `${h.color}15`, border: `1px solid ${h.color}35` }}>
                        <Icon style={{ color: h.color, width: 14, height: 14 }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs font-semibold">{h.label}</p>
                        <p className="text-white/45 text-[11px] mt-0.5">{h.desc}</p>
                      </div>
                      <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${h.color}, transparent)`, opacity: 0.6 }} />
                    </div>
                  );
                })}
              </motion.div>

              {/* CTA */}
              <motion.div className="flex items-center gap-4 mt-1" variants={fadeUp}>
                <Link
                  to="/about"
                  className="px-6 py-2.5 text-[10px] font-bold uppercase transition-all hover:brightness-125"
                  style={{
                    background: "rgba(0,10,40,0.75)",
                    border: "1px solid rgba(56,189,248,0.55)",
                    borderTop: "2px solid rgba(56,189,248,0.85)",
                    clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                    fontFamily: "Orbitron,sans-serif",
                    boxShadow: "0 0 24px rgba(56,189,248,0.20)",
                    color: "rgba(56,189,248,0.95)",
                    letterSpacing: "0.14em",
                  }}
                >
                  Read Our Full Story
                </Link>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
                <span className="text-white/15 text-[10px] tracking-[0.4em] uppercase font-bold">Hyper Tek 100</span>
              </motion.div>

            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
