import { useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DraftingCompass,
  Gamepad2,
  Store,
  ShoppingCart,
  HandCoins,
  Gauge,
  ScanSearch,
  Users,
  Rocket,
  Glasses,
  Cpu,
  ArrowRight,
  Lock,
  LockOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import GlowingOrb from "../Components/Common/BgColoring";
import CrowdfundingPackages from "../Components/home/PopularCollections";

import gamePng from "../assets/images/aboutpage/game.webp";

// ── 11 Milestones (same content as Crowdfunding.jsx) ──
const ROADMAP_HEADING = "The Milestones of the Hyper Tek Roadmap";
const MILESTONES = [
  {
    num: 1,
    title: "Foundation by Design",
    Icon: DraftingCompass,
    bullets: [
      { text: "Analyse the key issues facing the Gaming, Virtual Reality, and Digital Art industry." },
      { text: "Focused on developing innovative solutions designed to tackle these issues head-on", sub: ["enhancing user experience", "advancing the overall quality of these digital mediums."] },
    ],
  },
  {
    num: 2,
    title: "Game Development Blueprint",
    Icon: Gamepad2,
    bullets: [
      { text: "Engaged Game Development and Crypto Specialist for design input" },
      { text: "Transformed initial designs into detailed, actionable game development documents, meticulously prepared for the building phase." },
    ],
  },
  {
    num: 3,
    title: "Website and Marketplace Foundation",
    Icon: Store,
    bullets: [
      { text: "Collaborate with a team of talented 2D/3D artists for conceptual models and artwork" },
      { text: "Engage Web3 specialists to design and build an innovative Web3 website and digital marketplace." },
      { text: "Featuring cutting-edge NFA/NFC/NFT systems, a guaranteed buy-back framework, and smart contracts for secure transactions" },
    ],
  },
  {
    num: 4,
    title: "Project Launch",
    Icon: ShoppingCart,
    current: true,
    intro: "Website to go live to provide an overview of the Hyper Tek Project, featuring:",
    bullets: [
      { text: "Gaming and Marketplace Overview" },
      { text: "Player creatable NFTs are now available" },
      { text: "Limited-edition items and discounted packages that help fund development before the crowd arrives" },
    ],
  },
  {
    num: 5,
    title: "Crowdfunding Campaign",
    Icon: HandCoins,
    intro: "Pending the success of the Project Launch, the official crowdfunding campaign kicks off!",
    bullets: [
      { text: "All discount packages will end permanently!" },
      { text: "Additionally, our exclusive limited-edition NFAs will only be available for purchase until we reach our funding goal. Don't miss your chance to secure these unique items while you can.... Once they're gone, they're gone!" },
    ],
  },
  {
    num: 6,
    title: "Game Development Accelerates",
    Icon: Gauge,
    bullets: [
      { text: "Game development starts by turning documents into games and builds upon the previously developed 2D and 3D assets" },
      { text: "New NFAs to be released to the marketplace" },
      { text: "Regular updates will be shared with our growing community, ensuring everyone stays informed and engaged with the latest developments." },
    ],
  },
  {
    num: 7,
    title: "Alpha Deployment",
    Icon: ScanSearch,
    intro: "Alpha testing will focus on enhancing the game mechanics and the core gameplay loop. This process will carefully examine various elements of the game to ensure they function smoothly and engage players effectively. Additionally, developers share official content with the team for constructive feedback, allowing for adjustments and improvements before moving closer to the final release.",
  },
  {
    num: 8,
    title: "Beta Deployment",
    Icon: Users,
    intro: "Announce the upcoming Closed and Open Beta phases, which will include a carefully chosen group of users who have signed up to participate. These participants will have the unique opportunity to experience exclusive in-game content specially designed for this testing phase. Join us now and become one of the future selected players invited to explore new features and provide valuable feedback!",
  },
  {
    num: 9,
    title: "Systems Live – Official Launch",
    Icon: Rocket,
    intro: "The official launch of Hyper Tek Games will take place through an engaging media countdown, strategically designed to build excitement and anticipation. This initiative has been shaped by valuable player feedback and aims to enhance the game's visibility in the mainstream market.",
  },
  {
    num: 10,
    title: "VR Integration Release",
    Icon: Glasses,
    intro: "The official launch of the VR Integration, designed with active input and suggestions from our players at every stage of development. This collaborative effort will ensure an engaging and immersive experience that reflects the desires and needs of our gaming community, as well as the vision that we had for the Project",
  },
  {
    num: 11,
    title: "GETs System Manufacture & Release",
    Icon: Cpu,
    intro: "The GETs system will progress toward manufacturing and release phases. For a deeper understanding, be sure to read our White Paper. If you're interested in being part of this innovative journey, please reach out to us to secure your place in the process.",
  },
];

const EARLY_ACCESS = {
  eyebrow: "LIMITED-TIME OPPORTUNITY",
  heading: "Don't Miss the Early-Access Window",
  bullets: [
    "Limited-edition NFAs and discounted packages are available now – only while early access stays open.",
    "Discounts close for good the moment we launch our envisioned crowdfunding campaign.",
    "Limited-edition items remain only until our funding target is reached – then they're gone for good.",
  ],
  cta: "Secure Your Place Today",
  note: "Watch for updates, read the White Paper, and lock in early pricing before the crowd arrives.",
};

const WEB3_CARD_ACCENTS = [
  { accent: "#22c55e", bg: "rgba(34,197,94,0.04)", border: "rgba(34,197,94,0.18)", borderTop: "rgba(34,197,94,0.55)" },
  { accent: "#38bdf8", bg: "rgba(56,189,248,0.05)", border: "rgba(56,189,248,0.22)", borderTop: "rgba(56,189,248,0.55)" },
  { accent: "#a78bfa", bg: "rgba(167,139,250,0.04)", border: "rgba(167,139,250,0.18)", borderTop: "rgba(167,139,250,0.55)" },
];

const HELP_META = [
  { accent: "#38bdf8", iconBg: "rgba(56,189,248,0.12)" },
  { accent: "#fbbf24", iconBg: "rgba(251,191,36,0.12)" },
  { accent: "#22c55e", iconBg: "rgba(34,197,94,0.12)" },
];

// Milestone card accent — cycles every 3 so columns share a hue rhythm
const MILESTONE_ACCENTS = [
  { accent: "#38bdf8", bg: "rgba(56,189,248,0.04)", border: "rgba(56,189,248,0.22)", borderTop: "2px solid rgba(56,189,248,0.55)" },
  { accent: "#a78bfa", bg: "rgba(167,139,250,0.04)", border: "rgba(167,139,250,0.18)", borderTop: "2px solid rgba(167,139,250,0.5)" },
  { accent: "#22c55e", bg: "rgba(34,197,94,0.04)", border: "rgba(34,197,94,0.18)", borderTop: "2px solid rgba(34,197,94,0.5)" },
];

const BTN_PRIMARY = {
  background: "linear-gradient(135deg, rgba(56,189,248,0.20) 0%, rgba(56,189,248,0.06) 100%)",
  border: "1px solid rgba(56,189,248,0.5)",
  borderTop: "2px solid rgba(56,189,248,0.75)",
  borderRadius: "12px",
  fontFamily: "Orbitron, sans-serif",
  boxShadow: "0 0 28px rgba(56,189,248,0.18)",
  color: "rgba(56,189,248,0.95)",
  letterSpacing: "0.12em",
};
const BTN_SECONDARY = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderTop: "2px solid rgba(255,255,255,0.28)",
  borderRadius: "12px",
  fontFamily: "Orbitron, sans-serif",
  color: "rgba(255,255,255,0.6)",
  letterSpacing: "0.12em",
};

