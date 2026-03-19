import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

// Static fallback cards if backend has no content yet
const STATIC_CARDS = [
  { icon: "🧬", title: "What is an NFA?", desc: "A Non-Fungible Asset — a blockchain item with a guaranteed minimum buyback value from HyperTek." },
  { icon: "🪙", title: "What is an NFC?", desc: "A Non-Fungible Collectible — a blockchain collectible without buyback guarantee. Created by HyperTek or users." },
  { icon: "🛡️", title: "NFA Buyback Guarantee", desc: "If your NFA sells below its minimum value, HyperTek buys it back. Your investment is protected." },
  { icon: "📈", title: "Buyback Value Growth", desc: "Every time an NFA sells above reserve, its minimum buyback value increases by 5% of the sale price." },
  { icon: "🎖️", title: "NFA Frame", desc: "NFAs carry a special visual frame on the marketplace, distinguishing them from regular NFCs at a glance." },
  { icon: "💸", title: "Commission Structure", desc: "NFA: 4% artist royalty + 5% buyback fund + 11% platform = 20% total. Seller receives 80%." },
  { icon: "🔄", title: "Annual CPI Adjustment", desc: "NFA minimum buyback values are adjusted annually using CPI — your asset keeps pace with inflation." },
  { icon: "🎮", title: "Game Utility", desc: "All NFAs and NFCs unlock in-game content within the HyperTek universe. They are play-to-earn assets." },
  { icon: "🔐", title: "Custodial Wallet", desc: "No crypto wallet? No problem. HyperTek auto-creates one for you on signup. Pay with card, own on-chain." },
  { icon: "💼", title: "Your Withdrawal Options", desc: "When you sell, choose your payout: USDC, bank transfer, platform balance, or Hyper Bucks." },
];

function EduCard({ icon, title, desc, image, link, index }) {
  const inner = (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="flex flex-col rounded-xl overflow-hidden h-full cursor-pointer hover:brightness-110 transition-all duration-200"
      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {image ? (
        <LazyImage
          src={getImageUrl(image)}
          alt={title}
          className="h-24 w-full"
          imgClassName="object-cover"
        />
      ) : (
        <div className="h-20 flex items-center justify-center"
          style={{ background: "linear-gradient(to bottom, #1a4fd6, #0e2d8a)" }}>
          <span className="text-3xl">{icon || "📚"}</span>
        </div>
      )}
      <div className="px-3 py-3 flex flex-col gap-1.5 flex-1"
        style={{ background: "rgba(0,0,0,0.55)" }}>
        <p className="text-white text-xs font-semibold leading-snug">{title}</p>
        {desc && <p className="text-white/45 text-[10px] leading-relaxed line-clamp-3">{desc}</p>}
      </div>
    </motion.div>
  );

  return link ? <Link to={link}>{inner}</Link> : inner;
}

export default function Nfa101Tab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_BASE_URL}/api/v1/nft101`)
      .then((res) => { if (res.data.success) setItems(res.data.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = items.length > 0 ? items : STATIC_CARDS;

  return (
    <div className="py-8">
      <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-white/40" />
          <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">Education</span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">NFAs / NFCs 101</h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          New to NFAs and NFCs? Learn everything about Web3 assets, buyback guarantees, and how the HyperTek ecosystem works.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[140px] rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {cards.map((card, i) => (
            <EduCard key={card._id || i} {...card} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
