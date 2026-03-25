/**
 * RotatePrompt — shown when a mobile user opens the Gaming page in portrait mode.
 * Disappears automatically when the device is rotated to landscape.
 * Offers a button to attempt fullscreen + orientation lock.
 */

import { useState, useEffect } from "react";

/* ── Detect portrait mobile ──────────────────────────────────── */
function useIsPortraitMobile() {
  const check = () =>
    typeof window !== "undefined" &&
    window.innerWidth < window.innerHeight &&   // portrait
    window.innerWidth < 900;                    // mobile / narrow tablet

  const [isPortrait, setIsPortrait] = useState(check);

  useEffect(() => {
    const handler = () => setIsPortrait(check());
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, []);

  return isPortrait;
}

/* ── CSS ─────────────────────────────────────────────────────── */
const CSS = `
  @keyframes rotatePhone {
    0%   { transform: rotate(0deg);   }
    35%  { transform: rotate(0deg);   }
    65%  { transform: rotate(90deg);  }
    100% { transform: rotate(90deg);  }
  }
  .rp-phone { animation: rotatePhone 2.2s ease-in-out infinite; }

  @keyframes rpPulse {
    0%,100% { opacity: 0.5; transform: scale(1);    }
    50%     { opacity: 1;   transform: scale(1.04); }
  }
  .rp-ring { animation: rpPulse 2.2s ease-in-out infinite; }

  @keyframes rpFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .rp-overlay { animation: rpFadeIn 0.4s ease both; }

  @keyframes rpArrow {
    0%,100% { opacity: 0.35; transform: translateX(0);   }
    50%     { opacity: 1;   transform: translateX(4px);  }
  }
  .rp-arrow { animation: rpArrow 1.4s ease-in-out infinite; }

  .rp-cta-btn {
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }
  .rp-cta-btn:hover {
    background: rgba(0,212,255,0.22) !important;
    box-shadow: 0 0 28px rgba(0,212,255,0.55) !important;
    transform: scale(1.04);
  }
  .rp-cta-btn:active { transform: scale(0.97); }

  .rp-skip {
    transition: color 0.15s, opacity 0.15s;
  }
  .rp-skip:hover { color: #fff !important; opacity: 1 !important; }
`;

/* ── Phone SVG icon ──────────────────────────────────────────── */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 56 90" width="56" height="90" fill="none">
      {/* Phone body */}
      <rect x="4" y="4" width="48" height="82" rx="8"
        fill="rgba(0,212,255,0.06)" stroke="#00D4FF" strokeWidth="2" strokeOpacity="0.85"/>
      {/* Screen */}
      <rect x="8" y="14" width="40" height="58" rx="3"
        fill="rgba(0,212,255,0.08)" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.4"/>
      {/* Speaker */}
      <rect x="20" y="8" width="16" height="3" rx="1.5"
        fill="#00D4FF" fillOpacity="0.35"/>
      {/* Home area */}
      <circle cx="28" cy="80" r="3.5" stroke="#00D4FF" strokeWidth="1" strokeOpacity="0.5"/>
      {/* Screen content hint */}
      <rect x="14" y="30" width="28" height="2.5" rx="1" fill="#00D4FF" fillOpacity="0.2"/>
      <rect x="14" y="36" width="20" height="2" rx="1" fill="#00D4FF" fillOpacity="0.12"/>
      <rect x="14" y="41" width="24" height="2" rx="1" fill="#00D4FF" fillOpacity="0.12"/>
    </svg>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function RotatePrompt() {
  const isPortrait = useIsPortraitMobile();
  const [dismissed, setDismissed] = useState(false);

  /* Auto-show again if user rotates back to portrait */
  useEffect(() => {
    if (isPortrait) setDismissed(false);
  }, [isPortrait]);

  const handleEnterLandscape = () => {
    try {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
      if (req) req.call(el);
    } catch (_) {}
    try {
      if (screen.orientation?.lock) {
        screen.orientation.lock("landscape").catch(() => {});
      }
    } catch (_) {}
  };

  if (!isPortrait || dismissed) return null;

  return (
    <>
      <style>{CSS}</style>

      <div className="rp-overlay" style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(2,6,18,0.97)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        padding: "32px 24px",
        textAlign: "center",
      }}>

        {/* Glow ring behind phone */}
        <div className="rp-ring" style={{
          width: 140, height: 140,
          borderRadius: "50%",
          border: "1.5px solid rgba(0,212,255,0.2)",
          boxShadow: "0 0 60px rgba(0,212,255,0.12), inset 0 0 30px rgba(0,212,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          flexShrink: 0,
        }}>
          {/* Rotating phone */}
          <div className="rp-phone" style={{ transformOrigin: "center center" }}>
            <PhoneIcon />
          </div>
        </div>

        {/* Rotate arrows hint */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          opacity: 0.7,
        }}>
          <span className="rp-arrow" style={{ fontSize: 18, color: "#00D4FF" }}>↺</span>
          <div style={{
            width: 52, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)",
          }} />
          <span className="rp-arrow" style={{ fontSize: 18, color: "#00D4FF", animationDelay: "0.3s" }}>↻</span>
        </div>

        {/* Heading */}
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(16px, 5vw, 22px)",
          fontWeight: "bold",
          letterSpacing: "0.18em",
          color: "#00D4FF",
          textShadow: "0 0 24px rgba(0,212,255,0.7), 0 0 8px rgba(0,212,255,0.4)",
          marginBottom: 12,
          lineHeight: 1.3,
        }}>
          ROTATE YOUR DEVICE
        </div>

        {/* Subtext */}
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(9px, 2.8vw, 12px)",
          letterSpacing: "0.1em",
          color: "rgba(148,192,210,0.65)",
          lineHeight: 1.7,
          maxWidth: 280,
          marginBottom: 36,
        }}>
          For the best gaming experience,<br />
          rotate your device to <span style={{ color: "#00D4FF", fontWeight: "bold" }}>landscape mode</span>.
        </div>

        {/* CTA button */}
        <button
          className="rp-cta-btn"
          onClick={handleEnterLandscape}
          style={{
            padding: "12px 28px",
            background: "rgba(0,212,255,0.1)",
            border: "1.5px solid rgba(0,212,255,0.65)",
            borderRadius: 4,
            clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "clamp(9px, 2.5vw, 11px)",
            fontWeight: "bold",
            letterSpacing: "0.16em",
            color: "#00D4FF",
            textShadow: "0 0 10px rgba(0,212,255,0.7)",
            boxShadow: "0 0 18px rgba(0,212,255,0.18)",
            cursor: "pointer",
            marginBottom: 20,
            whiteSpace: "nowrap",
          }}
        >
          ⤢&nbsp; ROTATE &amp; FULLSCREEN
        </button>

        {/* Skip link */}
        <button
          className="rp-skip"
          onClick={() => setDismissed(true)}
          style={{
            background: "none",
            border: "none",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "clamp(8px, 2.2vw, 10px)",
            letterSpacing: "0.12em",
            color: "rgba(148,192,210,0.35)",
            cursor: "pointer",
            opacity: 0.7,
            padding: "4px 8px",
          }}
        >
          CONTINUE ANYWAY →
        </button>

        {/* Bottom decoration line */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
        }} />

      </div>
    </>
  );
}
