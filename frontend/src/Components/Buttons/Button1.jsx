// src/components/CustomButton.jsx
import React from "react";
import "../../App.css";

const CustomButton = ({ text }) => {
  return (
    <div
      className="
        flex items-center
        transition-transform duration-300 ease-in-out
        hover:scale-105
        group
      "
    >
      {/* Left small bar */}
      <div className="bg-[#002AA8] h-[1.75rem] md:h-[2rem] w-[0.25rem] mr-0.5 transition-all duration-300 group-hover:bg-[#0034d6]" />

      {/* Left angled border */}
      <div
        className="border-[#002AA8] w-[7px] md:w-[9px] h-[30px] md:h-[42px] transition-all duration-300 group-hover:border-[#0034d6]"
        style={{
          borderStyle: "solid",
          borderWidth: "0.375rem 0.25rem 0.375rem 0",
        }}
      />

      {/* Main button area */}
      <div
        className="
    flex items-center justify-center
    text-white font-inter font-medium
    text-[15px] md:text-[17px] leading-[1.2] tracking-[0] text-center capitalize
    w-[160px] md:w-[190px]
    py-[10px] md:py-[11px]
    transition-all duration-300 ease-in-out
    group-hover:bg-[linear-gradient(180deg,_#0034D6_0%,_#001B70_100%)]
  "
        style={{
          background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
          border: "0.15rem solid #002AA8",
        }}
      >
        {text}
      </div>

      {/* Right angled border */}
      <div
        className="border-[#002AA8] w-[7px] md:w-[9px] h-[30px] md:h-[42px] transition-all duration-300 group-hover:border-[#0034d6]"
        style={{
          borderStyle: "solid",
          borderWidth: "0.25rem 0 0.375rem 0.25rem",
        }}
      />

      {/* Right small bar */}
      <div className="bg-[#002AA8] h-[1.75rem] md:h-[2rem] w-[0.25rem] transition-all duration-300 group-hover:bg-[#0034d6]" />
    </div>
  );
};

export default CustomButton;

