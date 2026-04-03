/**
 * ViewButton — positioned outside the frame at bottom-right.
 * In-game: polygon frame colored by game mode, shows game-specific view toggle icons.
 * VR MODE button always visible at all times.
 */

import { useState, useRef, useEffect } from "react";


const CSS = `
  @keyframes viewPulse {
    0%,100% { filter: drop-shadow(0 0 5px rgba(0,212,255,0.35)) drop-shadow(0 0 2px rgba(0,212,255,0.5)); }
    50%      { filter: drop-shadow(0 0 14px rgba(0,212,255,0.75)) drop-shadow(0 0 4px rgba(0,212,255,0.9)); }
  }
  @keyframes racingPulse {
    0%,100% { filter: drop-shadow(0 0 5px rgba(34,197,94,0.4)) drop-shadow(0 0 2px rgba(34,197,94,0.6)); }
    50%      { filter: drop-shadow(0 0 16px rgba(34,197,94,0.8)) drop-shadow(0 0 4px rgba(34,197,94,1)); }
  }
  @keyframes overlordPulse {
    0%,100% { filter: drop-shadow(0 0 5px rgba(248,113,113,0.4)) drop-shadow(0 0 2px rgba(248,113,113,0.6)); }
    50%      { filter: drop-shadow(0 0 16px rgba(248,113,113,0.8)) drop-shadow(0 0 4px rgba(248,113,113,1)); }
  }
  .view-btn {
    animation: viewPulse 3s ease-in-out infinite;
    transition: transform 0.18s;
  }
  .view-btn-racing {
    animation: racingPulse 2s ease-in-out infinite;
    transition: transform 0.18s;
  }
  .view-btn-overlord {
    animation: overlordPulse 2s ease-in-out infinite;
    transition: transform 0.18s;
  }
  .view-btn:hover, .view-btn-racing:hover, .view-btn-overlord:hover {
    transform: scale(1.08) !important;
    filter: drop-shadow(0 0 20px currentColor) brightness(1.35) !important;
    cursor: pointer;
  }
  .view-btn:active, .view-btn-racing:active, .view-btn-overlord:active {
    transform: scale(0.96) !important;
    filter: brightness(1.6) !important;
  }
`;

