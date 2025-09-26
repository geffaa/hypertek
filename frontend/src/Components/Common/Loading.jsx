import React from "react";
import Logo from "../../assets/images/logo.png";

export default function Loading() {
  return (
    <div className="relative flex items-center justify-center h-screen w-full bg-black overflow-hidden">
      {/* Top-left Glow */}
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,42,168,0.6) 0%, rgba(0,42,168,0.05) 70%, rgba(0,0,0,0) 100%)",
          width: "400px",
          height: "400px",
          top: "50px",
          left: "50px",
          filter: "blur(150px)",
        }}
      ></div>

      {/* Bottom-right Glow */}
      <div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,42,168,0.5) 0%, rgba(0,42,168,0.05) 70%, rgba(0,0,0,0) 100%)",
          width: "400px",
          height: "400px",
          bottom: "50px",
          right: "50px",
          filter: "blur(150px)",
        }}
      ></div>

      {/* Center Logo */}
      <div className="flex flex-col items-center gap-4 text-white z-10">
        <img
          src={Logo}
          alt="Logo"
          className="h-20 w-auto animate-pulse"
        />
      </div>
    </div>
  );
}
