import React from "react";
import GlowingOrb from "../Components/Common/BgColoring";
import bgImage from "../assets/images/hero.jpg"; // <- change path if needed
import "../index.css"; // ensure your global styles (body margin reset) are included

function Testing() {
  return (
    <div className="relative w-full">
      {/* IMAGE IN FLOW — NOT absolute/fixed, width:100%, height:auto */}
      <div className="w-full">
        <img
          src={bgImage}
          alt="Background"
          // width 100% and height auto so it behaves like normal content and scales with zoom
          className="w-full h-auto block"
          // flip only the image (if you want mirrored)
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Glowing orb(s) positioned relative to the page (keeps them above image) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <GlowingOrb Yaxis={200} Xaxis={180} />
      </div>

      {/* CONTENT OVER THE IMAGE */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold">
          Hello world, this is the example
        </h1>
      </div>
    </div>
  );
}

export default Testing;
