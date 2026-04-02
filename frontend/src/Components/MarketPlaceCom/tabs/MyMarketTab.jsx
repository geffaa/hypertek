import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr || "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

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

const TYPE_COLORS = {
  Sale:     { bg: "rgba(0,200,100,0.12)",  text: "#4ade80" },
  Purchase: { bg: "rgba(0,80,255,0.15)",   text: "#60a5fa" },
  Transfer: { bg: "rgba(255,200,0,0.12)",  text: "#fbbf24" },
  Mint:     { bg: "rgba(160,0,255,0.12)",  text: "#c084fc" },
};

function ActivityBadge({ type }) {
  const style = TYPE_COLORS[type] || { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.6)" };
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.text}33` }}>
      {type || "—"}
    </span>
  );
}

export default function MyMarketTab() {
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const [items, setItems]         = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [filter, setFilter]       = useState("all"); // all | listed | unlisted

  const [activities, setActivities]     = useState([]);
  const [loadingAct, setLoadingAct]     = useState(false);
  const [actFilter, setActFilter]       = useState("all"); // all | Sale | Purchase | Transfer

  const { address: wagmiAddress } = useAccount();
  const walletAddress = wagmiAddress || user?.WalletAddress || user?.MetaMaskAddress;
  const userId = user?.id || user?._id;

  // ── Fetch owned NFAs ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!walletAddress || !token) return;
    const load = async () => {
      setLoadingItems(true);
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${walletAddress}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
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
        setLoadingItems(false);
      }
    };
    load();
  }, [walletAddress, token]);

  // ── Fetch user activity history ─────────────────────────────────────────────
  useEffect(() => {
    if (!userId || !token) return;
    const load = async () => {
      setLoadingAct(true);
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/activity/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setActivities(arr);
      } catch (err) {
        console.error("Activity fetch error:", err);
      } finally {
        setLoadingAct(false);
      }
    };
    load();
  }, [userId, token]);

  const filtered = items.filter((item) => {
    if (filter === "listed")   return item.listed;
    if (filter === "unlisted") return !item.listed;
    return true;
  });

  const filteredAct = activities.filter((a) => {
    if (actFilter === "all") return true;
    return (a.type || "").toLowerCase() === actFilter.toLowerCase();
  });

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!token || !isLoggedInUser) {
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
    <div className="py-8 flex flex-col gap-12">

      {/* ── MY COLLECTION ──────────────────────────────────────────────────────── */}
      <section>
        <motion.div className="mb-6" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-[2px] bg-white/40" />
            <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">My Assets</span>
          </div>
          <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">My Collection</h1>
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
          {!loadingItems && (
            <span className="ml-auto text-white/30 text-xs self-center">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Grid */}
        {loadingItems ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
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
      </section>

      {/* ── ACTIVITY HISTORY ───────────────────────────────────────────────────── */}
      <section>
        <motion.div className="mb-6" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-[2px] bg-white/40" />
            <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">History</span>
          </div>
          <h2 className="text-white font-[Goldman] font-bold text-xl sm:text-2xl mb-1">Activity</h2>
          <p className="text-white/50 text-sm leading-relaxed">Your transaction history on the marketplace.</p>
        </motion.div>

        {/* Activity type filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "Sale", "Purchase", "Transfer"].map((f) => (
            <button
              key={f}
              onClick={() => setActFilter(f)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: actFilter === f ? "#002AA8" : "rgba(255,255,255,0.06)",
                border: actFilter === f ? "1px solid rgba(0,80,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: actFilter === f ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
          {!loadingAct && (
            <span className="ml-auto text-white/30 text-xs self-center">
              {filteredAct.length} record{filteredAct.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingAct ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : filteredAct.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="text-4xl">📋</div>
            <p className="text-white/50 text-sm">No activity found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full min-w-[600px] text-white border-collapse text-sm">
              <thead>
                <tr style={{ background: "rgba(0,20,80,0.6)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Item", "Type", "From (Seller)", "To (Buyer)", "Price", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAct.map((act, i) => (
                  <tr
                    key={act._id || i}
                    className="transition-colors hover:bg-white/[0.03]"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {/* Item */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {act.image ? (
                          <img
                            src={getImageUrl(act.image)}
                            alt={act.name}
                            className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md flex-shrink-0"
                            style={{ background: "rgba(0,42,168,0.3)", border: "1px solid rgba(0,80,255,0.3)" }} />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-white/85 text-xs font-semibold truncate max-w-[120px]">
                            {act.name || "—"}
                          </span>
                          {act.itemType && (
                            <span className="text-white/35 text-[10px]">{act.itemType}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3">
                      <ActivityBadge type={act.type} />
                    </td>
                    {/* From (Seller) */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-white/60" title={act.seller}>
                        {truncateAddress(act.seller)}
                      </span>
                    </td>
                    {/* To (Buyer) */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-white/60" title={act.buyer}>
                        {truncateAddress(act.buyer)}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-white/80 font-semibold text-xs whitespace-nowrap">
                        {act.price != null ? `${act.price} USDC` : "—"}
                      </span>
                    </td>
                    {/* Time */}
                    <td className="px-4 py-3">
                      <span className="text-white/40 text-xs whitespace-nowrap">
                        {timeAgo(act.time || act.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
