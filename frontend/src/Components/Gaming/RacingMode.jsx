/**
 * RacingMode — full-screen racing game overlay.
 * Two sub-views:
 *   TRACK   → animated race track + joystick + speed slider
 *   GARAGE  → spaceship hangar / workshop
 *
 * Sits at z-index 15: above GameFrame (10) but below HUD elements (25+).
 * HUD (TopBar, MiniMap, Profile, Sidebar) remains visible on top.
 */

import RacingControls from "./RacingControls";
import LazyImage      from "./LazyImage";
import useMobileLandscape from "../../hooks/useMobileLandscape";

/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  /* ── Entry animation ── */
  @keyframes racingEnter {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  .racing-overlay {
    animation: racingEnter 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* ── View toggle button ── */
  .race-view-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .race-view-btn:hover {
    background: rgba(34,197,94,0.2) !important;
    box-shadow: 0 0 18px rgba(34,197,94,0.5) !important;
    transform: scale(1.05);
  }

  /* ── Exit button ── */
  .race-exit-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .race-exit-btn:hover {
    background: rgba(248,113,113,0.25) !important;
    box-shadow: 0 0 18px rgba(248,113,113,0.5) !important;
    transform: scale(1.05);
  }
`;

/* ══════════════════════════════════════════════════════════════════
   TRACK VIEW — animated neon race track
   ══════════════════════════════════════════════════════════════════ */
function TrackView() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden",
    }}>
      {/* ── Background image ── */}
      <LazyImage src="/race_track.png" spinnerColor="#22c55e"
        style={{ objectPosition: "center" }} />

      {/* ── Dark vignette overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Speed readout HUD ── */}
      <div style={{
        position: "absolute",
        bottom: "18%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        userSelect: "none",
        background: "rgba(0,10,4,0.55)",
        border: "1px solid rgba(34,197,94,0.3)",
        borderRadius: 4,
        padding: "6px 18px",
        backdropFilter: "blur(6px)",
      }}>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: "bold",
          color: "#22c55e",
          textShadow: "0 0 20px rgba(34,197,94,0.8)",
          lineHeight: 1,
        }}>000</div>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(7px, 0.7vw, 9px)",
          letterSpacing: "0.25em",
          color: "rgba(34,197,94,0.55)",
        }}>KM/H</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   GARAGE VIEW — spaceship hangar / workshop
   ══════════════════════════════════════════════════════════════════ */
function GarageView() {
  const isMobile = useMobileLandscape();
  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden",
    }}>
      {/* ── Background image ── */}
      <LazyImage src="/garage.png" spinnerColor="#22c55e"
        style={{ objectPosition: "center" }} />

      {/* ── Dark vignette overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Holographic vehicle status panel ── */}
      <div style={{
        position: "absolute",
        top: isMobile ? "28%" : "38%", right: isMobile ? "23%" : "8%",
        width: isMobile ? 140 : 160, padding: "10px 14px",
        background: "rgba(3,15,30,0.85)",
        border: "1px solid rgba(56,189,248,0.35)",
        borderRadius: 4,
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 20px rgba(56,189,248,0.12)",
      }}>
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: 8, fontWeight: "bold",
          letterSpacing: "0.2em",
          color: "#38bdf8",
          marginBottom: 8,
          textShadow: "0 0 8px rgba(56,189,248,0.8)",
        }}>VEHICLE STATUS</div>
        {[
          { label: "HULL",   val: 94, color: "#22c55e" },
          { label: "ENGINE", val: 87, color: "#22c55e" },
          { label: "FUEL",   val: 61, color: "#facc15" },
          { label: "TIRES",  val: 72, color: "#facc15" },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 5 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
              <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5, letterSpacing:"0.1em", color:"rgba(148,192,210,0.6)" }}>{s.label}</span>
              <span style={{ fontFamily:"Orbitron,sans-serif", fontSize:6.5, color:s.color }}>{s.val}%</span>
            </div>
            <div style={{ height:3, background:"rgba(56,189,248,0.1)", borderRadius:2 }}>
              <div style={{ width:`${s.val}%`, height:"100%", background:s.color, borderRadius:2, boxShadow:`0 0 6px ${s.color}` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RacingMode — main export
   ══════════════════════════════════════════════════════════════════ */
export default function RacingMode({ view = "TRACK", onExit }) {
  const isTrack = view === "TRACK";

  return (
    <>
      <style>{CSS}</style>

      <div className="racing-overlay" style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        overflow: "hidden",
      }}>

        {/* ── Background ── */}
        {isTrack ? <TrackView /> : <GarageView />}

        {/* ── Racing controls (track only) ── */}
        {isTrack && <RacingControls />}

        {/* ── EXIT button — bottom-left ── */}
        <button
          className="race-exit-btn"
          onClick={onExit}
          style={{
            position: "absolute",
            bottom: "3.5%",
            left: "2%",
            zIndex: 35,
            padding: "8px 20px",
            background: "rgba(30,0,0,0.88)",
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
          ← EXIT RACING
        </button>

      </div>
    </>
  );
}
