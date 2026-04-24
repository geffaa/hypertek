/**
 * ProfileButton — avatar card top-left.
 * • Click avatar circle → open Avatar Equipment panel
 * • Click avatar image inside panel → open Character Selection panel
 * • Character selection persists to localStorage
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import useMobileLandscape from "../../hooks/useMobileLandscape";
import {
  GiLaserGun,
  GiSpaceSuit,
  GiBoots,
  GiHelmet,
  GiGauntlet,
  GiFlagObjective,
  GiPowerLightning,
  GiStarMedal,
  GiPlasmaBolt,
} from "react-icons/gi";

/* ── Species data ─────────────────────────────────────────────── */
// imgs[0] = female, imgs[1] = male  (genders array matches imgs order)
const SPECIES = [
  {
    id: "lithionites", name: "Lithionites",
    type: "Mutagenic Metamorphic Hybrid",
    symbolism: "Wisdom / Owl",
    height: "5.8 – 6.4 feet", eyes: "Pale Blue / Blue or Purple",
    skin: "Semi Crystalised Stone Structure",
    culture: "Hinduism · Pyramids · Statues",
    environment: "Caves, Mountains and Rocky Plains",
    clothing: "Trial style, made of natural and fabricated fibres",
    palette: ["#E5E7EB", "#374151", "#9CA3AF", "#D1D5DB"],
    notes: "The Lithionites are a complex species, classified as mutagenic, metamorphic hybrids. They are distinguished by their hard, rough exoskeletons and unique crystallised fluidic inner structure.\n\nIn terms of behaviour, Lithionites are known for their aggressive nature and can be easily provoked into combat when threatened or challenged. Despite their fierce disposition, they are quite sociable among members of their own species, where they often engage in social bonding rituals, although they are typically wary of outsiders and may perceive them as threats and, or prey.\n\nWithin their groups, Lithionites have a tendency to test their strength against one another, leading to competitive displays that can sometimes disrupt group cohesion and unity. This frequent rivalry, while integral to their culture, can result in internal conflicts.\n\nTheir diet is diverse, encompassing both plant life and meat sources. Lithionites are skilled hunters and ruthless in capturing prey. Their lack of mercy during hunts showcases their survival instincts and emphasises their dominance in their ecosystem.\n\nLithionites reside in caves or constructed rock shelters at the bases of mountainous regions and rocky plains. These environments not only provide them with ample resources but also serve as strategic vantage points for observing rival species or potential threats.\n\nLoyalty is a cornerstone of Lithionite culture; they are fiercely devoted to their kin and will mobilise to engage in warfare against other species to secure territory and valuable resources. This warrior spirit reflects their deep-rooted beliefs and values.\n\nSpiritually, Lithionites hold a profound connection to crystallised structures, considering them sacred. They engage in rituals that involve worshipping the light emitted from fire and the energies radiated by the crystals that surround them.",
    imgs: ["/avatar/lithionites-female.png", "/avatar/lithionites-male.png"],
    genders: ["female", "male"],
  },
  {
    id: "marmulus", name: "Marmulus",
    type: "Mutagenic Metamorphic Hybrid",
    symbolism: "The Sun / Moon / Stars",
    height: "6 – 7 feet", eyes: "Yellow",
    wings: "Can not maintain flight, but can hover",
    skin: "White/Black, gold veins, marble texture",
    culture: "Egyptian · Technology · Gods",
    environment: "Base of Mountains or Rocky Plains",
    clothing: "Egyptian/Modern style, made of natural and fabricated fibres",
    palette: ["#FFFFFF", "#FCD34D", "#92400E", "#111827"],
    notes: "The Marmulus species are classified as mutagenic, metamorphic hybrids. These extraordinary beings are characterised by their hard, smooth exoskeletons and feature a unique, energised fluidic inner core.\n\nMarmulus are not just biologically advanced; they are also socially vibrant and incredibly outgoing. They express their sexuality openly, celebrating their identities through elaborate displays.\n\nTheir diet is diverse, comprising both plant life and meat, reflecting their adaptability as a species. Marmulus have a keen appreciation for valuable items and wealth, often seeking out rare treasures.\n\nOver the centuries, they have developed impressive cities that stand as testaments to their intelligence and creativity, favouring locations in mountainous regions or areas characterised by hard stone, which provide their inspiration.\n\nThe social structure of the Marmulus is deeply rooted in democratic values, fostering loyalty and camaraderie among its communities. They maintain a well-defined authority that ensures harmony within their society. Central to their culture is a belief in spiritual beings and the importance of structural alignment, guiding their interactions with both the physical and metaphysical worlds.",
    imgs: ["/avatar/marmulus-female.png", "/avatar/marmulus-male.png"],
    genders: ["female", "male"],
  },
  {
    id: "ophidians", name: "Ophidians",
    type: "Snake Alien Hybrid",
    symbolism: "Aztec Symbols",
    height: "7.6 – 8.0 feet", eyes: "Reddy Orange / Reddy Brown",
    skin: "Reptile, snake-like all over",
    culture: "Aztec · Fire Worship",
    environment: "Rain Forests – Overgrown Rocky Plains",
    clothing: "Roman, Natural and Fabricated Fibres, Silk, Cotton, and Leather",
    palette: ["#111827", "#7C2D12", "#B45309", "#BAE6FD"],
    notes: "The Ophidians species are characterised by their unique snake-alien hybrid appearance. With smooth, scaly skin that glistens in vibrant dark arrays of colors.\n\nThese creatures thrive in social settings, exhibiting a strong tendency to interact and bond with one another, although their demeanour towards outsiders is notably hostile.\n\nTheir diet is diverse, encompassing both meat and plant-based foods, which supports their dynamic lifestyle.\n\nOphidians are renowned for their deep social connections and affection, forming tight-knit communities where loyalty is paramount. When their territory is threatened, they display fierce protectiveness, and their readiness to engage in conflict can be easily provoked.\n\nWorshipping the sun is an integral part of their culture, as they flourish in warm to hot plains and arid regions. Their architectural prowess is evident in the advanced cities they construct in these sun-drenched environments, showcasing their engineering skills and adaptation to their preferred habitats.",
    imgs: ["/avatar/ophidians-female.png", "/avatar/ophidians-male.png"],
    genders: ["female", "male"],
  },
  {
    id: "geodians", name: "Geodians",
    type: "Mutagenic Metamorphic Hybrid",
    symbolism: "The Moon / Stars / Light",
    height: "6.6 – 7.2 feet", eyes: "Pale Blue / Blue / Purple",
    skin: "Infused Crystallised Structure",
    culture: "Mesopotamia · Art · Dance",
    environment: "Base of Mountains with thermal activity or Thermal Caves",
    clothing: "Long, flowing, Semi-Transparent, made of natural and fabricated fibres",
    palette: ["#FFFFFF", "#111827", "#78350F", "#9CA3AF"],
    notes: "The Geodian species are classified as mutagenic, metamorphic hybrids. These remarkable beings possess a striking crystalised lattice exoskeleton that shimmers and refracts light with mesmerising beauty, while their inner core flows with a thermos fluidic substance that fluctuates with thermal energy.\n\nIntelligent and highly evolved, Geodians have established intricate cities, showcasing advanced engineering and architectural marvels that often flourish near thermal hot springs or regions of intense heat, where their unique biology thrives.\n\nSocial in nature, Geodians embrace their communal existence, openly expressing their emotions and sexuality, fostering connections that bind them together.\n\nTheir diet is versatile, comprising both lush plant life and various forms of meat, reflecting their adaptive nature.\n\nThe Geodian society is marked by its democratic principles and well-structured systems, ensuring every voice is heard.\n\nThey hold a deep reverence for light, which dances through their crystal lattice, creating a captivating spectacle that symbolises their spiritual beliefs and unity within the community.",
    imgs: ["/avatar/geodians-female.png", "/avatar/geodians-male.png"],
    genders: ["female", "male"],
  },
  {
    id: "fawnus", name: "Fawnus",
    type: "Goat Alien Hybrid",
    symbolism: "Religious Symbols",
    height: "5.8 – 6.0 feet", eyes: "Red / Pale Green",
    skin: "White to Light Grey, fine hair",
    culture: "Spanish Civilisation · Music · Gold",
    environment: "Flat Dry Plains, Base of Mountains",
    clothing: "Steampunk Style of clothing made from Natural and Fabricated Fibres, Silk, Cotton, and Leather",
    palette: ["#3B1F0A", "#1D3557", "#8B3A3A", "#B8860B"],
    notes: "The Fawnus species resembles a captivating blend of goat and alien features. Their bodies are covered in coarse, short fur that varies in colour, giving them an intriguing appearance that reflects their playful personalities.\n\nInherently mischievous and spirited, Fawnus are known for their love of play, often engaging in activities that showcase their vibrant energy.\n\nTheir diet is impressively diverse, as they thrive on both meat and plant-based foods, allowing them to adapt in varying environments that support their dynamic lifestyles.\n\nSocially, Fawnus are deeply connected, forming tight-knit communities where loyalty holds significant value. Their bonds are fierce, and they display a protective instinct towards both their kin and their territory, making them guardians of the places they inhabit.\n\nCulturally, the Fawnus are devout, worshipping an array of gods and religious symbols that are integral to their way of life. They take cues from Spanish culture, revelling in the joy of music and the allure of wealth, particularly gold, which they cherish as a symbol of prosperity.\n\nArchitecturally, their creations are nothing short of magnificent, showcasing a steampunk style that reflects both their artistic flair and engineering prowess. Grand structures adorned with intricate designs and mechanisms stand as a testament to their creativity and innovation.",
    imgs: ["/avatar/fawnus-female.png", "/avatar/fawnus-male.png"],
    genders: ["female", "male"],
  },
  {
    id: "mantaquads", name: "Mantaquads",
    type: "4 Armed Alien Hybrid",
    symbolism: "Religious Medieval and Satanic Symbols",
    height: "5.8 – 6.6 feet", eyes: "Orange / Red (4 Eyes)",
    arms: "4 Arms",
    skin: "Skin Tone to Light Brown",
    culture: "Medieval · Monk · Satanic",
    environment: "Caves in Mountains or Hillsides",
    clothing: "Cloaked or Hooded Style of clothing made from Natural and Fabricated Fibres, Silk, Cotton, and Leather",
    palette: ["#0A0A0A", "#2C1A0E", "#6B2737", "#4B0082"],
    imgs: ["/avatar/mantasquads-female.png", "/avatar/mantasquads-male.png"],
    genders: ["female", "male"],
    notes: "The Mantaquads are unique beings, characterised by their four dexterous arms and four observant eyes, embodying the essence of an alien hybrid. These creatures possess a hive mind, allowing them to operate in perfect unison, which makes them a formidable force.\n\nSocial creatures by nature, Mantaquads engage in vibrant interactions and are known for their open and adventurous approach to sexuality.\n\nTheir pursuit of perfection drives them to master a wide array of martial arts, honing their skills with relentless dedication.\n\nThey consume both meat and plant-based foods, with a particular desire for hunting. Their hunting methods are both thrilling and ruthless, as they prefer to consume their prey while it is still alive, revelling in the primal act of pursuit.\n\nAs mercenaries, the Mantaquads are often sought after for their unparalleled efficiency and merciless prowess in battle. Their hive minds enhance this capability, enabling them to function seamlessly as a single unit, whether in combat or construction.\n\nThese beings exhibit remarkable architectural skills, erecting intricate and massive structures at a pace unmatched by any other species. Deeply religious, Mantaquads are devoted worshippers who follow an intriguing blend of medieval traditions and the use of satanic symbols. They demonstrate their faith by contributing at least 10% of their wealth to churches, reflecting their commitment to their beliefs and community.",
  },
  {
    id: "dryads", name: "Dryads",
    type: "Tree Alien Hybrid",
    symbolism: "Bird · Sun · Butterfly · Dragonfly",
    height: "6 – 6.6 feet", eyes: "Red / Brown / Hazel / Black / Green",
    wings: "Can not maintain flight, but can hover",
    skin: "Wood Root / Leaf-Like",
    culture: "Water · Nature · Spirit · Elements",
    environment: "Woodlands · Forests · Overgrown Rocky Plains",
    clothing: "Natural Plant and Tree-Based Fibres, Silk, Cotton, and Leather",
    palette: ["#2D5016", "#5C3A1E", "#8B2500", "#4A7C59"],
    notes: "The Dryads are a fascinating and unique species, characterised by their hybrid nature that combines traits of trees and alien beings. This distinctive physiology allows them to thrive in diverse environments, often resembling the flora around them.\n\nThey have a hive-like mind, which enables them to communicate seamlessly with one another. This collective consciousness fosters a deep sense of unity and cooperation, allowing them to operate as a cohesive group while maintaining an intricate connection to the natural world, and they can sense the health of their surroundings, making them exceptional guardians of nature.\n\nTheir diet is primarily plant-based, consisting of leaves, fruits, and other botanical materials. However, they occasionally supplement their diet with small quantities of meat, which they acquire with great care and respect for the life they take.\n\nIn addition to their physical attributes, the Dryads are known for their playful and mischievous behaviour. They often engage in light-hearted pranks or games, reflecting their joyful spirit.\n\nTheir loyalty to one another and their homeland is unwavering, and they will fiercely protect their community and territory when threatened.\n\nSpiritually, the Dryads hold a profound belief in an afterlife that is intertwined with the cycles of nature. They revere the natural elements (Earth, Air, Fire, and Water) as divine forces, and they also worship celestial bodies such as the sun and stars, which they perceive as guiding lights in their existence. This deep connection to both nature and the cosmos shapes their culture, rituals, and overall way of life.",
    imgs: ["/avatar/dryads-female.png", "/avatar/dryads-male.png"],
    genders: ["female", "male"],
  },
];

