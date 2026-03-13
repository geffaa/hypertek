import { motion } from "framer-motion";
import popularCollections from "../../assets/images/popular/popolar.png";
import TVector from "../../assets/images/popular/vector.png";
import CustomButton4 from "../Buttons/Button4";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_BASE_URL, NewsImage_Url } from "../../Config";

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
      } else {
        console.error("Failed to fetch market data:", res.data.message);
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
      <div className="mx-auto max-w-[1400px] flex flex-col gap-10">

        {/* Heading */}
        <motion.div
          className="flex flex-col gap-3 items-center sm:items-start"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h1 className="text-white uppercase text-[20px] sm:text-[30px] font-goldman font-bold text-center sm:text-left">
            MarketPlace
          </h1>
          <div className="flex gap-2 justify-center sm:justify-start w-full sm:w-auto">
            <div className="h-[3px] w-14 bg-white" />
            <div className="h-[3px] w-20 bg-white" />
            <div className="h-[3px] w-10 bg-white" />
            <div className="h-[3px] w-44 bg-gradient-to-r from-white to-transparent" />
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
          {marketData?.slice(0, 4).map((data, index) => (
            <motion.div
              key={index}
              className="relative rounded-[16px] p-3 sm:p-4 lg:p-5 text-white flex flex-col h-[360px] sm:h-[390px] lg:h-[420px]"
              style={{
                background: "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
              }}
              variants={fadeUp}
              custom={index + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              {/* Image */}
              <div
                className="h-[150px] sm:h-[180px] lg:h-[210px] rounded-[14px] overflow-hidden"
                style={{ background: "linear-gradient(180deg, #9B7C2F 0%, #4A3E22 100%)" }}
              >
                <img
                  src={
                    data.collection.image
                      ? `${NewsImage_Url}${data.collection.image}`
                      : popularCollections
                  }
                  alt={data.collection.name || "Collection"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h2 className="text-[14px] sm:text-[16px] lg:text-[18px] font-semibold mt-4 truncate">
                {data.collection.name || "Collection"}
              </h2>

              {/* Info */}
              <div className="flex justify-between items-center mt-3 text-[11px] sm:text-[13px] lg:text-sm">
                <span className="font-medium text-gray-300 truncate">
                  {data._id.slice(0, 6)} 🔥
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                    <img src={TVector} className="w-3 h-3" alt="chain" />
                  </div>
                  <span className="font-semibold truncate">{data.collection.chain}</span>
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-center items-center mt-8">
                <Link to="/market-place">
                  <CustomButton4 text="Buy Now" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularCollections;
