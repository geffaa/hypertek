import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import CustomButton from "../Components/Buttons/Button1";
import { Link } from "react-router-dom";
import BackHome from "../assets/images/backhome.png";

function Success() {
  return (
    <div className="flex justify-center flex-col items-center gap-8 mt-48 md:mt-24 ">
      {/* Success Icon */}
      <div className="relative w-24 h-24">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#32D583"
            strokeWidth="8"
            fill="none"
            strokeDasharray="290, 60"
            strokeLinecap="round"
            strokeDashoffset="70"
          />
        </svg>

        {/* Check icon */}
        <div className="absolute -top-2 -right-1 rounded-full p-1">
          <FontAwesomeIcon
            icon={faCheck}
            className="text-[#32D583] h-16 w-16"
          />
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center w-full max-w-md">
        {/* Success Message */}
        <h1 className="text-xl font-semibold text-white">
          Your request has been sent <br /> successfully
        </h1>

        {/* View Collections Button */}
        <div className="my-4 flex justify-center text-[14px]">
          <Link to="/">
            {/* <CustomButton text="View | My Collections" /> */}
            <div className="flex items-center">
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
                  height: "2.7rem", // ~42.86px
                  borderStyle: "solid",
                  borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                }}
              ></div>

              {/* Main button area */}
              <div
                className="flex items-center bg-blue-700 font-bold justify-center text-white font-medium"
                style={{
                  width: "10.5rem", // ~168px
                  height: "2.5rem", // ~39.59px
                  // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                  border: "0.15rem solid #002AA8", // ~2.42px
                }}
              >
                View | My Collections
              </div>

              {/* Right angled border */}
              <div
                className="border-[#002AA8]"
                style={{
                  width: "0.5rem", // ~7.97px
                  height: "2.7rem", // ~42.86px
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
          </Link>
        </div>

        {/* Divider Line and Go Home Button together */}
        <div className="flex flex-col items-center">
          {/* Go Home Button */}
          <Link
            to="/"
            className="flex items-center justify-center no-underline hover:no-underline"
            style={{
              width: "146px",
              height: "42px",
              padding: "8px 2px",
              borderRadius: "4px",
              cursor: "pointer",
              boxSizing: "border-box",
              textDecoration: "none",
              backgroundColor: "transparent",
            }}
          >
            <img
              src={BackHome}
              alt="Back Home"
              style={{
                width: "24px",
                height: "17px",
                opacity: 1,
              }}
            />
            <span
              style={{
                marginLeft: "4px", // reduced space for tighter look
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "100%",
                textTransform: "capitalize",
                color: "white",
              }}
            >
              Go Home
            </span>
          </Link>
          {/* Divider Line */}
          <div className="w-1/3 bg-white h-0.5 mb-2"></div>
        </div>
      </div>
    </div>
  );
}

export default Success;
