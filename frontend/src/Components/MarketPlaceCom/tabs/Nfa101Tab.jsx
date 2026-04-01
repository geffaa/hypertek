import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../../Config";

// ── Animation ─────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.05, ease: "easeOut" } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

// ── Category badge colors ─────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Basics:     { bg: "rgba(0,80,200,0.25)",  border: "rgba(0,100,255,0.35)",  text: "rgba(120,180,255,0.9)"  },
  Security:   { bg: "rgba(0,150,120,0.2)",  border: "rgba(0,180,150,0.35)", text: "rgba(80,220,190,0.9)"   },
  Blockchain: { bg: "rgba(120,50,200,0.2)", border: "rgba(150,80,230,0.35)", text: "rgba(200,150,255,0.9)" },
  HyperTek:   { bg: "rgba(200,80,0,0.2)",   border: "rgba(230,100,0,0.35)", text: "rgba(255,160,80,0.9)"  },
};
function categoryStyle(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Basics;
}

// ── Static fallback ───────────────────────────────────────────────────────────
const STATIC_ARTICLES = [
  {
    _id: "s1", title: "What is an NFT?", category: "Basics", readTime: 12,
    description: "An NFT (Non-Fungible Token) is a unique digital asset verified on the blockchain. Each one is one-of-a-kind and cannot be replicated.",
    image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&w=800&q=80",
    body: [],
    sections: [
      { heading: "Understanding Non-Fungibility", paragraphs: ["NFT stands for Non-Fungible Token — a unique digital asset stored on a blockchain. Each NFT has a unique identifier proving authenticity.", "The word 'fungible' means interchangeable. Non-fungible means unique and irreplaceable — NFTs bring this concept to the digital realm."] },
      { heading: "How NFT Ownership Works", paragraphs: ["Think of it like a certificate of ownership for a digital item. The NFT lives on the blockchain, transparent and verifiable by anyone.", "When you purchase an NFT, the transaction is written to the blockchain. No centralized company can revoke this ownership."] },
      { heading: "Creator Economy & Royalties", paragraphs: ["Artists sell directly to collectors worldwide. Every resale triggers automatic royalty payments through smart contracts — typically 5-10%."] },
      { heading: "Real-World Utility", paragraphs: ["Beyond art, NFTs serve as access passes, game items, and financial instruments. In HyperTek, every in-game asset is an NFT.", "Gaming is the largest growth sector for NFTs — players' investments translate to real-world value."] },
      { heading: "Technical Standards", paragraphs: ["ERC-721 creates unique tokens; ERC-1155 supports both unique and semi-fungible tokens. Layer-2 networks have made minting affordable."] },
    ],
  },
  {
    _id: "s2", title: "What is Blockchain?", category: "Blockchain", readTime: 10,
    description: "A blockchain is a distributed ledger that records all transactions transparently and immutably.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    body: [],
    sections: [
      { heading: "Distributed Ledger Technology", paragraphs: ["A blockchain is a database shared across thousands of computers. Each block is cryptographically linked to the previous one, forming an unalterable chain.", "To tamper with any record, an attacker would need to control 50%+ of the network — computationally infeasible."] },
      { heading: "Ethereum & Smart Contracts", paragraphs: ["Ethereum is the most widely used blockchain for NFTs. Its proof-of-stake consensus reduced energy consumption by 99.9%."] },
      { heading: "Layer-2 Networks", paragraphs: ["HyperTek uses Base — transactions cost fractions of a cent and confirm in seconds."] },
      { heading: "Consensus Mechanisms", paragraphs: ["Proof-of-Stake requires validators to lock up crypto as collateral. Dishonest behavior results in their stake being 'slashed.'"] },
      { heading: "Permissionless & Open", paragraphs: ["Public blockchains are open to anyone. No government or company can prevent transactions or censor the ledger."] },
    ],
  },
  {
    _id: "s3", title: "How to Stay Protected in Web3", category: "Security", readTime: 10,
    description: "Never share your seed phrase. Use hardware wallets for high-value assets.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    body: [],
    sections: [
      { heading: "Protecting Your Seed Phrase", paragraphs: ["Your seed phrase should never be shared with anyone. Anyone who has it can drain your wallet instantly and irreversibly.", "Write it on paper and store securely. Some users engrave seed phrases on metal plates."] },
      { heading: "Verifying Contracts", paragraphs: ["Scammers create look-alike collections. Cross-reference contract addresses against official sources."] },
      { heading: "Hardware Wallets", paragraphs: ["Ledger and Trezor keep private keys offline. Use a hot wallet only with funds needed for that session."] },
      { heading: "Avoiding Phishing", paragraphs: ["Triple-check URLs before connecting your wallet. Be skeptical of unsolicited NFTs in your wallet.", "Never trust DMs from 'support teams' asking for wallet information."] },
      { heading: "Transaction Simulation", paragraphs: ["Modern wallets can simulate transactions before signing. If unexpected transfers appear, reject immediately."] },
    ],
  },
  {
    _id: "s4", title: "What is HyperTek?", category: "HyperTek", readTime: 10,
    description: "HyperTek is a play-to-earn NFT gaming universe where soldiers, land, weapons and vehicles are real digital assets you own.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    body: [],
    sections: [
      { heading: "The HyperTek Universe", paragraphs: ["HyperTek is a play-to-earn gaming universe on Base blockchain — racing, quests, and tactical strategy centered around owned NFTs and NFAs."] },
      { heading: "True Asset Ownership", paragraphs: ["Unlike traditional games, HyperTek assets persist on the blockchain independently. Even if HyperTek ceased to exist, your assets remain."] },
      { heading: "The NFA Standard", paragraphs: ["NFAs have a guaranteed minimum buyback value enforced by smart contract. The floor price increases by 5% of each sale above reserve."] },
      { heading: "Three Participant Types", paragraphs: ["Gamers earn rewards. Collectors acquire investments. Creators mint and sell, earning perpetual royalties."] },
      { heading: "Marketplace Ecosystem", paragraphs: ["Supports fixed-price, auctions, rentals, Quests, and Bounties — creating a player-driven economy.", "Sign up with email, get an auto-created wallet, pay with credit cards. No crypto experience required."] },
    ],
  },
];

