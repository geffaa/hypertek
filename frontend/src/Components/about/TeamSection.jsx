import { motion } from "framer-motion";
import { TEAM_GROUPS } from "../../data/team";

// One accent per group so the three tiers read as different areas of the page.
const ACCENTS = ["#38bdf8", "#a78bfa", "#fbbf24"];

const pad = (n) => String(n).padStart(2, "0");

// First sentence is set larger as a lede; the rest of the bio follows in body text.
function splitLede(bio) {
  const m = bio.match(/^(.+?[.!?])\s+(?=[A-Z])/);
  return m ? [m[1], bio.slice(m[0].length)] : [bio, ""];
}

function Corner({ accent, className }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute w-4 h-4 pointer-events-none ${className}`}
      style={{ borderColor: accent, opacity: 0.55 }}
    />
  );
}

// A personnel file. The identity column stays pinned while a long bio scrolls
// past, which keeps Don's 1,500 characters and Zee's 300 equally comfortable.
// No photo is needed: the large index numeral and the fact chips carry the
// left column. A photo, when supplied, sits above the name in a framed corner.
function Dossier({ member, accent, number, index }) {
  const [lede, rest] = splitLede(member.bio);
  return (
    <motion.article
      className="group relative grid grid-cols-1 md:grid-cols-[300px_1fr] gap-x-14 gap-y-6 py-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 2) * 0.06 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      <header className="md:sticky md:top-28 self-start flex flex-col gap-3">
        <span
          aria-hidden="true"
          className="font-[Goldman] font-bold leading-none select-none text-[72px] md:text-[96px]"
          style={{ color: "transparent", WebkitTextStroke: `1px ${accent}`, opacity: 0.6 }}
        >
          {pad(number)}
        </span>

        {member.photo && (
          <div className="relative w-28 h-28 mb-1">
            <img src={member.photo} alt={member.name} loading="lazy" className="w-full h-full object-cover rounded-md" />
            <Corner accent={accent} className="-top-1.5 -left-1.5 border-t-2 border-l-2" />
            <Corner accent={accent} className="-bottom-1.5 -right-1.5 border-b-2 border-r-2" />
          </div>
        )}

        <h4 className="text-white font-[Goldman] font-bold text-2xl leading-tight">{member.name}</h4>
        <p className="text-[13px] font-semibold leading-snug uppercase tracking-wide" style={{ color: accent }}>
          {member.role}
        </p>

        {member.facts?.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-2">
            {member.facts.map((f) => (
              <li
                key={f}
                className="text-[11px] text-white/75 px-2.5 py-1 rounded-full"
                style={{ border: `1px solid ${accent}55`, background: `${accent}12` }}
              >
                {f}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div
        className="relative rounded-xl p-6 md:p-8 transition-colors duration-300"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span
          aria-hidden="true"
          className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
        />
        <Corner accent={accent} className="top-2 right-2 border-t border-r" />
        <Corner accent={accent} className="bottom-2 right-2 border-b border-r" />

        <p className="text-white text-[17px] md:text-[18px] leading-[1.7] font-medium text-left">{lede}</p>
        {rest && <p className="text-white/65 text-[14.5px] leading-[1.95] text-left mt-4">{rest}</p>}
      </div>
    </motion.article>
  );
}

export default function TeamSection() {
  let counter = 0;
  return (
    <section id="team" className="relative w-full px-6 md:px-12 xl:px-20 pt-16 pb-10 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        <motion.div
          className="text-center mb-14 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-sky-300/80">The Crew Behind Hyper Tek</span>
          <h2 className="font-[Goldman] font-bold text-white text-3xl md:text-5xl uppercase tracking-wide">Meet the Team</h2>
          <div className="h-px w-40 mt-1" style={{ background: "linear-gradient(90deg, transparent, #38bdf8, transparent)" }} />
        </motion.div>

        <div className="flex flex-col gap-16">
          {TEAM_GROUPS.map((group, gi) => {
            const accent = ACCENTS[gi % ACCENTS.length];
            return (
              <div key={group.title}>
                <div className="flex items-center gap-4">
                  <span className="font-[Goldman] text-sm font-bold" style={{ color: accent }}>
                    {pad(gi + 1)}
                  </span>
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.28em] text-white">
                    {group.title}
                  </h3>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent}88, transparent)` }} />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 hidden sm:inline">
                    {pad(group.members.length)} {group.members.length === 1 ? "member" : "members"}
                  </span>
                </div>
                <div className="mt-2 divide-y divide-white/10">
                  {group.members.map((m, i) => {
                    counter += 1;
                    return <Dossier key={m.name} member={m} accent={accent} number={counter} index={i} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