/* ── Profile frames ───────────────────────────────────────────── */
const PROFILE_FRAMES = [
  { id: "default",  name: "Standard",     bonus: "Base frame",     color: "#00D4FF", locked: false },
  { id: "iron",     name: "Iron Guard",   bonus: "+5,000 Might",   color: "#94a3b8", locked: true  },
  { id: "crystal",  name: "Cryo Crystal", bonus: "+2% Endurance",  color: "#7dd3fc", locked: true  },
  { id: "plasma",   name: "Plasma Core",  bonus: "+10,000 Might",  color: "#f97316", locked: true  },
  { id: "overlord", name: "Overlord",     bonus: "+20% All Stats", color: "#a855f7", locked: true  },
];

/* ── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  .profile-circle {
    transition: box-shadow 0.22s, transform 0.22s;
    cursor: pointer; display: block;
  }
  .profile-circle:hover {
    transform: scale(1.06);
    box-shadow: 0 0 0 2px #00D4FF, 0 0 24px rgba(0,212,255,0.65), 0 0 6px rgba(0,0,0,0.9) !important;
  }
  .frame-opt {
    transition: transform 0.15s, box-shadow 0.15s;
    cursor: pointer;
  }
  .frame-opt:hover {
    transform: scale(1.08);
  }
  .equip-slot {
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
    cursor: pointer;
  }
  .equip-slot:hover {
    border-color: rgba(0,212,255,0.85) !important;
    box-shadow: 0 0 20px rgba(0,212,255,0.5), 0 0 8px rgba(0,212,255,0.3) !important;
    transform: scale(1.06);
  }
  .char-card {
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    cursor: pointer;
  }
  .char-card:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 0 18px rgba(0,212,255,0.35), 0 6px 20px rgba(0,0,0,0.6) !important;
  }
  .avatar-img-btn {
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
  }
  .avatar-img-btn:hover {
    transform: scale(1.04);
    box-shadow: 0 0 18px rgba(0,212,255,0.55), 0 0 36px rgba(0,212,255,0.18) !important;
  }
  @keyframes avatarPanelIn {
    from { opacity:0; transform: translateY(-10px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }
  .avatar-panel { animation: avatarPanelIn 0.2s ease both; }
  @keyframes charPanelIn {
    from { opacity:0; transform: translateX(-8px) scale(0.97); }
    to   { opacity:1; transform: translateX(0) scale(1); }
  }
  .char-panel { animation: charPanelIn 0.22s ease both; }
  .char-grid::-webkit-scrollbar { width: 4px; }
  .char-grid::-webkit-scrollbar-track { background: rgba(0,212,255,0.04); }
  .char-grid::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.28); border-radius: 4px; }
  .detail-strip::-webkit-scrollbar { width: 3px; }
  .detail-strip::-webkit-scrollbar-track { background: transparent; }
  .detail-strip::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.35); border-radius: 4px; }
  .detail-strip { scrollbar-width: thin; scrollbar-color: rgba(0,212,255,0.35) transparent; }
`;

/* ── Slot icons ───────────────────────────────────────────────── */
const SLOT_ICONS = {
  Weapon: { icon: GiLaserGun,       color: "#f87171" },
  Suit:   { icon: GiSpaceSuit,      color: "#38bdf8" },
  Boots:  { icon: GiBoots,          color: "#fb923c" },
  Helmet: { icon: GiHelmet,         color: "#fcd34d" },
  Gloves: { icon: GiGauntlet,       color: "#a78bfa" },
  Flag:   { icon: GiFlagObjective,  color: "#f87171" },
  Staff:  { icon: GiPowerLightning, color: "#c4b5fd" },
  Badge:  { icon: GiStarMedal,      color: "#fcd34d" },
  Power:  { icon: GiPlasmaBolt,     color: "#38bdf8" },
};

