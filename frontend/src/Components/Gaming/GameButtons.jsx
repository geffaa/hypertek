// SVG viewBox = "0 0 1000 500" mapped to 100vw × 100vh (preserveAspectRatio="none")
// Frame bottom y=488, bar center y=482 → 96.4%; buttons raised to ~91%
// DIV1 bottom x=280, DIV2 bottom x=695
// Panel bottom centers: RACING (15+280)/2=147→14.7vw, QUEST (280+695)/2=487→48.7vw, OVERLORD (695+860)/2=777→77.7vw
import useMobileLandscape from "../../hooks/useMobileLandscape";

const GAMES = [
  {
    label: "RACING",
    left:  "14.7vw",
    width: "14vw",
    accent: "#22c55e",
    glow:   "rgba(34,197,94,0.30)",
    bg:     "rgba(0,25,10,0.88)",
  },
  {
    label: "QUEST",
    left:  "48.7vw",
    width: "20vw",
    accent: "#38bdf8",
    glow:   "rgba(56,189,248,0.30)",
    bg:     "rgba(0,12,32,0.88)",
  },
  {
    label: "OVERLORD",
    left:  "77.7vw",
    width: "10vw",
    accent: "#f87171",
    glow:   "rgba(248,113,113,0.30)",
    bg:     "rgba(32,0,0,0.88)",
  },
];

const CSS = `
  .hud-game-btn {
    transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.22s ease;
  }
  .hud-game-btn:hover {
    transform: translateX(-50%) translateY(calc(-50% - 3px));
    filter: brightness(1.4);
  }
  .hud-game-btn:active {
    transform: translateX(-50%) translateY(-50%) scaleX(0.97);
    filter: brightness(1.7);
  }
`;

export default function GameButtons({ activeGame, onSelect }) {
  const isMobile = useMobileLandscape();
  return (
    <>
      <style>{CSS}</style>
      {GAMES.map(g => {
        const isActive = activeGame === g.label;
        const isOverlord = g.label === "OVERLORD";
        return (
          <button
            key={g.label}
            className="hud-game-btn"
            onClick={() => onSelect?.(isActive ? null : g.label)}
            style={{
              position:"absolute",
              left: g.left,
              top:  "91%",
              transform:"translateX(-50%) translateY(-50%)",
              padding:"7px 0",
              width: isMobile && isOverlord ? "15vw" : g.width,
              background: isActive ? g.accent : g.bg,
              border:`1px solid ${g.accent}`,
              borderTop:`2px solid ${g.accent}`,
              borderRadius:2,
              clipPath:"polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              color: isActive ? "#000" : "#fff",
              fontFamily:"Orbitron,sans-serif",
              fontSize: isMobile && isOverlord ? 8 : 10,
              fontWeight:"bold",
              letterSpacing: isMobile && isOverlord ? "0.08em" : "0.15em",
              cursor:"pointer", zIndex:20, whiteSpace:"nowrap", textAlign:"center",
              boxShadow: isActive
                ? `0 0 32px ${g.glow}, 0 0 8px ${g.accent}, inset 0 1px 0 rgba(255,255,255,0.3)`
                : `0 0 20px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
              textShadow: isActive ? "none" : `0 0 10px ${g.accent}`,
              transition:"background 0.2s, color 0.2s, box-shadow 0.2s",
            }}
          >{g.label}</button>
        );
      })}
    </>
  );
}
