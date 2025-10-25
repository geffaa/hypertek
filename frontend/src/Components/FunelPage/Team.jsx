"use client";
import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import UsmanImage from "../../assets/images/funnel/usman.jpeg";
import ceo from "../../assets/images/funnel/ceo.png";
import projectManager from "../../assets/images/funnel/projecmanger.png";
import tester from "../../assets/images/funnel/walled.png";
import wahab from "../../assets/images/funnel/wahab.png";
import saif from "../../assets/images/funnel/saif.png";

// --- Team Data ---
const teamData = [
  {
    name: "Zubair Malik",
    role: "Chief Executive Officer",
    img: ceo,
    bio: "Visionary leader with 12+ years in tech entrepreneurship and business strategy. Driving innovation and growth across multiple successful ventures.",
    expertise: ["Business Strategy", "Tech Innovation", "Team Leadership", "Investment"],
    socials: [
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
  },
  {
    name: "Huzaiffa Rajpoot",
    role: "Project Manager",
    img: projectManager,
    bio: "Agile expert with 8+ years managing complex software development projects. Specialized in delivering products on time and within budget.",
    expertise: ["Agile Methodology", "Team Coordination", "Risk Management", "Scrum"],
    socials: [
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
  },
  {
    name: "Muhammad Saif",
    role: "Senior UI/UX Designer",
    img: saif,
    bio: "Creative designer focused on user-centered design and modern interfaces. Passionate about creating intuitive and beautiful user experiences.",
    expertise: ["UI/UX Design", "Prototyping", "Design Systems", "User Research"],
    socials: [
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
  },
  {
    name: "Hazrat Usman",
    role: "MERN-Stack Developer",
    img: UsmanImage,
    bio: "Full-stack developer specializing in scalable applications and modern frameworks. Expert in both frontend and backend technologies.",
    expertise: ["React/Next.js", "Node.js", "Database Design", "API Development"],
    socials: [
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
  },
  {
    name: "Waleed bin Khurshid",
    role: "Quality Assurance Tester",
    img: tester,
    bio: "Dedicated QA professional ensuring product excellence through comprehensive testing protocols. Committed to delivering bug-free, high-quality software.",
    expertise: ["Test Automation", "Quality Protocols", "Performance Testing", "CI/CD"],
    socials: [
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
  },
  {
    name: "Wahab Nadeem",
    role: "MERN Stack Developer",
    img: wahab,
    bio: "MERN stack specialist focused on building robust and scalable full-stack applications. Expert in MongoDB, Express, React, and Node.js.",
    expertise: ["MongoDB", "Express.js", "React", "Node.js", "REST APIs"],
    socials: [
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
  },
];

// --- Social Icons Component ---
const SocialIcon = ({ platform, url }) => {
  const icons = {
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.854 0-2.137 1.447-2.137 2.944v5.662H9.35V9h3.414v1.561h.047c.476-.9 1.637-1.852 3.369-1.852 3.602 0 4.266 2.372 4.266 5.456v6.287zM5.337 7.433c-1.144 0-2.069-.926-2.069-2.068 0-1.143.925-2.069 2.069-2.069s2.069.926 2.069 2.069c0 1.142-.925 2.068-2.069 2.068zM6.956 20.452H3.717V9h3.239v11.452z" />
      </svg>
    ),
    github: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 
        3.438 9.8 8.205 11.385.6.113.82-.258.82-.577
        0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61
        -.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.083-.729.083-.729
        1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997
        .107-.775.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.931
        0-1.31.467-2.381 1.235-3.221-.135-.303-.54-1.523.105-3.176
        0 0 1.005-.322 3.3 1.23a11.48 11.48 0 013.003-.404c1.02.005 2.045.138 3.003.404
        2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176
        .765.84 1.23 1.911 1.23 3.221 0 4.609-2.807 5.625-5.479 5.921
        .429.372.81 1.102.81 2.222 0 1.606-.015 2.896-.015 3.286
        0 .315.21.694.825.576C20.565 22.092 24 17.592 24 12.297
        c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:scale-110 transition-all duration-300"
    >
      {icons[platform]}
    </a>
  );
};

// --- Team Member Card ---
const TeamMemberCard = ({ member }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800 to-gray-900 group cursor-pointer transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05 }}
    >
      {/* Image */}
      <img
        src={member.img}
        alt={member.name}
        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Overlay on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex flex-col justify-end items-center text-center p-6"
          >
            <h3 className="text-white text-lg font-bold">{member.name}</h3>
            <p className="text-blue-400 text-sm mb-3">{member.role}</p>
            <div className="flex gap-4 mb-4">
              {member.socials.map((social, i) => (
                <SocialIcon key={i} {...social} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Team Section ---
const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      id="team"
      className="relative py-20 lg:py-24 px-6 bg-gradient-to-br from-gray-900 via-[#0B0E14] to-gray-900 text-white overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          {/* <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-blue-400 tracking-widest uppercase">
              OUR TEAM
            </span>
          </div> */}

          <h2 className=" text-4xl md:text-5xl font-bold mb-6">
            Meet Our <span className="text-blue-400">Expert</span> Team
          </h2>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Our talented team combines diverse expertise to deliver exceptional digital experiences. 
            Hover over any team member to learn more about their role and connect with them.
          </p>
        </motion.div>

        {/* Team Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {teamData.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
