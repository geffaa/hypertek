import React from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../Buttons/Button1";
import { FaChevronDown, FaArrowLeft } from "react-icons/fa";

function Offer1() {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="absolute md:top-[70px] top-[75px] left-[23px] md:left-10 text-white text-lg p-2 hover:bg-gray-800 rounded-full transition-colors duration-200"
      >
        <FaArrowLeft />
      </button>
      <div
        className="flex flex-col gap-5 p-4 mx-auto mt-24 relative"
        style={{
          maxWidth: "409px",
          width: "100%",
          opacity: 1,
          transform: "rotate(0deg)",
        }}
      >
        {/* Price Label */}
        <h1
          className="text-white font-semibold text-[18px] leading-[120%] tracking-[0.02em]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Price
        </h1>

        {/* Price Input */}
        <input
          type="number"
          placeholder="Price"
          className="w-full h-[46px] px-3 border border-white rounded text-white placeholder-gray-400 bg-transparent outline-none focus:border-blue-500 transition-colors duration-200"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "120%",
            letterSpacing: "0.02em",
          }}
        />

        {/* Expired In Label */}
        <h1
          className="text-white font-semibold text-[18px] leading-[120%] tracking-[0.02em]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Expired In
        </h1>

        {/* Expired In Select with arrow */}
        <div className="relative w-full">
          <select
            className="w-full h-[46px] px-3 pr-10 border border-white rounded text-white bg-gray-900 outline-none cursor-pointer appearance-none hover:border-gray-400 focus:border-blue-500 transition-colors duration-200"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "120%",
              letterSpacing: "0.02em",
            }}
          >
            <option className="text-white bg-gray-900 hover:bg-gray-800" value="6 Hours">
              6 Hours
            </option>
            <option className="text-white bg-gray-900 hover:bg-gray-800" value="12 Hours">
              12 Hours
            </option>
            <option className="text-white bg-gray-900 hover:bg-gray-800" value="6 Months">
              6 Months
            </option>
            <option className="text-white bg-gray-900 hover:bg-gray-800" value="12 Months">
              12 Months
            </option>
            <option className="text-white bg-gray-900 hover:bg-gray-800" value="1 Year">
              1 Year
            </option>
          </select>
          {/* Arrow Icon */}
          <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" size={14} />
        </div>

        {/* Your Pay */}
        <div
          className="flex justify-between items-center text-white"
          style={{
            width: "100%",
            maxWidth: "392px",
            height: "22px",
            opacity: 1,
            transform: "rotate(0deg)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "120%",
            letterSpacing: "0.02em",
          }}
        >
          <p>Your Pay</p>
          <p>--- USDC</p>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-2 w-full">
          <CustomButton text="Submit Offer" />
        </div>

        {/* Paragraph */}
        <p
          className="text-white text-[14px] font-normal leading-[120%] tracking-[0.02em] text-center md:text-left"
          style={{
            fontFamily: "Inter, sans-serif",
            opacity: 1,
          }}
        >
          By clicking "Submit Item Offer", you agree to Hyper Tek the Terms of
          Service
        </p>
      </div>
    </>
  );
}

export default Offer1;