/**
 * TopBar — HUD strip.
 * WALLET: inline modal (MetaMask), stays on Gaming page.
 * MARKETPLACE: dropdown → navigates to /market-place?tab=X
 */

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../Redux/AuthSlice";
import symbol from "../../assets/images/login/Symbol.svg.webp";
import useMobileLandscape from "../../hooks/useMobileLandscape";
import { Rocket } from "lucide-react";
import i18n from "../../i18n/index.js";

// Per-game resource values (mock — replace with API per game)
const GAME_RESOURCES = {
  RACING: { FOOD: 61.7, OIL: 59.8, CRYSTALS: 3.4, FUEL: 102.6, ORE: 13.5 },
  QUEST: { FOOD: 12.9, OIL: 102.7, CRYSTALS: 1.8, FUEL: 125.2, ORE: 14.8 },
  OVERLORD: { FOOD: 45.3, OIL: 9.4, CRYSTALS: 4.7, FUEL: 191.0, ORE: 19.8 },
};

function fmtVal(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}B`;
  return `${n.toFixed(1)}M`;
}

// 5 resources per Don's brief — each has open/stored for dropdown
const RESOURCE_META = [
  { id: "FOOD", label: "Food", color: "#6ee7b7", img: "/icon_food.webp", openSuffix: "5.3B" },
  { id: "OIL", label: "Oil", color: "#94a3b8", img: "/icon_oil.webp", openSuffix: "1.4B" },
  { id: "CRYSTALS", label: "Energy Crystals", color: "#c4b5fd", img: "/icon_energy.webp", openSuffix: "39M" },
  { id: "FUEL", label: "Fuel", color: "#fb923c", img: "/icon_fuel.webp", openSuffix: "766M" },
  { id: "ORE", label: "Ore", color: "#cbd5e1", img: "/icon_ore.webp", openSuffix: "821M" },
];

// Resources panel categories per Don's brief
const RES_CATEGORIES = [
  {
    id: "endurance", label: "Endurance", locked: false,
    items: [{ key: "endurance", label: "Endurance", val: "8825" }],
  },
  {
    id: "water", label: "Water", locked: false,
    items: [{ key: "water", label: "Water", val: "24.5M" }, { key: "waterHeavy", label: "Water Heavy", val: "3.8M" }],
  },
  {
    id: "furuseth", label: "Furuseth Crystals", locked: false,
    items: [
      { key: "fCrystals1", label: "F Crystals lvl 1", val: "34,521" }, { key: "fCrystals2", label: "F Crystals lvl 2", val: "25,579" },
      { key: "fCrystals3", label: "F Crystals lvl 3", val: "12,728" }, { key: "fCrystals4", label: "F Crystals lvl 4", val: "7,356" },
      { key: "fCrystals5", label: "F Crystals lvl 5", val: "2,698" },
    ],
  },
  {
    id: "gems", label: "Gems", locked: false,
    items: [{ key: "gems", label: "Gems", val: "57,231" }],
  },
  {
    id: "minerals", label: "Minerals", locked: false,
    items: [
      { key: "cotton", label: "Cotton", val: "45,561" }, { key: "silk", label: "Silk", val: "15,961" }, { key: "wood", label: "Wood", val: "2,168,546" },
      { key: "carbon", label: "Carbon", val: "7,562" }, { key: "silica", label: "Silica", val: "48,389" }, { key: "ash", label: "Ash", val: "14,734" },
    ],
  },
  {
    id: "crystals", label: "Crystals", locked: false,
    items: [
      { key: "whiteCrystals", label: "White Crystals", val: "1,569" }, { key: "greenCrystals", label: "Green Crystals", val: "2,487" },
      { key: "blueCrystals", label: "Blue Crystals", val: "2,513" }, { key: "redCrystals", label: "Red Crystals", val: "842" },
      { key: "clearCrystals", label: "Clear Crystals", val: "4,116" },
    ],
  },
  {
    id: "timeclocks", label: "Time Clocks", locked: false,
    items: [
      { key: "min5", label: "5-minute", val: "55056" }, { key: "min15", label: "15-minute", val: "25648" },
      { key: "min30", label: "30-minute", val: "9878" }, { key: "hour1", label: "1 Hour", val: "54569" },
      { key: "hour3", label: "3 Hour", val: "42123" }, { key: "hour8", label: "8 Hour", val: "3212" },
      { key: "hour12", label: "12 Hour", val: "1247" }, { key: "hour24", label: "24 Hour", val: "947" },
    ],
  },
];

const ROOM_DETAILS = {
  // Level 1
  storeroom: { title: "Storeroom", desc: "Central storage hub for raw materials and harvested resources. Manages inventory distribution across mining and refinery operations." },
  mining_fs: { title: "Mining FS", desc: "Forward starboard mining bay. Equipped with deep-core extraction arrays for mineral and ore collection in open space." },
  mining_fp: { title: "Mining FP", desc: "Forward port mining bay. Mirrors the starboard unit, doubling extraction capacity during resource-rich field operations." },
  process_ref: { title: "Process Refinery", desc: "Converts raw ore and minerals into refined alloys. Critical for fuel synthesis and ship upgrade materials." },
  mining_rs: { title: "Mining RS", desc: "Rear starboard mining unit. Angled at -45° for lateral field sweeps during slow-drift asteroid harvesting." },
  mining_rp: { title: "Mining RP", desc: "Rear port mining unit. Works in tandem with RS bay to maximise rear-field resource extraction yield." },
  fuel_ref: { title: "Fuel Refinery", desc: "Processes refined alloys into propulsion-grade fuel. Supplies the main engine and emergency thruster reserves." },
  workshop: { title: "Workshop", desc: "Ship maintenance and fabrication center. Handles component repairs, part manufacturing, and equipment upgrades." },
  racing: { title: "Racing Hangar", desc: "Dedicated bay housing racing drones and light craft. Supports Racing game mode deployment and pit-stop operations." },
  brig: { title: "Brig", desc: "Secure containment cell for prisoners and valuable cargo. Reinforced walls prevent unauthorized access or escape." },
  // Level 2
  armory_ss: { title: "Armory SS", desc: "Starboard-side weapons locker. Stores and maintains small arms, crew protection gear and personal defense systems." },
  armory_ps: { title: "Armory PS", desc: "Port-side weapons locker. Mirrors the SS armory providing balanced loadout access across both sides of the vessel." },
  main_weapon: { title: "Main Weapon Heavy", desc: "Primary heavy weapon emplacement. Houses the ship's most powerful offensive systems for large-scale combat engagements." },
  fwd_shield: { title: "Forward Shield Gen", desc: "Generates a protective energy barrier across the ship's bow. First line of defense against incoming projectiles and energy attacks." },
  fighter_fss: { title: "Fighter Bay FSS", desc: "Forward starboard bay housing compact fighter craft. Enables rapid deployment of escort fighters during combat and patrol missions." },
  fighter_fps: { title: "Fighter Bay FPS", desc: "Forward port fighter bay. Operates in tandem with FSS bay for coordinated fighter squadron launches." },
  fighter_rss: { title: "Fighter Bay RSS", desc: "Rear starboard nacelle fighter bay. Supports rearguard operations and pursuit interception scenarios." },
  fighter_rps: { title: "Fighter Bay RPS", desc: "Rear port nacelle fighter bay. Provides symmetrical rear-coverage for full defensive fighter deployment." },
  barracks_ss: { title: "Barracks SS", desc: "Starboard crew quarters for combat personnel. Houses soldiers, pilots and security teams with bunk systems and equipment lockers." },
  barracks_ps: { title: "Barracks PS", desc: "Port crew quarters. Identical layout to SS barracks ensuring equal crew distribution and rapid mobilisation from either side." },
  stables_ss: { title: "Stables SS", desc: "Starboard biological asset bay. Houses alien mounts and bio-engineered creatures used in planetary surface operations." },
  stable_ps: { title: "Stable PS", desc: "Port biological asset bay. Mirrors the SS stables for balanced creature load and symmetric weight distribution." },
  transporter: { title: "Transporter Bay", desc: "Quantum-assisted personnel and cargo transport system. Enables rapid short-range teleportation to planetary surfaces or nearby vessels." },
  security: { title: "Security Station", desc: "Ship-wide surveillance and threat response hub. Monitors all decks and coordinates internal security protocols." },
  weapons_ss: { title: "Weapons Systems SS", desc: "Starboard weapons management console. Controls targeting arrays, firing sequences and ammunition logistics for starboard armaments." },
  weapons_ps: { title: "Weapons Systems PS", desc: "Port weapons management console. Provides full independent control of all port-side weapon platforms." },
  power_plant: { title: "Power Plant", desc: "Core energy generation unit. Provides stable power output to all ship systems via circular plasma containment technology." },
  power_sys: { title: "Power Systems", desc: "Power distribution and regulation hub. Manages load balancing between weapons, shields, engines and life support systems." },
  energy_dist: { title: "Energy Distribution", desc: "Secondary energy routing node. Ensures consistent power delivery to mid-ship and rear-section systems under high-demand conditions." },
  main_engine: { title: "Main Ship's Engine", desc: "Primary propulsion system powering all sub-light travel. Generates thrust via antimatter-catalyzed plasma jets." },
  // Level 3
  navigation: { title: "Navigation", desc: "Central navigation and helm control station. Manages course plotting, astrocartography and real-time positional tracking." },
  flight_deck: { title: "Flight Deck", desc: "Main piloting station. Controls all flight operations including take-off, landing, orbital manoeuvres and emergency evasive actions." },
  weapons_off: { title: "Weapons Officer", desc: "Tactical weapons command post. Coordinates offensive and defensive weapons fire under the direct command of the Weapons Officer." },
  comms_off: { title: "Comm's Officer", desc: "Communication and signal interception hub. Handles all inter-ship, alliance and planetary communications including encrypted channels." },
  capt_quarters: { title: "Captain's Quarters", desc: "Private quarters for the ship's commanding officer. Contains secure data terminals and private briefing facilities." },
  kitchen: { title: "Kitchen", desc: "Crew nutrition and food preparation facility. Processes stored food resources and synthesises nutritional supplements for long-haul voyages." },
  mess_hall: { title: "Mess Hall", desc: "Communal dining and recreation space. Serves as crew morale hub during downtime between combat and resource operations." },
  hydro_1: { title: "Hydroponics Cell 1", desc: "Automated growing unit producing fresh food and medicinal plants. Reduces dependency on stored provisions for extended missions." },
  hydro_2: { title: "Hydroponics Cell 2", desc: "Secondary hydroponics cell expanding crop variety and yield. Supports crew nutrition and trade commodity production." },
  hydro_3: { title: "Hydroponics Cell 3", desc: "Tertiary growing unit specialised in high-yield staple crops. Provides baseline caloric supply for large crew complements." },
  hydro_4: { title: "Hydroponics Cell 4", desc: "Medicinal and botanical research cell. Grows rare species used in medical treatment and alchemical synthesis." },
  hydro_5: { title: "Hydroponics Cell 5", desc: "Exotic plant cultivation bay. Produces luxury goods and rare flora for trading on the marketplace." },
  hydro_6: { title: "Hydroponics Cell 6", desc: "High-growth experimental cell. Tests new crop strains developed through genetic modification programs." },
  shield_main: { title: "Shield Gen Main", desc: "Primary multi-directional shield generator. Projects an energy barrier around the entire hull during combat situations." },
  power_relay1: { title: "Power Relay 1", desc: "Upper-deck power relay junction. Routes energy from the power plant to forward weapons and shield arrays." },
  power_relay2: { title: "Power Relay 2", desc: "Lower-deck power relay junction. Distributes power to engine nacelles and rear defensive systems." },
  hidden_st1: { title: "Hidden Storage 1", desc: "Concealed high-security vault. Stores classified cargo, valuable artefacts and contraband away from standard inventory scans." },
  hidden_st2: { title: "Hidden Storage 2", desc: "Secondary concealed vault. Additional secure space for mission-critical items requiring maximum discretion." },
  cargo_1: { title: "Cargo Hold 1", desc: "Primary bulk cargo bay. Designed for large-volume resource transport including ores, refined metals and trade goods." },
  cargo_2: { title: "Cargo Hold 2", desc: "Secondary cargo bay optimised for fragile or temperature-sensitive loads. Climate-controlled storage conditions." },
  cargo_3: { title: "Cargo Hold 3", desc: "Tertiary cargo bay. Configurable layout supports mixed loads including vehicles, containers and oversized equipment." },
  // Level 4
  war_council: { title: "War Council", desc: "Strategic command chamber. Senior officer briefing table where battle plans, alliance strategies and campaign objectives are coordinated." },
  academy: { title: "Academy", desc: "Crew training and education facility. Enables skill advancement, specialisation unlocks and officer development programs." },
  science_lab: { title: "Science Lab", desc: "Research and development center. Conducts experiments in materials science, propulsion theory and alien technology analysis." },
  dna_lab: { title: "DNA Lab", desc: "Genetic research facility. Develops biological enhancements for crew, creates new species variants and researches alien DNA samples." },
  cryostasis: { title: "Cryostasis", desc: "Long-range voyage suspension system. Places crew in cryogenic stasis to preserve resources during multi-year deep-space journeys." },
  dna_chambers: { title: "DNA Chambers", desc: "Genetic modification bays. Applies researched DNA enhancements directly to crew members and biological units." },
  weapons_relay: { title: "Weapons Power Relay", desc: "Dedicated power management node for heavy weapons systems. Ensures stable energy supply during sustained combat engagements." },
  comms_tower: { title: "Comm's Tower", desc: "Long-range deep-space communications array. Enables fleet-wide broadcasts, interstellar transmissions and alliance coordination across vast distances." },
};

const MARKET_ITEMS = [
  { key: "overview",    label: "Overview",    tab: "overview"  },
  { key: "marketplace", label: "Marketplace", tab: "general"   },
  { key: "auction",     label: "Auction",     tab: "auctions"  },
  { key: "trade",       label: "Trade",       tab: "trades"    },
  { key: "quest",       label: "Quest",       tab: "quests"    },
];

const LANG_LIST = [
  { code: "en-GB", cc: "gb", label: "English (UK)"    },
  { code: "en-US", cc: "us", label: "English (US)"    },
  { code: "fr",    cc: "fr", label: "Français"        },
  { code: "it",    cc: "it", label: "Italiano"        },
  { code: "de",    cc: "de", label: "Deutsch"         },
  { code: "es",    cc: "es", label: "Español"         },
  { code: "ru",    cc: "ru", label: "Русский"         },
  { code: "ko",    cc: "kr", label: "한국어"           },
  { code: "ja",    cc: "jp", label: "日本語"           },
  { code: "pt",    cc: "br", label: "Português"       },
  { code: "ar",    cc: "sa", label: "العربية"         },
  { code: "ms",    cc: "my", label: "Melayu"          },
  { code: "no",    cc: "no", label: "Norsk"           },
  { code: "nl",    cc: "nl", label: "Nederlands"      },
  { code: "th",    cc: "th", label: "ไทย"             },
  { code: "tr",    cc: "tr", label: "Türkçe"          },
  { code: "vi",    cc: "vn", label: "Việt"            },
  { code: "id",    cc: "id", label: "Indonesia"       },
  { code: "zh",    cc: "cn", label: "简体中文"         },
  { code: "zh-TW", cc: "tw", label: "繁體中文"         },
  { code: "sv",    cc: "se", label: "Svenska"         },
  { code: "he",    cc: "il", label: "עברית"           },
  { code: "da",    cc: "dk", label: "Dansk"           },
  { code: "ro",    cc: "ro", label: "Română"          },
  { code: "fil",   cc: "ph", label: "Filipino"        },
  { code: "hi",    cc: "in", label: "हिंदी"            },
  { code: "pl",    cc: "pl", label: "Polski"          },
  { code: "el",    cc: "gr", label: "Ελληνικά"        },
];

const LangFlag = ({ cc, size = 20 }) => (
  <img
    src={`https://flagcdn.com/w${size}/${cc}.png`}
    srcSet={`https://flagcdn.com/w${size * 2}/${cc}.png 2x`}
    width={size}
    height={Math.round(size * 0.75)}
    alt=""
    style={{ objectFit: "cover", borderRadius: 2, display: "block", flexShrink: 0 }}
  />
);

