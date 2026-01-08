// src/components/CustomButtonLarge.jsx
import React from "react";
import "../../App.css";

const CustomButtonLarge = ({ text }) => {
  return (
    <div
    className="
    flex items-center 
    scale-80 sm:scale-90
    transition-transform duration-300 ease-in-out 
    md:hover:scale-95   /* Slight zoom out on hover (desktop only) */
    group                /* enables child hover states */
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
    text-white font-inter font-medium text-[16px] leading-[1] tracking-[0] text-center
    md:w-[130px] md:h-[32px]
    w-[90px] h-[24px]
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

export default CustomButtonLarge;
