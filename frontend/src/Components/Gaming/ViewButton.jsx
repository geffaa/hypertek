/**
 * ViewButton — positioned outside the frame at bottom-right.
 * In-game: polygon frame colored by game mode, shows game-specific view toggle icons.
 * VR MODE button always visible at all times.
 */

import { useState, useRef, useEffect } from "react";


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

  const SIZE = inGame ? "clamp(90px, 13vmin, 148px)" : "clamp(54px, 8vmin, 90px)";

  return (
    <>
      <style>{CSS}</style>

      {/* ── VIEW button — polygon frame always ── */}
      <div
        className={isRacing ? "view-btn-racing" : isOverlord ? "view-btn-overlord" : "view-btn"}
        onClick={handleClick}
        title={isRacing
          ? `Switch to ${raceSub} view`
          : isQuest
            ? `Switch to ${questSub} view`
            : isOverlord
              ? `Switch to ${overlordSub} view`
              : "VIEW"}
        style={{
          position: "absolute",
          bottom:   inGame ? "13%" : "9%",
          right:    "2.5%",
          zIndex:   35,
          width:    SIZE,
          height:   SIZE,
          clipPath: "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
          background: `radial-gradient(circle at 40% 30%, rgba(0,35,65,0.97), rgba(0,12,30,0.99))`,
          border: "none", outline: "none",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "4px", userSelect: "none",
          position: "absolute",
        }}
      >
        {/* Octagon border — color matches game mode */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
          viewBox="0 0 100 100">
          <polygon points="30,1 70,1 99,30 99,70 70,99 30,99 1,70 1,30"
            fill="none" stroke={strokeColor} strokeWidth="2" strokeOpacity="0.8" />
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
            fill="none" stroke={strokeColor} strokeWidth="0.8" strokeOpacity="0.25" />
        </svg>

        {inGame ? (
          /* ── In-game: icon + sub label inside polygon ── */
          <>
            <img
              src={gameImgSrc}
              alt={gameSub}
              loading="lazy"
              style={{
                width: "clamp(52px, 8vmin, 96px)",
                height: "clamp(52px, 8vmin, 96px)",
                objectFit: "contain",
                filter: `drop-shadow(0 0 8px ${gameGlow})`,
                zIndex: 1,
              }}
            />
            <span style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "clamp(4px, 0.55vw, 6px)",
              fontWeight: "bold", letterSpacing: "0.12em",
              color: gameColor,
              textShadow: `0 0 8px ${gameGlow}`,
              zIndex: 1,
            }}>{gameSub}</span>
          </>
        ) : (
          /* ── Default HUD mode ── */
          <>
            <span style={{
              fontSize: "clamp(12px, 2vmin, 20px)", color: "#00D4FF",
              lineHeight: 1, textShadow: "0 0 12px rgba(0,212,255,0.8)", zIndex: 1,
            }}>⬡</span>
            <span style={{
              fontFamily: "Orbitron, sans-serif", fontSize: "clamp(5px, 0.8vmin, 8px)",
              fontWeight: "bold", letterSpacing: "0.1em", color: "#00D4FF",
              textShadow: "0 0 6px rgba(0,212,255,0.6)", zIndex: 1,
            }}>VIEW</span>
          </>
        )}
      </div>

      {/* ── VR MODE button — always visible, to the left of VIEW ── */}
      <div ref={vrRef} style={{ position: "absolute", bottom: "3%", right: `calc(2.5% + ${SIZE} + 10px)`, zIndex: 35 }}>
        <div
          onClick={() => setVrOpen(o => !o)}
          className="view-btn"
          style={{
            width: "clamp(58px, 8vmin, 90px)", height: "clamp(58px, 8vmin, 90px)",
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
            cursor: "pointer", userSelect: "none",
          }}
        >
          <img
            src="/vr-icon.svg"
            alt="VR MODE"
            style={{
              width: "clamp(50px, 7vmin, 82px)",
              height: "clamp(50px, 7vmin, 82px)",
              objectFit: "contain",
              filter: vrOpen ? "drop-shadow(0 0 8px rgba(0,212,255,0.9))" : "none",
            }}
          />
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
      </div>
    </>
  );
}
