import { useState, useEffect } from "react";

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFading(true);
            setTimeout(onDone, 600);
          }, 300);
          return 100;
        }
        const step = prev < 70 ? 2.5 : prev < 90 ? 1.2 : 0.5;
        return Math.min(prev + step, 100);
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#060610",
      display:"flex", flexDirection:"column",
      opacity: fading ? 0 : 1,
      transition: "opacity 0.6s ease",
    }}>
      <img
        src="/loading_game.webp"
        alt="loading"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"cover", objectPosition:"center" }}
      />
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(to top, rgba(6,6,16,0.92) 0%, rgba(6,6,16,0.1) 60%)",
      }} />
      <div style={{ position:"absolute", bottom:32, left:40, right:40, zIndex:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:"#00E5FF", fontFamily:"Orbitron,sans-serif",
            fontSize:11, fontWeight:"bold", letterSpacing:"0.2em",
            textShadow:"0 0 12px rgba(0,229,255,0.6)" }}>LOADING</span>
          <span style={{ color:"#00E5FF", fontFamily:"Orbitron,sans-serif",
            fontSize:11, fontWeight:"bold",
            textShadow:"0 0 12px rgba(0,229,255,0.6)" }}>{Math.floor(progress)}%</span>
        </div>
        <div style={{
          width:"100%", height:4,
          background:"rgba(0,229,255,0.12)",
          borderRadius:2, border:"1px solid rgba(0,229,255,0.2)", overflow:"hidden",
        }}>
          <div style={{
            height:"100%", width:`${progress}%`,
            background:"linear-gradient(90deg, #0088aa, #00E5FF)",
            borderRadius:2, boxShadow:"0 0 10px rgba(0,229,255,0.8)",
            transition:"width 0.04s linear",
          }} />
        </div>
      </div>
    </div>
  );
}
