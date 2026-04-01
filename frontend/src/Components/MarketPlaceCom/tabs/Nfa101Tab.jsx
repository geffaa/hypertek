import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
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
  },
  {
    _id: "s2", title: "What is Blockchain?", category: "Blockchain", readTime: 10,
    description: "A blockchain is a distributed ledger that records all transactions transparently and immutably.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "s3", title: "How to Stay Protected in Web3", category: "Security", readTime: 10,
    description: "Never share your seed phrase. Use hardware wallets for high-value assets.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  },
  {
    _id: "s4", title: "What is HyperTek?", category: "HyperTek", readTime: 10,
    description: "HyperTek is a play-to-earn NFT gaming universe where soldiers, land, weapons and vehicles are real digital assets you own.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
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

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function Nfa101Tab() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
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

  const handleArticleClick = (article) => {
    // Navigate to dedicated article page; static fallback articles stay inline
    if (article._id && !article._id.startsWith("s")) {
      navigate(`/learn/${article._id}`);
    }
  };

  return (
    <div className="py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
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
                onClick={handleArticleClick}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
