import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MODES = {
  racing: {
    label: "RACING",
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.2)",
    panelImg: "/racing_panel.png",
    heading: "HyperTek Racing",
    subtitle: "Speed. Precision. Dominance.",
    description:
      "Coming soon — detailed information about Racing mode will be added here. Build your championship team with Racing Vehicle NFCs, compete on futuristic tracks, and race your way to the top of the HyperTek leaderboard.",
    sections: [
      { title: "What is Racing Mode?", body: "Content coming soon." },
      { title: "How to Get Started",   body: "Content coming soon." },
      { title: "Rewards & Prizes",     body: "Content coming soon." },
    ],
  },
  quest: {
    label: "QUEST",
    accent: "#38bdf8",
    glow: "rgba(56,189,248,0.2)",
    panelImg: "/quest_space.png",
    heading: "HyperTek Quest",
    subtitle: "Explore. Discover. Conquer.",
    description:
      "Coming soon — detailed information about Quest mode will be added here. Embark on epic missions across the HyperTek universe, uncover hidden relics, and build your legacy through exploration and strategy.",
    sections: [
      { title: "What is Quest Mode?", body: "Content coming soon." },
      { title: "How to Get Started",  body: "Content coming soon." },
      { title: "Rewards & Prizes",    body: "Content coming soon." },
    ],
  },
  overlord: {
    label: "OVERLORD",
    accent: "#f87171",
    glow: "rgba(248,113,113,0.2)",
    panelImg: "/overlord_panel.png",
    heading: "HyperTek Overlord",
    subtitle: "Command. Conquer. Rule.",
    description:
      "Coming soon — detailed information about Overlord mode will be added here. Rise as a reborn Overlord, command armies, forge alliances, and dominate the Echo Core in the ultimate battle for supremacy.",
    sections: [
      { title: "What is Overlord Mode?", body: "Content coming soon." },
      { title: "How to Get Started",     body: "Content coming soon." },
      { title: "Rewards & Prizes",       body: "Content coming soon." },
    ],
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

export default function GameModePage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const data = MODES[mode?.toLowerCase()] || MODES.racing;

  return (
    <div
      className="relative text-white min-h-screen"
      style={{
        backgroundImage: `url(${data.panelImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark + accent overlay — absolute so it doesn't bleed into footer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(6,6,16,0.72) 0%, rgba(6,6,16,0.55) 50%, rgba(6,6,16,0.72) 100%)`,
          zIndex: 0,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: data.glow, mixBlendMode: "screen", zIndex: 0 }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, ${data.accent}, transparent)`, zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[860px] mx-auto px-6 md:px-12 pt-36 pb-24 flex flex-col items-center text-center gap-8">

        {/* Back button */}
        <motion.button
          variants={fadeUp} custom={0} initial="hidden" animate="visible"
          onClick={() => navigate(-1)}
          className="self-start flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 text-[13px] tracking-widest uppercase"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </motion.button>

        {/* Mode badge */}
        <motion.div
          variants={fadeUp} custom={0} initial="hidden" animate="visible"
          className="px-5 py-1.5 text-[13px] font-bold tracking-[0.25em] uppercase"
          style={{
            fontFamily: "Orbitron, sans-serif",
            border: `1px solid ${data.accent}`,
            borderTop: `2px solid ${data.accent}`,
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            background: "rgba(0,0,0,0.55)",
            color: data.accent,
            boxShadow: `0 0 20px ${data.glow}`,
            textShadow: `0 0 10px ${data.accent}`,
          }}
        >
          {data.label} MODE
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
          className="font-goldman uppercase leading-tight text-4xl md:text-5xl xl:text-[56px]"
          style={{ textShadow: `0 0 60px ${data.glow}, 0 2px 8px rgba(0,0,0,0.9)` }}
        >
          {data.heading}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp} custom={2} initial="hidden" animate="visible"
          className="uppercase tracking-[0.2em]"
          style={{ color: data.accent, fontFamily: "Orbitron, sans-serif", fontSize: 15, textShadow: `0 0 10px ${data.accent}` }}
        >
          {data.subtitle}
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={fadeUp} custom={3} initial="hidden" animate="visible"
          className="w-24 h-[2px]"
          style={{ background: data.accent, boxShadow: `0 0 12px ${data.accent}` }}
        />

        {/* Description */}
        <motion.p
          variants={fadeUp} custom={4} initial="hidden" animate="visible"
          className="text-white/80 text-[17px] leading-[1.9] max-w-[600px]"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          {data.description}
        </motion.p>

        {/* Content cards — scroll over the same background */}
        <div className="w-full flex flex-col gap-6 mt-8">
          {data.sections.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp} custom={i + 5} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.2 }}
              className="text-left p-7"
              style={{
                background: "rgba(6,6,16,0.65)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: `3px solid ${data.accent}`,
              }}
            >
              <h2
                className="font-goldman uppercase text-xl tracking-wide mb-2"
                style={{ color: data.accent }}
              >
                {s.title}
              </h2>
              <p className="text-white/60 text-[16px] leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