function Slot({ label, size = 54 }) {
  const slot = SLOT_ICONS[label] || { icon: null, color: "#00D4FF" };
  const IconComp = slot.icon;
  const iconSize = Math.round(size * 0.52);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div className="equip-slot" style={{
        width: size, height: size,
        border: `1.5px solid ${slot.color}55`, borderRadius: 6,
        background: `radial-gradient(circle at 40% 35%, ${slot.color}18, rgba(3,10,28,0.92))`,
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 10px ${slot.color}22, inset 0 1px 0 rgba(255,255,255,0.06)`,
        lineHeight: 1, position: "relative",
      }}>
        {IconComp && (
          <IconComp
            size={iconSize}
            color={slot.color}
            style={{ filter: `drop-shadow(0 0 5px ${slot.color}aa)`, opacity: 0.85 }}
          />
        )}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 6,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: Math.round(size * 0.3),
        }}>🔒</div>
      </div>
      <span style={{
        fontFamily: "Orbitron,sans-serif", fontSize: size >= 48 ? 9 : 7, fontWeight: "bold",
        letterSpacing: "0.08em", color: slot.color, textShadow: `0 0 6px ${slot.color}66`,
      }}>{label.toUpperCase()}</span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function ProfileButton() {
  const isMobile = useMobileLandscape();
  const [windowW, setWindowW] = useState(() => window.innerWidth);
  const [windowH, setWindowH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => { setWindowW(window.innerWidth); setWindowH(window.innerHeight); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isSmall = windowW < 600; // portrait phones / very small screens

  const { token } = useSelector((s) => s.auth);
  const [profile,        setProfile]        = useState(null);
  const [open,           setOpen]           = useState(false);
  const [charSelectOpen, setCharSelectOpen] = useState(false);
  const [hoveredChar,    setHoveredChar]    = useState(null); // { speciesId, variantIdx }
  const [selectedFrame,   setSelectedFrame]   = useState("default");
  const [framePickerOpen, setFramePickerOpen] = useState(false);
  const [selectedChar,   setSelectedChar]   = useState(() => {
    try {
      const s = localStorage.getItem("hypertek_selected_char");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [speciesIdx,      setSpeciesIdx]      = useState(() => {
    try {
      const s = localStorage.getItem("hypertek_selected_char");
      const char = s ? JSON.parse(s) : null;
      if (char) {
        const idx = SPECIES.findIndex(sp => sp.id === char.speciesId);
        return idx >= 0 ? idx : 0;
      }
    } catch { /* ignore */ }
    return 0;
  });
  const [slideDir,        setSlideDir]        = useState(1);
  const [notesOpen,       setNotesOpen]       = useState(false);
  const carouselContainerRef = useRef(null);
  const [carouselW,       setCarouselW]       = useState(680);
  const touchStartX = useRef(null);
  const panelRef = useRef(null);
  const frameLeaveTimer = useRef(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setProfile(res.data.user)).catch(() => {});
  }, [token]);

  /* close all panels on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (charSelectOpen) return; // char-select panel is outside panelRef — don't close
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setCharSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, charSelectOpen]);

  const backendAvatarSrc = profile?.Avatar ? `${BACKEND_BASE_URL}${profile.Avatar}` : "/avatar/geodians-male.png";
  const displayAvatarSrc = selectedChar
    ? (SPECIES.find(s => s.id === selectedChar.speciesId)?.imgs[selectedChar.variantIdx] ?? backendAvatarSrc)
    : backendAvatarSrc;
  // Portrait (head-only) version for the small profile circle
  const portraitAvatarSrc = displayAvatarSrc.replace("/avatar/", "/avatar-potrait/");

  const getDisplayName = () =>
    localStorage.getItem("hypertek_display_name") ||
    (profile?.Email ? profile.Email.split("@")[0].replace(/[0-9]/g, "").toUpperCase() || "COMMANDER" : "COMMANDER");

  const [displayName, setDisplayName] = useState(getDisplayName);
  useEffect(() => { setDisplayName(getDisplayName()); }, [profile]);
  useEffect(() => {
    const handler = (e) => setDisplayName(e.detail || getDisplayName());
    window.addEventListener("hypertek_name_changed", handler);
    return () => window.removeEventListener("hypertek_name_changed", handler);
  }, []);

  // Measure carousel container width when panel opens
  useEffect(() => {
    if (!charSelectOpen || !carouselContainerRef.current) return;
    const update = () => { if (carouselContainerRef.current) setCarouselW(carouselContainerRef.current.offsetWidth); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(carouselContainerRef.current);
    return () => ro.disconnect();
  }, [charSelectOpen]);

  // Keyboard ← → navigation
  useEffect(() => {
    if (!charSelectOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft")  { setSlideDir(-1); setSpeciesIdx(i => i - 1); setHoveredChar(null); }
      if (e.key === "ArrowRight") { setSlideDir(1);  setSpeciesIdx(i => i + 1); setHoveredChar(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [charSelectOpen]);

  const handleSelectChar = (speciesId, variantIdx) => {
    const next = { speciesId, variantIdx };
    setSelectedChar(next);
    localStorage.setItem("hypertek_selected_char", JSON.stringify(next));
    setCharSelectOpen(false);
  };

  const modIdx = ((speciesIdx % SPECIES.length) + SPECIES.length) % SPECIES.length;

  /* species detail shown at bottom of char-select panel —
     always tracks the currently centred carousel card, not the selected char */
  const detailSpecies = hoveredChar
    ? SPECIES.find(s => s.id === hoveredChar.speciesId)
    : SPECIES[modIdx];

  const detailVariant = hoveredChar?.variantIdx
    ?? (selectedChar?.speciesId === SPECIES[modIdx].id ? selectedChar.variantIdx : 0);

  // Reset notes panel when switching characters
  useEffect(() => { setNotesOpen(false); }, [detailSpecies?.id]);

  /* equipment panel width (for char panel offset) */
  const equipW = isMobile ? 240 : 320;

  return (
    <>
      <style>{CSS}</style>

      <div ref={panelRef} style={{
        position: "absolute",
        left: isMobile ? "5vw" : "6vw",
        top:  isMobile ? "4px" : "5.5vh",
        transform: isMobile ? "none" : "translate(-50%, -35%)",
        zIndex: 30,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
        pointerEvents: "auto",
      }}>

        {/* ── Avatar circle with sci-fi SVG frame ── */}
        {(() => {
          const frameColor = PROFILE_FRAMES.find(f => f.id === selectedFrame)?.color ?? "#00D4FF";
          // Numeric avatar diameter
          const sizeNum = isMobile ? 38 : Math.min(68, Math.max(50, windowH * 0.075));
          // PNG frame: inner transparent circle ≈ 51% of image width
          // So total frame display size = sizeNum / 0.51
          const framePx  = Math.round(sizeNum / 0.51);
          const avatarDisplaySize = Math.round(sizeNum * 1.45); // reduced to stay inside frame
          const avatarOff = Math.round((framePx - avatarDisplaySize) / 2); // center avatar inside frame
          const avatarTopOff = avatarOff + Math.round(framePx * 0.02); // slight downward shift

          // Level badge — bottom-left: single box with LVL + number
          const boxSize   = Math.round(framePx * 0.30);
          const badgeLeft = Math.round(framePx * 0.04);
          const lvlLabelH = Math.round(boxSize * 0.20);
          const badgeTop  = Math.round(framePx * 0.68);

          return (
            <div
              style={{ position: "relative", width: framePx, height: framePx, overflow: "visible", cursor: "pointer" }}
              onClick={() => setOpen(o => !o)}
            >
              {/* Avatar image — centered inside frame's transparent circle */}
              <div style={{
                position: "absolute",
                left: avatarOff, top: avatarTopOff,
                width: avatarDisplaySize, height: avatarDisplaySize,
                borderRadius: "50%", overflow: "hidden",
                background: "radial-gradient(ellipse at 50% 15%, rgba(0,212,255,0.45) 0%, rgba(110,40,200,0.38) 45%, rgba(8,4,30,0.96) 100%)",
              }}>
                <img
                  src={portraitAvatarSrc}
                  alt="Profile"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/avatar-potrait/geodians-male.png"; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
                />
              </div>

              {/* PNG frame overlay — sits on top of avatar, transparent center shows avatar */}
              <img
                src="/profile-frame.png"
                alt=""
                draggable={false}
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: framePx, height: framePx,
                  pointerEvents: "none", userSelect: "none",
                  filter: selectedFrame !== "default" ? `hue-rotate(${
                    selectedFrame === "plasma"   ? "180deg" :
                    selectedFrame === "overlord" ? "260deg" :
                    selectedFrame === "iron"     ? "200deg" :
                    selectedFrame === "crystal"  ? "20deg"  : "0deg"
                  }) saturate(1.2)` : "none",
                }}
              />

              {/* Level badge — single box with LVL on top, number below */}
              <div style={{
                position: "absolute", left: badgeLeft, top: badgeTop,
                width: Math.round(boxSize * 1.35), height: Math.round(boxSize * 0.85),
                background: "rgba(4,10,26,0.92)",
                border: `1.5px solid ${frameColor}`,
                borderRadius: 4,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 8px ${frameColor}66`,
                pointerEvents: "none", gap: 0,
              }}>
                <span style={{
                  fontFamily: "Orbitron, monospace", fontSize: lvlLabelH,
                  fontWeight: "bold", color: frameColor, letterSpacing: "0.1em",
                  lineHeight: 1, opacity: 0.8,
                }}>LVL</span>
                <span style={{
                  fontFamily: "Orbitron, monospace", fontSize: Math.round(boxSize * 0.40),
                  fontWeight: "bold", color: frameColor, letterSpacing: "0.05em",
                  textShadow: `0 0 8px ${frameColor}`, lineHeight: 1.1,
                }}>23</span>
              </div>
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════
            AVATAR EQUIPMENT PANEL
            ══════════════════════════════════════════ */}
        {open && (
          <div className="avatar-panel" style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: isMobile ? "0" : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            width: equipW,
            background: "rgba(4,10,26,0.97)",
            border: "1px solid rgba(0,212,255,0.3)",
            borderRadius: 10,
            backdropFilter: "blur(18px)",
            boxShadow: "0 12px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,212,255,0.1)",
            padding: isMobile ? "10px 10px 10px" : "16px 14px 12px",
            zIndex: 40,
          }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 6 : 10 }}>
              <span style={{
                fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 9 : 11, fontWeight: "bold",
                letterSpacing: "0.14em", color: "#00D4FF", textShadow: "0 0 10px rgba(0,212,255,0.7)",
              }}>AVATAR</span>
              <button onClick={() => { setOpen(false); setCharSelectOpen(false); }} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                fontSize: isMobile ? 14 : 18, cursor: "pointer", lineHeight: 1, padding: "0 2px",
              }}>×</button>
            </div>

            {/* Equipment layout */}
            <div style={{ display: "flex", gap: isMobile ? 5 : 8, alignItems: "center", justifyContent: "center" }}>

              {/* Left: Weapon / Suit / Boots */}
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 10, alignItems: "center" }}>
                <Slot label="Weapon" size={isMobile ? 42 : 60} />
                <Slot label="Suit"   size={isMobile ? 42 : 60} />
                <Slot label="Boots"  size={isMobile ? 42 : 60} />
              </div>

              {/* Center: Name/LVL header + Avatar image in sci-fi frame */}
              {(() => {
                const frameColor = PROFILE_FRAMES.find(f => f.id === selectedFrame)?.color ?? "#00D4FF";
                const imgW = isMobile ? 68 : 100;
                const imgH = isMobile ? 98 : 148;
                return (
                  <div style={{ flex: 1, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 4 : 6 }}>

                    {/* Name + LVL */}
                    <div style={{
                      background: "rgba(3,8,20,0.88)",
                      border: `1px solid ${frameColor}44`,
                      borderRadius: 4, padding: isMobile ? "3px 8px" : "4px 12px",
                      textAlign: "center", width: "100%",
                    }}>
                      <div style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                        letterSpacing: "0.12em", color: frameColor,
                        textShadow: `0 0 8px ${frameColor}88`, lineHeight: 1.3,
                      }}>{displayName}</div>
                      <div style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 9,
                        letterSpacing: "0.1em", color: "rgba(255,255,255,0.75)", lineHeight: 1.3,
                      }}>LvL: 23</div>
                    </div>

                    {/* Avatar image in sci-fi frame — hover shows frame picker */}
                    <div style={{ position: "relative" }}
                      onMouseEnter={() => { clearTimeout(frameLeaveTimer.current); setFramePickerOpen(true); }}
                      onMouseLeave={() => { frameLeaveTimer.current = setTimeout(() => setFramePickerOpen(false), 120); }}
                    >

                      {/* Avatar image with PNG frame overlay */}
                      <div style={{ position: "relative", width: imgW, height: imgH }}>
                        {/* Image container — clipped to card bounds */}
                        <div style={{
                          width: "100%", height: "100%",
                          background: `radial-gradient(ellipse at 50% 30%, ${frameColor}18, transparent 70%)`,
                          borderRadius: 4,
                          overflow: "hidden",
                          boxShadow: `0 0 14px ${frameColor}44`,
                        }}>
                          <img
                            src={displayAvatarSrc}
                            alt="avatar"
                            onError={(e) => { e.currentTarget.src = "/avatar/geodians-male.png"; }}
                            style={{ width: "100%", height: "170%", objectFit: "cover", objectPosition: "center 10%", display: "block", transform: "scale(1.2)", transformOrigin: "top center" }}
                          />
                        </div>
                        {/* PNG frame overlay — wrapper uses inset so right/left both work */}
                        <div style={{
                          position: "absolute",
                          top: isMobile ? -5 : -6,
                          bottom: isMobile ? -14 : -24,
                          left: isMobile ? -8 : -14,
                          right: isMobile ? -12 : -20,
                          pointerEvents: "none", userSelect: "none",
                        }}>
                          <img
                            src="/avatar-frame.png"
                            alt=""
                            draggable={false}
                            style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
                          />
                        </div>
                      </div>

                      {/* CHANGE button — separate, below image */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setCharSelectOpen(o => !o); }}
                        style={{
                          width: "100%", marginTop: 6,
                          background: `linear-gradient(180deg, ${frameColor}22, ${frameColor}0d)`,
                          border: `1px solid ${frameColor}88`,
                          borderRadius: 3, padding: "4px 0",
                          fontFamily: "Orbitron,sans-serif", fontSize: 9, fontWeight: "bold",
                          letterSpacing: "0.12em", color: frameColor,
                          textShadow: `0 0 6px ${frameColor}99`,
                          cursor: "pointer",
                        }}
                      >CHANGE ▸</button>

                      {/* Frame picker overlay on hover */}
                      {framePickerOpen && (
                        <div
                          onMouseEnter={() => clearTimeout(frameLeaveTimer.current)}
                          onMouseLeave={() => { frameLeaveTimer.current = setTimeout(() => setFramePickerOpen(false), 120); }}
                          style={{
                          position: "absolute", top: 0, left: "calc(100% + 4px)",
                          background: "rgba(3,10,24,0.97)",
                          border: "1px solid rgba(0,212,255,0.28)",
                          borderRadius: 6, padding: "8px",
                          boxShadow: "0 8px 28px rgba(0,0,0,0.75)",
                          backdropFilter: "blur(16px)",
                          zIndex: 50, width: 140,
                          display: "flex", flexDirection: "column", gap: 5,
                        }}>
                          <div style={{
                            fontFamily: "Orbitron,sans-serif", fontSize: 8, fontWeight: "bold",
                            color: "#00D4FF", letterSpacing: "0.12em", marginBottom: 3,
                          }}>PROFILE FRAME</div>
                          {PROFILE_FRAMES.map(f => (
                            <div
                              key={f.id}
                              className="frame-opt"
                              onClick={(e) => { e.stopPropagation(); if (!f.locked) setSelectedFrame(f.id); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "5px 7px", borderRadius: 4,
                                border: selectedFrame === f.id
                                  ? `1px solid ${f.color}`
                                  : "1px solid rgba(255,255,255,0.08)",
                                background: selectedFrame === f.id
                                  ? `${f.color}18`
                                  : "rgba(255,255,255,0.03)",
                                opacity: f.locked ? 0.55 : 1,
                                cursor: f.locked ? "not-allowed" : "pointer",
                              }}
                            >
                              {/* Color swatch */}
                              <div style={{
                                width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                                background: f.color,
                                boxShadow: `0 0 6px ${f.color}88`,
                                border: "1px solid rgba(255,255,255,0.2)",
                              }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{
                                  fontFamily: "Orbitron,sans-serif", fontSize: 8, fontWeight: "bold",
                                  color: f.locked ? "#9CA3AF" : f.color,
                                  letterSpacing: "0.06em", whiteSpace: "nowrap",
                                }}>
                                  {f.locked ? "🔒 " : ""}{f.name}
                                </div>
                                <div style={{
                                  fontFamily: "Orbitron,sans-serif", fontSize: 7,
                                  color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em",
                                }}>{f.bonus}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Might + Endurance frame */}
                    <div style={{
                      width: "100%",
                      background: "rgba(3,8,20,0.88)",
                      border: `1px solid ${frameColor}44`,
                      borderRadius: 4, padding: isMobile ? "4px 6px" : "5px 8px",
                      position: "relative",
                    }}>
                      {/* corner accents */}
                      {[
                        { top: -1, left: -1,   borderTop: `1px solid ${frameColor}`, borderLeft:   `1px solid ${frameColor}`, width: 5, height: 5 },
                        { top: -1, right: -1,  borderTop: `1px solid ${frameColor}`, borderRight:  `1px solid ${frameColor}`, width: 5, height: 5 },
                        { bottom: -1, left: -1,  borderBottom: `1px solid ${frameColor}`, borderLeft:   `1px solid ${frameColor}`, width: 5, height: 5 },
                        { bottom: -1, right: -1, borderBottom: `1px solid ${frameColor}`, borderRight:  `1px solid ${frameColor}`, width: 5, height: 5 },
                      ].map((c, i) => (
                        <div key={i} style={{ position: "absolute", pointerEvents: "none", ...c }} />
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>MIGHT</span>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold", color: "#fbbf24", letterSpacing: "0.05em" }}>342,879,418</span>
                      </div>
                      <div style={{ height: 1, background: `${frameColor}22`, margin: "2px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>ENDURANCE</span>
                        <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold", color: "#6ee7b7", letterSpacing: "0.05em" }}>685</span>
                      </div>
                    </div>

                    {selectedChar && (
                      <span style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: 9,
                        letterSpacing: "0.07em", color: "#7ECEEC",
                        textAlign: "center",
                      }}>
                        {SPECIES.find(s => s.id === selectedChar.speciesId)?.name ?? ""}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Right: Helmet / Gloves */}
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 10, alignItems: "center", justifyContent: "center" }}>
                <Slot label="Helmet" size={isMobile ? 42 : 60} />
                <Slot label="Gloves" size={isMobile ? 42 : 60} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(0,212,255,0.1)", margin: isMobile ? "6px 0" : "10px 0" }} />

            {/* Bottom row: Flag / Staff / Badge / Power */}
            <div style={{ display: "flex", justifyContent: "space-around", gap: isMobile ? 4 : 8 }}>
              {["Flag", "Staff", "Badge", "Power"].map(label => (
                <Slot key={label} label={label} size={isMobile ? 40 : 58} />
              ))}
            </div>

          </div>
        )}

        {/* char-select moved outside – see below the main div */}

      </div>

      {/* ══════════════════════════════════════════
          CHARACTER SELECTION PANEL  (outside transform div so position:fixed works correctly)
          ══════════════════════════════════════════ */}
      {charSelectOpen && (
          /* Full-screen overlay */
          <div
            onClick={() => setCharSelectOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,5,18,0.88)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
          <div className="char-panel" onClick={e => e.stopPropagation()} style={{
            width: "min(880px, 95vw)",
            background: "rgba(4,10,26,0.98)",
            border: "1px solid rgba(0,212,255,0.28)",
            borderRadius: 16,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.92), 0 0 60px rgba(0,212,255,0.07)",
            padding: (isMobile || isSmall) ? "14px 16px" : "clamp(12px, 2.2vh, 22px) 28px",
            display: "flex",
            flexDirection: "column",
            gap: (isMobile || isSmall) ? 12 : "clamp(8px, 1.6vh, 18px)",
            maxHeight: Math.min(windowH * 0.96, 900),
            overflow: "hidden",
          }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 10 : 13, fontWeight: "bold",
                  letterSpacing: "0.14em", color: "#00D4FF", textShadow: "0 0 10px rgba(0,212,255,0.7)",
                }}>SELECT CHARACTER</span>
                <div style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: 9,
                  color: "#7ECEEC", letterSpacing: "0.07em", marginTop: 3,
                }}>
                  {SPECIES.length} SPECIES · CHOOSE YOUR VARIANT
                </div>
              </div>

              <button onClick={() => setCharSelectOpen(false)} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                fontSize: 24, cursor: "pointer", lineHeight: 1, padding: "0 4px",
              }}>×</button>
            </div>

            {/* ── Center Carousel ── */}
            {(() => {
              // CARD_H computed from actual viewport height so carousel always fits
              // panel budget: padding(~40) + header(~40) + dots(~54) + detail(180) + gaps(~60) ≈ 374px fixed
              const panelBudget = Math.min(windowH * 0.96, 900);
              const fixedContent = 374;
              const dynamicH = Math.max(180, Math.min(panelBudget - fixedContent, 420));
              const CARD_W = (isMobile || isSmall) ? 200 : 390;
              const CARD_H = (isMobile || isSmall) ? 230 : dynamicH;
              const GAP    = (isMobile || isSmall) ? 8 : 14;
              const UNIT   = CARD_W + GAP;
              const WIN    = 2; // cards visible on each side
              const N      = SPECIES.length;

              // unbounded index — no modulo, infinite in both directions
              const goNext = () => { setSpeciesIdx(i => i + 1); setHoveredChar(null); };
              const goPrev = () => { setSpeciesIdx(i => i - 1); setHoveredChar(null); };

              // track offset is constant: center item always at WIN position
              const trackX = carouselW / 2 - WIN * UNIT - CARD_W / 2;

              // render only virtual window around current index
              const items = [];
              for (let vi = speciesIdx - WIN; vi <= speciesIdx + WIN; vi++) {
                items.push({ vi, sp: SPECIES[((vi % N) + N) % N] });
              }

              return (
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
                  {/* ◀ Prev */}
                  <button
                    onClick={goPrev}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.16)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; }}
                    style={{
                      flexShrink: 0, width: (isMobile || isSmall) ? 32 : 44, height: CARD_H,
                      background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.25)",
                      borderRadius: 8, color: "#00D4FF", cursor: "pointer",
                      fontSize: (isMobile || isSmall) ? 14 : 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.15s",
                    }}
                  >◀</button>

                  {/* Carousel viewport */}
                  <div
                    ref={carouselContainerRef}
                    style={{ flex: 1, overflow: "hidden", position: "relative", height: CARD_H }}
                    onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
                    onTouchEnd={e => {
                      if (touchStartX.current === null) return;
                      const dx = e.changedTouches[0].clientX - touchStartX.current;
                      if (dx < -40) goNext();
                      if (dx >  40) goPrev();
                      touchStartX.current = null;
                    }}
                  >
                    {/* Static track — items slide via AnimatePresence layout */}
                    <div style={{
                      display: "flex", gap: GAP,
                      position: "absolute", left: 0, top: 0, height: "100%",
                      transform: `translateX(${trackX}px)`,
                    }}>
                      <AnimatePresence initial={false} mode="popLayout">
                        {items.map(({ vi, sp }) => {
                          const dist       = Math.abs(vi - speciesIdx);
                          const isCenter   = dist === 0;
                          const isAdjacent = dist === 1;

                          return (
                            <motion.div
                              key={vi}
                              initial={{ opacity: 0, scale: 0.72 }}
                              animate={{
                                scale:   isCenter ? 1 : 0.84,
                                opacity: isCenter ? 1 : isAdjacent ? 0.44 : 0,
                              }}
                              exit={{ opacity: 0, scale: 0.72 }}
                              transition={{ type: "spring", stiffness: 300, damping: 36 }}
                              onClick={() => { if (!isCenter) setSpeciesIdx(vi); }}
                              onMouseEnter={() => isCenter && setHoveredChar({ speciesId: sp.id, variantIdx: 0 })}
                              onMouseLeave={() => setHoveredChar(null)}
                              style={{
                                width: CARD_W, height: "100%", flexShrink: 0,
                                borderRadius: 12,
                                border: isCenter ? "1.5px solid rgba(0,212,255,0.6)" : "1px solid rgba(0,212,255,0.15)",
                                background: isCenter
                                  ? "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.13), rgba(4,10,26,0.97))"
                                  : "rgba(4,10,26,0.85)",
                                padding: isMobile ? 7 : 10,
                                display: "flex", flexDirection: "column", gap: isMobile ? 5 : 8,
                                boxShadow: isCenter ? "0 0 35px rgba(0,212,255,0.22), inset 0 0 18px rgba(0,212,255,0.06)" : "none",
                                cursor: isCenter ? "default" : "pointer",
                              }}
                            >
                              {/* Species name */}
                              <div style={{
                                fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 8 : 10, fontWeight: "bold",
                                letterSpacing: "0.1em", textAlign: "center",
                                color: isCenter ? "#00D4FF" : "#7ECEEC",
                                textShadow: isCenter ? "0 0 8px rgba(0,212,255,0.5)" : "none",
                              }}>{sp.name.toUpperCase()}</div>

                              {/* Female + Male side by side */}
                              <div style={{ display: "flex", gap: isMobile ? 4 : 8, flex: 1, minHeight: 0 }}>
                                {sp.imgs.map((img, vi2) => {
                                  const gender     = sp.genders?.[vi2] ?? (vi2 === 0 ? "female" : "male");
                                  const isSelected = selectedChar?.speciesId === sp.id && selectedChar?.variantIdx === vi2;
                                  const isHov      = hoveredChar?.speciesId === sp.id && hoveredChar?.variantIdx === vi2;
                                  return (
                                    <div
                                      key={vi2}
                                      onClick={e => { e.stopPropagation(); if (isCenter) handleSelectChar(sp.id, vi2); }}
                                      onMouseEnter={() => isCenter && setHoveredChar({ speciesId: sp.id, variantIdx: vi2 })}
                                      onMouseLeave={() => isCenter && setHoveredChar(null)}
                                      style={{
                                        flex: 1, borderRadius: 8, overflow: "hidden",
                                        border: isSelected
                                          ? "1.5px solid rgba(0,212,255,0.9)"
                                          : isHov && isCenter ? "1.5px solid rgba(0,212,255,0.55)"
                                          : "1px solid rgba(0,212,255,0.14)",
                                        background: isSelected
                                          ? "radial-gradient(ellipse at 50% 10%, rgba(0,212,255,0.22), rgba(4,10,26,0.95))"
                                          : "rgba(0,0,0,0.25)",
                                        cursor: isCenter ? "pointer" : "default",
                                        display: "flex", flexDirection: "column", alignItems: "center",
                                        boxShadow: isSelected ? "0 0 18px rgba(0,212,255,0.45)" : "none",
                                        transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
                                        transform: isHov && isCenter ? "translateY(-2px) scale(1.02)" : "none",
                                        position: "relative",
                                      }}
                                    >
                                      {/* Image */}
                                      <div style={{ width: "100%", flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
                                        <img
                                          src={img} alt={`${sp.name} ${gender}`} loading="lazy"
                                          onError={e => { e.currentTarget.style.opacity = "0.2"; }}
                                          style={{
                                            position: "absolute",
                                            top: gender === "female" ? "8%" : "-2%",
                                            left: 0, width: "100%", height: "160%",
                                            objectFit: "cover", objectPosition: "center top",
                                            transform: isHov && isCenter ? "scale(1.08)" : "scale(1.05)",
                                            transformOrigin: "top center", display: "block",
                                            transition: "transform 0.25s ease, top 0.25s ease",
                                          }}
                                        />
                                        <div style={{
                                          position: "absolute", top: 4, left: 4,
                                          background: gender === "female" ? "rgba(236,72,153,0.8)" : "rgba(59,130,246,0.8)",
                                          borderRadius: 3, padding: "1px 5px",
                                          fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold", color: "#fff",
                                        }}>{gender === "female" ? "♀" : "♂"}</div>
                                        {isSelected && (
                                          <div style={{
                                            position: "absolute", top: 5, right: 5,
                                            width: 17, height: 17, borderRadius: "50%",
                                            background: "#00D4FF",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 10, color: "#020d1a", fontWeight: "bold",
                                            boxShadow: "0 0 8px rgba(0,212,255,0.7)",
                                          }}>✓</div>
                                        )}
                                      </div>
                                      {/* Gender label */}
                                      <div style={{
                                        fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 7 : 8, fontWeight: "bold",
                                        color: gender === "female" ? "rgba(236,72,153,0.8)" : "rgba(96,165,250,0.8)",
                                        letterSpacing: "0.06em", padding: "4px 0 3px", flexShrink: 0,
                                      }}>{gender === "female" ? "♀ FEMALE" : "♂ MALE"}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ▶ Next */}
                  <button
                    onClick={goNext}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.16)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; }}
                    style={{
                      flexShrink: 0, width: (isMobile || isSmall) ? 32 : 44, height: CARD_H,
                      background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.25)",
                      borderRadius: 8, color: "#00D4FF", cursor: "pointer",
                      fontSize: (isMobile || isSmall) ? 14 : 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.15s",
                    }}
                  >▶</button>
                </div>
              );
            })()}

            {/* Nav dots + species name */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                fontFamily: "Orbitron,sans-serif", fontSize: isMobile ? 11 : 14, fontWeight: "bold",
                color: "#00D4FF", letterSpacing: "0.12em", textShadow: "0 0 12px rgba(0,212,255,0.6)",
              }}>{SPECIES[modIdx].name.toUpperCase()}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {SPECIES.map((_, i) => {
                  const isActive = i === modIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        // navigate shortest path from current unbounded index
                        const delta = i - modIdx;
                        const N = SPECIES.length;
                        const short = ((delta + Math.round(N / 2)) % N + N) % N - Math.round(N / 2);
                        setSpeciesIdx(speciesIdx + short); setHoveredChar(null);
                      }}
                      style={{
                        width: isActive ? (isMobile ? 18 : 24) : (isMobile ? 6 : 8),
                        height: isMobile ? 4 : 5, borderRadius: 3,
                        background: isActive ? "#00D4FF" : "rgba(0,212,255,0.25)",
                        border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── Detail strip ── */}
            {detailSpecies ? (
              <div className="detail-strip" style={{
                borderTop: "1px solid rgba(0,212,255,0.14)",
                paddingTop: 10,
                display: "flex",
                gap: 12,
                overflowY: "auto",
                flexShrink: 0,
                height: 180,
                paddingRight: 6,
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 58, height: 80, flexShrink: 0,
                  borderRadius: 5, overflow: "hidden",
                  border: "1px solid rgba(0,212,255,0.28)",
                  position: "sticky", top: 0, alignSelf: "flex-start",
                }}>
                  <img
                    src={detailSpecies.imgs[detailVariant]}
                    alt={detailSpecies.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                  />
                </div>

                {/* Info — left attributes + right notes */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 10 }}>

                  {/* Left: name + type + ordered attributes + power notice */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{
                      fontFamily: "Orbitron,sans-serif", fontSize: 11.5, fontWeight: "bold",
                      color: "#00D4FF", textShadow: "0 0 8px rgba(0,212,255,0.6)",
                      letterSpacing: "0.1em", lineHeight: 1.2,
                    }}>{detailSpecies.name.toUpperCase()}</div>

                    {detailSpecies.type ? (
                      <>
                        <div style={{
                          fontFamily: "Orbitron,sans-serif", fontSize: 9,
                          color: "#7ECEEC", letterSpacing: "0.06em",
                        }}>{detailSpecies.type}</div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginTop: 3 }}>
                          {[
                            ["Height",    detailSpecies.height],
                            ["Eyes",      detailSpecies.eyes],
                            ["Clothing",  detailSpecies.clothing],
                            ["Environ.",  detailSpecies.environment],
                            ["Symbolism", detailSpecies.symbolism],
                            ...(detailSpecies.wings ? [["Wings", detailSpecies.wings]] : []),
                            ...(detailSpecies.arms  ? [["Arms",  detailSpecies.arms]]  : []),
                          ].map(([k, v]) => (
                            <div key={k} style={{ minWidth: 0 }}>
                              <span style={{
                                fontFamily: "Orbitron,sans-serif", fontSize: 8,
                                color: "#9CA3AF", letterSpacing: "0.06em",
                              }}>{k}: </span>
                              <span style={{
                                fontFamily: "Orbitron,sans-serif", fontSize: 8.5,
                                color: "#FFFFFF",
                              }}>{v}</span>
                            </div>
                          ))}
                        </div>

                        {/* Powers notice */}
                        <div style={{
                          marginTop: 4,
                          fontFamily: "Orbitron,sans-serif", fontSize: 8,
                          color: "#F87171", letterSpacing: "0.06em",
                        }}>
                          ⚠ Powers: Not available at this time due to game balancing
                        </div>
                      </>
                    ) : (
                      <div style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: 9,
                        color: "#7ECEEC", marginTop: 6,
                      }}>Species details coming soon...</div>
                    )}
                  </div>

                  {/* Right: Notes button */}
                  {detailSpecies.notes && (
                    <div style={{
                      width: 90, flexShrink: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      borderLeft: "1px solid rgba(0,212,255,0.12)",
                      paddingLeft: 10,
                    }}>
                      <span style={{
                        fontFamily: "Orbitron,sans-serif", fontSize: 8,
                        color: "#9CA3AF", letterSpacing: "0.06em", marginBottom: 8,
                      }}>NOTES</span>
                      <button
                        onClick={() => setNotesOpen(true)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          background: "rgba(0,212,255,0.08)",
                          border: "1px solid rgba(0,212,255,0.25)",
                          borderRadius: 6, padding: "8px 10px",
                          cursor: "pointer", width: "100%",
                          fontFamily: "Orbitron,sans-serif", fontSize: 8,
                          color: "#7ECEEC", letterSpacing: "0.08em",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.18)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(0,212,255,0.08)"}
                      >
                        <span style={{ fontSize: 18 }}>📋</span>
                        VIEW NOTES
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                borderTop: "1px solid rgba(0,212,255,0.1)",
                paddingTop: 8, textAlign: "center",
                fontFamily: "Orbitron,sans-serif", fontSize: 9,
                color: "#7ECEEC", letterSpacing: "0.08em",
              }}>
                HOVER A CHARACTER TO SEE DETAILS
              </div>
            )}

          </div>
          </div>
        )}

      {/* ── Notes Modal ─────────────────────────────────────────── */}
      {notesOpen && detailSpecies?.notes && (
        <div
          onClick={() => setNotesOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%", maxWidth: 520,
              maxHeight: "80vh",
              background: "rgba(4,8,28,0.98)",
              border: "1px solid rgba(0,212,255,0.25)",
              borderRadius: 10,
              boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.08)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid rgba(0,212,255,0.12)",
              flexShrink: 0,
            }}>
              <div>
                <div style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: 12, fontWeight: "bold",
                  color: "#00D4FF", letterSpacing: "0.12em",
                }}>{detailSpecies.name.toUpperCase()}</div>
                <div style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: 8.5,
                  color: "#7ECEEC", letterSpacing: "0.06em", marginTop: 2,
                }}>SPECIES NOTES</div>
              </div>
              <button
                onClick={() => setNotesOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 4, width: 28, height: 28,
                  cursor: "pointer", color: "rgba(255,255,255,0.6)",
                  fontFamily: "Orbitron,sans-serif", fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "16px 18px", flex: 1 }}>
              {detailSpecies.notes.split("\n\n").map((para, i) => (
                <p key={i} style={{
                  fontFamily: "Orbitron,sans-serif", fontSize: 9,
                  color: "rgba(255,255,255,0.7)", lineHeight: 1.8,
                  margin: i > 0 ? "10px 0 0" : 0,
                }}>{para}</p>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 18px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}>
              <div style={{
                fontFamily: "Orbitron,sans-serif", fontSize: 8,
                color: "#F87171", letterSpacing: "0.06em",
              }}>⚠ Powers: Not available at this time due to game balancing</div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
