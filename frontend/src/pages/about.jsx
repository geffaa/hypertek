import { motion } from "framer-motion";
import { useSiteContentPage } from "../hooks/useSiteContent";
import { getImageUrl } from "../Config";
import LazyImage from "../Components/Common/LazyImage";
import GlowingOrb from "../Components/Common/BgColoring";

// ── fallback assets ───────────────────────────────────────────────────────────
import aboutBg   from "../assets/images/aboutpage/about_bg.jpg";
import charImg   from "../assets/images/aboutpage/char.png";
import ourstory1 from "../assets/images/aboutpage/ourstory1.png";
import ourstory2 from "../assets/images/aboutpage/ourstory2.png";
import ourstory3 from "../assets/images/aboutpage/ourstory3.png";

// ── default texts ─────────────────────────────────────────────────────────────
const DEFAULT_SUBTITLE =
  "The year is 2117. Humanity didn't conquer the stars — it fractured into them.\nAfter Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies.\nAt the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you — a reborn Overlord, forged by legacy and technology.";

const DEFAULT_STORY =
  "Humanity didn't conquer the stars — it fractured into them.\nAfter Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies.";

// ── motion variants ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: "easeOut" },
  }),
};
const fadeLeft  = { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } } };
const fadeRight = { hidden: { opacity: 0, x:  48 }, visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } } };

// ── Zigzag connectors — no dots, just lines ───────────────────────────────────
function ConnectorRight() {
  return (
    <div className="hidden md:block w-full" style={{ height: 100 }}>
      <svg className="w-full h-full" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
        <polyline
          points="400,0 400,50 600,50 600,100"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function ConnectorLeft() {
  return (
    <div className="hidden md:block w-full" style={{ height: 100 }}>
      <svg className="w-full h-full" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
        <polyline
          points="600,0 600,50 400,50 400,100"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

// ── Helper: render text with \n as line breaks ────────────────────────────────
function MultilineText({ text, className }) {
  return (
    <p className={className}>
      {text.split("\n").map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <><br /><br /></>}
        </span>
      ))}
    </p>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function About() {
  const { sections: cms } = useSiteContentPage("about");

  const top   = cms.about_top   || {};
  const story = cms.about_story || {};

  // Hero
  const heroHeading  = top.heading    || "About Us";
  const heroSubtitle = top.subtitle   || DEFAULT_SUBTITLE;
  const bgImage      = top.bg_image   ? getImageUrl(top.bg_image)   : aboutBg;
  const charImage    = top.char_image ? getImageUrl(top.char_image) : charImg;

  // Stories
  const story1Body  = story.body         || DEFAULT_STORY;
  const story1Image = story.story_image  ? getImageUrl(story.story_image)  : ourstory1;
  const story2Body  = story.story2_body  || DEFAULT_STORY;
  const story2Image = story.story2_image ? getImageUrl(story.story2_image) : ourstory2;
  const story3Body  = story.story3_body  || DEFAULT_STORY;
  const story3Image = story.story3_image ? getImageUrl(story.story3_image) : ourstory3;

  return (
    <div className="relative text-white overflow-x-hidden" style={{ background: "#060610" }}>

      {/* Blue glow orbs — same as other pages */}
      <GlowingOrb Xaxis={100} Yaxis={1200} />
      <GlowingOrb Xaxis={1300} Yaxis={2000} />

      {/* ═══════════════════════════════════════════════════════
          HERO — full viewport height, bg image + char
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay — fade to page bg at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,6,16,0.45) 0%, rgba(6,6,16,0.60) 55%, #060610 100%)",
          }}
        />

        <div className="relative z-10 w-full max-w-full mx-auto px-6 md:px-12 xl:px-20 pt-24 pb-16 flex flex-col md:flex-row items-center gap-10 md:gap-0">

          {/* Left — text */}
          <motion.div
            className="flex-1 flex flex-col gap-6 md:pr-16"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.h1
              variants={fadeUp}
              className="font-[Goldman] font-bold text-4xl md:text-5xl xl:text-[56px] uppercase text-white leading-tight"
            >
              {heroHeading}
            </motion.h1>
            <motion.div variants={fadeUp} custom={1}>
              <MultilineText
                text={heroSubtitle}
                className="text-white/70 text-sm md:text-[15px] leading-[1.9] max-w-[500px]"
              />
            </motion.div>
          </motion.div>

          {/* Right — character (hidden on mobile) */}
          <motion.div
            className="hidden md:flex flex-shrink-0 justify-end"
            initial={{ opacity: 0, scale: 0.92, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <LazyImage
              src={charImage}
              alt="Character"
              fallback={charImg}
              className="h-[500px] xl:h-[700px] w-[280px] xl:w-[420px]"
              imgClassName="object-contain drop-shadow-2xl"
            />
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          OUR STORY
      ════════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-[1280px] mx-auto px-6 md:px-12 xl:px-16 pt-20 pb-28">

        {/* Title with lines */}
        <div className="flex items-center gap-6 mb-20 md:mb-24">
          <div className="flex-1 h-px bg-white/15" />
          <h2 className="font-[Goldman] font-bold text-base md:text-xl uppercase tracking-[0.35em] text-white whitespace-nowrap">
            Our Story
          </h2>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Story 1 — Image LEFT · Text RIGHT */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 xl:gap-20">
          <motion.div
            className="w-full md:w-[44%] flex-shrink-0"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <LazyImage
              src={story1Image}
              alt="Story 1"
              fallback={ourstory1}
              className="w-full h-[240px] md:h-[300px] xl:h-[340px] rounded-2xl"
              imgClassName="object-cover"
            />
          </motion.div>
          <motion.div
            className="flex-1"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <MultilineText
              text={story1Body}
              className="text-white/70 text-sm md:text-[15px] leading-[1.9]"
            />
          </motion.div>
        </div>

        {/* Connector → */}
        <ConnectorRight />
        <div className="md:hidden h-10" />

        {/* Story 2 — Text LEFT · Image RIGHT */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 xl:gap-20">
          <motion.div
            className="flex-1 order-2 md:order-1"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <MultilineText
              text={story2Body}
              className="text-white/70 text-sm md:text-[15px] leading-[1.9]"
            />
          </motion.div>
          <motion.div
            className="w-full md:w-[44%] flex-shrink-0 order-1 md:order-2"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <LazyImage
              src={story2Image}
              alt="Story 2"
              fallback={ourstory2}
              className="w-full h-[240px] md:h-[300px] xl:h-[340px] rounded-2xl"
              imgClassName="object-cover"
            />
          </motion.div>
        </div>

        {/* Connector ← */}
        <ConnectorLeft />
        <div className="md:hidden h-10" />

        {/* Story 3 — Image LEFT · Text RIGHT */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 xl:gap-20">
          <motion.div
            className="w-full md:w-[44%] flex-shrink-0"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <LazyImage
              src={story3Image}
              alt="Story 3"
              fallback={ourstory3}
              className="w-full h-[240px] md:h-[300px] xl:h-[340px] rounded-2xl"
              imgClassName="object-cover"
            />
          </motion.div>
          <motion.div
            className="flex-1"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <MultilineText
              text={story3Body}
              className="text-white/70 text-sm md:text-[15px] leading-[1.9]"
            />
          </motion.div>
        </div>

      </section>

    </div>
  );
}

export default About;
