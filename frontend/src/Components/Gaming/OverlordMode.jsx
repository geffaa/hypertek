/**
 * OverlordMode — full-screen Overlord of the 7 Realms overlay.
 * Two sub-views:
 *   SPACE → 45° bird-eye view of spaceship in space ring (searching for players)
 *   WORLD → planet close-up / world zoom view
 *
 * Controls: Fire + Scope + Weapon (right side). NO joystick.
 * z-index 15: above GameFrame (10), below HUD elements (25+).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LazyImage from "./LazyImage";
import useMobileLandscape from "../../hooks/useMobileLandscape";


/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  @keyframes overlordEnter {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  .overlord-overlay { animation: overlordEnter 0.55s cubic-bezier(0.16,1,0.3,1) both; }

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
// Arc positions — mirrored from Quest ARC_3 for consistency
const OVL_ARC = [
  { id: "FIRE",    right: "17vh", bottom: "38vh" },
  { id: "ZOOM",    right: "35vh", bottom: "27vh" },
  { id: "WEAPONS", right: "45vh", bottom: "10vh" },
];
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
  },
  {
    id: "ZOOM",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#fbbf24" strokeWidth="1.8" strokeOpacity="0.9"/>
        <line x1="16" y1="2"  x2="16" y2="30" stroke="#fbbf24" strokeWidth="1.4" strokeOpacity="0.85"/>
        <line x1="2"  y1="16" x2="30" y2="16" stroke="#fbbf24" strokeWidth="1.4" strokeOpacity="0.85"/>
      </svg>
    ),
    color: "#fbbf24", glow: "rgba(251,191,36,0.55)",
  },
  {
    id: "WEAPONS",
    icon: (
      <svg viewBox="0 0 32 32" width="44" height="44" fill="none">
        <rect x="3"  y="12" width="20" height="8" rx="2" fill="#1e0a0a" stroke="#f87171" strokeWidth="1.5" strokeOpacity="0.9"/>
        <rect x="23" y="14" width="7"  height="4" rx="1" fill="#f87171" fillOpacity="0.7"/>
        <rect x="9"  y="9"  width="6"  height="3" rx="1" fill="#f87171" fillOpacity="0.6"/>
        <circle cx="7" cy="16" r="2.5" fill="#f87171" fillOpacity="0.5"/>
      </svg>
    ),
    color: "#f87171", glow: "rgba(248,113,113,0.5)",
  },
];

function OverlordActionButtons() {
  const { t } = useTranslation();
  const isMobile = useMobileLandscape();
  const [active, setActive] = useState(null);
  const [vpH, setVpH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setVpH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sz = isMobile ? 52 : OVL_BTN_SIZE;
  const s = isMobile ? 0.65 : 1;

  // Same short-viewport adjustment as Quest
  const isShortVP = !isMobile && vpH < 720;
  const rAdj = isShortVP ? 6 : 0;
  const bAdj = isShortVP ? 5 : 0;
  const pos2r = (v) => `${(parseFloat(v) + rAdj) * s}vh`;
  const pos2b = (v) => `${Math.max(2, parseFloat(v) - bAdj) * s}vh`;

  return (
    <>
      {OVL_ARC.map(pos => {
        const a = OVERLORD_ACTIONS.find(x => x.id === pos.id);
        return (
          <button
            key={a.id}
            className="overlord-action-btn"
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
                : "rgba(28,4,4,0.88)",
              border: `1.5px solid ${a.color}${active === a.id ? "cc" : "66"}`,
              boxShadow: active === a.id
                ? `0 0 24px ${a.glow}, 0 0 48px ${a.glow}`
                : `0 0 12px ${a.color}22`,
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
              paddingBottom: 12,
              fontFamily: "Orbitron,sans-serif",
              fontSize: 7,
              fontWeight: "bold",
              letterSpacing: "0.08em",
              color: active === a.id ? a.color : "#ffffff",
              textShadow: active === a.id ? `0 0 8px ${a.glow}` : "0 1px 3px rgba(0,0,0,0.9)",
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 100%, transparent)",
              userSelect: "none",
              pointerEvents: "none",
            }}>{t(`overlord.actions.${a.id.toLowerCase()}`, a.id)}</span>
          </button>
        );
      })}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SPACE VIEW — 45° overhead, spaceship + space ring
   ══════════════════════════════════════════════════════════════════ */
