// src/components/CustomButtonLarge.jsx
import React from "react";
import "../../App.css";

const CustomButtonLarge = ({ text }) => {
  return (
    <div className="flex items-center">
      {/* Left small bar */}
      <div
        className="bg-[#002AA8] mr-0.5"
        style={{
          width: "0.3rem",
          height: "1.2rem",
        }}
      ></div>

      {/* Left angled border */}
      <div
        className="border-[#002AA8]"
        style={{
          width: "0.5rem",
          height: "2.1rem",
          borderStyle: "solid",
          borderWidth: "0.35rem 0.25rem 0.35rem 0",
        }}
      ></div>

      {/* Main button area */}
<div
  className="
    flex items-center justify-center
    text-white font-inter font-medium
    text-[13.19px] leading-[1] tracking-[0] text-center capitalize
  "
  style={{
    width: "10.5rem",
    height: "2.2rem",
    backgroundColor: "#002AA8",
    border: "0.15rem solid #002AA8",
  }}
>
  {text}
</div>


      {/* Right angled border */}
      <div
        className="border-[#002AA8]"
        style={{
          width: "0.5rem",
          height: "2.1rem",
          borderStyle: "solid",
          borderWidth: "0.25rem 0 0.35rem 0.25rem",
        }}
      ></div>

      {/* Right small bar */}
      <div
        className="bg-[#002AA8]"
        style={{
          width: "0.3rem",
          height: "1.2rem",
        }}
      ></div>
    </div>
  );
};

export default CustomButtonLarge;

