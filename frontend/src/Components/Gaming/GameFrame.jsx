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

// ── Corner adjustments ────────────────────────────────────────────────
// Increase TL_Y / TR_Y to push the top corners DOWN (useful for short
// viewports like 1440×640 where the default y=42 sits too close to the
// browser chrome).
const CORNER = {
  TL_Y:       42,   // top edge + left notch tip  ← raise this number to push down
  TR_Y:       65,   // right arm (950→980)         ← raise this to push down
  NOTCH_Y:    80,   // left notch horizontal bar   ← usually TL_Y + 38
  BR_Y:       400,  // bottom-right knee           ← leave as-is
  BL_Y:       488,  // bottom edge y               ← leave as-is
};

const { TL_Y, TR_Y, NOTCH_Y, BR_Y, BL_Y } = CORNER;

// ── Outer frame ───────────────────────────────────────────────────────
const FRAME = `M15 ${NOTCH_Y} L90 ${NOTCH_Y} L140 ${TL_Y} L920 ${TL_Y} L950 ${TR_Y} L980 ${TR_Y} L980 ${BR_Y} L880 ${BR_Y} L860 ${BL_Y} L15 ${BL_Y} L15 ${NOTCH_Y}`;

// ── Section dividers ──────────────────────────────────────────────────
const DIV1 = `M370 ${TL_Y} L370 230 L260 ${BL_Y}`;   // RACING | QUEST
const DIV2 = `M630 ${TL_Y} L630 230 L695 ${BL_Y}`;   // QUEST  | OVERLORD

// Quest panel clip polygon in viewport-percentage coordinates
// derived from SVG viewBox 1000×500 → clip-path % = (x/1000, y/500)
// Points: 370,42 → 630,42 → 630,230 → 695,488 → 260,488 → 370,230
const QUEST_CLIP = "polygon(37% 8.4%, 63% 8.4%, 63% 46%, 69.5% 97.6%, 26% 97.6%, 37% 46%)";

export default function GameFrame() {
  return (
    <>
    {/* Quest image rendered outside SVG so it is NOT affected by
        preserveAspectRatio="none" — maintains natural proportions */}
    {/* Quest panel image — sized to ~panel area to avoid over-zoom.
        Panel center: ~47.75% from left, ~53% from top.
        Panel size:   ~43.5vw wide × ~89.2vh tall. */}
    <div style={{
      position: "absolute", inset: 0,
      pointerEvents: "none", zIndex: 9,
      clipPath: QUEST_CLIP,
      overflow: "hidden",
    }}>
      <img
        src="/quest1.png"
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          top: "53%",
          transform: "translate(-50%, -50%)",
          width: "50vw",
          height: "95vh",
          objectFit: "cover",
          objectPosition: "center center",
        }}
      />
    </div>

    <svg
      viewBox="0 0 1000 500"
      preserveAspectRatio="none"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%",
        pointerEvents:"none", zIndex:10 }}
    >
      <defs>
        <clipPath id="clip-left">
          <polygon points={`15,${NOTCH_Y} 90,${NOTCH_Y} 140,${TL_Y} 370,${TL_Y} 370,230 260,${BL_Y} 15,${BL_Y}`} />
        </clipPath>
        <clipPath id="clip-middle">
          <polygon points={`370,${TL_Y} 630,${TL_Y} 630,230 695,${BL_Y} 260,${BL_Y} 370,230`} />
        </clipPath>
        <clipPath id="clip-right">
          <polygon points={`630,${TL_Y} 920,${TL_Y} 950,${TR_Y} 980,${TR_Y} 980,${BR_Y} 880,${BR_Y} 860,${BL_Y} 695,${BL_Y} 630,230`} />
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
      <image href="/racing3.png"    x="15"  y={TL_Y} width="375" height={BL_Y - TL_Y}
        clipPath="url(#clip-left)"   preserveAspectRatio="xMidYMid slice" />
      {/* quest1.png moved to HTML layer — see div above SVG */}
      <image href="/overlord3.png"  x="630" y={TL_Y} width="355" height={BL_Y - TL_Y}
        clipPath="url(#clip-right)"  preserveAspectRatio="xMidYMid slice" />

      {/* ── Vignette ── */}
      <polygon
        points={`15,${NOTCH_Y} 90,${NOTCH_Y} 140,${TL_Y} 920,${TL_Y} 950,${TR_Y} 980,${TR_Y} 980,${BR_Y} 880,${BR_Y} 860,${BL_Y} 15,${BL_Y}`}
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
    </>
  );
}
