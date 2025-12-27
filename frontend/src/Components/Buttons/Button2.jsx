// src/components/CustomButton2.jsx
import React from "react";
import "../../App.css";

const CustomButton2 = ({ text }) => {
  return (
    <div
      className="
        flex items-center
        scale-80 sm:scale-90
        transition-transform duration-300 ease-in-out
        md:hover:scale-95
        group
      "
    >
      {/* Left small bar */}
      <div
        className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem] mr-0.5 transition-all duration-300 group-hover:bg-[#0034d6]"
      ></div>

      {/* Left angled border */}
      <div
        className="border-[#002AA8] md:w-[7.97px] w-[5.73px] md:h-[36px] h-[26px] transition-all duration-300 group-hover:border-[#0034d6]"
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
    text-[16px] leading-[1] tracking-[0] text-center capitalize
    md:w-[160px] md:h-[34px]
    w-[90px] h-[24px]
    transition-all duration-300 ease-in-out
  "
  style={{
   
    border: "0.15rem solid #002AA8",
  }}
>
  {text}
</div>

      {/* Right angled border */}
      <div
        className="border-[#002AA8] md:w-[7.97px] w-[5.73px] md:h-[36px] h-[26px] transition-all duration-300 group-hover:border-[#0034d6]"
        style={{
          borderStyle: "solid",
          borderWidth: "0.25rem 0 0.375rem 0.25rem",
        }}
      ></div>

      {/* Right small bar */}
      <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem] transition-all duration-300 group-hover:bg-[#0034d6]"></div>
    </div>
  );
};

export default CustomButton2;
