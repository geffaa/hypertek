import { motion } from "framer-motion";
import popularFallback from "../../assets/images/popular/popolar.png";
import { useNavigate } from "react-router-dom";
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

function FeaturedMarketplace() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`);
      if (!res.data?.success) return;

      // Flatten all listed subCollections across all parents
      const listed = [];
      (res.data.collections || []).forEach((col) => {
        (col.subCollections || []).forEach((sub) => {
          if (sub.listed === true && sub.priceETH > 0) {
            listed.push({
              ...sub,
              _parentId: col._id,
              _category: (col.category || col.collection?.name || "general").toLowerCase().trim(),
            });
          }
        });
      });

      // Most recently listed first, take top 6
      listed.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      setItems(listed.slice(0, 6));
    } catch (err) {
      console.error("FeaturedMarketplace fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    window.addEventListener("categoriesUpdated", fetchItems);
    return () => window.removeEventListener("categoriesUpdated", fetchItems);
  }, []);

  return (
    <section className="relative z-10 w-full px-6 pb-20">
      <div className="mx-auto max-w-[1400px] flex flex-col gap-8">

        <motion.div
          className="flex flex-col gap-2"
          variants={fadeUp} custom={0}
          initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-white/50" />
            <span className="text-white/70 font-bold text-xs tracking-[0.3em] uppercase">Featured</span>
          </div>
          <h2 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl uppercase">
            Marketplace
          </h2>
        </motion.div>

        {loading && <p className="text-white/60 text-sm">Loading items...</p>}

        {!loading && items.length === 0 && (
          <p className="text-white/30 text-sm">No listed items yet.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                className="snap-start flex-shrink-0 w-[45vw] sm:w-auto rounded-xl overflow-hidden flex flex-col text-white cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                variants={fadeUp} custom={index + 1}
                initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => navigate("/buy-nfa", { state: { item, parentId: item._parentId } })}
              >
                <LazyImage
                  src={getImageUrl(item.image)}
                  alt={item.name || "Item"}
                  fallback={popularFallback}
                  className="h-[110px] sm:h-[130px] lg:h-[150px]"
                  imgClassName="object-cover"
                />

                <div className="flex flex-col gap-1.5 p-2.5 sm:p-3 flex-1">
                  <h3 className="text-white font-semibold text-xs sm:text-sm truncate">
                    {item.name || "Unnamed Item"}
                  </h3>

                  {item._category && (
                    <span className="text-white/40 text-[10px] capitalize truncate">
                      {item._category}
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[10px]">Price</span>
                    <span className="text-white font-semibold text-[10px] sm:text-xs">
                      {item.priceETH} USDC
                    </span>
                  </div>

                  <div className="mt-auto pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/buy-nfa", { state: { item, parentId: item._parentId } });
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

export default FeaturedMarketplace;
