// src/components/CustomButtonLarge.jsx
import React from "react";
import "../../App.css";

const CustomButtonLarge = ({ text }) => {
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

      {/* Main button */}
      <div
        className="
          flex items-center justify-center
          text-white font-inter font-medium
          text-[13px] md:text-[15px]
          leading-[1.2]
          text-center capitalize
          w-[130px] md:w-[150px]
          py-[7px] md:py-[8px]
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

export default CustomButtonLarge;