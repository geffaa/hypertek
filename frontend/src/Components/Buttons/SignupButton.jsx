// src/components/CustomButtonLarge.jsx
import React from "react";
import "../../App.css";

const CustomButtonLarge = ({ text }) => {
  return (
    <div className="flex items-center">
      {/* Left small bar */}
      <div
        className="bg-[#4A6CF7] mr-0.5" // lighter blue
        style={{
          width: "0.35rem",
          height: "1.5rem",
        }}
      ></div>

      {/* Left angled border */}
      <div
        className="border-[#4A6CF7]"
        style={{
          width: "0.6rem",
          height: "2.5rem",
          borderStyle: "solid",
          borderWidth: "0.45rem 0.3rem 0.45rem 0",
        }}
      ></div>

      {/* Main button area */}
      <div
        className="flex items-center justify-center text-white font-medium"
        style={{
          width: "12rem",
          height: "2.8rem",
          background: "linear-gradient(180deg, #3156eaff 0%, #2A4AB3 100%)", // softer gradient
          border: "0.2rem solid #4A6CF7",
        }}
      >
        {text}
      </div>

      {/* Right angled border */}
      <div
        className="border-[#4A6CF7]"
        style={{
          width: "0.6rem",
          height: "2.5rem",
          borderStyle: "solid",
          borderWidth: "0.3rem 0 0.45rem 0.3rem",
        }}
      ></div>

      {/* Right small bar */}
      <div
        className="bg-[#4A6CF7]"
        style={{
          width: "0.35rem",
          height: "1.4rem",
        }}
      ></div>
    </div>
  );
};

export default CustomButtonLarge;
