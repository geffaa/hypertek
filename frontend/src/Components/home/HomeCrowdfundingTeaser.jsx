import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import HelpCards from "./HelpCards";

const EARLY_ACCESS = {
  eyebrow: "LIMITED-TIME OPPORTUNITY",
  heading: "Don't Miss the Early-Access Window",
  bullets: [
    "Limited-edition NFAs and discounted packages are available now – only while early access stays open.",
    "Discounts close for good the moment we launch our envisioned crowdfunding campaign.",
    "Limited-edition items remain only until our funding target is reached – then they're gone for good.",
  ],
};

const VEHICLES = ["/vehicle1.webp", "/vehicle2-1.webp", "/vehicle2.webp", "/vehicle3-1.webp", "/vehicle3.webp"];
const AVATARS = [
  "/avatar/commander-elite.webp", "/avatar/dryads-female.webp", "/avatar/dryads-male.webp",
  "/avatar/fawnus-female.webp", "/avatar/fawnus-male.webp", "/avatar/geodians-female.webp",
  "/avatar/geodians-male.webp", "/avatar/lithionites-female.webp", "/avatar/lithionites-male.webp",
  "/avatar/mantasquads-female.webp", "/avatar/mantasquads-male.webp", "/avatar/marmulus-female.webp",
  "/avatar/marmulus-male.webp", "/avatar/ophidians-female.webp", "/avatar/ophidians-male.webp",
  "/avatar/overlord.webp", "/avatar/team-specialist-major.webp",
];

export default function HomeCrowdfundingTeaser() {
  const { t } = useTranslation();
  const sec05 = t("aboutPage.section05", { returnObjects: true }) || {};
  const sec05Help = Array.isArray(sec05.helpItems) ? sec05.helpItems : [];

  const linkParts = (sec05.link || "").split("—");
  const linkUrl = (linkParts[0] || "").replace(/[[\]]/g, "").trim();
  const linkSlogan = linkParts.length > 1 ? linkParts.slice(1).join("—").trim() : "";

  // Vehicle + avatar advance once per visit (no per-second cycling) — same
  // behaviour as the Crowdfunding page. They stay fixed while the user is on the
  // page and only change when they leave and come back (component remounts).
  const [rotationSeed] = useState(() => {
    const key = "cf_avatar_rotation";
    let prev = 0;
    try { prev = parseInt(localStorage.getItem(key) || "0", 10) || 0; } catch { prev = 0; }
    const next = (prev + 1) % AVATARS.length;
    try { localStorage.setItem(key, String(next)); } catch { /* ignore */ }
    return next;
  });
  const vehicleIdx = rotationSeed % VEHICLES.length;
  const avatarIdx = rotationSeed % AVATARS.length;

  return (
    <section className="relative z-10 w-full px-6 pb-6">
      <div className="mx-auto max-w-[1400px]">

        {/* ── How YOU Can Help ── */}
        <motion.div
          className="pt-2 pb-14 md:pt-4 md:pb-16 mb-0"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} viewport={{ once: true }}
        >
          <h3 className="font-[Goldman] font-bold text-white text-2xl md:text-3xl text-center mb-10">
            {sec05.helpHeading || "How YOU Can Help Right Now"}
          </h3>

          <HelpCards items={sec05Help} />
        </motion.div>

      </div>

      {/* ── Don't Miss the Early-Access Window ──
          Full-width breakout only from xl up, where the side images live. Below
          xl the negative-margin breakout is skipped: the global mobile rule
          `div { max-width: 100% }` clamps the widened width but keeps the
          negative margins, which would shift the whole section left. */}
      <motion.div
        className="relative pt-2 pb-10 md:pb-14 text-center xl:-mx-6 xl:w-[calc(100%+3rem)]"
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
      >
        {/* Decorative left — vehicle (hidden below xl: no room next to the text) */}
        <img
          src={VEHICLES[vehicleIdx]}
          alt=""
          aria-hidden="true"
          className="hidden xl:block absolute top-1/2 pointer-events-none select-none transition-opacity duration-700"
          style={{ width: "clamp(320px, 38vw, 540px)", opacity: 1, transform: "translateY(-50%)", left: "40px" }}
        />
        {/* Decorative right — avatar */}
        <img
          src={AVATARS[avatarIdx]}
          alt=""
          aria-hidden="true"
          className="hidden xl:block absolute pointer-events-none select-none transition-opacity duration-700"
          style={{ width: "clamp(240px, 28vw, 400px)", opacity: 1, right: "80px", bottom: "-120px" }}
        />

        <div className="relative w-full px-6 sm:px-10 xl:px-[clamp(180px,28vw,420px)]">
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

          <ul className="flex flex-col gap-4 md:gap-5 mb-8 text-left max-w-2xl mx-auto">
            {EARLY_ACCESS.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 md:gap-4 items-start">
                <ArrowRight size={20} color="#fbbf24" strokeWidth={2} className="mt-[3px] flex-shrink-0" />
                <span className="text-white text-[15px] md:text-[19px] leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <Link
              to="/genesis"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[12px] md:text-[13px] font-bold uppercase tracking-[0.12em] text-[#0b0b14] transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", fontFamily: "Orbitron, sans-serif", boxShadow: "0 0 32px rgba(251,191,36,0.35)" }}
            >
              Learn More
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-[1400px]">
        {/* Closing slogan */}
        <div className="flex flex-col items-center mt-6 mb-2">
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
  );
}
