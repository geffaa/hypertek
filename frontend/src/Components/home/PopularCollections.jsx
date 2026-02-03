import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import TVector from "../../assets/images/popular/vector.png";
import CustomButton4 from "../Buttons/Button4";
import GlowingOrb from "../Common/BgColoring";
import { MarketPlace_Url, NewsImage_Url } from "../../Config";

function PopularCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ parent collections
        const parentsRes = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/parent-collections`,
        );

        if (!parentsRes.data?.success) return;

        const parents = parentsRes.data.collections || [];

        // 2️⃣ har parent se sub collections lao
        const requests = parents.map((p) =>
          axios.get(
            `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${p._id}/sub-collections`,
          ),
        );

        const responses = await Promise.all(requests);

        // ✅ CORRECT PARSING (new API response)
        const allSubs = responses.flatMap((res) => {
          return res.data?.subCollections || [];
        });

        setCollections(allSubs);
      } catch (err) {
        console.error("API error:", err);
        setError("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <section className="relative z-10 w-full px-6 pb-20">
      <GlowingOrb Xaxis={200} Yaxis={860} />

      <div className="mx-auto max-w-[1400px] flex flex-col gap-10">
        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="text-white font-goldman font-bold text-[20px] sm:text-[30px] uppercase">
            Popular Collections
          </h1>

          <div className="flex gap-2">
            <div className="h-[3px] w-14 bg-white" />
            <div className="h-[3px] w-20 bg-white" />
            <div className="h-[3px] w-10 bg-white" />
            <div className="h-[3px] w-44 bg-gradient-to-r from-white to-transparent" />
          </div>
        </div>

        {loading && <p className="text-white">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
            {collections.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="rounded-[16px] p-4 text-white flex flex-col h-[420px]"
                style={{
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                }}
              >
                <div className="h-[210px] rounded-[14px] overflow-hidden">
                  <img
                    src={`${NewsImage_Url}${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-lg font-semibold mt-4 truncate">
                  {item.name}
                </h2>

                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="text-gray-300">{item.symbol} 🔥</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                      <img src={TVector} className="w-3 h-3" alt="chain" />
                    </div>
                    <span className="font-semibold">{item.priceETH} ETH</span>
                  </div>
                </div>

                <div className="mt-auto flex justify-center">
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