function SpaceView() {
  const { t } = useTranslation();
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#04010a" }}>

      {/* Background image */}
      <LazyImage src="/overlord4.webp" spinnerColor="#f87171" />

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
      }}>{t("overlord.spaceRing")}</div>


    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   WORLD VIEW — large game map with pan only (no zoom).
   Map is MAP_SCALE × the viewport — drag to explore, like a strategy
   game map. No zoom controls; zooming looked blurry so it's removed.
   ══════════════════════════════════════════════════════════════════ */

const MAP_SCALE = 2.0; // map is 2× the viewport in each dimension

function WorldView() {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ready,  setReady]  = useState(false);
  const drag = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0 });

  /* Clamp so map edges never expose black gaps */
  const clampOffset = useCallback((ox, oy) => {
    const el = containerRef.current;
    if (!el) return { x: ox, y: oy };
    const maxX = (el.clientWidth  * (MAP_SCALE - 1)) / 2;
    const maxY = (el.clientHeight * (MAP_SCALE - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  }, []);

  /* Entry: show left side of map (max positive x = leftmost visible area) */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const maxX = (el.clientWidth * (MAP_SCALE - 1)) / 2;
    setOffset({ x: maxX, y: 0 });
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Mouse drag ── */
  const onMouseDown = useCallback((e) => {
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
    e.preventDefault();
  }, [offset]);

  const onMouseMove = useCallback((e) => {
    if (!drag.current.active) return;
    setOffset(clampOffset(
      drag.current.ox + e.clientX - drag.current.startX,
      drag.current.oy + e.clientY - drag.current.startY,
    ));
  }, [clampOffset]);

  const onMouseUp = useCallback(() => { drag.current.active = false; }, []);

  /* ── Touch pan (single finger only) ── */
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      drag.current = { active: true, startX: e.touches[0].clientX, startY: e.touches[0].clientY, ox: offset.x, oy: offset.y };
    }
  }, [offset]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (drag.current.active && e.touches.length === 1) {
      setOffset(clampOffset(
        drag.current.ox + e.touches[0].clientX - drag.current.startX,
        drag.current.oy + e.touches[0].clientY - drag.current.startY,
      ));
    }
  }, [clampOffset]);

  const onTouchEnd = useCallback(() => { drag.current.active = false; }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "absolute", inset: 0,
        overflow: "hidden", background: "#000",
        cursor: drag.current.active ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Map — 2.8× larger than viewport, pan to explore */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${MAP_SCALE})`,
        transformOrigin: "center center",
        transition: ready ? "none" : "transform 1s cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform",
      }}>
        <img
          src="/overlord_world3.webp"
          alt="World Map"
          draggable={false}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Subtle edge vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 96% 92% at 50% 50%, transparent 52%, rgba(0,0,0,0.55) 100%)",
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   OverlordMode — main export
   ══════════════════════════════════════════════════════════════════ */
export default function OverlordMode({ view = "SPACE", onExit, isPreview = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

        {/* VIDEO button — top center */}
        <div style={{
          position: "absolute", top: "22%", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
        }}>
          <button
            onClick={() => navigate(isPreview ? "/preview/overlord" : "/game/overlord")}
            style={{
              padding: "9px 24px",
              background: "rgba(28,0,0,0.88)",
              border: "1.5px solid rgba(248,113,113,0.6)",
              borderRadius: 3,
              clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
              fontFamily: "Orbitron,sans-serif",
              fontSize: "clamp(7px,0.85vw,10px)", fontWeight: "bold",
              letterSpacing: "0.18em", color: "#fca5a5",
              textShadow: "0 0 10px rgba(248,113,113,0.6)",
              boxShadow: "0 0 20px rgba(248,113,113,0.2)",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "background 0.2s, box-shadow 0.2s",
              display: "flex", alignItems: "center", gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.18)"; e.currentTarget.style.boxShadow = "0 0 28px rgba(248,113,113,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(28,0,0,0.88)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(248,113,113,0.2)"; }}
          >
            ▶ {t("overlord.video.gamingInfoBtn", "GAMING INFO / IN-GAMING VIDEO...")}
          </button>
        </div>

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
          ← {t("overlord.exit")} OVERLORD
        </button>

      </div>

    </>
  );
}
