/**
 * GameFrame — SVG HUD frame.
 *
 * Key coordinates (viewBox 0 0 1000 500 → 100vw × 100vh):
 *   Left notch  : (15,80)→(90,80)→(140,42)
 *   Top edge    : y=42, x=140→920        ← lowered from 30 for topbar breathing room
 *   Top-right   : (920,42)→(950,65)→(980,65)
 *   Right side  : x=980, y=65→400
 *   Bottom-right: (880,400)→(860,488)
 *   Bottom edge : y=488, x=860→15
 *
 *   Dividers (balanced — approx 250 / 240 / 220 at top):
 *     DIV1: top x=390, bottom x=280
 *     DIV2: top x=630, bottom x=695
 */

const C  = "#00D4FF";
const CG = "#00EEFF";
const CA = "#00FFFF";

// ── Outer frame ───────────────────────────────────────────────────────
const FRAME = "M15 80 L90 80 L140 42 L920 42 L950 65 L980 65 L980 400 L880 400 L860 488 L15 488 L15 80";

// ── Inner parallel frame (~10 units inset) ────────────────────────────
const INNER = "M25 86 L90 86 L138 52 L920 52 L947 73 L970 73 L970 392 L874 392 L854 476 L25 476 L25 86";

// ── Section dividers ──────────────────────────────────────────────────
const DIV1 = "M390 42 L390 177 L280 488";   // RACING | QUEST
const DIV2 = "M630 42 L630 177 L695 488";   // QUEST  | OVERLORD  (widened OVERLORD)

// ── Corner L-brackets ─────────────────────────────────────────────────
const CORNERS = [
  // Top-left notch corner (140, 42)
  ["M122,42 L140,42 L140,62", "M126,46 L140,46 L140,62", "M130,50 L140,50 L140,58"],
  // Top-right chamfer start (920, 42)
  ["M908,42 L920,42 L920,62", "M908,46 L916,46 L916,62", "M908,50 L912,50 L912,58"],
  // Top-right corner (980, 65)
  ["M980,47 L980,65 L962,65", "M976,51 L976,65 L962,65", "M972,55 L972,65 L966,65"],
  // Bottom-right chamfer (880, 400)
  ["M880,382 L880,400 L860,400", "M876,386 L876,400 L860,400"],
  // Bottom-right end (860, 488)
  ["M840,488 L860,488 L860,468", "M840,484 L856,484 L856,468", "M840,480 L852,480 L852,472"],
  // Bottom-left (15, 488)
  ["M15,468 L15,488 L35,488", "M19,472 L19,488 L35,488", "M23,476 L23,488 L33,488"],
  // Left notch bottom (15, 80)
  ["M15,62 L15,80 L35,80", "M19,66 L19,80 L35,80", "M23,70 L23,80 L33,80"],
  // Left notch corner (90, 80)
  ["M78,80 L90,80 L90,92", "M78,84 L86,84 L86,92"],
];

// ── Tick marks ────────────────────────────────────────────────────────
const TOP_TICKS = [250, 350, 450, 550, 650, 750].map(x =>
  `M${x-4},36 L${x-4},48 M${x},34 L${x},50 M${x+4},36 L${x+4},48`
);
const RIGHT_TICKS = [130, 180, 240, 300, 350].map(y =>
  `M974,${y-4} L986,${y-4} M972,${y} L988,${y} M974,${y+4} L986,${y+4}`
);
const BOT_TICKS = [130, 230, 380, 510, 620, 730].map(x =>
  `M${x-4},482 L${x-4},494 M${x},480 L${x},496 M${x+4},482 L${x+4},494`
);
const LEFT_TICKS = [150, 220, 300, 380].map(y =>
  `M9,${y-4} L21,${y-4} M7,${y} L23,${y} M9,${y+4} L21,${y+4}`
);

// ── Accent dots ───────────────────────────────────────────────────────
const DOTS = [
  [140,42], [920,42], [980,65], [980,400],
  [880,400], [860,488], [15,488], [15,80], [90,80],
];

