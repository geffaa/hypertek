import { useMemo } from "react";

const AVATARS = [
  "/avatar/dryads-female.webp",
  "/avatar/dryads-male.webp",
  "/avatar/fawnus-female.webp",
  "/avatar/fawnus-male.webp",
  "/avatar/geodians-female.webp",
  "/avatar/geodians-male.webp",
  "/avatar/lithionites-female.webp",
  "/avatar/lithionites-male.webp",
  "/avatar/mantasquads-female.webp",
  "/avatar/mantasquads-male.webp",
  "/avatar/marmulus-female.webp",
  "/avatar/marmulus-male.webp",
  "/avatar/ophidians-female.webp",
  "/avatar/ophidians-male.webp",
  "/avatar/overlord.webp",
  "/avatar/commander-elite.webp",
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
