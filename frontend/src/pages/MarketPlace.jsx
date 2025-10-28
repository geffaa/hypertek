import React, { useState, useEffect } from "react";
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
import FullScreenLoader from "../Components/Common/Spinner";
import axios from "axios";

import { BACKEND_BASE_URL } from "../Config";

function MarketPlace() {
  //// get the nfa data
  const [marketData, setMarketData] = useState([]);
  const [landData, setLandketData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  // get the market data here
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true); // ✅ Start loading

      try {
        /// get the land , market and activity through
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/market/getMarket`
        );
        const landres = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/land/getLand`
        );
        const activity = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/activity/getActivity`
        );
        console.log("your activity data in the console :", activity);
        if (res.data?.data) setMarketData(res.data.data);
        if (landres.data?.data) setLandketData(landres.data.data);
        if (activity.data) setActivityData(activity.data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false); // ✅ Stop loading after fetch
      }
    };

    fetchMarketData();
  }, []); // run once when component mounts

  console.log("your market data are here :", marketData);
  console.log("your land  data are here :", landData);
  console.log("your activity  data are here :", activityData);

  /// convert the date to days only
  const getDaysAgo = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();

    // Difference in milliseconds
    const diffInMs = now.getTime() - created.getTime();

    // If the time is in the future, return "0d"
    if (diffInMs < 0) return "0d";

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return `${diffInDays}d`;
  };

  return (
    <>
      {loading ? (
        <FullScreenLoader />
      ) : (
        <div className="min-h-screen bg-transparent relative z-10 ">
          {/* Hero Section */}

          {/* Hero Section */}
          <div className="mt-20 lg:mt-[92px] px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto">
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
                    speed, forging alliances in the Overlord Realm, or
                    uncovering secrets in HyperQuest, this is your chance to
                    leave your mark on the story.
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
                      <h1 className="text-sm md:text-[16px] md:w-[86px] font-medium text-white">
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
                className="relative flex md:px-8 px-2 flex-col lg:flex-row justify-between items-start 
            lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8"
              >
                <NavLinks />

                {/* Search Field */}
                <div
                  className="hidden md:flex lg:w-[550px] items-center gap-3 lg:gap-[17px] 
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

          {/* ------------------------------------ NFA Section -----------------------------------  */}

          <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-6 md:px-8">
            <div className="md:px-8 px-5">
              <section className="flex flex-col mt-5 gap-6 lg:gap-4 mb-4 lg:mb-6  sm:px-3 md:px-8 lg:px-0">
                {/* Header */}
                <div className="flex flex-row justify-between items-center gap-4">
                  <div className="flex flex-col gap-2 items-start">
                    <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
                      NFA
                    </h1>
                    <div className="flex gap-2">
                      <div className="h-[3px] md:w-8 w-3 lg:w-12 bg-white"></div>
                      <div className="h-[3px] md:w-12 w-3 lg:w-20 bg-white"></div>
                      <div className="h-[3px] md:w-6 w-3 lg:w-8 bg-white"></div>
                      <div className="h-[3px] md:w-20 w-8 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
                    </div>
                  </div>

                  <div className="flex justify-end items-center text-white">
                    <Link
                      to="/nfa-expand"
                      className="flex items-center gap-2 hover:text-gray-300 transition"
                    >
                      <span>Explore All</span>
                      <ArrowRight size={20} strokeWidth={2} />
                    </Link>
                  </div>
                </div>

                {/* Cards Grid */}

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center mt-4">
                  {marketData.slice(0, 4).map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
  lg:max-w-none h-[320px] lg:h-[400px] flex flex-col justify-between"
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
                      <h2 className="text-base lg:text-lg font-bold md:mt-3 lg:mt-4 text-left">
                        {item.title}
                      </h2>

                      {/* Stats */}
                      <div className="flex justify-between items-center md:mb-3 lg:mb-4 md:mt-4 lg:mt-5">
                        <h3 className="text-xs lg:text-sm font-semibold">
                          {item.serialNumber} 🔥
                        </h3>
                        <div className="flex items-center">
                          <img
                            src={TVector}
                            alt=""
                            className="w-2 h-2 lg:w-[10px] lg:h-[9px]"
                          />
                          <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">
                            ${item.price}
                          </h3>
                        </div>
                      </div>

                      {/* Button (Centered) */}
                      <div className=" flex justify-center items-center">
                        <Link
                          to="/buy-nfa"
                          state={{ item }}
                          className="w-full flex justify-center"
                        >
                          <CustomButton text="Buy Now" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ------------------------------------- Land Section -----------------------------  */}
              <section className="flex flex-col gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16  sm:px-6 md:px-8 lg:px-0">
                {/* Header */}
                <div className="flex flex-row justify-between items-center gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2 items-start">
                    <h1 className="text-white uppercase text-lg sm:text-2xl lg:text-[30px] font-goldman font-bold">
                      LAND
                    </h1>
                    <div className="flex gap-1 sm:gap-2">
                      <div className="h-[3px] md:w-6 sm:w-3 lg:w-12 bg-white"></div>
                      <div className="h-[3px] w-8 sm:w-3 lg:w-20 bg-white"></div>
                      <div className="h-[3px] w-4 sm:w-3 lg:w-8 bg-white"></div>
                      <div className="h-[3px] w-12 sm:w-8 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
                    </div>
                  </div>

                  <div className="flex justify-end items-center text-white">
                    <Link
                      to="/market-place"
                      className="flex items-center gap-1 sm:gap-2 hover:text-gray-300 transition text-xs sm:text-sm md:text-base"
                    >
                      <span>Expand All</span>
                      <ArrowRight
                        size={16}
                        className="sm:w-5 sm:h-5"
                        strokeWidth={2}
                      />
                    </Link>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 justify-center mt-3 sm:mt-4">
                  {landData.slice(0.4).map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
  lg:max-w-none h-[320px] lg:h-[400px] flex flex-col justify-between"
                    >
                      {/* Image */}
                      <div
                        className="w-full h-28 sm:h-32 lg:h-[160px] overflow-hidden rounded-[19px] 
          bg-gradient-to-b from-[#977C34] to-[#493F26]"
                      >
                        <img
                          src={land1Image}
                          alt="Land Collection"
                          className="w-full h-full object-cover object-top scale-x-[-1]"
                        />
                      </div>

                      {/* Title */}
                      <h2 className="text-sm sm:text-base lg:text-lg font-bold mt-2 sm:mt-3 lg:mt-4">
                        {item.title}
                      </h2>

                      {/* Stats */}
                      <div className="flex justify-between items-center mb-2 sm:mb-3 lg:mb-4 mt-3 sm:mt-4 lg:mt-5">
                        <h3 className="text-xs sm:text-sm font-semibold">
                          {item.serialNumber} 🔥
                        </h3>
                        <div className="flex items-center">
                          <img
                            src={TVector}
                            alt=""
                            className="w-2 h-2 lg:w-[10px] lg:h-[9px]"
                          />
                          <h3 className="pl-1 sm:pl-2 text-xs sm:text-sm font-semibold">
                            ${item.price}
                          </h3>
                        </div>
                      </div>

                      {/* Button (with side space) */}
                      {/* Button (smaller & centered with spacing) */}
                      <div className="mt-6 flex justify-center items-center px-4 sm:px-6 lg:px-8">
                        <Link
                          to="/buy-land"
                          state={{ item }}
                          className="cursor-pointer flex justify-center w-full"
                        >
                          <CustomButton
                            text="Buy Now"
                            className="!text-xs sm:!text-sm lg:!text-base !py-1.5 sm:!py-2 lg:!py-2.5 !px-4 sm:!px-6 lg:!px-8"
                          />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ------------------------------------------ activity section ----------------------------------  */}
              <section className="w-full flex relative z-10 justify-center mb-16 lg:mb-24 px-4 sm:px-6 md:px-8 lg:px-0">
                <GlowingOrb Xaxis={830} Yaxis={300} />
                <div className=" w-full flex flex-col gap-6 lg:gap-8">
                  {/* Header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex flex-col gap-3 w-full">
                      {/* Header Row */}
                      <div className="flex justify-between items-center w-full">
                        {/* Left Side - Title & Lines */}
                        <div className="flex flex-col items-start">
                          <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
                            ACTIVITIES
                          </h1>

                          {/* Decorative lines only on the left */}
                          <div className="flex gap-2 mt-1">
                            <div className="h-[3px] w-4 md:w-8 lg:w-12 bg-white"></div>
                            <div className="h-[3px] w-4 md:w-12 lg:w-20 bg-white"></div>
                            <div className="h-[3px] w-4 md:w-6 lg:w-8 bg-white"></div>
                            <div className="h-[3px] w-8 md:w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
                          </div>
                        </div>

                        {/* Right Side - Link */}
                        {/* <Link
      to="/nfa-land"
      className="flex items-center gap-1 sm:gap-2 text-white hover:text-gray-300 transition text-xs sm:text-sm md:text-base mt-2 sm:mt-0"
    >
      <span>Expand All</span>
      <ArrowRight size={16} className="sm:w-5 sm:h-5" strokeWidth={2} />
    </Link> */}
                      </div>
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
                        {activityData.slice(0.5).map((item, i) => (
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
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                              {item.type}
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                              {item.buyer}
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                              {item.seller}
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                              ${item.price}
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] align-top">
                              {getDaysAgo(item.time)}
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
        </div>
      )}
    </>
  );
}

export default MarketPlace;
