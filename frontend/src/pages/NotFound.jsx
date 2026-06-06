import React from "react";
import FaceOne from "../assets/images/noActivity1.webp";
import FaceTwo from "../assets/images/noActivity2.webp";
import BackHome from "../assets/images/backhome.webp";
import { Link } from "react-router-dom";
function NotFound() {
  return (
    <div className="fixed inset-0 flex justify-center items-center pb-20 overflow-hidden z-0 pointer-events-none bg-transparent">



      {/* Container */}
      <div className="relative pointer-events-auto w-[1280px] h-[720px] scale-[0.8] my-8 md:scale-100 flex flex-col justify-center items-center">

        <h1 className="text-center text-white font-bold text-4xl md:text-5xl">
          Opps!
        </h1>

        <div className="flex text-center mt-4">
          <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
          <h1 className="text-[#8C9ED8] font-bold text-[160px] mx-2">0</h1>
          <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
        </div>

        {/* Floating Faces */}
        <div className="absolute top-[18rem] left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <img src={FaceOne} alt="Face One" className="w-28 h-24" />
        </div>

        <div className="absolute top-[22rem] left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <img src={FaceTwo} alt="Face Two" className="w-16 h-10 pb-3" />
        </div>

     {/* Go Home Button */}
<Link
  to="/"
  className="relative z-20 flex items-center justify-center gap-2 px-4 py-1 rounded transition duration-300 cursor-pointer"
>
  <img src={BackHome} alt="Back Home" className="w-4 h-3 opacity-90" />
  <span className="text-white text-sm font-medium">Go Home</span>
</Link>

<div className="w-[100px] h-[1px] bg-gray-200 mt-2 mb-10"></div>

      </div>
    </div>
  );
}
export default NotFound;