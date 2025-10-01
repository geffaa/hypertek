import React from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import popularCollections from "../../assets/images/popular/popolar.png";
import TVector from "../../assets/images/popular/vector.png";
import Profile from "../../assets/images/Profile/Profile.png";
import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";

function MarketPlace() {
  return ( 
    <>
      {/* Main Container */}
      <div className="min-h-screen bg-transparent">
        {/* Hero Section */}
        <div className="mx-auto mt-18 lg:mt-[92px]">
          <div className="w-full">
            {/* Hero Banner */}
            <div
              className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] xl:h-[300px] 2xl:h-[360px] 
                         w-full bg-cover bg-center bg-no-repeat mb-20 md:mb-24"
              style={{ backgroundImage: `url(${overview1})` }}
            ></div>

            {/* Profile Content Section */}
            <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32">
              <div className="flex flex-col items-center sm:items-start">
                {/* Profile Image */}
                <div className="relative">
                  <img
                    src={Profile}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 
                               rounded-full shadow-lg -mt-12 sm:-mt-16 md:-mt-16"
                  />
                </div>

                {/* Profile Info */}
                <div className="mt-3 text-center sm:text-left text-white">
                  <h2 className="text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-semibold">
                    Lana Kim
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-400 break-words">
                    0xc416a645...b21a{" "}
                    <Link to="/edit">
                      <span className="ml-1 sm:ml-2 cursor-pointer underline">
                        Edit Profile
                      </span>
                    </Link>
                  </p>
                  <p className="text-green-400 font-semibold mt-1 text-sm sm:text-base md:text-lg xl:text-xl">
                    $3000
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and Search Section */}
          <div
            className="relative flex flex-col lg:flex-row justify-between items-start 
                       lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8 xl:px-12 2xl:px-24"
          >
            <NavLinks />
          </div>
        </div>

        {/* NFA Section */}
        <section className="mx-auto flex flex-col gap-6 lg:gap-2 mb-2 px-2 sm:px-12 xl:px-20 2xl:px-32 relative z-10 lg:mb-2">
          <GlowingOrb Xaxis={800} Yaxis={100} />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 justify-center">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg shadow-md text-white p-4 z-10 
                           w-full max-w-sm mx-auto lg:max-w-none 
                           h-[380px] lg:h-[400px] xl:h-[420px] 2xl:h-[450px] 
                           flex flex-col justify-between"
              >
                <div
                  className="w-full h-32 lg:h-[160px] xl:h-[180px] 2xl:h-[200px] 
                             overflow-hidden rounded-[19px] 
                             bg-gradient-to-b from-[#977C34] to-[#493F26]"
                >
                  <img
                    src={popularCollections}
                    alt="Collection"
                    className="w-full h-full object-cover object-top scale-x-[-1]"
                  />
                </div>
                <h2 className="text-base lg:text-lg xl:text-xl font-bold mt-3 lg:mt-4">
                  Monkey Ape
                </h2>
                <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
                  <h3 className="text-xs lg:text-sm xl:text-base font-semibold">No33 🔥</h3>
                  <div className="flex items-center">
                    <img
                      src={TVector}
                      alt=""
                      className="w-2 h-2 lg:w-[10px] lg:h-[9px] xl:w-[12px] xl:h-[12px]"
                    />
                    <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm xl:text-base font-semibold">
                      $2,000
                    </h3>
                  </div>
                </div>
                <div className="flex justify-center">No Listing</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default MarketPlace;
