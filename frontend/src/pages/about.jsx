import React from "react";
import CustomButton from "../Components/Buttons/Button1";
import RightImage from "../assets/images/aboutpage/aboutRight.png";
import exchange from "../assets/images/aboutpage/Exchange.png";
import game from "../assets/images/aboutpage/game.png";
import vector from "../assets/images/aboutpage/Vector.png";
import GlowingOrb from "../Components/Common/BgColoring";
import bgleft from "../assets/images/about/bgleft.jpg";
import centerBg from "../assets/images/about/centerbg.png";
import bgright from "../assets/images/about/bgright.jpg";
import abouttopbg from "../assets/images/about/abouttopbg.png";
import leftImage from "../assets/images/about/leftImage.png";
import CenterImage from "../assets/images/about/centerImae.png";
import rightImage from "../assets/images/about/rightImage.png";
import { useSiteContentPage } from "../hooks/useSiteContent";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" },
  }),
};
const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const DEFAULT_WAR_ITEMS = [
  { title: "HyperQuest 100 | The Awakening", description: "Explore ruins, clash with factions, and uncover ancient tech. Your choices shape your skills, species loyalty, and path: liberator or dominator, relic hunter or techno savant." },
  { title: "Hyper Racing 100 — The Velocity Wars", description: "On Blacktrack Circuits, speed is war. Factions battle at 900 kph for control of energy routes and warp towers. Your vehicle is your weapon and your rise rewrites the map." },
  { title: "Overlord Realm | The Final Ascent", description: "Establish dominion across stars. Conquer with armies, alliances, or fear. Deploy psychic storms, orbital AI, and propaganda to bend entire systems to your rule." },
];

const DEFAULT_ECOSYSTEM = [
  { title: "NFA", description: "Discover and own NFAs that are as rare as they are valuable." },
  { title: "Game", description: "Step into Hyper Tek and be part of a living universe where racing, quests, and realms collide." },
  { title: "MarketPlace", description: "The Hyper Tek Marketplace is your gateway to rare gear, powerful NFAs, and exclusive upgrades that shape your journey." },
];

const ECOSYSTEM_ICONS = [vector, game, exchange];

