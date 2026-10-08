import { useState } from "react";
import { motion } from "framer-motion";
import { TEAM_GROUPS } from "../../data/team";

// One accent per group so the three tiers read as different areas of the page.
const ACCENTS = [
  { c: "#38bdf8", soft: "rgba(56,189,248,0.07)", line: "rgba(56,189,248,0.25)" },
  { c: "#a78bfa", soft: "rgba(167,139,250,0.07)", line: "rgba(167,139,250,0.25)" },
  { c: "#fbbf24", soft: "rgba(251,191,36,0.06)", line: "rgba(251,191,36,0.25)" },
];

const initials = (name) => name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("");

// Photo when one is supplied, otherwise a monogram ring that keeps the header
// the same height, so cards line up whether or not a photo exists yet.
function Avatar({ member, accent, size }) {
  const box = { width: size, height: size };
  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={member.name}
        loading="lazy"
        className="rounded-full object-cover flex-shrink-0"
        style={{ ...box, border: `2px solid ${accent.c}` }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center font-[Goldman] font-bold"
      style={{
        ...box,
        color: accent.c,
        fontSize: size * 0.34,
        background: `radial-gradient(circle at 30% 25%, ${accent.soft}, rgba(255,255,255,0.02))`,
        border: `1.5px solid ${accent.line}`,
      }}
      aria-hidden="true"
    >
      {initials(member.name)}
    </div>
  );
}

function MemberCard({ member, accent, featured, index }) {
  const [open, setOpen] = useState(false);
  const lines = featured ? 7 : 4;
  const clamp = open
    ? {}
    : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" };

  return (
    <motion.article
      className="rounded-2xl flex flex-col gap-4 h-full"
      style={{
        padding: featured ? "28px" : "20px",
        background: accent.soft,
        border: `1px solid ${accent.line}`,
        borderLeft: `3px solid ${accent.c}`,
      }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 3) * 0.06 }}
      viewport={{ once: true }}
    >
      <header className="flex items-center gap-4">
        <Avatar member={member} accent={accent} size={featured ? 68 : 48} />
        <div className="min-w-0">
          <h4 className={`text-white font-[Goldman] font-bold leading-tight ${featured ? "text-xl" : "text-base"}`}>
            {member.name}
          </h4>
          <p className="text-[12px] font-semibold leading-snug mt-0.5" style={{ color: accent.c }}>
            {member.role}
          </p>
        </div>
      </header>

      <p
        className={`text-white/65 leading-[1.8] text-left ${featured ? "text-[14px]" : "text-[13px]"}`}
        style={clamp}
      >
        {member.bio}
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-auto self-start text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
        style={{ color: accent.c }}
      >
        {open ? "Show less" : "Read full bio"}
      </button>
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
            const featured = gi === 0;
            const cols = featured
              ? "grid-cols-1 lg:grid-cols-2"
              : group.members.length > 3
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
                <div className={`grid gap-5 ${cols}`}>
                  {group.members.map((m, i) => (
                    <MemberCard key={m.name} member={m} accent={accent} featured={featured} index={i} />
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
