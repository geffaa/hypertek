import React, { useState, useEffect } from "react";
import land1Image from "../assets/images/Overview/land1.jpg";
import ManImage from "../assets/images/Overview/man.png";
import overview1 from "../assets/images/Overview/overview1.jpg";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import axios from "axios";
import { BACKEND_BASE_URL } from "../Config"
import FullScreenLoader from "../Components/Common/Spinner"; // ✅ your loader



function PersonalActivity() {
  const [activityData, setActivityData] = useState([]);
      const [loading, setLoading] = useState(true); // ✅ loader state
  



const staticActivityData = [
  {
    name: "Monkey Ape",
    type: "Land",
    buyer: "John Doe",
    seller: "Jane Doe",
    price: 1800,
    time: new Date(), // fallback to current date
    image: null,      // optional, you can use land1Image
  },
  {
    name: "Crypto Kitty",
    type: "NFT",
    buyer: "Alice",
    seller: "Bob",
    price: 2500,
    time: new Date(),
    image: null,
  },
  {
    name: "Pixel Dragon",
    type: "Collectible",
    buyer: "Charlie",
    seller: "Dave",
    price: 3200,
    time: new Date(),
    image: null,
  },
];


useEffect(() => {
  const fetchMarketData = async () => {
    try {
      const activity = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/activity/getActivity`
      );
      console.log("API activity data:", activity.data);

      // if API data is empty, use static data
      if (activity.data && activity.data.length > 0) {
        setActivityData(activity.data);
      } else {
        setActivityData(staticActivityData);
      }
    } catch (error) {
      console.error("Error fetching activity data:", error);
      // fallback to static data if API fails
      setActivityData(staticActivityData);
    } finally {
      setLoading(false);
    }
  };

  fetchMarketData();
}, []);




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
if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10">
    {/* Hero Section */}
    <div className="mt-20 lg:mt-[92px] px-4 sm:px-6 md:px-8 max-w-[1450px] mx-auto">
      <div className="mt-20 lg:mt-[92px]">
        <div
          className="relative h-60 md:h-72 lg:h-[280px] w-[1500px] max-w-full bg-cover bg-no-repeat shadow-lg mb-24 rounded-lg"
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
            backgroundPosition: '50% 8.5%',
            backgroundSize: 'cover',
          }}
        >
          {/* Text Content */}
          <div className="absolute top-4 left-4 lg:top-[20px] lg:left-[48px] w-full lg:w-[902px] max-w-[90%]">
            <h1 className="font-inter font-semibold text-2xl md:text-3xl lg:text-[35px] leading-tight text-white mb-2">
              A New Era Dawns in Hyper Tek
            </h1>
            <p className="font-inter hidden md:block font-medium text-sm md:text-base lg:text-[18px] leading-relaxed text-white">
              It's the start of a living, breathing universe where every
              decision shapes the journey. Whether you're racing at light speed,
              forging alliances in the Overlord Realm, or uncovering secrets in
              HyperQuest, this is your chance to leave your mark on the story.
            </p>
          </div>
  
          {/* Stats Section */}
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
      </div>
    


        {/* Navigation and Search */}
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
   

      {/* Activities Section */}
   <section className="max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 mb-16 px-4 sm:px-6 lg:px-0">
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
        <div className="overflow-x-auto rounded-lg ">
          <table className="w-full min-w-[800px] text-white">
            <thead className="bg-[#00134C]">
              <tr className="text-left">
                {["Name", "Type", "Buyer", "Seller", "Price", "Time"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[16px] font-inter font-medium"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {/* Example Row with Full Image */}
              {activityData.slice(0, 5).map((item, index) => (
  <tr key={index} className="transition-colors border-b border-[#0B2A6F]">
    <td className="px-4 lg:px-6 py-3 align-middle">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden">
          <img
            src={land1Image}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm lg:text-[16px] font-inter font-normal">
          {item.name}
        </span>
      </div>
    </td>

    <td className="px-4 lg:px-6 py-3 text-sm lg:text-[14px] font-inter font-normal align-middle">
      {item.type}
    </td>

    <td className="px-4 lg:px-6 py-3 text-sm lg:text-[14px] font-inter font-normal align-middle">
      {item.buyer}
    </td>

    <td className="px-4 lg:px-6 py-3 text-sm lg:text-[14px] font-inter font-normal align-middle">
      {item.seller}
    </td>

    <td className="px-4 lg:px-6 py-3 text-sm lg:text-[14px] font-inter font-normal align-middle">
      ${item.price}
    </td>

    <td className="px-4 lg:px-6 py-3 text-sm lg:text-[14px] font-inter font-normal align-middle">
      {getDaysAgo(item.time)}
    </td>
  </tr>
))}

              {/* Example Row with Cropped Head Image */}
             
            </tbody>
          </table>
        </div>
      </section>
    </div>
  
  );
}

export default PersonalActivity;
