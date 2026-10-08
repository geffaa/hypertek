import { motion } from "framer-motion";
import { TEAM_GROUPS } from "../../data/team";

// One accent per group so the three tiers read as different areas of the page.
const ACCENTS = ["#38bdf8", "#a78bfa", "#fbbf24"];

// First sentence is set larger as a lede; the rest of the bio follows in body text.
function splitLede(bio) {
  const m = bio.match(/^(.+?[.!?])\s+(?=[A-Z])/);
  return m ? [m[1], bio.slice(m[0].length)] : [bio, ""];
}

// Identity on the left stays pinned while a long bio scrolls past, so a
// 1,500 character bio and a 300 character one read equally comfortably.
// A photo, when supplied, sits above the name; without one nothing is missing.
function Member({ member, accent, index }) {
  const [lede, rest] = splitLede(member.bio);
  return (
    <motion.article
      className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-x-16 gap-y-4 py-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 2) * 0.05 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      <header className="md:sticky md:top-28 self-start flex flex-col gap-2">
        {member.photo && (
          <img
            src={member.photo}
            alt={member.name}
            loading="lazy"
            className="w-24 h-24 rounded-full object-cover mb-2"
            style={{ border: `2px solid ${accent}` }}
          />
        )}
        <h4 className="text-white font-[Goldman] font-bold text-[26px] leading-tight">{member.name}</h4>
        <p className="text-[12.5px] font-semibold leading-snug uppercase tracking-[0.14em]" style={{ color: accent }}>
          {member.role}
        </p>
      </header>

      <div className="max-w-[820px]">
        <p className="text-white text-[18px] leading-[1.7] text-left">{lede}</p>
        {rest && <p className="text-white/60 text-[15px] leading-[1.95] text-left mt-4">{rest}</p>}
      </div>
    </motion.article>
  );
}

export default function TeamSection() {
  return (
    <section id="team" className="relative w-full px-6 md:px-12 xl:px-20 pt-16 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.h2
          className="text-center mb-16 font-[Goldman] font-bold text-white text-3xl md:text-5xl uppercase tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Meet the Team
        </motion.h2>

        <div className="flex flex-col gap-10">
          {TEAM_GROUPS.map((group, gi) => {
            const accent = ACCENTS[gi % ACCENTS.length];
            return (
              <div key={group.title}>
                <div className="flex items-center gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: accent }}>
                    {group.title}
                  </h3>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent}66, transparent)` }} />
                </div>
                <div className="divide-y divide-white/[0.07]">
                  {group.members.map((m, i) => (
                    <Member key={m.name} member={m} accent={accent} index={i} />
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
