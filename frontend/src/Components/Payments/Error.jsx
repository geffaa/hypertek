import React from "react";
import BackHome from "../../assets/images/backhome.png";
import { Link } from "react-router-dom";

function Error() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center bg-transparent"
      style={{
        width: "248px",
        height: "208px",
        position: "absolute",
        top: "140px",
        left: "596px",
        borderRadius: "30px",
      }}
    >
      {/* Bold Red cross icon */}
      <div className="flex items-center justify-center border-4 border-red-500 rounded-[50%] w-24 h-24 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      {/* Error Message */}
      <h3 className="text-white text-lg font-medium mb-6 leading-tight">
        Your request was not <br /> successful
      </h3>

      {/* Go Home Button */}
      <Link 
        to="/payment"
        className="flex items-center justify-center no-underline hover:no-underline"
        style={{
          width: "146px",
          height: "42px",
        
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          boxSizing: "border-box",
          textDecoration: "none",
        }}
      >
        {/* Icon */}
        <img
          src={BackHome}
          alt="Back Home"
          style={{
            width: "24px",
            height: "17px",
            opacity: 1,
          }}
        />

        {/* Text */}
        <span
          style={{
            marginLeft: "8px",
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

      <div className="w-1/2 bg-white h-1">

      </div>
    </div>
  );
}

export default Error;