import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Swords, Package, Plus, X, Clock, CheckCircle2, Circle } from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

// ── Trade / Quest card ────────────────────────────────────────────────────────
function TradeCard({ trade, onAccept, onComplete, onCancel, currentWallet }) {
  const isQuest = trade.type === "quest";
  const isPoster = trade.posterWallet === currentWallet;
  const isAcceptor = trade.acceptedByWallet === currentWallet;
  const statusColor = { open: "text-green-400", accepted: "text-amber-300", completed: "text-blue-400", cancelled: "text-white/25", expired: "text-red-400" }[trade.status] || "text-white/40";

  return (
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: `1px solid ${isQuest ? "rgba(180,120,0,0.35)" : "rgba(255,255,255,0.09)"}`,
      }}>
      {trade.image && (
        <LazyImage src={getImageUrl(trade.image)} alt={trade.title} fallback={popularFallback}
          className="w-full h-32" imgClassName="object-cover" />
      )}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ background: isQuest ? "rgba(180,120,0,0.3)" : "rgba(255,255,255,0.08)", color: isQuest ? "#f0a020" : "rgba(255,255,255,0.5)" }}>
            {trade.type}
          </span>
          <span className={`text-[10px] font-bold uppercase ml-auto ${statusColor}`}>{trade.status}</span>
        </div>

        <p className="text-white/90 text-sm font-semibold truncate">{trade.title}</p>
        <p className="text-white/40 text-[11px] leading-snug line-clamp-2">{trade.description}</p>

        {isQuest ? (
          <p className="text-amber-300 font-bold text-sm">Reward: {trade.reward} USDC</p>
        ) : (
          <div className="text-xs space-y-0.5">
            <p className="text-white/40">Offering: <span className="text-white/70">{trade.offering}</span></p>
            <p className="text-white/40">Wanting: <span className="text-white/70">{trade.requesting}</span></p>
          </div>
        )}

        <p className="text-white/25 text-[10px]">by {trade.posterName}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          {trade.status === "open" && !isPoster && (
            <button onClick={() => onAccept(trade)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
              {isQuest ? "Accept Quest" : "Accept Trade"}
            </button>
          )}
          {trade.status === "accepted" && isPoster && (
            <button onClick={() => onComplete(trade)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-green-300"
              style={{ background: "rgba(0,80,0,0.35)", border: "1px solid rgba(0,160,0,0.3)" }}>
              Mark Complete
            </button>
          )}
          {["open", "accepted"].includes(trade.status) && isPoster && (
            <button onClick={() => onCancel(trade)} className="px-2 py-1.5 rounded-lg text-xs text-red-400"
              style={{ background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.2)" }}>
              Cancel
            </button>
          )}
          {(trade.status === "completed" || trade.status === "cancelled" || (!isPoster && !isAcceptor)) && trade.status !== "open" && (
            <span className="text-white/25 text-xs italic">No actions available</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create modal ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onSuccess, wallet }) {
  const [type, setType] = useState("trade");
  const [form, setForm] = useState({ title: "", description: "", offering: "", requesting: "", reward: "", image: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!wallet) return setErr("Connect wallet first");
    setLoading(true); setErr("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, type, posterWallet: wallet, reward: form.reward ? Number(form.reward) : 0 }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      onSuccess();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const iCls = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none placeholder-white/25";
  const iSt = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 relative my-auto" style={{ background: "#0a0b1a", border: "1px solid rgba(255,255,255,0.12)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          {type === "quest" ? <Swords className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          Post {type === "quest" ? "Quest" : "Trade"}
        </h3>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {["trade", "quest"].map(t => (
            <button key={t} onClick={() => setType(t)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={type === t
                ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.5)", color: "#fff" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" }
              }>{t}</button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required placeholder="Title *" value={form.title} onChange={e => set("title", e.target.value)} className={iCls} style={iSt} />
          <textarea placeholder="Description" value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={iCls} style={iSt} />
          {type === "trade" ? (
            <>
              <input required placeholder="What you're offering *" value={form.offering} onChange={e => set("offering", e.target.value)} className={iCls} style={iSt} />
              <input required placeholder="What you want in return *" value={form.requesting} onChange={e => set("requesting", e.target.value)} className={iCls} style={iSt} />
            </>
          ) : (
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Reward (USDC) *</label>
              <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={form.reward} onChange={e => set("reward", e.target.value)} className={iCls} style={iSt} />
            </div>
          )}
          <input placeholder="Image URL (optional)" value={form.image} onChange={e => set("image", e.target.value)} className={iCls} style={iSt} />
          <input placeholder="Category (optional)" value={form.category} onChange={e => set("category", e.target.value)} className={iCls} style={iSt} />
          <p className="text-white/30 text-[10px]">Listing fee: $2 USDC · Expires in 30 days</p>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" disabled={loading} className="py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(0,42,168,0.8)" }}>
            {loading ? "Posting…" : `Post ${type === "quest" ? "Quest" : "Trade"}`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TYPE_FILTERS = ["all", "trade", "quest"];
const STATUS_FILTERS = ["open", "accepted", "completed"];

export default function QuestsTab() {
  const { user, isLoggedInUser } = useSelector(s => s.auth);
  const wallet = user?.walletAddress || user?.wallet || "";

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, page, limit: LIMIT });
      if (typeFilter !== "all") params.set("type", typeFilter);
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade?${params}`);
      const data = await r.json();
      setTrades(data.trades || []);
      setTotal(data.total || 0);
    } catch { setTrades([]); }
    finally { setLoading(false); }
  }, [typeFilter, statusFilter, page]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter]);

  async function apiAction(method, url) {
    const token = localStorage.getItem("token");
    const r = await fetch(`${BACKEND_BASE_URL}${url}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: method !== "GET" ? JSON.stringify({ acceptedByWallet: wallet }) : undefined,
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    fetchTrades();
  }

  async function handleAccept(trade) {
    if (!isLoggedInUser) return alert("Log in first");
    if (!wallet) return alert("Connect wallet first");
    try { await apiAction("POST", `/api/v1/trade/${trade._id}/accept`); }
    catch (e) { alert(e.message); }
  }
  async function handleComplete(trade) {
    if (!confirm("Mark this as completed?")) return;
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade/${trade._id}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      fetchTrades();
    } catch (e) { alert(e.message); }
  }
  async function handleCancel(trade) {
    if (!confirm("Cancel this listing?")) return;
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade/${trade._id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      fetchTrades();
    } catch (e) { alert(e.message); }
  }

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-white/60" />
          <h2 className="text-white font-bold text-lg">Quests / Trades</h2>
          <span className="text-white/30 text-sm">{total} listings</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          <div className="flex gap-1">
            {TYPE_FILTERS.map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className="px-2.5 py-1 rounded-full text-xs capitalize"
                style={typeFilter === f
                  ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.5)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                }>{f}</button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} className="px-2.5 py-1 rounded-full text-xs capitalize"
                style={statusFilter === f
                  ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
                }>{f}</button>
            ))}
          </div>
          {isLoggedInUser && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
              <Plus className="w-3.5 h-3.5" /> Post
            </button>
          )}
        </div>
      </div>

      {/* Info row */}
      <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><Clock className="w-3 h-3 inline mr-1" />Listings expire in 30 days</span>
        <span><Circle className="w-3 h-3 inline mr-1" />Listing fee: $2 USDC</span>
        <span><CheckCircle2 className="w-3 h-3 inline mr-1" />Poster marks completion</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl h-44 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
        </div>
      ) : trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/25">
          <Swords className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No {statusFilter} {typeFilter !== "all" ? typeFilter : "listings"}</p>
          {isLoggedInUser && statusFilter === "open" && (
            <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 rounded-lg text-xs text-white"
              style={{ background: "rgba(0,42,168,0.6)" }}>Be the first to post</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trades.map(t => (
            <TradeCard key={t._id} trade={t} currentWallet={wallet}
              onAccept={handleAccept} onComplete={handleComplete} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Prev</button>
          <span className="text-white/30 text-xs">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Next</button>
        </div>
      )}

      {showCreate && <CreateModal wallet={wallet} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchTrades(); }} />}
    </div>
  );
}
