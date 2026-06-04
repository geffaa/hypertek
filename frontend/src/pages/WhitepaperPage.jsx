import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SECTION_IDS = [
  "executive-summary",
  "three-worlds",
  "technology",
  "nfa",
  "hyperbucks",
  "marketplace",
  "roadmap",
  "conclusion",
];

function SectionHeading({ number, title }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-[#002AA8] font-[Goldman] text-4xl font-bold leading-none opacity-60 select-none">
        {number}
      </span>
      <h2 className="font-[Goldman] text-2xl md:text-3xl font-bold text-white">{title}</h2>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function WorldCard({ title, genre, tagline, color, features }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: `linear-gradient(135deg, ${color}18 0%, rgba(0,0,0,0.2) 100%)`,
        border: `1px solid ${color}40`,
      }}
    >
      <h3 className="font-[Goldman] text-xl font-bold text-white">{title}</h3>
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color }}>{genre}</p>
      <p className="text-white/70 text-sm leading-relaxed">{tagline}</p>
      <ul className="space-y-2 mt-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/60">
            <span className="mt-0.5 shrink-0" style={{ color }}>▸</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RarityBadge({ tier, color, dropRate, reserve, bonuses }) {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${color}50` }}
    >
      <span className="font-semibold text-sm" style={{ color }}>{tier}</span>
      <span className="text-white/50 text-xs">{t("whitepaper.dropRate")}: {dropRate}</span>
      <span className="text-white/80 text-xs font-semibold">{t("whitepaper.reserve")}: {reserve}</span>
      <span className="text-white/50 text-xs">{bonuses}</span>
    </div>
  );
}

function RoadmapPhase({ phase, title, period, items, done = false }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: done ? "#002AA8" : "rgba(0,42,168,0.2)",
            border: `2px solid ${done ? "#002AA8" : "rgba(0,42,168,0.4)"}`,
            color: "white",
          }}
        >
          {done ? "✓" : phase}
        </div>
        <div className="w-0.5 flex-1 mt-2" style={{ background: "rgba(0,42,168,0.3)" }} />
      </div>
      <div className="pb-10 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-[Goldman] font-bold text-white">{title}</span>
          {done && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,42,168,0.3)", color: "#60a5fa" }}>
              {t("whitepaper.completed")}
            </span>
          )}
        </div>
        <p className="text-white/40 text-xs mb-3">{period}</p>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-1 w-1 h-1 rounded-full shrink-0 bg-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function WhitepaperPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("executive-summary");
  const [tocOpen, setTocOpen] = useState(false);

  const sections = SECTION_IDS.map(id => ({ id, label: t(`whitepaper.sections.${id}`) }));

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 60) {
        setActiveSection(SECTION_IDS[SECTION_IDS.length - 1]);
        return;
      }
      const offset = window.scrollY + 140;
      let current = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= offset) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: "smooth" });
    }
    setTocOpen(false);
  };

  return (
    <div className="min-h-screen text-white mt-12">

      {/* ── Mobile TOC toggle ── */}
      <div className="lg:hidden sticky top-[68px] z-40 px-4 py-3" style={{ background: "rgba(0,8,32,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => setTocOpen(!tocOpen)} className="flex items-center gap-2 text-sm font-semibold text-white/70">
          <span>☰</span> {t("whitepaper.contents")}
        </button>
        {tocOpen && (
          <div className="mt-3 flex flex-col gap-1">
            {sections.map(({ id, label }) => (
              <button key={id} onClick={() => scrollTo(id)} className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === id ? "text-white bg-blue-900/40" : "text-white/50 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex items-start">

        <aside
          className="hidden lg:flex flex-col shrink-0 w-[260px] sidebar-custom-scroll"
          style={{
            position: "sticky",
            top: 68,
            alignSelf: "flex-start",
            height: "calc(100vh - 68px)",
            overflowY: "auto",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "32px 20px",
          }}
        >
          <p className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase mb-4">{t("whitepaper.contents")}</p>
          <nav className="flex flex-col gap-1">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium ${
                  activeSection === id
                    ? "text-white bg-blue-900/40 border-l-2 border-blue-500 pl-2"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-6">
            <a
              href="/whitepaper.pdf"
              download="HyperTek-Whitepaper.pdf"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-300 border border-white/20 hover:border-white/40"
              style={{ background: "#002AA8" }}
            >
              {t("whitepaper.download")}
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 lg:px-16 py-16 space-y-24">

          {/* ── 01 Executive Summary ── */}
          <section id="executive-summary" className="pt-2">
            <SectionHeading number="01" title="Executive Summary" />

            <Card className="mb-6">
              <h3 className="font-semibold text-lg text-white mb-3">The Gaming Industry at a Crossroads</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-3">
                The global gaming industry has expanded considerably, now exceeding a market valuation of <strong className="text-white">$188 billion</strong> and encompassing more than <strong className="text-white">3.6 billion players</strong> worldwide as of 2025. Despite robust growth, the sector continues to confront persistent challenges — most notably, the loss of time, expertise, and financial investment by players when transitioning between games.
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                On average, gamers devote more than <strong className="text-white">8.5 hours per week</strong> to gameplay, frequently investing hundreds or thousands of hours in individual titles. Nevertheless, server closures or sequels often render accumulated characters, achievements, and purchased digital items obsolete.
              </p>
            </Card>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { title: "Blockchain Gaming Failed", body: "After reaching a peak of $5B in NFT gaming sales in 2021, the sector experienced a decline of over 90%. Most blockchain games prioritised cryptocurrency mechanics at the expense of substantive gameplay." },
                { title: "Pay-to-Win Problem", body: "More than 60% of gamers report frustration with pay-to-win models. Only 8% of players have ever earned tangible value through gameplay, and over 95% of in-game currencies remain non-exchangeable." },
                { title: "Closed Ecosystems", body: "Established companies like Sony, Microsoft, and Nintendo maintain closed ecosystems, restricting asset transferability and confining player investments to individual game titles." },
                { title: "The Solution: Hyper Tek", body: "A 3-in-1 interconnected gaming universe built on Unreal Engine 5 with cross-platform support, fair-play economics, and NFAs with guaranteed minimum buyback values." },
              ].map(({ title, body }) => (
                <Card key={title}>
                  <h4 className="font-semibold text-white text-sm mb-2">{title}</h4>
                  <p className="text-white/55 text-sm leading-relaxed">{body}</p>
                </Card>
              ))}
            </div>

            <Card>
              <h3 className="font-semibold text-white mb-4">Enter Hyper Tek</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Hyper Tek represents the next evolution: a 3-in-1 interconnected gaming universe where strategy, racing, and exploration exist as distinct experiences within a unified ecosystem. Built on Unreal Engine 5 with cross-platform support, your character, assets, and progression flow seamlessly between three immersive worlds.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { name: "Overlord Realm", desc: "MMORTS — command alien civilisations, build colonies, wage strategic warfare" },
                  { name: "Hyper Racing 100", desc: "Futuristic racing simulator — build anti-gravity vehicles, manage racing teams" },
                  { name: "Hyper Quest 100", desc: "RPG exploration — pilot customisable ships, accept delivery contracts, explore alien worlds" },
                ].map(({ name, desc }) => (
                  <div key={name} className="rounded-xl p-4" style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,42,168,0.3)" }}>
                    <p className="font-semibold text-blue-300 text-sm mb-1">{name}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* ── 02 Three Worlds ── */}
          <section id="three-worlds" className="pt-2">
            <SectionHeading number="02" title="The Three Worlds" />

            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Hyper Tek isn't just one game — it's an interconnected universe where three distinct gaming experiences share a unified foundation. Each game offers unique gameplay while contributing to your overall progression and economic power.
            </p>

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <WorldCard
                title="Overlord Realm"
                genre="MMORTS"
                color="#3b82f6"
                tagline="Command one of seven alien civilisations, each with unique bonuses. Your journey begins with a crashed spaceship on a hostile planet."
                features={[
                  "7 civilisations to command",
                  "Land bases up to Grade A (+40% production)",
                  "Research 8+ tech categories, 20–25 levels each",
                  "Colonies (guilds) up to 80 members",
                  "Bi-weekly Hammerong invasion events",
                ]}
              />
              <WorldCard
                title="Hyper Racing 100"
                genre="Racing Simulator"
                color="#f59e0b"
                tagline="Combines Gran Turismo's depth with futuristic anti-gravity racing. Your garage lives in the lower deck of your Quest Runner spaceship."
                features={[
                  "Anti-gravity hover vehicles",
                  "8 tech skill categories, 20–25 levels each",
                  "Legendary team specialist NFAs",
                  "Exotic circuits: Zero-G Asteroid Field, Plasma Storm Track",
                  "Amateur → Semi-Pro → Professional leagues",
                ]}
              />
              <WorldCard
                title="Hyper Quest 100"
                genre="RPG Exploration"
                color="#10b981"
                tagline="Your Quest Runner becomes a fully functional spaceship. Accept delivery contracts, navigate the lawless Dead Zone, mine asteroids for rare materials."
                features={[
                  "7 off-world planets to explore",
                  "Pirate encounters (PvP in Dead Zone)",
                  "Asteroid mining for rare materials",
                  "Real-world business integration",
                  "Virtual land ownership on 8 planets",
                ]}
              />
            </div>

            <Card>
              <h3 className="font-semibold text-white mb-4">The Interconnected Universe</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    Hyper Tek's three games share a unified player profile and asset database. This isn't superficial — it's deep mechanical integration.
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Shared Resources", body: "Materials mined in Overlord (Furuseth Crystals, rare minerals) are the exact resources needed for vehicle upgrades in Racing and ship defences in Hyper Quest." },
                      { label: "Unified Progression", body: "Your character level, wealth, and XP persist across all three worlds. Reaching Level 15 in Racing unlocks new ship capabilities." },
                      { label: "Cross-Game NFAs", body: "A Legendary Fuel Specialist provides +30% fuel efficiency in Overlord, +25% tank capacity in Racing, and +20% thruster efficiency in Quest." },
                    ].map(({ label, body }) => (
                      <div key={label}>
                        <p className="text-blue-300 text-xs font-semibold mb-1">{label}</p>
                        <p className="text-white/50 text-xs leading-relaxed">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-5" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-3">Resource Flow</p>
                  {[
                    { step: "Overlord Realm", action: "Mine rare minerals" },
                    { step: "Hyper Quest", action: "Refine into advanced alloys" },
                    { step: "Hyper Racing", action: "Craft lightweight body panels" },
                    { step: "All Games", action: "Improved performance everywhere" },
                  ].map(({ step, action }, i, arr) => (
                    <div key={step} className="flex items-center gap-3 mb-2">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {i < arr.length - 1 && <div className="w-0.5 h-5 bg-blue-900" />}
                      </div>
                      <div>
                        <span className="text-blue-300 text-xs font-semibold">{step}</span>
                        <span className="text-white/40 text-xs"> → {action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="mt-6">
              <Card>
                <h3 className="font-semibold text-white mb-3">Game Lore & Setting</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  In the year 2117, humanity discovered that reality exists as parallel layers — digital matrices woven into the fabric of spacetime. The Hyper Tek Project opened portals to seven alien civilisations: the <em className="text-blue-300">Avian Defenders</em>, the <em className="text-blue-300">Crystalline Architects</em>, the <em className="text-blue-300">Nomadic Engineers</em>, the <em className="text-blue-300">Celestial Scholars</em>, the <em className="text-blue-300">Volcanic Forgers</em>, the <em className="text-blue-300">Aquatic Navigators</em>, and the <em className="text-blue-300">Ethereal Mystics</em>.
                </p>
                <p className="text-white/60 text-sm leading-relaxed mt-3">
                  You are an Overlord piloting an advanced spacecraft through a portal jump — but something went wrong. You are stranded. You are resourceful. <strong className="text-white">Build your empire. Master your vehicle. Explore the unknown. And perhaps, one day, find your way home.</strong>
                </p>
              </Card>
            </div>
          </section>

          {/* ── 03 Technology ── */}
          <section id="technology" className="pt-2">
            <SectionHeading number="03" title="Technology" />

            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <Card>
                <h3 className="font-semibold text-white mb-3">Unreal Engine 5</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-3">
                  Hyper Tek is built on Unreal Engine 5, providing photorealistic graphics via Nanite virtualised geometry and Lumen global illumination. A single codebase deploys across PC, PlayStation 5, Xbox Series X/S, iOS, Android, and VR headsets.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["PC (Win/Mac/Linux)", "PS5 / Xbox Series X", "iOS / Android", "Meta Quest / PSVR2"].map((p) => (
                    <span key={p} className="text-xs px-2 py-1 rounded-full text-blue-300" style={{ background: "rgba(0,42,168,0.25)", border: "1px solid rgba(0,42,168,0.4)" }}>{p}</span>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="font-semibold text-white mb-3">Cloud Infrastructure (AWS)</h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><span className="text-white/80">EC2 Compute</span> — Auto-scaling instances by player demand</li>
                  <li><span className="text-white/80">RDS PostgreSQL</span> — Multi-region replication</li>
                  <li><span className="text-white/80">ElastiCache Redis</span> — Real-time leaderboards & listings</li>
                  <li><span className="text-white/80">S3 + CloudFront</span> — Global asset delivery</li>
                  <li><span className="text-white/80">Kubernetes</span> — Containerised service orchestration</li>
                </ul>
                <p className="text-white/40 text-xs mt-3">Validated at 100,000+ simultaneous players per region • &lt;50ms latency</p>
              </Card>
            </div>

            <Card className="mb-6">
              <h3 className="font-semibold text-white mb-4">Blockchain Integration</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Hyper Tek uses blockchain for a specific, valuable purpose: establishing demonstrable ownership of rare in-game assets. Players never need to understand blockchain to enjoy the game — standard email/password accounts work seamlessly.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { name: "NFA Contract", desc: "ERC-721 standard defining each NFA's unique properties, ownership, and transfer rules" },
                  { name: "Marketplace Contract", desc: "Handles auction listings, bids, purchases, and commission payments" },
                  { name: "Buyback Reserve Contract", desc: "Holds platform reserve funds and executes guaranteed buyback transactions" },
                ].map(({ name, desc }) => (
                  <div key={name} className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-blue-300 text-xs font-semibold mb-2">{name}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-4">All contracts are open-source, audited by third-party firms, and multi-signature controlled (3 of 5 team members for critical changes).</p>
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-4">Security & Anti-Cheat</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Server-Side Validation", body: "All critical game actions calculated on servers — combat results, resource generation, marketplace transactions. Players cannot manipulate outcomes." },
                  { label: "BattleEye Integration", body: "Industry-standard anti-cheat (Rainbow Six Siege, PUBG, Fortnite) detects memory injection and manipulation." },
                  { label: "DDoS Protection", body: "Cloudflare enterprise infrastructure — automatic mitigation within seconds of detection ensuring 24/7 uptime." },
                  { label: "Data Privacy", body: "GDPR & COPPA compliant. TLS 1.3 transmission, AES-256 storage, annual third-party security audits, bug bounty program." },
                ].map(({ label, body }) => (
                  <div key={label}>
                    <p className="text-white/80 text-sm font-semibold mb-1">{label}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* ── 04 NFAs ── */}
          <section id="nfa" className="pt-2">
            <SectionHeading number="04" title="Non-Fungible Assets (NFAs)" />

            <Card className="mb-6">
              <h3 className="font-semibold text-white mb-3">True Ownership with Guaranteed Value</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                NFAs represent Hyper Tek's solution to blockchain gaming's fundamental problem: worthless NFTs. Unlike traditional NFTs that can collapse to zero value, <strong className="text-white">every Hyper Tek NFA carries a platform-guaranteed minimum buyback price.</strong>
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Utility Value", body: "In-game bonuses and statistical advantages across all three worlds" },
                  { label: "Market Value", body: "What other players will pay — freely tradeable on the marketplace" },
                  { label: "Reserve Value", body: "Platform-guaranteed buyback minimum — the floor that can never drop to zero" },
                ].map(({ label, body }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,42,168,0.25)" }}>
                    <p className="text-blue-300 text-sm font-semibold mb-2">{label}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="mb-6">
              <h3 className="font-semibold text-white mb-4">Five Rarity Tiers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <RarityBadge tier="Common"        color="#9ca3af" dropRate="~5%"    reserve="$50–$150"  bonuses="+10–15% in specific stats" />
                <RarityBadge tier="Uncommon"      color="#22c55e" dropRate="~2%"    reserve="$100"      bonuses="+15–20% in specific stats" />
                <RarityBadge tier="Semi-Rare"     color="#3b82f6" dropRate="~0.5%"  reserve="$400"      bonuses="+20–25% in specific stats" />
                <RarityBadge tier="Rare"          color="#a855f7" dropRate="~0.1%"  reserve="$700"      bonuses="+25–35% in specific stats" />
                <RarityBadge tier="Extremely Rare" color="#f59e0b" dropRate="~0.01%" reserve="$1,000+"  bonuses="Maximum bonuses, legendary status" />
              </div>
            </div>

            <Card className="mb-6">
              <h3 className="font-semibold text-white mb-4">Platform Buyback Mechanism</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Hyper Tek maintains a dedicated Reserve Fund. The platform guarantees sufficient reserves to buy back every NFA simultaneously at <strong className="text-white">80% of reserve value</strong>. Target solvency ratio: 110%.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-3">Reserve Fund Sources</p>
                  <ul className="space-y-1.5">
                    {["20% commission on all marketplace sales", "15% commission on Colony Trade Markets", "Percentage of HB → USD conversion fees", "Portion of subscription revenue"].map((s) => (
                      <li key={s} className="text-sm text-white/50 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-3">Reserve Value Growth</p>
                  <ul className="space-y-1.5">
                    {[
                      "If NFA sells for more than reserve, new reserve = 10% of sale price",
                      "Example: Sells for $100,000 → new reserve = $10,000",
                      "Annual CPI adjustment — reserve holds real-world value",
                      "Quarterly transparency reports published publicly",
                    ].map((s) => (
                      <li key={s} className="text-sm text-white/50 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-4">NFAs vs. Traditional NFTs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left text-white/30 text-xs font-semibold py-2 pr-4">Feature</th>
                      <th className="text-left text-white/30 text-xs font-semibold py-2 pr-4">Traditional NFTs</th>
                      <th className="text-left text-blue-300 text-xs font-semibold py-2">Hyper Tek NFAs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      ["Value Floor", "None (can drop to $0)", "Guaranteed 80% reserve buyback"],
                      ["Utility", "Often purely speculative", "Tangible in-game bonuses"],
                      ["Liquidity", "Dependent on finding buyers", "Always liquid via platform buyback"],
                      ["Acquisition", "Usually direct purchase", "Earned through gameplay or random packages"],
                      ["Value Trajectory", "Typically depreciates 90%+", "Designed to appreciate with game growth"],
                      ["Transaction Fees", "$10–100+ (ETH gas)", "$0 — platform covers fees"],
                    ].map(([feature, nft, nfa]) => (
                      <tr key={feature}>
                        <td className="py-2.5 pr-4 text-white/50 font-medium">{feature}</td>
                        <td className="py-2.5 pr-4 text-white/35">{nft}</td>
                        <td className="py-2.5 text-blue-300">{nfa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* ── 05 HyperBucks ── */}
          <section id="hyperbucks" className="pt-2">
            <SectionHeading number="05" title="HyperBucks Economy" />

            <Card className="mb-6">
              <h3 className="font-semibold text-white mb-3">What Are HyperBucks (HB)?</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                HyperBucks (HB) are the primary in-game currency of Hyper Tek. The fixed exchange rate is <strong className="text-white">250 HB = $1 USD</strong>. Virtual currency separates entertainment from direct monetary transactions while providing granular pricing control across all three game worlds.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-3">Earning HyperBucks</p>
                  <ul className="space-y-1.5">
                    {[
                      "Racing winnings: 15,000 – 75,000 HB per race",
                      "Quest deliveries: 50,000 – 200,000 HB per contract",
                      "Marketplace sales: Set your own prices",
                      "Monster hunting milestones",
                      "Tournament prizes and weekly events",
                    ].map((s) => (
                      <li key={s} className="text-sm text-white/50 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-3">Real Earning Potential</p>
                  <div className="space-y-3">
                    <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-white/80 text-sm font-semibold">Dedicated Players</p>
                      <p className="text-green-400 text-lg font-bold">$200–$500/month</p>
                      <p className="text-white/40 text-xs">Consistent tournament + courier + crafting</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-white/80 text-sm font-semibold">Esports / Virtual Business</p>
                      <p className="text-green-400 text-lg font-bold">$1,000–$5,000+/month</p>
                      <p className="text-white/40 text-xs">Top-tier play, business operations</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top-up & Cashout */}
            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <Card>
                <h3 className="font-semibold text-white mb-4">Topping Up HyperBucks</h3>
                <p className="text-white/50 text-xs mb-4">Minimum top-up: <strong className="text-white">250 HB ($1)</strong>. All payments processed securely via Stripe.</p>
                <div className="space-y-3">
                  {[
                    { method: "Credit / Debit Card", detail: "Visa, Mastercard, Amex — instant credit via Stripe", color: "#3b82f6" },
                    { method: "USDC (Crypto)", detail: "Send USDC on Base network to platform wallet — credited after on-chain confirmation", color: "#10b981" },
                  ].map(({ method, detail, color }) => (
                    <div key={method} className="rounded-xl p-3 flex items-start gap-3" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${color}25` }}>
                      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color }}>{method}</p>
                        <p className="text-white/40 text-xs mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-white mb-4">Cashing Out HyperBucks</h3>
                <p className="text-white/50 text-xs mb-4">Minimum cashout: <strong className="text-white">250 HB ($1)</strong>. Identity verification (KYC) required before first cashout.</p>
                <div className="space-y-3">
                  {[
                    { method: "Bank Transfer", detail: "Direct to your bank account. Processing time: 1–3 business days.", color: "#f59e0b" },
                    { method: "USDC (Crypto)", detail: "Sent to your wallet on Base network. Near-instant on-chain transfer.", color: "#10b981" },
                  ].map(({ method, detail, color }) => (
                    <div key={method} className="rounded-xl p-3 flex items-start gap-3" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${color}25` }}>
                      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color }}>{method}</p>
                        <p className="text-white/40 text-xs mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,42,168,0.25)" }}>
                  <p className="text-white/50 text-xs">OTP email verification is required for every cashout to protect your funds.</p>
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="font-semibold text-white mb-4">Currency Types</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "HyperBucks (HB)", color: "#3b82f6", desc: "Primary currency. Earned through gameplay or purchased with credit/debit card and USDC crypto." },
                  { name: "Gold", color: "#f59e0b", desc: "Specialty currency produced exclusively in Land Bases or won in special events." },
                  { name: "Diamonds", color: "#a855f7", desc: "Prestige currency for exclusive cosmetics, premium services, and rare auction access." },
                  { name: "Crystals", color: "#10b981", desc: "Furuseth (wormhole jumps), Energy (weapons/engines), Time (speed up research & travel)." },
                ].map(({ name, color, desc }) => (
                  <div key={name} className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${color}30` }}>
                    <p className="font-semibold text-sm mb-2" style={{ color }}>{name}</p>
                    <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,42,168,0.25)" }}>
                <p className="text-white/50 text-xs">
                  <strong className="text-white">Cashout policy:</strong> Minimum $1 USD (250 HB) · KYC identity verification required · OTP email confirmation per cashout · Bank transfers arrive in 1–3 business days · USDC transfers are near-instant · Platform complies with KYC/AML regulations.
                </p>
              </div>
            </Card>
          </section>

          {/* ── 06 Marketplace ── */}
          <section id="marketplace" className="pt-2">
            <SectionHeading number="06" title="Marketplace" />

            <div className="grid md:grid-cols-2 gap-5 mb-6">
              <Card>
                <h3 className="font-semibold text-white mb-3">Three Marketplace Types</h3>
                <ul className="space-y-3">
                  {[
                    { name: "Pit Lane Marketplace", desc: "Racing items, vehicles, specialists, general goods — 20% commission" },
                    { name: "Colony Trade Market", desc: "Colony members only, material exchanges — 10% commission" },
                    { name: "Global Auction House", desc: "Cross-platform, all item types — standard rates apply" },
                  ].map(({ name, desc }) => (
                    <li key={name}>
                      <p className="text-blue-300 text-sm font-semibold">{name}</p>
                      <p className="text-white/50 text-xs">{desc}</p>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="font-semibold text-white mb-3">Commission Structure</h3>
                <div className="space-y-2">
                  {[
                    { label: "Standard Player", rate: "20%", note: "Pit Lane / Global" },
                    { label: "Premium Member ($9.99/mo)", rate: "15%", note: "25% reduction on non-NFA" },
                    { label: "Colony Internal Trade", rate: "10%", note: "Members only" },
                  ].map(({ label, rate, note }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <div>
                        <p className="text-white/70 text-sm">{label}</p>
                        <p className="text-white/30 text-xs">{note}</p>
                      </div>
                      <span className="text-white font-bold text-lg">{rate}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="font-semibold text-white mb-3">Commission Revenue Allocation</h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { pct: "50%", label: "Reserve Fund", color: "#3b82f6" },
                  { pct: "20%", label: "Platform Ops", color: "#a855f7" },
                  { pct: "15%", label: "Development",  color: "#10b981" },
                  { pct: "10%", label: "Support",      color: "#f59e0b" },
                  { pct: "5%",  label: "Marketing",    color: "#ef4444" },
                ].map(({ pct, label, color }) => (
                  <div key={label} className="text-center rounded-xl py-4" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                    <p className="font-bold text-xl" style={{ color }}>{pct}</p>
                    <p className="text-white/40 text-xs mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-4">Published in quarterly transparency reports.</p>
            </Card>
          </section>

          {/* ── 07 Roadmap ── */}
          <section id="roadmap" className="pt-2">
            <SectionHeading number="07" title="Roadmap" />

            <Card className="mb-8">
              <h3 className="font-semibold text-white mb-4">Completed Milestones ✓</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Core three-game interconnected universe concept finalised",
                  "Fair-play economics framework established",
                  "NFA buyback system designed",
                  "Comprehensive game design documentation created",
                  "14 playable characters designed (7 species, male & female)",
                  "Main spaceship 3D models created",
                  "Multiple racing vehicles modelled",
                  "~30 specialist characters created",
                  "Technology stack selected (Unreal Engine 5, cloud infrastructure)",
                  "Over $307,000 invested in development, prototypes & content",
                  "Website established and social media presence initiated",
                  "Kickstarter campaign preparation underway",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>{item}
                  </div>
                ))}
              </div>
            </Card>

            <div className="pl-2">
              <RoadmapPhase
                phase="1"
                title="Near-Term: Kickstarter & Core Development"
                period="Next 6–12 months"
                items={[
                  "Launch Kickstarter campaign targeting $640K",
                  "Secure seed funding and expand development team",
                  "Build functional versions of all three games",
                  "Implement multiplayer infrastructure",
                  "Develop marketplace and economic systems",
                  "NFA smart contracts and blockchain integration",
                  "Closed alpha → open beta testing",
                ]}
              />
              <RoadmapPhase
                phase="2"
                title="Medium-Term: Content & Public Launch"
                period="12–24 months"
                items={[
                  "Expand racing circuits and vehicle options",
                  "Develop additional planets for Hyper Quest",
                  "Full marketplace launch across all three games",
                  "NFA minting and trading goes live",
                  "Virtual business system implementation",
                  "Launch on PC, then mobile (iOS/Android)",
                  "Target: 50,000+ monthly active users",
                ]}
              />
              <RoadmapPhase
                phase="3"
                title="Long-Term: VR/AR & Platform Maturation"
                period="24+ months"
                items={[
                  "VR/AR integration (Meta Quest, PSVR2, PC VR)",
                  "GETs (Gaming Engagement Technology Systems) devices",
                  "$2–5M targeted for wearable VR device development",
                  "500,000+ monthly active users",
                  "Established esports ecosystem",
                  "Proven Gaming for Good model",
                  "Sustainable profitability",
                ]}
              />
            </div>

            <Card>
              <p className="text-white/50 text-sm leading-relaxed italic">
                "This roadmap represents our current vision. Timelines, priorities, and specific features are subject to change based on funding, community feedback, and technical discoveries. We are committed to the destination — the exact route may evolve. Quality over speed."
              </p>
            </Card>
          </section>

          {/* ── 08 Conclusion ── */}
          <section id="conclusion" className="pt-2">
            <SectionHeading number="08" title="Conclusion" />

            <Card className="mb-6">
              <h3 className="font-semibold text-white mb-4">The Hyper Tek Vision</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Hyper Tek 100 is an ambitious vision to create an interconnected gaming ecosystem with a driven marketplace that addresses real problems in the industry. Three interconnected games — <strong className="text-white">Overlord Realm</strong> (MMORTS), <strong className="text-white">Hyper Racing 100</strong> (futuristic racing), and <strong className="text-white">Hyper Quest 100</strong> (RPG exploration) — where progress, assets, and identity persist across all experiences.
              </p>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Players enjoy fair-play economics, NFAs with <strong className="text-white">guaranteed minimum buyback values</strong>, real economic opportunities, and future-proofed market share.
              </p>
              <div className="rounded-xl p-5 mt-4" style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,42,168,0.35)" }}>
                <p className="text-blue-200 text-sm font-semibold mb-1">Where We Stand</p>
                <p className="text-white/60 text-sm leading-relaxed">
                  Over <strong className="text-white">$307,000</strong> has been invested personally to reach this stage. We have comprehensive game design documentation, 3D character and vehicle models, detailed economic systems, and complete technical planning. <strong className="text-white">The foundation is built. The vision is detailed. The commitment is proven.</strong>
                </p>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
              <a
                href="/whitepaper.pdf"
                download="HyperTek-Whitepaper.pdf"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm text-white transition-all duration-300 border border-white/20 hover:border-white/40 hover:bg-[#003BD4]"
                style={{ background: "#002AA8" }}
              >
                {t("whitepaper.downloadFull")}
              </a>
              <Link
                to="/waitlist"
                onClick={() => window.scrollTo(0, 0)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm text-white/70 hover:text-white transition-colors border border-white/10 hover:border-white/30"
              >
                {t("whitepaper.joinWaitlist")}
              </Link>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
