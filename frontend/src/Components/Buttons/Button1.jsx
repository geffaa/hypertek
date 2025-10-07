// src/components/CustomButton.jsx
import React from "react";
import "../../App.css";

const CustomButton = ({ text }) => {
  return (
    <div className="flex items-center scale-90 sm:scale-100">
      {/* Left small bar */}
      <div
        className="bg-[#002AA8] mr-0.5"
        style={{
          width: "0.25rem", // ~3.99px
          height: "1.3rem", // ~21.93px
        }}
      ></div>

      {/* Left angled border */}
      <div
        className="border-[#002AA8]"
        style={{
          width: "0.5rem", // ~7.97px
          height: "2.4rem", // ~42.86px
          borderStyle: "solid",
          borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
        }}
      ></div>

      {/* Main button area */}
      <div
        className="flex items-center justify-center text-white font-medium text-xs sm:text-sm"
        style={{
          width: "8rem", // ~128px
          height: "2rem", // ~32px
          background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
          border: "0.15rem solid #002AA8", // ~2.42px
        }}
      >
        {text}
      </div>

      {/* Right angled border */}
      <div
        className="border-[#002AA8]"
        style={{
          width: "0.5rem", // ~7.97px
          height: "2.4rem", // ~42.86px
          borderStyle: "solid",
          borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
        }}
      ></div>

      {/* Right small bar */}
      <div
        className="bg-[#002AA8]"
        style={{
          width: "0.25rem", // ~3.99px
          height: "1.3rem", // ~21.93px
        }}
      ></div>
    </div>
  );
};

export default CustomButton;