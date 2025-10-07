import React from 'react'
import { Link } from 'react-router-dom';
import { FiSearch } from "react-icons/fi"; 

import TVector from "../assets/images/popular/vector.png";
import overview1 from "../assets/images/Overview/overview1.jpg";
import popularCollections from "../assets/images/popular/popolar.png";
import CustomButton from '../Components/Buttons/Button1';
import Logo from "../assets/images/logo.png";
import land1Image from "../assets/images/Overview/land1.jpg";
import NavLinks from "../Components/MarketPlaceCom/NavLinks"


function Land() {
  return (
    <div className="min-h-screen bg-[#000000] px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mt-20 lg:mt-[92px]">
        {/* Hero Banner */}
        <div
          className="relative h-48 md:h-56 lg:h-[237px] w-full 
          bg-cover bg-top bg-no-repeat rounded-lg shadow-lg mb-16 lg:mb-24"
          style={{ backgroundImage: `url(${overview1})` }}
        >
          {/* Text Content */}
          <div
            className="absolute top-4 left-4 lg:top-[20px] lg:left-[48px] 
            w-full lg:w-[902px] max-w-[90%] lg:max-w-none"
          >
            <h1
              className="font-inter font-semibold text-2xl md:text-3xl lg:text-[35px] 
              leading-tight text-white mt-3 mb-2 lg:mb-0"
            >
              A New Era Dawns in Hyper Tek
            </h1>
           <p
  className="font-inter hidden md:block font-medium text-sm md:text-base lg:text-[18px] 
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
          className="relative flex flex-col lg:flex-row justify-between items-start 
          lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8"
        >
          {/* Nav Links */}
          <NavLinks/>
          {/* <div className="w-full lg:w-auto">
            <ul className="flex flex-wrap gap-4 lg:gap-[50px] justify-center lg:justify-start">
              <li>
                <Link
                  to="/market-place"
                  className="inline-flex items-center justify-center px-4 py-2 lg:px-[14px] lg:py-[4px]
                  rounded-[10px]  text-white font-inter font-semibold 
                  text-sm lg:text-[16px] whitespace-nowrap"
                >
                  Overview
                </Link>
              </li>
              <li>
                <Link
                  to="/nfa-expand"
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
                  rounded-[10px] bg-[#002AA8] text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10
                  transition-colors whitespace-nowrap"
                >
                  Lands
                </Link>
              </li>
              <li>
                <Link
                  to="/personal-activity"
                  className="inline-flex items-center justify-center px-4 py-2 lg:px-[12px] lg:py-[4px]
                  rounded-[10px]  text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10
                  transition-colors whitespace-nowrap"
                >
                  Activities
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Search Field */}
          <div
            className="w-full md:d-block hidden lg:w-[550px] flex items-center gap-3 lg:gap-[17px] 
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

      {/* NFA Section */}
    <section className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-8 mb-12 lg:mb-16">
  <div className="flex flex-col gap-2 items-start">
    <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
      Land
    </h1>
    <div className="flex gap-2">
      <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
      <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
      <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
      <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
    </div>
  </div>

  {/* First Row of Cards (with custom 1st card) */}
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
          lg:max-w-none h-[380px] lg:h-[400px] flex flex-col justify-between"
      >
        {index === 0 ? (
          // ✅ First card custom
          <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
            <img src={Logo} alt="logo image" className="w-20 h-20" />
            <h2 className="text-lg lg:text-xl font-bold my-2">Instant Sell</h2>
            <Link to="#">
              <CustomButton text="Sell Now" />
            </Link>
          </div>
        ) : (
          // ✅ Other cards same
          <>
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
            <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">Monkey Ape</h2>
            <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
              <h3 className="text-xs lg:text-sm font-semibold">No33 🔥</h3>
              <div className="flex items-center">
                <img src={TVector} alt="" className="w-2 h-2 lg:w-[10px] lg:h-[9px]" />
                <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">$2,000</h3>
              </div>
            </div>
            <div className="mt-auto flex justify-center">
              <Link to="/buy-land" className="cursor-pointer">
                <CustomButton text="Buy Now" />
              </Link>
            </div>
          </>
        )}
      </div>
    ))}
  </div>

  {/* Second Row of Cards */}
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
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
        <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">Monkey Ape</h2>
        <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
          <h3 className="text-xs lg:text-sm font-semibold">No33 🔥</h3>
          <div className="flex items-center">
            <img src={TVector} alt="" className="w-2 h-2 lg:w-[10px] lg:h-[9px]" />
            <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">$2,000</h3>
          </div>
        </div>
        <div className="mt-auto flex justify-center">
          <Link to="/nfa-expand" className="cursor-pointer">
            <CustomButton text="Buy Now" />
          </Link>
        </div>
      </div>
    ))}
  </div>

  {/* Third Row of Cards */}
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
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
        <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">Monkey Ape</h2>
        <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
          <h3 className="text-xs lg:text-sm font-semibold">No33 🔥</h3>
          <div className="flex items-center">
            <img src={TVector} alt="" className="w-2 h-2 lg:w-[10px] lg:h-[9px]" />
            <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">$2,000</h3>
          </div>
        </div>
        <div className="mt-auto flex justify-center">
          <Link to="/nfa-expand" className="cursor-pointer">
            <CustomButton text="Buy Now" />
          </Link>
        </div>
      </div>
    ))}
  </div>
</section>
    </div>
  );
}

export default Land;
