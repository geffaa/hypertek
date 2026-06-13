/**
 * QuestMode — full-screen Quest game overlay.
 * Two sub-views:
 *   SPACE  → spaceship view + 2D movement joystick
 *   GROUND → planet surface + 2D joystick + action buttons (Fire/Scope/Kneel/Weapon)
 *
 * z-index 15: above GameFrame (10), below HUD elements (25+).
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LazyImage from "./LazyImage";
import useMobileLandscape from "../../hooks/useMobileLandscape";


/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  @keyframes questEnter {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  .quest-overlay { animation: questEnter 0.55s cubic-bezier(0.16,1,0.3,1) both; }

  @keyframes starsTwinkle {
    0%,100% { opacity: 0.6; }
    50%      { opacity: 1; }
  }

  @keyframes nebulaFloat {
    0%,100% { transform: translateY(0px) scale(1); }
    50%      { transform: translateY(-8px) scale(1.02); }
  }
  .nebula { animation: nebulaFloat 8s ease-in-out infinite; }

  @keyframes shipHover {
    0%,100% { transform: translateX(-50%) translateY(0px); }
    50%      { transform: translateX(-50%) translateY(-6px); }
  }
  .quest-ship { animation: shipHover 4s ease-in-out infinite; }

  .quest-action-btn {
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .quest-action-btn:hover {
    transform: scale(1.1);
    filter: brightness(1.3);
  }
  .quest-action-btn:active {
    transform: scale(0.93);
    filter: brightness(1.6);
  }

  .quest-exit-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .quest-exit-btn:hover {
    background: rgba(56,189,248,0.2) !important;
    box-shadow: 0 0 18px rgba(56,189,248,0.5) !important;
    transform: scale(1.05);
  }
`;

/* ══════════════════════════════════════════════════════════════════
   2D JOYSTICK — drag in any direction
   ══════════════════════════════════════════════════════════════════ */
function Joystick2D({ accentColor = "#38bdf8" }) {
  const { t } = useTranslation();
  const [pos, setPos]           = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const padRef = useRef(null);
  const RADIUS = 44;  // max travel radius

  useEffect(() => {
    if (!dragging && (pos.x !== 0 || pos.y !== 0)) {
      const timer = setTimeout(() => setPos({ x: 0, y: 0 }), 220);
      return () => clearTimeout(timer);
    }
  }, [dragging, pos]);

  const clamp = (cx, cy) => {
    const dist = Math.sqrt(cx * cx + cy * cy);
    if (dist > RADIUS) {
      const scale = RADIUS / dist;
      return { x: cx * scale, y: cy * scale };
    }
    return { x: cx, y: cy };
  };

  const startDrag = useCallback((clientX, clientY) => {
    setDragging(true);
    const rect = padRef.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    const onMove = (e) => {
      const mx = (e.touches ? e.touches[0].clientX : e.clientX) - cx;
      const my = (e.touches ? e.touches[0].clientY : e.clientY) - cy;
      setPos(clamp(mx, my));
    };
    const onEnd = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend",  onEnd);

    const mx = clientX - (rect.left + rect.width  / 2);
    const my = clientY - (rect.top  + rect.height / 2);
    setPos(clamp(mx, my));
  }, []);

  const PAD = 110;
  const KNOB = 22;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      userSelect: "none",
      filter: `drop-shadow(0 0 10px ${accentColor}33)`,
    }}>
      {/* Pad */}
      <div
        ref={padRef}
        onMouseDown={e => startDrag(e.clientX, e.clientY)}
        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        style={{
          position: "relative",
          width: PAD, height: PAD,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,20,40,0.9), rgba(0,8,20,0.97))`,
          border: `1.5px solid ${accentColor}55`,
          boxShadow: `0 0 20px ${accentColor}18, inset 0 2px 8px rgba(0,0,0,0.6)`,
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        {/* Crosshair lines */}
        <div style={{ position:"absolute", top:"50%", left:"12%", right:"12%", height:1, background:`${accentColor}22`, transform:"translateY(-50%)" }} />
        <div style={{ position:"absolute", left:"50%", top:"12%", bottom:"12%", width:1, background:`${accentColor}22`, transform:"translateX(-50%)" }} />
        {/* Outer ring tick */}
        <div style={{ position:"absolute", inset:6, borderRadius:"50%", border:`1px solid ${accentColor}18` }} />

        {/* Knob */}
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: KNOB * 2, height: KNOB * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${accentColor}cc, ${accentColor}88)`,
          border: `2px solid ${accentColor}cc`,
          boxShadow: `0 0 14px ${accentColor}99, 0 2px 6px rgba(0,0,0,0.5)`,
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          transition: dragging ? "none" : "transform 0.22s cubic-bezier(.34,1.56,.64,1)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Arrow hints */}
      <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"Orbitron,sans-serif", fontSize:10, color:accentColor, opacity:0.55 }}>
        <span>◀</span>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <span style={{ fontSize:9 }}>▲</span>
          <span style={{ fontSize:6, letterSpacing:"0.15em", fontWeight:"bold" }}>{t("quest.move")}</span>
          <span style={{ fontSize:9 }}>▼</span>
        </div>
        <span>▶</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ACTION BUTTONS — right side (Ground mode)
   ══════════════════════════════════════════════════════════════════ */
