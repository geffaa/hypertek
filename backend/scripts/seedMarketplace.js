/**
 * Seed script – local marketplace data
 *
 * Seeds:
 *   1. Parent collections for all 9 HyperTek categories
 *   2. 4-5 sub-collection items per category
 *   3. NFT 101 education cards
 *
 * Run:
 *   node scripts/seedMarketplace.js
 *
 * Safe to re-run: skips parent collections that already exist; NFT 101 articles are always deleted and re-inserted fresh.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "Config", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local"), override: true });

import NFTSystem from "../Models/NFTSystem.js";
import Nft101    from "../Models/Nft101.js";

// ─── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Skins",
    chain: "Ethereum",
    symbol: "SKIN",
    items: [
      { name: "Desert Storm Skin",     symbol: "DSS",  priceETH: 45,  description: "Camouflage desert warfare skin for elite soldiers." },
      { name: "Arctic Ghost Skin",     symbol: "AGS",  priceETH: 60,  description: "Icy blue stealth skin for cold-climate operations." },
      { name: "Shadow Ops Skin",       symbol: "SOS",  priceETH: 80,  description: "Jet black covert operations skin with night-vision accents." },
      { name: "Urban Assault Skin",    symbol: "UAS",  priceETH: 55,  description: "City warfare skin with tactical grey patterning." },
      { name: "Jungle Predator Skin",  symbol: "JPS",  priceETH: 70,  description: "Dense jungle camouflage skin for rainforest missions." },
    ],
  },
  {
    name: "Weapons",
    chain: "Ethereum",
    symbol: "WPNS",
    items: [
      { name: "Hyper Assault Rifle",   symbol: "HAR",  priceETH: 120, description: "High-powered assault rifle with hyper-tech optics." },
      { name: "Plasma Pistol Mk2",     symbol: "PPM2", priceETH: 85,  description: "Compact plasma pistol with dual-fire mode." },
      { name: "Rail Sniper X90",       symbol: "RSX",  priceETH: 200, description: "Long-range rail gun sniper with electro-targeting." },
      { name: "Frag Launcher Pro",     symbol: "FLP",  priceETH: 150, description: "Grenade launcher with proximity detonation system." },
      { name: "Ion Blade Elite",       symbol: "IBE",  priceETH: 95,  description: "Electrified combat blade for close-quarters warfare." },
    ],
  },
  {
    name: "Military Badges and Collectables",
    chain: "Ethereum",
    symbol: "MBAC",
    items: [
      { name: "Commander's Cross",     symbol: "CC",   priceETH: 300, description: "Rare commander's cross awarded for battlefield leadership." },
      { name: "Purple Valor Medal",    symbol: "PVM",  priceETH: 250, description: "Medal of valor for exceptional bravery under fire." },
      { name: "HyperTek Coin 2025",    symbol: "HTC",  priceETH: 180, description: "Limited edition collectible coin for season 2025." },
      { name: "Iron Shield Badge",     symbol: "ISB",  priceETH: 140, description: "Badge denoting mastery of defensive tactics." },
      { name: "Star of Honour",        symbol: "SOH",  priceETH: 500, description: "The highest honour awarded in the HyperTek universe." },
    ],
  },
  {
    name: "Body Armour",
    chain: "Ethereum",
    symbol: "BARM",
    items: [
      { name: "Nano-Mesh Vest",        symbol: "NMV",  priceETH: 110, description: "Lightweight nano-fibre vest with ballistic resistance." },
      { name: "Exo-Skeleton Mk3",      symbol: "ESK3", priceETH: 350, description: "Full exoskeleton suit with powered joints." },
      { name: "Carbon Plate Armour",   symbol: "CPA",  priceETH: 220, description: "Hard carbon plates for heavy assault operations." },
      { name: "Stealth Composite Vest",symbol: "SCV",  priceETH: 175, description: "Radar-absorbing composite armour vest." },
      { name: "Titan Full Plate",      symbol: "TFP",  priceETH: 480, description: "Maximum protection titanium alloy full body armour." },
    ],
  },
  {
    name: "Specialists",
    chain: "Ethereum",
    symbol: "SPEC",
    items: [
      { name: "Ghost Recon Operator",  symbol: "GRO",  priceETH: 400, description: "Elite recon specialist with ghost cloak ability." },
      { name: "Cyber Medic",          symbol: "CME",  priceETH: 280, description: "Field medic with advanced cybernetic healing tools." },
      { name: "Bomb Disposal Expert",  symbol: "BDE",  priceETH: 320, description: "Specialist trained to neutralise any explosive device." },
      { name: "AI Drone Handler",      symbol: "ADH",  priceETH: 360, description: "Controls a squad of tactical AI combat drones." },
      { name: "Sniper Ace",           symbol: "SAC",  priceETH: 450, description: "Long-range marksman with zero-wind precision targeting." },
    ],
  },
  {
    name: "Spaceships",
    chain: "Ethereum",
    symbol: "SSHP",
    items: [
      { name: "Viper Fighter Mk1",     symbol: "VFM1", priceETH: 600, description: "Fast single-pilot fighter with twin plasma cannons." },
      { name: "Nexus Cruiser",         symbol: "NCR",  priceETH: 1200,description: "Mid-range cruiser with advanced shield systems." },
      { name: "Hyper Drive Engine",    symbol: "HDE",  priceETH: 250, description: "Replacement engine part providing 40% speed boost." },
      { name: "Phantom Stealth Ship",  symbol: "PSS",  priceETH: 900, description: "Radar-invisible stealth spacecraft for covert ops." },
      { name: "Ion Thruster Pack",     symbol: "ITP",  priceETH: 180, description: "Upgradeable ion thruster set for any ship class." },
    ],
  },
  {
    name: "Racing Vehicles",
    chain: "Ethereum",
    symbol: "RVEH",
    items: [
      { name: "HyperBike GT",         symbol: "HBGT", priceETH: 550, description: "Ultra-fast racing bike built for gravity tracks." },
      { name: "Turbo Hovercar X",      symbol: "THX",  priceETH: 780, description: "Anti-gravity hovercar with turbo boost module." },
      { name: "Mag-Wheel Upgrade Kit", symbol: "MWU",  priceETH: 120, description: "Magnetic wheel set for improved cornering speed." },
      { name: "Neon Dragster 5000",    symbol: "ND5K", priceETH: 650, description: "Straight-line speed demon with neon drive system." },
      { name: "Combat Trike",          symbol: "CTR",  priceETH: 430, description: "Three-wheeled combat racer with front-mounted cannon." },
    ],
  },
  {
    name: "Artwork",
    chain: "Ethereum",
    symbol: "ART",
    items: [
      { name: "Genesis Warrior Portrait",    symbol: "GWP",  priceETH: 800,  description: "Original digital oil portrait of the first HyperTek warrior." },
      { name: "Neon City Skyline",           symbol: "NCS",  priceETH: 600,  description: "Vibrant neon cityscape from the HyperTek universe." },
      { name: "Cosmic Battle Scene",         symbol: "CBS",  priceETH: 1500, description: "Epic deep-space battle, hand-painted in 8K resolution." },
      { name: "Hyper Soldier Sketch",        symbol: "HSS",  priceETH: 400,  description: "Concept sketch of the iconic HyperTek soldier." },
      { name: "Abstract Data Stream",        symbol: "ADS",  priceETH: 350,  description: "Generative art piece representing blockchain data flow." },
    ],
  },
  {
    name: "Land and Bases",
    chain: "Ethereum",
    symbol: "LAND",
    items: [
      { name: "Desert Outpost Alpha",        symbol: "DOA",  priceETH: 2000, description: "Strategic desert base with resource extraction facilities." },
      { name: "Arctic Station Omega",        symbol: "ASO",  priceETH: 3500, description: "Fortified arctic base in the polar zone." },
      { name: "City Block 47",              symbol: "CB47", priceETH: 1800, description: "Prime urban land block in the central HyperTek city." },
      { name: "Mountain Fortress",          symbol: "MFT",  priceETH: 4200, description: "Defensible mountain stronghold with 360-degree visibility." },
      { name: "Ocean Platform Delta",       symbol: "OPD",  priceETH: 2800, description: "Off-shore naval platform for maritime operations." },
    ],
  },
];

// ─── NFT 101 education data ───────────────────────────────────────────────────
const NFT_101_DATA = [
  {
    title: "What is an NFT?",
    description: "An NFT (Non-Fungible Token) is a unique digital asset verified on the blockchain. Each one is one-of-a-kind and cannot be replicated.",
    image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 5,
    body: [
      "NFT stands for Non-Fungible Token — a unique digital asset stored on a blockchain. Unlike regular digital files that can be copied infinitely, each NFT has a unique identifier that proves its authenticity and ownership on a public ledger. No two NFTs are identical, even if they represent visually similar images.",
      "Think of it like a certificate of ownership for a digital item — whether that's a piece of art, a music track, a video game skin, or a character. The NFT itself lives on the blockchain, meaning no single company controls it and ownership is transparent and verifiable by anyone in the world at any time.",
      "NFTs have revolutionized how creators monetize their work. Artists can now sell directly to collectors worldwide without galleries or platforms taking large cuts. Every time an NFT is resold, the original creator can receive royalties automatically through smart contracts — a permanent, passive income stream embedded in the token itself.",
      "The ownership history of every NFT is permanently public. You can trace exactly who has owned a given token since it was minted. This provenance record adds significant value for collectors, similar to how a physical artwork gains value from a documented ownership chain through notable collectors or institutions.",
      "Beyond art, NFTs have practical utility as access passes, memberships, game items, domain names, and financial instruments. In HyperTek, every in-game asset — from a soldier character to a spaceship — is an NFT. This means your in-game progress translates into real, tradeable digital value that exists independently of the game itself.",
      "The technology underpinning NFTs continues to evolve. Standards like ERC-721 and ERC-1155 define how these tokens behave on Ethereum-compatible blockchains. Layer-2 networks like Base have dramatically reduced the cost of minting and transferring NFTs, making the ecosystem accessible to everyday users rather than only high-budget collectors.",
    ],
    sections: [
      { heading: "Understanding Non-Fungibility", paragraphs: ["NFT stands for Non-Fungible Token — a unique digital asset stored on a blockchain. Unlike regular digital files that can be copied infinitely, each NFT has a unique identifier that proves its authenticity and ownership on a public ledger.", "The word 'fungible' means interchangeable — a dollar bill is fungible because any dollar is worth the same. Non-fungible means unique and irreplaceable. NFTs bring this concept to the digital realm.", "Each NFT contains metadata — title, description, creator address, creation date — permanently recorded on the blockchain and unalterable after minting."] },
      { heading: "How NFT Ownership Works", paragraphs: ["Think of it like a certificate of ownership for a digital item. The NFT lives on the blockchain, meaning no single company controls it and ownership is transparent and verifiable by anyone.", "The ownership history of every NFT is permanently public. You can trace exactly who has owned a given token since it was minted, adding significant provenance value.", "When you purchase an NFT, the transaction is written to the blockchain. No centralized company can revoke this ownership — it's secured by cryptographic consensus."] },
      { heading: "Creator Economy & Royalties", paragraphs: ["NFTs have revolutionized how creators monetize their work. Artists sell directly to collectors worldwide without galleries taking large cuts.", "Every resale triggers automatic royalty payments through smart contracts — typically 5-10% — creating a permanent passive income stream for creators."] },
      { heading: "Real-World Utility Beyond Art", paragraphs: ["Beyond art, NFTs serve as access passes, memberships, game items, domain names, and financial instruments. In HyperTek, every in-game asset is an NFT.", "Gaming represents the largest growth sector for NFTs — players' investments in characters and items translate to real-world value.", "Event tickets, music albums, real estate deeds, and academic credentials are all being tokenized as NFTs across industries."] },
      { heading: "Technical Standards", paragraphs: ["Standards like ERC-721 and ERC-1155 define how NFTs behave on Ethereum-compatible blockchains. ERC-721 creates unique tokens; ERC-1155 supports both unique and semi-fungible tokens.", "Layer-2 networks like Base have reduced minting costs from $50+ to fractions of a cent, making NFTs accessible to everyday users."] },
      { heading: "Common Misconceptions", paragraphs: ["Owning an NFT doesn't mean owning the copyright — you own the token, not the IP, unless explicitly transferred.", "Modern proof-of-stake blockchains consume minimal energy. The environmental concerns of 2021 no longer apply.", "Not all NFTs are speculative. Many serve functional purposes — game items, memberships — where value comes from utility, not hype."] },
    ],
    icon: "🖼️",
    gradientFrom: "#1a4fd6",
    gradientTo: "#0e2d8a",
    order: 1,
  },
  {
    title: "How to Buy an NFT",
    description: "Connect your crypto wallet, browse the marketplace, select an item and click Buy Now. Confirm the transaction in your wallet.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 5,
    body: [
      "Buying an NFT is simpler than most people think. You need three things: a crypto wallet, some cryptocurrency (usually ETH or USDC), and access to a marketplace like HyperTek. The entire process from account creation to completing your first purchase can take less than ten minutes.",
      "Once your wallet is connected and funded, browse the marketplace, click on an item you want, and hit 'Buy Now.' Your wallet will ask you to confirm the transaction and display the total cost including any gas fees. Once confirmed, the NFT is transferred to your wallet address — permanently recorded on the blockchain.",
      "On HyperTek, you don't even need crypto initially. You can sign up with your email and pay with a credit card. HyperTek automatically creates a custodial wallet for you, lowering the barrier to entry dramatically for newcomers who have never interacted with crypto before.",
      "Before completing any purchase, always review the seller's history, the collection's contract address, and the item's transaction history. A reputable NFT will have a clear provenance trail and the collection will match the official contract address listed on the project's verified channels.",
      "Auction-based purchases work differently from direct sales. You place a bid, and if no higher bid is submitted before the timer expires, you win the item. The smart contract automatically transfers the NFT to you and the payment to the seller — no manual handover, no escrow, no counterparty risk.",
      "After purchase, your NFT appears immediately in your wallet and your HyperTek profile. From there you can display it, list it for resale, use it in game, or hold it as a long-term investment. The choice is entirely yours — the platform has no ability to revoke or modify your ownership.",
    ],
    sections: [
      { heading: "What You Need to Get Started", paragraphs: ["Buying an NFT requires three things: a crypto wallet, some cryptocurrency (usually ETH or USDC), and access to a marketplace like HyperTek.", "On HyperTek, you can sign up with email and pay with credit card. A custodial wallet is created automatically for beginners."] },
      { heading: "Step-by-Step Purchase Process", paragraphs: ["Browse the marketplace, click an item, and hit 'Buy Now.' Your wallet confirms the transaction and displays total cost including gas fees.", "Once confirmed, the NFT transfers to your wallet instantly on Layer-2 networks like Base. It appears in your HyperTek profile immediately.", "After purchase, you can display it, list it for resale, use it in game, or hold it as an investment."] },
      { heading: "Auction-Based Purchases", paragraphs: ["You place a bid, and if no higher bid is submitted before the timer expires, you win. The smart contract handles transfer automatically.", "Some auctions extend by 2 minutes if a bid is placed in final moments, preventing last-second sniping."] },
      { heading: "Evaluating Before You Buy", paragraphs: ["Always review the seller's history, collection contract address, and item transaction history before purchasing.", "Check floor price and recent sales history to ensure you're paying fair market price."] },
      { heading: "Payment Methods on HyperTek", paragraphs: ["HyperTek supports crypto payment via wallet, credit card purchases, and Hyper Bucks (platform currency).", "For first-time users, credit card is simplest — the platform handles all crypto conversion behind the scenes."] },
    ],
    icon: "🛒",
    gradientFrom: "#16a34a",
    gradientTo: "#064e1e",
    order: 2,
  },
  {
    title: "What is Minting?",
    description: "Minting is the process of creating a new NFT on the blockchain — publishing a unique token that represents ownership of a digital asset.",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 5,
    body: [
      "Minting an NFT means publishing a digital asset onto the blockchain for the first time. The process converts your file — image, video, audio, or 3D model — into a token with a unique ID, creating an immutable record of its existence and your ownership at a specific point in time.",
      "When you mint, a transaction is written to the blockchain. This transaction contains metadata about your asset: the file URI, title, description, and any royalty settings you choose. From this moment on, the NFT exists independently of any platform. Even if HyperTek ceased to exist, your token would remain on-chain.",
      "On HyperTek, minting is handled through the platform's guided tools, which abstract away the technical complexity. You upload your asset, set a price, configure royalty percentages, and the platform handles the smart contract interaction entirely — no command line, no Solidity knowledge, and no technical background required.",
      "Minting costs a small gas fee paid to the blockchain network for processing your transaction. On Base (HyperTek's underlying chain), these fees are fractions of a cent — a dramatic improvement over early NFT minting on Ethereum mainnet, where fees could run into hundreds of dollars during peak congestion.",
      "Lazy minting is a variant where the NFT is not actually written to the blockchain until the first buyer purchases it. This means creators pay no upfront minting costs — the buyer's transaction covers the minting fee. HyperTek supports lazy minting for eligible asset types, making it completely free to create and list your first NFT.",
      "Once minted, the metadata attached to your NFT becomes permanent. Choose your title, description, and category carefully — these fields cannot be edited after minting. The immutability of this data is a core part of what gives NFTs their authenticity and long-term collector value.",
    ],
    sections: [
      { heading: "The Minting Process Explained", paragraphs: ["Minting an NFT means publishing a digital asset onto the blockchain for the first time, converting your file into a token with a unique ID.", "A transaction is written to the blockchain containing metadata about your asset. From this moment, the NFT exists independently of any platform."] },
      { heading: "Minting on HyperTek", paragraphs: ["HyperTek's guided tools abstract away technical complexity. Upload your asset, set price and royalties, and the platform handles the smart contract interaction.", "No command line, no Solidity knowledge required."] },
      { heading: "Costs and Gas Fees", paragraphs: ["On Base, minting fees are fractions of a cent — a dramatic improvement over early Ethereum where fees could reach hundreds of dollars.", "Lazy minting means the NFT isn't written to the blockchain until the first purchase, so creators pay zero upfront costs."] },
      { heading: "Choosing Your Metadata", paragraphs: ["Once minted, metadata becomes permanent. Choose title, description, and category carefully — they cannot be edited after minting.", "Research trending categories and use descriptive, searchable titles for maximum discoverability."] },
      { heading: "File Formats & Best Practices", paragraphs: ["Supported formats include PNG, JPG, GIF, SVG, MP4, WEBM, MP3, WAV, GLB, and GLTF. High-resolution assets command higher prices.", "Files are typically hosted on decentralized storage like IPFS for permanence. Always watermark preview images.", "Consider creating collections rather than one-offs — cohesive themes attract serious collectors."] },
    ],
    icon: "⚡",
    gradientFrom: "#7c3aed",
    gradientTo: "#3b0f8a",
    order: 3,
  },
  {
    title: "How to Stay Protected in Web3",
    description: "Never share your seed phrase. Use hardware wallets for high-value assets and always verify contract addresses before signing transactions.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    category: "Security",
    readTime: 6,
    body: [
      "Security in Web3 starts with your seed phrase — the 12 or 24 words that unlock your wallet. This phrase should never be shared with anyone, ever. Not with support teams, not with friends, not with platforms. Anyone who has it can drain your wallet instantly and irreversibly. There is no 'forgot password' in crypto.",
      "Always verify the contract address of any NFT before purchasing. Scammers frequently create look-alike collections with near-identical names and stolen artwork. Cross-reference the contract address against the official project website or trusted aggregators like OpenSea's verified badge before completing any transaction.",
      "Consider using a hardware wallet like Ledger or Trezor for high-value assets. Hardware wallets keep your private keys offline, making them immune to online attacks, phishing sites, and malware. For everyday trading, use a 'hot' wallet funded only with what you need for that session — treat it like a cash wallet, not a savings account.",
      "Be deeply skeptical of unsolicited NFTs appearing in your wallet. Attackers airdrop malicious tokens designed to drain your funds the moment you try to interact with or sell them. Never click 'approve' or 'sign' on any transaction initiated by an unknown NFT — simply hide or ignore these items in your wallet interface.",
      "Phishing is the most common attack vector in Web3. Fake websites impersonating popular marketplaces are distributed through social media ads, Discord links, and email. Before connecting your wallet, triple-check the URL — a single character difference (e.g., 'hypertek.io' vs 'hypert3k.io') may indicate a malicious clone site.",
      "Enable transaction simulation in your wallet software when available. Modern wallets like MetaMask and Rainbow can simulate what a transaction will do before you sign it — showing you exactly which tokens will leave and enter your wallet. If the simulation shows unexpected transfers, reject the transaction immediately regardless of what a website tells you.",
    ],
    sections: [
      { heading: "Protecting Your Seed Phrase", paragraphs: ["Your seed phrase — 12 or 24 words — should never be shared with anyone, ever. Anyone who has it can drain your wallet instantly and irreversibly.", "Write it on paper and store securely. Some users engrave seed phrases on metal plates for fire/water resistance."] },
      { heading: "Verifying Contract Addresses", paragraphs: ["Scammers create look-alike collections with stolen artwork. Cross-reference contract addresses against official project websites.", "One character difference in a contract address means a completely different (potentially malicious) collection."] },
      { heading: "Hardware Wallets", paragraphs: ["Ledger and Trezor keep private keys offline, immune to online attacks. Use a hot wallet only with funds needed for that session.", "Treat your hot wallet like a cash wallet, not a savings account."] },
      { heading: "Avoiding Phishing & Scams", paragraphs: ["Fake websites are distributed through social media, Discord, and email. Triple-check URLs before connecting your wallet.", "Be skeptical of unsolicited NFTs in your wallet — attackers airdrop malicious tokens designed to drain funds when you interact with them.", "Never trust DMs from 'support teams' asking for wallet information. Legitimate projects never DM first."] },
      { heading: "Transaction Simulation", paragraphs: ["Modern wallets can simulate what a transaction will do before you sign it, showing exactly which tokens will leave and enter your wallet.", "If simulation shows unexpected transfers, reject immediately regardless of what a website tells you."] },
    ],
    icon: "🛡️",
    gradientFrom: "#0891b2",
    gradientTo: "#0c4a6e",
    order: 4,
  },
  {
    title: "How to Create an NFT",
    description: "Prepare your digital asset, connect your wallet, use the HyperTek minting tool, set your price, and publish it to the marketplace.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 5,
    body: [
      "Creating an NFT on HyperTek is a straightforward process. Start by preparing your digital file — this could be a piece of artwork, a 3D model, a character design, audio clip, or any digital content you own full rights to. File format and quality matter: high-resolution assets command higher prices and age better in collector libraries.",
      "Connect your wallet to HyperTek's minting interface, upload your file, fill in the title, description, and royalty percentage — the cut you receive on every future resale — then set your initial listing price and publish. Each of these fields directly affects your asset's discoverability and long-term value.",
      "Your NFT will be reviewed against platform content guidelines and then listed on the marketplace. Once live, anyone browsing the marketplace can view, share, and purchase it. HyperTek's search and filter system ensures your creation is surfaced to the right buyers.",
      "Setting the right royalty percentage is important. Too low and you miss out on secondary market revenue; too high and resellers are disincentivized from buying. Industry standard royalties for NFTs range between 5% and 10%. HyperTek enforces royalties on-chain, so every future sale automatically sends your cut to your wallet.",
      "If your asset qualifies under HyperTek's NFA criteria — meaning it meets the minimum quality, utility, and value thresholds defined in the platform's asset policy — it may be enrolled in the buyback guarantee program. This gives it a financial floor that protects both creator and collector from a complete loss of value.",
      "Once your NFT is listed, promote it through your social channels. Collectors discover new assets through creator communities, Discord servers, and Twitter. HyperTek's platform amplifies high-quality listings through featured sections and category highlights, but grassroots community building remains the most effective long-term strategy for creators.",
    ],
    sections: [
      { heading: "Preparing Your Digital Asset", paragraphs: ["Prepare artwork, 3D models, character designs, or audio you own full rights to. Quality matters — high-resolution assets command higher prices.", "Research what's trending on HyperTek. Game-related assets (characters, weapons, vehicles) perform best."] },
      { heading: "The Creation Workflow", paragraphs: ["Connect wallet, upload file, fill in title/description/royalty, set price, and publish. Your NFT is reviewed then listed on the marketplace.", "Once live, anyone browsing the marketplace can view, share, and purchase it."] },
      { heading: "Setting Royalties", paragraphs: ["Industry standard: 5-10%. Too low and you miss secondary revenue; too high and resellers are disincentivized.", "HyperTek enforces royalties on-chain — every future sale automatically sends your cut to your wallet, permanently."] },
      { heading: "NFA Qualification", paragraphs: ["Assets meeting HyperTek's quality/utility thresholds may enter the buyback guarantee program with an appreciating floor price.", "The buyback floor increases by 5% of each sale above the reserve, creating built-in value growth."] },
      { heading: "Marketing Your Creation", paragraphs: ["Promote through social channels and Discord communities. HyperTek features high-quality listings in category highlights.", "Create series/collections rather than one-offs — cohesive themes with roadmaps attract serious collectors and build brand value."] },
    ],
    icon: "✨",
    gradientFrom: "#ea580c",
    gradientTo: "#7c2d12",
    order: 5,
  },
  {
    title: "How to Sell an NFT",
    description: "List your NFT on the marketplace by setting a price, approving the contract, and confirming the listing transaction in your wallet.",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 5,
    body: [
      "To sell an NFT you own, navigate to your 'My Collections' section on HyperTek. Find the item you want to list, click 'List for Sale,' and set your asking price in USDC. You can also choose to run an auction with a starting bid and timer if you believe competitive bidding might yield a higher final price.",
      "You will need to approve the marketplace contract to handle the transfer — this is a one-time step per collection. This approval grants the marketplace contract permission to move your NFT on your behalf when a buyer's payment is confirmed. It does not give the contract access to any other assets in your wallet.",
      "Once your listing is active, it appears immediately in the marketplace feed and is indexed by HyperTek's search system. You can edit the price or delist the item at any time before a sale completes — there is no lock-in period for standard fixed-price listings.",
      "When someone purchases your NFT, funds are distributed automatically by the smart contract: the platform fee (20%) is deducted, any creator royalties for secondary sales are routed to the original creator, and the remainder is deposited directly to your connected wallet. The entire process is instant and trustless.",
      "On HyperTek, sellers can choose how to access their earnings — USDC to your wallet, Hyper Bucks credited to your platform balance for in-app purchases, or a bank transfer request processed through the platform's fiat off-ramp service. This flexibility makes HyperTek accessible to both crypto-native and traditional users.",
      "Timing matters in NFT sales. Market activity fluctuates with broader crypto sentiment, game update cycles, and community events. Listing during a HyperTek game launch or in-game event typically drives higher buyer traffic and faster sales at stronger prices. Monitor the marketplace for peak activity windows before listing high-value assets.",
    ],
    sections: [
      { heading: "Listing Your NFT", paragraphs: ["Navigate to 'My Collections', click 'List for Sale', and set your price in USDC. Choose fixed-price or auction-style listing.", "You can also opt for a 'Buy Now' price alongside an auction starting bid."] },
      { heading: "Contract Approval", paragraphs: ["A one-time approval per collection grants the marketplace permission to move your NFT when a buyer pays. It doesn't give access to other assets."] },
      { heading: "Managing Active Listings", paragraphs: ["Edit price or delist anytime before sale completes. Monitor view counts and watchlist additions through the seller dashboard.", "Use these metrics to gauge demand and adjust pricing."] },
      { heading: "Revenue Distribution", paragraphs: ["Platform fee (20%) is deducted, creator royalties routed to original creator, remainder goes to your wallet — all automatically.", "Access earnings as USDC, Hyper Bucks, or bank transfer through the fiat off-ramp."] },
      { heading: "Timing Your Sales", paragraphs: ["Market activity fluctuates with crypto sentiment, game updates, and community events. List during game launches for higher traffic.", "Analyze recent comparable sales. Seasonal trends — new seasons, holiday events, major updates — create demand spikes savvy sellers capitalize on."] },
    ],
    icon: "💰",
    gradientFrom: "#dc2626",
    gradientTo: "#7f1d1d",
    order: 6,
  },
  {
    title: "What is a Crypto Wallet?",
    description: "A crypto wallet stores your private keys and lets you interact with blockchains. Popular options include MetaMask and Rainbow Wallet.",
    image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 5,
    body: [
      "A crypto wallet is software (or hardware) that stores your private keys and lets you interact with blockchains. Think of it as a combination of a bank account and a keyring — it doesn't store your tokens directly on the device, but holds the cryptographic keys that prove you own them on-chain.",
      "There are two main categories: hot wallets (software-based, always online — e.g., MetaMask, Rainbow, Coinbase Wallet) and cold wallets (hardware-based, offline — e.g., Ledger, Trezor). Hot wallets are convenient for daily use and free to set up; cold wallets offer superior security for storing large or high-value balances.",
      "On HyperTek, new users receive a custodial wallet automatically on signup — HyperTek manages the private keys on your behalf in a secure enclave. This removes all technical complexity for beginners and lets you start buying and trading immediately without understanding cryptography.",
      "As you grow more comfortable with Web3, you can migrate your HyperTek assets to a self-custodial wallet. This means you — and only you — control the private keys. Self-custody is considered the gold standard for serious collectors, as no company can freeze, seize, or lose access to your assets.",
      "Your wallet address is your public identity on the blockchain. It looks like a long string of characters (e.g., 0x1234...abcd) and functions like a bank account number — anyone can send assets to it, but only you can authorize outgoing transactions using your private key or seed phrase.",
      "Never store your seed phrase digitally — not in your email, cloud storage, notes app, or screenshots. Write it on paper and store it in a physically secure location. Some users engrave seed phrases on metal plates for fire and water resistance. This single piece of information is the master key to everything in your wallet.",
    ],
    sections: [
      { heading: "Understanding Crypto Wallets", paragraphs: ["A crypto wallet stores your private keys and lets you interact with blockchains. It doesn't store tokens directly — it holds the keys that prove you own them on-chain.", "Think of it as a combination of a bank account and a keyring. Your tokens live on the blockchain; your wallet proves you're authorized to manage them."] },
      { heading: "Hot Wallets vs Cold Wallets", paragraphs: ["Hot wallets (MetaMask, Rainbow, Coinbase Wallet) are software-based, always online, convenient for daily use and free to set up.", "Cold wallets (Ledger, Trezor) are hardware-based and offline — superior security for high-value holdings. They connect briefly to sign transactions."] },
      { heading: "HyperTek's Custodial Wallet", paragraphs: ["New users receive a custodial wallet automatically. HyperTek manages keys in a secure enclave, removing technical complexity.", "As you grow comfortable, you can migrate to a self-custodial wallet where only you control the private keys."] },
      { heading: "Wallet Addresses & Identity", paragraphs: ["Your wallet address (e.g., 0x1234...abcd) is your public identity on-chain. Anyone can send assets to it, but only you can authorize transactions.", "Some users create multiple wallets: a vault for holdings, a trading wallet for active use, and a minting wallet for new contracts."] },
      { heading: "Seed Phrase Security", paragraphs: ["Never store your seed phrase digitally. Write it on paper and store in a physically secure location.", "This is the master key to everything in your wallet. If lost, there is no recovery — assets become permanently inaccessible."] },
    ],
    icon: "👛",
    gradientFrom: "#4338ca",
    gradientTo: "#1e1b4b",
    order: 7,
  },
  {
    title: "What is Blockchain?",
    description: "A blockchain is a distributed ledger that records all transactions transparently and immutably, making it impossible to tamper with records.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 6,
    body: [
      "A blockchain is a distributed ledger — a database shared and synchronized across thousands of computers worldwide. Each 'block' contains a batch of confirmed transactions, and each block is cryptographically linked to the one before it, forming an unalterable chain extending back to the very first transaction ever recorded.",
      "This design makes blockchains extremely resistant to tampering. To alter any historical record, an attacker would need to rewrite every subsequent block and simultaneously control more than 50% of the network's computing power — computationally and economically infeasible in any major blockchain. This is why 'the blockchain is immutable' is a foundational principle of Web3.",
      "Ethereum is the most widely used blockchain for NFTs and smart contracts. It uses a proof-of-stake consensus mechanism where validators lock up ETH as collateral to participate in block creation. This replaced the energy-intensive proof-of-work model in 2022, reducing Ethereum's energy consumption by over 99.9%.",
      "Layer-2 networks are blockchains built on top of (and secured by) a Layer-1 like Ethereum. They process transactions off the main chain and periodically settle batches back to Layer-1, inheriting its security while offering much higher throughput and dramatically lower fees. Base, built by Coinbase, is one of the most widely adopted Ethereum Layer-2 networks.",
      "HyperTek is deployed on Base, which means all transactions — NFT purchases, auctions, minting — cost fractions of a cent and confirm in seconds rather than the minutes (and dollars) typical of Ethereum mainnet. This is what makes HyperTek accessible to everyday gamers rather than only crypto whales.",
      "Public blockchains are permissionless and open to anyone. No government, company, or individual can prevent you from sending a transaction or reading the ledger. This openness is a deliberate design choice — it ensures that the rules governing digital ownership cannot be unilaterally changed to disadvantage users after the fact.",
    ],
    sections: [
      { heading: "Distributed Ledger Technology", paragraphs: ["A blockchain is a database shared across thousands of computers. Each block contains transactions, cryptographically linked to the previous block, forming an unalterable chain.", "To tamper with any record, an attacker would need to rewrite every subsequent block and control 50%+ of the network — computationally infeasible."] },
      { heading: "Ethereum & Smart Contracts", paragraphs: ["Ethereum is the most widely used blockchain for NFTs. Its proof-of-stake consensus reduced energy consumption by 99.9% after the 2022 Merge.", "Smart contracts on Ethereum enable complex automated financial operations without intermediaries."] },
      { heading: "Layer-2 Networks", paragraphs: ["Layer-2s process transactions off the main chain and settle batches back to Layer-1, inheriting security with higher throughput and lower fees.", "HyperTek uses Base (built by Coinbase) — transactions cost fractions of a cent and confirm in seconds."] },
      { heading: "Consensus Mechanisms", paragraphs: ["Proof-of-Stake (PoS) requires validators to lock up crypto as collateral. Dishonest behavior results in their stake being 'slashed.'", "This replaced energy-intensive Proof-of-Work where miners solved mathematical puzzles. PoS achieves the same security with minimal energy."] },
      { heading: "Permissionless & Open", paragraphs: ["Public blockchains are open to anyone. No government or company can prevent transactions or censor the ledger.", "This ensures rules governing digital ownership cannot be unilaterally changed to disadvantage users. Code is law."] },
    ],
    icon: "⛓️",
    gradientFrom: "#0f766e",
    gradientTo: "#042f2e",
    order: 8,
  },
  {
    title: "What Are Gas Fees?",
    description: "Gas fees are payments made to blockchain validators for processing your transaction. They vary based on network congestion.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 5,
    body: [
      "Gas fees are payments made to the validators who process and confirm your blockchain transactions. They are priced in the network's native currency — ETH for Ethereum-compatible chains — and fluctuate dynamically based on how much activity is competing for space in each block at any given moment.",
      "Think of gas fees like surge pricing on a ride-sharing app. When lots of users are submitting transactions simultaneously, fees rise because block space is limited and validators prioritize higher-paying transactions. During off-peak hours or on less congested networks, fees can be negligible.",
      "Every operation on a blockchain has a gas cost determined by its computational complexity. A simple ETH transfer costs less gas than deploying a smart contract or executing a complex NFT auction. Your wallet displays the estimated gas fee before you confirm any transaction, so you always know the total cost upfront.",
      "EIP-1559, an Ethereum upgrade from 2021, introduced a base fee that is algorithmically adjusted block-by-block based on network demand. This base fee is burned (removed from circulation permanently) rather than paid to validators, creating deflationary pressure on ETH supply. You pay the base fee plus an optional priority tip to incentivize faster inclusion.",
      "HyperTek is built on Base, an Ethereum Layer-2 network, which dramatically reduces gas costs compared to the main Ethereum chain. Transactions that might cost $5–$50 in gas on Ethereum mainnet cost less than $0.01 on Base. This makes frequent in-game transactions, small NFT purchases, and experimentation genuinely affordable for all users.",
      "Gas fees are paid in ETH even when buying NFTs priced in USDC. Always keep a small amount of ETH in your wallet to cover fees. HyperTek's custodial wallet system sponsors gas fees for eligible new users, so you can make your first purchases without needing to acquire ETH separately — the platform covers the cost on your behalf.",
    ],
    sections: [
      { heading: "What Gas Fees Pay For", paragraphs: ["Gas fees pay validators who process and confirm transactions. They fluctuate based on network activity — like surge pricing on ride-sharing.", "When many users submit transactions simultaneously, fees rise because block space is limited."] },
      { heading: "How Gas Is Calculated", paragraphs: ["Every operation has a gas cost based on computational complexity. Simple transfers cost less than deploying smart contracts.", "Your wallet displays estimated fees before confirmation — you always know total cost upfront."] },
      { heading: "EIP-1559 & Fee Burning", paragraphs: ["EIP-1559 introduced a base fee adjusted block-by-block based on demand. This base fee is burned permanently, creating deflationary pressure on ETH.", "You pay the base fee plus an optional priority tip for faster inclusion."] },
      { heading: "Gas on Layer-2 Networks", paragraphs: ["On Base, transactions that cost $5-$50 on Ethereum mainnet cost less than $0.01. This makes frequent small transactions genuinely affordable.", "HyperTek's custodial wallet sponsors gas for eligible new users — first purchases require zero ETH."] },
      { heading: "Tips for Managing Gas Costs", paragraphs: ["Always keep a small ETH balance for fees even when buying with USDC. Batch transactions when possible.", "Avoid transacting during major NFT drops when congestion peaks. Use gas tracking tools to find low-fee windows."] },
    ],
    icon: "⛽",
    gradientFrom: "#b45309",
    gradientTo: "#451a03",
    order: 9,
  },
  {
    title: "What is a Smart Contract?",
    description: "A smart contract is self-executing code on the blockchain that automatically enforces the rules of a transaction without intermediaries.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 6,
    body: [
      "A smart contract is a self-executing program stored permanently on the blockchain. It contains a set of rules written in code — and when the defined conditions are met, it executes automatically, without any human intermediary, third-party service, or manual intervention of any kind.",
      "In NFT marketplaces, smart contracts handle the entire transaction lifecycle: verifying ownership before a sale, transferring the NFT to the buyer simultaneously with payment to the seller, distributing royalties to the original creator, and updating all on-chain records in a single atomic operation that either fully succeeds or fully reverts.",
      "The code of a smart contract is publicly visible on the blockchain. Anyone can read exactly what a contract does before interacting with it. This transparency is fundamental to trust in Web3 — you don't need to trust the company running a marketplace; you can verify the contract's behavior directly.",
      "Once deployed, a standard smart contract cannot be modified. This immutability is a double-edged sword: it provides absolute certainty about rules, but also means bugs cannot be patched without deploying an entirely new contract. This is why security audits by independent firms before deployment are standard practice for serious projects.",
      "HyperTek's smart contracts have been professionally audited to verify they behave exactly as described — handling buyback guarantees, auction mechanics, royalty distributions, and marketplace fees in strict accordance with the platform's published rules. Audit reports are publicly available for any user who wishes to review them.",
      "Beyond simple transfers, smart contracts enable complex financial instruments. HyperTek's NFA buyback mechanism is itself a smart contract — it holds reserve funds and automatically executes a buyback if an NFA is listed below its floor price. This trustless automation is what makes the buyback guarantee credible: it doesn't rely on HyperTek choosing to honour it, the contract enforces it unconditionally.",
    ],
    sections: [
      { heading: "Self-Executing Code", paragraphs: ["A smart contract is a program stored permanently on-chain. When conditions are met, it executes automatically without intermediaries.", "Once deployed, standard smart contracts cannot be modified — providing certainty but requiring thorough pre-deployment audits."] },
      { heading: "Smart Contracts in NFT Marketplaces", paragraphs: ["They handle the full transaction lifecycle: verify ownership, transfer NFT + payment simultaneously, distribute royalties — all atomically.", "Either everything succeeds or everything reverts. No scenario where a buyer pays but doesn't receive the item."] },
      { heading: "Transparency & Trust", paragraphs: ["Contract code is publicly visible. Anyone can read exactly what it does before interacting.", "You verify the contract's behavior directly instead of trusting a company's promises."] },
      { heading: "Security Audits", paragraphs: ["Since contracts are immutable, independent security audits are standard practice. Bugs can result in permanent fund loss.", "HyperTek's contracts are professionally audited — reports are publicly available for any user to review."] },
      { heading: "Advanced Use Cases", paragraphs: ["HyperTek's NFA buyback mechanism is a smart contract holding reserve funds, executing buybacks unconditionally when NFAs list below floor.", "Other use cases include time-locked vesting, multi-signature governance, automatic revenue splitting, and DAO treasury management."] },
    ],
    icon: "📜",
    gradientFrom: "#be185d",
    gradientTo: "#500724",
    order: 10,
  },
  {
    title: "What is HyperTek?",
    description: "HyperTek is a play-to-earn NFT gaming universe where soldiers, land, weapons and vehicles are real digital assets you own.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    category: "HyperTek",
    readTime: 6,
    body: [
      "HyperTek is a play-to-earn gaming universe built on the Base blockchain. It features multiple game modes — high-speed racing, quest-based missions, and large-scale tactical strategy — all centered around NFTs and NFAs that players genuinely own on-chain, not just licensed from a game publisher.",
      "Unlike traditional games where in-game items disappear if the servers shut down or the developer changes the terms, HyperTek assets live on the blockchain independently. Your soldier character, weapons, vehicles, and land are real digital assets you control — tradeable, rentable, and valuable regardless of what happens to the platform.",
      "HyperTek introduces the NFA (Non-Fungible Asset) standard — an evolution of the standard NFT that comes with a guaranteed minimum buyback value enforced by a smart contract. If an NFA is listed for sale below its reserve price, HyperTek's protocol automatically purchases it back. This floor price increases by 5% of each sale above the reserve, creating an asset that appreciates in baseline value over time.",
      "The HyperTek ecosystem is designed for three types of participants. Gamers play to earn in-game rewards and improve their assets' stats and rankings. Collectors acquire rare items, NFAs with strong buyback floors, and limited-edition collectibles as long-term investments. Creators mint and sell original designs, characters, weapons, and artwork, earning royalties on every future resale.",
      "HyperTek's marketplace is the central hub connecting all three participant types. It supports fixed-price listings, time-limited auctions, rental agreements (For Hire), skill-based Quests where users compete for NFT prizes, and Bounties where organizations post contracts for in-game services. This creates a genuine player-driven economy.",
      "The platform is built to be accessible regardless of your crypto background. New users sign up with an email address and receive an automatically created custodial wallet. Credit card payments are supported from day one. As users grow more sophisticated, they can migrate to self-custodial wallets and participate in the full depth of the Web3 economy HyperTek is building.",
    ],
    sections: [
      { heading: "The HyperTek Universe", paragraphs: ["HyperTek is a play-to-earn gaming universe on Base blockchain — racing, quests, and tactical strategy centered around owned NFTs and NFAs.", "All gameplay assets are genuinely owned on-chain, not just licensed from a publisher."] },
      { heading: "True Asset Ownership", paragraphs: ["Unlike traditional games, HyperTek assets persist on the blockchain independently. Your items are tradeable and valuable regardless of platform status.", "Even if HyperTek ceased to exist, your on-chain assets would remain in your wallet."] },
      { heading: "The NFA Standard", paragraphs: ["NFAs have a guaranteed minimum buyback value enforced by smart contract. If listed below reserve, the protocol buys it back automatically.", "The floor price increases by 5% of each sale above reserve — an asset that appreciates in baseline value over time."] },
      { heading: "Three Types of Participants", paragraphs: ["Gamers earn rewards and improve asset stats. Collectors acquire rare items as investments. Creators mint and sell original designs, earning perpetual royalties.", "All three types interact through the marketplace ecosystem."] },
      { heading: "The Marketplace Ecosystem", paragraphs: ["Supports fixed-price listings, auctions, rentals (For Hire), skill-based Quests, and Bounties — creating a genuine player-driven economy.", "The marketplace connects gamers, collectors, and creators in a single economic loop."] },
      { heading: "Accessibility & Onboarding", paragraphs: ["Sign up with email, get an auto-created wallet, pay with credit cards. No crypto experience required to start.", "As users grow, they can migrate to self-custodial wallets and participate in the full Web3 economy."] },
    ],
    icon: "🚀",
    gradientFrom: "#1d4ed8",
    gradientTo: "#172554",
    order: 11,
  },
  {
    title: "What is Web3?",
    description: "Web3 is the next evolution of the internet built on blockchain technology, giving users ownership of their digital assets and data.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 5,
    body: [
      "Web3 is a vision for the next generation of the internet — one built on decentralized blockchain infrastructure rather than centralized corporate servers. Where Web1 was read-only and Web2 gave users the ability to create content on platforms they don't control, Web3 gives users genuine ownership of their digital identities, assets, and data.",
      "In practice, Web3 applications connect to users' wallets rather than requiring traditional account creation with email and password. Your wallet is your universal identity and account across every decentralized application — connect once and go. Your assets and reputation move with you across platforms, not siloed inside any single company's database.",
      "Decentralization is the defining characteristic of Web3. Rather than a single company running servers that can be taken offline, censored, or modified unilaterally, Web3 applications run on distributed networks where no single party has full control. This makes the applications inherently more resilient and the rules governing them more trustworthy.",
      "Critics of Web3 point to real challenges: user experience remains complex for mainstream audiences, scams and hacks have caused significant losses, and not all decentralization claims by projects hold up to scrutiny. These are legitimate concerns that the industry is actively working to address through better tooling, regulation, and education.",
      "The usability gap is closing rapidly. Account abstraction allows wallets to behave more like traditional accounts — enabling password recovery, gasless transactions, and one-click onboarding. HyperTek is designed to onboard users at any level of crypto familiarity, abstracting complexity without sacrificing the genuine ownership benefits that Web3 enables.",
      "Long term, Web3 represents a fundamental shift in who controls digital value. Today, platforms can ban accounts, confiscate in-game items, or shut down services with no recourse for users. In a Web3 world, your assets are yours unconditionally — secured by cryptography and public consensus rather than a company's terms of service. HyperTek is building toward that future, game by game.",
    ],
    sections: [
      { heading: "The Evolution of the Internet", paragraphs: ["Web3 is the next internet generation — built on decentralized blockchain infrastructure rather than centralized servers.", "Web1 was read-only. Web2 let users create content on platforms they don't control. Web3 gives genuine ownership of digital identities, assets, and data."] },
      { heading: "Wallet-Based Identity", paragraphs: ["Web3 apps connect to wallets instead of requiring traditional accounts. Your wallet is your universal identity across all decentralized applications.", "Assets and reputation move with you across platforms — no data siloed in any single company's database."] },
      { heading: "Decentralization", paragraphs: ["Apps run on distributed networks where no single party has full control — inherently more resilient and trustworthy.", "No company can unilaterally change terms of service to disadvantage users after the fact."] },
      { heading: "Real Challenges", paragraphs: ["UX remains complex for mainstream audiences, scams have caused losses, and not all decentralization claims hold up.", "The industry addresses these through better tooling, regulation, and education. The technology is maturing rapidly."] },
      { heading: "Account Abstraction & UX", paragraphs: ["Wallets can now behave like traditional accounts — password recovery, gasless transactions, one-click onboarding.", "HyperTek abstracts complexity without sacrificing genuine ownership benefits."] },
      { heading: "The Future of Digital Ownership", paragraphs: ["Web3 shifts control of digital value from platforms to users. Your assets are secured by cryptography, not terms of service.", "HyperTek is building toward this future — where in-game progress translates to real, permanent digital ownership."] },
    ],
    icon: "🌐",
    gradientFrom: "#0369a1",
    gradientTo: "#0c2840",
    order: 12,
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB");

  // ── Seed parent collections + sub-collections ──
  let createdParents = 0;
  let skippedParents = 0;

  for (const cat of CATEGORIES) {
    const existing = await NFTSystem.findOne({
      "collection.name": cat.name,
      isParentCollection: true,
    });

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${cat.name}`);
      skippedParents++;
      continue;
    }

    const parent = await NFTSystem.create({
      collection: {
        name:   cat.name,
        symbol: cat.symbol,
        chain:  cat.chain,
        image:  "",
        royaltyPercent: 5,
        supply: cat.items.length,
        creator: "admin",
      },
      isParentCollection: true,
      status: "active",
      subCollections: cat.items.map((item, i) => ({
        name:        item.name,
        symbol:      item.symbol,
        description: item.description,
        priceETH:    item.priceETH,
        listed:      true,
        isFirstSale: true,
        tokenId:     i + 1,
      })),
    });

    console.log(`✅ Created: ${cat.name}  (${parent.subCollections.length} items, _id: ${parent._id})`);
    createdParents++;
  }

  // ── Seed NFT 101 (delete all then re-insert for clean state) ──
  await Nft101.deleteMany({});
  const inserted = await Nft101.insertMany(NFT_101_DATA);

  console.log("\n── Summary ──────────────────────────────────────────────");
  console.log(`📦 Parent collections: ${createdParents} created, ${skippedParents} skipped`);
  console.log(`📚 NFT 101 articles:   ${inserted.length} inserted (fresh)`);
  console.log("─────────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("✅ Done. Database disconnected.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
