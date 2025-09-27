import React from 'react'
import overview1 from "../assets/images/Overview/overview1.jpg";
import { Link } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";


function NoPersonalActivity() {
  return (
    <>
    
    <div className='min-h-screen bg-transparent px-4 sm:px-6 lg:px-8'>

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
              leading-tight text-white mb-2 lg:mb-0"
            >
              A New Era Dawns in Hyper Tek
            </h1>
            <p
              className="font-inter font-medium text-sm md:text-base lg:text-[18px] 
              leading-relaxed text-white"
            >
              It's the start of a living, breathing universe where every decision
              shapes the journey. Whether you're racing at light speed, forging
              alliances in the Overlord Realm, or uncovering secrets in HyperQuest,
              this is your chance to leave your mark on the story.
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
          <div className="w-full lg:w-auto">
            <ul className="flex flex-wrap gap-4 lg:gap-[50px] justify-center lg:justify-start">
              <li>
                <Link
                  to="#"
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
                  to="#"
                  className="inline-flex items-center justify-center px-4 py-2 lg:px-[10px] lg:py-[4px]
                  rounded-[10px] text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10
                  transition-colors whitespace-nowrap"
                >
                  Lands
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="inline-flex items-center justify-center px-4 py-2 lg:px-[12px] lg:py-[4px]
                  rounded-[10px] text-white font-inter font-medium text-sm lg:text-[18px] hover:bg-white/10
                  transition-colors whitespace-nowrap"
                >
                  Activities
                </Link>
              </li>
            </ul>
          </div>

          {/* Search Field */}
          <div
            className="w-full lg:w-[550px] flex items-center gap-3 lg:gap-[17px] 
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

    </div>
    
    </>
  )
}

export default NoPersonalActivity