function About() {
  const { sections: cms } = useSiteContentPage("about");

  const top = cms.about_top || {};
  const story = cms.about_story || {};
  const war = cms.about_war || {};
  const eco = cms.about_ecosystem || {};

  const pageHeading = top.heading || "About Us";
  const pageSubtitle = top.subtitle || "Empowering creators and collectors through blockchain technology. Hyper Tek is where innovation meets art.";
  const storyTitle = story.title || "The year in 2117";
  const storyBody = story.body || "The year is 2117. Humanity didn't conquer the stars — it fractured into them. After Earth's collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you — a reborn Overlord, forged by legacy and technology.";
  const storyImage = story.story_image || RightImage;
  const warTitle = war.title || "Three Fronts of War";
  const warItems = Array.isArray(war.war_items) ? war.war_items : DEFAULT_WAR_ITEMS;
  const warImage = war.war_image || RightImage;
  const ecoHeading = eco.heading || "Our Ecosystem";
  const ecoSubtitle = eco.subtitle || "Trusted by millions, we bring you a world-class suite of financial products in one platform.";
  const ecoItems = Array.isArray(eco.ecosystem_items) ? eco.ecosystem_items : DEFAULT_ECOSYSTEM;

  return (
    <div className="relative text-white overflow-hidden" style={{ background: "#060610" }}>
      <GlowingOrb Xaxis={-100} Yaxis={200} />
      <GlowingOrb Xaxis={1200} Yaxis={1400} />

      {/* ── Hero Banner ── */}
      <div className="relative flex flex-col items-center text-center px-4 pt-12 pb-10 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src={abouttopbg} alt="" className="w-full h-full object-cover" style={{ opacity: 0.5 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,6,16,0.1) 0%, rgba(6,6,16,0.65) 65%, #060610 100%)" }} />
        </div>

        {/* Title */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-4 max-w-[800px] mx-auto mt-8"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.h1 variants={fadeUp} className="font-inter font-semibold text-[40px] md:text-[52px] leading-[120%]">
            {pageHeading}
          </motion.h1>
          <motion.p variants={fadeUp} className="font-inter text-[15px] md:text-[18px] leading-[160%] text-white/75 max-w-[600px]">
            {pageSubtitle}
          </motion.p>
        </motion.div>

        {/* 3 Characters */}
        <motion.div
          className="relative z-10 mt-8 w-[314px] h-[256px] md:w-[640px] md:h-[523px]"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        >
          <div className="opacity-20 absolute z-10 top-[40px] left-0 w-[124px] h-[216px] rounded-[79px] md:w-[253px] md:h-[440px] md:top-[80px] md:rounded-[161px]"
            style={{ backgroundImage: `url(${bgleft})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <img src={leftImage} alt="" className="absolute z-20 top-[66px] left-0 w-[117px] h-[165px] md:top-[100px] md:left-[18px] md:w-[238px] md:h-[336px]" style={{ objectFit: "contain" }} />

          <div className="opacity-20 absolute z-10 top-[40px] left-[190px] w-[124px] h-[216px] rounded-[79px] md:top-[80px] md:left-[423px] md:w-[253px] md:h-[440px] md:rounded-[161px]"
            style={{ backgroundImage: `url(${bgright})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <img src={rightImage} alt="" className="absolute z-20 top-[65px] left-[202px] w-[117px] h-[166px] md:top-[110px] md:left-[433px] md:w-[239px] md:h-[339px]" style={{ objectFit: "contain" }} />

          <div className="opacity-20 absolute z-10 top-[20px] left-[85px] w-[147px] h-[256px] rounded-[79px] md:w-[300px] md:h-[523px] md:top-[23px] md:left-[207px] md:rounded-[161px]"
            style={{ backgroundImage: `url(${centerBg})`, backgroundSize: "cover" }} />
          <img src={CenterImage} alt="" className="absolute z-30 top-[52px] left-[97px] w-[136px] h-[191px] md:top-[75px] md:left-[211px] md:w-[276px] md:h-[391px]" style={{ objectFit: "contain" }} />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="relative z-10 mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a href="#" className="hidden sm:inline-block">
            <CustomButton text="Download Game" />
          </a>
        </motion.div>
      </div>

      {/* ── Story Section — Text LEFT, Image RIGHT (home-style) ── */}
      <section className="relative w-full overflow-hidden pt-14 md:pt-20">
        <div className="max-w-[1450px] mx-auto lg:pl-0 lg:pr-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">

            {/* Left — text */}
            <motion.div
              className="flex-1 flex flex-col gap-5 px-6 lg:pl-16 xl:pl-24 lg:pr-6 pb-10 lg:pb-16"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 variants={fadeUp} custom={0} className="font-inter font-semibold text-2xl md:text-[28px] leading-tight">
                {storyTitle}
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="font-inter text-sm md:text-base leading-[1.9] text-white/75">
                {storyBody}
              </motion.p>
            </motion.div>

            {/* Right — image, flush to edge on desktop */}
            <motion.div
              className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <img
                src={storyImage}
                alt="The year in 2117"
                className="w-full h-[320px] md:h-[420px] lg:h-[500px] object-cover lg:rounded-l-2xl"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── War Section — Image LEFT, Text RIGHT (home-style) ── */}
      <section className="relative w-full overflow-hidden pt-6 md:pt-10">
        <div className="max-w-[1450px] mx-auto lg:pl-0 lg:pr-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">

            {/* Left — image, flush to edge on desktop */}
            <motion.div
              className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 order-1"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <img
                src={warImage}
                alt="Three Fronts of War"
                className="w-full h-[320px] md:h-[420px] lg:h-[500px] object-cover lg:rounded-r-2xl"
              />
            </motion.div>

            {/* Right — text */}
            <motion.div
              className="flex-1 flex flex-col gap-4 px-6 lg:pl-10 xl:pl-16 lg:pr-10 pb-10 lg:pb-16 order-2"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 variants={fadeUp} custom={0} className="font-inter font-semibold text-2xl md:text-[28px] leading-tight">
                {warTitle}
              </motion.h2>
              <div className="flex flex-col gap-4 mt-1">
                {warItems.map((item, idx) => (
                  <motion.p key={idx} variants={fadeUp} custom={idx + 1}
                    className="font-inter text-sm md:text-base leading-[1.9] text-white/75"
                  >
                    <span className="font-semibold text-white">{item.title}</span>
                    {item.description ? ` — ${item.description}` : ""}
                  </motion.p>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Ecosystem Section ── */}
      <motion.section
        className="max-w-[1161px] mx-auto px-6 pt-16 pb-20 flex flex-col items-center gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        <motion.h2 variants={fadeUp} className="font-inter font-bold text-[28px] md:text-[36px] text-center">
          {ecoHeading}
        </motion.h2>
        <motion.p variants={fadeUp} className="font-inter text-base md:text-lg max-w-[560px] text-center text-white/70 leading-relaxed">
          {ecoSubtitle}
        </motion.p>

        <div className="flex flex-col md:flex-row w-full gap-6 mt-8 items-stretch">
          {ecoItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              custom={idx}
              className="flex-1 rounded-2xl bg-[#080E26] border border-white/5 flex flex-col items-center p-8 text-center gap-4"
            >
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/5">
                <img src={ECOSYSTEM_ICONS[idx] || ECOSYSTEM_ICONS[0]} alt={item.title} className="w-12 h-12 object-contain" />
              </div>
              <h3 className="font-inter font-semibold text-xl text-white">{item.title}</h3>
              <p className="font-inter text-sm md:text-base text-white/70 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

    </div>
  );
}

export default About;
