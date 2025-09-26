// src/Components/Common/PageBackground.jsx
import React from "react";

export default function PageBackground({ children }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gray-900">
      {/* Top-left glow */}
      <div
        className="absolute top-0 left-0 w-[340px] h-[340px] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(0,42,168,0.3) 70%, rgba(0,0,0,0) 100%)",
        }}
      ></div>

      {/* Top-right glow */}
      <div
        className="absolute top-0 right-0 w-[340px] h-[340px] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,42,168,0.5) 0%, rgba(0,42,168,0.05) 70%, rgba(0,0,0,0) 100%)",
        }}
      ></div>

      {/* Bottom-left glow */}
      <div
        className="absolute bottom-0 left-0 w-[340px] h-[340px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,42,168,0.5) 0%, rgba(0,42,168,0.05) 70%, rgba(0,0,0,0) 100%)",
        }}
      ></div>

      {/* Bottom-right glow */}
      <div
        className="absolute bottom-0 right-0 w-[340px] h-[340px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(0,42,168,0.2) 70%, rgba(0,0,0,0) 100%)",
        }}
      ></div>

      {/* Children content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
