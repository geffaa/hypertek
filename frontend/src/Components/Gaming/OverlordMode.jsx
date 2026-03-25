/**
 * OverlordMode — full-screen Overlord of the 7 Realms overlay.
 * Two sub-views:
 *   SPACE → 45° bird-eye view of spaceship in space ring (searching for players)
 *   WORLD → planet close-up / world zoom view
 *
 * Controls: Fire + Scope + Weapon (right side). NO joystick.
 * z-index 15: above GameFrame (10), below HUD elements (25+).
 */

import { useState } from "react";
import LazyImage from "./LazyImage";
import useMobileLandscape from "../../hooks/useMobileLandscape";


/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  @keyframes overlordEnter {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  .overlord-overlay { animation: overlordEnter 0.55s cubic-bezier(0.16,1,0.3,1) both; }

  @keyframes ringRotate {
    from { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg); }
    to   { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg); }
  }
  .space-ring { animation: ringRotate 24s linear infinite; }

  @keyframes overlordPlanetPulse {
    0%,100% { box-shadow: 0 0 40px rgba(248,113,113,0.25), 0 0 80px rgba(248,113,113,0.08); }
    50%      { box-shadow: 0 0 60px rgba(248,113,113,0.4),  0 0 120px rgba(248,113,113,0.15); }
  }
  .overlord-planet { animation: overlordPlanetPulse 5s ease-in-out infinite; }

  @keyframes worldScan {
    0%   { top: 0%; opacity: 0.6; }
    100% { top: 100%; opacity: 0; }
  }
  .world-scan-line {
    animation: worldScan 4s linear infinite;
  }

  .overlord-action-btn {
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  }
  .overlord-action-btn:hover {
    transform: scale(1.1);
    filter: brightness(1.3);
  }
  .overlord-action-btn:active {
    transform: scale(0.93);
    filter: brightness(1.6);
  }

  .overlord-exit-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .overlord-exit-btn:hover {
    background: rgba(248,113,113,0.2) !important;
    box-shadow: 0 0 18px rgba(248,113,113,0.5) !important;
    transform: scale(1.05);
  }
