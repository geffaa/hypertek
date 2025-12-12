import React from "react";

const GlowingOrb = ({ Xaxis, Yaxis }) => {
  return (
    <div
      style={{
        top: `${Yaxis}px`,
        left: `${Xaxis}px`,
        position:"absolute",
        width: "357px",
        height: "367px",
        background: "#002AA8",
        opacity: 1,
        filter: "blur(600px)", // main blur
        // backdropFilter: "blur(600px)", 
      }}
      className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
    ></div>
  );
};

export default GlowingOrb;
