import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Users, Package, Plus, X, Clock, RotateCcw, ShieldAlert, Gamepad2, Info } from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

const DURATION_LABELS = { 8: "8 hours", 24: "1 day", 72: "3 days", 168: "1 week", 720: "1 month" };


// ── Listing card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, onRent, onReturn, onCancel, currentWallet }) {
  const isOwner = listing.ownerWallet === currentWallet;
  const isRenter = listing.renterWallet === currentWallet;
  const isHire = listing.type === "hire";

  const statusColor = {
    available: "text-green-400", rented: "text-amber-300",
    cooldown: "text-orange-400", completed: "text-blue-400", cancelled: "text-white/25",
  }[listing.status] || "text-white/40";

  const cooldownLeft = listing.cooldownUntil
    ? Math.max(0, Math.round((new Date(listing.cooldownUntil) - Date.now()) / 3600000))
    : 0;
  const rentedUntil = listing.endTime
    ? new Date(listing.endTime).toLocaleString()
    : null;

  return (
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: `1px solid ${isHire ? "rgba(0,180,80,0.3)" : "rgba(120,60,220,0.3)"}`,
      }}>
      <div className="relative">
        <LazyImage src={listing.image ? getImageUrl(listing.image) : null} alt={listing.itemTitle}
          fallback={popularFallback} className="w-full h-36" imgClassName="object-cover" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
            style={{ background: isHire ? "rgba(0,120,60,0.85)" : "rgba(100,40,200,0.85)" }}>
            {isHire ? "FOR HIRE" : "WANTING TO HIRE"}
          </span>
        </div>
        <span className={`absolute top-2 right-2 text-[10px] font-bold uppercase ${statusColor}`}>{listing.status}</span>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-white/90 text-sm font-semibold truncate">{listing.itemTitle}</p>
        {listing.itemDescription && <p className="text-white/40 text-[11px] line-clamp-2">{listing.itemDescription}</p>}
        <p className="text-white/30 text-[10px] mt-0.5">by {listing.ownerName}</p>

        <div className="flex items-end justify-between mt-auto pt-1">
          <div>
            <p className="text-white/40 text-[10px]">Price</p>
            <p className="text-white font-bold text-sm">{listing.pricePerDuration} USDC</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px]">Max Duration</p>
            <p className="text-white/80 text-xs">{DURATION_LABELS[listing.durationHours] || `${listing.durationHours}h`}</p>
          </div>
        </div>

        {listing.status === "rented" && rentedUntil && (
          <p className="text-amber-300/70 text-[10px]"><Clock className="w-3 h-3 inline mr-0.5" />Until: {rentedUntil}</p>
        )}
        {listing.status === "cooldown" && cooldownLeft > 0 && (
          <p className="text-orange-400/70 text-[10px]"><RotateCcw className="w-3 h-3 inline mr-0.5" />Cooldown: ~{cooldownLeft}h left</p>
        )}

        <div className="flex gap-2 mt-1">
          {listing.status === "available" && !isOwner && (
            <button onClick={() => onRent(listing)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
              {isHire ? "For Hire" : "Wanting to Hire"}
            </button>
          )}
          {listing.status === "rented" && isRenter && (
            <button onClick={() => onReturn(listing)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-amber-300"
              style={{ background: "rgba(180,120,0,0.25)", border: "1px solid rgba(180,120,0,0.4)" }}>
              Return
            </button>
          )}
          {listing.status === "available" && isOwner && (
            <button onClick={() => onCancel(listing)} className="flex-1 py-1.5 rounded-lg text-xs text-red-400"
              style={{ background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)" }}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create modal ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onSuccess, wallet }) {
  const [type, setType] = useState("hire");
  const [form, setForm] = useState({ itemTitle: "", itemDescription: "", image: "", category: "", pricePerDuration: "", durationHours: "24" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!wallet) return setErr("Connect wallet first");
    setLoading(true); setErr("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/hire`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, type, ownerWallet: wallet, pricePerDuration: Number(form.pricePerDuration), durationHours: Number(form.durationHours) }),
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
        <h3 className="text-white font-bold mb-4">{type === "hire" ? "List For Hire" : "Post Wanting to Hire"}</h3>
        <div className="flex gap-2 mb-4">
          {[{ val: "hire", label: "For Hire" }, { val: "rent", label: "Wanting to Hire" }].map(({ val, label }) => (
            <button key={val} onClick={() => setType(val)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
              style={type === val
                ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.5)", color: "#fff" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" }
              }>{label}</button>
          ))}
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required placeholder={type === "hire" ? "Specialist / item name *" : "What you want to hire *"} value={form.itemTitle} onChange={e => set("itemTitle", e.target.value)} className={iCls} style={iSt} />
          <textarea placeholder="Description" value={form.itemDescription} onChange={e => set("itemDescription", e.target.value)} rows={2} className={iCls} style={iSt} />
          <input placeholder="Image URL (optional)" value={form.image} onChange={e => set("image", e.target.value)} className={iCls} style={iSt} />
          <input placeholder="Category (optional)" value={form.category} onChange={e => set("category", e.target.value)} className={iCls} style={iSt} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Price (USDC) *</label>
              <input required type="number" step="0.01" min="0" placeholder="0.00" value={form.pricePerDuration} onChange={e => set("pricePerDuration", e.target.value)} className={iCls} style={iSt} />
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Duration</label>
              <select value={form.durationHours} onChange={e => set("durationHours", e.target.value)} className={iCls} style={iSt}>
                <option value="8">8 hours</option>
                <option value="24">1 day</option>
                <option value="72">3 days</option>
                <option value="168">1 week</option>
                <option value="720">1 month</option>
              </select>
            </div>
          </div>
          <p className="text-white/30 text-[10px]">20% commission · Cooldown = 2× rental duration after return</p>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" disabled={loading} className="py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(0,42,168,0.8)" }}>
            {loading ? "Listing…" : "Create Listing"}
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
        background: "linear-gradient(135deg, rgba(0,180,80,0.08) 0%, rgba(0,42,168,0.06) 100%)",
        border: "1px solid rgba(0,180,80,0.15)",
      }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-300/90 text-xs font-semibold">In-Game Feature Preview</p>
          <p className="text-white/40 text-[11px] leading-snug">
            The Hire & Rent system will be fully live in-game at launch. Items shown here are seeded samples for investor/user showcase.
          </p>
        </div>
        <Info className="w-4 h-4 text-white/20 flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Static preview data ───────────────────────────────────────────────────────
const PREVIEW_LISTINGS = [
  // For Hire — owners offering their specialists/items
  { _id: "ph-1", type: "hire", status: "available", itemTitle: "Ghost Recon Operator", itemDescription: "Elite recon specialist with ghost cloak ability. Available for short missions.", category: "Specialists", ownerName: "CommanderAlpha", pricePerDuration: 45, durationHours: 24 },
  { _id: "ph-3", type: "hire", status: "available", itemTitle: "Cyber Medic — Field Support", itemDescription: "Field medic with advanced cybernetic healing tools. Essential for squad survival.", category: "Specialists", ownerName: "MedCorps", pricePerDuration: 35, durationHours: 72 },
  { _id: "ph-5", type: "hire", status: "available", itemTitle: "AI Drone Handler", itemDescription: "Controls a squad of tactical AI combat drones. High value target suppression.", category: "Specialists", ownerName: "DronePilot_X", pricePerDuration: 60, durationHours: 168 },
  { _id: "ph-8", type: "hire", status: "available", itemTitle: "Sniper Ace — Long Range", itemDescription: "Long-range marksman with zero-wind precision targeting. Maximum effective range specialist.", category: "Specialists", ownerName: "LongShot", pricePerDuration: 90, durationHours: 168 },
  { _id: "ph-9", type: "hire", status: "available", itemTitle: "Phantom Stealth Ship — Covert", itemDescription: "Radar-invisible stealth spacecraft for covert ops. Silent approach and extraction capability.", category: "Spaceships", ownerName: "NavalCommander", pricePerDuration: 120, durationHours: 168 },
  // Wanting to Hire — players looking to hire
  { _id: "ph-2", type: "rent", status: "available", itemTitle: "Sniper Specialist — Wanted", itemDescription: "Looking for a precision sniper for a 3-day extraction mission. Must have long-range capability.", category: "Specialists", ownerName: "MissionControl_X", pricePerDuration: 50, durationHours: 72 },
  { _id: "ph-4", type: "rent", status: "available", itemTitle: "Spaceship Pilot — Wanted", itemDescription: "Seeking an experienced spaceship pilot for escort mission. Flexible on ship type.", category: "Spaceships", ownerName: "RaidLeader_7", pricePerDuration: 100, durationHours: 24 },
  { _id: "ph-6", type: "rent", status: "available", itemTitle: "Heavy Exo-Suit — Wanted", itemDescription: "Need a heavy exoskeleton for an upcoming raid operation. Will pay top rate for best gear.", category: "Body Armour", ownerName: "SquadCommander", pricePerDuration: 80, durationHours: 72 },
  { _id: "ph-7", type: "rent", status: "available", itemTitle: "Combat Medic — Wanted", itemDescription: "Squad urgently needs a combat medic for prolonged campaign. Prefer cybernetic specialist.", category: "Specialists", ownerName: "BattleGroup_9", pricePerDuration: 40, durationHours: 168 },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["available", "rented", "cooldown"];

export default function HireRentTab() {
  const { user, isLoggedInUser } = useSelector(s => s.auth);
  const wallet = user?.walletAddress || user?.wallet || "";

  const [listings, setListings] = useState([]);
  const [usingPreview, setUsingPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("available");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, page, limit: LIMIT });
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/hire?${params}`);
      const data = await r.json();
      const fetched = data.listings || [];
      if (fetched.length > 0) {
        setListings(fetched); setTotal(data.total || 0); setUsingPreview(false);
      } else if (statusFilter === "available" && page === 1) {
        setListings(PREVIEW_LISTINGS); setTotal(PREVIEW_LISTINGS.length); setUsingPreview(true);
      } else {
        setListings([]); setTotal(0); setUsingPreview(false);
      }
    } catch {
      if (statusFilter === "available" && page === 1) {
        setListings(PREVIEW_LISTINGS); setTotal(PREVIEW_LISTINGS.length); setUsingPreview(true);
      } else { setListings([]); }
    }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  async function authFetch(method, url, body) {
    const token = localStorage.getItem("token");
    const r = await fetch(`${BACKEND_BASE_URL}${url}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    return data;
  }

  async function handleRent(listing) {
    if (!isLoggedInUser) return alert("Log in first");
    if (!wallet) return alert("Connect wallet first");
    if (!confirm(`Rent "${listing.itemTitle}" for ${listing.pricePerDuration} USDC (${DURATION_LABELS[listing.durationHours] || listing.durationHours + "h"})?`)) return;
    try { await authFetch("POST", `/api/v1/hire/${listing._id}/rent`, { renterWallet: wallet }); fetchListings(); }
    catch (e) { alert(e.message); }
  }
  async function handleReturn(listing) {
    if (!confirm("Return this item? Cooldown will apply.")) return;
    try { await authFetch("PUT", `/api/v1/hire/${listing._id}/return`); fetchListings(); }
    catch (e) { alert(e.message); }
  }
  async function handleCancel(listing) {
    if (!confirm("Remove this listing?")) return;
    try { await authFetch("PUT", `/api/v1/hire/${listing._id}/cancel`); fetchListings(); }
    catch (e) { alert(e.message); }
  }

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-white/60" />
          <h2 className="text-white font-bold text-lg">For Hire / Wanting to Hire</h2>
          <span className="text-white/30 text-sm">{total} listings</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
              <Plus className="w-3.5 h-3.5" /> List
            </button>
          )}
        </div>
      </div>

      {/* Investor note */}
      <InvestorBanner />

      {/* Rules */}
      <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><Clock className="w-3 h-3 inline mr-1" />8h · 1d · 3d · 1w · 1mo</span>
        <span><ShieldAlert className="w-3 h-3 inline mr-1" />Cooldown: 2× rental duration</span>
        <span><Package className="w-3 h-3 inline mr-1" />Commission: 20%</span>
      </div>

      {/* Grid — split into For Hire and Wanting to Hire */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-xl h-56 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/25">
          <Users className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No {statusFilter} listings</p>
          {isLoggedInUser && statusFilter === "available" && (
            <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 rounded-lg text-xs text-white"
              style={{ background: "rgba(0,42,168,0.6)" }}>Create a listing</button>
          )}
        </div>
      ) : (() => {
        const hireListings    = listings.filter(l => l.type === "hire");
        const wantingListings = listings.filter(l => l.type !== "hire");
        return (
          <div className="flex flex-col gap-10">
            {hireListings.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white uppercase"
                    style={{ background: "rgba(0,120,60,0.5)", border: "1px solid rgba(0,180,80,0.3)" }}>
                    For Hire
                  </span>
                  <span className="text-white/25 text-xs">{hireListings.length} listings</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hireListings.map(l => (
                    <ListingCard key={l._id} listing={l} currentWallet={wallet}
                      onRent={handleRent} onReturn={handleReturn} onCancel={handleCancel} />
                  ))}
                </div>
              </div>
            )}
            {wantingListings.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white uppercase"
                    style={{ background: "rgba(100,40,200,0.5)", border: "1px solid rgba(120,60,220,0.3)" }}>
                    Wanting to Hire
                  </span>
                  <span className="text-white/25 text-xs">{wantingListings.length} listings</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wantingListings.map(l => (
                    <ListingCard key={l._id} listing={l} currentWallet={wallet}
                      onRent={handleRent} onReturn={handleReturn} onCancel={handleCancel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Prev</button>
          <span className="text-white/30 text-xs">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Next</button>
        </div>
      )}

      {showCreate && <CreateModal wallet={wallet} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchListings(); }} />}
    </div>
  );
}
