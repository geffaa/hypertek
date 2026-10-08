import { motion } from "framer-motion";
import { TEAM_GROUPS } from "../../data/team";

// One accent per group so the three tiers read as different areas of the page.
const ACCENTS = [
  { c: "#38bdf8", soft: "rgba(56,189,248,0.07)", line: "rgba(56,189,248,0.25)" },
  { c: "#a78bfa", soft: "rgba(167,139,250,0.07)", line: "rgba(167,139,250,0.25)" },
  { c: "#fbbf24", soft: "rgba(251,191,36,0.06)", line: "rgba(251,191,36,0.25)" },
];

// A photo is shown only when one has been supplied. Without it the card is
// text only, so nothing looks like a missing picture.
function Avatar({ member, accent, size }) {
  if (!member.photo) return null;
  return (
    <img
      src={member.photo}
      alt={member.name}
      loading="lazy"
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size, border: `2px solid ${accent.c}` }}
    />
  );
}

const cardStyle = (accent, pad) => ({
  padding: pad,
  background: accent.soft,
  border: `1px solid ${accent.line}`,
  borderLeft: `3px solid ${accent.c}`,
});

const reveal = (index) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: Math.min(index, 3) * 0.06 },
  viewport: { once: true },
});

// Leadership: name and role on top, then the bio in one column. The cards are
// capped in width and centred so the lines stay readable and a short bio does
// not leave one side of a wide card empty.
function LeaderRow({ member, accent, index }) {
  return (
    <motion.article className="rounded-2xl flex flex-col gap-5 w-full max-w-5xl mx-auto" style={cardStyle(accent, "28px")} {...reveal(index)}>
      <header className="flex items-center gap-4">
        <Avatar member={member} accent={accent} size={72} />
        <div className="min-w-0">
          <h4 className="text-white font-[Goldman] font-bold text-xl leading-tight">{member.name}</h4>
          <p className="text-[13px] font-semibold leading-snug mt-1" style={{ color: accent.c }}>{member.role}</p>
        </div>
      </header>
      <p className="text-white/70 text-[15px] leading-[1.9] text-left">{member.bio}</p>
    </motion.article>
  );
}

// Other groups: bios are all roughly the same length, so equal-height cards
// in a grid stay balanced.
function MemberCard({ member, accent, index }) {
  return (
    <motion.article className="rounded-2xl flex flex-col gap-4 h-full" style={cardStyle(accent, "20px")} {...reveal(index)}>
      <header className="flex items-center gap-4">
        <Avatar member={member} accent={accent} size={52} />
        <div className="min-w-0">
          <h4 className="text-white font-[Goldman] font-bold text-base leading-tight">{member.name}</h4>
          <p className="text-[12px] font-semibold leading-snug mt-0.5" style={{ color: accent.c }}>{member.role}</p>
        </div>
      </header>
      <p className="text-white/65 text-[13px] leading-[1.8] text-left">{member.bio}</p>
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

        <div className="flex flex-col gap-12">
          {TEAM_GROUPS.map((group, gi) => {
            const accent = ACCENTS[gi % ACCENTS.length];
            const leaders = gi === 0;
            const cols = group.members.length > 3
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
              : "grid-cols-1 md:grid-cols-3";
            return (
              <div key={group.title} className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] md:whitespace-nowrap" style={{ color: accent.c }}>
                    {group.title}
                  </h3>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent.line}, transparent)` }} />
                </div>
                {leaders ? (
                  <div className="flex flex-col gap-5">
                    {group.members.map((m, i) => <LeaderRow key={m.name} member={m} accent={accent} index={i} />)}
                  </div>
                ) : (
                  <div className={`grid gap-5 ${cols}`}>
                    {group.members.map((m, i) => <MemberCard key={m.name} member={m} accent={accent} index={i} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
