import { Lock } from "lucide-react";

/**
 * Sticky lock card used across the marketplace game tabs and the
 * pre-launch locks (marketplace / dashboard). Card stays centered in
 * the viewport while the dimmed content behind it scrolls.
 */
export function LockCard({ title, desc, icon }) {
  return (
    <div
      className="pointer-events-none"
      style={{ gridRow: "1/1", gridColumn: "1/1", position: "sticky", top: "calc(50vh - 70px)", zIndex: 10, display: "flex", justifyContent: "center", alignSelf: "start", justifySelf: "start", width: "min(100%, calc(100vw - 64px))" }}
    >
      <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl text-center"
        style={{ background: "rgba(6,8,22,0.82)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", maxWidth: 400 }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
          {icon || <Lock className="w-5 h-5 text-white/60" />}
        </div>
        <p className="text-white font-bold text-base leading-snug">{title}</p>
        {desc && <p className="text-white/55 text-sm leading-relaxed">{desc}</p>}
      </div>
    </div>
  );
}

/**
 * Wraps content in the CSS-Grid overlap pattern: children are dimmed and
 * made inert, with a sticky LockCard floating above them. Set locked={false}
 * to render children untouched.
 */
function LockOverlay({ locked = true, title, desc, icon, children }) {
  if (!locked) return children;
  return (
    <div style={{ display: "grid" }}>
      <div className="opacity-50 pointer-events-none select-none" style={{ gridRow: "1/1", gridColumn: "1/1" }}>
        {children}
      </div>
      <LockCard title={title} desc={desc} icon={icon} />
    </div>
  );
}

export default LockOverlay;
