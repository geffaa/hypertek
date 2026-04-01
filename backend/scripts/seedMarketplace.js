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
    description: "Learn what Non-Fungible Tokens are and why they are transforming digital ownership in gaming and beyond.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 10,
    order: 1,
    contentBlocks: [
      { type: "heading", value: "Understanding NFTs" },
      { type: "text", value: "Non-Fungible Tokens, commonly known as NFTs, are unique digital assets that exist on a blockchain. Unlike cryptocurrencies such as Bitcoin or Ethereum, which are interchangeable, each NFT has distinct properties that make it one of a kind. This uniqueness allows NFTs to represent ownership of digital items, ranging from artwork and music to in-game assets and virtual real estate. In ecosystems like HyperTek, NFTs form the backbone of ownership within the gaming universe." },
      { type: "text", value: "The concept of ownership in the digital world has always been problematic because digital files can be copied infinitely. NFTs solve this by providing verifiable proof of ownership stored on a decentralized ledger. This means that even if a file is duplicated, only one wallet holds the authentic token. As a result, NFTs introduce scarcity and authenticity into digital environments." },
      { type: "image", value: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=1200&q=80", caption: "Digital artwork represented as unique blockchain-based assets" },
      { type: "heading", value: "How NFTs Work" },
      { type: "text", value: "NFTs operate through smart contracts, which are self-executing programs stored on a blockchain. These contracts define the ownership, transfer rules, and metadata associated with each token. When someone purchases an NFT, the blockchain records the transaction and transfers ownership to the buyer's wallet. This process is transparent and immutable, ensuring trust without intermediaries." },
      { type: "text", value: "In gaming platforms like HyperTek, NFTs go beyond static ownership. They can represent functional assets such as weapons, skins, or even characters. Each item has attributes that influence gameplay, making NFTs an integral part of the gaming experience rather than just collectibles." },
      { type: "image", value: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80", caption: "Visualization of blockchain transactions and ownership records" },
      { type: "heading", value: "Why NFTs Matter" },
      { type: "text", value: "NFTs are significant because they shift control from centralized platforms to individual users. Players and creators can truly own their digital assets and decide how they are used. This opens up new opportunities for monetization, including trading, renting, or licensing assets." },
      { type: "text", value: "HyperTek enhances this concept through its Non-Fungible Asset standard, which includes features like guaranteed buyback value. This reduces risk and encourages participation from new users. It transforms NFTs from speculative assets into tools with real utility." },
      { type: "heading", value: "The Future of NFTs" },
      { type: "text", value: "As blockchain adoption grows, NFTs are expected to expand beyond art and gaming into industries such as education, identity verification, and real estate. Their ability to represent ownership securely makes them versatile tools for many applications. This evolution is already underway as more platforms integrate NFT functionality." },
      { type: "text", value: "In gaming, NFTs will continue to redefine how players interact with virtual worlds. Platforms like HyperTek demonstrate that NFTs can create sustainable ecosystems where users earn value through participation. The future of NFTs lies in their utility, accessibility, and integration into everyday digital experiences." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "How to Buy an NFT",
    description: "A beginner-friendly guide to purchasing your first NFT safely and confidently.",
    image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 9,
    order: 2,
    contentBlocks: [
      { type: "heading", value: "Getting Started with NFT Purchases" },
      { type: "text", value: "Buying an NFT may seem complex at first, but the process becomes straightforward once you understand the basics. The first step is setting up a crypto wallet, which acts as your digital identity and storage for assets. Wallets allow you to interact with blockchain applications and marketplaces securely. Without one, purchasing NFTs is not possible." },
      { type: "text", value: "HyperTek simplifies onboarding by offering custodial wallets linked to email accounts. This approach removes the need for technical setup and allows users to start quickly. Additionally, support for credit card payments makes the platform more accessible to beginners." },
      { type: "image", value: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=1200&q=80", caption: "User browsing NFT marketplace listings and collections" },
      { type: "heading", value: "Choosing the Right NFT" },
      { type: "text", value: "Before purchasing an NFT, it is essential to evaluate its purpose and value. Some NFTs are collectibles, while others have utility within a platform or game. In HyperTek, items such as weapons, skins, and vehicles can directly impact gameplay and earning potential." },
      { type: "text", value: "Researching factors such as rarity, creator reputation, and market demand helps make informed decisions. Beginners should avoid impulsive purchases and instead focus on understanding the ecosystem. This approach reduces risk and increases the chances of acquiring valuable assets." },
      { type: "image", value: "https://images.unsplash.com/photo-1640622308205-4b5c9c5c2c02?auto=format&fit=crop&w=1200&q=80", caption: "NFT items displayed with pricing, rarity, and metadata" },
      { type: "heading", value: "Completing the Transaction" },
      { type: "text", value: "Once you have selected an NFT, the purchase is completed through a blockchain transaction. Your wallet signs the transaction, confirming your intent to buy. After the transaction is processed, ownership is transferred to your wallet address." },
      { type: "text", value: "HyperTek leverages the Base blockchain to provide faster and lower-cost transactions compared to traditional networks. This makes buying NFTs more efficient and user-friendly, especially for newcomers." },
      { type: "heading", value: "Managing Your NFT Assets" },
      { type: "text", value: "After purchasing, your NFT is stored in your wallet and can be viewed on the marketplace. You have full control over how it is used, whether you choose to hold, sell, or utilize it in gameplay. Ownership is secure and verifiable on the blockchain." },
      { type: "text", value: "In HyperTek, NFTs can also be rented, traded, or used in quests and bounties. This creates multiple opportunities to generate value from a single asset. Effective management of NFTs is key to maximizing returns." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "What is Minting?",
    description: "Understand how NFTs are created and brought onto the blockchain through the minting process.",
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 10,
    order: 3,
    contentBlocks: [
      { type: "heading", value: "Introduction to Minting" },
      { type: "text", value: "Minting is the process of creating a new NFT and recording it on the blockchain. This involves converting a digital file into a token that represents ownership. Once minted, the NFT becomes part of the blockchain and cannot be altered. This ensures authenticity and permanence." },
      { type: "text", value: "Creators use minting to bring their digital works into the Web3 ecosystem. Whether it is art, music, or in-game assets, minting transforms these items into tradable digital assets. Platforms like HyperTek make this process accessible even for beginners." },
      { type: "image", value: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80", caption: "Blockchain network processing new NFT creation" },
      { type: "heading", value: "How Minting Works" },
      { type: "text", value: "Minting involves interacting with a smart contract that generates the NFT. The creator uploads a file, adds metadata, and confirms the transaction through a wallet. The blockchain then records the NFT and assigns ownership to the creator." },
      { type: "text", value: "In HyperTek, minting can be used to create in-game assets such as skins or weapons. These assets are immediately usable within the ecosystem, adding both functional and economic value." },
      { type: "image", value: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80", caption: "Digital interface showing NFT creation and metadata input" },
      { type: "heading", value: "Costs and Considerations" },
      { type: "text", value: "Minting usually requires paying a fee, known as gas, which covers the cost of processing the transaction. These fees vary depending on the blockchain network. Choosing a network with lower fees can make minting more affordable." },
      { type: "text", value: "HyperTek uses the Base blockchain to reduce costs and improve efficiency. This allows creators to mint NFTs without significant financial barriers. Lower costs encourage experimentation and innovation." },
      { type: "heading", value: "Why Minting Matters" },
      { type: "text", value: "Minting is essential because it brings digital assets into the blockchain ecosystem. Without it, NFTs would not exist. This process ensures that each asset is unique, verifiable, and tradable." },
      { type: "text", value: "For creators, minting opens up new revenue streams through direct sales and royalties. In platforms like HyperTek, minted assets can also generate ongoing value through gameplay and trading. This makes minting a powerful tool in the Web3 economy." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "How to Stay Protected in Web3",
    description: "Learn essential security practices to keep your assets safe in the decentralized world.",
    image: "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80",
    category: "Security",
    readTime: 10,
    order: 4,
    contentBlocks: [
      { type: "heading", value: "Understanding Web3 Risks" },
      { type: "text", value: "Web3 introduces a new level of freedom and ownership, but it also comes with unique risks. Unlike traditional systems, there is no central authority to reverse transactions or recover lost assets. This means users are fully responsible for their security. Understanding these risks is the first step toward protecting your digital assets." },
      { type: "text", value: "Common threats include phishing attacks, malicious smart contracts, and wallet compromises. These risks often target beginners who are unfamiliar with how blockchain systems operate. Staying informed and cautious can significantly reduce the likelihood of falling victim." },
      { type: "image", value: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80", caption: "Cybersecurity interface highlighting digital protection systems" },
      { type: "heading", value: "Protecting Your Wallet" },
      { type: "text", value: "Your crypto wallet is the gateway to your assets, making it the most critical component to secure. Always keep your private keys and seed phrases confidential. Sharing them with anyone can result in immediate loss of funds." },
      { type: "text", value: "Using hardware wallets or trusted custodial solutions can add an extra layer of security. HyperTek offers custodial wallets for beginners, reducing the risk of user error while maintaining accessibility." },
      { type: "image", value: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80", caption: "Secure authentication and encryption protecting digital wallets" },
      { type: "heading", value: "Avoiding Scams and Phishing" },
      { type: "text", value: "Phishing scams are one of the most common threats in Web3. Attackers often create fake websites or send messages that mimic legitimate platforms. These attempts are designed to trick users into revealing sensitive information." },
      { type: "text", value: "Always verify URLs and avoid clicking on suspicious links. Bookmark official websites and double-check smart contract interactions before approving transactions. Awareness is your strongest defense." },
      { type: "heading", value: "Best Practices for Safe Transactions" },
      { type: "text", value: "Before signing any transaction, review the details carefully. Ensure that you understand what permissions you are granting. Some malicious contracts request access to all your assets, which can be dangerous." },
      { type: "text", value: "Using platforms like HyperTek, which are built with user safety in mind, reduces exposure to harmful interactions. Combining platform-level security with personal vigilance ensures maximum protection." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "How to Create an NFT",
    description: "Step-by-step guidance on turning your digital creations into blockchain-based assets.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 9,
    order: 5,
    contentBlocks: [
      { type: "heading", value: "Preparing Your Digital Asset" },
      { type: "text", value: "Creating an NFT starts with preparing the digital file you want to tokenize. This could be artwork, music, video, or even in-game assets. The quality and uniqueness of your content play a significant role in its value." },
      { type: "text", value: "Before minting, it is important to ensure that you have the rights to the content. Ownership and originality are key factors in the NFT ecosystem. Proper preparation sets the foundation for a successful NFT." },
      { type: "image", value: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80", caption: "Digital creator working on artwork for NFT production" },
      { type: "heading", value: "Minting Your NFT" },
      { type: "text", value: "Once your asset is ready, the next step is minting it on a blockchain. This involves uploading the file, adding metadata, and confirming the transaction. The blockchain then records your NFT permanently." },
      { type: "text", value: "HyperTek simplifies this process by offering intuitive tools for creators. Its integration with the Base blockchain ensures low fees and fast processing times." },
      { type: "image", value: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80", caption: "Blockchain system processing NFT creation" },
      { type: "heading", value: "Setting Royalties and Utility" },
      { type: "text", value: "One of the advantages of NFTs is the ability to earn royalties on future sales. Creators can set a percentage that they receive whenever the NFT is resold. This creates long-term earning potential." },
      { type: "text", value: "In HyperTek, NFTs can also have utility within the game ecosystem. This adds value beyond collectibility, making assets more attractive to buyers." },
      { type: "heading", value: "Launching Your NFT" },
      { type: "text", value: "After minting, your NFT can be listed on a marketplace for sale. Pricing strategies vary depending on demand, rarity, and utility. Creators should consider their target audience when setting prices." },
      { type: "text", value: "Promotion plays a key role in visibility. Sharing your NFT within communities and leveraging platform features increases the chances of success. A well-executed launch can significantly boost engagement." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "How to Sell an NFT",
    description: "Discover how to list, price, and successfully sell your NFTs in a competitive marketplace.",
    image: "https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 9,
    order: 6,
    contentBlocks: [
      { type: "heading", value: "Understanding NFT Marketplaces" },
      { type: "text", value: "Selling NFTs begins with choosing the right marketplace. Different platforms offer various features, audiences, and fee structures. Selecting a platform aligned with your goals is crucial for success." },
      { type: "text", value: "HyperTek provides a dynamic marketplace tailored for gaming assets. It supports fixed-price listings, auctions, and even rentals, giving sellers multiple ways to monetize their NFTs." },
      { type: "image", value: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=1200&q=80", caption: "NFT marketplace interface displaying various listings" },
      { type: "heading", value: "Pricing Strategies" },
      { type: "text", value: "Setting the right price for your NFT requires understanding market demand and asset value. Overpricing can deter buyers, while underpricing may reduce potential profits. Researching similar listings helps determine competitive pricing." },
      { type: "text", value: "In gaming ecosystems like HyperTek, utility plays a major role in pricing. Items that enhance gameplay or provide earning opportunities tend to have higher demand." },
      { type: "image", value: "https://images.unsplash.com/photo-1640622308205-4b5c9c5c2c02?auto=format&fit=crop&w=1200&q=80", caption: "Digital assets with price tags and bidding activity" },
      { type: "heading", value: "Listing and Promotion" },
      { type: "text", value: "Once priced, the NFT is listed on the marketplace. Sellers can choose between fixed-price listings or auctions depending on their strategy. Each method has its advantages based on demand and timing." },
      { type: "text", value: "Promotion is essential to attract buyers. Sharing listings within communities and leveraging platform tools increases visibility. Strong marketing can significantly impact sales performance." },
      { type: "heading", value: "Completing the Sale" },
      { type: "text", value: "When a buyer purchases your NFT, the transaction is executed through the blockchain. Ownership is transferred, and payment is received in your wallet. This process is secure and transparent." },
      { type: "text", value: "HyperTek applies a platform fee and supports creator royalties on resales. This ensures ongoing revenue opportunities for creators. Selling NFTs effectively requires both strategy and consistency." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "What is a Crypto Wallet?",
    description: "Understand how crypto wallets work and why they are essential for managing NFTs and digital assets.",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80",
    category: "Basics",
    readTime: 9,
    order: 7,
    contentBlocks: [
      { type: "heading", value: "Introduction to Crypto Wallets" },
      { type: "text", value: "A crypto wallet is a tool that allows users to store, manage, and interact with digital assets on a blockchain. Unlike traditional wallets, it does not physically hold assets but instead stores the private keys required to access them. These keys prove ownership and enable transactions. Without a wallet, participating in Web3 ecosystems would not be possible." },
      { type: "text", value: "Crypto wallets come in different forms, including software wallets, hardware wallets, and custodial wallets. Each type offers varying levels of security and convenience. Understanding these differences is essential for choosing the right option." },
      { type: "image", value: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80", caption: "Secure digital wallet interface with encryption features" },
      { type: "heading", value: "How Wallets Work" },
      { type: "text", value: "Crypto wallets use cryptographic keys to sign transactions and verify ownership. The public key acts as your address, while the private key must be kept secret. When you send or receive assets, the wallet interacts with the blockchain to validate the transaction." },
      { type: "text", value: "In platforms like HyperTek, wallets are integrated into the user experience. This allows players to manage NFTs seamlessly without needing deep technical knowledge. The system abstracts complexity while maintaining security." },
      { type: "image", value: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80", caption: "Blockchain transaction being signed through a crypto wallet" },
      { type: "heading", value: "Types of Wallets" },
      { type: "text", value: "There are two main categories of wallets: custodial and non-custodial. Custodial wallets are managed by a platform, while non-custodial wallets give full control to the user. Each has its advantages depending on the user's experience level." },
      { type: "text", value: "HyperTek offers custodial wallets to simplify onboarding. This approach reduces the risk of losing access due to forgotten keys. It also enables features like email login and credit card payments." },
      { type: "heading", value: "Keeping Your Wallet Secure" },
      { type: "text", value: "Security is critical when using crypto wallets. Users must protect their private keys and avoid sharing sensitive information. Losing access to a wallet often means losing access to all associated assets." },
      { type: "text", value: "Using trusted platforms, enabling two-factor authentication, and avoiding suspicious links are key practices. Combining these measures ensures that your digital assets remain safe." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "What is Blockchain?",
    description: "Discover how blockchain technology works and why it powers NFTs and Web3 ecosystems.",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 10,
    order: 8,
    contentBlocks: [
      { type: "heading", value: "Understanding Blockchain Technology" },
      { type: "text", value: "Blockchain is a decentralized digital ledger that records transactions across multiple computers. Each transaction is grouped into a block, and these blocks are linked together to form a chain. This structure ensures that data is secure, transparent, and tamper-resistant." },
      { type: "text", value: "Unlike traditional databases, blockchains do not rely on a central authority. Instead, they are maintained by a network of participants who validate transactions. This decentralized approach increases trust and reduces the risk of manipulation." },
      { type: "image", value: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80", caption: "Abstract representation of blockchain nodes and connections" },
      { type: "heading", value: "How Blockchain Works" },
      { type: "text", value: "When a transaction occurs, it is broadcast to the network for validation. Once verified, it is added to a block and permanently recorded. Each block contains a cryptographic hash of the previous block, ensuring continuity and security." },
      { type: "text", value: "This process makes it nearly impossible to alter past transactions. As a result, blockchain is ideal for applications requiring trust and transparency, such as financial systems and digital ownership." },
      { type: "image", value: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80", caption: "Digital ledger showing sequential blockchain transactions" },
      { type: "heading", value: "Blockchain in NFTs and Gaming" },
      { type: "text", value: "NFTs rely on blockchain technology to verify ownership and authenticity. Each NFT is recorded on-chain, making it unique and traceable. This is essential for digital assets that require proof of ownership." },
      { type: "text", value: "HyperTek uses the Base blockchain to power its ecosystem. This allows for fast, low-cost transactions while maintaining security. It enables players to interact with NFTs seamlessly." },
      { type: "heading", value: "The Future of Blockchain" },
      { type: "text", value: "Blockchain technology continues to evolve, with new innovations improving scalability and efficiency. Layer 2 solutions like Base are making blockchain more accessible to mainstream users. These advancements are driving adoption across industries." },
      { type: "text", value: "From finance to gaming, blockchain is reshaping how systems operate. Its ability to provide transparency and decentralization makes it a cornerstone of Web3. The technology is still in its early stages, but its potential is immense." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "What Are Gas Fees?",
    description: "Learn what gas fees are, why they exist, and how they impact your blockchain transactions.",
    image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 9,
    order: 9,
    contentBlocks: [
      { type: "heading", value: "Understanding Gas Fees" },
      { type: "text", value: "Gas fees are the costs required to perform transactions on a blockchain. These fees compensate network validators for processing and securing transactions. Every action, from transferring tokens to minting NFTs, requires gas." },
      { type: "text", value: "The amount of gas needed depends on the complexity of the transaction. Simple transfers require less gas, while smart contract interactions require more. Understanding this helps users estimate costs." },
      { type: "image", value: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80", caption: "Digital representation of transaction costs in blockchain systems" },
      { type: "heading", value: "Why Gas Fees Exist" },
      { type: "text", value: "Gas fees serve two main purposes: incentivizing validators and preventing network spam. Without fees, networks could be overwhelmed by excessive transactions. Fees ensure that resources are used efficiently." },
      { type: "text", value: "They also reflect supply and demand within the network. During high activity, fees increase as users compete for transaction priority. This dynamic pricing is a key characteristic of blockchain systems." },
      { type: "image", value: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=1200&q=80", caption: "Graphical interface showing fluctuating transaction fees" },
      { type: "heading", value: "Reducing Gas Costs" },
      { type: "text", value: "Users can reduce gas fees by choosing optimal times for transactions or using more efficient networks. Layer 2 solutions significantly lower costs by processing transactions off the main chain." },
      { type: "text", value: "HyperTek leverages the Base blockchain to minimize gas fees. This makes it easier for users to trade and interact with NFTs without high costs." },
      { type: "heading", value: "Gas Fees in Everyday Use" },
      { type: "text", value: "Understanding gas fees is essential for managing expenses in Web3. Users should always check estimated fees before confirming transactions. This prevents unexpected costs." },
      { type: "text", value: "As blockchain technology evolves, gas fees are expected to become more predictable and affordable. Innovations continue to improve user experience and accessibility." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "What is a Smart Contract?",
    description: "Learn how smart contracts power NFTs, automate transactions, and enable trustless systems in Web3.",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 10,
    order: 10,
    contentBlocks: [
      { type: "heading", value: "Introduction to Smart Contracts" },
      { type: "text", value: "A smart contract is a self-executing program that runs on a blockchain. It automatically enforces rules and agreements without the need for intermediaries. Once deployed, it operates exactly as programmed, ensuring transparency and reliability. This makes smart contracts a fundamental building block of Web3." },
      { type: "text", value: "Unlike traditional contracts, which rely on legal enforcement, smart contracts execute instantly when conditions are met. This eliminates delays and reduces costs. As a result, they are widely used in decentralized applications, including NFT marketplaces." },
      { type: "image", value: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80", caption: "Abstract visualization of automated blockchain processes" },
      { type: "heading", value: "How Smart Contracts Work" },
      { type: "text", value: "Smart contracts are written in programming languages like Solidity and deployed on blockchain networks. They contain logic that defines how transactions are executed. When users interact with a smart contract, it processes the request according to predefined rules." },
      { type: "text", value: "Every action is recorded on the blockchain, ensuring transparency and immutability. This means that once a smart contract is deployed, it cannot be altered. This guarantees fairness but also requires careful development." },
      { type: "image", value: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80", caption: "Blockchain transaction triggered by smart contract execution" },
      { type: "heading", value: "Smart Contracts in NFTs" },
      { type: "text", value: "NFTs rely heavily on smart contracts to define ownership and transfer rules. These contracts store metadata, manage royalties, and handle transactions automatically. Without smart contracts, NFTs would not function as decentralized assets." },
      { type: "text", value: "In HyperTek, smart contracts enable features such as buybacks, rentals, and auctions. This allows for a dynamic marketplace where assets can be used in multiple ways. Automation ensures efficiency and trust." },
      { type: "heading", value: "Benefits and Limitations" },
      { type: "text", value: "Smart contracts offer numerous benefits, including automation, transparency, and reduced reliance on intermediaries. They make transactions faster and more cost-effective. These advantages are driving widespread adoption." },
      { type: "text", value: "However, they also have limitations. Bugs or vulnerabilities in code can lead to security risks. This highlights the importance of auditing and testing before deployment. Despite these challenges, smart contracts remain essential to blockchain ecosystems." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "What is HyperTek?",
    description: "Explore the HyperTek ecosystem and how it revolutionizes NFT gaming with real ownership and earning opportunities.",
    image: "/logo-t-white.png",
    category: "HyperTek",
    readTime: 10,
    order: 11,
    contentBlocks: [
      { type: "heading", value: "Introduction to HyperTek" },
      { type: "text", value: "HyperTek is a play-to-earn NFT gaming ecosystem built on the Base blockchain. It combines immersive gameplay with real digital ownership, allowing players to earn value through their in-game activities. Unlike traditional games, where assets are locked within the platform, HyperTek gives players full control over their items." },
      { type: "text", value: "The platform is designed to be accessible, offering features like email-based signups, custodial wallets, and credit card payments. This lowers the barrier to entry and makes Web3 gaming more inclusive. HyperTek aims to bridge the gap between traditional gaming and blockchain technology." },
      { type: "image", value: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80", caption: "Gaming environment representing digital economies and player interaction" },
      { type: "heading", value: "NFTs in HyperTek" },
      { type: "text", value: "In HyperTek, NFTs are known as Non-Fungible Assets (NFAs). These include a wide range of in-game items such as weapons, skins, vehicles, and land. Each asset has unique properties and can influence gameplay." },
      { type: "text", value: "NFAs are not just collectibles; they have real utility within the ecosystem. Players can use them in missions, trade them in the marketplace, or rent them to others. This creates a dynamic and player-driven economy." },
      { type: "image", value: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80", caption: "Digital marketplace showcasing tradable gaming assets" },
      { type: "heading", value: "Marketplace and Features" },
      { type: "text", value: "HyperTek offers a robust marketplace with multiple transaction types, including fixed-price sales, auctions, and peer-to-peer trades. Users can also hire or rent assets, enabling new earning strategies. These features make the platform highly versatile." },
      { type: "text", value: "The ecosystem also includes quests and bounties, allowing players to earn rewards through gameplay. This gamified approach keeps users engaged while providing real economic incentives." },
      { type: "heading", value: "Why HyperTek Stands Out" },
      { type: "text", value: "One of HyperTek's unique features is its guaranteed buyback value for NFAs. This reduces risk for players and ensures that assets retain baseline value. It creates a more stable and sustainable economy." },
      { type: "text", value: "By combining accessibility, innovation, and player empowerment, HyperTek represents the future of NFT gaming. It demonstrates how blockchain technology can enhance user experiences while providing real-world benefits." },
    ],
    body: [],
    sections: [],
  },
  {
    title: "What is Web3?",
    description: "Explore how Web3 is reshaping the internet through decentralization, ownership, and blockchain technology.",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=800&q=80",
    category: "Blockchain",
    readTime: 10,
    order: 12,
    contentBlocks: [
      { type: "heading", value: "The Evolution of the Internet" },
      { type: "text", value: "The internet has evolved significantly over the years, from static Web1 pages to interactive Web2 platforms. Web3 represents the next phase, focusing on decentralization and user ownership. It leverages blockchain technology to remove reliance on centralized authorities." },
      { type: "text", value: "In Web2, large corporations control user data and platforms. Web3 shifts this control back to individuals, allowing them to own their digital identities and assets. This creates a more equitable digital environment." },
      { type: "image", value: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80", caption: "Visualization of decentralized internet infrastructure" },
      { type: "heading", value: "Core Principles of Web3" },
      { type: "text", value: "Web3 is built on principles such as decentralization, transparency, and trustless interactions. These principles are enabled by blockchain technology and smart contracts. Together, they create systems that do not require intermediaries." },
      { type: "text", value: "Ownership is another key aspect, with NFTs and tokens representing digital assets. Users can trade, sell, or utilize these assets freely. This opens up new economic opportunities." },
      { type: "image", value: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80", caption: "Blockchain nodes representing peer-to-peer network systems" },
      { type: "heading", value: "Web3 in Gaming and NFTs" },
      { type: "text", value: "Gaming is one of the most promising sectors for Web3 adoption. Players can earn rewards and own in-game assets as NFTs. This creates sustainable and engaging ecosystems." },
      { type: "text", value: "HyperTek is a prime example of Web3 in action. It integrates NFTs into gameplay, allowing players to monetize their time and effort. This transforms gaming into an economic activity." },
      { type: "heading", value: "The Future of Web3" },
      { type: "text", value: "Web3 is still in its early stages, but its impact is already being felt across industries. As technology advances, more applications will emerge. This includes decentralized finance, social media, and virtual worlds." },
      { type: "text", value: "Platforms like HyperTek demonstrate how Web3 can deliver real value today. By focusing on accessibility and usability, they are driving mainstream adoption. The future internet will likely be shaped by these innovations." },
    ],
    body: [],
    sections: [],
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