export default function GameFrame() {
  return (
    <svg
      viewBox="0 0 1000 500"
      preserveAspectRatio="none"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%",
        pointerEvents:"none", zIndex:10 }}
    >
      <defs>
        <clipPath id="clip-left">
          <polygon points="15,80 90,80 140,42 390,42 390,177 280,488 15,488" />
        </clipPath>
        <clipPath id="clip-middle">
          <polygon points="390,42 630,42 630,177 695,488 280,488 390,177" />
        </clipPath>
        <clipPath id="clip-right">
          <polygon points="630,42 920,42 950,65 980,65 980,400 880,400 860,488 695,488 630,177" />
        </clipPath>

        <linearGradient id="vig" x1="0" y1="0" x2="0" y2="1">
          <stop offset="50%" stopColor="#060610" stopOpacity="0" />
          <stop offset="100%" stopColor="#060610" stopOpacity="0.8" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        <style>{`
          @keyframes dashFlow {
            from { stroke-dashoffset: 50; }
            to   { stroke-dashoffset: 0; }
          }
          .frame-dash { animation: dashFlow 2s linear infinite; }

          @keyframes nodePulse {
            0%,100% { opacity:0.5; r:2; }
            50%      { opacity:1;   r:3.5; }
          }
          .frame-dot { animation: nodePulse 2.5s ease-in-out infinite; }

          @keyframes tickFade {
            0%,100% { opacity:0.25; }
            50%      { opacity:0.7; }
          }
          .frame-tick { animation: tickFade 4s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* ── Panel images ── */}
      <image href="/racing_panel.png"    x="15"  y="42" width="375" height="446"
        clipPath="url(#clip-left)"   preserveAspectRatio="xMidYMid slice" />
      <image href="/quest_panel.png"     x="280" y="42" width="415" height="446"
        clipPath="url(#clip-middle)" preserveAspectRatio="xMidYMid slice" />
      <image href="/overlord_panel.png"  x="630" y="42" width="355" height="446"
        clipPath="url(#clip-right)"  preserveAspectRatio="xMidYMid slice" />

      {/* ── Vignette ── */}
      <polygon
        points="15,80 90,80 140,42 920,42 950,65 980,65 980,400 880,400 860,488 15,488"
        fill="url(#vig)"
      />

      {/* ── Section dividers ── */}
      <path d={DIV1} stroke={C} strokeWidth="0.8" strokeOpacity="0.35" fill="none" strokeLinejoin="round" />
      <path d={DIV2} stroke={C} strokeWidth="0.8" strokeOpacity="0.35" fill="none" strokeLinejoin="round" />

      {/* ── Outer glow ── */}
      <path d={FRAME} stroke={CG} strokeWidth="12" strokeOpacity="0.06" strokeLinejoin="round" fill="none" />
      <path d={FRAME} stroke={CG} strokeWidth="6"  strokeOpacity="0.12" strokeLinejoin="round" fill="none" />

      {/* ── Inner parallel frame ── */}
      <path d={INNER} stroke={C} strokeWidth="0.8" strokeOpacity="0.35" strokeLinejoin="round" fill="none" />

      {/* ── Main solid frame ── */}
      <path d={FRAME} stroke={C} strokeWidth="1.8" strokeLinejoin="round" fill="none" filter="url(#glow)" />

      {/* ── Animated dash overlay ── */}
      <path d={FRAME}
        className="frame-dash"
        stroke={CA} strokeWidth="1"
        strokeDasharray="12 30"
        strokeOpacity="0.5"
        strokeLinejoin="round" fill="none"
      />

      {/* ── Corner L-brackets ── */}
      {CORNERS.map((group, gi) =>
        group.map((d, li) => (
          <path key={`${gi}-${li}`} d={d}
            stroke={CA}
            strokeWidth={li === 0 ? 1.5 : 1}
            strokeOpacity={li === 0 ? 0.9 : 0.55}
            strokeLinecap="square" fill="none"
          />
        ))
      )}

      {/* ── Edge tick marks ── */}
      {[...TOP_TICKS, ...RIGHT_TICKS, ...BOT_TICKS, ...LEFT_TICKS].map((d, i) => (
        <path key={i} d={d}
          className="frame-tick"
          stroke={C} strokeWidth="0.8"
          strokeLinecap="round" fill="none"
        />
      ))}

      {/* ── Accent dots at vertices ── */}
      {DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5}
          className="frame-dot"
          fill={CA}
        />
      ))}

      {/* ── Bottom bar: per-game color fills + top accent lines ── */}
      {/* RACING (x=16→279) */}
      <rect x="16" y="477" width="263" height="10" fill="rgba(34,197,94,0.06)" />
      <line x1="16" y1="477.5" x2="279" y2="477.5" stroke="#22c55e" strokeWidth="0.9" strokeOpacity="0.55" />
      {/* QUEST (x=281→694) */}
      <rect x="281" y="477" width="413" height="10" fill="rgba(56,189,248,0.06)" />
      <line x1="281" y1="477.5" x2="694" y2="477.5" stroke="#38bdf8" strokeWidth="0.9" strokeOpacity="0.55" />
      {/* OVERLORD (x=696→858) */}
      <rect x="696" y="477" width="162" height="10" fill="rgba(248,113,113,0.06)" />
      <line x1="696" y1="477.5" x2="858" y2="477.5" stroke="#f87171" strokeWidth="0.9" strokeOpacity="0.55" />

      {/* ── Divider bottom diamonds ── */}
      {[[280,488],[695,488]].map(([x,y],i) => (
        <polygon key={i} points={`${x},${y-6} ${x+4},${y} ${x},${y+4} ${x-4},${y}`}
          fill={CA} fillOpacity="0.6" />
      ))}

      {/* ── Panel corner marks ── */}
      {/* RACING */}
      <path d="M185,55 L185,65 M185,55 L195,55" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
      <path d="M373,55 L373,65 M373,55 L363,55" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
      {/* QUEST */}
      <path d="M408,50 L408,60 M408,50 L418,50" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
      <path d="M613,50 L613,60 M613,50 L603,50" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
      {/* OVERLORD */}
      <path d="M648,50 L648,60 M648,50 L658,50" stroke="#f87171" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
      <path d="M908,50 L908,60 M908,50 L898,50" stroke="#f87171" strokeWidth="0.8" strokeOpacity="0.35" fill="none" />

      {/* ── Panel center crosshair reticles (y center of frame = (42+488)/2 = 265) ── */}
      {/* RACING center: x=(15+280)/2=147 at bottom, x=(140+390)/2=265 at top → ~206, y=265 */}
      <g stroke="#22c55e" strokeWidth="0.7" strokeOpacity="0.22" fill="none">
        <circle cx="168" cy="265" r="14" />
        <line x1="152" y1="265" x2="147" y2="265" />
        <line x1="184" y1="265" x2="189" y2="265" />
        <line x1="168" y1="249" x2="168" y2="244" />
        <line x1="168" y1="281" x2="168" y2="286" />
        <circle cx="168" cy="265" r="2.5" fillOpacity="0.4" fill="#22c55e" stroke="none" />
      </g>
      {/* QUEST center: x=(280+695)/2=487 at bottom, x=(390+630)/2=510 at top → ~498, y=265 */}
      <g stroke="#38bdf8" strokeWidth="0.7" strokeOpacity="0.22" fill="none">
        <circle cx="498" cy="265" r="14" />
        <line x1="482" y1="265" x2="477" y2="265" />
        <line x1="514" y1="265" x2="519" y2="265" />
        <line x1="498" y1="249" x2="498" y2="244" />
        <line x1="498" y1="281" x2="498" y2="286" />
        <circle cx="498" cy="265" r="2.5" fillOpacity="0.4" fill="#38bdf8" stroke="none" />
      </g>
      {/* OVERLORD center: x=(695+860)/2=777 at bottom, x=(630+850)/2=740 at top → ~758, y=265 */}
      <g stroke="#f87171" strokeWidth="0.7" strokeOpacity="0.22" fill="none">
        <circle cx="758" cy="265" r="14" />
        <line x1="742" y1="265" x2="737" y2="265" />
        <line x1="774" y1="265" x2="779" y2="265" />
        <line x1="758" y1="249" x2="758" y2="244" />
        <line x1="758" y1="281" x2="758" y2="286" />
        <circle cx="758" cy="265" r="2.5" fillOpacity="0.4" fill="#f87171" stroke="none" />
      </g>
    </svg>
  );
}
