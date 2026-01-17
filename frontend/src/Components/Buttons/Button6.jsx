// src/components/CustomButton.jsx
import React from "react";
import "../../App.css";

const CustomButton6 = ({ text, onClick, disabled }) => {
  return (
    <div
      onClick={!disabled ? onClick : undefined} // ✅ only clickable if not disabled
      className={`
        flex items-center 
        scale-[0.85] sm:scale-[0.95] transition-transform duration-300 ease-in-out md:hover:scale-[1] group
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Left small bar */}
      <div className="bg-[#002AA8] md:h-[1.5rem] h-[1.1rem] w-[0.25rem] mr-0.5 transition-all duration-300 group-hover:bg-[#0034d6]" />

      {/* Left angled border */}
      <div
        className="border-[#002AA8] md:w-[7.5px] w-[5.5px] md:h-[35px] h-[25px] transition-all duration-300 group-hover:border-[#0034d6]"
        style={{ borderStyle: "solid", borderWidth: "0.35rem 0.25rem 0.35rem 0" }}
      />

      {/* Main button area */}
      <div
        className={`
          flex items-center justify-center text-white font-inter font-medium text-[14px] md:text-[15px] leading-[1] text-center
          md:w-[120px] w-[110px] py-[6px] md:py-[7px] transition-all duration-300 ease-in-out
          ${!disabled ? "" : ""}
        `}
        style={{
        
          border: "0.15rem solid #002AA8",
        }}
      >
        {text}
      </div>

      {/* Right angled border */}
      <div
        className="border-[#002AA8] md:w-[7.5px] w-[5.5px] md:h-[35px] h-[25px] transition-all duration-300 group-hover:border-[#0034d6]"
        style={{ borderStyle: "solid", borderWidth: "0.25rem 0 0.35rem 0.25rem" }}
      />

      {/* Right small bar */}
      <div className="bg-[#002AA8] md:h-[1.5rem] h-[1.1rem] w-[0.25rem] transition-all duration-300 group-hover:bg-[#0034d6]" />
    </div>
  );
};

export default CustomButton6;
