import React from "react";
import FaceOne from "../assets/images/noActivity1.png";
import FaceTwo from "../assets/images/noActivity2.png";
import BackHome from "../assets/images/backhome.png";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 overflow-hidden">
      {/* Container that stays centered and keeps proportion */}
      <div className="relative w-[1280px] h-[720px] scale-[0.8] my-8 md:scale-100 flex flex-col justify-center items-center">
        {/* Title */}
        <h1 className="text-center text-white font-bold text-4xl md:text-5xl">
          Opps!
        </h1>

        {/* 404 Number */}
        <div className="flex text-center mt-4">
          <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
          <h1 className="text-[#8C9ED8] font-bold text-[160px] mx-2">0</h1>
          <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
        </div>

        {/* Floating Faces */}
        <div className="absolute top-[18rem] left-1/2 transform -translate-x-1/2">
          <img src={FaceOne} alt="Face One" className="w-28 h-24" />
        </div>

        <div className="absolute top-[22rem] left-1/2 transform -translate-x-1/2">
          <img src={FaceTwo} alt="Face Two" className="w-16 h-10 pb-3" />
        </div>

        {/* Go Home Button */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-5  rounded transition duration-300"
        >
          <img src={BackHome} alt="Back Home" className="w-5 h-4 opacity-90" />
          <span className="text-white text-lg font-medium">Go Home</span>
        </Link>

        {/* Divider Line */}
        <div className="w-[120px] h-[1px] bg-gray-200 mt-2 mb-8"></div>
      </div>
    </div>
  );
}

export default NotFound;