const ACTIONS = [
  {
    id: "SCOPE",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#38bdf8" strokeWidth="1.8" strokeOpacity="0.9"/>
        <line x1="16" y1="2"  x2="16" y2="30" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.85"/>
        <line x1="2"  y1="16" x2="30" y2="16" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.85"/>
      </svg>
    ),
    color: "#38bdf8", glow: "rgba(56,189,248,0.5)",
  },
  {
    id: "FIRE",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="16" r="12" fill="rgba(248,113,113,0.15)" stroke="#f87171" strokeWidth="1.8" strokeOpacity="0.9"/>
        <circle cx="16" cy="16" r="6"  fill="#f87171" fillOpacity="0.85"/>
      </svg>
    ),
    color: "#f87171", glow: "rgba(248,113,113,0.5)",
  },
  {
    id: "KNEEL",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="7" r="4.5" fill="#a78bfa" fillOpacity="0.8"/>
        <path d="M13 13 Q11 19 9 26 M19 13 Q21 19 23 26 M9 26 Q16 29 23 26" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9"/>
        <path d="M13 13 L19 13 Q19 18 16 20 Q13 18 13 13Z" fill="#a78bfa" fillOpacity="0.5" stroke="#a78bfa" strokeWidth="1.2"/>
      </svg>
    ),
    color: "#a78bfa", glow: "rgba(167,139,250,0.5)",
  },
  {
    id: "WEAPON",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <rect x="3"  y="12" width="20" height="8" rx="2" fill="#1e293b" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.9"/>
        <rect x="23" y="14" width="7"  height="4" rx="1" fill="#facc15" fillOpacity="0.7"/>
        <rect x="9"  y="9"  width="6"  height="3" rx="1" fill="#facc15" fillOpacity="0.6"/>
        <circle cx="7" cy="16" r="2.5" fill="#facc15" fillOpacity="0.5"/>
      </svg>
    ),
    color: "#facc15", glow: "rgba(250,204,21,0.5)",
  },
];

/*
 * Layout (matches Don's reference):
 *
 *   [      ] [ Fire  ]
 *   [ Kneel] [ Scope ]
 *   [Weapon] [       ]
 *
 * Positioned bottom-right, above the VIEW button,
 * below the sidebar buttons so they don't interfere.
 *
 * pos: { top, left } — px offset inside a 160×180 container
 */
const BTN_SIZE = 82;
// Quarter-circle arc: R=42vh, center at bottom-right corner, spanning 105°→165°
// Each button sits on the same circle radius, creating a true arc curve
const ARC_3 = [
  { id: "FIRE",   right: "17vh", bottom: "38vh" },  // top of arc
  { id: "SCOPE",  right: "35vh", bottom: "27vh" },  // arc — pushed further left
  { id: "WEAPON", right: "45vh", bottom: "10vh" }  // bottom of arc
];
const ARC_4 = [
  { id: "FIRE",   right: "17vh", bottom: "38vh" },  // top of arc
  { id: "SCOPE",  right: "35vh", bottom: "27vh" },  // arc — pushed further left
  { id: "KNEEL",  right: "22vh", bottom: "15vh" },  // satellite: diagonal right-below SCOPE
  { id: "WEAPON", right: "45vh", bottom: "10vh" },  // bottom of arc
];

