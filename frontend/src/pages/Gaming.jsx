import { useState, useEffect } from "react";

const VIDEO_SRCS = {
  RACING:   "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/racing_content.mp4",
  QUEST:    "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/quest_video2.webm",
  OVERLORD: "https://pub-5fc51c0e41674b1f884096d3a5a0ba19.r2.dev/overlord_content.mp4",
};
const preloaded = new Set();
function preloadVideo(src) {
  if (!src || preloaded.has(src) || typeof document === "undefined") return;
  preloaded.add(src);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = src;
  document.head.appendChild(link);
}
import LoadingScreen  from "../Components/Gaming/LoadingScreen";
import GameFrame      from "../Components/Gaming/GameFrame";
import SidebarPanel   from "../Components/Gaming/SidebarPanel";
import GameButtons    from "../Components/Gaming/GameButtons";
import TopBar         from "../Components/Gaming/TopBar";
import ProfileButton  from "../Components/Gaming/ProfileButton";
import MiniMap        from "../Components/Gaming/MiniMap";
import ViewButton     from "../Components/Gaming/ViewButton";
import RacingMode     from "../Components/Gaming/RacingMode";
import QuestMode      from "../Components/Gaming/QuestMode";
import OverlordMode   from "../Components/Gaming/OverlordMode";
import RotatePrompt   from "../Components/Gaming/RotatePrompt";

export default function Gaming({ isPreview = false }) {
  const [loading,     setLoading]     = useState(!isPreview);
  const [visible,     setVisible]     = useState(isPreview);
  const [activeGame,  setActiveGame]  = useState(null);
  const [raceView,     setRaceView]     = useState("TRACK");  // "TRACK" | "GARAGE"
  const [questView,    setQuestView]    = useState("SPACE");  // "SPACE" | "GROUND"
  const [overlordView, setOverlordView] = useState("SPACE");  // "SPACE" | "WORLD"

  // Preload video as soon as user selects a mode
  useEffect(() => {
    if (activeGame) preloadVideo(VIDEO_SRCS[activeGame]);
  }, [activeGame]);

  const handleSelectGame = (game) => {
    setActiveGame(game);
    if (!game) { setRaceView("TRACK"); setQuestView("SPACE"); setOverlordView("SPACE"); }
  };

  const handleDone = () => {
    setLoading(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  if (loading) return <LoadingScreen onDone={handleDone} />;

  return (
    <>
    <RotatePrompt />
    <div style={{
      width:"100vw", height:"100vh", background:"#060610",
      overflow:"hidden", position:"relative", userSelect:"none",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.7s ease",
    }}>
      <GameFrame />
      <TopBar activeGame={activeGame} isPreview={isPreview} />
      <ProfileButton />
      {!(activeGame === "RACING" && raceView === "GARAGE") && activeGame !== "OVERLORD" && <MiniMap />}
      <ViewButton
        activeGame={activeGame}
        raceView={raceView}
        onRaceViewToggle={() => setRaceView(v => v === "TRACK" ? "GARAGE" : "TRACK")}
        questView={questView}
        onQuestViewToggle={() => setQuestView(v => v === "SPACE" ? "GROUND" : "SPACE")}
        overlordView={overlordView}
        onOverlordViewToggle={() => setOverlordView(v => v === "SPACE" ? "WORLD" : "SPACE")}
      />
      <SidebarPanel />
      {!activeGame && <GameButtons activeGame={activeGame} onSelect={handleSelectGame} />}

      {activeGame === "RACING" && (
        <RacingMode
          view={raceView}
          onExit={() => { setActiveGame(null); setRaceView("TRACK"); }}
        />
      )}
      {activeGame === "QUEST" && (
        <QuestMode
          view={questView}
          onExit={() => { setActiveGame(null); setQuestView("SPACE"); }}
        />
      )}
      {activeGame === "OVERLORD" && (
        <OverlordMode
          view={overlordView}
          onExit={() => { setActiveGame(null); setOverlordView("SPACE"); }}
        />
      )}

    </div>
    </>
  );
}
