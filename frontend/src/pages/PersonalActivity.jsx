import React from 'react';
import land1Image from "../assets/images/Overview/land1.jpg";
import ManImage from "../assets/images/Overview/man.png";
import overview1 from "../assets/images/Overview/overview1.jpg";
import { Link } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";
import NavLinks from '../Components/MarketPlaceCom/NavLinks';

function PersonalActivity() {
  return (
    <div className="min-h-screen bg-transparent px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mt-20 lg:mt-[92px]">
        
        {/* Hero Banner */}
        <div
          className="relative h-48 md:h-56 lg:h-[237px] w-full 
          bg-cover bg-top bg-no-repeat rounded-lg shadow-lg mb-16 lg:mb-24"
          style={{ backgroundImage: `url(${overview1})` }}
        >
          {/* Text Content */}
          <div className="absolute top-4 left-4 lg:top-[20px] lg:left-[48px] w-full lg:w-[902px] max-w-[90%]">
            <h1 className="font-inter font-semibold text-2xl md:text-3xl lg:text-[35px] leading-tight text-white mb-2">
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
          <div className="absolute bottom-4 left-4 lg:top-[185px] lg:left-[48px] w-full lg:w-[497px] flex flex-wrap gap-4 lg:gap-[18px]">
            {[
              { num: "5K", label: "Total Item" },
              { num: "50.5K", label: "Total Volume" },
              { num: "3.5K", label: "Listed" },
              { num: "2.6K", label: "Owners" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1">
                <h1 className="text-sm md:text-[16px] font-medium text-white">{stat.num}</h1>
                <p className="text-xs md:text-[12px] text-white">{stat.label}</p>
              </div>
            ))}
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
          <NavLinks/>

          {/* Search Bar */}
          <div className="hidden md:flex w-full lg:w-[550px] items-center gap-3 px-4 py-3 border border-white/50 rounded-[12px] bg-white/10 backdrop-blur-sm">
  <FiSearch className="text-white w-5 h-5 flex-shrink-0" />
  <input
    type="text"
    placeholder="Search..."
    className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none text-sm lg:text-[16px] font-inter"
  />
</div>
        </div>
      </div>

      {/* Activities Section */}
      <section className="max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 mb-16">
        
        {/* Section Title */}
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

        {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#00134C]">
  <table className="w-full min-w-[800px] text-white">
    <thead className="bg-[#00134C]">
      <tr className="text-left">
        {["Name", "Type", "Buyer", "Seller", "Price", "Time"].map((h, i) => (
          <th
            key={i}
            className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {/* Example Row with Full Image */}
      <tr className="border-b border-[#00134C] hover:bg-white/5 transition-colors">
        <td className="px-4 lg:px-6 py-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden">
              <img src={land1Image} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm lg:text-[18px] font-inter font-medium">Monkey Ape</span>
          </div>
        </td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">Buyer</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">You</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">Oxxy</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">$2,000</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">2d</td>
      </tr>

      {/* Example Row with Cropped Head Image */}
      <tr className="border-b border-[#00134C] hover:bg-white/5 transition-colors">
        <td className="px-4 lg:px-6 py-3">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden relative"
              style={{
                background: "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
              }}
            >
              <img
                src={ManImage}
                alt="Collection"
                className="w-full h-full object-cover object-top"
                style={{ objectPosition: "top" }} // focuses on head/face
              />
            </div>
            <span className="text-sm lg:text-[18px] font-inter font-medium">Monkey Ape</span>
          </div>
        </td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">Seller</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">Don</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">Don</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">$2,000</td>
        <td className="px-4 lg:px-6 py-3 text-sm lg:text-[18px] font-inter">2d</td>
      </tr>
    </tbody>
  </table>
</div>
      </section>
    </div>
  );
}

export default PersonalActivity;
