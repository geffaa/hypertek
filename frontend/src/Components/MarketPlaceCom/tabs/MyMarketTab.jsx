import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

function ItemCard({ item, index }) {
  const name   = item.name || "Unnamed";
  const price  = item.priceETH ?? item.price ?? null;
  const isNFA  = item.isNFA || item.type === "NFA";
  const listed = item.listed;

  return (
    <motion.div
      variants={fadeUp}
      custom={index % 10}
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
        border: isNFA ? "1px solid rgba(0,80,255,0.4)" : "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div className="relative">
        <LazyImage
          src={item.image ? getImageUrl(item.image) : null}
          alt={name}
          fallback={popularFallback}
          className="w-full aspect-square"
          imgClassName="object-cover"
        />
        {isNFA && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
            style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.5)" }}>
            NFA
          </div>
        )}
        <div
          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-semibold ${listed ? "text-green-300" : "text-white/50"}`}
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {listed ? "Listed" : "Unlisted"}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-white/80 text-xs font-semibold truncate">{name}</p>
        <p className="text-white/40 text-[11px]">{price != null ? `${price} USDC` : "—"}</p>
      </div>
    </motion.div>
  );
}

export default function MyMarketTab() {
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter]   = useState("all"); // all | listed | unlisted

  const walletAddress = user?.walletAddress || user?.wallet;

  useEffect(() => {
    if (!walletAddress || !token) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${walletAddress}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          // Flatten all sub-collections from parent collections
          const all = [];
          (res.data.nfts || res.data.collections || []).forEach((parent) => {
            (parent.subCollections || []).forEach((sub) => {
              all.push({
                ...sub,
                parentName:     parent.collection?.name || "",
                parentCategory: parent.category,
              });
            });
          });
          setItems(all);
        }
      } catch (err) {
        console.error("MyMarket fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [walletAddress, token]);

  const filtered = items.filter((item) => {
    if (filter === "listed")   return item.listed;
    if (filter === "unlisted") return !item.listed;
    return true;
  });

  // Not logged in
  if (!isLoggedInUser && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
        <div className="text-5xl">🔐</div>
        <h2 className="text-white font-[Goldman] font-bold text-xl">Sign in to view your collection</h2>
        <p className="text-white/45 text-sm max-w-xs leading-relaxed">
          Log in to see your NFAs, NFCs, and manage your marketplace listings.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-125"
          style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-white/40" />
          <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">My Collection</span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">My Market</h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          View and manage your NFAs and NFCs.
        </p>
      </motion.div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {["all", "listed", "unlisted"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 capitalize"
            style={{
              background: filter === f ? "#002AA8" : "rgba(255,255,255,0.06)",
              border: filter === f ? "1px solid rgba(0,80,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
              color: filter === f ? "#fff" : "rgba(255,255,255,0.6)",
            }}
          >
            {f}
          </button>
        ))}
        {!loading && (
          <span className="ml-auto text-white/30 text-xs self-center">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="text-4xl">📭</div>
          <p className="text-white/50 text-sm">
            {filter === "listed" ? "No listed items." : filter === "unlisted" ? "No unlisted items." : "No items in your collection yet."}
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {filtered.map((item, i) => (
            <ItemCard key={item._id || i} item={item} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
