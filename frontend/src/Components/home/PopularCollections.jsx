import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MarketPlace_Url, getImageUrl } from "../../Config";
import LazyImage from "../Common/LazyImage";
import popularFallback from "../../assets/images/popular/popolar.png";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

function PopularCollections() {
  const navigate = useNavigate();
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(`${MarketPlace_Url}/nft/parent-collections`);
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
    <section className="relative z-10 w-full px-6 pb-16">
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
            <span className="text-white/70 font-bold text-xs tracking-[0.3em] uppercase">Collections</span>
          </div>
          <h2 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl uppercase">
            Popular Collections
          </h2>
        </motion.div>

        {/* Content */}
        {loading && <p className="text-white/60 text-sm">Loading collections...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && (
          /* Mobile: horizontal scroll | sm+: 3-col grid | lg+: 6-col grid */
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {landData.slice(0, 6).map((item, index) => (
              <motion.div
                key={item?._id}
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
                  src={getImageUrl(item?.collection?.image)}
                  alt={item?.collection?.name}
                  fallback={popularFallback}
                  className="h-[110px] sm:h-[130px] lg:h-[150px]"
                  imgClassName="object-cover"
                />

                {/* Body */}
                <div className="flex flex-col gap-1.5 p-2.5 sm:p-3 flex-1">
                  <h3 className="text-white font-semibold text-xs sm:text-sm truncate">
                    {item?.collection?.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[10px]">Floor Price</span>
                    <span className="text-white font-semibold text-[10px] sm:text-xs">
                      {item?.floorPrice ?? "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex-shrink-0" />
                    <span className="text-white/60 text-[10px] truncate">USDC</span>
                  </div>

                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => {
                        const firstSub = item?.subCollections?.[0];
                        if (firstSub) {
                          navigate("/buy-nfa", { state: { item: firstSub, parentId: item._id } });
                        } else {
                          const category = item?.category || item?.collection?.name?.toLowerCase()?.trim();
                          navigate(category ? `/collections/${encodeURIComponent(category)}` : "/market-place");
                        }
                      }}
                      className="w-full py-1.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-[10px] sm:text-xs rounded-md transition-all duration-300 border border-white/20"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PopularCollections;
