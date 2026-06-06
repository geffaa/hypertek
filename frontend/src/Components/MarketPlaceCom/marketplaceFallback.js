// Shared fallback items shown on both /market-place and /collections/:category
// when the backend returns no listed items. No image field — both pages use overview1.webp as fallback.
export const FALLBACK_ITEMS = {
  skins: [
    { _id: "fs-1", name: "Desert Storm Skin",    priceETH: 45,  description: "Camouflage desert warfare skin for elite soldiers.",        parentCategory: "skins", isDummy: true },
    { _id: "fs-2", name: "Arctic Ghost Skin",    priceETH: 60,  description: "Icy blue stealth skin for cold-climate operations.",         parentCategory: "skins", isDummy: true },
    { _id: "fs-3", name: "Shadow Ops Skin",      priceETH: 80,  description: "Jet black covert operations skin with night-vision accents.", parentCategory: "skins", isDummy: true },
    { _id: "fs-4", name: "Urban Assault Skin",   priceETH: 55,  description: "City warfare skin with tactical grey patterning.",           parentCategory: "skins", isDummy: true },
    { _id: "fs-5", name: "Jungle Predator Skin", priceETH: 70,  description: "Dense jungle camouflage skin for rainforest missions.",      parentCategory: "skins", isDummy: true },
  ],
  "military badges": [
    { _id: "fb-1", name: "Commander's Cross",  priceETH: 300, description: "Rare commander's cross awarded for battlefield leadership.", parentCategory: "military badges", isDummy: true },
    { _id: "fb-2", name: "Purple Valor Medal", priceETH: 250, description: "Medal of valor for exceptional bravery under fire.",         parentCategory: "military badges", isDummy: true },
    { _id: "fb-3", name: "HyperTek Coin 2025", priceETH: 180, description: "Limited edition collectible coin for season 2025.",          parentCategory: "military badges", isDummy: true },
    { _id: "fb-4", name: "Iron Shield Badge",  priceETH: 140, description: "Badge denoting mastery of defensive tactics.",               parentCategory: "military badges", isDummy: true },
    { _id: "fb-5", name: "Star of Honour",     priceETH: 500, description: "The highest honour awarded in the HyperTek universe.",       parentCategory: "military badges", isDummy: true },
  ],
  specialists: [
    { _id: "fsp-1", name: "Ghost Recon Operator", priceETH: 400, description: "Elite recon specialist with ghost cloak ability.",               parentCategory: "specialists", isDummy: true },
    { _id: "fsp-2", name: "Cyber Medic",          priceETH: 280, description: "Field medic with advanced cybernetic healing tools.",            parentCategory: "specialists", isDummy: true },
    { _id: "fsp-3", name: "Bomb Disposal Expert", priceETH: 320, description: "Specialist trained to neutralise any explosive device.",         parentCategory: "specialists", isDummy: true },
    { _id: "fsp-4", name: "AI Drone Handler",     priceETH: 360, description: "Controls a squad of tactical AI combat drones.",                 parentCategory: "specialists", isDummy: true },
    { _id: "fsp-5", name: "Sniper Ace",           priceETH: 450, description: "Long-range marksman with zero-wind precision targeting.",         parentCategory: "specialists", isDummy: true },
  ],
  weapons: [
    { _id: "fw-1", name: "Hyper Assault Rifle", priceETH: 120, description: "High-powered assault rifle with hyper-tech optics.",    parentCategory: "weapons", isDummy: true },
    { _id: "fw-2", name: "Plasma Pistol Mk2",   priceETH: 85,  description: "Compact plasma pistol with dual-fire mode.",           parentCategory: "weapons", isDummy: true },
    { _id: "fw-3", name: "Rail Sniper X90",     priceETH: 200, description: "Long-range rail gun sniper with electro-targeting.",   parentCategory: "weapons", isDummy: true },
    { _id: "fw-4", name: "Frag Launcher Pro",   priceETH: 150, description: "Grenade launcher with proximity detonation system.",  parentCategory: "weapons", isDummy: true },
    { _id: "fw-5", name: "Ion Blade Elite",     priceETH: 95,  description: "Electrified combat blade for close-quarters warfare.", parentCategory: "weapons", isDummy: true },
  ],
  "body armour": [
    { _id: "fba-1", name: "Nano-Mesh Vest",         priceETH: 110, description: "Lightweight nano-fibre vest with ballistic resistance.", parentCategory: "body armour", isDummy: true },
    { _id: "fba-2", name: "Exo-Skeleton Mk3",       priceETH: 350, description: "Full exoskeleton suit with powered joints.",             parentCategory: "body armour", isDummy: true },
    { _id: "fba-3", name: "Carbon Plate Armour",    priceETH: 220, description: "Hard carbon plates for heavy assault operations.",       parentCategory: "body armour", isDummy: true },
    { _id: "fba-4", name: "Stealth Composite Vest", priceETH: 175, description: "Radar-absorbing composite armour vest.",                 parentCategory: "body armour", isDummy: true },
    { _id: "fba-5", name: "Titan Full Plate",       priceETH: 480, description: "Maximum protection titanium alloy full body armour.",    parentCategory: "body armour", isDummy: true },
  ],
  spaceships: [
    { _id: "fss-1", name: "Viper Fighter Mk1",   priceETH: 600,  description: "Fast single-pilot fighter with twin plasma cannons.",  parentCategory: "spaceships", isDummy: true },
    { _id: "fss-2", name: "Nexus Cruiser",        priceETH: 1200, description: "Mid-range cruiser with advanced shield systems.",     parentCategory: "spaceships", isDummy: true },
    { _id: "fss-3", name: "Hyper Drive Engine",  priceETH: 250,  description: "Replacement engine part providing 40% speed boost.",  parentCategory: "spaceships", isDummy: true },
    { _id: "fss-4", name: "Phantom Stealth Ship", priceETH: 900,  description: "Radar-invisible stealth spacecraft for covert ops.",  parentCategory: "spaceships", isDummy: true },
    { _id: "fss-5", name: "Ion Thruster Pack",    priceETH: 180,  description: "Upgradeable ion thruster set for any ship class.",    parentCategory: "spaceships", isDummy: true },
  ],
  "racing vehicles": [
    { _id: "frv-1", name: "HyperBike GT",          priceETH: 550, description: "Ultra-fast racing bike built for gravity tracks.",       parentCategory: "racing vehicles", isDummy: true },
    { _id: "frv-2", name: "Turbo Hovercar X",      priceETH: 780, description: "Anti-gravity hovercar with turbo boost module.",        parentCategory: "racing vehicles", isDummy: true },
    { _id: "frv-3", name: "Mag-Wheel Upgrade Kit", priceETH: 120, description: "Magnetic wheel set for improved cornering speed.",      parentCategory: "racing vehicles", isDummy: true },
    { _id: "frv-4", name: "Neon Dragster 5000",    priceETH: 650, description: "Straight-line speed demon with neon drive system.",    parentCategory: "racing vehicles", isDummy: true },
    { _id: "frv-5", name: "Combat Trike",          priceETH: 430, description: "Three-wheeled combat racer with front-mounted cannon.", parentCategory: "racing vehicles", isDummy: true },
  ],
  artwork: [
    { _id: "fa-1", name: "Genesis Warrior Portrait", priceETH: 800,  description: "Original digital oil portrait of the first HyperTek warrior.", parentCategory: "artwork", isDummy: true },
    { _id: "fa-2", name: "Neon City Skyline",        priceETH: 600,  description: "Vibrant neon cityscape from the HyperTek universe.",           parentCategory: "artwork", isDummy: true },
    { _id: "fa-3", name: "Cosmic Battle Scene",      priceETH: 1500, description: "Epic deep-space battle, hand-painted in 8K resolution.",        parentCategory: "artwork", isDummy: true },
    { _id: "fa-4", name: "Hyper Soldier Sketch",     priceETH: 400,  description: "Concept sketch of the iconic HyperTek soldier.",               parentCategory: "artwork", isDummy: true },
    { _id: "fa-5", name: "Abstract Data Stream",     priceETH: 350,  description: "Generative art piece representing blockchain data flow.",        parentCategory: "artwork", isDummy: true },
  ],
  "land and bases": [
    { _id: "fl-1", name: "Desert Outpost Alpha", priceETH: 2000, description: "Strategic desert base with resource extraction facilities.", parentCategory: "land and bases", isDummy: true },
    { _id: "fl-2", name: "Arctic Station Omega", priceETH: 3500, description: "Fortified arctic base in the polar zone.",                  parentCategory: "land and bases", isDummy: true },
    { _id: "fl-3", name: "City Block 47",        priceETH: 1800, description: "Prime urban land block in the central HyperTek city.",     parentCategory: "land and bases", isDummy: true },
    { _id: "fl-4", name: "Mountain Fortress",    priceETH: 4200, description: "Defensible mountain stronghold with 360-degree visibility.",parentCategory: "land and bases", isDummy: true },
    { _id: "fl-5", name: "Ocean Platform Delta", priceETH: 2800, description: "Off-shore naval platform for maritime operations.",         parentCategory: "land and bases", isDummy: true },
  ],
  "general": [
    { _id: "fg-1", name: "HyperTek Starter Pack", priceETH: 50,  description: "A bundle of miscellaneous items to kick-start your journey.",        parentCategory: "general", isDummy: true },
    { _id: "fg-2", name: "Collector's Badge",     priceETH: 30,  description: "Rare collectible badge for dedicated community members.",             parentCategory: "general", isDummy: true },
    { _id: "fg-3", name: "Mystery Crate",         priceETH: 75,  description: "Contains a random rare item from the HyperTek universe.",            parentCategory: "general", isDummy: true },
    { _id: "fg-4", name: "Season Pass Token",     priceETH: 120, description: "Grants access to exclusive season events and rewards.",               parentCategory: "general", isDummy: true },
    { _id: "fg-5", name: "Community Tribute",     priceETH: 25,  description: "A commemorative token for early HyperTek community supporters.",     parentCategory: "general", isDummy: true },
  ],
};

// All fallback items flattened
export const ALL_FALLBACK_ITEMS = Object.values(FALLBACK_ITEMS).flat();
