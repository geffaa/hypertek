import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import useSiteContent from "../../hooks/useSiteContent";

import storyBg from "../../assets/images/herostory/story_bg.jpg";
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
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const fadeRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
};

export default function StorySection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    const { data: cms } = useSiteContent("home_story");

    const bgImage = cms.background_image || storyBg;
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
                className="relative z-10 min-h-screen flex items-center w-full"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                {/* ── MOBILE layout (< lg) ── */}
                <div className="flex lg:hidden w-full flex-col gap-4 px-5 py-14">
                    {/* Card 1 */}
                    <motion.div
                        className="w-full flex flex-col gap-3"
                        variants={fadeLeft}
                        style={{
                            background: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            padding: "24px 20px",
                        }}
                    >
                        <span className="text-white font-bold tracking-[0.3em] uppercase block" style={{ fontSize: "16px" }}>
                            {leftHeading}
                        </span>
                        <h2 className="text-white font-[Goldman] font-bold" style={{ fontSize: "15px", lineHeight: "1.4" }}>
                            {leftSubheading}
                        </h2>
                        <p className="text-gray-300 text-justify" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                            {leftBody}
                        </p>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        className="w-full flex flex-col gap-3"
                        variants={fadeRight}
                        style={{
                            background: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            padding: "24px 20px",
                        }}
                    >
                        <span className="text-white font-bold tracking-[0.3em] uppercase block" style={{ fontSize: "16px" }}>
                            {rightHeading}
                        </span>
                        <h2 className="text-white font-[Goldman] font-bold" style={{ fontSize: "15px", lineHeight: "1.4" }}>
                            {rightSubheading}
                        </h2>
                        <p className="text-gray-300 text-justify" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                            {rightBody}
                        </p>
                    </motion.div>
                </div>

                {/* ── DESKTOP layout (≥ lg) ── */}
                <div className="hidden lg:grid w-full grid-cols-[1fr_auto_1fr] items-center">

                    {/* LEFT text */}
                    <motion.div
                        className="flex flex-col justify-center px-10 xl:px-28 py-20"
                        variants={fadeLeft}
                        style={{
                            background: "rgba(0,0,0,0.45)",
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                            marginRight: "-180px",
                            zIndex: 1,
                            alignSelf: "center",
                            marginTop: "300px",
                        }}
                    >
                        <span className="text-white font-bold tracking-[0.3em] uppercase mb-3 block" style={{ fontSize: "18px" }}>
                            {leftHeading}
                        </span>
                        <h2 className="text-white font-[Goldman] font-bold mb-4" style={{ fontSize: "16px", lineHeight: "1.4" }}>
                            {leftSubheading}
                        </h2>
                        <p className="text-gray-300 text-justify" style={{ fontSize: "16px", lineHeight: "1.6" }}>
                            {leftBody}
                        </p>
                    </motion.div>

                    {/* CENTER character image */}
                    <motion.div
                        className="flex items-end justify-center"
                        variants={scaleIn}
                        style={{ width: "680px", minWidth: "560px", zIndex: 2, position: "relative" }}
                    >
                        <img
                            src="/char_frame.png"
                            alt="Character"
                            loading="lazy"
                            className="w-full h-auto object-contain object-bottom"
                            style={{
                                filter: "drop-shadow(0 0 50px rgba(255,255,255,0.1))",
                                maxHeight: "100vh",
                            }}
                        />
                    </motion.div>

                    {/* RIGHT text */}
                    <motion.div
                        className="flex flex-col justify-center px-10 xl:px-28 py-20"
                        variants={fadeRight}
                        style={{
                            background: "rgba(0,0,0,0.45)",
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                            marginLeft: "-180px",
                            alignSelf: "center",
                            marginTop: "300px",
                            zIndex: 1,
                        }}
                    >
                        <span className="text-white font-bold tracking-[0.3em] uppercase mb-3 block" style={{ fontSize: "18px" }}>
                            {rightHeading}
                        </span>
                        <h2 className="text-white font-[Goldman] font-bold mb-4" style={{ fontSize: "16px", lineHeight: "1.4" }}>
                            {rightSubheading}
                        </h2>
                        <p className="text-gray-300 text-justify" style={{ fontSize: "16px", lineHeight: "1.6" }}>
                            {rightBody}
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
