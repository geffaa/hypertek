import React, { useState, useEffect } from "react";
import overview1 from "../assets/images/Overview/overview1.jpg";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import popularCollections from "../assets/images/popular/popolar.png";
import TVector from "../assets/images/popular/vector.png";
import CustomButton from "../Components/Buttons/Button1";
import CustomButton4 from "../Components/Buttons/Button4";
import land1Image from "../assets/images/Overview/land1.jpg";
import ManImage from "../assets/images/Overview/man.png";
import { ArrowRight } from "lucide-react";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import GlowingOrb from "../Components/Common/BgColoring";
import FullScreenLoader from "../Components/Common/Spinner";
import axios from "axios";

import { BACKEND_BASE_URL } from "../Config";

function MarketPlace() {
  const [marketData, setMarketData] = useState([]); // NFA (characters)
  const [landData, setLandData] = useState([]); // LAND
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  const staticActivityData = [
    {
      name: "Land #123",
      type: "Land",
      buyer: "Alice",
      seller: "Bob",
      price: 500,
      time: "2025-12-20T12:00:00Z",
    },
    {
      name: "NFA #456",
      type: "NFA",
      buyer: "Charlie",
      seller: "Dave",
      price: 250,
      time: "2025-12-21T09:30:00Z",
    },
    {
      name: "Land #789",
      type: "Land",
      buyer: "Eve",
      seller: "Frank",
      price: 1000,
      time: "2025-12-21T08:00:00Z",
    },
  ];

  // Fetch parent collections and their sub-collections
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        // Fetch parent collections
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/parent-collections`
        );
        
        console.log("Parent Collections Response:", res.data);
        
        if (res.data.success) {
          const parentCollections = res.data.nfts || res.data.collections;
          
          console.log("Parent Collections:", parentCollections);
          
          // Group sub-collections by category
          const categoriesMap = {};

          // Fetch sub-collections for each parent
          for (const parent of parentCollections) {
            console.log(`Fetching sub-collections for parent: ${parent._id}, category: ${parent.category}`);
            
            try {
              const subRes = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );

              console.log(`Sub-collections response for ${parent._id}:`, subRes.data);

              if (subRes.data.success && subRes.data.subCollections) {
                const subCollections = subRes.data.subCollections;
                const category = (parent.category || "other").toLowerCase();

                if (!categoriesMap[category]) {
                  categoriesMap[category] = [];
                }

                // Add to category with parent info
                categoriesMap[category].push(...subCollections.map(sub => ({
                  ...sub,
                  parentId: parent._id,
                  parentCategory: parent.category
                })));
              }
            } catch (subError) {
              console.error(`Error fetching sub-collections for parent ${parent._id}:`, subError);
              console.error("Error details:", subError.response?.data);
            }
          }

          console.log("Final Categories Map:", categoriesMap);

          // For backward compatibility, set marketData to "characters" and landData to "land"
          setMarketData(categoriesMap["characters"] || []);
          setLandData(categoriesMap["land"] || []);
          
          // Store all categories for dynamic rendering
          setActivityData(Object.entries(categoriesMap));
        } else {
          console.error("Failed to fetch parent collections:", res.data.message);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        console.error("Error details:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  console.log("NFA Data:", marketData);
  console.log("LAND Data:", landData);
  console.log("Activity Data:", activityData);

  const getDaysAgo = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - created.getTime();
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
          <div className="mt-20 lg:mt-[92px] px-4 sm:px-6 md:px-8 max-w-[1450px] mx-auto">
            <div className="mt-20 lg:mt-[92px]">
              <div
                className="relative h-60 md:h-72 lg:h-[280px] w-[1500px] max-w-full bg-cover bg-no-repeat shadow-lg mb-24"
                style={{
                  backgroundImage: `
      linear-gradient(
        to right,
        rgba(0, 0, 0, 0.85) 0%,
        rgba(0, 0, 0, 0.55) 40%,
        rgba(0, 0, 0, 0.15) 65%,
        rgba(0, 0, 0, 0) 100%
      ),
      url(${overview1})
    `,
                  backgroundPosition: "50% 8.5%",
                  backgroundSize: "cover",
                }}
              >
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
                    speed, forging alliances in the Overlord Realm, or
                    uncovering secrets in HyperQuest, this is your chance to
                    leave your mark on the story.
                  </p>
                </div>

                <div className="absolute bottom-6 left-4 lg:top-[185px] lg:left-[48px] w-full lg:w-[497px] flex flex-wrap gap-4 lg:gap-[18px]">
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

              <div className="relative flex md:px-8 px-2 flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8">
                <NavLinks />
                <div className="hidden mr-16 md:flex lg:w-[550px] items-center gap-3 lg:gap-[17px] px-4 lg:px-[16px] py-3 lg:py-[12px] border border-white/50 rounded-[12px] backdrop-blur-sm">
                  <FiSearch className="text-white w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="flex-1 bg-transparent pl-1 text-white placeholder-gray-300 outline-none text-sm lg:text-[16px] font-inter w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Collections Section */}
          <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-6 md:px-8">
            <div className="md:px-8 px-5">
              {/* DYNAMIC CATEGORIES SECTIONS */}
              {activityData && activityData.length > 0 ? (
                activityData.map(([categoryName, items]) => (
                  <section 
                    key={categoryName}
                    className="flex flex-col mt-5 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 sm:px-3 md:px-8 lg:px-0"
                  >
                    <div className="flex flex-row justify-between items-center gap-3 sm:gap-4">
                      <div className="flex flex-col gap-2 items-start">
                        <h1 className="text-white uppercase text-lg sm:text-2xl lg:text-[30px] font-goldman font-bold">
                          {categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1)}
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
                          to={`/collections/${categoryName}`}
                          className="flex items-center gap-1 sm:gap-2 hover:text-gray-300 transition text-xs sm:text-sm md:text-base"
                        >
                          <span>Explore All</span>
                          <ArrowRight
                            size={16}
                            className="sm:w-5 sm:h-5"
                            strokeWidth={2}
                          />
                        </Link>
                      </div>
                    </div>

                    {/* DESKTOP & TABLET GRID */}
                    <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center mt-4">
                      {items && items.length > 0 ? (
                        items.slice(0, 4).map((item, index) => (
                          <div
                            key={item._id || index}
                            className="relative rounded-[18px] shadow-md text-white p-5 w-full max-w-sm mx-auto lg:max-w-none h-[420px] flex flex-col"
                            style={{
                              background:
                                "linear-gradient(147.75deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                            }}
                          >
                            <div className="w-full h-[210px] overflow-hidden rounded-[16px] bg-gradient-to-b from-[#977C34] to-[#493F26]">
                              <img
                                src={
                                  item.image
                                    ? `${BACKEND_BASE_URL}${item.image}`
                                    : popularCollections
                                }
                                alt={item.name || "Collection"}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <h2 className="text-base lg:text-lg font-bold md:mt-3 lg:mt-4 text-left">
                              {item.name || "Unnamed"}
                            </h2>
                            <div className="flex justify-between items-center md:mb-3 lg:mb-4 md:mt-4 lg:mt-5">
                              <h3 className="text-xs lg:text-sm font-semibold">
                                {item.symbol || item._id?.slice(0, 6) || "N/A"} 🔥
                              </h3>
                              <div className="flex items-center">
                                <img
                                  src={TVector}
                                  alt=""
                                  className="w-2 h-2 lg:w-[10px] lg:h-[9px]"
                                />
                                <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">
                                  {item.priceETH || ""} ETH
                                </h3>
                              </div>
                            </div>
                            <div className="flex justify-center items-center mt-4">
                              <Link
                                to="/buy-nfa"
                                state={{ item }}
                                className="w-full flex justify-center"
                              >
                                <CustomButton text="Buy Now" />
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-white py-8">
                          No {categoryName} available
                        </div>
                      )}
                    </div>

                    {/* MOBILE GRID */}
                    <div className="sm:hidden grid grid-cols-2 gap-4 mt-4 pb-4">
                      {items && items.length > 0 ? (
                        items.slice(0, 4).map((item, index) => (
                          <div
                            key={item._id || index}
                            className="relative rounded-[16px] p-3 text-white flex flex-col h-[360px]"
                            style={{
                              background:
                                "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                            }}
                          >
                            <div
                              className="h-[150px] rounded-[14px] overflow-hidden"
                              style={{
                                background:
                                  "linear-gradient(180deg, #9B7C2F 0%, #4A3E22 100%)",
                              }}
                            >
                              <img
                                src={
                                  item.image
                                    ? `${BACKEND_BASE_URL}${item.image}`
                                    : popularCollections
                                }
                                alt={item.name || "Collection"}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <h2 className="text-[14px] font-semibold mt-4 truncate">
                              {item.name || "Unnamed"}
                            </h2>

                            <div className="flex justify-between items-center mt-3 text-[11px]">
                              <span className="text-gray-300 font-medium truncate">
                                {item.symbol || item._id?.slice(0, 6) || "N/A"} 🔥
                              </span>

                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                                  <img src={TVector} alt="" className="w-3 h-3" />
                                </div>
                                <span className="font-semibold truncate">
                                  {item.priceETH || ""} ETH
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-center items-center mt-10">
                              <Link to="/buy-nfa" state={{ item }}>
                                <CustomButton4
                                  text="Buy Now"
                                  className="!text-xs !py-2 !px-6"
                                />
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-white py-8">
                          No {categoryName} available
                        </div>
                      )}
                    </div>
                  </section>
                ))
              ) : (
                <div className="text-center text-white py-12">
                  <p>No collections available</p>
                </div>
              )}

              {/* ------------------------------------------ activity section ---------------------------------- */}
              <section className="w-full flex relative z-10 justify-center mb-16 lg:mb-24 px-4 sm:px-6 md:px-8 lg:px-0">
                <GlowingOrb Xaxis={830} Yaxis={300} />
                <div className="w-full flex flex-col gap-6 lg:gap-8">
                  {/* Header */}
                  <div className="flex flex-col gap-2 items-start">
                    <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
                      ACTIVITIES
                    </h1>
                    {/* Decorative lines */}
                    <div className="flex gap-2 mt-1">
                      <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
                      <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
                      <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
                      <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-lg w-full">
                    <table className="w-full min-w-[800px] text-white">
                      <thead className="bg-[#00134C]">
                        <tr className="text-left">
                          {[
                            "Name",
                            "Type",
                            "Buyer",
                            "Seller",
                            "Price",
                            "Time",
                          ].map((h, i) => (
                            <th
                              key={i}
                              className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[16px] font-inter font-medium"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {staticActivityData.map((item, i) => (
                          <tr
                            key={i}
                            className="transition-colors border-b border-[#0B2A6F]"
                          >
                            <td className="px-4 lg:px-6 py-3 align-middle">
                              <div className="flex items-center gap-3">
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
                                  />
                                </div>
                                <span className="text-sm lg:text-[16px] font-inter font-medium">
                                  {item.name}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 lg:px-6 py-3 text-sm lg:text-[16px] font-inter font-normal align-middle">
                              {item.type}
                            </td>

                            <td className="px-4 lg:px-6 py-3 text-sm lg:text-[16px] font-inter font-normal align-middle">
                              {item.buyer}
                            </td>

                            <td className="px-4 lg:px-6 py-3 text-sm lg:text-[16px] font-inter font-normal align-middle">
                              {item.seller}
                            </td>

                            <td className="px-4 lg:px-6 py-3 text-sm lg:text-[16px] font-inter font-normal align-middle">
                              {item.price}
                            </td>

                            <td className="px-4 lg:px-6 py-3 text-sm lg:text-[16px] font-inter font-normal align-middle">
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