const CSS = `
  .res-slot {
    transition: background 0.15s, color 0.15s;
  }
  .res-slot:hover {
    background: rgba(255,255,255,0.22) !important;
    color: #fff !important;
  }
  button.res-slot:hover {
    box-shadow: 0 0 18px rgba(0,212,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25) !important;
    border-color: rgba(255,255,255,0.55) !important;
  }
  .logout-btn:hover {
    box-shadow: 0 0 22px rgba(248,113,113,0.55), inset 0 1px 0 rgba(255,255,255,0.1) !important;
    transform: scale(1.07);
    border-color: #f87171 !important;
    color: #fff !important;
  }
  .market-dropdown-item {
    transition: background 0.14s, color 0.14s;
    cursor: pointer;
  }
  .market-dropdown-item:hover {
    background: rgba(0,212,255,0.12) !important;
    color: #fff !important;
  }
  @keyframes dropdownFade {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .market-dropdown { animation: dropdownFade 0.18s ease both; }

  @keyframes walletModalFade {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  .wallet-modal { animation: walletModalFade 0.22s ease both; }

  .lang-dropdown::-webkit-scrollbar { width: 3px; }
  .lang-dropdown::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  .lang-dropdown::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.35); border-radius: 2px; }
  .lang-dropdown::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.65); }

  .sections-scroll::-webkit-scrollbar { width: 3px; }
  .sections-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
  .sections-scroll::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.55); border-radius: 2px; }
  .sections-scroll::-webkit-scrollbar-thumb:hover { background: rgba(251,191,36,0.85); }
  .sections-scroll { scrollbar-width: thin; scrollbar-color: rgba(251,191,36,0.55) rgba(0,0,0,0.3); }

  @keyframes spinLoader {
    to { transform: rotate(360deg); }
  }
  .wallet-spinner { animation: spinLoader 0.9s linear infinite; }
`;

// Ship room data — positions as % of each level's PNG image (x, y, w, h)
const SHIP_ROOMS = {
  1: [
    {
      id: "storeroom", name: "Storeroom", x: 5, y: 28, w: 14, h: 36,
      tRight: { stemW: 45, armTop: 33, armBot: 67 }
    },
    { id: "mining_fs", name: "Mining FS", x: 12, y: 21, w: 20, h: 16 },
    { id: "mining_fp", name: "Mining FP", x: 12, y: 54, w: 20, h: 16 },
    { id: "process_ref", name: "Process Refinery", x: 18, y: 37, w: 9, h: 17 },
    { id: "mining_rs", name: "Mining RS", x: 68, y: 14, w: 18, h: 20, rotate: -45 },
    { id: "mining_rp", name: "Mining RP", x: 68, y: 58, w: 18, h: 20, rotate: 45 },
    { id: "fuel_ref", name: "Fuel Refinery", x: 64, y: 40, w: 25, h: 10 },
    { id: "workshop", name: "Workshop", x: 45, y: 21, w: 14, h: 24 },
    { id: "racing", name: "Racing Hanger", x: 45, y: 47, w: 14, h: 24 },
    { id: "brig", name: "Brig", x: 62, y: 59, w: 6, h: 8 },
  ],
  2: [
    /* ── oval left section ── */
    { id: "armory_ss", name: "Armory SS", x: 7, y: 30, w: 12, h: 10 },  /* 1 */
    { id: "armory_ps", name: "Armory PS", x: 7, y: 51, w: 12, h: 10 },  /* 2 */
    { id: "main_weapon", name: "Main Weapon Heavy", x: 2, y: 41, w: 19, h: 10 },  /* 3 */
    { id: "fwd_shield", name: "Forward Shield Gen", x: 20, y: 40, w: 8, h: 10 },  /* 4 */
    /* ── center chambers ── */
    { id: "fighter_fss", name: "Fighter Bay FSS", x: 21, y: 22, w: 16, h: 18 },  /* 5 */
    { id: "fighter_fps", name: "Fighter Bay FPS", x: 21, y: 50, w: 16, h: 18 },  /* 6 */
    /* ── far right nacelles ── */
    { id: "fighter_rss", name: "Fighter Bay RSS", x: 72, y: 6, w: 10, h: 25 },  /* 7 */
    { id: "fighter_rps", name: "Fighter Bay RPS", x: 72, y: 60, w: 10, h: 25 },  /* 8 */
    /* ── mid-right upper/lower ── */
    { id: "barracks_ss", name: "Barracks SS", x: 46, y: 21, w: 18, h: 10 },  /* 9  */
    { id: "barracks_ps", name: "Barracks PS", x: 46, y: 62, w: 18, h: 10 },  /* 10 */
    { id: "stables_ss", name: "Stables SS", x: 59, y: 25, w: 12, h: 13, lShape: { notch: "topLeft", notchW: 50, notchH: 46 } },  /* 11 — menonjol bawah-kiri */
    { id: "stable_ps", name: "Stable PS", x: 59, y: 53, w: 12, h: 13, lShape: { notch: "bottomLeft", notchW: 50, notchH: 50 } },  /* 12 — menonjol atas-kiri */
    /* ── center-right grid ── */
    { id: "transporter", name: "Transporter Bay", x: 38, y: 25, w: 8, h: 19 },  /* 13 */
    { id: "security", name: "Security Station", x: 38, y: 45, w: 8, h: 19 },  /* 14 */
    { id: "weapons_ss", name: "Weapons Systems SS", x: 47, y: 32, w: 10, h: 12, triangle: "topLeft" },  /* 15 — 90° di atas-kiri */
    { id: "weapons_ps", name: "Weapons Systems PS", x: 47, y: 47, w: 10, h: 12, triangle: "bottomLeft" },  /* 16 — 90° di bawah-kiri */
    /* ── power core ── */
    { id: "power_plant", name: "Power Plant", x: 52, y: 40, w: 8, h: 12, circle: true },  /* 17 */
    { id: "power_sys", name: "Power Systems", x: 60, y: 38, w: 11, h: 15 },  /* 18 */
    /* ── engine section ── */
    { id: "energy_dist", name: "Energy Distribution", x: 72, y: 40, w: 8, h: 10 },  /* 19 */
    { id: "main_engine", name: "Main Ship's Engine", x: 82, y: 21, w: 15, h: 49 },  /* 20 */
  ],
  3: [
    /* ── forward section (left oval) ── */
    { id: "navigation", name: "Navigation", x: 19, y: 36, w: 5, h: 18 },  /* 1  */
    { id: "flight_deck", name: "Flight Deck", x: 24, y: 38, w: 5, h: 14 },  /* 2  */
    { id: "weapons_off", name: "Weapons Officer", x: 24, y: 33, w: 5, h: 5 },  /* 3  */
    { id: "comms_off", name: "Comm's Officer", x: 24, y: 52, w: 5, h: 5 },  /* 4  */
    /* ── crew quarters / galley ── */
    { id: "capt_quarters", name: "Capt's Quarters", x: 29, y: 50, w: 9, h: 9 },  /* 5  */
    { id: "kitchen", name: "Kitchen", x: 40, y: 47, w: 6, h: 12 },  /* 6  */
    /* ── mess hall ── */
    { id: "mess_hall", name: "Mess Hall", x: 38, y: 32, w: 8, h: 12 },  /* 7  */
    /* ── hydroponics grid 3×2 ── */
    { id: "hydro_1", name: "Hydroponics Cell", x: 47, y: 28, w: 9, h: 15 },  /* 8  */
    { id: "hydro_2", name: "Hydroponics Cell", x: 56, y: 28, w: 7, h: 15 },  /* 9  */
    { id: "hydro_3", name: "Hydroponics Cell", x: 63, y: 28, w: 6, h: 15 },  /* 10 */
    { id: "hydro_4", name: "Hydroponics Cell", x: 47, y: 47, w: 9, h: 15 },  /* 11 */
    { id: "hydro_5", name: "Hydroponics Cell", x: 56, y: 47, w: 7, h: 15 },  /* 12 */
    { id: "hydro_6", name: "Hydroponics Cell", x: 63, y: 47, w: 6, h: 15 },  /* 13 */
    /* ── shield & power ── */
    { id: "shield_main", name: "Shield Gen Main", x: 75, y: 39, w: 8, h: 12 },  /* 14 */
    { id: "power_relay1", name: "Power Relay 1", x: 70, y: 28, w: 3, h: 15 },  /* 15 */
    { id: "power_relay2", name: "Power Relay 2", x: 70, y: 47, w: 3, h: 15 },  /* 16 */
    /* ── hidden storage ── */
    { id: "hidden_st1", name: "Hidden Storage 1", x: 75, y: 25, w: 5, h: 11 },  /* 17 */
    { id: "hidden_st2", name: "Hidden Storage 2", x: 75, y: 54, w: 5, h: 11 },  /* 18 */
    /* ── cargo holds ── */
    { id: "cargo_1", name: "Cargo Hold", x: 85, y: 26, w: 10, h: 14 },  /* 19 */
    { id: "cargo_2", name: "Cargo Hold", x: 85, y: 40, w: 10, h: 11 },  /* 20 */
    { id: "cargo_3", name: "Cargo Hold", x: 85, y: 51, w: 10, h: 14 },  /* 21 */
  ],
  4: [
    { id: "war_council", name: "War Council", x: 23, y: 37, w: 7, h: 17 },  /* 1+2 merged */
    { id: "academy", name: "Academy", x: 40, y: 39, w: 10, h: 9 },  /* 3 */
    { id: "science_lab", name: "Science Lab", x: 54, y: 35, w: 10, h: 9 },  /* 4 */
    { id: "dna_lab", name: "DNA Lab", x: 54, y: 47, w: 10, h: 9 },  /* 5 */
    { id: "cryostasis", name: "Cryostasis", x: 64, y: 35, w: 10, h: 9 },  /* 6 */
    { id: "dna_chambers", name: "DNA Chambers", x: 64, y: 47, w: 10, h: 9 },  /* 7 — was DNA Chambers, now includes Weapons Power Relay area */
    { id: "weapons_relay", name: "Weapons Power Relay", x: 76, y: 38, w: 10, h: 13 },  /* 7 */
    { id: "comms_tower", name: "Comm's Tower", x: 87, y: 35, w: 8, h: 21 },  /* 8 */
  ],
};

