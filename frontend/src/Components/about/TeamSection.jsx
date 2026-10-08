import { motion } from "framer-motion";
import { TEAM_GROUPS } from "../../data/team";

// One accent per group so the three tiers read as different areas of the page.
const ACCENTS = ["#38bdf8", "#a78bfa", "#fbbf24"];

// Every person is one row: identity on the left, full bio on the right. Rows
// size to their own text, so a 1,500 character bio and a 300 character one sit
// in the same layout without stretched cards or blank space, and the list reads
// the same with or without photos (a photo, when supplied, sits above the name).
function Member({ member, accent, index }) {
  return (
    <motion.article
      className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-x-12 gap-y-3 py-7"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 3) * 0.05 }}
      viewport={{ once: true }}
    >
      <header className="flex flex-col gap-2">
        {member.photo && (
          <img
            src={member.photo}
            alt={member.name}
            loading="lazy"
            className="w-20 h-20 rounded-full object-cover mb-1"
            style={{ border: `2px solid ${accent}` }}
          />
        )}
        <h4 className="text-white font-[Goldman] font-bold text-lg leading-tight">{member.name}</h4>
        <p className="text-[13px] font-semibold leading-snug" style={{ color: accent }}>{member.role}</p>
      </header>
      <p className="text-white/70 text-[14.5px] leading-[1.9] text-left">{member.bio}</p>
    </motion.article>
  );
}

export default function TeamSection() {
  return (
    <section id="team" className="relative w-full px-6 md:px-12 xl:px-20 pt-12 pb-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-[Goldman] font-bold text-white text-2xl md:text-4xl uppercase tracking-wide">Meet the Team</h2>
        </motion.div>

        <div className="flex flex-col gap-14">
          {TEAM_GROUPS.map((group, gi) => {
            const accent = ACCENTS[gi % ACCENTS.length];
            return (
              <div key={group.title}>
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                  <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.25em]" style={{ color: accent }}>
                    {group.title}
                  </h3>
                </div>
                <div className="mt-5 border-t divide-y divide-white/10" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
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
