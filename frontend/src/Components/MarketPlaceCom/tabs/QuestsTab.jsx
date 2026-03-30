import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { Swords, Package, Plus, X, Clock, CheckCircle2, Gamepad2, Info, MapPin, ArrowRightLeft, Star, Lock } from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

// ── Accept Quest Modal ────────────────────────────────────────────────────────
// phase: "briefing" | "confirm" | "accepted"
function AcceptQuestModal({ trade, onClose }) {
  const [phase, setPhase] = useState("briefing");
  const isQuest = trade.type === "quest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        style={{ background: "#080916", border: `1px solid ${isQuest ? "rgba(180,120,0,0.3)" : "rgba(255,255,255,0.15)"}` }}>
        <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white z-10">
          <X className="w-4 h-4" />
        </button>

        {/* ── BRIEFING phase ── */}
        {phase === "briefing" && (
          <div className="p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              {isQuest
                ? <Swords className="w-4 h-4 text-amber-400" />
                : <ArrowRightLeft className="w-4 h-4 text-blue-400" />}
              <span className="text-white font-bold text-sm">
                {isQuest ? "Mission Briefing" : "Trade Proposal"}
              </span>
              <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                style={isQuest
                  ? { background: "rgba(180,120,0,0.3)", color: "#f0a020" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                {trade.type}
              </span>
            </div>

            {/* Title + description */}
            <div className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-white font-semibold text-sm">{trade.title}</p>
              <p className="text-white/50 text-xs leading-relaxed">{trade.description}</p>
              <p className="text-white/30 text-[10px] mt-1">Posted by {trade.posterName}</p>
            </div>

            {/* Quest: objective summary | Trade: what's exchanged */}
            {isQuest ? (
              <div className="rounded-xl p-3 flex flex-col gap-2"
                style={{ background: "rgba(180,120,0,0.08)", border: "1px solid rgba(180,120,0,0.2)" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300/80 text-[11px] font-semibold">Objectives</span>
                </div>
                <p className="text-white/45 text-[10px] leading-relaxed">
                  Complete the mission as described. Submit proof of completion through the in-game portal.
                  The poster will verify and release the reward to your account.
                </p>
                <div className="flex items-center gap-2 mt-1 pt-2"
                  style={{ borderTop: "1px solid rgba(255,200,0,0.1)" }}>
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white/40 text-[10px]">Reward: </span>
                  <span className="text-amber-300 text-[11px] font-semibold">
                    {trade.reward > 0 ? `${trade.reward} Hyper Bucks` : "In-game materials upon completion"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-3 flex flex-col gap-2"
                style={{ background: "rgba(0,42,168,0.08)", border: "1px solid rgba(0,80,255,0.2)" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-300/80 text-[11px] font-semibold">Exchange Details</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[10px]">You receive</span>
                    <span className="text-green-300 text-[11px] font-semibold">{trade.offering}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[10px]">You give</span>
                    <span className="text-red-300/80 text-[11px] font-semibold">{trade.requesting}</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => setPhase("confirm")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={isQuest
                ? { background: "rgba(160,100,0,0.8)", border: "1px solid rgba(200,140,0,0.4)" }
                : { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.4)" }}>
              {isQuest ? "Accept Mission" : "Propose Trade"}
            </button>
            <p className="text-white/20 text-[10px] text-center">20% platform commission applies</p>
          </div>
        )}

        {/* ── CONFIRM phase ── */}
        {phase === "confirm" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {isQuest ? <Swords className="w-4 h-4 text-amber-400" /> : <ArrowRightLeft className="w-4 h-4 text-blue-400" />}
              <span className="text-white font-bold text-sm">
                {isQuest ? "Confirm Deployment" : "Confirm Trade Proposal"}
              </span>
            </div>
            <div className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">{isQuest ? "Mission" : "Trade"}</span>
                <span className="text-white/80 text-xs font-semibold truncate max-w-[160px]">{trade.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Posted by</span>
                <span className="text-white/60 text-xs">{trade.posterName}</span>
              </div>
              {isQuest && trade.reward > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs">Reward</span>
                  <span className="text-amber-300 text-xs font-semibold">{trade.reward} Hyper Bucks</span>
                </div>
              )}
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-[10px] leading-relaxed">
                {isQuest
                  ? "By accepting, you commit to completing this mission. The poster will be notified and must confirm completion before the reward is released."
                  : "Your trade proposal will be sent to the poster. They will be notified and must confirm the exchange before items are transferred."}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPhase("briefing")} className="flex-1 py-2 rounded-xl text-sm text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Back
              </button>
              <button onClick={() => setPhase("accepted")}
                className="flex-2 flex-grow py-2 rounded-xl text-sm font-bold text-white"
                style={isQuest
                  ? { background: "rgba(160,100,0,0.8)", border: "1px solid rgba(200,140,0,0.4)" }
                  : { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.4)" }}>
                {isQuest ? "Deploy" : "Send Proposal"}
              </button>
            </div>
          </div>
        )}

        {/* ── ACCEPTED phase ── */}
        {phase === "accepted" && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={isQuest
                ? { background: "rgba(180,120,0,0.15)", border: "2px solid rgba(200,160,0,0.5)" }
                : { background: "rgba(0,80,255,0.15)", border: "2px solid rgba(0,120,255,0.5)" }}>
              <CheckCircle2 className={`w-8 h-8 ${isQuest ? "text-amber-400" : "text-blue-400"}`} />
            </div>
            <div>
              <p className={`text-xl font-[Goldman] font-bold mb-1 ${isQuest ? "text-amber-300" : "text-blue-300"}`}>
                {isQuest ? "Mission Active!" : "Proposal Sent!"}
              </p>
              <p className="text-white/50 text-xs">
                {isQuest ? "You're deployed on this mission" : `${trade.posterName} has been notified`}
              </p>
            </div>
            <div className="w-full rounded-xl p-4 flex flex-col gap-2 text-left"
              style={isQuest
                ? { background: "rgba(180,120,0,0.08)", border: "1px solid rgba(180,120,0,0.2)" }
                : { background: "rgba(0,42,168,0.08)", border: "1px solid rgba(0,80,255,0.2)" }}>
              {isQuest ? (
                <>
                  <p className="text-white/50 text-[11px] leading-relaxed">
                    Complete the objectives described in the mission briefing. Once done, submit proof via the in-game portal (available at launch).
                  </p>
                  <p className="text-white/30 text-[10px] mt-1">
                    ⏱ This listing expires in 30 days if not completed.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white/50 text-[11px] leading-relaxed">
                    The trade poster will review your proposal and arrange the exchange. Check your notifications for their response.
                  </p>
                  <p className="text-white/30 text-[10px] mt-1">
                    ⏱ Proposals expire in 30 days if not confirmed.
                  </p>
                </>
              )}
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={isQuest
                ? { background: "rgba(160,100,0,0.6)", border: "1px solid rgba(200,140,0,0.3)" }
                : { background: "rgba(0,42,168,0.6)", border: "1px solid rgba(0,80,255,0.3)" }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Trade / Quest card ────────────────────────────────────────────────────────
function TradeCard({ trade, onAccept: _onAccept, onComplete: _onComplete, onCancel: _onCancel, currentWallet: _currentWallet }) {
  const isQuest = trade.type === "quest";
  // const isPoster = trade.posterWallet === currentWallet;
  // const isAcceptor = trade.acceptedByWallet === currentWallet;
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

        {!isQuest && (
          <div className="text-xs space-y-0.5">
            <p className="text-white/40 text-[10px]">Offering: <span className="text-white/70">{trade.offering}</span></p>
            <p className="text-white/40 text-[10px]">Wanting: <span className="text-white/70">{trade.requesting}</span></p>
          </div>
        )}

        {isQuest && trade.reward > 0 && (
          <p className="text-amber-300/80 text-[11px] font-semibold">
            <Star className="w-3 h-3 inline mr-0.5" />{trade.reward} Hyper Bucks
          </p>
        )}

        <p className="text-white/25 text-[10px]">by {trade.posterName}</p>

        {/* Action buttons — visible but disabled until in-game quest/trade system is live */}
        {trade.status === "open" && (
          <button
            disabled
            className="mt-auto w-full py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)" }}
          >
            {/* onClick={() => onAccept(trade)} */}
            {isQuest ? "Accept Mission" : "Accept Trade"}
          </button>
        )}
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
              <label className="text-white/40 text-[10px] mb-1 block">Reward (Hyper Bucks) *</label>
              <input required type="number" min="1" placeholder="e.g. 500" value={form.reward} onChange={e => set("reward", e.target.value)} className={iCls} style={iSt} />
              {form.reward && <p className="text-white/30 text-[10px] mt-1">Claimer receives {Math.round(Number(form.reward) * 0.8)} HB after 20% commission</p>}
            </div>
          )}
          <input placeholder="Image URL (optional)" value={form.image} onChange={e => set("image", e.target.value)} className={iCls} style={iSt} />
          <input placeholder="Category (optional)" value={form.category} onChange={e => set("category", e.target.value)} className={iCls} style={iSt} />
          <p className="text-white/30 text-[10px]">Listing fee: 500 Hyper Bucks · Expires in 30 days</p>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" disabled={loading} className="py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(0,42,168,0.8)" }}>
            {loading ? "Posting…" : `Post ${type === "quest" ? "Quest" : "Trade"}`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Investor Note Banner ──────────────────────────────────────────────────────
function InvestorBanner() {
  return (
    <div className="mb-6 rounded-xl overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, rgba(180,120,0,0.1) 0%, rgba(0,42,168,0.06) 100%)", border: "1px solid rgba(180,120,0,0.15)" }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-300/90 text-xs font-semibold">In-Game Feature Preview</p>
          <p className="text-white/40 text-[11px] leading-snug">
            The Quests & Trades system will be fully live in-game at launch. Items shown here are seeded samples for investor/user showcase.
          </p>
        </div>
        <Info className="w-4 h-4 text-white/20 flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Static preview data ───────────────────────────────────────────────────────
const PREVIEW_TRADES = [
  { _id: "pt-1", type: "quest", status: "open", title: "Retrieve the Lost Data Core", description: "Infiltrate the abandoned tech facility in Sector 7 and recover the encrypted data core. Beware of AI sentinels guarding the perimeter.", reward: 500, posterName: "Commander Alpha", offering: "", requesting: "" },
  { _id: "pt-2", type: "trade", status: "open", title: "Dual Badge Swap", description: "Have Commander's Cross and Iron Shield Badge. Looking for Star of Honour. Will offer both badges.", offering: "Commander's Cross + Iron Shield Badge", requesting: "Star of Honour", reward: 0, posterName: "MedalCollector" },
  { _id: "pt-3", type: "quest", status: "open", title: "Hunt the Rogue AI — Intel Required", description: "Track down the rogue AI entity 'NEXUS-7' across three map zones. Deliver location coordinates for reward. Time-limited mission.", reward: 1000, posterName: "Intel Division", offering: "", requesting: "" },
  { _id: "pt-4", type: "trade", status: "open", title: "Viper Fighter for Land Plot", description: "Trading my Viper Fighter Mk1 spaceship in exchange for a strategic land plot. Desert or Arctic locations preferred.", offering: "Viper Fighter Mk1", requesting: "Any Land Plot (Desert/Arctic)", reward: 0, posterName: "PilotZero" },
  { _id: "pt-5", type: "quest", status: "open", title: "Defend Outpost Alpha — Wave Survival", description: "Hold Outpost Alpha for 10 waves against enemy forces. Minimum squad of 3 required. Bonus reward for zero casualties.", reward: 750, posterName: "General Haze", offering: "", requesting: "" },
  { _id: "pt-6", type: "trade", status: "open", title: "Assault Rifle for Stealth Kit", description: "Looking to trade my Hyper Assault Rifle for a Stealth Composite Vest. Willing to negotiate.", offering: "Hyper Assault Rifle", requesting: "Stealth Composite Vest", reward: 0, posterName: "ShadowTrader_99" },
  { _id: "pt-7", type: "quest", status: "open", title: "Eliminate Rogue Commander Vex", description: "High-priority target operating in Sector 9. Known for ambushing supply convoys. Eliminate and provide proof of defeat.", reward: 300, posterName: "HQ Command", offering: "", requesting: "" },
  { _id: "pt-8", type: "quest", status: "open", title: "Escort VIP Through Warzone", description: "Safely escort Dr. Chen through contested Sector 12 to the extraction point. Priority one mission — no casualties.", reward: 200, posterName: "Defence Ministry", offering: "", requesting: "" },
  { _id: "pt-9", type: "trade", status: "open", title: "Nano-Mesh Vest for Plasma Pistol", description: "I have a Nano-Mesh Vest that I want to swap for a Plasma Pistol Mk2. Fair trade — both items same tier.", offering: "Nano-Mesh Vest", requesting: "Plasma Pistol Mk2", reward: 0, posterName: "ArmorDealer_X" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const TYPE_FILTERS = ["all", "trade", "quest"];
const STATUS_FILTERS = ["open", "accepted", "completed"];

export default function QuestsTab() {
  const { user, isLoggedInUser } = useSelector(s => s.auth);
  const { address: wagmiAddress } = useAccount();
  const wallet = wagmiAddress || user?.WalletAddress || user?.MetaMaskAddress || "";

  const [trades, setTrades]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [typeFilter, setTypeFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate]     = useState(false);
  const [acceptTrade, setAcceptTrade]   = useState(null);
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const LIMIT = 12;

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, page, limit: LIMIT });
      if (typeFilter !== "all") params.set("type", typeFilter);
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade?${params}`);
      const data = await r.json();
      const fetched = data.trades || [];
      if (fetched.length > 0) {
        setTrades(fetched); setTotal(data.total || 0);
      } else if (statusFilter === "open" && page === 1) {
        setTrades(PREVIEW_TRADES); setTotal(PREVIEW_TRADES.length);
      } else {
        setTrades([]); setTotal(0);
      }
    } catch {
      if (statusFilter === "open" && page === 1) {
        setTrades(PREVIEW_TRADES); setTotal(PREVIEW_TRADES.length);
      } else { setTrades([]); }
    }
    finally { setLoading(false); }
  }, [typeFilter, statusFilter, page]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter]);

  async function handleComplete(trade) {
    if (!confirm("Mark this as completed?")) return;
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade/${trade._id}/complete`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      fetchTrades();
    } catch (e) { alert(e.message); }
  }
  async function handleCancel(trade) {
    if (!confirm("Cancel this listing?")) return;
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade/${trade._id}/cancel`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      fetchTrades();
    } catch (e) { alert(e.message); }
  }

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-white/60" />
          <h2 className="text-white font-bold text-lg">Quests / Trades</h2>
          <span className="text-white/30 text-sm">{total} listings</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {TYPE_FILTERS.map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className="px-2.5 py-1 rounded-full text-xs capitalize"
                style={typeFilter === f
                  ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.5)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                }>{f}</button>
            ))}
          </div>
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

      <InvestorBanner />

      {/* Info row */}
      <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><Clock className="w-3 h-3 inline mr-1" />Listings expire in 30 days</span>
        <span><CheckCircle2 className="w-3 h-3 inline mr-1" />Listing fee: 500 Hyper Bucks</span>
        <span><Swords className="w-3 h-3 inline mr-1" />Poster marks completion</span>
      </div>

      {/* Grid — semi-transparent while locked */}
      <div className="opacity-50 pointer-events-none select-none">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl h-44 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/25">
            <Swords className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No {statusFilter} {typeFilter !== "all" ? typeFilter : "listings"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trades.map(t => (
              <TradeCard key={t._id} trade={t} currentWallet={wallet}
                onAccept={t => { setAcceptTrade(t); }}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Prev</button>
          <span className="text-white/30 text-xs">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Next</button>
        </div>
      )}

      {/* Centered lock message box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
        <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl text-center"
          style={{ background: "rgba(6,8,22,0.82)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", maxWidth: 400 }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Lock className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white font-bold text-base leading-snug">
            Hyper Tek Gaming content for display purposes only.
          </p>
          <p className="text-white/55 text-sm leading-relaxed">
            This section is locked until games have been finalised.
          </p>
        </div>
      </div>

      {acceptTrade && (
        <AcceptQuestModal trade={acceptTrade} onClose={() => { setAcceptTrade(null); fetchTrades(); }} />
      )}
      {showCreate && (
        <CreateModal wallet={wallet} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchTrades(); }} />
      )}
    </div>
  );
}
