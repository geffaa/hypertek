import React from "react";
import Logo from "../../assets/images/logo.png";
import GlowinBg from "../Common/BgColoring"

export default function Loading() {
  return (
    <div className="relative flex items-center justify-center h-screen w-full overflow-hidden bg-[#000000]">
      
     <GlowinBg Xaxis={200} Yaxis={150}/>
     <GlowinBg Xaxis={920} Yaxis={400}/>

      

    

     
     

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
