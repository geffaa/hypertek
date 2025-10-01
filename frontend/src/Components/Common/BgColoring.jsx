import React from "react";

const GlowingOrb = ({ Xaxis, Yaxis }) => {
  return (
    <div
      style={{
        top: `${Yaxis}px`,
        left: `${Xaxis}px`,
      }}
      className="absolute 
             w-[120px] h-[120px] 
             md:w-[250px] md:h-[250px] 
             rounded-full 
             bg-gradient-to-b from-blue-500/70 via-blue-800/80 to-white/0
             blur-[80px] md:blur-[100px]
             shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                    0_0_100px_50px_rgba(59,130,246,0.4),
                    0_0_200px_100px_rgba(59,130,246,0.2)]"
    ></div>
  );
};

export default GlowingOrb;
