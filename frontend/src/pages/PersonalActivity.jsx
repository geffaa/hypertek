import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock } from "lucide-react";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import LazyImage from "../Components/Common/LazyImage";
import popularFallback from "../assets/images/popular/popolar.png";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";

const TYPE_ICON = {
  Sale:        <ArrowUpRight  className="w-3.5 h-3.5 text-green-400" />,
  Buy:         <ArrowDownLeft className="w-3.5 h-3.5 text-blue-400" />,
  Trade:       <RefreshCw     className="w-3.5 h-3.5 text-amber-400" />,
  NFT:         <ArrowUpRight  className="w-3.5 h-3.5 text-purple-400" />,
  Collectible: <ArrowUpRight  className="w-3.5 h-3.5 text-pink-400" />,
  Land:        <ArrowUpRight  className="w-3.5 h-3.5 text-emerald-400" />,
};

const TYPE_COLOR = {
  Sale:        "text-green-400  bg-green-400/10  border-green-400/20",
  Buy:         "text-blue-400   bg-blue-400/10   border-blue-400/20",
  Trade:       "text-amber-400  bg-amber-400/10  border-amber-400/20",
  NFT:         "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Collectible: "text-pink-400   bg-pink-400/10   border-pink-400/20",
  Land:        "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000)   return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function shortAddr(addr) {
  if (!addr || addr.length < 10) return addr || "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const FILTERS = ["All", "Sale", "Buy", "Trade", "NFT", "Land", "Collectible"];

export default function PersonalActivity() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");
  const [page, setPage]       = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    axios.get(`${BACKEND_BASE_URL}/api/v1/activity/getActivity`)
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setRows(data);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullScreenLoader />;

  const filtered = filter === "All"
    ? rows
    : rows.filter(r => (r.type || "").toLowerCase() === filter.toLowerCase());

  const pages   = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <div className="mt-[72px]">
        <MarketplaceBanner
          titleOverride="Transaction History"
          descOverride="A full record of all marketplace activity across your account."
          stats={[
            { num: rows.length,                                 label: "Total Transactions" },
            { num: rows.filter(r => r.type === "Sale").length,  label: "Sales"  },
            { num: rows.filter(r => r.type === "Buy").length,   label: "Buys"   },
            { num: rows.filter(r => r.type === "Trade").length, label: "Trades" },
          ]}
        />
      </div>

      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={filter === f
                ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.5)", color: "#fff" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }
              }
            >{f}</button>
          ))}
          <span className="ml-auto text-white/25 text-xs">{filtered.length} transactions</span>
        </div>

        {/* Table */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/25 gap-3">
            <Clock className="w-10 h-10 opacity-30" />
            <p className="text-sm">No transactions yet</p>
            <Link to="/market-place" className="mt-2 px-4 py-2 rounded-lg text-xs text-white"
              style={{ background: "rgba(0,42,168,0.6)" }}>
              Go to Marketplace
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-white/30"
                style={{ background: "rgba(0,20,80,0.5)" }}>
                <span>Item</span>
                <span>Type</span>
                <span>From</span>
                <span>To</span>
                <span className="text-right">Price</span>
                <span className="text-right">Time</span>
              </div>

              {/* Rows */}
              {visible.map((item, i) => {
                const typeCls = TYPE_COLOR[item.type] || "text-white/40 bg-white/5 border-white/10";
                const icon    = TYPE_ICON[item.type];
                const imgSrc  = item.image ? getImageUrl(item.image) : null;

                return (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 items-center text-sm transition-colors"
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Item */}
                    <div className="flex items-center gap-3 min-w-0">
                      <LazyImage
                        src={imgSrc}
                        fallback={popularFallback}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg flex-shrink-0"
                        imgClassName="object-cover"
                      />
                      <span className="text-white/85 text-[13px] font-medium truncate">{item.name || "—"}</span>
                    </div>

                    {/* Type badge */}
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeCls}`}>
                        {icon}{item.type || "—"}
                      </span>
                    </div>

                    {/* From (seller) */}
                    <span className="text-white/45 text-[12px] font-mono truncate"
                      title={item.seller}>{shortAddr(item.seller)}</span>

                    {/* To (buyer) */}
                    <span className="text-white/45 text-[12px] font-mono truncate"
                      title={item.buyer}>{shortAddr(item.buyer)}</span>

                    {/* Price */}
                    <span className="text-white/80 text-[13px] font-semibold text-right">
                      {item.price ? `$${parseFloat(Number(item.price).toPrecision(4))}` : "—"}
                    </span>

                    {/* Time */}
                    <span className="text-white/30 text-[11px] text-right whitespace-nowrap">
                      {item.time ? timeAgo(item.time) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.07)" }}>Prev</button>
                <span className="text-white/30 text-xs">Page {page} of {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.07)" }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
