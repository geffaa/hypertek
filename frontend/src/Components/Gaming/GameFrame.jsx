/**
 * GameFrame — SVG HUD frame.
 *
 * Key coordinates (viewBox 0 0 1000 500 → 100vw × 100vh):
 *   Left notch  : (15,80)→(90,80)→(140,42)
 *   Top edge    : y=42, x=140→920
 *   Top-right   : (920,42)→(950,65)→(980,65)
 *   Right side  : x=980, y=65→400
 *   Bottom-right: (880,400)→(860,488)
 *   Bottom edge : y=488, x=860→15
 *
 *   Dividers:
 *     DIV1: top x=390, bottom x=280
 *     DIV2: top x=630, bottom x=695
 */

const C  = "#00D4FF";
const CG = "#00EEFF";
const CA = "#00FFFF";

// ── Outer frame ───────────────────────────────────────────────────────
const FRAME = "M15 80 L90 80 L140 42 L920 42 L950 65 L980 65 L980 400 L880 400 L860 488 L15 488 L15 80";

// ── Section dividers ──────────────────────────────────────────────────
const DIV1 = "M390 42 L390 177 L280 488";   // RACING | QUEST
const DIV2 = "M630 42 L630 177 L695 488";   // QUEST  | OVERLORD

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

        {/* Mask — cuts frame away from UI buttons that overlap the border */}
        <mask id="ui-mask">
          <rect x="0" y="0" width="1000" height="500" fill="white" />
          {/* LOG OUT button: top-right */}
          <ellipse cx="957" cy="25" rx="32" ry="27" fill="black" />
          {/* VIEW button: bottom-right */}
          <ellipse cx="934" cy="450" rx="42" ry="34" fill="black" />
          {/* Profile button: top-left */}
          <ellipse cx="60" cy="28" rx="32" ry="27" fill="black" />
        </mask>

        <style>{`
          @keyframes dashFlow {
            from { stroke-dashoffset: 50; }
            to   { stroke-dashoffset: 0; }
          }
          .frame-dash { animation: dashFlow 2s linear infinite; }
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
      <path d={FRAME} stroke={CG} strokeWidth="12" strokeOpacity="0.06" strokeLinejoin="round" fill="none" mask="url(#ui-mask)" />
      <path d={FRAME} stroke={CG} strokeWidth="6"  strokeOpacity="0.12" strokeLinejoin="round" fill="none" mask="url(#ui-mask)" />

      {/* ── Main solid frame ── */}
      <path d={FRAME} stroke={CA} strokeWidth="1.8" strokeLinejoin="round" fill="none" filter="url(#glow)" mask="url(#ui-mask)" />

      {/* ── Animated dash overlay ── */}
      <path d={FRAME}
        className="frame-dash"
        stroke={CA} strokeWidth="1"
        strokeDasharray="12 30"
        strokeOpacity="0.5"
        strokeLinejoin="round" fill="none"
        mask="url(#ui-mask)"
      />
    </svg>
  );
}
