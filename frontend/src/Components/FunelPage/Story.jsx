"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const StorySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-20 lg:pt-24 px-6 bg-[#111827] text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-start mb-5">
          <h2 className="mt-2 text-4xl md:text-5xl font-bold">
            The Story Behind <span className="text-blue-800">Our Vision</span>
          </h2>
          <div className="mt-4 w-24 h-1 bg-blue-800 mx-auto rounded-full"></div>
        </motion.div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div variants={itemVariants} className="text-left">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              It all started with a simple question: What if a game could do
              more than just entertain? What if it could inspire, connect, and
              create a lasting impact?
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              We are a passionate team of developers, artists, and storytellers
              who came together to answer that question. Our mission is to
              create an innovative project that blends cutting-edge technology
              with heartfelt creativity, building a world that players don't
              just visit, but become a part of.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Your contribution is more than just a donation; it's the key that
              unlocks the next chapter of our journey. Help us bring this dream
              to life.
            </p>
          </motion.div>

          {/* Video */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 w-full h-full rounded-xl"
                src="https://www.youtube.com/embed/XurjHSPn3G8"
                title="Watch our story and see our vision in action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default StorySection;
