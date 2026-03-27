/**
 * ViewButton — positioned outside the frame at bottom-right.
 * Default: cycles through view modes (overview / ground / tactical).
 * Racing mode: shows flag.png (TRACK) or garage_icon.png (GARAGE),
 *              clicking toggles between the two racing sub-views.
 */

import { useState, useRef, useEffect } from "react";

const VIEWS = [
  { id: "OVERVIEW", icon: "⬡", sub: "BIRD EYE" },
  { id: "GROUND",   icon: "◈", sub: "GROUND"   },
  { id: "TACTICAL", icon: "⊕", sub: "TACTICAL" },
];


const CSS = `
  @keyframes viewPulse {
    0%,100% { box-shadow: 0 0 14px rgba(0,212,255,0.25), 0 0 1px rgba(0,212,255,0.5), inset 0 1px 0 rgba(255,255,255,0.08); }
    50%      { box-shadow: 0 0 24px rgba(0,212,255,0.45), 0 0 2px rgba(0,212,255,0.8), inset 0 1px 0 rgba(255,255,255,0.12); }
  }
  @keyframes racingPulse {
    0%,100% { box-shadow: 0 0 14px rgba(34,197,94,0.3), 0 0 1px rgba(34,197,94,0.6), inset 0 1px 0 rgba(255,255,255,0.08); }
    50%      { box-shadow: 0 0 28px rgba(34,197,94,0.55), 0 0 2px rgba(34,197,94,0.9), inset 0 1px 0 rgba(255,255,255,0.12); }
  }
  @keyframes overlordPulse {
    0%,100% { box-shadow: 0 0 14px rgba(248,113,113,0.3), 0 0 1px rgba(248,113,113,0.6), inset 0 1px 0 rgba(255,255,255,0.08); }
    50%      { box-shadow: 0 0 28px rgba(248,113,113,0.55), 0 0 2px rgba(248,113,113,0.9), inset 0 1px 0 rgba(255,255,255,0.12); }
  }
  .view-btn {
    animation: viewPulse 3s ease-in-out infinite;
    transition: transform 0.18s, filter 0.18s;
  }
  .view-btn-racing {
    animation: racingPulse 2s ease-in-out infinite;
    transition: transform 0.18s, filter 0.18s;
  }
  .view-btn-overlord {
    animation: overlordPulse 2s ease-in-out infinite;
    transition: transform 0.18s, filter 0.18s;
  }
  .view-btn:hover, .view-btn-racing:hover, .view-btn-overlord:hover {
    transform: scale(1.08) !important;
    filter: brightness(1.3);
    cursor: pointer;
  }
  .view-btn:active, .view-btn-racing:active, .view-btn-overlord:active {
    transform: scale(0.96) !important;
    filter: brightness(1.6);
  }
`;

export default function ViewButton({ activeGame, raceView, onRaceViewToggle, questView, onQuestViewToggle, overlordView, onOverlordViewToggle }) {
  const [idx, setIdx] = useState(0);
  const [vrOpen, setVrOpen] = useState(false);
  const [vrPairing, setVrPairing] = useState(false);
  const [vrPairDone, setVrPairDone] = useState(false);
  const vrRef = useRef(null);
  const view = VIEWS[idx];

  useEffect(() => {
    const handler = (e) => {
      if (vrRef.current && !vrRef.current.contains(e.target)) { setVrOpen(false); setVrPairing(false); setVrPairDone(false); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isRacing   = activeGame === "RACING";
  const isQuest    = activeGame === "QUEST";
  const isOverlord = activeGame === "OVERLORD";
  const inGame     = isRacing || isQuest || isOverlord;

  // Racing icons
  const isTrack    = raceView === "TRACK";
  const raceImgSrc = isTrack ? "/flag.png" : "/garage_icon.png";
  const raceSub    = isTrack ? "GARAGE" : "TRACK";

  // Quest icons
  const isQuestSpace = questView === "SPACE";
  const questImgSrc  = isQuestSpace ? "/quest_planet.png" : "/quest_space_icon.png";
  const questSub     = isQuestSpace ? "GROUND" : "SPACE";

  // Overlord icons
  const isOvSpace     = overlordView === "SPACE";
  const overlordImgSrc = isOvSpace ? "/overlord_solar.png" : "/overlord_planet.png";
  const overlordSub    = isOvSpace ? "WORLD" : "SPACE";

  const handleClick = isRacing   ? onRaceViewToggle
    : isQuest    ? onQuestViewToggle
    : isOverlord ? onOverlordViewToggle
    : () => setIdx(i => (i + 1) % VIEWS.length);

  // Determine what icon/label to show in game mode
  const gameImgSrc = isRacing ? raceImgSrc : isQuest ? questImgSrc : overlordImgSrc;
  const gameSub    = isRacing ? raceSub    : isQuest ? questSub    : overlordSub;
  const gameColor  = isRacing ? "#22c55e"  : isQuest ? "#38bdf8"   : "#f87171";
  const gameGlow   = isRacing ? "rgba(34,197,94,0.8)" : isQuest ? "rgba(56,189,248,0.8)" : "rgba(248,113,113,0.8)";

  return (
    <>
      <style>{CSS}</style>

      <div
        className={isRacing ? "view-btn-racing" : isOverlord ? "view-btn-overlord" : "view-btn"}
        onClick={handleClick}
        title={isRacing
          ? `Switch to ${raceSub} view`
          : isQuest
            ? `Switch to ${questSub} view`
            : isOverlord
              ? `Switch to ${overlordSub} view`
              : `Current view: ${view.id} — click to cycle`}
        style={{
          position: "absolute",
          bottom:   "9%",
          right:    "2.5%",
          zIndex:   35,
          width:    inGame ? "auto" : "clamp(48px, 7vmin, 80px)",
          height:   inGame ? "auto" : "clamp(48px, 7vmin, 80px)",
          clipPath: inGame ? "none" : "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
          background: inGame ? "none" : "radial-gradient(circle at 40% 30%, rgba(0,35,65,0.97), rgba(0,12,30,0.99))",
          border: "none", outline: "none",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "4px", userSelect: "none",
        }}
      >
        {/* Octagon border — default mode only */}
        {!inGame && (
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
            viewBox="0 0 100 100">
            <polygon points="30,1 70,1 99,30 99,70 70,99 30,99 1,70 1,30"
              fill="none" stroke="#00D4FF" strokeWidth="2" strokeOpacity="0.8" />
            <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
              fill="none" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.25" />
          </svg>
        )}

        {/* ── In-game mode: large image icon, no frame ── */}
        {inGame ? (
          <>
            <img
              src={gameImgSrc}
              alt={gameSub}
              loading="lazy"
              style={{
                width: "clamp(55px, 10vmin, 110px)",
                height: "clamp(55px, 10vmin, 110px)",
                objectFit: "contain",
                mixBlendMode: "multiply",
                filter: `drop-shadow(0 0 10px ${gameGlow}) drop-shadow(0 0 20px ${gameGlow}66)`,
              }}
            />
            <span style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "clamp(5px, 0.55vw, 7px)",
              fontWeight: "bold", letterSpacing: "0.12em",
              color: gameColor,
              textShadow: `0 0 8px ${gameGlow}`,
            }}>{gameSub}</span>
          </>
        ) : (
          /* ── Default HUD mode ── */
          <>
            <span style={{
              fontSize: "clamp(12px, 2vmin, 20px)", color: "#00D4FF",
              lineHeight: 1, textShadow: "0 0 12px rgba(0,212,255,0.8)", zIndex: 1,
            }}>{view.icon}</span>
            <span style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "clamp(5px, 0.8vmin, 8px)",
              fontWeight: "bold", letterSpacing: "0.1em", color: "#00D4FF",
              textShadow: "0 0 6px rgba(0,212,255,0.6)", zIndex: 1,
            }}>VIEW</span>
            <span style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "clamp(4px, 0.6vmin, 6px)",
              letterSpacing: "0.08em", color: "rgba(0,212,255,0.85)", zIndex: 1,
            }}>{view.sub}</span>
          </>
        )}
      </div>

      {/* VR MODE button — to the left of VIEW button (hidden in-game) */}
      {!inGame && <div ref={vrRef} style={{ position: "absolute", bottom: "3%", right: "calc(2.5% + clamp(48px, 7vmin, 80px) + 8px)", zIndex: 35 }}>
          {/* Octagon VR MODE button */}
          <div
            onClick={() => setVrOpen(o => !o)}
            className="view-btn"
            style={{
              width: "clamp(42px, 6vmin, 70px)", height: "clamp(42px, 6vmin, 70px)",
              clipPath: "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
              background: vrOpen
                ? "radial-gradient(circle at 40% 30%, rgba(0,60,100,0.97), rgba(0,20,50,0.99))"
                : "radial-gradient(circle at 40% 30%, rgba(0,35,65,0.97), rgba(0,12,30,0.99))",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "3px", cursor: "pointer", userSelect: "none",
              position: "relative",
            }}
          >
            {/* Octagon border */}
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} viewBox="0 0 100 100">
              <polygon points="30,1 70,1 99,30 99,70 70,99 30,99 1,70 1,30"
                fill="none" stroke="#00D4FF" strokeWidth="2" strokeOpacity={vrOpen ? "1" : "0.8"} />
              <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
                fill="none" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity={vrOpen ? "0.5" : "0.25"} />
            </svg>
            <span style={{ fontSize: "clamp(11px,1.7vmin,18px)", color: "#00D4FF", lineHeight: 1, textShadow: "0 0 12px rgba(0,212,255,0.8)", zIndex: 1 }}>⬡</span>
            <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: "clamp(5px,0.7vmin,7px)", fontWeight: "bold", letterSpacing: "0.1em", color: "#00D4FF", textShadow: "0 0 6px rgba(0,212,255,0.6)", zIndex: 1, whiteSpace: "nowrap" }}>VR MODE</span>
          </div>

          {vrOpen && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 8px)", right: 0,
              background: "linear-gradient(160deg,#020d1a,#010812)",
              border: "1.5px solid rgba(0,212,255,0.45)", borderRadius: 5,
              boxShadow: "0 6px 28px rgba(0,0,0,0.95), 0 0 20px rgba(0,212,255,0.12)",
              overflow: "hidden", minWidth: 230, zIndex: 50,
            }}>
              {/* Header */}
              <div style={{ padding: "9px 14px", borderBottom: "1px solid rgba(0,212,255,0.15)", background: "rgba(0,212,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 10, fontWeight: "bold", letterSpacing: "0.15em", color: "#00D4FF", textShadow: "0 0 8px rgba(0,212,255,0.7)" }}>DEVICE PAIRING</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", boxShadow: "0 0 6px rgba(248,113,113,0.8)" }} />
                  <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 8, color: "#f87171", letterSpacing: "0.08em", textShadow: "0 0 6px rgba(248,113,113,0.7)" }}>OFFLINE</span>
                </div>
              </div>
              {/* Single pair button */}
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => {
                    if (vrPairDone || vrPairing) return;
                    setVrPairing(true);
                    setTimeout(() => { setVrPairing(false); setVrPairDone(true); }, 2000);
                  }}
                  style={{
                    width: "100%", padding: "8px 0",
                    background: vrPairDone ? "rgba(248,113,113,0.08)" : vrPairing ? "rgba(0,212,255,0.08)" : "rgba(0,212,255,0.12)",
                    border: `1px solid ${vrPairDone ? "rgba(248,113,113,0.4)" : "rgba(0,212,255,0.4)"}`,
                    borderRadius: 4, cursor: vrPairDone || vrPairing ? "default" : "pointer",
                    fontFamily: "Orbitron,sans-serif", fontSize: 10, fontWeight: "bold",
                    letterSpacing: "0.12em",
                    color: vrPairDone ? "rgba(248,113,113,0.9)" : "#00D4FF",
                    transition: "all 0.2s",
                  }}
                >
                  {vrPairing ? "PAIRING..." : vrPairDone ? "UNAVAILABLE RIGHT NOW" : "PAIR DEVICE"}
                </button>
                {vrPairDone && (
                  <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 8, color: "rgba(255,255,255,0.95)", letterSpacing: "0.08em" }}>Coming Soon</span>
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: "7px 14px", borderTop: "1px solid rgba(0,212,255,0.15)", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
                <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 8, color: "#00D4FF", letterSpacing: "0.08em", textShadow: "0 0 6px rgba(0,212,255,0.6)" }}>VR Interaction MODE · Coming Soon</span>
              </div>
            </div>
          )}
      </div>}
    </>
  );
}
