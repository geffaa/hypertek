import popularCollections from "../../assets/images/popular/popolar.png";
import TVector from "../../assets/images/popular/vector.png";
import CustomButton from "../Buttons/Button1";
import { Link } from "react-router-dom";
import GlowingOrb from "../Common/BgColoring";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_BASE_URL } from "../../Config";
import { NewsImage_Url } from "../../Config";

function PopularCollections() {
  const [marketData, setMarketData] = useState([]);

  // get the market data here
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/collection/get`
        );
        if (res.data.success) {
          setMarketData(res.data.collections); // assuming backend returns { success, data }
          console.log("Fetched market data:", res.data);
        } else {
          console.error("Failed to fetch market data:", res.data.message);
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchMarketData();
  }, []); // run once when component mounts

  console.log("your market data are here :", marketData);

  return (
    <section className="relative flex flex-col overflow-hidden w-full px-4 my-5 sm:px-8 pt-5 gap-8">
      {/* Decorative glowing orbs */}
      <GlowingOrb Xaxis={180} Yaxis={20} />
      <GlowingOrb Xaxis={700} Yaxis={420} />

      {/* Container for heading and cards */}
      <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8">
        {/* Heading */}
        <div className="flex flex-col gap-2 items-center sm:items-start w-full px-4 sm:px-0">
          <h1 className="text-white uppercase text-2xl sm:text-3xl lg:text-[30px] font-goldman font-bold leading-[100%]">
            MarketPlace
          </h1>

          {/* Decorative underline bars */}
          <div className="flex gap-2 ml-6 sm:ml-0">
            <div className="h-[3px] w-8 md:w-12 bg-white"></div>
            <div className="h-[3px] w-12 md:w-20 bg-white"></div>
            <div className="h-[3px] w-4 md:w-8 bg-white"></div>
            <div className="h-[3px] w-20 md:w-40 bg-gradient-to-r from-white to-transparent"></div>
          </div>
        </div>
        {/* Cards Section */}
        <div className="grid grid-cols-2 z-10 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 ">
         {marketData?.slice(0, 4).map((data, index) => (
  <div
    key={index}
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
        src={
          data.collection.image
            ? `${NewsImage_Url}${data.collection.image}`
            : popularCollections
        }
        alt={data.collection.name || "Collection"}
        className="w-full h-full object-contain"
      />
    </div>

    {/* Title */}
    <h2
      className="text-lg font-bold md:mt-4 line-clamp-2"
      title={data.collection.name}
    >
      {data.collection.name || "Monkey Ape"}
    </h2>

    {/* Info Row */}
    <div className="flex justify-between items-center mb-4 mt-5">
      <h3 className="text-sm font-semibold">
        {data._id.slice(0, 6)}🔥
      </h3>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5 rounded-[50%] bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE]">
          <img src={TVector} alt="" className="w-3 h-3" />
        </div>

        {/* Price */}
        <h3 className="text-sm font-semibold">${data.collection.supply}</h3>
      </div>
    </div>

    {/* Buy Now Button */}
    <div className=" flex justify-center w-full z-10 scale-90 sm:scale-100">
      <Link to="market-place" className="flex justify-center">
        <button>
          <CustomButton text="Buy Now" />
        </button>
      </Link>
    </div>
  </div>
))}

        </div>
      </div>
    </section>
  );
}

export default PopularCollections;
