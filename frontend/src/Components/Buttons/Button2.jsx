// src/components/CustomButton2.jsx
import React from "react";
import "../../App.css";

const CustomButton2 = ({ text }) => {
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
      <div
        className="bg-[#002AA8] h-[1.75rem] md:h-[2rem] w-[0.25rem] mr-0.5 transition-all duration-300 group-hover:bg-[#0034d6]"
      ></div>

      {/* Left angled border */}
      <div
        className="border-[#002AA8] w-[7px] md:w-[9px] h-[30px] md:h-[42px] transition-all duration-300 group-hover:border-[#0034d6]"
        style={{
          borderStyle: "solid",
          borderWidth: "0.375rem 0.25rem 0.375rem 0",
        }}
      ></div>

     {/* Main button area */}
<div
  className="
    flex items-center justify-center
    text-white font-inter font-medium
    text-[15px] md:text-[17px] leading-[1] tracking-[0] text-center capitalize
    w-[160px] md:w-[190px]
    py-[10px] md:py-[11px]
    transition-all duration-300 ease-in-out
  "
  style={{
    background: "rgba(0, 0, 0, 0.45)",
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
      ></div>

      {/* Right small bar */}
      <div className="bg-[#002AA8] h-[1.75rem] md:h-[2rem] w-[0.25rem] transition-all duration-300 group-hover:bg-[#0034d6]"></div>
    </div>
  );
};

export default CustomButton2;
