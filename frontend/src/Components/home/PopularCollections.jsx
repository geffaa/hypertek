import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
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

const CATEGORY_LABELS = {
  "skins":           "Skins",
  "military badges": "Military Badges",
  "specialists":     "Specialists",
  "weapons":         "Weapons",
  "body armour":     "Body Armour",
  "spaceships":      "Spaceships",
  "racing vehicles": "Racing Vehicles",
  "artwork":         "Artwork",
  "land and bases":  "Land & Bases",
  "general":         "General",
};

function PopularCollections() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`);
        if (!res.data?.success) return;

        // Group listed subCollections by category
        const catMap = {};
        (res.data.collections || []).forEach((col) => {
          const cat = (col.category || "general").toLowerCase().trim();
          const listed = (col.subCollections || []).filter(
            (s) => s.listed === true && s.priceETH > 0
          );
          if (listed.length === 0) return;

          if (!catMap[cat]) {
            catMap[cat] = { cat, items: [], image: null };
          }
          listed.forEach((s) => {
            catMap[cat].items.push(s);
            if (!catMap[cat].image) {
              catMap[cat].image = s.image || col.collection?.image || null;
            }
          });
        });

        // Sort by item count desc, take top 6
        const sorted = Object.values(catMap)
          .sort((a, b) => b.items.length - a.items.length)
          .slice(0, 6);

        setCategories(sorted);
      } catch (e) {
        console.error("PopularCollections fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
    window.addEventListener("categoriesUpdated", fetchCollections);
    return () => window.removeEventListener("categoriesUpdated", fetchCollections);
  }, []);

  return (
    <section className="relative z-10 w-full px-6 pb-16">
      <div className="mx-auto max-w-[1400px] flex flex-col gap-8">

        <motion.div
          className="flex flex-col gap-2"
          variants={fadeUp} custom={0}
          initial="hidden" whileInView="visible"
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

        {loading && <p className="text-white/60 text-sm">Loading collections...</p>}

        {!loading && categories.length === 0 && (
          <p className="text-white/30 text-sm">No listed items yet.</p>
        )}

        {!loading && categories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.cat}
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
                onClick={() => navigate(`/market-place?category=${encodeURIComponent(cat.cat)}`)}
              >
                <LazyImage
                  src={getImageUrl(cat.image)}
                  alt={cat.cat}
                  fallback={popularFallback}
                  className="h-[110px] sm:h-[130px] lg:h-[150px]"
                  imgClassName="object-cover"
                />

                <div className="flex flex-col gap-1.5 p-2.5 sm:p-3 flex-1">
                  <h3 className="text-white font-semibold text-xs sm:text-sm truncate capitalize">
                    {CATEGORY_LABELS[cat.cat] || cat.cat}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[10px]">Items</span>
                    <span className="text-white/80 text-[10px]">{cat.items.length}</span>
                  </div>

                  <div className="mt-auto pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/market-place?category=${encodeURIComponent(cat.cat)}`);
                      }}
                      className="w-full py-1.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-[10px] sm:text-xs rounded-md transition-all duration-300 border border-white/20"
                    >
                      Browse
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
