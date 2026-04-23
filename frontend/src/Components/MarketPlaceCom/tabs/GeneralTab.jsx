import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../../Config";
import LineLayout from "../LineLayout";
import { FALLBACK_ITEMS } from "../marketplaceFallback";
import {
  GiBodySwapping, GiStarMedal, GiTargetLaser, GiCrossedSwords,
  GiChestArmor, GiSpaceship, GiRaceCar, GiDiamondHard,
  GiMilitaryFort, GiOpenTreasureChest,
} from "react-icons/gi";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" } }),
};

// Normalise legacy/variant DB category values → canonical key
const CAT_ALIAS = {
  "military badges and collectables": "military badges",
  "vehicles":                         "racing vehicles",
  "land/bases":                       "land and bases",
};

// Per Don's brief — order matches the General section category list
const ICON_SIZE = 44;
const CATEGORIES = [
  { key: "skins",           label: "Skins",           icon: <GiBodySwapping      size={ICON_SIZE} color="#38bdf8" style={{ filter: "drop-shadow(0 0 6px #38bdf888)" }} /> },
  { key: "military badges", label: "Military Badges",  icon: <GiStarMedal         size={ICON_SIZE} color="#fcd34d" style={{ filter: "drop-shadow(0 0 6px #fcd34d88)" }} /> },
  { key: "specialists",     label: "Specialists",      icon: <GiTargetLaser       size={ICON_SIZE} color="#00ff88" style={{ filter: "drop-shadow(0 0 6px #00ff8888)" }} /> },
  { key: "weapons",         label: "Weapons",          icon: <GiCrossedSwords     size={ICON_SIZE} color="#ff6464" style={{ filter: "drop-shadow(0 0 6px #ff646488)" }} /> },
  { key: "body armour",     label: "Body Armour",      icon: <GiChestArmor        size={ICON_SIZE} color="#4f8fff" style={{ filter: "drop-shadow(0 0 6px #4f8fff88)" }} /> },
  { key: "spaceships",      label: "Spaceships",       icon: <GiSpaceship         size={ICON_SIZE} color="#6eb4ff" style={{ filter: "drop-shadow(0 0 6px #6eb4ff88)" }} /> },
  { key: "racing vehicles", label: "Vehicles",         icon: <GiRaceCar           size={ICON_SIZE} color="#ff3264" style={{ filter: "drop-shadow(0 0 6px #ff326488)" }} /> },
  { key: "artwork",         label: "Artwork",          icon: <GiDiamondHard       size={ICON_SIZE} color="#c864ff" style={{ filter: "drop-shadow(0 0 6px #c864ff88)" }} /> },
  { key: "land and bases",  label: "Land & Bases",     icon: <GiMilitaryFort      size={ICON_SIZE} color="#4f8fff" style={{ filter: "drop-shadow(0 0 6px #4f8fff88)" }} /> },
  { key: "general",         label: "General",          icon: <GiOpenTreasureChest size={ICON_SIZE} color="#e2e8f0" style={{ filter: "drop-shadow(0 0 6px #e2e8f066)" }} /> },
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
  const [catMap, setCatMap]       = useState({});   // { categoryKey: items[] }
  const [loading, setLoading]     = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | NFA | NFC | NFT

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`);
        const parents = res.data.nfts || res.data.collections || [];

        const map = {};
        parents.forEach((parent) => {
          const subCollections = parent.subCollections || [];
          if (!subCollections.length) return;
          const rawKey = (parent.category || parent.collection?.name || "other").toLowerCase().trim();
          const catKey = CAT_ALIAS[rawKey] || rawKey;
          if (!map[catKey]) map[catKey] = [];
          const listedSubs = subCollections.filter(
            (s) => s.listed === true && s.priceETH > 0
          );
          map[catKey].push(
            ...listedSubs.map((s) => ({
              ...s,
              parentId:       parent._id,
              parentCategory: catKey,
              parentName:     parent.collection?.name || "",
              isDummy:        parent.isDummy === true,
            }))
          );
        });

        // Check if we got any items from backend
        const hasItems = Object.values(map).some(arr => arr.length > 0);
        if (hasItems) {
          setCatMap(map);
          setUsingFallback(false);
        } else {
          // Use fallback sample data
          setCatMap(FALLBACK_ITEMS);
          setUsingFallback(true);
        }
      } catch (err) {
        console.error("GeneralTab fetch error:", err);
        // Use fallback on error too
        setCatMap(FALLBACK_ITEMS);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Apply assetType filter across all categories
  const filteredCatMap = typeFilter === "ALL" ? catMap : Object.fromEntries(
    Object.entries(catMap).map(([key, items]) => [
      key,
      items.filter(item => {
        const t = item.assetType || (item.isNFA ? "NFA" : "NFT"); // NFC always has assetType set
        return t === typeFilter;
      }),
    ])
  );

  const visibleCategories = CATEGORIES.filter((c) => filteredCatMap[c.key]?.length > 0);
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
          Browse NFAs, NFCs, and NFTs available for immediate purchase — skins, weapons, specialists, spaceships, and more.
        </p>
      </motion.div>

      {/* Asset Type Filter */}
      <motion.div className="flex items-center gap-2 mb-8 flex-wrap" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        {[
          { value: "ALL", label: "All" },
          { value: "NFA", label: "NFA" },
          { value: "NFC", label: "NFC" },
          { value: "NFT", label: "NFT" },
        ].map(({ value, label }) => {
          const active = typeFilter === value;
          const colors = {
            ALL: { active: "#fff",     inactive: "rgba(255,255,255,0.15)", text: active ? "#000" : "rgba(255,255,255,0.5)" },
            NFA: { active: "#7C3AED",  inactive: "rgba(124,58,237,0.15)", text: active ? "#fff" : "#c4b5fd" },
            NFC: { active: "#002AA8",  inactive: "rgba(0,42,168,0.2)",    text: active ? "#fff" : "#93c5fd" },
            NFT: { active: "rgba(255,255,255,0.12)", inactive: "rgba(255,255,255,0.05)", text: active ? "#fff" : "rgba(255,255,255,0.4)" },
          }[value];
          return (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active ? colors.active : colors.inactive,
                border: `1px solid ${active ? colors.active : "rgba(255,255,255,0.1)"}`,
                color: colors.text,
              }}
            >
              {label}
            </button>
          );
        })}
      </motion.div>

      {/* Fallback notice */}
      {usingFallback && !loading && (
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="mb-8 px-5 py-4 rounded-xl flex items-start gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(180,120,0,0.1) 0%, rgba(0,42,168,0.06) 100%)",
            border: "1px solid rgba(180,120,0,0.2)",
          }}
        >
          <span className="text-2xl flex-shrink-0">🎮</span>
          <div>
            <p className="text-amber-300/90 text-sm font-semibold mb-1">Sample Marketplace Preview</p>
            <p className="text-white/50 text-xs leading-relaxed">
              The items below are sample previews showcasing the types of digital assets that will be available on the HyperTek marketplace. 
              Actual items with unique artwork and blockchain-verified ownership will be available at launch.
            </p>
          </div>
        </motion.div>
      )}

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
            const items = filteredCatMap[cat.key];
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
