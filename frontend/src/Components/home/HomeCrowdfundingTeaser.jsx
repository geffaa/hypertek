import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const HELP_META = [
  { accent: "#38bdf8", iconBg: "rgba(56,189,248,0.12)" },
  { accent: "#fbbf24", iconBg: "rgba(251,191,36,0.12)" },
  { accent: "#22c55e", iconBg: "rgba(34,197,94,0.12)" },
];

const EARLY_ACCESS = {
  eyebrow: "LIMITED-TIME OPPORTUNITY",
  heading: "Don't Miss the Early-Access Window",
  bullets: [
    "Limited-edition NFAs and discounted packages are available now – only while early access stays open.",
    "Discounts close for good the moment we launch our envisioned crowdfunding campaign.",
    "Limited-edition items remain only until our funding target is reached – then they're gone for good.",
  ],
  note: "Watch for updates, read the White Paper, and lock in early pricing before the crowd arrives.",
};

export default function HomeCrowdfundingTeaser() {
  const { t } = useTranslation();
  const sec05 = t("aboutPage.section05", { returnObjects: true }) || {};
  const sec05Help = Array.isArray(sec05.helpItems) ? sec05.helpItems : [];

  const linkParts = (sec05.link || "").split("—");
  const linkUrl = (linkParts[0] || "").replace(/[[\]]/g, "").trim();
  const linkSlogan = linkParts.length > 1 ? linkParts.slice(1).join("—").trim() : "";

  return (
    <section className="relative z-10 w-full px-6 pb-16">
      <div className="mx-auto max-w-[1400px]">

        {/* ── How YOU Can Help ── */}
        <motion.div
          className="py-14 md:py-16 mb-8"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} viewport={{ once: true }}
        >
          <h3 className="font-[Goldman] font-bold text-white text-2xl md:text-3xl text-center mb-10">
            {sec05.helpHeading || "How YOU Can Help Right Now"}
          </h3>

          <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-8 w-full">
            {sec05Help.map((item, idx) => {
              const m = HELP_META[idx] || HELP_META[0];
              const desc = (item.text || "").replace(/^[\s—–-]+/, "");
              const sentence = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : "";
              return (
                <div key={item.bold} className="flex-1 flex flex-col items-center text-center gap-3">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-[Goldman] font-bold text-xl"
                    style={{ background: m.iconBg, border: `1.5px solid ${m.accent}`, color: m.accent }}
                  >
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-white text-[15px] md:text-[17px] uppercase tracking-wide leading-snug">{item.bold}</h4>
                  <p className="text-white/65 text-[13.5px] md:text-[14.5px] leading-relaxed">{sentence}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Don't Miss the Early-Access Window ── */}
        <motion.div
          className="relative mt-2 md:mt-4 py-10 md:py-14 text-center w-full overflow-hidden"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
        >
          {/* Decorative left — vehicle */}
          <img
            src="/vehicle3.webp"
            alt=""
            aria-hidden="true"
            className="absolute top-1/2 pointer-events-none select-none"
            style={{ width: "clamp(280px, 34vw, 480px)", opacity: 0.75, transform: "translateY(-50%)", left: "-80px" }}
          />
          {/* Decorative right — avatar */}
          <img
            src="/avatar/commander-elite.webp"
            alt=""
            aria-hidden="true"
            className="absolute right-0 pointer-events-none select-none"
            style={{ width: "clamp(200px, 25vw, 360px)", opacity: 0.75, bottom: "-20px" }}
          />

          <div className="relative w-full">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ background: "rgba(251,191,36,0.6)" }} />
              <span className="text-amber-300 text-[15px] font-bold uppercase tracking-[0.3em]" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {EARLY_ACCESS.eyebrow}
              </span>
              <div className="w-12 h-px" style={{ background: "rgba(251,191,36,0.6)" }} />
            </div>

            <h3 className="font-[Goldman] font-bold text-white text-3xl md:text-[48px] leading-tight mb-5">
              {EARLY_ACCESS.heading}
            </h3>
            <div className="w-20 h-[3px] rounded-full mx-auto mb-10" style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }} />

            <ul className="flex flex-col gap-5 mb-10 max-w-4xl mx-auto text-left">
              {EARLY_ACCESS.bullets.map((b, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <ArrowRight size={20} color="#fbbf24" strokeWidth={2} className="mt-[3px] flex-shrink-0" />
                  <span className="text-white/80 text-[17px] md:text-[19px] leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/crowdfunding"
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

        {/* Closing slogan */}
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
  );
}
