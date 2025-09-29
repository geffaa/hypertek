import React from 'react';
import FaceOne from "../assets/images/noActivity1.png";
import FaceTwo from "../assets/images/noActivity2.png";
import BackHome from "../assets/images/backhome.png";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 relative">
      
      {/* Oops! Text */}
      <h1 className="text-center text-white font-bold text-3xl md:text-4xl lg:text-5xl">
        Oops!
      </h1>
      
      {/* 404 Number */}
      <div className="flex text-center mt-6">
        <h1 className="text-[#8C9ED8] font-bold text-[80px] sm:text-[100px] md:text-[120px] ml-0">4</h1>
        <h1 className="text-[#8C9ED8] font-bold text-[80px] sm:text-[100px] md:text-[120px] ml-2">0</h1>
        <h1 className="text-[#8C9ED8] font-bold text-[80px] sm:text-[100px] md:text-[120px] ml-2">4</h1>
      </div>

      {/* Images (hidden on small screens) */}
      <div className="hidden md:block absolute top-[14rem] left-[50%] transform -translate-x-1/2">
        <img src={FaceOne} alt="Face One" className="w-24 h-20 md:w-28 md:h-24" />
      </div>

      <div className="hidden md:block absolute top-[19rem] left-[49%] transform -translate-x-1/2">
        <img src={FaceTwo} alt="Face Two" className="w-12 h-6 md:w-16 md:h-8 ml-6 pb-3" />
      </div>

      {/* Go Home Button */}
      <Link 
        to="/payment"
        className="flex items-center justify-center no-underline hover:no-underline mt-10"
        style={{
          width: "146px",
          height: "42px",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          boxSizing: "border-box",
          textDecoration: "none",
        }}
      >
        {/* Icon */}
        <img
          src={BackHome}
          alt="Back Home"
          style={{
            width: "24px",
            height: "17px",
            opacity: 1,
          }}
        />

        {/* Text */}
        <span
          style={{
            marginLeft: "8px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "100%",
            textTransform: "capitalize",
            color: "white",
          }}
        >
          Go Home
        </span>
      </Link>

      {/* Divider */}
      <div className="w-[120px] bg-white h-1 mt-2"></div>
    </div>
  );
}

export default NotFound;