export default function ViewButton({ activeGame, raceView, onRaceViewToggle, questView, onQuestViewToggle, overlordView, onOverlordViewToggle }) {
  const [vrOpen, setVrOpen] = useState(false);
  const [vrPairing, setVrPairing] = useState(false);
  const [vrPairDone, setVrPairDone] = useState(false);
  const vrRef = useRef(null);

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
  const isOvSpace      = overlordView === "SPACE";
  const overlordImgSrc = isOvSpace ? "/overlord_solar.png" : "/overlord_planet.png";
  const overlordSub    = isOvSpace ? "WORLD" : "SPACE";

  const handleClick = isRacing   ? onRaceViewToggle
    : isQuest    ? onQuestViewToggle
    : isOverlord ? onOverlordViewToggle
    : undefined;

  // Game-mode colors
  const gameImgSrc = isRacing ? raceImgSrc : isQuest ? questImgSrc : overlordImgSrc;
  const gameSub    = isRacing ? raceSub    : isQuest ? questSub    : overlordSub;
  const gameColor  = isRacing ? "#22c55e"  : isQuest ? "#38bdf8"   : isOverlord ? "#f87171" : "#00D4FF";
  const gameGlow   = isRacing ? "rgba(34,197,94,0.8)" : isQuest ? "rgba(56,189,248,0.8)" : isOverlord ? "rgba(248,113,113,0.8)" : "rgba(0,212,255,0.8)";
  const strokeColor = gameColor;

  const SIZE = inGame ? "clamp(104px, 15vmin, 168px)" : "clamp(66px, 10vmin, 112px)";

  return (
    <>
      <style>{CSS}</style>

      {/* ── VIEW button wrapper — polygon + label below ── */}
      <div style={{
        position: "absolute",
        bottom:   inGame ? "calc(13% - 28px)" : "calc(9% - 28px)",
        right:    "2.5%",
        zIndex:   35,
        display:  "flex", flexDirection: "column",
        alignItems: "center", gap: 6,
        userSelect: "none",
      }}>
        <div
          className={isRacing ? "view-btn-racing" : isOverlord ? "view-btn-overlord" : "view-btn"}
          onClick={handleClick}
          title={inGame ? `Switch to ${gameSub} view` : "VIEW"}
          style={{
            width:    SIZE,
            height:   SIZE,
            clipPath: "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
            background: `radial-gradient(circle at 40% 30%, rgba(0,35,65,0.97), rgba(0,12,30,0.99))`,
            border: "none", outline: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Octagon border */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
            viewBox="0 0 100 100">
            <polygon points="30,1 70,1 99,30 99,70 70,99 30,99 1,70 1,30"
              fill="none" stroke={strokeColor} strokeWidth="2" strokeOpacity="0.8" />
            <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
              fill="none" stroke={strokeColor} strokeWidth="0.8" strokeOpacity="0.25" />
          </svg>

          {/* Icon only — no text inside */}
          <img
            src={inGame ? gameImgSrc : "/eagle-eye-icon.png"}
            alt={inGame ? gameSub : "VIEW"}
            loading="lazy"
            style={{
              width:  inGame ? "clamp(62px, 10vmin, 112px)" : "clamp(46px, 7.5vmin, 88px)",
              height: inGame ? "clamp(62px, 10vmin, 112px)" : "clamp(46px, 7.5vmin, 88px)",
              objectFit: "contain",
              filter: `drop-shadow(0 0 8px ${gameGlow})`,
              zIndex: 1,
            }}
          />
        </div>

        {/* Label below the polygon */}
        <span style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(7px, 0.9vmin, 10px)",
          fontWeight: "bold", letterSpacing: "0.13em",
          color: gameColor,
          textShadow: `0 0 8px ${gameGlow}`,
          background: "rgba(0,8,24,0.72)",
          border: `1px solid ${gameColor}33`,
          borderRadius: 4, padding: "2px 7px",
          backdropFilter: "blur(4px)",
          whiteSpace: "nowrap",
        }}>{inGame ? gameSub : "VIEW"}</span>
      </div>

      {/* ── VR MODE button — always visible, to the left of VIEW ── */}
      <div ref={vrRef} style={{
        position: "absolute", bottom: "3%",
        right: `calc(2.5% + ${SIZE} + 12px)`,
        zIndex: 35,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6,
        userSelect: "none",
      }}>
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setVrOpen(o => !o)}
            className="view-btn"
            style={{
              width: "clamp(44px, 6vmin, 70px)", height: "clamp(44px, 6vmin, 70px)",
              borderRadius: "50%",
              border: `1.5px solid rgba(0,212,255,${vrOpen ? "1" : "0.75"})`,
              boxShadow: vrOpen
                ? "0 0 18px rgba(0,212,255,0.55), inset 0 0 12px rgba(0,212,255,0.12)"
                : "0 0 10px rgba(0,212,255,0.25), inset 0 0 8px rgba(0,212,255,0.06)",
              background: vrOpen
                ? "radial-gradient(circle at 40% 30%, rgba(0,60,100,0.97), rgba(0,20,50,0.99))"
                : "radial-gradient(circle at 40% 30%, rgba(0,35,65,0.97), rgba(0,12,30,0.99))",
              display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <img
              src="/vr-icon.png"
              alt="VR MODE"
              style={{
                width: "clamp(36px, 5vmin, 62px)",
                height: "clamp(36px, 5vmin, 62px)",
                objectFit: "contain",
                filter: vrOpen ? "drop-shadow(0 0 8px rgba(0,212,255,0.9))" : "none",
              }}
            />
          </div>{/* end circle button */}

          {/* Dropdown — positioned relative to inner wrapper */}
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
        </div>{/* end relative wrapper */}

        {/* VR MODE label below circle */}
        <span style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(7px, 0.9vmin, 10px)",
          fontWeight: "bold", letterSpacing: "0.13em",
          color: "#00D4FF",
          textShadow: "0 0 8px rgba(0,212,255,0.7)",
          background: "rgba(0,8,24,0.72)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 4, padding: "2px 7px",
          backdropFilter: "blur(4px)",
          whiteSpace: "nowrap",
        }}>VR MODE</span>

      </div>{/* end vrRef wrapper */}
    </>
  );
}
