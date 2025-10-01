import React from "react";
import land1Image from "../../assets/images/Overview/land1.jpg";
import ManImage from "../../assets/images/Overview/man.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import NavLinks from "../ProfileSection/Navlinks";
import Profile from "../../assets/images/Profile/Profile.png";
import GlowingOrb from "../Common/BgColoring";

function PersonalActivity() {
  return (
    <div className=" bg-transparent ">
      {/* Hero Section */}
      <div className=" mx-auto mt-20 lg:mt-[92px]">
        <div className="w-full">
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

        {/* Navigation and Search */}
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          {/* Nav Links
          <ul className="flex flex-wrap gap-4 lg:gap-[50px] justify-center lg:justify-start">
            <li>
              <Link
                to="/market-place"
                className="px-4 py-2 lg:px-[14px] lg:py-[4px] rounded-[10px] 
                 text-white font-inter font-semibold text-sm lg:text-[16px]"
              >
                Overview
              </Link>
            </li>
            <li>
              <Link
                to="/nfa-expand"
                className="px-4 py-2 lg:px-[14px] lg:py-[4px] rounded-[10px] 
                text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10 transition-colors"
              >
                Collectibles
              </Link>
            </li>
            <li>
              <Link
                to="/land"
                className="px-4 py-2 lg:px-[10px] lg:py-[4px] rounded-[10px] 
                text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10 transition-colors"
              >
                Lands
              </Link>
            </li>
            <li>
              <Link
                to="/personal-activity"
                className="px-4 py-2 lg:px-[12px] lg:py-[4px] rounded-[10px] 
                text-white bg-[#002AA8] font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10 transition-colors"
              >
                Activities
              </Link>
            </li>
          </ul> */}
          <NavLinks />
        </div>
      </div>

      {/* Activities Section */}
      <section className=" mx-auto flex flex-col gap-6 lg:gap-8 mb-16 px-6 sm:px-12 xl:px-18 2xl:px-32 ">
        <GlowingOrb Xaxis={920} Yaxis={600}/>
        {/* Table */}
        <div className="overflow-x-auto rounded-lg z-10 ">
          <table className="w-full min-w-[800px] text-white">
            <thead className="bg-[#00134C]">
              <tr className="text-left">
                {["Listing", "Status", "Price", "Floor", "Qty", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {/* Example Row with Cropped Head Image */}
              <tr className="border-b border-[#00134C] hover:bg-white/5 transition-colors">
                <td className="px-4 lg:px-6 py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden relative"
                      style={{
                        background:
                          "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
                      }}
                    >
                      <img
                        src={ManImage}
                        alt="Collection"
                        className="w-full h-full object-cover object-top"
                        style={{ objectPosition: "top" }} // focuses on head/face
                      />
                    </div>
                    <span className="text-sm lg:text-[18px] font-inter font-medium">
                      Monkey Ape
                    </span>
                  </div>
                </td>

                {/* ✅ Status (default Active, green badge with dot) */}
                <td className="px-4 lg:px-6 py-3">
                  <span className="flex items-center gap-2 px-3 py-1 rounded-md text-green-400 text-xs font-medium">
                    {/* Green Dot */}
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Active
                  </span>
                </td>

                <td className="px-4 lg:px-6 py-3">$2,000</td>
                <td className="px-4 lg:px-6 py-3">$2,000</td>
                <td className="px-4 lg:px-6 py-3">01</td>

                {/* ✅ Custom Checkbox */}
                <td className="px-4 lg:px-6 py-3">
                  <input
                    type="checkbox"
                    className="
    w-4 h-4 
    appearance-none 
    border-2 border-blue-500 rounded 
    bg-transparent 
    cursor-pointer
    checked:border-blue-500 
    checked:bg-blue-500
    checked:before:content-['✔'] 
    checked:before:text-white 
    checked:before:block 
    checked:before:text-center 
    checked:before:leading-4 
    checked:before:text-xs 
  "
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default PersonalActivity;