// ── Skin 1 weapon hotspot data — positions as % of level1-cover.webp ──
// circle:true = elliptical hotspot; rotate = degrees for rect hotspots
// Total: 26 hotspots
//   Left section (18): 1 far-left bar + 2 diagonal bays
//                      + 6 PD upper + 2 center ovals + 1 center box + 6 PD lower
//   Right section (8): 2 flank strips + 3 spine guns + 1 mid rail + 2 nacelle bays
const SKIN1_GUNS = [
  /* ── #1  Far-left horizontal deck bar ── */
  { id: "far_left_bar",       name: "Front Main Canon",                  x: 1,  y: 46, w: 5,  h: 10 },

  /* ── #2-3  Diagonal gun bays (nose) ── */
  { id: "fore_port_bay",      name: "Starboard Gun Bank Forward",        x: 4,  y: 28, w: 22, h: 8,  rotate: -25 },
  { id: "fore_stbd_bay",      name: "Port Gun Bank Forward",             x: 4,  y: 67, w: 22, h: 8,  rotate:  25 },

  /* ── #4-9  Point Defense — UPPER 6 (diagonal pattern) ── */
  { id: "pd_gun_1",  name: "Cockpit Starboard Defence Cell 1",  x: 14, y: 36, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_2",  name: "Cockpit Starboard Defence Cell 2",  x: 19, y: 32, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_3",  name: "Cockpit Starboard Defence Cell 3",  x: 24, y: 28, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_4",  name: "Cockpit Starboard Defence Cell 4",  x: 29, y: 27, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_5",  name: "Cockpit Starboard Defence Cell 5",  x: 34, y: 27, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_6",  name: "Cockpit Starboard Defence Cell 6",  x: 39, y: 32, w: 4.5, h: 9, circle: true },

  /* ── #10-12  Center section — 2 ovals + 1 box ── */
  { id: "vert_oval_upper",    name: "Cockpit Center Defence Cell Lower", x: 19, y: 42, w: 5, h: 16, circle: true },
  { id: "vert_oval_lower",    name: "Cockpit Center Defence Cell Upper", x: 29, y: 42, w: 5, h: 16, circle: true },
  { id: "center_front_gun",   name: "Forward Upperdeck Gun Array",       x: 34, y: 44, w: 15,  h: 14 },

  /* ── #13-18  Point Defense — LOWER 6 (2 rows × 3) ── */
  { id: "pd_gun_7",  name: "Cockpit Port Defence Cell 1",  x: 14, y: 56, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_8",  name: "Cockpit Port Defence Cell 2",  x: 19, y: 62, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_9",  name: "Cockpit Port Defence Cell 3",  x: 24, y: 68, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_10", name: "Cockpit Port Defence Cell 4",  x: 29, y: 67, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_11", name: "Cockpit Port Defence Cell 5",  x: 34, y: 67, w: 4.5, h: 9, circle: true },
  { id: "pd_gun_12", name: "Cockpit Port Defence Cell 6",  x: 39, y: 62, w: 4.5, h: 9, circle: true },

  /* ── #19-20  Right body — top & bottom flank strips ── */
  { id: "upper_flank_array",  name: "Starboard Gun Bank Rear",   x: 52, y: 30,  w: 44, h: 7 },
  { id: "lower_flank_array",  name: "Port Gun Bank Rear",        x: 52, y: 65, w: 44, h: 7 },

  /* ── #21-23  Right body — spine guns (3 inline) ── */
  { id: "spine_gun_1",        name: "Mid Upperdeck Gun Array",   x: 53, y: 45, w: 10, h: 10 },
  { id: "spine_gun_2",        name: "Lower Central Spine Array", x: 63, y: 45, w: 10, h: 10 },
  { id: "spine_gun_3",        name: "Rear Central Spine Array",  x: 73, y: 45, w: 10,  h: 10 },

  /* ── #24  Right body — mid rail gun (trapezoid: wide-left → narrow-right) ── */
  { id: "mid_rail_gun",       name: "Central Tower Embankment",  x: 83, y: 40, w: 12, h: 20, trapRight: { topCut: 22, botCut: 22 } },

  /* ── #25-26  Far-right nacelle gun bays ── */
  { id: "upper_nacelle_bay",  name: "Starboard Wing Array",      x: 75, y: 4,  w: 22, h: 25 },
  { id: "lower_nacelle_bay",  name: "Port Wing Array",           x: 75, y: 74, w: 22, h: 25 },
];

const NAV_BTN_BASE = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.12) 100%)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.28)",
  borderRadius: "3px",
  color: "#00D4FF",
  fontFamily: "Orbitron,sans-serif",
  fontWeight: "bold",
  letterSpacing: "0.14em",
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
  boxShadow: "0 0 10px rgba(0,212,255,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",
  textShadow: "0 0 8px rgba(0,212,255,0.6)",
  transition: "background 0.15s, box-shadow 0.15s, color 0.15s, border-color 0.15s",
};

