import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../../Config";
import LineLayout from "../LineLayout";

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
const CATEGORIES = [
  {
    key: "skins", label: "Skins",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Combat helmet dome */}
        <path d="M10 24 Q10 10 22 10 Q34 10 34 24" fill="rgba(100,160,255,0.15)" stroke="#6eb4ff" strokeWidth="1.5"/>
        {/* Visor */}
        <path d="M13 24 Q13 30 22 30 Q31 30 31 24" fill="rgba(0,120,255,0.25)" stroke="#00d4ff" strokeWidth="1.5"/>
        <line x1="14" y1="26.5" x2="30" y2="26.5" stroke="#00d4ff" strokeWidth="0.8" opacity="0.5"/>
        {/* Side vents */}
        <line x1="10" y1="21" x2="10" y2="26" stroke="#6eb4ff" strokeWidth="2" strokeLinecap="round"/>
        <line x1="34" y1="21" x2="34" y2="26" stroke="#6eb4ff" strokeWidth="2" strokeLinecap="round"/>
        {/* Chin guard */}
        <path d="M13 30 L13 33 Q22 37 31 33 L31 30" fill="rgba(100,160,255,0.08)" stroke="#6eb4ff" strokeWidth="1.2"/>
        {/* Tech detail on dome */}
        <line x1="22" y1="10" x2="22" y2="14" stroke="#6eb4ff" strokeWidth="1" opacity="0.5"/>
        <circle cx="22" cy="14" r="1.5" fill="#6eb4ff" opacity="0.6"/>
      </svg>
    ),
  },
  {
    key: "military badges", label: "Military Badges",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer hex */}
        <polygon points="22,5 34,12 34,28 22,35 10,28 10,12" fill="rgba(255,200,50,0.1)" stroke="#ffc83d" strokeWidth="1.5"/>
        {/* Inner hex ring */}
        <polygon points="22,9 30,14 30,26 22,31 14,26 14,14" fill="none" stroke="#ffc83d" strokeWidth="0.8" opacity="0.45"/>
        {/* 5-point star */}
        <polygon points="22,13 23.8,18.5 29.5,18.5 24.9,21.8 26.6,27.3 22,24 17.4,27.3 19.1,21.8 14.5,18.5 20.2,18.5" fill="#ffc83d" opacity="0.9"/>
      </svg>
    ),
  },
  {
    key: "specialists", label: "Specialists",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring */}
        <circle cx="22" cy="22" r="13" stroke="#00ff88" strokeWidth="1.5" opacity="0.8"/>
        {/* Mid ring */}
        <circle cx="22" cy="22" r="7" fill="rgba(0,255,136,0.07)" stroke="#00ff88" strokeWidth="1" opacity="0.6"/>
        {/* Center dot */}
        <circle cx="22" cy="22" r="2" fill="#00ff88"/>
        {/* Cross lines — gap in center */}
        <line x1="22" y1="6" x2="22" y2="15" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="22" y1="29" x2="22" y2="38" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="22" x2="15" y2="22" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="29" y1="22" x2="38" y2="22" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Corner ticks */}
        <line x1="10" y1="10" x2="12.5" y2="12.5" stroke="#00ff88" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <line x1="34" y1="10" x2="31.5" y2="12.5" stroke="#00ff88" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <line x1="10" y1="34" x2="12.5" y2="31.5" stroke="#00ff88" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <line x1="34" y1="34" x2="31.5" y2="31.5" stroke="#00ff88" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    key: "weapons", label: "Weapons",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Barrel */}
        <rect x="5" y="19" width="24" height="6" rx="1.5" fill="rgba(255,100,100,0.12)" stroke="#ff6464" strokeWidth="1.3"/>
        {/* Muzzle flash area */}
        <rect x="29" y="20.5" width="10" height="3" rx="1" fill="rgba(255,150,50,0.2)" stroke="#ff9632" strokeWidth="1"/>
        <ellipse cx="39" cy="22" rx="2.5" ry="1.5" fill="#ff9632" opacity="0.85"/>
        {/* Handle */}
        <path d="M16 25 L16 35 Q16.5 36.5 18 36.5 L22 36.5 Q23.5 36.5 23.5 35 L23.5 25" fill="rgba(255,80,80,0.1)" stroke="#ff6464" strokeWidth="1.2"/>
        {/* Scope rail */}
        <rect x="11" y="14.5" width="10" height="4.5" rx="1" fill="rgba(255,100,100,0.1)" stroke="#ff6464" strokeWidth="1"/>
        <circle cx="16" cy="17" r="1.8" fill="none" stroke="#ff6464" strokeWidth="0.9"/>
        <circle cx="16" cy="17" r="0.7" fill="#ff6464" opacity="0.8"/>
        {/* Energy cell */}
        <rect x="19" y="26" width="4" height="6" rx="0.8" fill="#ff4444" opacity="0.55"/>
      </svg>
    ),
  },
  {
    key: "body armour", label: "Body Armour",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield outer */}
        <path d="M22 6 L36 13 L36 26 Q36 37 22 42 Q8 37 8 26 L8 13 Z" fill="rgba(0,42,168,0.18)" stroke="#4f8fff" strokeWidth="1.5"/>
        {/* Shield inner */}
        <path d="M22 11 L31 17 L31 25 Q31 33 22 37 Q13 33 13 25 L13 17 Z" fill="rgba(0,80,255,0.08)" stroke="#4f8fff" strokeWidth="0.9" opacity="0.55"/>
        {/* Energy core */}
        <circle cx="22" cy="25" r="5" fill="rgba(0,150,255,0.2)" stroke="#00d4ff" strokeWidth="1.3"/>
        <circle cx="22" cy="25" r="2.5" fill="rgba(0,200,255,0.4)" stroke="#00d4ff" strokeWidth="0.8"/>
        <circle cx="22" cy="25" r="1" fill="#00d4ff" opacity="0.95"/>
      </svg>
    ),
  },
  {
    key: "spaceships", label: "Spaceships",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main hull — points right */}
        <path d="M7 22 L28 13 L39 22 L28 31 Z" fill="rgba(100,180,255,0.13)" stroke="#6eb4ff" strokeWidth="1.5"/>
        {/* Wing details */}
        <line x1="13" y1="22" x2="28" y2="22" stroke="#6eb4ff" strokeWidth="0.8" opacity="0.45"/>
        <line x1="28" y1="13" x2="28" y2="31" stroke="#6eb4ff" strokeWidth="0.8" opacity="0.35"/>
        {/* Cockpit */}
        <ellipse cx="28" cy="22" rx="5.5" ry="3.5" fill="rgba(0,200,255,0.18)" stroke="#00d4ff" strokeWidth="1.1"/>
        {/* Engine glow */}
        <ellipse cx="8" cy="22" rx="3.5" ry="2" fill="rgba(255,120,40,0.45)" stroke="#ff8030" strokeWidth="0.9"/>
        <ellipse cx="7" cy="22" rx="1.5" ry="1" fill="#ffaa60" opacity="0.9"/>
        {/* Wing guns */}
        <line x1="18" y1="16" x2="26" y2="16" stroke="#6eb4ff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <line x1="18" y1="28" x2="26" y2="28" stroke="#6eb4ff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
  {
    key: "racing vehicles", label: "Vehicles",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Car body */}
        <path d="M5 26 L9 20 L19 18 L32 18 L39 24 L39 30 L5 30 Z" fill="rgba(255,50,100,0.12)" stroke="#ff3264" strokeWidth="1.4"/>
        {/* Canopy */}
        <path d="M13 20 L17 14.5 L28 14.5 L33 20" fill="rgba(0,200,255,0.12)" stroke="#00d4ff" strokeWidth="1.1"/>
        {/* Wheels */}
        <circle cx="13" cy="30" r="5" fill="rgba(20,20,40,0.9)" stroke="#6eb4ff" strokeWidth="1.3"/>
        <circle cx="32" cy="30" r="5" fill="rgba(20,20,40,0.9)" stroke="#6eb4ff" strokeWidth="1.3"/>
        <circle cx="13" cy="30" r="2" fill="#6eb4ff" opacity="0.65"/>
        <circle cx="32" cy="30" r="2" fill="#6eb4ff" opacity="0.65"/>
        {/* Speed lines */}
        <line x1="1" y1="22" x2="7" y2="22" stroke="#ff3264" strokeWidth="1.2" strokeLinecap="round" opacity="0.75"/>
        <line x1="1" y1="25" x2="5" y2="25" stroke="#ff3264" strokeWidth="1" strokeLinecap="round" opacity="0.45"/>
        {/* Intake / front scoop */}
        <path d="M37 22 L41 23.5 L37 25" fill="none" stroke="#ff3264" strokeWidth="1" opacity="0.5"/>
      </svg>
    ),
  },
  {
    key: "artwork", label: "Artwork",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Diamond gem */}
        <polygon points="22,6 37,20 22,38 7,20" fill="rgba(180,100,255,0.1)" stroke="#c864ff" strokeWidth="1.5"/>
        {/* Top facets */}
        <polygon points="22,6 37,20 22,20" fill="rgba(200,130,255,0.07)" stroke="#c864ff" strokeWidth="0.8" opacity="0.6"/>
        <polygon points="22,6 7,20 22,20" fill="rgba(180,100,255,0.05)" stroke="#c864ff" strokeWidth="0.8" opacity="0.5"/>
        {/* Bottom facets */}
        <polygon points="22,38 37,20 22,20" fill="rgba(140,60,220,0.1)" stroke="#c864ff" strokeWidth="0.8" opacity="0.4"/>
        {/* Middle line */}
        <line x1="7" y1="20" x2="37" y2="20" stroke="#c864ff" strokeWidth="0.9" opacity="0.55"/>
        {/* Center vertical */}
        <line x1="22" y1="6" x2="22" y2="38" stroke="#c864ff" strokeWidth="0.5" opacity="0.3"/>
        {/* Shine streak */}
        <line x1="15" y1="13" x2="13" y2="17" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
      </svg>
    ),
  },
  {
    key: "land and bases", label: "Land & Bases",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hex platform */}
        <polygon points="22,28 33,22 33,12 22,6 11,12 11,22" fill="rgba(0,42,168,0.15)" stroke="#4f8fff" strokeWidth="1.5"/>
        {/* Inner hex */}
        <polygon points="22,24 29,20 29,14 22,10 15,14 15,20" fill="none" stroke="#4f8fff" strokeWidth="0.8" opacity="0.45"/>
        {/* Tower */}
        <rect x="19.5" y="28" width="5" height="9" rx="1" fill="rgba(0,42,168,0.25)" stroke="#4f8fff" strokeWidth="1.1"/>
        {/* Tower top */}
        <rect x="18" y="26" width="8" height="2.5" rx="0.8" fill="rgba(0,80,255,0.2)" stroke="#4f8fff" strokeWidth="1"/>
        {/* Antenna */}
        <line x1="22" y1="6" x2="22" y2="2.5" stroke="#4f8fff" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="22" cy="2" r="1.8" fill="#00d4ff" opacity="0.9"/>
        {/* Ground line */}
        <line x1="7" y1="39" x2="37" y2="39" stroke="#4f8fff" strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
  },
  {
    key: "general", label: "General",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Box body */}
        <rect x="9" y="18" width="26" height="18" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
        {/* Box lid */}
        <path d="M7 18 L22 10 L37 18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
        {/* Lid centre line */}
        <line x1="22" y1="10" x2="22" y2="18" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
        {/* Front clasp */}
        <rect x="19" y="24" width="6" height="4" rx="1" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      </svg>
    ),
  },
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
  "military badges": [
    { _id: "fb-1", name: "Commander's Cross", priceETH: 300, description: "Rare commander's cross awarded for battlefield leadership.", parentCategory: "military badges" },
    { _id: "fb-2", name: "Purple Valor Medal", priceETH: 250, description: "Medal of valor for exceptional bravery under fire.", parentCategory: "military badges" },
    { _id: "fb-3", name: "HyperTek Coin 2025", priceETH: 180, description: "Limited edition collectible coin for season 2025.", parentCategory: "military badges" },
    { _id: "fb-4", name: "Iron Shield Badge", priceETH: 140, description: "Badge denoting mastery of defensive tactics.", parentCategory: "military badges" },
    { _id: "fb-5", name: "Star of Honour", priceETH: 500, description: "The highest honour awarded in the HyperTek universe.", parentCategory: "military badges" },
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
  "general": [
    { _id: "fg-1", name: "HyperTek Starter Pack", priceETH: 50, description: "A bundle of miscellaneous items to kick-start your journey.", parentCategory: "general" },
    { _id: "fg-2", name: "Collector's Badge", priceETH: 30, description: "Rare collectible badge for dedicated community members.", parentCategory: "general" },
    { _id: "fg-3", name: "Mystery Crate", priceETH: 75, description: "Contains a random rare item from the HyperTek universe.", parentCategory: "general" },
    { _id: "fg-4", name: "Season Pass Token", priceETH: 120, description: "Grants access to exclusive season events and rewards.", parentCategory: "general" },
    { _id: "fg-5", name: "Community Tribute", priceETH: 25, description: "A commemorative token for early HyperTek community supporters.", parentCategory: "general" },
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
        await Promise.all(
          parents.map(async (parent) => {
            try {
              const sub = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );
              if (sub.data.success && sub.data.subCollections?.length) {
                const rawKey = (parent.category || parent.collection?.name || "other").toLowerCase().trim();
                const catKey = CAT_ALIAS[rawKey] || rawKey;
                if (!map[catKey]) map[catKey] = [];
                map[catKey].push(
                  ...sub.data.subCollections.map((s) => ({
                    ...s,
                    parentId:       parent._id,
                    parentCategory: catKey,
                    parentName:     parent.collection?.name || "",
                    isDummy:        parent.isDummy === true,
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
