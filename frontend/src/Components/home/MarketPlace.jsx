import { motion } from "framer-motion";
import popularFallback from "../../assets/images/popular/popolar.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import LazyImage from "../Common/LazyImage";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

function PopularCollections() {
  const [marketData, setMarketData] = useState([]);

  const fetchMarketData = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collections`
      );
      if (res.data.success) {
        setMarketData(res.data.collections);
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const handleUpdate = () => fetchMarketData();
    window.addEventListener("categoriesUpdated", handleUpdate);
    return () => window.removeEventListener("categoriesUpdated", handleUpdate);
  }, []);

  return (
    <section className="relative z-10 w-full px-6 pb-20">
      <div className="mx-auto max-w-[1400px] flex flex-col gap-8">

        {/* Heading */}
        <motion.div
          className="flex flex-col gap-2"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-white/50" />
            <span className="text-white/70 font-bold text-xs tracking-[0.3em] uppercase">
              Featured
            </span>
          </div>
          <h2 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl uppercase">
            MarketPlace
          </h2>
        </motion.div>

        {/* Mobile: horizontal scroll | sm+: 3-col grid | lg+: 6-col grid */}
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
          {marketData?.slice(0, 6).map((data, index) => (
            <motion.div
              key={data._id}
              className="snap-start flex-shrink-0 w-[45vw] sm:w-auto rounded-xl overflow-hidden flex flex-col text-white"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              variants={fadeUp}
              custom={index + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Image */}
              <LazyImage
                src={getImageUrl(data.collection.image)}
                alt={data.collection.name || "Collection"}
                fallback={popularFallback}
                className="h-[110px] sm:h-[130px] lg:h-[150px]"
                imgClassName="object-cover"
              />

              {/* Body */}
              <div className="flex flex-col gap-1.5 p-2.5 sm:p-3 flex-1">
                <h3 className="text-white font-semibold text-xs sm:text-sm truncate">
                  {data.collection.name || "Collection"}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px]">Items</span>
                  <span className="text-white font-semibold text-[10px] sm:text-xs">
                    {data.subCollections?.length ?? "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex-shrink-0" />
                  <span className="text-white/60 text-[10px] truncate">
                    {data.collection.chain}
                  </span>
                </div>

                <div className="mt-auto pt-2">
                  <Link to="/market-place" className="block w-full">
                    <button className="w-full py-1.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-[10px] sm:text-xs rounded-md transition-all duration-300 border border-white/20">
                      Buy Now
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default PopularCollections;
