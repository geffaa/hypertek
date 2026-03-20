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

// ── Fallback sample data for when backend has no items ────────────────────────
const FALLBACK_ITEMS = {
  skins: [
    { _id: "fs-1", name: "Desert Storm Skin", priceETH: 45, description: "Camouflage desert warfare skin for elite soldiers.", parentCategory: "skins" },
    { _id: "fs-2", name: "Arctic Ghost Skin", priceETH: 60, description: "Icy blue stealth skin for cold-climate operations.", parentCategory: "skins" },
    { _id: "fs-3", name: "Shadow Ops Skin", priceETH: 80, description: "Jet black covert operations skin with night-vision accents.", parentCategory: "skins" },
    { _id: "fs-4", name: "Urban Assault Skin", priceETH: 55, description: "City warfare skin with tactical grey patterning.", parentCategory: "skins" },
    { _id: "fs-5", name: "Jungle Predator Skin", priceETH: 70, description: "Dense jungle camouflage skin for rainforest missions.", parentCategory: "skins" },
  ],
  "military badges and collectables": [
    { _id: "fb-1", name: "Commander's Cross", priceETH: 300, description: "Rare commander's cross awarded for battlefield leadership.", parentCategory: "military badges and collectables" },
    { _id: "fb-2", name: "Purple Valor Medal", priceETH: 250, description: "Medal of valor for exceptional bravery under fire.", parentCategory: "military badges and collectables" },
    { _id: "fb-3", name: "HyperTek Coin 2025", priceETH: 180, description: "Limited edition collectible coin for season 2025.", parentCategory: "military badges and collectables" },
    { _id: "fb-4", name: "Iron Shield Badge", priceETH: 140, description: "Badge denoting mastery of defensive tactics.", parentCategory: "military badges and collectables" },
    { _id: "fb-5", name: "Star of Honour", priceETH: 500, description: "The highest honour awarded in the HyperTek universe.", parentCategory: "military badges and collectables" },
  ],
  specialists: [
    { _id: "fsp-1", name: "Ghost Recon Operator", priceETH: 400, description: "Elite recon specialist with ghost cloak ability.", parentCategory: "specialists" },
    { _id: "fsp-2", name: "Cyber Medic", priceETH: 280, description: "Field medic with advanced cybernetic healing tools.", parentCategory: "specialists" },
    { _id: "fsp-3", name: "Bomb Disposal Expert", priceETH: 320, description: "Specialist trained to neutralise any explosive device.", parentCategory: "specialists" },
    { _id: "fsp-4", name: "AI Drone Handler", priceETH: 360, description: "Controls a squad of tactical AI combat drones.", parentCategory: "specialists" },
    { _id: "fsp-5", name: "Sniper Ace", priceETH: 450, description: "Long-range marksman with zero-wind precision targeting.", parentCategory: "specialists" },
  ],
  weapons: [
    { _id: "fw-1", name: "Hyper Assault Rifle", priceETH: 120, description: "High-powered assault rifle with hyper-tech optics.", parentCategory: "weapons" },
    { _id: "fw-2", name: "Plasma Pistol Mk2", priceETH: 85, description: "Compact plasma pistol with dual-fire mode.", parentCategory: "weapons" },
    { _id: "fw-3", name: "Rail Sniper X90", priceETH: 200, description: "Long-range rail gun sniper with electro-targeting.", parentCategory: "weapons" },
    { _id: "fw-4", name: "Frag Launcher Pro", priceETH: 150, description: "Grenade launcher with proximity detonation system.", parentCategory: "weapons" },
    { _id: "fw-5", name: "Ion Blade Elite", priceETH: 95, description: "Electrified combat blade for close-quarters warfare.", parentCategory: "weapons" },
  ],
  "body armour": [
    { _id: "fba-1", name: "Nano-Mesh Vest", priceETH: 110, description: "Lightweight nano-fibre vest with ballistic resistance.", parentCategory: "body armour" },
    { _id: "fba-2", name: "Exo-Skeleton Mk3", priceETH: 350, description: "Full exoskeleton suit with powered joints.", parentCategory: "body armour" },
    { _id: "fba-3", name: "Carbon Plate Armour", priceETH: 220, description: "Hard carbon plates for heavy assault operations.", parentCategory: "body armour" },
    { _id: "fba-4", name: "Stealth Composite Vest", priceETH: 175, description: "Radar-absorbing composite armour vest.", parentCategory: "body armour" },
    { _id: "fba-5", name: "Titan Full Plate", priceETH: 480, description: "Maximum protection titanium alloy full body armour.", parentCategory: "body armour" },
  ],
  spaceships: [
    { _id: "fss-1", name: "Viper Fighter Mk1", priceETH: 600, description: "Fast single-pilot fighter with twin plasma cannons.", parentCategory: "spaceships" },
    { _id: "fss-2", name: "Nexus Cruiser", priceETH: 1200, description: "Mid-range cruiser with advanced shield systems.", parentCategory: "spaceships" },
    { _id: "fss-3", name: "Hyper Drive Engine", priceETH: 250, description: "Replacement engine part providing 40% speed boost.", parentCategory: "spaceships" },
    { _id: "fss-4", name: "Phantom Stealth Ship", priceETH: 900, description: "Radar-invisible stealth spacecraft for covert ops.", parentCategory: "spaceships" },
    { _id: "fss-5", name: "Ion Thruster Pack", priceETH: 180, description: "Upgradeable ion thruster set for any ship class.", parentCategory: "spaceships" },
  ],
  "racing vehicles": [
    { _id: "frv-1", name: "HyperBike GT", priceETH: 550, description: "Ultra-fast racing bike built for gravity tracks.", parentCategory: "racing vehicles" },
    { _id: "frv-2", name: "Turbo Hovercar X", priceETH: 780, description: "Anti-gravity hovercar with turbo boost module.", parentCategory: "racing vehicles" },
    { _id: "frv-3", name: "Mag-Wheel Upgrade Kit", priceETH: 120, description: "Magnetic wheel set for improved cornering speed.", parentCategory: "racing vehicles" },
    { _id: "frv-4", name: "Neon Dragster 5000", priceETH: 650, description: "Straight-line speed demon with neon drive system.", parentCategory: "racing vehicles" },
    { _id: "frv-5", name: "Combat Trike", priceETH: 430, description: "Three-wheeled combat racer with front-mounted cannon.", parentCategory: "racing vehicles" },
  ],
  artwork: [
    { _id: "fa-1", name: "Genesis Warrior Portrait", priceETH: 800, description: "Original digital oil portrait of the first HyperTek warrior.", parentCategory: "artwork" },
    { _id: "fa-2", name: "Neon City Skyline", priceETH: 600, description: "Vibrant neon cityscape from the HyperTek universe.", parentCategory: "artwork" },
    { _id: "fa-3", name: "Cosmic Battle Scene", priceETH: 1500, description: "Epic deep-space battle, hand-painted in 8K resolution.", parentCategory: "artwork" },
    { _id: "fa-4", name: "Hyper Soldier Sketch", priceETH: 400, description: "Concept sketch of the iconic HyperTek soldier.", parentCategory: "artwork" },
    { _id: "fa-5", name: "Abstract Data Stream", priceETH: 350, description: "Generative art piece representing blockchain data flow.", parentCategory: "artwork" },
  ],
  "land and bases": [
    { _id: "fl-1", name: "Desert Outpost Alpha", priceETH: 2000, description: "Strategic desert base with resource extraction facilities.", parentCategory: "land and bases" },
    { _id: "fl-2", name: "Arctic Station Omega", priceETH: 3500, description: "Fortified arctic base in the polar zone.", parentCategory: "land and bases" },
    { _id: "fl-3", name: "City Block 47", priceETH: 1800, description: "Prime urban land block in the central HyperTek city.", parentCategory: "land and bases" },
    { _id: "fl-4", name: "Mountain Fortress", priceETH: 4200, description: "Defensible mountain stronghold with 360-degree visibility.", parentCategory: "land and bases" },
    { _id: "fl-5", name: "Ocean Platform Delta", priceETH: 2800, description: "Off-shore naval platform for maritime operations.", parentCategory: "land and bases" },
  ],
};

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
  const [usingFallback, setUsingFallback] = useState(false);

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
                const catKey = (parent.category || parent.collection?.name || "other").toLowerCase().trim();
                if (!map[catKey]) map[catKey] = [];
                map[catKey].push(
                  ...sub.data.subCollections.map((s) => ({
                    ...s,
                    parentId:       parent._id,
                    parentCategory: catKey,
                    parentName:     parent.collection?.name || "",
                  }))
                );
              }
            } catch { /* skip */ }
          })
        );

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
                  isDummy={usingFallback}
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
