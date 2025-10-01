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
             bg-gradient-to-b from-blue-400/30 via-blue-500/40 to-white/10
             blur-[80px] md:blur-[100px]
             shadow-[0_0_30px_10px_rgba(59,130,246,0.2),
                    0_0_70px_35px_rgba(59,130,246,0.15),
                    0_0_150px_75px_rgba(59,130,246,0.1)]"
    ></div>
  );
};

export default GlowingOrb;
