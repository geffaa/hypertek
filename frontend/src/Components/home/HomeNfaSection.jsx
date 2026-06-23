import { motion } from "framer-motion";
import { Layers3, Gem, Network, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

const NFA_CARDS_STATIC = [
  { Icon: Layers3, accent: "#38bdf8", glow: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.35)", type: "tiers" },
  { Icon: Gem, accent: "#fbbf24", glow: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.4)", type: "value" },
  { Icon: Network, accent: "#818cf8", glow: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.35)", type: "fair" },
  { Icon: Rocket, accent: "#4ade80", glow: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.35)", type: "involved" },
];

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 14, fontWeight: "bold", color: "rgba(56,189,248,0.95)", letterSpacing: "0.35em", textShadow: "0 0 12px rgba(56,189,248,0.6)" }}>{number}</span>
      <div className="w-8 h-px" style={{ background: "rgba(56,189,248,0.55)" }} />
      <span className="text-white/70 text-[12px] font-bold tracking-[0.3em] uppercase">{label}</span>
    </div>
  );
}

export default function HomeNfaSection() {
  const { t } = useTranslation();
  const sec04 = t("aboutPage.section04", { returnObjects: true }) || {};
  const sec04Cards = Array.isArray(sec04.cards) ? sec04.cards : [];

  return (
    <section className="relative w-full px-6 md:px-12 xl:px-20 pt-16 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-10">
          <SectionLabel number="04" label={sec04.label || "Non-Fungible Digital Artworks"} />
          <h2 className="font-[Goldman] font-bold text-2xl md:text-3xl xl:text-[36px] text-white leading-tight">
            {sec04.heading || "Digital Art With Guaranteed Value"}
          </h2>
          <p className="text-white/45 text-[12px] mt-2 tracking-[0.2em] uppercase" style={{ fontFamily: "Orbitron, sans-serif" }}>
            {sec04.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sec04Cards.map((card, i) => {
            const cs = NFA_CARDS_STATIC[i] || NFA_CARDS_STATIC[0];
            return (
              <motion.div
                key={card.title}
                className="relative rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: cs.glow, border: `1px solid ${cs.border}`, borderTop: `3px solid ${cs.accent}` }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cs.accent}18`, border: `1px solid ${cs.accent}45`, boxShadow: `0 0 10px ${cs.accent}20` }}>
                    <cs.Icon size={15} color={cs.accent} strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-[0.18em]"
                    style={{ fontFamily: "Orbitron, sans-serif", color: cs.accent }}>
                    {card.title}
                  </span>
                </div>
                {cs.type === "tiers" && card.items && (
                  <div className="flex flex-col gap-2">
                    <p className="text-white/70 text-[13px] leading-relaxed">{card.intro}</p>
                    {card.items.map((r) => (
                      <div key={r.label} className="flex gap-2 text-[13px]">
                        <span className="font-bold text-white/90 flex-shrink-0">{r.label}</span>
                        <span className="text-white/60">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
                {cs.type === "value" && card.bullets && (
                  <ul className="flex flex-col gap-2">
                    {card.bullets.map((b) => (
                      <li key={b} className="flex gap-2 items-start">
                        <div className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0" style={{ background: cs.accent }} />
                        <span className="text-white/75 text-[13px] leading-relaxed font-semibold">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {cs.type === "fair" && (
                  <p className="text-white/70 text-[13px] leading-[1.85]">{card.body}</p>
                )}
                {cs.type === "involved" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-white/70 text-[13px] leading-[1.85]">{card.body}</p>
                    <span className="text-[12px] font-bold" style={{ color: cs.accent, fontFamily: "Orbitron, sans-serif" }}>
                      {card.link}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.p
          className="text-center text-white/30 text-[12px] italic mt-10 leading-relaxed"
          style={{ fontFamily: "Orbitron, sans-serif" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}
        >
          {sec04.quote}
        </motion.p>
      </div>
    </section>
  );
}
