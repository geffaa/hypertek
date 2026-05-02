import { useMemo } from "react";

const AVATARS = [
  "/avatar/dryads-female.png",
  "/avatar/dryads-male.png",
  "/avatar/fawnus-female.png",
  "/avatar/fawnus-male.png",
  "/avatar/geodians-female.png",
  "/avatar/geodians-male.png",
  "/avatar/lithionites-female.png",
  "/avatar/lithionites-male.png",
  "/avatar/mantasquads-female.png",
  "/avatar/mantasquads-male.png",
  "/avatar/marmulus-female.png",
  "/avatar/marmulus-male.png",
  "/avatar/ophidians-female.png",
  "/avatar/ophidians-male.png",
  "/avatar/overlord.png",
  "/avatar/commander-elite.png",
];

export default function StickyAvatarSidebar() {
  const src = useMemo(() => AVATARS[Math.floor(Math.random() * AVATARS.length)], []);

  return (
    <div
      style={{
        position: "sticky",
        top: 155,
        width: 460,
        minWidth: 460,
        maxWidth: 460,
        flexShrink: 0,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <img
        src={src}
        alt="avatar"
        onError={(e) => { e.currentTarget.style.opacity = "0.15"; }}
        style={{
          width: "110%",
          height: "calc(78vh - 30px)",
          maxHeight: 980,
          objectFit: "contain",
          objectPosition: "top center",
          display: "block",
          transform: "scaleX(-1)",
        }}
      />
    </div>
  );
}
