import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomButton from "../Buttons/Button1";
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";

function Offer1() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("6 Hours");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = ["6 Hours", "12 Hours", "6 Months", "12 Months", "1 Year"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-4 md:top-16 md:left-10 text-white text-lg p-2 hover:bg-gray-800 rounded-full transition-colors duration-200 z-20"
      >
        <FaArrowLeft />
      </button>

      <div className="flex flex-col gap-4 p-4 mx-auto mt-24 w-full max-w-md">
        {/* Price Label */}
        <h1 className="text-white font-semibold text-lg md:text-xl leading-tight tracking-wide">
          Price
        </h1>

        {/* Price Input */}
        <input
  type="number"
  placeholder="Price"
  className="w-full h-12 px-3 border border-white rounded text-white placeholder-gray-400 bg-transparent outline-none 
             focus:border-blue-500 transition-colors duration-200 text-sm md:text-base
             [&::-webkit-inner-spin-button]:appearance-none
             [&::-webkit-outer-spin-button]:appearance-none
             [&::-webkit-inner-spin-button]:w-4
             [&::-webkit-inner-spin-button]:h-4
             [&::-webkit-inner-spin-button]:text-white
             [&::-webkit-outer-spin-button]:text-white"
/>


        {/* Expired In Label */}
        <h1 className="text-white font-semibold text-lg md:text-xl leading-tight tracking-wide mt-2">
          Expired In
        </h1>

        {/* Custom Dropdown */}
        <div ref={dropdownRef} className="relative w-full">
          <div
            onClick={() => setOpen(!open)}
            className="w-full h-12 px-3 border border-white rounded bg-gray-900 text-white flex items-center justify-between cursor-pointer"
          >
            <span>{selected}</span>
            <FaChevronDown />
          </div>
          {open && (
            <ul className="absolute z-50 mt-1 w-full bg-gray-900 border border-white rounded shadow-lg max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    setSelected(opt);
                    setOpen(false);
                  }}
                  className="px-3 py-2 text-white hover:bg-gray-700 cursor-pointer"
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Your Pay */}
        <div className="flex justify-between font-bold items-center text-white text-sm md:text-base mt-2">
          <p>Your Pay</p>
          <p>--- USDC</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center cursor-pointer mt-4 w-full">
         <Link to="/success">
          <CustomButton text="Submit Offer" />
         </Link>
        </div>

        {/* Paragraph */}
        <p className="text-white text-sm md:text-base font-normal leading-tight tracking-wide text-start md:text-center md:text-left mt-2">
          By clicking "Submit Item Offer", you agree to Hyper Tek the Terms of Service
        </p>
      </div>
    </>
  );
}

export default Offer1;
