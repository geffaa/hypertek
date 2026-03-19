import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../../Config";
import LineLayout from "../LineLayout";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" } }),
};

// Per Don's brief — order matches the General section category list
const CATEGORIES = [
  { key: "skins",                            label: "Skins",           icon: "🎨" },
  { key: "military badges and collectables", label: "Military Badges", icon: "🎖️" },
  { key: "specialists",                      label: "Specialists",     icon: "👤" },
  { key: "weapons",                          label: "Weapons",         icon: "⚔️" },
  { key: "body armour",                      label: "Body Armour",     icon: "🛡️" },
  { key: "spaceships",                       label: "Spaceships",      icon: "🚀" },
  { key: "racing vehicles",                  label: "Vehicles",        icon: "🏎️" },
  { key: "artwork",                          label: "Artwork",         icon: "🖼️" },
  { key: "land and bases",                   label: "Land & Bases",    icon: "🌍" },
];

// ── Gap section between lines (placeholder for announcements / dynamic content)
function Gap({ children }) {
  if (!children) return <div className="h-px bg-white/[0.06] my-2" />;
  return (
    <div className="py-5 px-4 my-2 rounded-xl text-white/50 text-sm text-center"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {children}
    </div>
  );
}

export default function GeneralTab() {
  const [catMap, setCatMap]   = useState({});   // { categoryKey: items[] }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`);
        const parents = res.data.nfts || res.data.collections || [];

        const map = {};
        await Promise.all(
          parents.map(async (parent) => {
            try {
              const sub = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );
              if (sub.data.success && sub.data.subCollections?.length) {
                const catKey = (parent.category || "other").toLowerCase().trim();
                if (!map[catKey]) map[catKey] = [];
                map[catKey].push(
                  ...sub.data.subCollections.map((s) => ({
                    ...s,
                    parentId:       parent._id,
                    parentCategory: parent.category,
                    parentName:     parent.collection?.name || "",
                  }))
                );
              }
            } catch { /* skip */ }
          })
        );
        setCatMap(map);
      } catch (err) {
        console.error("GeneralTab fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleCategories = CATEGORIES.filter((c) => catMap[c.key]?.length > 0);
  const hasAnyItems = visibleCategories.length > 0;

  return (
    <div className="py-8">
      {/* Section header */}
      <motion.div className="mb-10" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-white/40" />
          <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">Marketplace</span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">General</h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          Browse NFAs and NFCs available for immediate purchase — skins, weapons, specialists, spaceships, and more.
        </p>
      </motion.div>

      {/* Lines */}
      {loading ? (
        <div className="flex flex-col gap-6">
          {CATEGORIES.map((_, i) => (
            <div key={i} className="h-[180px] rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : !hasAnyItems ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="text-4xl mb-1">🛒</div>
          <p className="text-white/50 text-sm">No items available yet. Check back soon.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {CATEGORIES.map((cat, i) => {
            const items = catMap[cat.key];
            if (!items?.length) return null;
            return (
              <div key={cat.key}>
                <LineLayout
                  category={cat.key}
                  label={cat.label}
                  icon={cat.icon}
                  items={items}
                  direction={i % 2 === 0 ? "left" : "right"}
                />
                {/* Gap section between every two lines */}
                {i < CATEGORIES.length - 1 && <Gap />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