function ActionButtons({ includeKneel = false }) {
  const { t } = useTranslation();
  const isMobile = useMobileLandscape();
  const [active, setActive] = useState(null);
  const [vpH, setVpH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setVpH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const arc = includeKneel ? ARC_4 : ARC_3;
  const sz = isMobile ? 52 : BTN_SIZE;
  // Scale arc radius down on mobile so buttons don't overflow small screens
  const s = isMobile ? 0.65 : 1;

  // ── Short-viewport adjustment (e.g. 1440×640) ──────────────────
  // rAdj: extra vh added to `right`  → pushes buttons further LEFT
  // bAdj: vh subtracted from `bottom` → pushes buttons DOWN
  const isShortVP = !isMobile && vpH < 720;
  const rAdj = isShortVP ? 12 : 0;
  const bAdj = isShortVP ? 3 : 0;

  const pos2r = (v) => `${(parseFloat(v) + rAdj) * s}vh`;
  const pos2b = (v) => `${Math.max(2, parseFloat(v) - bAdj) * s}vh`;

  return (
    <>
      {arc.map(pos => {
        const a = ACTIONS.find(x => x.id === pos.id);
        return (
        <button
          key={a.id}
          className="quest-action-btn"
          onMouseDown={() => setActive(a.id)}
          onMouseUp={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
          style={{
            position: "absolute",
            right: pos2r(pos.right), bottom: pos2b(pos.bottom),
            zIndex: 35,
            width: sz, height: sz,
            borderRadius: "50%",
            background: active === a.id
              ? `radial-gradient(circle at 40% 35%, ${a.color}44, ${a.color}18)`
              : "rgba(4,12,28,0.88)",
            border: `1.5px solid ${a.color}${active === a.id ? "cc" : "66"}`,
            boxShadow: active === a.id
              ? `0 0 20px ${a.glow}, 0 0 40px ${a.glow}`
              : `0 0 10px ${a.color}22`,
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: isMobile ? 12 : 18,
            overflow: "hidden",
          }}
        >
          {a.icon}
          <span style={{
            position: "absolute",
            bottom: 0,
            left: 0, right: 0,
            textAlign: "center",
            paddingBottom: 9,
            fontFamily: "Orbitron,sans-serif",
            fontSize: 7,
            fontWeight: "bold",
            letterSpacing: "0.08em",
            color: active === a.id ? a.color : "#ffffff",
            textShadow: active === a.id ? `0 0 8px ${a.glow}` : "0 1px 3px rgba(0,0,0,0.9)",
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 100%, transparent)",
            userSelect: "none",
            pointerEvents: "none",
          }}>{t(`quest.actions.${a.id.toLowerCase()}`, a.id)}</span>
        </button>
        );
      })}
    </>
  );
}

/* ─── Star-map data & overlay moved to StarMap.jsx ─── */
/* ══════════════════════════════════════════════════════════════════
   SPACE VIEW
   ══════════════════════════════════════════════════════════════════ */
function SpaceView({ isPreview = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#020612" }}>

      {/* Background image */}
      <LazyImage src="/quest_space.webp" spinnerColor="#38bdf8" />

      {/* Overlay / stars fallback */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 40%, rgba(30,15,60,0.6), transparent)" }} />

      {/* Stars */}
      {Array.from({ length: 120 }, (_, i) => (
        <div key={i} className="star" style={{
          position: "absolute",
          left: `${(i * 137.5) % 100}%`,
          top:  `${(i * 97.3) % 100}%`,
          width: i % 11 === 0 ? 2.5 : 1,
          height: i % 11 === 0 ? 2.5 : 1,
          borderRadius: "50%",
          background: i % 5 === 0 ? "#38bdf8" : "#fff",
          opacity: 0.15 + (i % 7) * 0.1,
          animation: `starsTwinkle ${2 + (i % 4)}s ease-in-out ${(i % 3) * 0.5}s infinite`,
        }} />
      ))}

      {/* Nebula blob */}
      <div className="nebula" style={{
        position: "absolute", top: "10%", right: "20%",
        width: 300, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(99,40,180,0.18) 0%, rgba(56,189,248,0.08) 50%, transparent 100%)",
        filter: "blur(30px)",
      }} />

      {/* Distant planet */}
      <div style={{
        position: "absolute", top: "15%", right: "28%",
        width: 90, height: 90, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, rgba(56,189,248,0.5), rgba(10,30,80,0.9))",
        boxShadow: "0 0 30px rgba(56,189,248,0.2), 0 0 60px rgba(56,189,248,0.08)",
        border: "1px solid rgba(56,189,248,0.25)",
      }}>
        {/* Ring */}
        <div style={{
          position: "absolute", top: "38%", left: "-30%", right: "-30%",
          height: 18, borderRadius: "50%",
          border: "2px solid rgba(56,189,248,0.3)",
          transform: "rotateX(75deg)",
        }} />
      </div>

      {/* Player spaceship SVG */}
      <div className="quest-ship" style={{
        position: "absolute", bottom: "20%", left: "50%",
        filter: "drop-shadow(0 0 20px rgba(56,189,248,0.6))",
      }}>
        <svg viewBox="0 0 120 80" width="180" height="120" fill="none">
          <path d="M60 5 L90 45 L75 55 L60 50 L45 55 L30 45 Z" fill="#0d2035" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.8"/>
          <ellipse cx="60" cy="28" rx="10" ry="14" fill="#0a1828" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.9"/>
          <ellipse cx="60" cy="28" rx="6" ry="9" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.6"/>
          <path d="M45 40 L15 60 L30 55 L45 50 Z" fill="#0a1828" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6"/>
          <path d="M75 40 L105 60 L90 55 L75 50 Z" fill="#0a1828" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6"/>
          <ellipse cx="50" cy="54" rx="5" ry="3" fill="#22c55e" fillOpacity="0.5"/>
          <ellipse cx="70" cy="54" rx="5" ry="3" fill="#22c55e" fillOpacity="0.5"/>
          <ellipse cx="60" cy="52" rx="4" ry="2.5" fill="#38bdf8" fillOpacity="0.6"/>
          <line x1="45" y1="38" x2="75" y2="38" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5"/>
        </svg>
      </div>

      {/* Joystick for space movement */}
      <div style={{ position:"absolute", left:"4%", bottom:"16%", zIndex:35 }}>
        <Joystick2D accentColor="#38bdf8" />
      </div>

      {/* Action buttons — right, no Kneel in space */}
      <ActionButtons includeKneel={false} />

      {/* GAMING INFO button — top center, same style as Racing / Overlord */}
      <div style={{
        position: "absolute", top: "22%", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
      }}>
        <button
          onClick={() => navigate(isPreview ? "/preview/quest" : "/game/quest")}
          style={{
            padding: "9px 24px",
            background: "rgba(0,12,32,0.88)",
            border: "1.5px solid rgba(56,189,248,0.6)",
            borderRadius: 3,
            clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            fontFamily: "Orbitron,sans-serif",
            fontSize: "clamp(7px,0.85vw,10px)", fontWeight: "bold",
            letterSpacing: "0.18em", color: "#7dd3fc",
            textShadow: "0 0 10px rgba(56,189,248,0.6)",
            boxShadow: "0 0 20px rgba(56,189,248,0.2)",
            cursor: "pointer", whiteSpace: "nowrap",
            transition: "background 0.2s, box-shadow 0.2s",
            display: "flex", alignItems: "center", gap: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.18)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(56,189,248,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,12,32,0.88)";    e.currentTarget.style.boxShadow = "0 0 20px rgba(56,189,248,0.2)"; }}
        >
          ▶ {t("quest.space.gamingInfoBtn", "GAMING INFO / IN-GAMING VIDEO...")}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   GROUND VIEW
   ══════════════════════════════════════════════════════════════════ */
function GroundView() {
  const { t } = useTranslation();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#080c06" }}>

      {/* Background image */}
      <LazyImage src="/quest3.webp" spinnerColor="#38bdf8" />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }} />

      {/* Ground HUD label */}
      <div style={{
        position: "absolute", top: "14%", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "Orbitron, sans-serif",
        fontSize: "clamp(9px, 1vw, 12px)",
        fontWeight: "bold", letterSpacing: "0.4em",
        color: "rgba(56,189,248,0.35)",
        textShadow: "0 0 16px rgba(56,189,248,0.25)",
        whiteSpace: "nowrap", userSelect: "none",
      }}>{t("quest.ground.mission")}</div>

      {/* 2D Joystick — left */}
      <div style={{ position:"absolute", left:"4%", bottom:"16%", zIndex:35 }}>
        <Joystick2D accentColor="#38bdf8" />
      </div>

      {/* Action buttons — right, Kneel included for ground */}
      <ActionButtons includeKneel={true} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   QuestMode — main export
   ══════════════════════════════════════════════════════════════════ */
export default function QuestMode({ view = "SPACE", onExit, isPreview = false }) {
  const { t } = useTranslation();
  const isSpace = view === "SPACE";

  return (
    <>
      <style>{CSS}</style>

      <div className="quest-overlay" style={{
        position: "absolute", inset: 0,
        zIndex: 15, overflow: "hidden",
      }}>

        {isSpace ? <SpaceView isPreview={isPreview} /> : <GroundView />}

        {/* EXIT button — bottom-left */}
        <button
          className="quest-exit-btn"
          onClick={onExit}
          style={{
            position: "absolute",
            bottom: "3.5%", left: "2%",
            zIndex: 35,
            padding: "8px 20px",
            background: "rgba(0,15,30,0.88)",
            border: "1.5px solid rgba(56,189,248,0.55)",
            borderRadius: 3,
            clipPath: "polygon(0% 0%, calc(100% - 10px) 0%, 100% 100%, 10px 100%)",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "clamp(7px, 0.7vw, 9px)",
            fontWeight: "bold",
            letterSpacing: "0.18em",
            color: "#7dd3fc",
            textShadow: "0 0 8px rgba(56,189,248,0.7)",
            boxShadow: "0 0 16px rgba(56,189,248,0.15)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ← {t("quest.exit")} QUEST
        </button>

      </div>
    </>
  );
}
