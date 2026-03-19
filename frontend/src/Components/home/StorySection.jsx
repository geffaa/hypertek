import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import useSiteContent from "../../hooks/useSiteContent";

// Fallback assets
import storyBg from "../../assets/images/herostory/story_bg.jpg";
import charStory from "../../assets/images/herostory/char_story1.png";
import lineRight from "../../assets/images/herostory/line_right.png";
import lineLeft from "../../assets/images/herostory/line_left.png";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
};

const fadeLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const fadeRight = {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
};

export default function StorySection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    const { data: cms } = useSiteContent("home_story");

    const bgImage = cms.background_image || storyBg;
    const charImage = cms.character_image || charStory;
    const leftHeading = cms.left_heading || "STORY";
    const leftSubheading = cms.left_subheading || "The year is 2117.";
    const leftBody =
        cms.left_body ||
        "Humanity didn't conquer the stars it fractured into them. After Earth collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you a reborn Overlord, forged by legacy and technology.";
    const rightHeading = cms.right_heading || "STORY";
    const rightSubheading = cms.right_subheading || "The year is 2117.";
    const rightBody =
        cms.right_body ||
        "Humanity didn't conquer the stars it fractured into them. After Earth collapse, survivors launched the Hyper Tek Exodus, scattering AI, enhanced genomes, and prototypes across thousands of seed worlds. Each evolved in isolation forming new species, cultures, and technologies. At the center of it all lies the Echo Core, a quantum relic now pulsing with riddles, memories, and a call to power. It awakens you a reborn Overlord, forged by legacy and technology.";

    return (
        <section
            ref={ref}
            className="relative w-full min-h-screen overflow-hidden"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-[#060a1f]/75 z-[1]" />

            {/* Decorative lines */}
            <img
                src={lineRight}
                alt=""
                className="absolute top-8 right-0 w-[200px] md:w-[300px] opacity-40 z-[2]"
            />
            <img
                src={lineLeft}
                alt=""
                className="absolute bottom-8 left-0 w-[200px] md:w-[300px] opacity-40 z-[2]"
            />

            <motion.div
                className="relative z-10 h-full min-h-screen flex items-center"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-16">
                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

                        {/* LEFT: Character — hidden on mobile */}
                        <motion.div
                            className="hidden lg:flex relative items-center justify-end"
                            variants={scaleIn}
                        >
                            <img
                                src={charImage}
                                alt="Character"
                                loading="lazy"
                                className="relative z-[2] w-[420px] lg:w-[600px] 2xl:w-[680px] h-auto object-contain"
                                style={{ filter: "drop-shadow(0 0 50px rgba(255,255,255,0.1))" }}
                            />
                        </motion.div>

                        {/* RIGHT: Story text blocks */}
                        <div className="flex flex-col gap-6 lg:pl-8">
                            {/* Title */}
                            <motion.div variants={fadeRight}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-[2px] bg-white/50" />
                                    <span className="text-white/70 font-bold text-sm tracking-[0.3em] uppercase">
                                        {leftHeading}
                                    </span>
                                </div>
                                <h2 className="text-white font-[Goldman] font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
                                    {leftSubheading}
                                </h2>
                            </motion.div>

                            {/* Left story block — glass card */}
                            <motion.div
                                className="rounded-xl p-6"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                                variants={fadeRight}
                            >
                                <p className="text-gray-300 text-sm md:text-[15px] leading-relaxed text-justify">
                                    {leftBody}
                                </p>
                            </motion.div>

                            {/* Right story block — glass card variant */}
                            <motion.div
                                className="rounded-xl p-6"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}
                                variants={fadeRight}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-[2px] bg-white/30" />
                                    <span className="text-white/50 font-semibold text-xs tracking-[0.2em] uppercase">
                                        {rightHeading}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold text-lg mb-2">{rightSubheading}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed text-justify">
                                    {rightBody}
                                </p>
                            </motion.div>

                            {/* Decorative bottom line */}
                            <motion.div
                                className="flex items-center gap-4 mt-2"
                                variants={fadeUp}
                            >
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/30 to-transparent" />
                                <span className="text-white/20 text-xs tracking-[0.5em] uppercase font-bold">
                                    Hyper Tek 100
                                </span>
                                <div className="flex-1 h-[1px] bg-gradient-to-l from-white/30 to-transparent" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
