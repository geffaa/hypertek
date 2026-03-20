import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Target, Plus, X, Clock, DollarSign, CheckCircle2, Gamepad2, Info } from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";


// ── Bounty card ───────────────────────────────────────────────────────────────
function BountyCard({ bounty, onClaim, onComplete, onCancel, currentWallet }) {
  const isPoster = bounty.posterWallet === currentWallet;
  const isClaimer = bounty.claimedByWallet === currentWallet;
  const statusColor = {
    open: "text-green-400", claimed: "text-amber-300",
    completed: "text-blue-400", cancelled: "text-white/25", expired: "text-red-400",
  }[bounty.status] || "text-white/40";

  const netReward = (bounty.reward * (1 - bounty.commission)).toFixed(2);
  const expiresIn = bounty.expiresAt
    ? Math.max(0, Math.round((new Date(bounty.expiresAt) - Date.now()) / 86400000))
    : null;

  return (
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,80,80,0.2)",
      }}>
      {bounty.image && (
        <LazyImage src={getImageUrl(bounty.image)} alt={bounty.title} fallback={popularFallback}
          className="w-full h-32" imgClassName="object-cover" />
      )}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase text-red-400"
              style={{ background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.2)" }}>
              BOUNTY
            </span>

          </div>
          <span className={`text-[10px] font-bold uppercase ${statusColor}`}>{bounty.status}</span>
        </div>

        <p className="text-white/90 text-sm font-semibold truncate">{bounty.title}</p>

        <div className="flex items-center gap-1.5">
          <span className="text-white/40 text-[10px]">Target:</span>
          <span className="text-red-300/80 text-[11px] font-semibold truncate">{bounty.targetName}</span>
        </div>

        {bounty.description && <p className="text-white/40 text-[11px] line-clamp-2">{bounty.description}</p>}

        <div className="flex items-end justify-between mt-auto pt-1">
          <div>
            <p className="text-white/40 text-[10px]">Reward</p>
            <p className="text-red-300 font-bold text-sm">{bounty.reward} USDC</p>
            <p className="text-white/30 text-[9px]">Net: {netReward} USDC (after 20%)</p>
          </div>
          {expiresIn !== null && bounty.status === "open" && (
            <div className="text-right">
              <p className="text-white/40 text-[10px]">Expires in</p>
              <p className="text-white/60 text-xs">{expiresIn}d</p>
            </div>
          )}
        </div>

        <p className="text-white/25 text-[10px]">Posted by {bounty.posterName}</p>

        <div className="flex gap-2 mt-1">
          {bounty.status === "open" && !isPoster && (
            <button onClick={() => onClaim(bounty)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(160,30,30,0.7)", border: "1px solid rgba(255,60,60,0.4)" }}>
              Claim Bounty
            </button>
          )}
          {bounty.status === "claimed" && isPoster && (
            <button onClick={() => onComplete(bounty)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-green-300"
              style={{ background: "rgba(0,80,0,0.35)", border: "1px solid rgba(0,160,0,0.3)" }}>
              Confirm Complete
            </button>
          )}
          {bounty.status === "open" && isPoster && (
            <button onClick={() => onCancel(bounty)} className="flex-1 py-1.5 rounded-lg text-xs text-red-400"
              style={{ background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)" }}>
              Cancel
            </button>
          )}
          {bounty.status === "claimed" && isClaimer && (
            <p className="text-amber-300/60 text-xs italic flex-1 text-center pt-1">Awaiting poster confirmation</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create modal ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onSuccess, wallet }) {
  const [form, setForm] = useState({ title: "", description: "", targetName: "", targetWallet: "", reward: "", image: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!wallet) return setErr("Connect wallet first");
    setLoading(true); setErr("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/bounty`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, posterWallet: wallet, reward: Number(form.reward) }),
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
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-red-400" /> Post Bounty</h3>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required placeholder="Bounty title *" value={form.title} onChange={e => set("title", e.target.value)} className={iCls} style={iSt} />
          <textarea placeholder="Description / Objective" value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={iCls} style={iSt} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Target Name / IGN *</label>
              <input required placeholder="Player name" value={form.targetName} onChange={e => set("targetName", e.target.value)} className={iCls} style={iSt} />
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Target Wallet</label>
              <input placeholder="0x... (optional)" value={form.targetWallet} onChange={e => set("targetWallet", e.target.value)} className={iCls} style={iSt} />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-[10px] mb-1 block">Reward (USDC) *</label>
            <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={form.reward} onChange={e => set("reward", e.target.value)} className={iCls} style={iSt} />
            {form.reward && <p className="text-white/30 text-[10px] mt-1">Claimer receives {(Number(form.reward) * 0.8).toFixed(2)} USDC after 20% commission</p>}
          </div>
          <input placeholder="Category (pvp, raid, intel…)" value={form.category} onChange={e => set("category", e.target.value)} className={iCls} style={iSt} />
          <input placeholder="Evidence / Image URL (optional)" value={form.image} onChange={e => set("image", e.target.value)} className={iCls} style={iSt} />
          <p className="text-white/30 text-[10px]">Listing fee: $2 USDC · Expires in 30 days · You confirm completion</p>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" disabled={loading} className="py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(160,30,30,0.8)" }}>
            {loading ? "Posting…" : "Post Bounty"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Investor Note Banner ──────────────────────────────────────────────────────
function InvestorBanner() {
  return (
    <div className="mb-6 rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(160,30,30,0.1) 0%, rgba(0,42,168,0.06) 100%)",
        border: "1px solid rgba(255,60,60,0.15)",
      }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-300/90 text-xs font-semibold">In-Game Feature Preview</p>
          <p className="text-white/40 text-[11px] leading-snug">
            The Bounty Board will be fully live in-game at launch. Items shown here are seeded samples for investor/user showcase.
          </p>
        </div>
        <Info className="w-4 h-4 text-white/20 flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Static preview data ───────────────────────────────────────────────────────
const PREVIEW_BOUNTIES = [
  { _id: "pb-1", status: "open", title: "Hit Contract: IronFist_99", targetName: "IronFist_99", description: "This player raided our base and took out our best officers. Looking for a bounty hunter to settle the score. Your 3-4 best officers vs theirs in a battle of power.", reward: 1200, commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Intel Division" },
  { _id: "pb-2", status: "open", title: "Hit Contract: Lt. Shadow Wolf", targetName: "Lt. Shadow Wolf", description: "A former ally turned rogue. This player has been attacking smaller factions unprovoked. Send your officers to neutralise them. Full battle record required as proof.", reward: 900, commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Defence Ministry" },
  { _id: "pb-3", status: "open", title: "Hit Contract: LL. Shadow Wolf", targetName: "LL. Shadow Wolf", description: "Capture the enemy intelligence officer alive. Prisoner must be delivered to forward operating base for interrogation. Officers must outnumber target's squad.", reward: 800, commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Special Ops Unit" },
  { _id: "pb-4", status: "open", title: "Hit Contract: WarHawk_Prime", targetName: "WarHawk_Prime", description: "A large faction bully who has been targeting new players. Post a hit to push them back. Your officers will go head-to-head in a strength battle — animated result provided.", reward: 650, commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Cyber Division" },
  { _id: "pb-5", status: "open", title: "Hit Contract: Commander Vex", targetName: "Commander Vex", description: "High-priority player target in Sector 9. Known for ambushing smaller players. Accept this contract and send your 3-4 best officers into battle. Video battle log required.", reward: 500, commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "HQ Command" },
  { _id: "pb-6", status: "open", title: "Hit Contract: Renegade_Echo", targetName: "Renegade_Echo", description: "This player has been disrupting trade routes and raiding merchant factions. Any bounty hunter who defeats their officers in battle will earn this reward. Proof of victory required.", reward: 350, commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Resistance HQ" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["open", "claimed", "completed"];

export default function BountyTab() {
  const { user, isLoggedInUser } = useSelector(s => s.auth);
  const wallet = user?.walletAddress || user?.wallet || "";

  const [bounties, setBounties] = useState([]);
  const [usingPreview, setUsingPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const fetchBounties = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/bounty?status=${statusFilter}&page=${page}&limit=${LIMIT}`);
      const data = await r.json();
      const fetched = data.bounties || [];
      if (fetched.length > 0) {
        setBounties(fetched); setTotal(data.total || 0); setUsingPreview(false);
      } else if (statusFilter === "open" && page === 1) {
        setBounties(PREVIEW_BOUNTIES); setTotal(PREVIEW_BOUNTIES.length); setUsingPreview(true);
      } else {
        setBounties([]); setTotal(0); setUsingPreview(false);
      }
    } catch {
      if (statusFilter === "open" && page === 1) {
        setBounties(PREVIEW_BOUNTIES); setTotal(PREVIEW_BOUNTIES.length); setUsingPreview(true);
      } else { setBounties([]); }
    }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchBounties(); }, [fetchBounties]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  async function authAction(method, url) {
    const token = localStorage.getItem("token");
    const r = await fetch(`${BACKEND_BASE_URL}${url}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: method !== "GET" ? JSON.stringify({ claimedByWallet: wallet }) : undefined,
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    fetchBounties();
  }

  async function handleClaim(bounty) {
    if (!isLoggedInUser) return alert("Log in first");
    if (!wallet) return alert("Connect wallet first");
    if (!confirm(`Claim bounty on "${bounty.targetName}"? You will earn ${(bounty.reward * 0.8).toFixed(2)} USDC upon completion.`)) return;
    try { await authAction("POST", `/api/v1/bounty/${bounty._id}/claim`); }
    catch (e) { alert(e.message); }
  }
  async function handleComplete(bounty) {
    if (!confirm("Confirm this bounty as completed? Reward will be released.")) return;
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/bounty/${bounty._id}/complete`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      fetchBounties();
    } catch (e) { alert(e.message); }
  }
  async function handleCancel(bounty) {
    if (!confirm("Cancel this bounty?")) return;
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/bounty/${bounty._id}/cancel`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      fetchBounties();
    } catch (e) { alert(e.message); }
  }

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-red-400/80" />
          <h2 className="text-white font-bold text-lg">Bounty Board</h2>
          <span className="text-white/30 text-sm">{total} bounties</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} className="px-2.5 py-1 rounded-full text-xs capitalize"
                style={statusFilter === f
                  ? { background: "rgba(160,30,30,0.8)", border: "1px solid rgba(255,60,60,0.4)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                }>{f}</button>
            ))}
          </div>
          {isLoggedInUser && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(160,30,30,0.7)", border: "1px solid rgba(255,60,60,0.35)" }}>
              <Plus className="w-3.5 h-3.5" /> Post Bounty
            </button>
          )}
        </div>
      </div>

      {/* Investor note */}
      <InvestorBanner />

      {/* Info bar */}
      <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><DollarSign className="w-3 h-3 inline mr-0.5" />Listing fee: $2 USDC</span>
        <span><CheckCircle2 className="w-3 h-3 inline mr-0.5" />Poster confirms completion</span>
        <span><Clock className="w-3 h-3 inline mr-0.5" />Expires in 30 days</span>
        <span><Target className="w-3 h-3 inline mr-0.5" />20% commission on reward</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl h-48 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
        </div>
      ) : bounties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/25">
          <Target className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No {statusFilter} bounties</p>
          {isLoggedInUser && statusFilter === "open" && (
            <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 rounded-lg text-xs text-white"
              style={{ background: "rgba(160,30,30,0.6)" }}>Post the first bounty</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bounties.map(b => (
            <BountyCard key={b._id} bounty={b} currentWallet={wallet}
              onClaim={handleClaim} onComplete={handleComplete} onCancel={handleCancel} />
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

      {showCreate && <CreateModal wallet={wallet} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchBounties(); }} />}
    </div>
  );
}