export default function TopBar({ activeGame, isPreview = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMobileLandscape();

  // ── Linked / Unlinked state ───────────────────────────────────────
  const [isLinked, setIsLinked] = useState(false);
  const [linkedTipOpen, setLinkedTipOpen] = useState(false);
  const linkedTipTimer = useRef(null);

  const openLinkedTip = () => { clearTimeout(linkedTipTimer.current); setLinkedTipOpen(true); };
  const closeLinkedTip = () => { linkedTipTimer.current = setTimeout(() => setLinkedTipOpen(false), 200); };

  // Resolve which game's resources to show
  const currentGame = activeGame || "RACING";   // default to RACING when on main screen

  const RESOURCES = isLinked
    ? RESOURCE_META.map((r) => {
      const total = Object.values(GAME_RESOURCES).reduce((sum, g) => sum + g[r.id], 0);
      return { ...r, value: fmtVal(total), open: fmtVal(total), stored: r.openSuffix };
    })
    : RESOURCE_META.map((r) => {
      const val = GAME_RESOURCES[currentGame]?.[r.id] ?? 0;
      return { ...r, value: fmtVal(val), open: fmtVal(val), stored: r.openSuffix };
    });

  const NAV_BTN = {
    ...NAV_BTN_BASE,
    height: isMobile ? "26px" : "clamp(28px,3.8vh,42px)",
    padding: isMobile ? "0 8px" : "0 10px",
    fontSize: isMobile ? "clamp(6px,0.62vw,8px)" : "clamp(7px,0.65vw,10px)",
  };

  // ── Resource dropdown ────────────────────────────────────────────
  const [activeRes, setActiveRes] = useState(null);  // resource id with open dropdown
  const resBarRef = useRef(null);
  const resHoverTimer = useRef(null);
  const openRes = (id) => { clearTimeout(resHoverTimer.current); setActiveRes(id); };
  const closeRes = () => { resHoverTimer.current = setTimeout(() => setActiveRes(null), 180); };

  // ── Resources panel (RESOURCES button) ───────────────────────────
  const [resPanelOpen, setResPanelOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const resPanelRef = useRef(null);
  const resPanelTimer = useRef(null);
  const openResPanel = () => { clearTimeout(resPanelTimer.current); setResPanelOpen(true); };
  const closeResPanel = () => { resPanelTimer.current = setTimeout(() => { setResPanelOpen(false); setActiveCat(null); }, 200); };

  // ── Ships dropdown + floor plan modal ────────────────────────────
  const [shipsOpen, setShipsOpen] = useState(false);
  const [shipLevel, setShipLevel] = useState(null);
  const [selectedShipSkins, setSelectedShipSkins] = useState({ 1: "plain" });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  // ── Skin detail popup (weapon layout) ────────────────────────────
  const [skinDetailOpen, setSkinDetailOpen] = useState(false);
  const [hoveredGun, setHoveredGun] = useState(null);
  const [selectedGun, setSelectedGun] = useState(null);

  const [vrShipOpen, setVrShipOpen] = useState(false);
  const [vrShipPairing, setVrShipPairing] = useState(false);
  const [vrShipPairDone, setVrShipPairDone] = useState(false);
  const vrShipRef      = useRef(null);
  const shipsRef       = useRef(null);
  const shipsTimer     = useRef(null);
  const openShips      = () => { clearTimeout(shipsTimer.current); setShipsOpen(true); };
  const closeShips     = () => { shipsTimer.current = setTimeout(() => setShipsOpen(false), 200); };
  const shipContentRef = useRef(null);
  const shipImgRef     = useRef(null);
  const shipItemRefs   = useRef({});

  // ── Ship modal: reset room selection when level changes ──────────
  useEffect(() => { setSelectedRoom(null); setHoveredRoom(null); }, [shipLevel]);

  // ── Marketplace dropdown ─────────────────────────────────────────
  const [marketOpen, setMarketOpen] = useState(false);
  const marketRef   = useRef(null);
  const marketTimer = useRef(null);
  const openMarket  = () => { clearTimeout(marketTimer.current); setMarketOpen(true); };
  const closeMarket = () => { marketTimer.current = setTimeout(() => setMarketOpen(false), 200); };

  // ── Resources category hover ──────────────────────────────────────
  const catTimer = useRef(null);
  const openCat  = (id) => { clearTimeout(catTimer.current); setActiveCat(id); };
  const closeCat = ()   => { catTimer.current = setTimeout(() => setActiveCat(null), 200); };

  // ── Language dropdown ─────────────────────────────────────────────
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");
  const langRef = useRef(null);

  const handleLangSelect = (code) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const activeLang = LANG_LIST.find(l => l.code === currentLang) || LANG_LIST[0];

  // ── Wallet modal ─────────────────────────────────────────────────
  const [walletOpen, setWalletOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (shipsRef.current && !shipsRef.current.contains(e.target))
        setShipsOpen(false);
      if (marketRef.current && !marketRef.current.contains(e.target))
        setMarketOpen(false);
      if (resPanelRef.current && !resPanelRef.current.contains(e.target)) {
        setResPanelOpen(false);
        setActiveCat(null);
      }
      if (resBarRef.current && !resBarRef.current.contains(e.target))
        setActiveRes(null);
      if (vrShipRef.current && !vrShipRef.current.contains(e.target)) {
        setVrShipOpen(false); setVrShipPairing(false); setVrShipPairDone(false);
      }
      if (langRef.current && !langRef.current.contains(e.target))
        setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleMarketNav = (tab) => {
    setMarketOpen(false);
    if (!isPreview) navigate(`/market-place?tab=${tab}`);
  };

  const connectMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }
    if (isConnecting) return;
    try {
      setIsConnecting(true);
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
        setTimeout(() => setWalletOpen(false), 1200);
      }
    } catch (err) {
      console.error("MetaMask error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const shortAddr = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Full-width HUD row ── */}
      <div style={{
        position: "absolute",
        top: isMobile ? "6px" : "18px",
        left: isMobile ? "13%" : "11%",
        right: isMobile ? "11%" : "11%",
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "4px" : "5px",
      }}>

        {/* 1. SHIPS — dropdown + floor plan modal */}
        <div ref={shipsRef} style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={openShips}
          onMouseLeave={closeShips}
        >
          <button
            className="res-slot"
            onClick={() => setShipsOpen(o => !o)}
            style={{
              ...NAV_BTN,
              borderColor: shipsOpen ? "rgba(251,191,36,0.9)" : undefined,
              color: "#fbbf24",
              textShadow: "0 0 8px rgba(251,191,36,0.6)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <Rocket size={14} style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.6))", flexShrink: 0 }} />
            {t("hud.ship", "SHIP")}
            <span style={{
              fontSize: "8px", display: "inline-block",
              transition: "transform 0.18s",
              transform: shipsOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}>▼</span>
          </button>

          {shipsOpen && (
            <div className="market-dropdown" style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0,
              minWidth: 220,
              background: "rgba(3,10,24,0.97)",
              border: "1px solid rgba(251,191,36,0.35)",
              borderRadius: 4,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(251,191,36,0.08)",
              zIndex: 100,
            }}>

              {/* ── Section 1: SHIP'S SKINS ── */}
              <div style={{
                padding: "7px 14px 6px",
                fontFamily: "Orbitron,sans-serif",
                fontSize: "clamp(9px,0.75vw,11px)",
                fontWeight: "bold", letterSpacing: "0.14em",
                color: "#fbbf24", textShadow: "0 0 8px rgba(251,191,36,0.6)",
                borderBottom: "1px solid rgba(251,191,36,0.18)",
              }}>{t("hud.shipSkins", "SHIP'S SKINS")}</div>

              <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { id: 1, label: "SKIN 1", unlocked: true },
                  { id: 2, label: "SKIN 2", unlocked: false },
                  { id: 3, label: "SKIN 3", unlocked: false },
                  { id: 4, label: "SKIN 4", unlocked: false },
                ].map(skin => {
                  const isActive = selectedShipSkins[1] === `skin${skin.id}` || (skin.id === 1 && selectedShipSkins[1] === "plain");
                  return (
                    <div
                      key={skin.id}
                      className={skin.unlocked ? "market-dropdown-item" : ""}
                      onClick={() => {
                        if (!skin.unlocked) return;
                        setSelectedShipSkins(s => ({ ...s, 1: `skin${skin.id}` }));
                        if (skin.id === 1) { setShipsOpen(false); setSkinDetailOpen(true); setSelectedGun(null); setHoveredGun(null); }
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "5px 6px", borderRadius: 3,
                        cursor: skin.unlocked ? "pointer" : "not-allowed",
                        border: isActive ? "1px solid rgba(251,191,36,0.6)" : "1px solid rgba(251,191,36,0.1)",
                        background: isActive ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.02)",
                        opacity: skin.unlocked ? 1 : 0.9,
                      }}
                    >
                      {/* Ship thumbnail */}
                      <div style={{
                        width: 48, height: 36, flexShrink: 0, borderRadius: 3,
                        overflow: "hidden",
                        border: `1px solid rgba(251,191,36,${skin.unlocked ? "0.4" : "0.15"})`,
                        background: "rgba(0,30,60,0.7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {skin.unlocked ? (
                          <img
                            src="/ships/level1-cover.webp"
                            alt={skin.label}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: 14, opacity: 0.4 }}>🔒</span>
                        )}
                      </div>
                      {/* Label */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: "Orbitron,sans-serif", fontSize: "clamp(8px,0.7vw,10px)",
                          fontWeight: "bold", letterSpacing: "0.1em",
                          color: isActive ? "#fbbf24" : skin.unlocked ? "rgba(251,191,36,0.8)" : "rgba(251,191,36,0.35)",
                        }}>{skin.label}</div>
                        <div style={{
                          fontFamily: "Orbitron,sans-serif", fontSize: 7,
                          letterSpacing: "0.06em", marginTop: 2,
                          color: skin.unlocked ? (isActive ? "#4ade80" : "rgba(255,255,255,0.4)") : "rgba(251,191,36,0.3)",
                        }}>
                          {skin.unlocked ? (isActive ? "✓ ACTIVE" : "AVAILABLE") : "NOT AVAILABLE"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Divider ── */}
              <div style={{ height: 1, background: "rgba(251,191,36,0.2)", margin: "0 10px" }} />

              {/* ── Section 2: SHIP LEVELS → floor plan ── */}
              <div style={{
                padding: "7px 14px 5px",
                fontFamily: "Orbitron,sans-serif",
                fontSize: "clamp(9px,0.75vw,11px)",
                fontWeight: "bold", letterSpacing: "0.14em",
                color: "rgba(251,191,36,0.6)",
              }}>FLOOR PLANS</div>

              {[1, 2, 3, 4].map(lvl => (
                <div
                  key={lvl}
                  className="market-dropdown-item"
                  onClick={() => { setShipLevel(lvl); setShipsOpen(false); }}
                  style={{
                    padding: "8px 14px",
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: "clamp(9px,0.8vw,12px)",
                    fontWeight: "bold", letterSpacing: "0.12em",
                    color: "#fbbf24",
                    borderTop: "1px solid rgba(251,191,36,0.07)",
                    cursor: "pointer",
                  }}
                >
                  {t("hud.shipLvl", "SHIP LVL")} {lvl}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. RESOURCES label — opens category panel */}
        <div ref={resPanelRef} style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={openResPanel}
          onMouseLeave={closeResPanel}
        >
          <button
            className="res-slot"
            onClick={() => { resPanelOpen ? closeResPanel() : openResPanel(); setActiveCat(null); }}
            style={{
              ...NAV_BTN,
              borderColor: resPanelOpen ? "rgba(0,212,255,0.9)" : undefined,
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            {t("hud.resourcesBtn", "RESOURCES")}
            <span style={{
              fontSize: "8px", display: "inline-block",
              transition: "transform 0.18s",
              transform: resPanelOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}>▼</span>
          </button>

          {resPanelOpen && (
            <div className="market-dropdown"
              onMouseEnter={openResPanel}
              onMouseLeave={closeResPanel}
              style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0,
                minWidth: 180,
                background: "rgba(3,10,24,0.97)",
                border: "1px solid rgba(0,212,255,0.35)",
                borderRadius: 4,
                backdropFilter: "blur(16px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(0,212,255,0.08)",
                zIndex: 100, overflow: "visible",
              }}>
              {RES_CATEGORIES.map((cat, i) => (
                <div key={cat.id} style={{ position: "relative" }}
                  onMouseEnter={() => !cat.locked && openCat(cat.id)}
                  onMouseLeave={closeCat}
                >
                  <div
                    className="market-dropdown-item"
                    onClick={() => !cat.locked && setActiveCat(activeCat === cat.id ? null : cat.id)}
                    style={{
                      padding: "9px 14px",
                      fontFamily: "Orbitron,sans-serif",
                      fontSize: "clamp(10px,0.85vw,13px)",
                      fontWeight: "bold",
                      letterSpacing: "0.12em",
                      color: cat.locked ? "rgba(200,220,235,0.55)" : (activeCat === cat.id ? "#00D4FF" : "#ffffff"),
                      borderBottom: i < RES_CATEGORIES.length - 1 ? "1px solid rgba(0,212,255,0.08)" : "none",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: cat.locked ? "not-allowed" : "pointer",
                      background: activeCat === cat.id ? "rgba(0,212,255,0.07)" : "transparent",
                    }}
                  >
                    {t(`hud.resCategories.${cat.id}`, cat.label)}
                    <span style={{ fontSize: 8, opacity: 0.6 }}>
                      {cat.locked ? "🔒" : (activeCat === cat.id ? "▶" : "▷")}
                    </span>
                  </div>

                  {/* Sub-items */}
                  {activeCat === cat.id && cat.items.length > 0 && (
                    <div className="market-dropdown"
                      onMouseEnter={() => openCat(cat.id)}
                      onMouseLeave={closeCat}
                      style={{
                      position: "absolute", top: 0, left: "calc(100% + 2px)",
                      minWidth: 200,
                      background: "rgba(3,10,24,0.97)",
                      border: "1px solid rgba(0,212,255,0.25)",
                      borderRadius: 4,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
                      zIndex: 110,
                    }}>
                      {/* Category title header */}
                      <div style={{
                        padding: "7px 14px 6px",
                        fontFamily: "Orbitron,sans-serif",
                        fontSize: "clamp(9px,0.75vw,11px)",
                        fontWeight: "bold",
                        letterSpacing: "0.14em",
                        color: "#00D4FF",
                        textShadow: "0 0 8px rgba(0,212,255,0.6)",
                        borderBottom: "1px solid rgba(0,212,255,0.18)",
                      }}>{t(`hud.resCategories.${cat.id}`, cat.label)}</div>
                      {cat.items.map((item, j) => (
                        <div key={j} style={{
                          padding: "8px 14px",
                          fontFamily: "Orbitron,sans-serif",
                          fontSize: "clamp(10px,0.8vw,12px)",
                          fontWeight: "bold",
                          letterSpacing: "0.1em",
                          color: "#ffffff",
                          borderBottom: j < cat.items.length - 1 ? "1px solid rgba(0,212,255,0.07)" : "none",
                          display: "flex", justifyContent: "space-between",
                          cursor: "pointer",
                        }}
                          className="market-dropdown-item"
                        >
                          <span style={{ whiteSpace: "nowrap" }}>{t(`hud.resItems.${item.key}`, item.label)}</span>
                          {item.val && <span style={{ color: "#facc15", marginLeft: 12, whiteSpace: "nowrap" }}>{item.val}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Linked / Unlinked toggle */}
        <div style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={openLinkedTip}
          onMouseLeave={closeLinkedTip}
        >
          <button
            className="res-slot"
            onClick={() => setIsLinked(v => !v)}
            style={{
              ...NAV_BTN,
              borderColor: isLinked ? "rgba(234,179,8,0.9)" : undefined,
              color: isLinked ? "#fbbf24" : "#00D4FF",
              textShadow: isLinked ? "0 0 8px rgba(234,179,8,0.6)" : "0 0 8px rgba(0,212,255,0.6)",
              background: isLinked ? "rgba(234,179,8,0.12)" : undefined,
            }}
          >
            {isLinked ? t("hud.linked", "LINKED") : t("hud.unlinked", "UNLINKED")}
          </button>

          {linkedTipOpen && (
            <div className="market-dropdown" style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0,
              width: 260,
              background: "rgba(3,10,24,0.97)",
              border: "1px solid rgba(0,212,255,0.25)",
              borderRadius: 4,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
              zIndex: 100, padding: "12px 14px",
              fontFamily: "Orbitron,sans-serif",
            }}>
              <p style={{ fontSize: 10, color: "#fbbf24", marginBottom: 8, lineHeight: 1.5 }}>
                <strong>{t("hud.linkedTooltip.linkedMode", "Linked Mode:")}</strong> {t("hud.linkedTooltip.linkedDesc")}
              </p>
              <p style={{ fontSize: 10, color: "#00D4FF", marginBottom: 8, lineHeight: 1.5 }}>
                <strong>{t("hud.linkedTooltip.unlinkedMode", "Unlinked Mode:")}</strong> {t("hud.linkedTooltip.unlinkedDesc")}
              </p>
              <p style={{ fontSize: 10, color: "#f87171", lineHeight: 1.5 }}>
                <strong>{t("hud.linkedTooltip.warning", "Warning:")}</strong> {t("hud.linkedTooltip.warningDesc")}
              </p>
            </div>
          )}
        </div>

        {/* 4. Resource slots */}
        <div ref={resBarRef} style={{
          flex: 1, height: isMobile ? "26px" : "clamp(28px,3.8vh,42px)",
          display: "flex", alignItems: "stretch",
          background: "rgba(4,12,28,0.78)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "3px",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
          overflow: "visible",
          minWidth: 0, position: "relative",
        }}>
          {RESOURCES.map((r, i) => (
            <div key={r.id} style={{ flex: 1, position: "relative", minWidth: 0 }}
              onMouseEnter={() => openRes(r.id)}
              onMouseLeave={closeRes}
            >
              {/* slot button */}
              <div
                className="res-slot"
                onClick={() => setActiveRes(activeRes === r.id ? null : r.id)}
                style={{
                  height: "100%", display: "flex", alignItems: "center",
                  gap: "5px", padding: "0 8px", cursor: "pointer",
                  borderRight: i < RESOURCES.length - 1 ? "1px solid rgba(0,212,255,0.12)" : "none",
                  background: activeRes === r.id ? "rgba(0,212,255,0.12)" : "transparent",
                }}
              >
                <img
                  src={r.img} alt={t(`hud.resourceLabels.${r.id.toLowerCase()}`, r.label)}
                  style={{
                    width: isMobile ? "18px" : "clamp(22px,3vh,36px)",
                    height: isMobile ? "18px" : "clamp(22px,3vh,36px)",
                    objectFit: "contain", flexShrink: 0,
                    imageRendering: "crisp-edges",
                    filter: "drop-shadow(0 0 4px currentColor)",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  {!isMobile && (
                    <div style={{
                      fontFamily: "Orbitron,sans-serif",
                      fontSize: "clamp(6px,0.55vw,8px)",
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.92)",
                      textShadow: "0 0 8px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)",
                      textTransform: "uppercase",
                      lineHeight: 1, marginBottom: "2px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{t(`hud.resourceLabels.${r.id.toLowerCase()}`, r.label)}</div>
                  )}
                  <div style={{
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: isMobile ? "clamp(7px,0.7vw,9px)" : "clamp(9px,0.78vw,12px)",
                    fontWeight: "bold", letterSpacing: "0.05em",
                    color: r.color, textShadow: `0 0 8px ${r.color}cc, 0 1px 3px rgba(0,0,0,0.9)`,
                    whiteSpace: "nowrap", lineHeight: 1,
                  }}>{r.value}</div>
                </div>
              </div>

              {/* dropdown */}
              {activeRes === r.id && (
                <div className="market-dropdown"
                  onMouseEnter={() => openRes(r.id)}
                  onMouseLeave={closeRes}
                  style={{
                    position: "absolute", top: "calc(100% + 4px)", left: "50%",
                    transform: "translateX(-50%)",
                    minWidth: 130,
                    background: "rgba(3,10,24,0.97)",
                    border: `1px solid ${r.color}55`,
                    borderRadius: 4,
                    backdropFilter: "blur(16px)",
                    boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 12px ${r.color}18`,
                    zIndex: 100, padding: "8px 12px",
                  }}>
                  <div style={{
                    fontFamily: "Orbitron,sans-serif", fontSize: 10, fontWeight: "bold",
                    color: r.color, letterSpacing: "0.12em", marginBottom: 8,
                    textShadow: `0 0 6px ${r.color}88`,
                  }}>{t(`hud.resourceLabels.${r.id.toLowerCase()}`, r.label).toUpperCase()}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: "OPEN", val: r.open },
                      { label: t("hud.stored", "STORED"), val: r.stored },
                    ].map(row => (
                      <div key={row.label} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      }}>
                        <span style={{
                          fontFamily: "Orbitron,sans-serif", fontSize: 9,
                          color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em",
                        }}>{row.label}</span>
                        <span style={{
                          fontFamily: "Orbitron,sans-serif", fontSize: 11, fontWeight: "bold",
                          color: r.color, letterSpacing: "0.05em",
                        }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 4. MARKETPLACE — dropdown */}
        <div ref={marketRef} style={{ position: "relative", flexShrink: 0 }}
          onMouseEnter={openMarket}
          onMouseLeave={closeMarket}
        >
          <button
            className="res-slot"
            onClick={() => setMarketOpen(o => !o)}
            style={{
              ...NAV_BTN,
              borderColor: marketOpen ? "rgba(0,212,255,0.9)" : undefined,
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            {t("hud.marketplace", "MARKETPLACE")}
            <span style={{
              fontSize: "8px",
              transition: "transform 0.18s",
              transform: marketOpen ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}>▼</span>
          </button>

          {marketOpen && (
            <div className="market-dropdown" style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: "160px",
              background: "rgba(3,10,24,0.97)",
              border: "1px solid rgba(0,212,255,0.35)",
              borderRadius: "4px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(0,212,255,0.08)",
              zIndex: 100,
              overflow: "hidden",
            }}>
              {MARKET_ITEMS.map((item) => (
                <div
                  key={item.tab}
                  className="market-dropdown-item"
                  onClick={() => handleMarketNav(item.tab)}
                  style={{
                    padding: "9px 16px",
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: "clamp(10px,0.85vw,13px)",
                    fontWeight: "bold",
                    letterSpacing: "0.12em",
                    color: isPreview ? "rgba(255,255,255,0.35)" : "#ffffff",
                    borderBottom: "1px solid rgba(0,212,255,0.08)",
                    cursor: isPreview ? "not-allowed" : "pointer",
                  }}
                >
                  {t(`hud.marketItems.${item.key}`, item.label)}
                </div>
              ))}

              {/* My Profile — separated at bottom */}
              <div style={{ borderTop: "1px solid rgba(0,212,255,0.25)", margin: "2px 0" }} />
              <div
                className="market-dropdown-item"
                onClick={() => { setMarketOpen(false); if (!isPreview) navigate("/Profile"); }}
                style={{
                  padding: "9px 16px",
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: "clamp(10px,0.85vw,13px)",
                  fontWeight: "bold",
                  letterSpacing: "0.12em",
                  color: isPreview ? "rgba(0,212,255,0.35)" : "rgba(0,212,255,0.85)",
                  cursor: isPreview ? "not-allowed" : "pointer",
                }}
              >
                {t("hud.marketItems.myProfile", "My Profile")}
              </div>
            </div>
          )}
        </div>

        {/* 4. WALLET — inline modal */}
        <button
          className="res-slot"
          onClick={() => { if (!isPreview) setWalletOpen(true); }}
          style={{
            ...NAV_BTN,
            flexShrink: 0,
            borderColor: connected ? "rgba(34,197,94,0.7)" : undefined,
            color: connected ? "#4ade80" : "#00D4FF",
            textShadow: connected ? "0 0 8px rgba(34,197,94,0.6)" : "0 0 8px rgba(0,212,255,0.6)",
          }}
        >
          {connected ? (shortAddr || t("hud.connected", "CONNECTED")) : t("hud.wallet", "WALLET")}
        </button>

        {/* 5. LANGUAGE selector */}
        <div ref={langRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            className="res-slot"
            onClick={() => setLangOpen(o => !o)}
            style={{
              ...NAV_BTN,
              padding: isMobile ? "0 6px" : "0 8px",
              display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            <LangFlag cc={activeLang.cc} size={isMobile ? 16 : 20} />
            <span style={{
              fontSize: "8px",
              transition: "transform 0.18s",
              transform: langOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}>▼</span>
          </button>

          {langOpen && (
            <div className="market-dropdown lang-dropdown" style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              width: isMobile ? 220 : 280,
              maxHeight: isMobile ? 260 : 360,
              overflowY: "auto",
              background: "rgba(3,10,24,0.97)",
              border: "1px solid rgba(0,212,255,0.3)",
              borderRadius: 4,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(0,212,255,0.08)",
              zIndex: 100,
              padding: "6px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,212,255,0.35) rgba(0,0,0,0.2)",
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
              }}>
                {LANG_LIST.map(lang => {
                  const isActive = lang.code === currentLang;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang.code)}
                      className="market-dropdown-item"
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: isMobile ? "7px 8px" : "9px 10px",
                        background: isActive ? "rgba(0,212,255,0.15)" : "transparent",
                        border: isActive ? "1px solid rgba(0,212,255,0.4)" : "1px solid transparent",
                        borderRadius: 4,
                        cursor: "pointer",
                        color: isActive ? "#00D4FF" : "rgba(200,225,240,0.9)",
                        fontFamily: "Orbitron,sans-serif",
                        fontSize: isMobile ? 9 : 11,
                        letterSpacing: "0.05em",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <LangFlag cc={lang.cc} size={20} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── LOG OUT / BACK TO PREVIEW button ── */}
      {isPreview ? (
        <button className="logout-btn" style={{
          position: "absolute",
          top: isMobile ? "4px" : "2vh",
          right: isMobile ? "1.5%" : "2.8%",
          zIndex: 30,
          width: isMobile ? "32px" : "clamp(52px,7.5vh,68px)",
          height: isMobile ? "32px" : "clamp(52px,7.5vh,68px)",
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, rgba(0,60,180,0.9), rgba(0,20,60,0.97))",
          border: "2px solid rgba(56,189,248,0.65)",
          color: "#bae6fd",
          fontFamily: "Orbitron,sans-serif",
          fontSize: "clamp(5px,0.55vw,7px)",
          fontWeight: "bold",
          letterSpacing: "0.07em",
          lineHeight: 1.3,
          cursor: "pointer",
          boxShadow: "0 0 16px rgba(56,189,248,0.3), 0 0 1px rgba(56,189,248,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          textShadow: "0 0 8px rgba(56,189,248,0.8)",
          transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        }} onClick={() => navigate("/preview")}>← PREVIEW</button>
      ) : (
        <button className="logout-btn" style={{
          position: "absolute",
          top: isMobile ? "4px" : "2vh",
          right: isMobile ? "1.5%" : "2.8%",
          zIndex: 30,
          width: isMobile ? "32px" : "clamp(52px,7.5vh,68px)",
          height: isMobile ? "32px" : "clamp(52px,7.5vh,68px)",
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, rgba(200,40,40,0.9), rgba(70,6,6,0.97))",
          border: "2px solid rgba(248,113,113,0.65)",
          color: "#fecaca",
          fontFamily: "Orbitron,sans-serif",
          fontSize: "clamp(6px,0.6vw,8px)",
          fontWeight: "bold",
          letterSpacing: "0.07em",
          lineHeight: 1.3,
          cursor: "pointer",
          boxShadow: "0 0 16px rgba(248,113,113,0.3), 0 0 1px rgba(248,113,113,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          textShadow: "0 0 8px rgba(248,113,113,0.8)",
          transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        }} onClick={handleLogout}>{t("hud.logOut", "LOG OUT")}</button>
      )}

      {/* ══════════════════════════════════════════════════════════════
          WALLET MODAL — inline overlay, no navigation
          ══════════════════════════════════════════════════════════════ */}
      {walletOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setWalletOpen(false); }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="wallet-modal" style={{
            position: "relative",
            width: 340,
            background: "rgba(10,18,38,0.98)",
            border: "1px solid rgba(0,212,255,0.35)",
            borderRadius: "12px",
            padding: "28px 24px",
            boxShadow: "0 0 60px rgba(0,212,255,0.12), 0 20px 60px rgba(0,0,0,0.8)",
            color: "#e2e8f0",
          }}>
            {/* Close */}
            <button
              onClick={() => setWalletOpen(false)}
              style={{
                position: "absolute", top: 12, right: 14,
                background: "none", border: "none",
                color: "rgba(148,192,210,0.6)",
                fontSize: 20, cursor: "pointer", lineHeight: 1,
              }}
            >×</button>

            {/* Title */}
            <div style={{
              fontFamily: "Orbitron,sans-serif",
              fontSize: 13, fontWeight: "bold",
              letterSpacing: "0.15em",
              color: "#00D4FF",
              textAlign: "center",
              marginBottom: 16,
              textShadow: "0 0 10px rgba(0,212,255,0.5)",
            }}>{t("hud.connectWallet", "CONNECT WALLET")}</div>

            <div style={{ height: 1, background: "rgba(0,212,255,0.15)", marginBottom: 20 }} />

            {connected ? (
              /* Connected state */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(34,197,94,0.15)",
                  border: "2px solid rgba(34,197,94,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>✓</div>
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: 9, color: "#4ade80", letterSpacing: "0.1em" }}>
                  CONNECTED
                </div>
                <div style={{
                  fontFamily: "monospace", fontSize: 11,
                  color: "rgba(148,192,210,0.7)",
                  background: "rgba(0,212,255,0.06)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 6, padding: "6px 14px",
                }}>{shortAddr}</div>
                <button
                  onClick={() => { setAccount(null); setConnected(false); }}
                  style={{
                    marginTop: 4,
                    padding: "7px 20px",
                    background: "transparent",
                    border: "1px solid rgba(248,113,113,0.4)",
                    borderRadius: 6,
                    color: "#fca5a5",
                    fontFamily: "Orbitron,sans-serif",
                    fontSize: 8, letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >DISCONNECT</button>
              </div>
            ) : isConnecting ? (
              /* Connecting state */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0" }}>
                <img src={symbol} alt="MetaMask" style={{ width: 52, height: 52 }} />
                <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: 9, color: "rgba(148,192,210,0.8)", letterSpacing: "0.12em" }}>
                  WAITING FOR CONFIRMATION
                </div>
                <div className="wallet-spinner" style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  border: "3px solid rgba(0,212,255,0.15)",
                  borderTopColor: "#00D4FF",
                }} />
              </div>
            ) : (
              /* Connect options */
              <>
                <button
                  onClick={connectMetaMask}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 12,
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    color: "#e2e8f0",
                    fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                >
                  <img src={symbol} alt="MetaMask" style={{ width: 26, height: 26 }} />
                  MetaMask
                </button>

                {/* Info box */}
                <div style={{
                  marginTop: 20,
                  padding: "10px 14px",
                  background: "rgba(0,212,255,0.04)",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 8,
                }}>
                  <div style={{
                    fontFamily: "Orbitron,sans-serif", fontSize: 7, fontWeight: "bold",
                    color: "#38bdf8", letterSpacing: "0.12em", marginBottom: 6
                  }}>
                    {t("hud.whatIsWallet", "WHAT IS A CRYPTO WALLET?")}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(148,192,210,0.65)", lineHeight: 1.5 }}>
                    A crypto wallet lets you interact with the blockchain.
                    Hyper Tek will <strong style={{ color: "#7dd3fc" }}>never</strong> request
                    your seed phrase or private key.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SHIP FLOOR PLAN MODAL
          ══════════════════════════════════════════════════════════════ */}
      {shipLevel && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShipLevel(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{
            position: "relative", width: "min(96vw, 1260px)", height: "min(96vh, 800px)",
            background: "#000", border: "1px solid rgba(180,90,20,0.6)",
            borderRadius: 6, boxShadow: "0 0 80px rgba(0,0,0,0.9)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>

            {/* ── Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(90deg, #1a0a00, #7a3a0a 40%, #5a2a05)",
              padding: isMobile ? "6px 10px" : "10px 20px",
              borderBottom: "2px solid #b85c14",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 16 }}>
                {[1, 2, 3, 4].map(lvl => (
                  <button key={lvl} onClick={() => setShipLevel(lvl)} style={{
                    padding: isMobile ? "3px 8px" : "5px 16px",
                    background: shipLevel === lvl ? "rgba(251,191,36,0.25)" : "rgba(0,0,0,0.35)",
                    border: `1.5px solid ${shipLevel === lvl ? "#fbbf24" : "rgba(251,191,36,0.3)"}`,
                    borderRadius: 3, cursor: "pointer",
                    fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 11, fontWeight: "bold",
                    color: shipLevel === lvl ? "#fbbf24" : "rgba(251,191,36,0.45)",
                    letterSpacing: "0.1em", transition: "all 0.15s",
                    boxShadow: shipLevel === lvl ? "0 0 10px rgba(251,191,36,0.3)" : "none",
                  }}>LVL {lvl}</button>
                ))}

                {/* VR MODE button */}
                <div ref={vrShipRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => { setVrShipOpen(o => { if (o) { setVrShipPairing(false); setVrShipPairDone(false); } return !o; }); }}
                    style={{
                      padding: isMobile ? "4px 10px" : "6px 16px",
                      background: vrShipOpen ? "rgba(0,212,255,0.18)" : "rgba(0,0,0,0.45)",
                      border: `1.5px solid ${vrShipOpen ? "#00D4FF" : "rgba(0,212,255,0.65)"}`,
                      borderRadius: 3, cursor: "pointer",
                      fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 10 : 15, fontWeight: "bold",
                      color: "#00D4FF",
                      letterSpacing: "0.12em", transition: "all 0.15s",
                      boxShadow: vrShipOpen ? "0 0 18px rgba(0,212,255,0.55)" : "0 0 8px rgba(0,212,255,0.25)",
                      textShadow: "0 0 12px rgba(0,212,255,0.9)",
                      whiteSpace: "nowrap",
                    }}
                  >{t("hud.vrMode", "VR MODE")}</button>

                  {vrShipOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 60,
                      background: "linear-gradient(160deg,#020d1a,#010812)",
                      border: "1.5px solid rgba(0,212,255,0.45)", borderRadius: 5,
                      boxShadow: "0 6px 28px rgba(0,0,0,0.95), 0 0 20px rgba(0,212,255,0.12)",
                      overflow: "hidden", minWidth: isMobile ? 180 : 240,
                    }}>
                      {/* Header */}
                      <div style={{ padding: isMobile ? "6px 12px" : "9px 16px", borderBottom: "1px solid rgba(0,212,255,0.15)", background: "rgba(0,212,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 10, fontWeight: "bold", letterSpacing: "0.15em", color: "#00D4FF" }}>{t("hud.devicePairing", "DEVICE PAIRING")}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", boxShadow: "0 0 6px rgba(248,113,113,0.8)" }} />
                          <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 6 : 8, color: "rgba(248,113,113,0.85)", letterSpacing: "0.08em" }}>{t("hud.deviceOffline", "OFFLINE")}</span>
                        </div>
                      </div>
                      {/* Single pair button */}
                      <div style={{ padding: isMobile ? "12px 12px" : "14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => {
                            if (vrShipPairDone || vrShipPairing) return;
                            setVrShipPairing(true);
                            setTimeout(() => { setVrShipPairing(false); setVrShipPairDone(true); }, 2000);
                          }}
                          style={{
                            width: "100%", padding: isMobile ? "6px 0" : "8px 0",
                            background: vrShipPairDone ? "rgba(248,113,113,0.08)" : vrShipPairing ? "rgba(0,212,255,0.08)" : "rgba(0,212,255,0.12)",
                            border: `1px solid ${vrShipPairDone ? "rgba(248,113,113,0.4)" : "rgba(0,212,255,0.4)"}`,
                            borderRadius: 4, cursor: vrShipPairDone || vrShipPairing ? "default" : "pointer",
                            fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                            letterSpacing: "0.12em",
                            color: vrShipPairDone ? "rgba(248,113,113,0.9)" : "#00D4FF",
                            transition: "all 0.2s",
                          }}
                        >
                          {vrShipPairing ? t("hud.pairing", "PAIRING...") : vrShipPairDone ? t("hud.unavailableNow", "UNAVAILABLE RIGHT NOW") : t("hud.pairDevice", "PAIR DEVICE")}
                        </button>
                        {vrShipPairDone && (
                          <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, color: "rgba(255,255,255,0.95)", letterSpacing: "0.08em" }}>{t("hud.comingSoon", "Coming Soon")}</span>
                        )}
                      </div>
                      {/* Footer */}
                      <div style={{ padding: isMobile ? "6px 12px" : "7px 16px", borderTop: "1px solid rgba(0,212,255,0.15)", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, color: "#00D4FF", letterSpacing: "0.08em", textShadow: "0 0 6px rgba(0,212,255,0.6)" }}>{t("hud.vrInteractionMode", "VR Interaction MODE · Coming Soon")}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 20 }}>
                <span style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 12 : 20, fontWeight: "900",
                  color: "#fbbf24", letterSpacing: "0.2em",
                }}>LEVEL- {shipLevel}</span>
                <button onClick={() => setShipLevel(null)} style={{
                  background: "rgba(0,0,0,0.4)", border: "1px solid rgba(251,191,36,0.3)",
                  borderRadius: 3, color: "rgba(251,191,36,0.7)", fontSize: isMobile ? 12 : 16,
                  cursor: "pointer", lineHeight: 1, padding: isMobile ? "2px 6px" : "2px 8px",
                }}>×</button>
              </div>
            </div>

            {/* ── Body: left strip + sidebar + image */}
            <div ref={shipContentRef} style={{ display: "flex", flex: 1, position: "relative", minHeight: 0, overflow: "hidden" }}>

              {/* Left decorative strip */}
              {!isMobile && (
                <div style={{
                  width: 36, flexShrink: 0, background: "#000",
                  display: "flex", flexDirection: "column", borderRight: "2px solid #b85c14",
                }}>
                  <div style={{ height: 50, background: "#7a3a0a", borderBottom: "2px solid #b85c14" }} />
                  <div style={{
                    flex: 1, background: "#1a3a5c", borderBottom: "2px solid #b85c14",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 10, padding: "12px 0",
                  }}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#e08820", boxShadow: "0 0 6px rgba(224,136,32,0.8)",
                      }} />
                    ))}
                  </div>
                  <div style={{ height: 50, background: "#7a3a0a" }} />
                </div>
              )}

              {/* Room sidebar */}
              <div style={{
                width: isMobile ? 100 : "clamp(130px, 13vw, 170px)", flexShrink: 0,
                background: "#0a0500", borderRight: "1px solid rgba(180,90,20,0.4)",
                display: "flex", flexDirection: "column", minHeight: 0,
              }}>
                {/* Fixed header */}
                <div style={{
                  padding: isMobile ? "6px 8px" : "8px 12px",
                  borderBottom: "1px solid rgba(180,90,20,0.4)",
                  fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 9 : 12,
                  color: "#fbbf24", letterSpacing: "0.12em",
                  flexShrink: 0,
                }}>SECTIONS</div>
                {/* Scrollable room list */}
                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="sections-scroll">
                  {(SHIP_ROOMS[shipLevel] || []).map(room => (
                    <div
                      key={room.id}
                      ref={el => { if (el) shipItemRefs.current[room.id] = el; }}
                      onClick={() => setSelectedRoom(prev => prev === room.id ? null : room.id)}
                      onMouseEnter={() => setHoveredRoom(room.id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: isMobile ? "5px 8px" : "7px 12px",
                        borderBottom: "1px solid rgba(180,90,20,0.2)",
                        cursor: "pointer",
                        background: selectedRoom === room.id || hoveredRoom === room.id
                          ? "rgba(251,191,36,0.1)" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <span style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                        letterSpacing: "0.06em",
                        color: selectedRoom === room.id || hoveredRoom === room.id ? "#fbbf24" : "rgba(220,180,120,0.9)",
                      }}>{room.name}</span>
                      <div style={{
                        width: isMobile ? 7 : 9, height: isMobile ? 7 : 9,
                        borderRadius: "50%", flexShrink: 0, marginLeft: 6,
                        background: selectedRoom === room.id || hoveredRoom === room.id ? "#fbbf24" : "#e08820",
                        boxShadow: selectedRoom === room.id || hoveredRoom === room.id
                          ? "0 0 8px #fbbf24" : "0 0 4px rgba(224,136,32,0.6)",
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Information / Notes panel ── */}
              <div style={{
                width: isMobile ? 110 : "clamp(150px, 15vw, 200px)", flexShrink: 0,
                border: "2px solid #fbbf24",
                borderRadius: 4,
                margin: isMobile ? "6px 0" : "10px 0",
                background: "rgba(10,5,0,0.6)",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: isMobile ? "6px 8px" : "8px 12px",
                  borderBottom: "1px solid rgba(251,191,36,0.3)",
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: isMobile ? 8 : 11,
                  fontWeight: "bold", letterSpacing: "0.12em",
                  color: "#fbbf24", textShadow: "0 0 8px rgba(251,191,36,0.4)",
                }}>INFORMATION</div>

                {(() => {
                  const activeId = hoveredRoom || selectedRoom;
                  const rooms = SHIP_ROOMS[shipLevel] || [];
                  const roomName = rooms.find(r => r.id === activeId)?.name;
                  const detail = activeId
                    ? (ROOM_DETAILS[activeId] ?? { title: roomName ?? activeId, desc: t("hud.noRoomInfo", "No information available for this room.") })
                    : null;
                  return (
                    <div style={{ flex: 1, padding: isMobile ? "8px" : "12px", overflowY: "auto" }} className="sections-scroll">
                      {detail ? (
                        <>
                          <div style={{
                            fontFamily: "Orbitron,sans-serif",
                            fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                            letterSpacing: "0.1em", color: "#fbbf24",
                            textShadow: "0 0 6px rgba(251,191,36,0.5)",
                            marginBottom: isMobile ? 6 : 8,
                            paddingBottom: isMobile ? 4 : 6,
                            borderBottom: "1px solid rgba(251,191,36,0.2)",
                          }}>{t(`hud.rooms.${activeId}.title`, detail.title)}</div>
                          <div style={{
                            fontFamily: "Orbitron,sans-serif",
                            fontSize: isMobile ? 7 : 8,
                            color: "rgba(220,190,130,0.85)",
                            letterSpacing: "0.04em",
                            lineHeight: 1.7,
                          }}>{t(`hud.rooms.${activeId}.desc`, detail.desc)}</div>
                        </>
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{
                            fontFamily: "Orbitron,sans-serif",
                            fontSize: isMobile ? 7 : 9,
                            color: "rgba(251,191,36,0.3)",
                            letterSpacing: "0.1em",
                            textAlign: "center", lineHeight: 1.6,
                          }}>{t("hud.hoverSelectRoom", "HOVER OR SELECT A ROOM TO VIEW INFORMATION")}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Ship image + overlays */}
              {/* overflowY:auto here so the image NEVER shrinks — only the popup frame scrolls */}
              <div style={{ flex: 1, background: "#000", padding: isMobile ? "6px" : "10px", overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                  <img
                    ref={shipImgRef}
                    key={shipLevel}
                    src={`/ships/level${shipLevel}-plain.webp`}
                    alt={`Ship Level ${shipLevel}`}
                    loading="lazy"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                  {/* Room highlight boxes — only visible on hover or select */}
                  {(SHIP_ROOMS[shipLevel] || []).map(room => {
                    const active = selectedRoom === room.id || hoveredRoom === room.id;
                    const color = active ? "#fbbf24" : "transparent";
                    const fill = active ? "rgba(251,191,36,0.04)" : "transparent";
                    const handlers = {
                      onMouseEnter: () => setHoveredRoom(room.id),
                      onMouseLeave: () => setHoveredRoom(null),
                      onClick: () => setSelectedRoom(prev => prev === room.id ? null : room.id),
                    };

                    // Triangle helper — right-angle triangle, corner = which corner has the 90°
                    if (room.triangle) {
                      const c = room.triangle; // "topLeft"|"topRight"|"bottomLeft"|"bottomRight"
                      const pts =
                        c === "topLeft" ? "0,0 100,0 0,100" :
                          c === "topRight" ? "0,0 100,0 100,100" :
                            c === "bottomLeft" ? "0,0 0,100 100,100" :
                              "100,0 0,100 100,100"; // bottomRight
                      return (
                        <svg
                          key={room.id}
                          {...handlers}
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          style={{
                            position: "absolute",
                            left: `${room.x}%`, top: `${room.y}%`,
                            width: `${room.w}%`, height: `${room.h}%`,
                            overflow: "visible", cursor: "pointer",
                            filter: active ? "drop-shadow(0 0 6px rgba(251,191,36,0.7))" : "none",
                            transition: "filter 0.18s",
                          }}
                        >
                          <polygon
                            points={pts}
                            fill={fill}
                            stroke={color}
                            strokeWidth="3"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      );
                    }

                    // L-shape helper — renders SVG polygon for any L orientation
                    // notch: "bottomRight" | "bottomLeft" | "topRight" | "topLeft"
                    if (room.lShape) {
                      const { notch = "bottomRight", notchW = 45, notchH = 50 } = room.lShape;
                      let pts;
                      if (notch === "bottomRight") {
                        // Full top + left side, notch cut from bottom-right
                        pts = `0,0 100,0 100,${100 - notchH} ${100 - notchW},${100 - notchH} ${100 - notchW},100 0,100`;
                      } else if (notch === "bottomLeft") {
                        // Full top + right side, notch cut from bottom-left
                        pts = `0,0 100,0 100,100 ${notchW},100 ${notchW},${100 - notchH} 0,${100 - notchH}`;
                      } else if (notch === "topRight") {
                        // Full bottom + left side, notch cut from top-right
                        pts = `0,0 ${100 - notchW},0 ${100 - notchW},${notchH} 100,${notchH} 100,100 0,100`;
                      } else {
                        // topLeft — notch cut from top-left
                        pts = `${notchW},0 100,0 100,100 0,100 0,${notchH} ${notchW},${notchH}`;
                      }
                      return (
                        <svg
                          key={room.id}
                          {...handlers}
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          style={{
                            position: "absolute",
                            left: `${room.x}%`, top: `${room.y}%`,
                            width: `${room.w}%`, height: `${room.h}%`,
                            overflow: "visible", cursor: "pointer",
                            filter: active ? "drop-shadow(0 0 6px rgba(251,191,36,0.7))" : "none",
                            transition: "filter 0.18s",
                          }}
                        >
                          <polygon
                            points={pts}
                            fill={fill}
                            stroke={color}
                            strokeWidth="3"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      );
                    }

                    if (room.tRight) {
                      // T-shape pointing right — rendered as SVG so all edges connect
                      const { stemW = 45, armTop = 33, armBot = 67 } = room.tRight;
                      const pts = [
                        `0,0`, `${stemW},0`,
                        `${stemW},${armTop}`, `100,${armTop}`,
                        `100,${armBot}`, `${stemW},${armBot}`,
                        `${stemW},100`, `0,100`,
                      ].join(" ");
                      return (
                        <svg
                          key={room.id}
                          {...handlers}
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          style={{
                            position: "absolute",
                            left: `${room.x}%`, top: `${room.y}%`,
                            width: `${room.w}%`, height: `${room.h}%`,
                            overflow: "visible", cursor: "pointer",
                            filter: active ? "drop-shadow(0 0 6px rgba(251,191,36,0.7))" : "none",
                            transition: "filter 0.18s",
                          }}
                        >
                          <polygon
                            points={pts}
                            fill={fill}
                            stroke={color}
                            strokeWidth="3"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      );
                    }

                    if (room.circle) {
                      return (
                        <div
                          key={room.id}
                          {...handlers}
                          style={{
                            position: "absolute",
                            left: `${room.x}%`, top: `${room.y}%`,
                            width: `${room.w}%`, height: `${room.h}%`,
                            borderRadius: "50%",
                            border: active ? "2px solid #fbbf24" : "2px solid transparent",
                            boxShadow: active ? "0 0 16px rgba(251,191,36,0.6), inset 0 0 10px rgba(251,191,36,0.08)" : "none",
                            background: fill,
                            cursor: "pointer", transition: "all 0.18s",
                          }}
                        />
                      );
                    }

                    return (
                      <div
                        key={room.id}
                        {...handlers}
                        style={{
                          position: "absolute",
                          left: `${room.x}%`, top: `${room.y}%`,
                          width: `${room.w}%`, height: `${room.h}%`,
                          border: active ? "2px solid #fbbf24" : "2px solid transparent",
                          boxShadow: active ? "0 0 16px rgba(251,191,36,0.6), inset 0 0 10px rgba(251,191,36,0.08)" : "none",
                          background: fill,
                          borderRadius: 3, cursor: "pointer", transition: "all 0.18s",
                          ...(room.rotate ? {
                            transform: `rotate(${room.rotate}deg)`,
                            transformOrigin: "center center",
                          } : {}),
                        }}
                      />
                    );
                  })}

                  {/* Room action popup — appears on click */}
                  {selectedRoom && (() => {
                    const room = (SHIP_ROOMS[shipLevel] || []).find(r => r.id === selectedRoom);
                    if (!room) return null;
                    const toLeft = (room.x + room.w) > 68;
                    const anchorLeft = toLeft
                      ? `${room.x}%`
                      : `${room.x + room.w}%`;
                    const anchorTop = `${room.y}%`;
                    const popupW = isMobile ? 100 : 130;
                    return (
                      <div style={{
                        position: "absolute",
                        left: anchorLeft, top: anchorTop,
                        transform: toLeft ? `translateX(-${popupW}px)` : "translateX(8px)",
                        zIndex: 30, width: popupW,
                        background: "linear-gradient(160deg, #0d1a2e, #060d1a)",
                        border: "1.5px solid #fbbf24",
                        borderRadius: 5,
                        boxShadow: "0 6px 28px rgba(0,0,0,0.95), 0 0 16px rgba(251,191,36,0.2)",
                        overflow: "hidden",
                        pointerEvents: "auto",
                      }}>
                        {/* Room name header */}
                        <div style={{
                          background: "linear-gradient(90deg, #7a3a0a, #3a1a02)",
                          borderBottom: "1px solid #fbbf24",
                          padding: isMobile ? "5px 8px" : "6px 10px",
                          fontFamily: "Orbitron,sans-serif",
                          fontSize: isMobile ? 7 : 8,
                          fontWeight: "bold", letterSpacing: "0.1em",
                          color: "#fbbf24", textTransform: "uppercase",
                        }}>{room.name}</div>

                        {/* Action buttons */}
                        {[
                          { label: "Detail", color: "#fbbf24", locked: false },
                          { label: "Upgrade", color: "#7dd3fc", locked: true },
                          { label: "Officer", color: "#a78bfa", locked: true },
                        ].map(({ label, color, locked }, i) => (
                          <div key={label} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: isMobile ? "7px 10px" : "9px 12px",
                            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            cursor: locked ? "default" : "pointer",
                            background: "transparent",
                            transition: "background 0.12s",
                          }}
                            onMouseEnter={e => !locked && (e.currentTarget.style.background = "rgba(251,191,36,0.08)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            onClick={() => { if (locked) return; }}
                          >
                            <span style={{
                              fontFamily: "Orbitron,sans-serif",
                              fontSize: isMobile ? 8 : 10,
                              fontWeight: "bold", letterSpacing: "0.1em",
                              color: locked ? "rgba(200,200,200,0.4)" : color,
                            }}>{label}</span>
                            {locked && (
                              <span style={{ fontSize: isMobile ? 9 : 11, opacity: 0.35 }}>🔒</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>


            </div>

            {/* ── Bottom bar */}
            <div style={{
              height: isMobile ? 10 : 18,
              background: "linear-gradient(90deg, #000 0%, #7a3a0a 30%, #5a2a05 70%, #000 100%)",
              borderTop: "2px solid #b85c14",
            }} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SKIN 1 — WEAPON LAYOUT MODAL
          ══════════════════════════════════════════════════════════════ */}
      {skinDetailOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setSkinDetailOpen(false); setSelectedGun(null); setHoveredGun(null); } }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{
            position: "relative", width: "min(96vw, 1260px)", height: "min(96vh, 800px)",
            background: "#000", border: "1px solid rgba(0,180,220,0.5)",
            borderRadius: 6, boxShadow: "0 0 80px rgba(0,0,0,0.9)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>

            {/* ── Header ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(90deg, #001a24, #004a6a 40%, #003050)",
              padding: isMobile ? "6px 10px" : "10px 20px",
              borderBottom: "2px solid #0099cc",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: isMobile ? 10 : 16,
                  fontWeight: "900", letterSpacing: "0.2em",
                  color: "#00D4FF", textShadow: "0 0 14px rgba(0,212,255,0.9)",
                }}>{t("hud.skinLabel", "SKIN 1 — WEAPONS LAYOUT")}</span>
                <span style={{
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: isMobile ? 6 : 8,
                  letterSpacing: "0.14em",
                  color: "rgba(0,212,255,0.5)",
                }}>{t("hud.hoverSelectWeapon", "HOVER OR SELECT A WEAPON SLOT TO VIEW DETAILS")}</span>
              </div>
              <button
                onClick={() => { setSkinDetailOpen(false); setSelectedGun(null); setHoveredGun(null); }}
                style={{
                  background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,212,255,0.3)",
                  borderRadius: 3, color: "rgba(0,212,255,0.7)",
                  fontSize: isMobile ? 12 : 16,
                  cursor: "pointer", lineHeight: 1, padding: isMobile ? "2px 6px" : "2px 8px",
                }}
              >×</button>
            </div>

            {/* ── Body ── */}
            <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

              {/* Left decorative strip */}
              {!isMobile && (
                <div style={{
                  width: 36, flexShrink: 0, background: "#000",
                  display: "flex", flexDirection: "column", borderRight: "2px solid #0099cc",
                }}>
                  <div style={{ height: 50, background: "#003a52", borderBottom: "2px solid #0099cc" }} />
                  <div style={{
                    flex: 1, background: "#001824",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 10, padding: "12px 0",
                    borderBottom: "2px solid #0099cc",
                  }}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: "#00D4FF",
                        boxShadow: "0 0 6px rgba(0,212,255,0.8)",
                      }} />
                    ))}
                  </div>
                  <div style={{ height: 50, background: "#003a52" }} />
                </div>
              )}

              {/* Gun list sidebar */}
              <div style={{
                width: isMobile ? 100 : "clamp(130px,13vw,170px)", flexShrink: 0,
                background: "#000c14", borderRight: "1px solid rgba(0,180,220,0.3)",
                display: "flex", flexDirection: "column", minHeight: 0,
              }}>
                <div style={{
                  padding: isMobile ? "6px 8px" : "8px 12px",
                  borderBottom: "1px solid rgba(0,180,220,0.35)",
                  fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 9 : 12,
                  color: "#00D4FF", letterSpacing: "0.12em", flexShrink: 0,
                }}>WEAPONS</div>
                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="sections-scroll">
                  {SKIN1_GUNS.map(gun => {
                    const active = selectedGun === gun.id || hoveredGun === gun.id;
                    return (
                      <div
                        key={gun.id}
                        onClick={() => setSelectedGun(p => p === gun.id ? null : gun.id)}
                        onMouseEnter={() => setHoveredGun(gun.id)}
                        onMouseLeave={() => setHoveredGun(null)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: isMobile ? "5px 8px" : "7px 12px",
                          borderBottom: "1px solid rgba(0,180,220,0.15)",
                          cursor: "pointer",
                          background: active ? "rgba(0,212,255,0.1)" : "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        <span style={{
                          fontFamily: "Orbitron,sans-serif",
                          fontSize: isMobile ? 7 : 9, fontWeight: "bold",
                          letterSpacing: "0.05em",
                          color: active ? "#00D4FF" : "rgba(0,200,240,0.8)",
                          lineHeight: 1.3,
                        }}>{t(`hud.guns.${gun.id}`, gun.name)}</span>
                        <div style={{
                          width: isMobile ? 6 : 8, height: isMobile ? 6 : 8,
                          borderRadius: "50%", flexShrink: 0, marginLeft: 5,
                          background: active ? "#00D4FF" : "rgba(0,180,220,0.5)",
                          boxShadow: active ? "0 0 8px #00D4FF" : "none",
                          transition: "all 0.18s",
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Information panel */}
              <div style={{
                width: isMobile ? 110 : "clamp(150px,15vw,200px)", flexShrink: 0,
                border: "2px solid #00D4FF",
                borderRadius: 4,
                margin: isMobile ? "6px 0" : "10px 0",
                background: "rgba(0,12,24,0.7)",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: isMobile ? "6px 8px" : "8px 12px",
                  borderBottom: "1px solid rgba(0,212,255,0.3)",
                  fontFamily: "Orbitron,sans-serif",
                  fontSize: isMobile ? 8 : 11,
                  fontWeight: "bold", letterSpacing: "0.12em",
                  color: "#00D4FF", textShadow: "0 0 8px rgba(0,212,255,0.5)",
                  flexShrink: 0,
                }}>INFORMATION</div>

                <div style={{ flex: 1, padding: isMobile ? "8px" : "12px", overflowY: "auto" }} className="sections-scroll">
                  {(() => {
                    const activeId = hoveredGun || selectedGun;
                    const gun = SKIN1_GUNS.find(g => g.id === activeId);
                    if (!gun) {
                      return (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{
                            fontFamily: "Orbitron,sans-serif",
                            fontSize: isMobile ? 7 : 9,
                            color: "rgba(0,212,255,0.3)",
                            letterSpacing: "0.1em",
                            textAlign: "center", lineHeight: 1.6,
                          }}>{t("hud.hoverSelectWeapon", "HOVER OR SELECT A WEAPON SLOT TO VIEW DETAILS")}</span>
                        </div>
                      );
                    }
                    return (
                      <>
                        <div style={{
                          fontFamily: "Orbitron,sans-serif",
                          fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                          letterSpacing: "0.1em", color: "#00D4FF",
                          textShadow: "0 0 6px rgba(0,212,255,0.6)",
                          marginBottom: isMobile ? 6 : 8,
                          paddingBottom: isMobile ? 4 : 6,
                          borderBottom: "1px solid rgba(0,212,255,0.2)",
                        }}>{t(`hud.guns.${gun.id}`, gun.name)}</div>
                        {/* All locked */}
                        {[
                          { key: "damage",   label: "Damage"    },
                          { key: "range",    label: "Range"     },
                          { key: "fireRate", label: "Fire Rate" },
                          { key: "upgrade",  label: "Upgrade"   },
                        ].map(({ key, label }) => (
                          <div key={key} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "5px 0",
                            borderBottom: "1px solid rgba(0,212,255,0.08)",
                          }}>
                            <span style={{
                              fontFamily: "Orbitron,sans-serif",
                              fontSize: isMobile ? 7 : 8,
                              color: "rgba(0,180,220,0.6)",
                              letterSpacing: "0.06em",
                            }}>{t(`hud.gunStats.${key}`, label)}</span>
                            <span style={{ fontSize: isMobile ? 9 : 11, opacity: 0.35 }}>🔒</span>
                          </div>
                        ))}
                        <div style={{
                          marginTop: isMobile ? 8 : 12,
                          fontFamily: "Orbitron,sans-serif",
                          fontSize: isMobile ? 6 : 7,
                          color: "rgba(0,212,255,0.35)",
                          letterSpacing: "0.08em", lineHeight: 1.6,
                        }}>
                          WEAPON STATS AVAILABLE AFTER OFFICIAL GAME LAUNCH
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Ship image + hotspots */}
              <div style={{ flex: 1, background: "#000", padding: isMobile ? "6px" : "10px", overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                  <img
                    src="/ships/level1-cover.webp"
                    alt="Skin 1 Weapons Layout"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />

                  {/* Weapon hotspot overlays */}
                  {SKIN1_GUNS.map(gun => {
                    const active = selectedGun === gun.id || hoveredGun === gun.id;
                    const fill   = active ? "rgba(0,212,255,0.07)" : "transparent";
                    const handlers = {
                      onMouseEnter: () => setHoveredGun(gun.id),
                      onMouseLeave: () => setHoveredGun(null),
                      onClick:      () => setSelectedGun(p => p === gun.id ? null : gun.id),
                    };

                    if (gun.circle) {
                      return (
                        <div
                          key={gun.id}
                          {...handlers}
                          style={{
                            position: "absolute",
                            left: `${gun.x}%`, top: `${gun.y}%`,
                            width: `${gun.w}%`, height: `${gun.h}%`,
                            borderRadius: "50%",
                            border: active ? "2px solid #00D4FF" : "2px solid transparent",
                            boxShadow: active ? "0 0 16px rgba(0,212,255,0.7), inset 0 0 10px rgba(0,212,255,0.1)" : "none",
                            background: fill,
                            cursor: "pointer", transition: "all 0.18s",
                          }}
                        />
                      );
                    }

                    if (gun.trapRight) {
                      const { topCut = 25, botCut = 25 } = gun.trapRight;
                      const pts = `0,${topCut} 100,0 100,100 0,${100 - botCut}`;
                      return (
                        <svg
                          key={gun.id}
                          {...handlers}
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          style={{
                            position: "absolute",
                            left: `${gun.x}%`, top: `${gun.y}%`,
                            width: `${gun.w}%`, height: `${gun.h}%`,
                            overflow: "visible", cursor: "pointer",
                            filter: active ? "drop-shadow(0 0 6px rgba(0,212,255,0.8))" : "none",
                            transition: "filter 0.18s",
                          }}
                        >
                          <polygon
                            points={pts}
                            fill={active ? "rgba(0,212,255,0.07)" : "transparent"}
                            stroke={active ? "#00D4FF" : "transparent"}
                            strokeWidth="3"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      );
                    }

                    return (
                      <div
                        key={gun.id}
                        {...handlers}
                        style={{
                          position: "absolute",
                          left: `${gun.x}%`, top: `${gun.y}%`,
                          width: `${gun.w}%`, height: `${gun.h}%`,
                          border: active ? "2px solid #00D4FF" : "2px solid transparent",
                          boxShadow: active ? "0 0 16px rgba(0,212,255,0.7), inset 0 0 10px rgba(0,212,255,0.1)" : "none",
                          background: fill,
                          borderRadius: 3, cursor: "pointer", transition: "all 0.18s",
                          ...(gun.rotate ? {
                            transform: `rotate(${gun.rotate}deg)`,
                            transformOrigin: "center center",
                          } : {}),
                        }}
                      />
                    );
                  })}

                  {/* Gun name popup on click */}
                  {selectedGun && (() => {
                    const gun = SKIN1_GUNS.find(g => g.id === selectedGun);
                    if (!gun) return null;
                    const toLeft   = (gun.x + gun.w) > 68;
                    const anchorLeft = toLeft ? `${gun.x}%` : `${gun.x + gun.w}%`;
                    const anchorTop  = `${gun.y}%`;
                    const popupW     = isMobile ? 110 : 140;
                    return (
                      <div style={{
                        position: "absolute",
                        left: anchorLeft, top: anchorTop,
                        transform: toLeft ? `translateX(-${popupW}px)` : "translateX(8px)",
                        zIndex: 30, width: popupW,
                        background: "linear-gradient(160deg, #020d1a, #010812)",
                        border: "1.5px solid #00D4FF",
                        borderRadius: 5,
                        boxShadow: "0 6px 28px rgba(0,0,0,0.95), 0 0 16px rgba(0,212,255,0.2)",
                        overflow: "hidden",
                        pointerEvents: "auto",
                      }}>
                        {/* Gun name header */}
                        <div style={{
                          background: "linear-gradient(90deg, #003a52, #001824)",
                          borderBottom: "1px solid #00D4FF",
                          padding: isMobile ? "5px 8px" : "6px 10px",
                          fontFamily: "Orbitron,sans-serif",
                          fontSize: isMobile ? 7 : 8,
                          fontWeight: "bold", letterSpacing: "0.1em",
                          color: "#00D4FF", textTransform: "uppercase",
                        }}>{t(`hud.guns.${gun.id}`, gun.name)}</div>
                        {/* Locked action rows */}
                        {[
                          { key: "detail",  label: "Detail"  },
                          { key: "upgrade", label: "Upgrade" },
                        ].map(({ key, label }, i) => (
                          <div key={key} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: isMobile ? "7px 10px" : "9px 12px",
                            borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            cursor: "default",
                          }}>
                            <span style={{
                              fontFamily: "Orbitron,sans-serif",
                              fontSize: isMobile ? 8 : 10,
                              fontWeight: "bold", letterSpacing: "0.1em",
                              color: "rgba(200,200,200,0.4)",
                            }}>{t(`hud.gunStats.${key}`, label)}</span>
                            <span style={{ fontSize: isMobile ? 9 : 11, opacity: 0.35 }}>🔒</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* ── Bottom bar ── */}
            <div style={{
              height: isMobile ? 10 : 18,
              background: "linear-gradient(90deg, #000 0%, #003a52 30%, #002a40 70%, #000 100%)",
              borderTop: "2px solid #0099cc",
              flexShrink: 0,
            }} />
          </div>
        </div>
      )}
    </>
  );
}
