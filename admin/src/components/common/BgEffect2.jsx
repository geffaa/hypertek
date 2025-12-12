import React from "react";

const GlowingOrb = ({ Xaxis, Yaxis }) => {
  return (
    <div
      style={{
        top: `${Yaxis}px`,
        left: `${Xaxis}px`,
        filter: "blur(170px)", // softer blur
      }}
      className="absolute 
             w-[120px] h-[120px] 
             md:w-[257px] md:h-[267px] 
             rounded-full 
             bg-[#1A3DB8]  /* slightly lighter blue */
             shadow-[0_0_30px_15px_rgba(59,130,246,0.4),
                     0_0_80px_40px_rgba(59,130,246,0.25),
                     0_0_150px_80px_rgba(59,130,246,0.15)]"
    ></div>
  );
};

export default GlowingOrb;