`;

/* ══════════════════════════════════════════════════════════════════
   ACTION BUTTONS — Fire / Scope / Kneel / Weapon
   Layout mirrors Quest mode (manual top/left per button)
   ══════════════════════════════════════════════════════════════════ */
const OVL_BTN_SIZE = 82;
const OVERLORD_ACTIONS = [
  {
    id: "FIRE",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="16" r="12" fill="rgba(248,113,113,0.15)" stroke="#f87171" strokeWidth="1.8" strokeOpacity="0.9"/>
        <circle cx="16" cy="16" r="6"  fill="#f87171" fillOpacity="0.85"/>
      </svg>
    ),
    color: "#f87171", glow: "rgba(248,113,113,0.55)",
    top: -50, left: 50,     // Fire — top-right
  },
  {
    id: "SCOPE",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#fbbf24" strokeWidth="1.8" strokeOpacity="0.9"/>
        <line x1="16" y1="2"  x2="16" y2="30" stroke="#fbbf24" strokeWidth="1.4" strokeOpacity="0.85"/>
        <line x1="2"  y1="16" x2="30" y2="16" stroke="#fbbf24" strokeWidth="1.4" strokeOpacity="0.85"/>
      </svg>
    ),
    color: "#fbbf24", glow: "rgba(251,191,36,0.55)",
    top: 60, left: 50,      // Scope — mid-right
  },
  {
    id: "WEAPON",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <rect x="3"  y="12" width="20" height="8" rx="2" fill="#1e0a0a" stroke="#f87171" strokeWidth="1.5" strokeOpacity="0.9"/>
        <rect x="23" y="14" width="7"  height="4" rx="1" fill="#f87171" fillOpacity="0.7"/>
        <rect x="9"  y="9"  width="6"  height="3" rx="1" fill="#f87171" fillOpacity="0.6"/>
        <circle cx="7" cy="16" r="2.5" fill="#f87171" fillOpacity="0.5"/>
      </svg>
    ),
    color: "#f87171", glow: "rgba(248,113,113,0.5)",
    top: 140, left: -70,    // Weapon — bottom-left
  },
];

function OverlordActionButtons() {
  const isMobile = useMobileLandscape();
  const [active, setActive] = useState(null);

  return (
    <div style={{
      position: "absolute",
      right: isMobile ? "20%" : "9%",
      bottom: "14%",
      zIndex: 35,
      width: 174,
      height: 176,
      userSelect: "none",
      transform: isMobile ? "scale(0.58)" : "none",
      transformOrigin: "bottom right",
    }}>
      {OVERLORD_ACTIONS.map(a => (
        <div key={a.id} style={{ position:"absolute", top: a.top, left: a.left,
          display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <button
            className="overlord-action-btn"
            onMouseDown={() => setActive(a.id)}
            onMouseUp={() => setActive(null)}
            onMouseLeave={() => setActive(null)}
            style={{
              width: OVL_BTN_SIZE, height: OVL_BTN_SIZE,
              borderRadius: "50%",
              background: active === a.id
                ? `radial-gradient(circle at 40% 35%, ${a.color}44, ${a.color}18)`
                : "rgba(28,4,4,0.88)",
              border: `1.5px solid ${a.color}${active === a.id ? "cc" : "66"}`,
              boxShadow: active === a.id
                ? `0 0 24px ${a.glow}, 0 0 48px ${a.glow}`
                : `0 0 12px ${a.color}22`,
              backdropFilter: "blur(8px)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {a.icon}
          </button>
          <span style={{
            fontFamily: "Orbitron,sans-serif",
            fontSize: 8,
            fontWeight: "bold",
            letterSpacing: "0.1em",
            color: active === a.id ? a.color : `${a.color}cc`,
            textShadow: active === a.id ? `0 0 8px ${a.glow}` : "none",
            userSelect: "none",
            pointerEvents: "none",
          }}>{a.id}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SPACE VIEW — 45° overhead, spaceship + space ring
   ══════════════════════════════════════════════════════════════════ */
function SpaceView() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#04010a" }}>

      {/* Background image */}
      <LazyImage src="/overlord_space.png" spinnerColor="#f87171" />

      {/* Stars */}
      {Array.from({ length: 150 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 137.5) % 100}%`,
          top:  `${(i * 97.3) % 100}%`,
          width: i % 13 === 0 ? 2.5 : 1,
          height: i % 13 === 0 ? 2.5 : 1,
          borderRadius: "50%",
          background: i % 7 === 0 ? "#f87171" : i % 5 === 0 ? "#fbbf24" : "#fff",
          opacity: 0.12 + (i % 6) * 0.08,
        }} />
      ))}

      {/* Red nebula */}
      <div style={{
        position: "absolute", top: "5%", left: "15%",
        width: 400, height: 250,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(180,20,20,0.14) 0%, rgba(248,113,113,0.06) 50%, transparent 100%)",
        filter: "blur(40px)",
      }} />

      {/* ── Space ring — rotating torus-like oval ── */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        width: 700, height: 700,
        pointerEvents: "none",
      }} className="space-ring">
        <svg viewBox="0 0 700 700" width="700" height="700" style={{ overflow:"visible" }}>
          {/* Outer ring */}
          <ellipse cx="350" cy="350" rx="320" ry="120"
            fill="none" stroke="rgba(248,113,113,0.18)" strokeWidth="28"
            strokeDasharray="60 20"/>
          {/* Mid ring */}
          <ellipse cx="350" cy="350" rx="280" ry="100"
            fill="none" stroke="rgba(248,113,113,0.10)" strokeWidth="12"/>
          {/* Inner ring glow */}
          <ellipse cx="350" cy="350" rx="200" ry="70"
            fill="none" stroke="rgba(248,113,113,0.25)" strokeWidth="4"/>

          {/* Player dots on ring */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 350 + Math.cos(rad) * 300;
            const y = 350 + Math.sin(rad) * 110;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={i === 0 ? 8 : 5}
                  fill={i === 0 ? "#f87171" : "rgba(248,113,113,0.5)"}
                  stroke={i === 0 ? "#fff" : "rgba(248,113,113,0.3)"} strokeWidth="1"/>
                {i !== 0 && (
                  <circle cx={x} cy={y} r="12" fill="none"
                    stroke="rgba(248,113,113,0.2)" strokeWidth="0.8"/>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* HUD label */}
      <div style={{
        position: "absolute", top: "14%", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "Orbitron, sans-serif",
        fontSize: "clamp(9px, 1vw, 12px)",
        fontWeight: "bold", letterSpacing: "0.4em",
        color: "rgba(248,113,113,0.45)",
        textShadow: "0 0 16px rgba(248,113,113,0.35)",
        whiteSpace: "nowrap", userSelect: "none",
      }}>OVERLORD · SPACE RING</div>

      {/* Target HUD — scanning */}
      <div style={{
        position: "absolute", bottom: "36%", right: "18%",
        width: 130, padding: "8px 12px",
        background: "rgba(28,4,4,0.85)",
        border: "1px solid rgba(248,113,113,0.3)",
        borderRadius: 3, backdropFilter: "blur(8px)",
        boxShadow: "0 0 16px rgba(248,113,113,0.1)",
      }}>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
          letterSpacing:"0.2em", color:"#f87171", marginBottom:6,
          textShadow:"0 0 8px rgba(248,113,113,0.8)" }}>TARGETS</div>
        {["PLAYER-7", "PLAYER-12", "PLAYER-3"].map((p, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between",
            marginBottom:4, fontFamily:"Orbitron,sans-serif", fontSize:6 }}>
            <span style={{ color:"rgba(255,180,180,0.6)" }}>{p}</span>
            <span style={{ color: i === 0 ? "#f87171" : "#fbbf24" }}>
              {i === 0 ? "LOCKED" : "IN RANGE"}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   WORLD VIEW — planet close-up, ground targeting
   ══════════════════════════════════════════════════════════════════ */
function WorldView() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#060208" }}>

      {/* Background image */}
      <LazyImage src="/overlord_world.png" spinnerColor="#f87171" />

      {/* Dark vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Scan line ── */}
      <div className="world-scan-line" style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.6), transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* ── Grid overlay (tactical map feel) ── */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:0.08 }}
        preserveAspectRatio="none" viewBox="0 0 100 100">
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#f87171" strokeWidth="0.3"/>
            <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#f87171" strokeWidth="0.3"/>
          </g>
        ))}
      </svg>

      {/* ── Target reticle ── */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none", zIndex: 2,
      }}>
        <svg viewBox="0 0 120 120" width="200" height="200" fill="none">
          {/* Outer circle */}
          <circle cx="60" cy="60" r="55" stroke="#f87171" strokeWidth="0.8" strokeOpacity="0.35"
            strokeDasharray="8 4"/>
          {/* Mid circle */}
          <circle cx="60" cy="60" r="36" stroke="#f87171" strokeWidth="1" strokeOpacity="0.5"/>
          {/* Inner reticle */}
          <circle cx="60" cy="60" r="14" stroke="#f87171" strokeWidth="1.2" strokeOpacity="0.8"/>
          <circle cx="60" cy="60" r="3" fill="#f87171" fillOpacity="0.9"/>
          {/* Cross */}
          <line x1="60" y1="10" x2="60" y2="44" stroke="#f87171" strokeWidth="1" strokeOpacity="0.7"/>
          <line x1="60" y1="76" x2="60" y2="110" stroke="#f87171" strokeWidth="1" strokeOpacity="0.7"/>
          <line x1="10" y1="60" x2="44" y2="60" stroke="#f87171" strokeWidth="1" strokeOpacity="0.7"/>
          <line x1="76" y1="60" x2="110" y2="60" stroke="#f87171" strokeWidth="1" strokeOpacity="0.7"/>
          {/* Corner brackets */}
          <path d="M20 20 L30 20 M20 20 L20 30" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.7"/>
          <path d="M100 20 L90 20 M100 20 L100 30" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.7"/>
          <path d="M20 100 L30 100 M20 100 L20 90" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.7"/>
          <path d="M100 100 L90 100 M100 100 L100 90" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.7"/>
        </svg>
      </div>

      {/* HUD label */}
      <div style={{
        position: "absolute", top: "14%", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "Orbitron, sans-serif",
        fontSize: "clamp(9px, 1vw, 12px)",
        fontWeight: "bold", letterSpacing: "0.4em",
        color: "rgba(248,113,113,0.4)",
        textShadow: "0 0 16px rgba(248,113,113,0.3)",
        whiteSpace: "nowrap", userSelect: "none",
      }}>OVERLORD · WORLD VIEW</div>

      {/* Ground intel panel */}
      <div style={{
        position: "absolute", bottom: "18%", left: "5%",
        width: 148, padding: "10px 14px",
        background: "rgba(28,4,4,0.88)",
        border: "1px solid rgba(248,113,113,0.3)",
        borderRadius: 3, backdropFilter: "blur(8px)",
        boxShadow: "0 0 18px rgba(248,113,113,0.1)",
      }}>
        <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:7, fontWeight:"bold",
          letterSpacing:"0.2em", color:"#f87171", marginBottom:8,
          textShadow:"0 0 8px rgba(248,113,113,0.8)" }}>GROUND INTEL</div>
        {[
          { label:"SECTOR",  val:"7-ALPHA" },
          { label:"THREATS", val:"HIGH" },
          { label:"ALLIES",  val:"3 NEAR" },
          { label:"COORDS",  val:"44.2 / 88.7" },
        ].map(s => (
          <div key={s.label} style={{ display:"flex", justifyContent:"space-between",
            marginBottom:5, fontFamily:"Orbitron,sans-serif" }}>
            <span style={{ fontSize:6, letterSpacing:"0.1em", color:"rgba(255,180,180,0.5)" }}>{s.label}</span>
            <span style={{ fontSize:6.5, color: s.val === "HIGH" ? "#f87171" : "#fbbf24" }}>{s.val}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   OverlordMode — main export
   ══════════════════════════════════════════════════════════════════ */
export default function OverlordMode({ view = "SPACE", onExit }) {
  const isSpace = view === "SPACE";

  return (
    <>
      <style>{CSS}</style>

      <div className="overlord-overlay" style={{
        position: "absolute", inset: 0,
        zIndex: 15, overflow: "hidden",
      }}>

        {isSpace ? <SpaceView /> : <WorldView />}

        {/* Action buttons — right (no joystick) */}
        <OverlordActionButtons />

        {/* EXIT button — bottom-left */}
        <button
          className="overlord-exit-btn"
          onClick={onExit}
          style={{
            position: "absolute",
            bottom: "3.5%", left: "2%",
            zIndex: 35,
            padding: "8px 20px",
            background: "rgba(28,0,0,0.88)",
            border: "1.5px solid rgba(248,113,113,0.55)",
            borderRadius: 3,
            clipPath: "polygon(0% 0%, calc(100% - 10px) 0%, 100% 100%, 10px 100%)",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "clamp(7px, 0.7vw, 9px)",
            fontWeight: "bold",
            letterSpacing: "0.18em",
            color: "#fca5a5",
            textShadow: "0 0 8px rgba(248,113,113,0.7)",
            boxShadow: "0 0 16px rgba(248,113,113,0.2)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ← EXIT OVERLORD
        </button>

      </div>
    </>
  );
}
