import { useEffect, useState } from "react";
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
import HelpCards from "../Components/home/HelpCards";
import { CARD_ACCENTS_SOLID } from "../Components/home/cardAccents";


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
      { text: "Engage Web3 specialists to design and build an innovative Web3.5 website and digital marketplace." },
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

const WEB3_CARD_ACCENTS = CARD_ACCENTS_SOLID;

const VEHICLES = ["/vehicle1.webp", "/vehicle2-1.webp", "/vehicle2.webp", "/vehicle3-1.webp", "/vehicle3.webp"];
const AVATARS = [
  "/avatar/commander-elite.webp", "/avatar/dryads-female.webp", "/avatar/dryads-male.webp",
  "/avatar/fawnus-female.webp", "/avatar/fawnus-male.webp", "/avatar/geodians-female.webp",
  "/avatar/geodians-male.webp", "/avatar/lithionites-female.webp", "/avatar/lithionites-male.webp",
  "/avatar/mantasquads-female.webp", "/avatar/mantasquads-male.webp", "/avatar/marmulus-female.webp",
  "/avatar/marmulus-male.webp", "/avatar/ophidians-female.webp", "/avatar/ophidians-male.webp",
  "/avatar/overlord.webp", "/avatar/team-specialist-major.webp",
];

// Milestone card accent — cycles every 3 so columns share a hue rhythm
const MILESTONE_ACCENTS = [
  { accent: "#38bdf8", bg: "#0b1a24", border: "rgba(56,189,248,0.30)", borderTop: "2px solid rgba(56,189,248,0.65)" },
  { accent: "#a78bfa", bg: "#140f20", border: "rgba(167,139,250,0.28)", borderTop: "2px solid rgba(167,139,250,0.60)" },
  { accent: "#22c55e", bg: "#0d1f12", border: "rgba(34,197,94,0.28)", borderTop: "2px solid rgba(34,197,94,0.60)" },
];


function SectionLabel({ label, align = "left" }) {
  return (
    <div className={`flex items-center gap-3 mb-5 ${align === "center" ? "justify-center" : ""}`}>
      <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />
      <span className="text-white/70 text-[12px] font-bold tracking-[0.3em] uppercase">{label}</span>
      {align === "center" && <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />}
    </div>
  );
}

// Preload all images so src swaps are instant with no fetch/layout-shift
function preloadImages(urls) {
  urls.forEach(src => { const img = new Image(); img.src = src; });
}

// Picks an avatar once per page visit (seed = per-visit rotation counter).
// No interval — the image stays fixed while the user remains on the page,
// and only advances when they leave and return (component remounts).
function CyclingAvatar({ offset = 0, seed = 0, style = {}, className = "" }) {
  const src = AVATARS[(seed + offset) % AVATARS.length];
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`object-contain select-none pointer-events-none ${className}`}
      style={style}
    />
  );
}

// Picks a vehicle once per page visit (no interval) — same behaviour as CyclingAvatar.
function CyclingVehicle({ seed = 0, style = {}, className = "" }) {
  const src = VEHICLES[seed % VEHICLES.length];
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`select-none pointer-events-none ${className}`}
      style={{ transition: "opacity 0.35s ease", ...style }}
    />
  );
}

function CrowdfundingStandalone() {
  const { t } = useTranslation();
  const sec05 = t("aboutPage.section05", { returnObjects: true }) || {};
  const sec06 = t("aboutPage.section06", { returnObjects: true }) || {};
  const sec05Help = Array.isArray(sec05.helpItems) ? sec05.helpItems : [];
  const sec06Cards = Array.isArray(sec06.cards) ? sec06.cards : [];
  const linkParts = (sec05.link || "").split("—");
  const linkUrl = (linkParts[0] || "").replace(/[[\]]/g, "").trim();
  const linkSlogan = linkParts.length > 1 ? linkParts.slice(1).join("—").trim() : "";

  // "Coming soon" notice for features that unlock at official launch.

  // Avatar rotation: advance one step each time the page is visited, then keep
  // the same set of images for the whole visit (no per-second cycling).
  const [rotationSeed] = useState(() => {
    const key = "cf_avatar_rotation";
    let prev = 0;
    try { prev = parseInt(localStorage.getItem(key) || "0", 10) || 0; } catch { prev = 0; }
    const next = (prev + 1) % AVATARS.length;
    try { localStorage.setItem(key, String(next)); } catch { /* ignore */ }
    return next;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    preloadImages(AVATARS);
    preloadImages(VEHICLES);
  }, []);

  return (
    <div className="relative text-white overflow-hidden" style={{ background: "#0b0d1a" }}>
      {/* ── Treasure vault background (fixed, low opacity) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url(/treasure_vault.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <GlowingOrb Xaxis={80} Yaxis={500} />
      <GlowingOrb Xaxis={1300} Yaxis={1400} />
      <GlowingOrb Xaxis={150} Yaxis={2400} />

      {/* Owner feedback: the whole page felt too large, so all content renders
          at 90% scale. The fixed treasure-vault background stays outside this
          wrapper so it keeps covering the full viewport. */}
      <div style={{ zoom: 0.9 }}>

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
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
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
                ? { accent: "#fbbf24", bg: "#1e1600", border: "rgba(251,191,36,0.35)", borderTop: "2px solid rgba(251,191,36,0.75)" }
                : isFinale
                ? { accent: "#c4b5fd", bg: "#140f20", border: "rgba(167,139,250,0.30)", borderTop: "2px solid rgba(167,139,250,0.65)" }
                : MILESTONE_ACCENTS[i % 3];

              return (
                <motion.div
                  key={m.num}
                  className="relative rounded-2xl p-6 flex flex-col gap-3 overflow-hidden"
                  style={{ background: ca.bg, border: `1px solid ${ca.border}`, borderTop: ca.borderTop }}
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

          {/* ── Web3.5 Gaming Solution — Key Advantages ── */}
          <div className="relative py-16 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.35) 35%,rgba(167,139,250,0.35) 65%,transparent)" }} />
            <div className="relative">
              <motion.div
                className="mb-10 text-center max-w-3xl mx-auto"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.65 }} viewport={{ once: true }}
              >
                <SectionLabel label={sec06.label || "Web3.5 Gaming & Competitive Edge"} align="center" />
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
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: i * 0.09 }} viewport={{ once: true }}
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

          {/* ── Card 1: LIMITED EDITION — transparent card with avatar inside ── */}
          <div className="relative mb-5">
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            >
              <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-2 rounded-xl p-6 sm:p-9"
                style={{ background: "linear-gradient(160deg, rgba(11,26,46,0.35) 0%, rgba(6,14,26,0.35) 100%)", border: "1px solid rgba(56,189,248,0.30)", borderTop: "2px solid rgba(56,189,248,0.70)", boxShadow: "0 4px 32px rgba(56,189,248,0.10)" }}
              >
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 13, letterSpacing: "0.28em", color: "rgba(56,189,248,1)", fontWeight: "bold", textShadow: "0 0 14px rgba(56,189,248,0.7)" }}>
                      {t("packages.badge")}
                    </span>
                  </div>
                  <p className="text-[15px] lg:text-[16px] leading-[1.85] text-left sm:text-justify" style={{ color: "rgba(255,255,255,0.85)" }}>{t("packages.intro1")}</p>
                  <p className="text-[15px] lg:text-[16px] leading-[1.85] text-left sm:text-justify" style={{ color: "rgba(255,255,255,0.85)" }}>{t("packages.intro2")}</p>
                  <p className="text-[15px] lg:text-[16px] leading-[1.85] text-left sm:text-justify" style={{ color: "rgba(255,255,255,0.85)" }}>{t("packages.intro3")}</p>
                  <p className="text-[15px] lg:text-[16px] leading-[1.85] text-left sm:text-justify" style={{ color: "rgba(255,255,255,0.85)" }}>{t("packages.intro4")}</p>
                  <p className="text-[15px] lg:text-[16px] leading-[1.85] text-left sm:text-justify" style={{ color: "rgba(255,255,255,0.85)" }}>{t("packages.intro5")}</p>
                </div>

                {/* Avatar — reserves a narrow slot; the image overflows it so it can
                    render larger without widening the text panel */}
                <div className="hidden xl:block flex-shrink-0 relative self-stretch pointer-events-none select-none" style={{ width: "300px" }}>
                  <CyclingAvatar offset={0} seed={rotationSeed} className="absolute object-contain object-bottom" style={{ width: "460px", maxWidth: "none", height: "auto", right: "-90px", bottom: "-32px", filter: "drop-shadow(0 0 56px rgba(56,189,248,0.50))" }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Card 2: Key Points — avatar left (absolute) + card right ── */}
          <div className="relative mb-2 xl:min-h-[320px]">
            {/* Avatar — absolute kiri, dikecilkan agar tidak overlap section bawah */}
            <div className="hidden xl:block pointer-events-none select-none" style={{ position: "absolute", left: "-60px", top: "0px", width: "420px", zIndex: 10 }}>
              <CyclingAvatar offset={1} seed={rotationSeed} className="w-full object-contain object-top" style={{ maxHeight: "640px", filter: "drop-shadow(0 0 48px rgba(167,139,250,0.40))", transform: "scaleX(-1)" }} />
            </div>

            {/* Card — full width on mobile; center-right beside the avatar on desktop */}
            <motion.div
              className="flex justify-center xl:justify-end xl:items-end xl:min-h-[400px]"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
            >
              <div className="flex flex-col gap-4 rounded-xl overflow-hidden p-6 sm:p-9 w-full xl:w-[76%]"
                style={{ background: "linear-gradient(160deg, rgba(22,15,40,0.35) 0%, rgba(10,6,22,0.35) 100%)", border: "1px solid rgba(167,139,250,0.28)", borderTop: "2px solid rgba(167,139,250,0.68)", boxShadow: "0 4px 32px rgba(167,139,250,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
                  <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 13, letterSpacing: "0.28em", color: "rgba(167,139,250,1)", fontWeight: "bold", textShadow: "0 0 14px rgba(167,139,250,0.7)" }}>
                    {t("packages.keyPointsTitle")}
                  </span>
                </div>
                <p className="text-[15px] lg:text-[16px] leading-[1.85] text-left sm:text-justify" style={{ color: "rgba(255,255,255,0.85)" }}>{t("packages.intro6")}</p>
                <p className="text-[15px] lg:text-[16px] leading-[1.85] text-left sm:text-justify" style={{ color: "rgba(255,255,255,0.85)" }}>{t("packages.intro7")}</p>
              </div>
            </motion.div>
          </div>

          {/* ── How YOU Can Help ── (big top gap only on desktop, to clear the avatar overflow) */}
          <motion.div
            className="mb-8 pt-10 xl:pt-40 pb-8"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }} viewport={{ once: true }}
          >
            <h3 className="font-[Goldman] font-bold text-white text-2xl md:text-3xl text-center mb-10">
              {sec05.helpHeading || "How YOU Can Help Right Now"}
            </h3>

            <HelpCards items={sec05Help} solid />


          </motion.div>


        </div>
      </section>

      {/* ── Don't Miss the Early-Access Window ── */}
      <section className="relative w-full px-6 pt-2 pb-10 md:pb-14 text-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
        >
          {/* Decorative left — vehicle (hidden below xl: no room next to the text) */}
          <CyclingVehicle seed={rotationSeed} className="hidden xl:block absolute top-1/2 transition-opacity duration-700" style={{ width: "clamp(320px, 38vw, 540px)", transform: "translateY(-50%)", left: "40px" }} />
          {/* Decorative right — avatar */}
          <CyclingAvatar offset={3} seed={rotationSeed} className="hidden xl:block absolute transition-opacity duration-700" style={{ width: "clamp(240px, 28vw, 400px)", right: "80px", bottom: "-120px" }} />

          <div className="relative w-full xl:px-[clamp(180px,28vw,420px)]">
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-6">
              <div className="w-8 md:w-12 h-px flex-shrink-0" style={{ background: "rgba(251,191,36,0.6)" }} />
              <span className="text-amber-300 text-[12px] md:text-[15px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-center pl-[0.2em] md:pl-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {EARLY_ACCESS.eyebrow}
              </span>
              <div className="w-8 md:w-12 h-px flex-shrink-0" style={{ background: "rgba(251,191,36,0.6)" }} />
            </div>

            <h3 className="font-[Goldman] font-bold text-white text-2xl sm:text-3xl md:text-[48px] leading-tight mb-5">
              {EARLY_ACCESS.heading}
            </h3>
            <div className="w-20 h-[3px] rounded-full mx-auto mb-10" style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }} />

            <ul className="flex flex-col gap-4 md:gap-5 mb-0 text-left max-w-2xl mx-auto">
              {EARLY_ACCESS.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 md:gap-4 items-start">
                  <ArrowRight size={20} color="#fbbf24" strokeWidth={2} className="mt-[3px] flex-shrink-0" />
                  <span className="text-white text-[15px] md:text-[19px] leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Closing slogan */}
        <div className="flex flex-col items-center mt-10 mb-4">
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
      </section>

      <CrowdfundingPackages hideIntro />

      {/* ══════════════════════════════════════════════════════
          CLOSING CTA
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full pt-2 pb-10 overflow-hidden">
        <motion.div className="relative z-10 max-w-[680px] mx-auto px-6 text-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.65 }} viewport={{ once: true }}>
          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left,rgba(56,189,248,0.3),transparent)" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,rgba(56,189,248,0.3),transparent)" }} />
          </div>
          <p className="text-white/48 text-sm md:text-[15px] leading-[1.9] italic mb-8">{t("aboutPage.closing.body")}</p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/market-place" onClick={() => window.scrollTo(0, 0)} className="px-8 py-3 text-[11px] font-bold uppercase transition-all hover:brightness-125" style={{
              background: "#0b1a2e",
              border: "1px solid rgba(56,189,248,0.5)",
              borderTop: "2px solid rgba(56,189,248,0.75)",
              borderRadius: "12px",
              fontFamily: "Orbitron, sans-serif",
              boxShadow: "0 0 28px rgba(56,189,248,0.15)",
              color: "rgba(56,189,248,0.95)",
              letterSpacing: "0.12em",
            }}>
              {t("aboutPage.closing.exploreMarketplace") || "Explore Marketplace"}
            </Link>
            <Link to="/gaming" onClick={() => window.scrollTo(0, 0)} className="px-8 py-3 text-[11px] font-bold uppercase transition-all hover:brightness-110" style={{
              background: "#141820",
              border: "1px solid rgba(255,255,255,0.22)",
              borderTop: "2px solid rgba(255,255,255,0.35)",
              borderRadius: "12px",
              fontFamily: "Orbitron, sans-serif",
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.12em",
            }}>
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

    </div>
  );
}

export default CrowdfundingStandalone;
