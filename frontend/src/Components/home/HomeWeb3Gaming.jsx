import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CARD_ACCENTS } from "./cardAccents";

function SectionLabel({ label, align = "left" }) {
  return (
    <div className={`flex items-center gap-3 mb-5 ${align === "center" ? "justify-center" : ""}`}>
      <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />
      <span className="text-white/70 text-[12px] font-bold tracking-[0.3em] uppercase">{label}</span>
      {align === "center" && <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />}
    </div>
  );
}

export default function HomeWeb3Gaming() {
  const { t } = useTranslation();
  const sec06 = t("aboutPage.section06", { returnObjects: true }) || {};
  const sec06Cards = Array.isArray(sec06.cards) ? sec06.cards : [];

  return (
    <section className="relative w-full pt-14 pb-16 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.35) 35%,rgba(167,139,250,0.35) 65%,transparent)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,8,40,0.35) 0%,rgba(6,6,16,0) 60%)" }} />

      <div className="relative w-full max-w-[1400px] mx-auto px-6">
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
            const ca = CARD_ACCENTS[i] || CARD_ACCENTS[0];
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
    </section>
  );
}