function SectionLabel({ label, align = "left" }) {
  return (
    <div className={`flex items-center gap-3 mb-5 ${align === "center" ? "justify-center" : ""}`}>
      <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />
      <span className="text-white/70 text-[12px] font-bold tracking-[0.3em] uppercase">{label}</span>
      {align === "center" && <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />}
    </div>
  );
}

function Crowdfunding2() {
  const { t } = useTranslation();
  const sec05 = t("aboutPage.section05", { returnObjects: true }) || {};
  const sec06 = t("aboutPage.section06", { returnObjects: true }) || {};
  const sec05Help = Array.isArray(sec05.helpItems) ? sec05.helpItems : [];
  const sec06Cards = Array.isArray(sec06.cards) ? sec06.cards : [];
  const closing = t("aboutPage.closing", { returnObjects: true }) || {};

  const linkParts = (sec05.link || "").split("—");
  const linkUrl = (linkParts[0] || "").replace(/[[\]]/g, "").trim();
  const linkSlogan = linkParts.length > 1 ? linkParts.slice(1).join("—").trim() : "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative text-white overflow-hidden" style={{ background: "#060610" }}>
      <GlowingOrb Xaxis={80} Yaxis={500} />
      <GlowingOrb Xaxis={1300} Yaxis={1400} />
      <GlowingOrb Xaxis={150} Yaxis={2400} />

      {/* ══════════════════════════════════════════════════════
          HERO + MILESTONES
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full px-6 pt-32 pb-14 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[560px] pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 100% at 50% -10%, rgba(56,189,248,0.14) 0%, rgba(251,191,36,0.05) 35%, transparent 70%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.35) 35%,rgba(56,189,248,0.35) 65%,transparent)" }} />

        <div className="relative max-w-[1400px] mx-auto">

          {/* ── Hero header ── */}
          <motion.div
            className="text-center w-full mx-auto mb-14"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >


            <h1 className="font-[Goldman] font-bold text-3xl sm:text-4xl xl:text-[50px] text-white leading-[1.1] whitespace-pre-line">
              {sec05.heading || "Your Support Powers\nthe Hyper Tek Universe"}
            </h1>
            <p className="text-white/55 text-sm md:text-[15px] leading-relaxed w-full mt-5 whitespace-pre-line">
              {sec05.subtitle}
            </p>
          </motion.div>

          {/* ── Roadmap heading ── */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          >
            <h2 className="font-[Goldman] font-bold text-white text-2xl md:text-3xl xl:text-[34px] leading-tight">
              {ROADMAP_HEADING}
            </h2>
            <div className="w-16 h-px mx-auto mt-4" style={{ background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.6),transparent)" }} />
          </motion.div>

          {/* ── Milestones — 3-per-row card grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-14">
            {MILESTONES.map((m, i) => {
              const isFinale = i === MILESTONES.length - 1;
              const isCurrent = !!m.current;
              const ca = isCurrent
                ? { accent: "#fbbf24", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.38)", borderTop: "2px solid rgba(251,191,36,0.7)" }
                : isFinale
                ? { accent: "#c4b5fd", bg: "rgba(167,139,250,0.05)", border: "rgba(167,139,250,0.35)", borderTop: "2px solid rgba(167,139,250,0.6)" }
                : MILESTONE_ACCENTS[i % 3];

              return (
                <motion.div
                  key={m.num}
                  className="relative rounded-2xl p-6 flex flex-col gap-3 overflow-hidden"
                  style={{ background: ca.bg, border: `1px solid ${ca.border}`, borderTop: ca.borderTop }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  {/* Watermark number */}
                  <span
                    className="pointer-events-none select-none absolute top-3 right-4 font-[Goldman] font-bold leading-none text-[80px]"
                    style={{ color: isCurrent ? "rgba(251,191,36,0.08)" : isFinale ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.04)" }}
                  >
                    {String(m.num).padStart(2, "0")}
                  </span>

                  {/* Header: icon + number + title + badge */}
                  <div className="relative z-10 flex items-center gap-3 flex-wrap">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ca.accent}18`, border: `1px solid ${ca.accent}44` }}
                    >
                      <m.Icon size={18} color={ca.accent} strokeWidth={1.6} />
                    </div>
                    <span
                      className="font-[Goldman] font-bold text-[18px] leading-none"
                      style={{ color: ca.accent }}
                    >
                      {String(m.num).padStart(2, "0")}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.5)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300" style={{ fontFamily: "Orbitron, sans-serif" }}>We are here</span>
                      </span>
                    )}
                    {isFinale && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.45)", fontFamily: "Orbitron, sans-serif" }}>
                        Final
                      </span>
                    )}

                  </div>

                  <div className="relative z-10">
                    <h3 className="font-bold text-white text-[14px] md:text-[16px] leading-snug mb-2" style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.02em" }}>
                      {m.title}
                    </h3>
                    {m.intro && (
                      <p className="text-white/65 text-[13px] leading-relaxed mb-2">{m.intro}</p>
                    )}
                    {Array.isArray(m.bullets) && m.bullets.length > 0 && (
                      <ul className="flex flex-col gap-2">
                        {m.bullets.map((b, j) => (
                          <li key={j}>
                            <div className="flex gap-2.5 items-start">
                              <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ background: ca.accent }} />
                              <span className="text-white/65 text-[12.5px] leading-relaxed">{b.text}</span>
                            </div>
                            {Array.isArray(b.sub) && b.sub.length > 0 && (
                              <ul className="flex flex-col gap-1 mt-1.5 ml-5">
                                {b.sub.map((s, k) => (
                                  <li key={k} className="flex gap-2 items-start">
                                    <div className="w-1 h-1 rounded-full mt-[8px] flex-shrink-0" style={{ background: "rgba(255,255,255,0.3)" }} />
                                    <span className="text-white/50 text-[12px] leading-relaxed">{s}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {m.num >= 5
                    ? <Lock className="absolute bottom-4 right-4" size={32} color="#ffffff" strokeWidth={1.5} />
                    : <LockOpen className="absolute bottom-4 right-4" size={32} color="#ffffff" strokeWidth={1.5} />
                  }
                </motion.div>
              );
            })}
          </div>

          {/* ── Web3 Gaming Solution — Key Advantages ── */}
          <div className="relative py-16 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.35) 35%,rgba(167,139,250,0.35) 65%,transparent)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,8,40,0.35) 0%,rgba(6,6,16,0) 60%)" }} />
            <div className="relative">
              <motion.div
                className="mb-10 text-center max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} viewport={{ once: true }}
              >
                <SectionLabel label={sec06.label || "Web3 Gaming & Competitive Edge"} align="center" />
                <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[34px] text-white leading-tight mb-3">
                  {sec06.heading || "HYPER TEK, A WEB3 GAMING SOLUTION AND THE KEY ADVANTAGES"}
                </h2>
                <p className="text-white/50 text-[13px] leading-relaxed whitespace-pre-line" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  {sec06.subtitle}
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {sec06Cards.map((card, i) => {
                  const ca = WEB3_CARD_ACCENTS[i] || WEB3_CARD_ACCENTS[0];
                  const bullets = Array.isArray(card.bullets) ? card.bullets : [];
                  return (
                    <motion.div
                      key={card.label}
                      className="rounded-2xl p-6 md:p-7 flex flex-col gap-4"
                      style={{ background: ca.bg, border: `1px solid ${ca.border}`, borderTop: `3px solid ${ca.borderTop}` }}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.09 }} viewport={{ once: true }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <span className="font-[Goldman] font-bold text-[42px] leading-none" style={{ color: ca.accent }}>
                        0{i + 1}
                      </span>
                      <h3 className="text-[15px] md:text-[17px] font-bold uppercase tracking-[0.1em] leading-snug" style={{ fontFamily: "Orbitron, sans-serif", color: ca.accent }}>
                        {card.label}
                      </h3>
                      {card.body && (
                        <p className="text-white/75 text-[13px] md:text-[14px] leading-relaxed">{card.body}</p>
                      )}
                      {bullets.length > 0 && (
                        <ul className="flex flex-col gap-2.5">
                          {bullets.map((b, j) => (
                            <li key={j} className="flex gap-2.5 items-start">
                              <div className="w-1.5 h-1.5 rounded-full mt-[6px] flex-shrink-0" style={{ background: ca.accent }} />
                              <span className="text-white/70 text-[13px] leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Intro Text (from CrowdfundingPackages) ── */}
          <motion.div
            className="rounded-xl overflow-hidden mb-8"
            style={{
              background: "linear-gradient(160deg, rgba(0,40,120,0.22) 0%, rgba(0,10,40,0.55) 100%)",
              border: "1px solid rgba(56,189,248,0.22)",
              borderTop: "2px solid rgba(56,189,248,0.5)",
              boxShadow: "0 0 50px rgba(56,189,248,0.08)",
            }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
          >
            <div className="px-8 py-7 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 13, letterSpacing: "0.28em", color: "rgba(56,189,248,1)", fontWeight: "bold", textShadow: "0 0 14px rgba(56,189,248,0.7)" }}>
                  {t("packages.badge")}
                </span>
              </div>
              <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>{t("packages.intro1")}</p>
              <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>{t("packages.intro2")}</p>
              <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>{t("packages.intro3")}</p>
              <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>{t("packages.intro4")}</p>
              <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>{t("packages.intro5")}</p>
              <h3 className="text-white font-bold text-[14px] lg:text-[15px] mt-1" style={{ fontFamily: "Orbitron,sans-serif", letterSpacing: "0.04em" }}>{t("packages.keyPointsTitle")}</h3>
              <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>{t("packages.intro6")}</p>
              <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>{t("packages.intro7")}</p>
            </div>
          </motion.div>

          {/* ── How YOU Can Help — wrapped in a card ── */}
          <motion.div
            className="rounded-2xl px-8 py-12 md:px-12 md:py-14 mb-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderTop: "2px solid rgba(56,189,248,0.3)",
            }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} viewport={{ once: true }}
          >
            <h3 className="font-[Goldman] font-bold text-white text-2xl md:text-3xl text-center mb-10">
              {sec05.helpHeading || "How YOU Can Help Right Now"}
            </h3>

            <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-4 w-full">
              {sec05Help.map((item, idx) => {
                const m = HELP_META[idx] || HELP_META[0];
                const desc = (item.text || "").replace(/^[\s—–-]+/, "");
                const sentence = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : "";
                return (
                  <Fragment key={item.bold}>
                    <div className="flex-1 flex flex-col items-center text-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center font-[Goldman] font-bold text-xl"
                        style={{ background: m.iconBg, border: `1.5px solid ${m.accent}`, color: m.accent }}
                      >
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-white text-[15px] md:text-[17px] uppercase tracking-wide leading-snug">{item.bold}</h4>
                      <p className="text-white/65 text-[13.5px] md:text-[14.5px] leading-relaxed max-w-[260px]">{sentence}</p>
                    </div>
                    {idx < sec05Help.length - 1 && (
                      <div className="hidden md:block w-px self-stretch mx-2" style={{ background: "rgba(255,255,255,0.12)" }} />
                    )}
                  </Fragment>
                );
              })}
            </div>


          </motion.div>

          {/* ── Don't Miss the Early-Access Window ── */}
          <motion.div
            className="relative mt-12 md:mt-16 py-12 md:py-16 text-center"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 75% at 50% 42%, rgba(251,191,36,0.12) 0%, transparent 70%)" }} />

            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-8 h-px" style={{ background: "rgba(251,191,36,0.6)" }} />
                <span className="text-amber-300 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  {EARLY_ACCESS.eyebrow}
                </span>
                <div className="w-8 h-px" style={{ background: "rgba(251,191,36,0.6)" }} />
              </div>

              <h3 className="font-[Goldman] font-bold text-white text-2xl md:text-[36px] leading-tight mb-4">
                {EARLY_ACCESS.heading}
              </h3>
              <div className="w-16 h-[3px] rounded-full mx-auto mb-9" style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }} />

              <ul className="flex flex-col gap-3.5 mb-10 max-w-2xl mx-auto text-left">
                {EARLY_ACCESS.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <ArrowRight size={16} color="#fbbf24" strokeWidth={2} className="mt-[3px] flex-shrink-0" />
                    <span className="text-white/75 text-[14px] md:text-[15px] leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/market-place"
                onClick={() => window.scrollTo(0, 0)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[12px] md:text-[13px] font-bold uppercase tracking-[0.12em] text-[#0b0b14] transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", fontFamily: "Orbitron, sans-serif", boxShadow: "0 0 32px rgba(251,191,36,0.35)" }}
              >
                Learn More
                <ArrowRight size={16} strokeWidth={2.4} />
              </Link>
              <p className="text-white/55 text-[13px] md:text-[14px] leading-relaxed max-w-md mx-auto mt-5">
                {EARLY_ACCESS.note}
              </p>
            </div>
          </motion.div>

          {/* Closing slogan moved here */}
          <div className="flex flex-col items-center mt-4 mb-8">
            <div className="flex items-center gap-3 w-full max-w-xs mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <div className="w-1 h-1 rounded-full bg-cyan-400/60" />
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <p className="font-[Goldman] font-bold text-white text-lg md:text-2xl text-center leading-snug">
              {linkSlogan || "Back the Project. Own the Future."}
            </p>
            {linkUrl && (
              <Link
                to="/"
                onClick={() => window.scrollTo(0, 0)}
                className="mt-3 text-[13px] md:text-sm font-semibold tracking-[0.1em] text-cyan-400 hover:text-cyan-300 transition-colors"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {linkUrl}
              </Link>
            )}
          </div>

        </div>
      </section>

      <CrowdfundingPackages hideIntro />

      {/* ══════════════════════════════════════════════════════
          CLOSING CTA
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${gamePng})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.05 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,#060610 0%,rgba(6,6,16,0.75) 50%,#060610 100%)" }} />

        <motion.div className="relative z-10 max-w-[680px] mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} viewport={{ once: true }}>
          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left,rgba(56,189,248,0.3),transparent)" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,rgba(56,189,248,0.3),transparent)" }} />
          </div>
          <p className="text-white/48 text-sm md:text-[15px] leading-[1.9] italic mb-8">{closing.body}</p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/market-place" className="px-8 py-3 text-[11px] font-bold uppercase transition-all hover:brightness-125" style={BTN_PRIMARY}>
              {closing.exploreMarketplace || "Explore Marketplace"}
            </Link>
            <Link to="/gaming" className="px-8 py-3 text-[11px] font-bold uppercase transition-all hover:brightness-110" style={BTN_SECONDARY}>
              {t("packages.tryGaming")}
            </Link>
          </div>
          <div className="flex items-center gap-4 mt-10 justify-center">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/12 text-[10px] tracking-[0.5em] font-bold uppercase">Hyper Tek</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Crowdfunding2;
