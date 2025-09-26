// src/Components/Common/PageBackground.jsx
import React from "react";

export default function PageBackground({ className = "" }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      
      {/* Top-left gradient glow */}
      <div
        className="absolute top-10 left-10 w-[340px] h-[340px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(0,42,168,0.2) 70%, rgba(0,0,0,0) 100%)",
        }}
      ></div>

      {/* Bottom-right gradient glow */}
      <div
        className="absolute bottom-0 right-5 w-[340px] h-[340px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(0,42,168,0.25) 70%, rgba(0,0,0,0) 100%)",
        }}
      ></div>

      {/* Top-right blue glow */}
      <div
        className="absolute rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,42,168,0.6) 0%, rgba(0,42,168,0.05) 70%, rgba(0,0,0,0) 100%)",
          width: "357px",
          height: "367px",
          top: "50px",
          right: "50px",
          filter: "blur(150px)",
        }}
      ></div>

      {/* Bottom-left blue glow */}
      <div
        className="absolute rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,42,168,0.6) 0%, rgba(0,42,168,0.05) 70%, rgba(0,0,0,0) 100%)",
          width: "357px",
          height: "367px",
          bottom: "50px",
          left: "50px",
          filter: "blur(150px)",
        }}
      ></div>
    </div>
  );
}
