import { useState } from "react";
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

export default function Gaming() {
  const [loading,     setLoading]     = useState(true);
  const [visible,     setVisible]     = useState(false);
  const [activeGame,  setActiveGame]  = useState(null);
  const [raceView,     setRaceView]     = useState("TRACK");  // "TRACK" | "GARAGE"
  const [questView,    setQuestView]    = useState("SPACE");  // "SPACE" | "GROUND"
  const [overlordView, setOverlordView] = useState("SPACE");  // "SPACE" | "WORLD"

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
      <TopBar />
      <ProfileButton />
      <MiniMap />
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
