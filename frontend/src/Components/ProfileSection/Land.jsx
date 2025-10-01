import React from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import TVector from "../../assets/images/popular/vector.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import popularCollections from "../../assets/images/popular/popolar.png";
import CustomButton from "../../Components/Buttons/Button1";
import Logo from "../../assets/images/logo.png";
import land1Image from "../../assets/images/Overview/land1.jpg";
import NavLinks from "../ProfileSection/Navlinks"; // ✅ Import same as MarketPlace
import Profile from "../../assets/images/Profile/Profile.png";
import GlowingOrb from "../Common/BgColoring";

function Land() {
  return (
    <div className=" ">
      {/* Hero Section */}
      <div className="mx-auto mt-20 lg:mt-[92px]">
        <div className=" mx-auto">
          {/* Hero Banner */}
          <div
            className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] w-full
            bg-cover bg-top bg-no-repeat  mb-20 md:mb-24"
            style={{ backgroundImage: `url(${overview1})` }}
          ></div>

          {/* Profile Content Section */}
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col items-center sm:items-start">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={Profile}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-lg 
                  -mt-12 sm:-mt-16 md:-mt-16"
                />
              </div>

              {/* Profile Info */}
              <div className="mt-3 text-center sm:text-left text-white">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                  Lana Kim
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 break-words">
                  0xc416a645...b21a{" "}
                  <Link to="/edit">
                    <span className="ml-1 sm:ml-2 cursor-pointer underline">
                      Edit Profile
                    </span>
                  </Link>
                </p>
                <p className="text-green-400 font-semibold mt-1 text-sm sm:text-base md:text-lg">
                  $3000
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and Search Section */}
        <div
          className="relative flex flex-col lg:flex-row justify-between items-start 
          lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8"
        >
          {/* ✅ Reused NavLinks component */}
          <NavLinks />
        </div>
      </div>

      {/* Rest of Land Page */}
      <section className="  flex flex-col relative z-10 gap-4 px-6 sm:px-12 xl:px-18 2xl:px-32  lg:gap-8 mb-12 lg:mb-16">
        {/* Heading */}
        <GlowingOrb Xaxis={800} Yaxis={100} />

        {/* ✅ Cards Section same as before */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg z-10 shadow-md text-white p-4 w-full max-w-sm mx-auto 
    lg:max-w-none h-[380px] lg:h-[400px] flex flex-col justify-between"
            >
              <div
                className="w-full h-32 lg:h-[160px] overflow-hidden rounded-[19px] 
      bg-gradient-to-b from-[#977C34] to-[#493F26]"
              >
                <img
                  src={land1Image}
                  alt="Collection"
                  className="w-full h-full object-cover object-top scale-x-[-1]"
                />
              </div>

              <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">
                Monkey Ape
              </h2>

              <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
                <h3 className="text-xs lg:text-sm font-semibold">No33 🔥</h3>
                <div className="flex items-center">
                  <img
                    src={TVector}
                    alt=""
                    className="w-2 h-2 lg:w-[10px] lg:h-[9px]"
                  />
                  <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">
                    $2,000
                  </h3>
                </div>
              </div>

              <div className="mt-auto flex justify-center">Listing</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Land;
