import React from "react";
import { Link } from "react-router-dom";
import BackHome from "../../assets/images/backhome.png";

function Error() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen bg-[#0A0A0A] px-6">
      {/* Red Cross Icon */}
      <div className="flex items-center justify-center border-4 border-red-500 rounded-full w-20 h-20 sm:w-24 sm:h-24 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 sm:w-12 sm:h-12"
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
      <h3 className="text-white text-base sm:text-lg md:text-xl font-medium mb-6 leading-tight">
        Your request was not <br className="hidden sm:block" /> successful
      </h3>

      {/* Go Home Button */}
    <div className="flex flex-col items-center justify-center">
  {/* Go Home Button */}
  <Link
    to="/payment"
    className="flex items-center justify-center gap-2 bg-transparent hover:bg-gray-800 px-5 py-2 rounded-lg transition duration-200 w-fit"
  >
    <img
      src={BackHome}
      alt="Back Home"
      className="w-5 h-4 sm:w-6 sm:h-5"
    />
    <span className="font-inter font-medium text-white text-lg sm:text-xl">
      Go Home
    </span>
  </Link>

  {/* Divider Line */}
  <div className="mt-4 w-[calc(100%-2rem)] max-w-[180px] h-[1px] bg-gray-400"></div>
</div>


    </div>
  );
}

export default Error;
