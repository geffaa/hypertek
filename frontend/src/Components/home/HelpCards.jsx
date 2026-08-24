import { motion } from "framer-motion";
import { CARD_ACCENTS, CARD_ACCENTS_SOLID } from "./cardAccents";

/* "How YOU Can Help Right Now" cards — numbered cards in the same visual
   language as the Web3.5 Gaming section, shared by the home page teaser and
   the crowdfunding page so both always look identical. `solid` swaps to
   opaque card backgrounds for pages with busy artwork behind the section. */
export default function HelpCards({ items, solid = false }) {
  const palette = solid ? CARD_ACCENTS_SOLID : CARD_ACCENTS;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((item, i) => {
        const ca = palette[i] || palette[0];
        const desc = (item.text || "").replace(/^[\s—–-]+/, "");
        const sentence = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : "";
        return (
          <motion.div
            key={item.bold}
            className="rounded-2xl p-6 md:p-7 flex flex-col gap-4"
            style={{ background: ca.bg, border: `1px solid ${ca.border}`, borderTop: `3px solid ${ca.borderTop}` }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.09 }} viewport={{ once: true }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <span className="font-[Goldman] font-bold text-[42px] leading-none" style={{ color: ca.accent }}>
              0{i + 1}
            </span>
            <h4 className="text-[15px] md:text-[17px] font-bold uppercase tracking-[0.1em] leading-snug" style={{ fontFamily: "Orbitron, sans-serif", color: ca.accent }}>
              {item.bold}
            </h4>
            <p className="text-white/75 text-[13px] md:text-[14px] leading-relaxed">{sentence}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
