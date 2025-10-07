import React from "react";
import overview1 from "../assets/images/Overview/overview1.jpg";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import popularCollections from "../assets/images/popular/popolar.png";
import TVector from "../assets/images/popular/vector.png";
import CustomButton from "../Components/Buttons/Button1";
import land1Image from "../assets/images/Overview/land1.jpg";
import ManImage from "../assets/images/Overview/man.png";
import { ArrowRight } from "lucide-react";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import GlowingOrb from "../Components/Common/BgColoring";

function MarketPlace() {
  return (
    <>
      {/* Main Container */}
      <div className="min-h-screen bg-transparent relative z-10 ">

        {/* Hero Section */}
        <div className=" mt-20 lg:mt-[92px]">
          {/* Hero Banner */}
          <div
            className="relative h-56 md:h-56 lg:h-[237px] w-full 
            bg-cover bg-top bg-no-repeat  shadow-lg mb-24 lg:mb-24"
            style={{ backgroundImage: `url(${overview1})` }}
          >
            {/* Text Content */}
            <div
              className="absolute top-4 left-4 lg:top-[20px] lg:left-[48px] 
              w-full lg:w-[902px] max-w-[90%] lg:max-w-none"
            >
              <h1
                className="font-inter font-semibold text-2xl md:text-3xl lg:text-[35px] 
                leading-tight text-white mt-3 mb-4 lg:mb-"
              >
                A New Era Dawns in Hyper Tek
              </h1>
              <p
                className="font-inter font-medium text-sm hidden md:block md:text-base lg:text-[18px] 
                leading-relaxed text-white"
              >
                It's the start of a living, breathing universe where every
                decision shapes the journey. Whether you're racing at light
                speed, forging alliances in the Overlord Realm, or uncovering
                secrets in HyperQuest, this is your chance to leave your mark on
                the story.
              </p>
            </div>

            {/* Stats Section */}
            <div
              className="absolute bottom-4 left-4 lg:top-[185px] lg:left-[48px] 
              w-full lg:w-[497px] flex flex-wrap gap-4 lg:gap-[18px]"
            >
              {[
                { num: "5K", label: "Total Item" },
                { num: "50.5K", label: "Total Volume" },
                { num: "3.5K", label: "Listed" },
                { num: "2.6K", label: "Owners" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <h1 className="text-sm md:text-[16px] font-medium text-white">
                    {stat.num}
                  </h1>
                  <p className="text-xs md:text-[12px] font-normal text-white">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation and Search Section */}
          <div
            className="relative flex md:px-8 px-4 flex-col lg:flex-row justify-between items-start 
            lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8"
          >
            {/* Nav Links */}
            {/* <div className="w-full lg:w-auto">
              <ul className="flex flex-wrap gap-4 lg:gap-[50px] justify-center lg:justify-start">
                <li>
                  <Link
                    to="/market-place"
                    className="inline-flex items-center justify-center px-4 py-2 lg:px-[14px] lg:py-[4px]
                    rounded-[10px] bg-[#002AA8] text-white font-inter font-semibold 
                    text-sm lg:text-[16px] whitespace-nowrap"
                  >
                    Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="inline-flex items-center justify-center px-4 py-2 lg:px-[14px] lg:py-[4px]
                    rounded-[10px] text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10
                    transition-colors whitespace-nowrap"
                  >
                    Collectibles
                  </Link>
                </li>
                <li>
                  <Link
                    to="/land"
                    className="inline-flex items-center justify-center px-4 py-2 lg:px-[10px] lg:py-[4px]
                    rounded-[10px] text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10
                    transition-colors whitespace-nowrap"
                  >
                    Lands
                  </Link>
                </li>
                <li>
                  <Link
                    to="/personal-activity"
                    className="inline-flex items-center justify-center px-4 py-2 lg:px-[12px] lg:py-[4px]
                    rounded-[10px] text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10
                    transition-colors whitespace-nowrap"
                  >
                    Activities
                  </Link>
                </li>
              </ul>
            </div> */}
            <NavLinks />

            {/* Search Field */}
            <div
              className="md:w-full hidden md:d-block lg:w-[550px] flex items-center gap-3 lg:gap-[17px] 
              px-4 lg:px-[16px] py-3 lg:py-[12px] border border-white/50 rounded-[12px] 
              bg-white/10 backdrop-blur-sm"
            >
              <FiSearch className="text-white w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none 
                  text-sm lg:text-[16px] font-inter w-full"
              />
            </div>
          </div>
        </div>

        <div className="px-8">
          {/* NFA Section */}
        <section className="flex flex-col mt-5 gap-6 lg:gap-4 mb-4 lg:mb-6  sm:px-6 md:px-8 lg:px-0">
          {/* Header */}
        <div className="flex flex-row justify-between items-center gap-4">
  <div className="flex flex-col gap-2 items-start">
    <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
      NFA
    </h1>
    <div className="flex gap-2">
      <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
      <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
      <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
      <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
    </div>
  </div>

  <div className="flex justify-end items-center text-white">
    <Link to="/nfa-expand" className="flex items-center gap-2 hover:text-gray-300 transition">
      <span>Expand All</span>
      <ArrowRight size={20} strokeWidth={2} />
    </Link>
  </div>
</div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center mt-4">
  {[...Array(4)].map((_, index) => (
    <div
      key={index}
      className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
         lg:max-w-none h-[380px] lg:h-[400px] flex flex-col justify-between"
    >
      {/* Image */}
      <div
        className="w-full h-32 lg:h-[160px] overflow-hidden rounded-[19px] 
           bg-gradient-to-b from-[#977C34] to-[#493F26]"
      >
        <img
          src={popularCollections}
          alt="Collection"
          className="w-full h-full object-cover object-top scale-x-[-1]"
        />
      </div>

      {/* Title */}
      <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">
        Monkey Ape
      </h2>

      {/* Stats */}
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

      {/* Button */}
      <div className="mt-auto flex justify-center">
        <Link to="/buy-nfa" className="cursor-pointer w-full">
          <CustomButton text="Buy Now" />
        </Link>
      </div>
    </div>
  ))}
</div>
      
        </section>

        {/* LAND Section */}
    <section className="flex flex-col gap-6 lg:gap-8 mb-12 lg:mb-16 px-4 sm:px-6 md:px-8 lg:px-0">
  {/* Header */}
  <div className="flex flex-row justify-between items-center gap-4">
    <div className="flex flex-col gap-2 items-start">
      <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
        LAND
      </h1>
      <div className="flex gap-2">
        <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
        <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
        <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
        <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
      </div>
    </div>

    <div className="flex justify-end items-center text-white">
      <Link to="/buy-land" className="flex items-center gap-2 hover:text-gray-300 transition">
        <span>Expand All</span>
        <ArrowRight size={20} strokeWidth={2} />
      </Link>
    </div>
  </div>

  {/* Cards Grid */}
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center mt-4">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
          lg:max-w-none h-[380px] lg:h-[400px] flex flex-col justify-between"
      >
        {/* Image */}
        <div
          className="w-full h-32 lg:h-[160px] overflow-hidden rounded-[19px] 
             bg-gradient-to-b from-[#977C34] to-[#493F26]"
        >
          <img
            src={land1Image}
            alt="Land Collection"
            className="w-full h-full object-cover object-top scale-x-[-1]"
          />
        </div>

        {/* Title */}
        <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">
          Monkey Ape
        </h2>

        {/* Stats */}
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

        {/* Button */}
        <div className="mt-auto flex justify-center">
          <Link to="/buy-land" className="cursor-pointer w-full">
            <CustomButton text="Buy Now" />
          </Link>
        </div>
      </div>
    ))}
  </div>
</section>
        {/* ACTIVITIES Section */}
        <section className="w-full flex relative z-10 justify-center mb-16 lg:mb-24 px-4 sm:px-6 md:px-8 lg:px-0">
          <GlowingOrb Xaxis={830} Yaxis={300}/>
          <div className=" w-full flex flex-col gap-6 lg:gap-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex flex-col gap-2 items-start">
                <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
                  ACTIVITIES
                </h1>
                <div className="flex gap-2">
                  <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
                  <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
                  <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
                  <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
                </div>
              </div>

              <div className="flex justify-end items-center mt-2 sm:mt-0 text-white">
                <button className="flex items-center gap-2 hover:text-gray-300 transition">
                  <Link to="/nfa-land">
                  <span>Expand All</span>
                  <ArrowRight size={20} strokeWidth={2} />
                  </Link>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-[#00134C] mt-4 w-full">
              <table className="w-full min-w-full text-white">
                <thead className="bg-[#00134C]">
                  <tr className="text-left">
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium">
                      Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium">
                      Type
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium">
                      Buyer
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium">
                      Seller
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium">
                      Price
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#00134C] hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden relative"
                            style={{
                              background:
                                "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
                            }}
                          >
                            <img
                              src={i % 2 === 0 ? land1Image : ManImage}
                              alt="Collection"
                              className="w-full h-full object-cover object-top scale-x-[-1]"
                              style={{ objectPosition: "top" }}
                            />
                          </div>
                          <span className="text-sm lg:text-[18px] font-inter font-medium">
                            Monkey Ape
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                        {i % 2 === 0 ? "Buyer" : "Seller"}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                        You
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                        Oxxy
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                        $2,000
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                        2d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        </div>
      </div>
    </>
  );
}

export default MarketPlace;