// ── Article Card ──────────────────────────────────────────────────────────────
function ArticleCard({ article, index, onClick }) {
  const [imgError, setImgError] = useState(false);
  const cs = categoryStyle(article.category);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      onClick={() => onClick(article)}
      className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1"
      style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {!imgError && article.image ? (
          <img
            src={article.image}
            alt={article.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: `linear-gradient(135deg, ${article.gradientFrom || "#1a4fd6"}, ${article.gradientTo || "#0e2d8a"})` }}
          >
            {article.icon || "📚"}
          </div>
        )}
        {/* Category badge over image */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
          style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text, backdropFilter: "blur(8px)" }}
        >
          {article.category || "Basics"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
          {article.title}
        </h3>
        <p className="text-white/45 text-xs leading-relaxed line-clamp-3 flex-1">
          {article.description}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock className="w-3 h-3 text-white/25" />
          <span className="text-white/30 text-[10px]">{article.readTime || 3} min read</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Article Detail ────────────────────────────────────────────────────────────
function ArticleDetail({ article, onBack }) {
  const [imgError, setImgError] = useState(false);
  const cs = categoryStyle(article.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-xs font-medium transition-colors"
        style={{ color: "rgba(255,255,255,0.45)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Articles
      </button>

      {/* Hero image */}
      <div className="w-full rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: "21/9", maxHeight: 360 }}>
        {!imgError && article.image ? (
          <img
            src={article.image}
            alt={article.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-6xl"
            style={{ background: `linear-gradient(135deg, ${article.gradientFrom || "#1a4fd6"}, ${article.gradientTo || "#0e2d8a"})` }}
          >
            {article.icon || "📚"}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
          style={{ background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text }}
        >
          {article.category || "Basics"}
        </span>
        <span className="flex items-center gap-1 text-white/30 text-[10px]">
          <Clock className="w-3 h-3" />
          {article.readTime || 3} min read
        </span>
        <span className="flex items-center gap-1 text-white/30 text-[10px]">
          <BookOpen className="w-3 h-3" />
          NFAs / NFTs 101
        </span>
      </div>

      {/* Title */}
      <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-3 leading-tight">
        {article.title}
      </h1>

      {/* Short description */}
      <p className="text-white/55 text-sm leading-relaxed mb-8">
        {article.description}
      </p>

      {/* Divider */}
      <div className="mb-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      {/* Body — structured sections or flat paragraphs */}
      <div className="flex flex-col gap-8">
        {(article.sections && article.sections.length > 0) ? (
          article.sections.map((section, si) => (
            <div key={si}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: "rgba(0,80,255,0.25)",
                    border: "1px solid rgba(0,100,255,0.4)",
                    color: "rgba(100,180,255,0.9)",
                  }}
                >
                  {si + 1}
                </span>
                <h3 className="text-white/85 text-sm font-semibold">{section.heading}</h3>
              </div>
              <div className="pl-7 flex flex-col gap-3">
                {(section.paragraphs || []).map((para, pi) => (
                  <p key={pi} className="text-white/70 text-sm leading-[1.9] text-justify">{para}</p>
                ))}
              </div>
            </div>
          ))
        ) : (
          (article.body || []).map((para, i) => (
            <p key={i} className="text-white/70 text-sm leading-[1.9] text-justify">{para}</p>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function Nfa101Tab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("All");

  useEffect(() => {
    axios.get(`${BACKEND_BASE_URL}/api/v1/nft101`)
      .then(res => { if (res.data.success) setArticles(res.data.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = articles.length > 0 ? articles : STATIC_ARTICLES;
  const categories = ["All", ...Array.from(new Set(data.map(a => a.category).filter(Boolean)))];
  const filtered = filter === "All" ? data : data.filter(a => a.category === filter);

  return (
    <div className="py-8">
      <AnimatePresence mode="wait">
        {selected ? (
          <ArticleDetail key="detail" article={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Header */}
            <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-white/40" />
                <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">Education</span>
              </div>
              <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">NFAs / NFTs 101</h1>
              <p className="text-white/50 text-sm max-w-xl leading-relaxed">
                New to NFTs and Web3? Explore our articles to understand blockchain assets, wallets, security, and the HyperTek ecosystem.
              </p>
            </motion.div>

            {/* Category filter */}
            <motion.div
              className="flex gap-2 flex-wrap mb-6"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              {categories.map(cat => {
                const isActive = filter === cat;
                const cs = cat === "All" ? null : categoryStyle(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: isActive ? (cs?.bg || "rgba(0,60,200,0.3)") : "rgba(255,255,255,0.05)",
                      border: isActive ? `1px solid ${cs?.border || "rgba(0,100,255,0.4)"}` : "1px solid rgba(255,255,255,0.08)",
                      color: isActive ? (cs?.text || "rgba(150,200,255,0.95)") : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </motion.div>

            {/* Articles grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse" style={{ aspectRatio: "3/4", background: "rgba(255,255,255,0.04)" }} />
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                {filtered.map((article, i) => (
                  <ArticleCard
                    key={article._id || i}
                    article={article}
                    index={i}
                    onClick={setSelected}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
