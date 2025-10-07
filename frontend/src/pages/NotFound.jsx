import React from "react";
import FaceOne from "../assets/images/noActivity1.png";
import FaceTwo from "../assets/images/noActivity2.png";
import BackHome from "../assets/images/backhome.png";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="relative min-h-screen bg-gray-900 flex flex-col justify-center items-center overflow-hidden">
      {/* Title */}
      <h1 className="text-center text-white font-bold text-3xl md:text-4xl lg:text-5xl">
        Opps!
      </h1>

      {/* 404 Number */}
      <div className="flex text-center mt-6">
        <h1 className="text-[#8C9ED8] font-bold text-[80px] sm:text-[100px] md:text-[140px]">4</h1>
        <h1 className="text-[#8C9ED8] font-bold text-[80px] sm:text-[100px] md:text-[140px] mx-2">0</h1>
        <h1 className="text-[#8C9ED8] font-bold text-[80px] sm:text-[100px] md:text-[140px]">4</h1>
      </div>

      {/* Floating Faces (now correctly positioned even on small screens) */}
      <div className="absolute top-[24rem] sm:top-[10rem] md:top-[13rem] left-1/2 transform -translate-x-1/2">
        <img
          src={FaceOne}
          alt="Face One"
          className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-24"
        />
      </div>

      <div className="absolute top-[27rem] sm:top-[14rem] md:top-[18rem] left-1/2 transform -translate-x-1/2">
        <img
          src={FaceTwo}
          alt="Face Two"
          className="w-8 h-5 sm:w-12 sm:h-8 md:w-16 md:h-8 ml-0 pb-3"
        />
      </div>

      {/* Go Home Button */}
      <Link
        to="/payment"
        className="flex items-center justify-center gap-2 mt-14 px-5 py-2 rounded  transition duration-300"
      >
        <img src={BackHome} alt="Back Home" className="w-5 h-4 opacity-90" />
        <span className="text-white text-lg font-medium">Go Home</span>
      </Link>

      {/* Divider Line */}
      <div className="mt-4 w-[calc(100%-2rem)] max-w-[180px] h-[1px] bg-gray-400"></div>
    </div>
  );
}

export default NotFound;
