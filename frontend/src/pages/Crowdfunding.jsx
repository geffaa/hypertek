import { useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import GlowingOrb from "../Components/Common/BgColoring";
import CrowdfundingPackages from "../Components/home/PopularCollections";
import gamePng from "../assets/images/aboutpage/game.webp";

// ── Static visual data (text comes from i18n, moved verbatim from the About page) ──
const PHASES_STATIC = [
  { num: 1, status: "done", Icon: CheckCircle2, accent: "#38bdf8", bg: "rgba(56,189,248,0.06)", border: "rgba(56,189,248,0.3)" },
  { num: 2, status: "active", Icon: Zap, accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.5)" },
  { num: 3, status: "locked", Icon: Lock, accent: "rgba(255,255,255,0.22)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.1)" },
  { num: 4, status: "locked", Icon: Lock, accent: "rgba(255,255,255,0.22)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.1)" },
  { num: 5, status: "locked", Icon: Lock, accent: "rgba(255,255,255,0.22)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.1)" },
  { num: 6, status: "locked", Icon: Lock, accent: "rgba(255,255,255,0.22)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.1)" },
];

const WEB3_CARD_ACCENTS = [
  { accent: "#22c55e", bg: "rgba(34,197,94,0.04)", border: "rgba(34,197,94,0.18)", borderTop: "rgba(34,197,94,0.55)", iconBg: "rgba(34,197,94,0.12)", iconBorder: "rgba(34,197,94,0.3)" },
  { accent: "#38bdf8", bg: "rgba(56,189,248,0.05)", border: "rgba(56,189,248,0.22)", borderTop: "rgba(56,189,248,0.55)", iconBg: "rgba(56,189,248,0.10)", iconBorder: "rgba(56,189,248,0.35)" },
  { accent: "#a78bfa", bg: "rgba(167,139,250,0.04)", border: "rgba(167,139,250,0.18)", borderTop: "rgba(167,139,250,0.55)", iconBg: "rgba(167,139,250,0.12)", iconBorder: "rgba(167,139,250,0.3)" },
];

// ── "How YOU Can Help" step colors (Buy / Create / Share) ──
const HELP_META = [
  { accent: "#38bdf8", iconBg: "rgba(56,189,248,0.12)" },
  { accent: "#fbbf24", iconBg: "rgba(251,191,36,0.12)" },
  { accent: "#22c55e", iconBg: "rgba(34,197,94,0.12)" },
];

// Rounded CTA buttons to match the page's rounded-card visual language
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

// ── Section eyebrow label (no section number — irrelevant on this standalone page) ──
function SectionLabel({ label, align = "left" }) {
  return (
    <div className={`flex items-center gap-3 mb-5 ${align === "center" ? "justify-center" : ""}`}>
      <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />
      <span className="text-white/70 text-[12px] font-bold tracking-[0.3em] uppercase">{label}</span>
      {align === "center" && <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />}
    </div>
  );
}

function Crowdfunding() {
  const { t } = useTranslation();
  const sec05 = t("aboutPage.section05", { returnObjects: true }) || {};
  const sec06 = t("aboutPage.section06", { returnObjects: true }) || {};
  const sec05Phases = Array.isArray(sec05.phases) ? sec05.phases : [];
  const sec05Help = Array.isArray(sec05.helpItems) ? sec05.helpItems : [];
  const sec06Cards = Array.isArray(sec06.cards) ? sec06.cards : [];
  const closing = t("aboutPage.closing", { returnObjects: true }) || {};

  // sec05.link looks like "[www.hypertek.com] — Back the Project. Own the Future."
  // Split the URL from the slogan and clean the brackets for a tidier layout.
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
          HERO + CROWDFUNDING ROADMAP
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full px-6 pt-32 pb-14 overflow-hidden">
        {/* Hero ambient background — distinct top treatment */}
        <div className="absolute inset-x-0 top-0 h-[560px] pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 100% at 50% -10%, rgba(56,189,248,0.14) 0%, rgba(251,191,36,0.05) 35%, transparent 70%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.35) 35%,rgba(56,189,248,0.35) 65%,transparent)" }} />

        <div className="relative max-w-[1400px] mx-auto">

          {/* ── Hero header (centered) ── */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-14"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {sec05.crowdfundingNow || "Crowdfunding Now"}
              </span>
            </div>

            <SectionLabel label={sec05.label || "Crowdfunding — Help Build the Future"} align="center" />

            <h1 className="font-[Goldman] font-bold text-3xl sm:text-4xl xl:text-[50px] text-white leading-[1.1]">
              {sec05.heading || "Your Support Powers the Hyper Tek Universe"}
            </h1>
            <p className="text-white/55 text-sm md:text-[15px] leading-relaxed max-w-2xl mx-auto mt-5">
              {sec05.subtitle}
            </p>
          </motion.div>

          {/* ── Phases grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sec05Phases.map((phase, i) => {
              const ps = PHASES_STATIC[i] || PHASES_STATIC[5];
              return (
                <motion.div
                  key={ps.num}
                  className="relative rounded-xl p-5 flex flex-col gap-3"
                  style={{
                    background: ps.bg,
                    border: `1px solid ${ps.border}`,
                    borderTop: ps.status === "active" ? `3px solid ${ps.accent}` : `1px solid ${ps.border}`,
                    boxShadow: ps.status === "active" ? `0 0 28px rgba(251,191,36,0.15)` : "none",
                  }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.28em]"
                      style={{ fontFamily: "Orbitron, sans-serif", color: ps.status === "locked" ? "rgba(255,255,255,0.3)" : ps.accent }}
                    >
                      {sec05.phaseLabel || "Phase"} {ps.num} — {phase.name}
                    </span>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: ps.status === "locked" ? "rgba(255,255,255,0.04)" : `${ps.accent}20`, border: `1px solid ${ps.status === "locked" ? "rgba(255,255,255,0.1)" : ps.accent + "50"}` }}>
                      <ps.Icon size={13} color={ps.status === "locked" ? "rgba(255,255,255,0.28)" : ps.accent} strokeWidth={1.5} />
                    </div>
                  </div>

                  {ps.status === "active" && (
                    <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300" style={{ fontFamily: "Orbitron, sans-serif" }}>
                        {sec05.crowdfundingNow || "Crowdfunding Now"}
                      </span>
                    </div>
                  )}

                  <p className="text-[12px] leading-relaxed" style={{ color: ps.status === "locked" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.70)" }}>
                    {phase.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* ── How YOU Can Help — numbered step flow ── */}
          <motion.div
            className="rounded-2xl px-6 py-10 md:px-10 md:py-12"
            style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.2)", borderTop: "2px solid rgba(56,189,248,0.4)" }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} viewport={{ once: true }}
          >
            <h3 className="font-[Goldman] font-bold text-white text-2xl md:text-3xl text-center mb-12">
              {sec05.helpHeading || "How YOU Can Help Right Now"}
            </h3>
            <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-4 max-w-5xl mx-auto">
              {sec05Help.map((item, idx) => {
                const m = HELP_META[idx] || HELP_META[0];
                const desc = (item.text || "").replace(/^[\s—–-]+/, "");
                const sentence = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : "";
                return (
                  <Fragment key={item.bold}>
                    <div className="flex-1 flex flex-col items-center text-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-[Goldman] font-bold text-xl" style={{ background: m.iconBg, border: `1.5px solid ${m.accent}`, color: m.accent }}>
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-white text-[17px] md:text-[18px] uppercase tracking-wide leading-snug">{item.bold}</h4>
                      <p className="text-white/65 text-[14px] md:text-[15px] leading-relaxed max-w-[280px]">{sentence}</p>
                    </div>
                    {idx < sec05Help.length - 1 && (
                      <div className="hidden md:block flex-shrink-0 w-12 h-px mt-7" style={{ background: "rgba(255,255,255,0.18)" }} />
                    )}
                  </Fragment>
                );
              })}
            </div>
            {/* Closing slogan + clean site link */}
            <div className="flex flex-col items-center mt-12">
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
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WEB3 GAMING SOLUTION
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full pt-14 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.35) 35%,rgba(167,139,250,0.35) 65%,transparent)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,8,40,0.35) 0%,rgba(6,6,16,0) 60%)" }} />

        {/* Width matched to the packages section above (max-w-[1400px] + px-6) */}
        <div className="relative w-full max-w-[1400px] mx-auto px-6">

          <motion.div
            className="mb-10 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} viewport={{ once: true }}
          >
            <SectionLabel label={sec06.label || "Web3 Gaming & Competitive Edge"} align="center" />
            <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[34px] text-white leading-tight mb-3">
              {sec06.heading || "HYPER TEK, A WEB3 GAMING SOLUTION AND THE KEY ADVANTAGES"}
            </h2>
            <p className="text-white/50 text-[13px] leading-relaxed" style={{ fontFamily: "Orbitron, sans-serif" }}>
              {sec06.subtitle}
            </p>
          </motion.div>

          {/* Numbered cards — one card per item, stacked; width matched to other sections */}
          <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
            {sec06Cards.map((card, i) => {
              const ca = WEB3_CARD_ACCENTS[i] || WEB3_CARD_ACCENTS[0];
              const bullets = Array.isArray(card.bullets) ? card.bullets : [];
              return (
                <motion.div
                  key={card.label}
                  className="rounded-2xl p-6 md:p-8 flex gap-5 md:gap-8 items-center"
                  style={{ background: ca.bg, border: `1px solid ${ca.border}`, borderLeft: `3px solid ${ca.borderTop}` }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.07 }} viewport={{ once: true }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  {/* Index number — centered, sole visual anchor (icon removed) */}
                  <div className="flex-shrink-0 w-12 md:w-20 text-center">
                    <span className="font-[Goldman] font-bold text-3xl md:text-[46px] leading-none" style={{ color: ca.accent }}>
                      0{i + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-[16px] md:text-[20px] font-bold uppercase tracking-[0.12em] leading-snug mb-3.5" style={{ fontFamily: "Orbitron, sans-serif", color: ca.accent }}>
                      {card.label}
                    </h3>

                    {card.body && (
                      <p className="text-white/75 text-[13px] md:text-[14.5px] leading-relaxed max-w-3xl">
                        {card.body}
                      </p>
                    )}
                    {bullets.length > 0 && (
                      <ul className="flex flex-col gap-2.5">
                        {bullets.map((b, j) => (
                          <li key={j} className="flex gap-2.5 items-start">
                            <div className="w-1.5 h-1.5 rounded-full mt-[6px] flex-shrink-0" style={{ background: ca.accent }} />
                            <span className="text-white/70 text-[13px] md:text-[13.5px] leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LIMITED EDITION NFAS & PACKAGES (copied from Home — shared component)
      ══════════════════════════════════════════════════════ */}
      <CrowdfundingPackages />

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

          <p className="text-white/48 text-sm md:text-[15px] leading-[1.9] italic mb-8">
            {closing.body}
          </p>

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

export default Crowdfunding;
