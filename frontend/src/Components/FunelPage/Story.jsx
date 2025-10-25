"use client";
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const StorySection = () => {
  // useRef to track the section element for the useInView hook
  const ref = useRef(null);
  // useInView hook to trigger animations when the section is visible
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Animation variants for the container and its children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Stagger the animation of child elements
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    // Use a semantic <section> tag. Add a ref for the intersection observer.
    // The background color is slightly different to create visual separation from the hero.
    <section ref={ref} className="relative py-20 lg:pt-24 px-6 bg-[#111827] text-white overflow-hidden">
      
      {/* Optional: Subtle background pattern for texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <motion.div
        // The main container that will be animated
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-start mb-5">
          {/* <span className="text-blue-800 font-semibold tracking-widest uppercase text-sm">Our Journey</span> */}
          <h2 className="mt-2  text-4xl md:text-5xl font-bold font-bold">
            The Story Behind <span className="text-blue-800  ">Our Vision</span>
          </h2>
          <div className="mt-4 w-24 h-1 bg-blue-800 mx-auto rounded-full"></div>
        </motion.div>

        {/* Content Layout: Text and Video side-by-side on larger screens */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div variants={itemVariants} className="text-left">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              It all started with a simple question: What if a game could do more than just entertain? What if it could inspire, connect, and create a lasting impact?
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              We are a passionate team of developers, artists, and storytellers who came together to answer that question. Our mission is to create an innovative project that blends cutting-edge technology with heartfelt creativity, building a world that players don't just visit, but become a part of.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Your contribution is more than just a donation; it's the key that unlocks the next chapter of our journey. Help us bring this dream to life.
            </p>
          </motion.div>

          {/* Video Container */}
          <motion.div variants={itemVariants} className="rounded-xl overflow-hidden shadow-2xl">
            {/* 
              IMPORTANT: Replace the src with your actual video URL.
              The `title` attribute is crucial for accessibility.
              `loading="lazy"` improves performance by loading the iframe only when needed.
              `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` is standard for YouTube embeds.
            */}
            <div className="relative aspect-video">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Watch our story and see our vision in action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        {/* <motion.div variants={itemVariants} className="text-center mt-16">
          <a
            href="#team" // Link to the next section
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Meet the Minds Behind the Project
            <svg
              className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div> */}
      </motion.div>
    </section>
  );
};

export default StorySection;