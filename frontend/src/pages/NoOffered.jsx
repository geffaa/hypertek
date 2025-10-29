import React from "react";
import FaceOne from "../assets/images/noActivity1.png";
import FaceTwo from "../assets/images/noActivity2.png";

function NoOffered() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white px-6 py-12 overflow-hidden">
      
      {/* Main Container with max-width constraint */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col items-center justify-center relative">
        
        {/* Title */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-300 mb-8 sm:mb-12 text-center">
            No offers right now
          </h1>
        </div>

        {/* 404 Number Container */}
        <div className="relative flex justify-center items-center mb-8 sm:mb-12">
          {/* Large 404 Title */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[180px] font-extrabold text-blue-900 leading-none">
            404
          </h1>

          {/* Floating Images - Positioned relative to 404 text */}
          <div className="absolute -top-1 sm:-top-8 md:-top-8 lg:-top-0">
            <img
              src={FaceOne}
              alt="Face One"
              className="w-16 h-12 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 object-contain"
            />
          </div>

          <div className="absolute top-5 sm:top-16 md:top-20 lg:top-16">
            <img
              src={FaceTwo}
              alt="Face Two"
              className="w-8 h-8 sm:w-14 sm:h-10 md:w-16 md:h-12 lg:w-20 lg:h-14 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoOffered;