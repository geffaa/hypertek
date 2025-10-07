import React from "react";
import FaceOne from "../assets/images/noActivity1.png";
import FaceTwo from "../assets/images/noActivity2.png";

function NoOffered() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white px-6 py-12 overflow-hidden">
      
      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-300 mb-4 text-center">
           No offers right now
        </h1>
      </div>

      {/* Floating Images (visible on all screens) */}
      <div className="absolute md:top-[15rem] top-[27rem] left-1/2 transform -translate-x-1/2">
        <img
          src={FaceOne}
          alt="Face One"
          className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-24 object-contain"
        />
      </div>

      <div className="absolute md:top-[19rem] top-[29rem] left-1/2 transform -translate-x-1/2">
        <img
          src={FaceTwo}
          alt="Face Two"
          className="w-10 h-6 sm:w-12 sm:h-8 md:w-16 md:h-10 object-contain"
        />
      </div>

      {/* Large 404 Title */}
      <h1 className="text-[80px] sm:text-[120px] md:text-[180px] font-extrabold text-blue-600 leading-none mb-4">
        404
      </h1>
    </div>
  );
}

export default NoOffered;
