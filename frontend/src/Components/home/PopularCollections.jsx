import React, { useState, useEffect } from "react";
import popularCollections from "../../assets/images/popular/popolar.png";
import TVector from "../../assets/images/popular/vector.png";
import CustomButton from "../Buttons/Button1";
import PageBackground from "../Common/BgEffect";
import axios from "axios";
import GlowingOrb from "../Common/BgColoring";
import { Link } from "react-router-dom";
import { MarketPlace_Url , NewsImage_Url } from "../../Config";

function PopularCollections() {
  // for getting the dynamic data and showign through map
  const [landData, setLandData] = useState([]);

  // get the market data here
 useEffect(() => {
  const fetchCollections = async () => { 
    try {
      const res = await axios.get(`${MarketPlace_Url}/nft/collection/get`);
      if (res.data.success) {
        setLandData(res.data.collections); // note: API returns { success, collections }
      } else {
        console.error("Failed to fetch collections:", res.data.message);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  fetchCollections();
}, []);

  console.log("your land data are here :", landData);

  return (
    <section className="flex flex-col overflow-hidden gap-8 w-full px-4 sm:px-8 pt-5 pb-8 sm:pb-12 overflow-x-hidden relative z-10">
      <GlowingOrb Xaxis={200} Yaxis={460} />

      {/* Container to align text, underline, and cards */}
      <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8">
        {/* Heading */}
        <div className="flex flex-col gap-2 items-start w-full">
          <h1 className="text-white font-goldman font-bold text-[30px] leading-[100%] tracking-[0] uppercase">
  Popular Collections
</h1>


          {/* Decorative underline bars */}
          <div className="flex gap-2">
            <div className="h-[3px] w-12 bg-white"></div>
            <div className="h-[3px] w-20 bg-white"></div>
            <div className="h-[3px] w-8 bg-white"></div>
            <div className="h-[3px] w-40 bg-gradient-to-r from-white to-transparent"></div>
          </div>
        </div>

        {/* Cards Section */}
 <div className="grid grid-cols-2 z-10 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
  {landData.slice(0, 4).map((item) => (
    <div
      key={item._id}
      className="bg-gray-800 rounded-lg shadow-md text-white p-4 flex flex-col justify-between w-full h-[400px]"
    >
      {/* Image container */}
      <div
        className="w-full h-[160px] overflow-hidden rounded-[19px]"
        style={{
          background:
            "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
        }}
      >
      <img
  src={`${NewsImage_Url}${item.collection.image}`}
  alt={item.collection.name}
  className="w-full h-full object-contain"
/>

      </div>

      {/* Title */}
      <h2 className="text-lg font-bold mt-4">{item.collection.name}</h2>

      {/* Info Row */}
      <div className="flex justify-between items-center mb-4 mt-5">
        <h3 className="text-sm font-semibold">{item.collection.symbol}</h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-[50%] bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE]">
            <img src={TVector} alt="" className="w-3 h-3" />
          </div>
          <h3 className="text-sm font-semibold">${item.collection.chain}</h3>
        </div>
      </div>

      {/* Buy Now Button */}
      <div className=" flex justify-center scale-90 sm:scale-100">
        <button>
          <Link to="/market-place">
            <CustomButton text="Buy Now" />
          </Link>
        </button>
      </div>
    </div>
  ))}
</div>

      </div>
    </section>
  );
}

export default PopularCollections;
