import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import TVector from "../../assets/images/popular/vector.png";
import CustomButton4 from "../Buttons/Button4";
import GlowingOrb from "../Common/BgColoring";
import { MarketPlace_Url, NewsImage_Url } from "../../Config";

function PopularCollections() {
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(`${MarketPlace_Url}/nft/collection/get`);
        if (res.data?.success) {
          setLandData(res.data.collections || []);
        } else {
          setError("Failed to load collections");
        }
      } catch {
        setError("Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <section className="relative z-10 w-full px-6 pb-20">
      <GlowingOrb Xaxis={200} Yaxis={860} />

      <div className="mx-auto max-w-[1400px] flex flex-col gap-10">
        {/* Heading */}
       <div className="flex flex-col gap-3">
          <h1 className="text-white font-goldman font-bold text-[20px] sm:text-[30px] uppercase truncate">
            Popular Collections
          </h1>

          <div className="flex gap-2">
            <div className="h-[3px] w-14 bg-white" />
            <div className="h-[3px] w-20 bg-white" />
            <div className="h-[3px] w-10 bg-white" />
            <div className="h-[3px] w-44 bg-gradient-to-r from-white to-transparent" />
          </div>
        </div>

        {/* Content */}
        {loading && <p className="text-white">Loading collections...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">

            {landData.slice(0, 4).map((item) => (
              <div
                key={item?._id}
                className="relative rounded-[16px] p-3 sm:p-4 lg:p-5 text-white flex flex-col
           h-[360px] sm:h-[390px] lg:h-[420px]"

                style={{
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                }}
              >
                {/* IMAGE */}
                <div className="h-[150px] sm:h-[180px] lg:h-[210px] rounded-[14px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, #9B7C2F 0%, #4A3E22 100%)",
                  }}
                >
                  <img
                    src={`${NewsImage_Url}${item?.collection?.image}`}
                    alt={item?.collection?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* TITLE */}
                {/* TITLE */}
                <h2 className="text-[14px] sm:text-[16px] lg:text-[18px] font-semibold mt-4 truncate">

                  {item?.collection?.name}
                </h2>

                {/* INFO */}
                <div className="flex justify-between items-center mt-3 text-[11px] sm:text-[13px] lg:text-sm">

                  <span className="font-medium text-gray-300 truncate">
                    {item?.collection?.symbol} 🔥
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                      <img src={TVector} alt="chain" className="w-3 h-3" />
                    </div>
                    <span className="font-semibold truncate">
                      ${item?.collection?.chain}
                    </span>
                  </div>
                </div>

                {/* BUTTON */}
                <div className="flex justify-center items-center mt-8">

                  <Link to="/market-place">
                    <CustomButton4 text="Buy Now" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PopularCollections;

