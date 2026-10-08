import { motion } from "framer-motion";
import { TEAM_GROUPS } from "../../data/team";

// One accent per group so the three tiers read as different areas of the page.
const ACCENTS = [
  { c: "#38bdf8", soft: "rgba(56,189,248,0.06)", line: "rgba(56,189,248,0.28)" },
  { c: "#a78bfa", soft: "rgba(167,139,250,0.06)", line: "rgba(167,139,250,0.28)" },
  { c: "#fbbf24", soft: "rgba(251,191,36,0.05)", line: "rgba(251,191,36,0.28)" },
];

// First sentence is set larger as a lede; the rest of the bio follows in body text.
function splitLede(bio) {
  const m = bio.match(/^(.+?[.!?])\s+(?=[A-Z])/);
  return m ? [m[1], bio.slice(m[0].length)] : [bio, ""];
}

function MemberCard({ member, accent, index }) {
  const [lede, rest] = splitLede(member.bio);
  return (
    <motion.article
      className="rounded-2xl flex flex-col gap-5 h-full p-6 md:p-7"
      style={{ background: accent.soft, border: `1px solid ${accent.line}`, borderTop: `3px solid ${accent.c}` }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 3) * 0.06 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <header className="flex flex-col gap-1.5 pb-5 border-b border-white/10">
        {member.photo && (
          <img
            src={member.photo}
            alt={member.name}
            loading="lazy"
            className="w-20 h-20 rounded-full object-cover mb-2"
            style={{ border: `2px solid ${accent.c}` }}
          />
        )}
        <h4 className="text-white font-[Goldman] font-bold text-2xl leading-tight">{member.name}</h4>
        <p className="text-[13px] font-bold leading-snug uppercase tracking-[0.12em]" style={{ color: accent.c }}>
          {member.role}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <p className="text-white text-[16px] font-medium leading-[1.7] text-left">{lede}</p>
        {rest && <p className="text-white/90 text-[14px] leading-[1.85] text-left">{rest}</p>}
      </div>
    </motion.article>
  );
}

// Card widths follow bio length so cards in a row end at about the same height:
// leadership gives Don's longer bio the wider card, and the other two groups
// have bios of similar length, so equal columns already balance.
const GRID = {
  0: "grid-cols-1 lg:grid-cols-[1.65fr_1fr]",
  1: "grid-cols-1 md:grid-cols-3",
  2: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export default function TeamSection() {
  return (
    <section id="team" className="relative w-full px-6 md:px-12 xl:px-20 pt-16 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.h2
          className="text-center mb-14 font-[Goldman] font-bold text-white text-3xl md:text-5xl uppercase tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Meet the Team
        </motion.h2>

        <div className="flex flex-col gap-14">
          {TEAM_GROUPS.map((group, gi) => {
            const accent = ACCENTS[gi % ACCENTS.length];
            return (
              <div key={group.title} className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <span className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: accent.c }} />
                  <h3 className="font-[Goldman] font-bold text-white text-lg md:text-2xl uppercase tracking-[0.08em]">
                    {group.title}
                  </h3>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent.c}99, transparent)` }} />
                </div>
                <div className={`grid gap-5 ${GRID[gi] || GRID[1]}`}>
                  {group.members.map((m, i) => (
                    <MemberCard key={m.name} member={m} accent={accent} index={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
