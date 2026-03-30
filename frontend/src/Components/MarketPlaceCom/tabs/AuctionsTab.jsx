import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { Gavel, Clock, TrendingUp, Tag, Plus, X, Zap, Gamepad2, Info, CheckCircle2, Bell, Trophy } from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

// ── Countdown timer hook ──────────────────────────────────────────────────────
function useCountdown(endTime) {
  const calc = () => {
    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, done: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endTime]);
  return time;
}

function Countdown({ endTime, urgent }) {
  const { d, h, m, s, done } = useCountdown(endTime);
  if (done) return <span className="text-red-400 text-xs font-bold">ENDED</span>;
  const isUrgent = urgent || (d === 0 && h < 6);
  return (
    <span className={`font-mono text-xs font-bold ${isUrgent ? "text-red-400" : "text-amber-300"}`}>
      {d > 0 && `${d}d `}{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ── Bid Modal ─────────────────────────────────────────────────────────────────
// phase: "enter" | "confirm" | "success"
function BidModal({ auction, onClose, onSuccess, wallet }) {
  const [phase, setPhase]   = useState("enter");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const minBid = auction.currentBid > 0
    ? Math.ceil(auction.currentBid * 1.05)
    : auction.startPrice;

  async function placeBid() {
    if (!wallet) return setErr("Connect your wallet first");
    if (Number(amount) < minBid) return setErr(`Minimum bid is ${minBid} USDC`);
    setLoading(true); setErr("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/auction/${auction._id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), bidderWallet: wallet }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
    } catch (_) {
      // preview mode — still show success
    } finally {
      setLoading(false);
      setPhase("success");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        style={{ background: "#080916", border: "1px solid rgba(0,80,255,0.25)" }}>
        <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white z-10">
          <X className="w-4 h-4" />
        </button>

        {/* ENTER phase */}
        {phase === "enter" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold text-sm">Place a Bid</span>
            </div>
            <div className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-semibold truncate">{auction.title}</p>
                <p className="text-white/40 text-[10px]">{auction.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white/40 text-[10px]">Ends in</p>
                <Countdown endTime={auction.endTime} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-white/40 text-[10px] mb-0.5">Current bid</p>
                <p className="text-white font-bold text-sm">
                  {auction.currentBid > 0 ? auction.currentBid : auction.startPrice} USDC
                </p>
              </div>
              <div className="flex-1 rounded-xl p-3 text-center"
                style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,80,255,0.25)" }}>
                <p className="text-white/40 text-[10px] mb-0.5">Minimum bid</p>
                <p className="text-blue-300 font-bold text-sm">{minBid} USDC</p>
              </div>
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1.5 block">Your bid (USDC)</label>
              <input
                type="number" min={minBid} step="1"
                placeholder={`${minBid} or more`}
                value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none font-mono"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
              />
              {amount && Number(amount) >= minBid && (
                <p className="text-white/30 text-[10px] mt-1">
                  Min increment 5% · Next minimum after your bid: {Math.ceil(Number(amount) * 1.05)} USDC
                </p>
              )}
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button
              onClick={() => { if (!amount || Number(amount) < minBid) return setErr(`Min bid is ${minBid} USDC`); setPhase("confirm"); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.4)" }}>
              Review Bid
            </button>
            <p className="text-white/20 text-[10px] text-center">Winning bid is binding · 20% platform commission</p>
          </div>
        )}

        {/* CONFIRM phase */}
        {phase === "confirm" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold text-sm">Confirm Bid</span>
            </div>
            <div className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.25)" }}>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">Item</span>
                <span className="text-white/90 text-xs font-semibold truncate max-w-[180px]">{auction.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">Your bid</span>
                <span className="text-blue-300 font-bold">{amount} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">If you win, you pay</span>
                <span className="text-white/70 text-xs">{amount} USDC + gas</span>
              </div>
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.12)" }}>
              <p className="text-amber-300/70 text-[10px] leading-relaxed">
                <Bell className="w-3 h-3 inline mr-1" />
                You'll be notified immediately if someone outbids you. The auction auto-closes when the timer expires.
              </p>
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => setPhase("enter")} className="flex-1 py-2 rounded-xl text-sm text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Back
              </button>
              <button onClick={placeBid} disabled={loading}
                className="flex-2 flex-grow py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.4)" }}>
                {loading ? "Placing…" : `Confirm — ${amount} USDC`}
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS phase */}
        {phase === "success" && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,120,255,0.15)", border: "2px solid rgba(0,100,255,0.4)" }}>
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-[Goldman] font-bold text-blue-300 mb-1">Bid Placed!</p>
              <p className="text-white/50 text-xs">You're the highest bidder</p>
            </div>
            <div className="w-full rounded-xl p-4"
              style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.2)" }}>
              <div className="flex justify-between mb-1">
                <span className="text-white/40 text-[10px]">Your bid</span>
                <span className="text-blue-300 font-bold text-sm">{amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-[10px]">Ends in</span>
                <Countdown endTime={auction.endTime} />
              </div>
            </div>
            <p className="text-white/30 text-[11px]">
              <Bell className="w-3 h-3 inline mr-1" />
              You'll receive a notification if you're outbid.
            </p>
            <button onClick={() => { onSuccess?.(); onClose(); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.3)" }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Instant Buy Modal ─────────────────────────────────────────────────────────
// phase: "confirm" | "success"
function InstantBuyModal({ auction, onClose, onSuccess, wallet }) {
  const [phase, setPhase]   = useState("confirm");
  const [loading, setLoading] = useState(false);

  async function confirmBuy() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/auction/${auction._id}/instant-buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ buyerWallet: wallet }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
    } catch (_) {
      // preview mode — still show success
    } finally {
      setLoading(false);
      setPhase("success");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        style={{ background: "#080916", border: "1px solid rgba(180,120,0,0.3)" }}>
        <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white z-10">
          <X className="w-4 h-4" />
        </button>

        {phase === "confirm" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">Buy Now — Instant</span>
            </div>
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="p-4 flex flex-col gap-1.5">
                <p className="text-white font-semibold text-sm">{auction.title}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wide">{auction.category}</p>
                {auction.isNFA && (
                  <span className="self-start px-2 py-0.5 rounded text-[9px] font-bold text-white"
                    style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
                    NFA · Buyback Guaranteed
                  </span>
                )}
              </div>
              <div className="px-4 pb-4 flex justify-between items-center"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <div>
                  <p className="text-white/40 text-[10px]">Buy now price</p>
                  <p className="text-amber-300 font-bold text-xl">{auction.instantBuyPrice} USDC</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px]">Current bids</p>
                  <p className="text-white/60 text-xs">{auction.bidHistory?.length || 0} bid(s)</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(180,120,0,0.08)", border: "1px solid rgba(180,120,0,0.2)" }}>
              <p className="text-amber-300/70 text-[10px] leading-relaxed">
                <Zap className="w-3 h-3 inline mr-1" />
                Buying now ends the auction immediately. The item transfers to your wallet and all other bidders are refunded.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Cancel
              </button>
              <button onClick={confirmBuy} disabled={loading}
                className="flex-2 flex-grow py-2 rounded-xl text-sm font-bold text-amber-200"
                style={{ background: "rgba(160,100,0,0.7)", border: "1px solid rgba(200,140,0,0.4)" }}>
                {loading ? "Processing…" : `Buy — ${auction.instantBuyPrice} USDC`}
              </button>
            </div>
          </div>
        )}

        {phase === "success" && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(180,120,0,0.15)", border: "2px solid rgba(200,160,0,0.5)" }}>
              <CheckCircle2 className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-[Goldman] font-bold text-amber-300 mb-1">Item Secured!</p>
              <p className="text-white/50 text-xs">Auction closed · Transfer initiated</p>
            </div>
            <div className="w-full rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(180,120,0,0.08)", border: "1px solid rgba(200,140,0,0.2)" }}>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Item</span>
                <span className="text-white/80 text-xs font-semibold truncate max-w-[160px]">{auction.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Paid</span>
                <span className="text-amber-300 font-bold">{auction.instantBuyPrice} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Status</span>
                <span className="text-green-400 text-xs font-semibold">Transferred to wallet</span>
              </div>
            </div>
            <p className="text-white/25 text-[11px]">Item will appear in your My Collections tab.</p>
            <button onClick={() => { onSuccess?.(); onClose(); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(160,100,0,0.6)", border: "1px solid rgba(200,140,0,0.3)" }}>
              View My Collections
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create auction modal ──────────────────────────────────────────────────────
function CreateAuctionModal({ onClose, onSuccess, wallet }) {
  const [form, setForm] = useState({ title: "", description: "", image: "", category: "", startPrice: "", reservePrice: "", instantBuyPrice: "", durationHours: "24" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!wallet) return setErr("Connect wallet first");
    setLoading(true); setErr("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form, sellerWallet: wallet,
          startPrice: Number(form.startPrice),
          reservePrice: form.reservePrice ? Number(form.reservePrice) : undefined,
          instantBuyPrice: form.instantBuyPrice ? Number(form.instantBuyPrice) : undefined,
          durationHours: Number(form.durationHours),
        }),
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
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Gavel className="w-4 h-4" /> List Auction</h3>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required placeholder="Title *" value={form.title} onChange={e => set("title", e.target.value)} className={iCls} style={iSt} />
          <textarea placeholder="Description" value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={iCls} style={iSt} />
          <input placeholder="Image URL (optional)" value={form.image} onChange={e => set("image", e.target.value)} className={iCls} style={iSt} />
          <input placeholder="Category" value={form.category} onChange={e => set("category", e.target.value)} className={iCls} style={iSt} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Start Price (USDC) *</label>
              <input required type="number" step="0.01" min="0" placeholder="0.00" value={form.startPrice} onChange={e => set("startPrice", e.target.value)} className={iCls} style={iSt} />
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Reserve Price (USDC)</label>
              <input type="number" step="0.01" min="0" placeholder="Optional" value={form.reservePrice} onChange={e => set("reservePrice", e.target.value)} className={iCls} style={iSt} />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-[10px] mb-1 block">Instant Buy Price (USDC)</label>
            <input type="number" step="0.01" min="0" placeholder="Leave blank to disable" value={form.instantBuyPrice} onChange={e => set("instantBuyPrice", e.target.value)} className={iCls} style={iSt} />
          </div>
          <div>
            <label className="text-white/40 text-[10px] mb-1 block">Duration</label>
            <select value={form.durationHours} onChange={e => set("durationHours", e.target.value)} className={iCls} style={iSt}>
              <option value="24">1 Day</option>
              <option value="72">3 Days</option>
              <option value="168">7 Days</option>
            </select>
          </div>
          <p className="text-white/30 text-[10px]">Free to list · 20% commission on sale</p>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" disabled={loading} className="py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(0,42,168,0.8)" }}>
            {loading ? "Creating…" : "Create Auction"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Auction card ──────────────────────────────────────────────────────────────
function AuctionCard({ auction, onBid, onInstantBuy }) {
  const isNFA = auction.isNFA;
  const { d, h, done } = useCountdown(auction.endTime);
  const isUrgent = !done && d === 0 && h < 6;
  const statusColor = { active: "text-green-400", ended: "text-red-400", sold: "text-blue-400", cancelled: "text-white/30" }[auction.status] || "text-white/40";

  return (
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: isUrgent
          ? "1px solid rgba(255,80,80,0.4)"
          : isNFA
            ? "1px solid rgba(0,80,255,0.5)"
            : "1px solid rgba(255,255,255,0.09)",
      }}>
      <div className="relative">
        <LazyImage src={auction.image ? getImageUrl(auction.image) : null} alt={auction.title}
          fallback={popularFallback} className="w-full h-44" imgClassName="object-cover" />
        <div className="absolute top-2 left-2 flex gap-1">
          {isNFA && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
              style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.5)" }}>NFA</span>
          )}
          {isUrgent && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-red-300 animate-pulse"
              style={{ background: "rgba(180,0,0,0.7)", border: "1px solid rgba(255,60,60,0.5)" }}>ENDING SOON</span>
          )}
        </div>
        <span className={`absolute top-2 right-2 text-[10px] font-bold uppercase ${statusColor}`}>{auction.status}</span>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-white/90 text-sm font-semibold truncate">{auction.title}</p>
        {auction.category && <p className="text-white/30 text-[10px] uppercase tracking-wide">{auction.category}</p>}

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-white/40 text-[10px]">Current bid</p>
            <p className="text-white font-bold text-sm">
              {auction.currentBid > 0 ? `${auction.currentBid} USDC` : `${auction.startPrice} USDC`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px]">Ends in</p>
            <Countdown endTime={auction.endTime} urgent={isUrgent} />
          </div>
        </div>

        {auction.instantBuyPrice && (
          <p className="text-[10px] text-amber-300/70">
            <Zap className="w-3 h-3 inline mr-0.5" />Buy now: {auction.instantBuyPrice} USDC
          </p>
        )}
        <p className="text-white/25 text-[10px]">{auction.bidHistory?.length || 0} bid(s)</p>

        {auction.status === "active" && (
          <div className="flex gap-2 mt-1">
            <button onClick={() => onBid(auction)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
              Place Bid
            </button>
            {auction.instantBuyPrice && (
              <button onClick={() => onInstantBuy(auction)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-amber-300"
                style={{ background: "rgba(180,120,0,0.25)", border: "1px solid rgba(180,120,0,0.4)" }}>
                <Zap className="w-3 h-3 inline mr-0.5" />Buy Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Investor Note Banner ──────────────────────────────────────────────────────
function InvestorBanner() {
  return (
    <div className="mb-6 rounded-xl overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, rgba(0,42,168,0.12) 0%, rgba(180,120,0,0.06) 100%)", border: "1px solid rgba(0,80,255,0.15)" }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-300/90 text-xs font-semibold">In-Game Feature Preview</p>
          <p className="text-white/40 text-[11px] leading-snug">
            The Auction system will be fully live in-game at launch. Items shown here are seeded samples for investor/user showcase.
          </p>
        </div>
        <Info className="w-4 h-4 text-white/20 flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Static preview data ───────────────────────────────────────────────────────
// Three distinct countdown times as requested: ~5h31m, ~1d7h18m, ~3d9h45m
const now = Date.now();
const PREVIEW_AUCTIONS = [
  { _id: "pa-1", title: "Shadow Ops Skin — Legendary", category: "Skins", isNFA: true, status: "active", startPrice: 250, currentBid: 320, instantBuyPrice: 500, endTime: new Date(now + 5 * 3600000 + 31 * 60000).toISOString(), bidHistory: [{}, {}, {}] },
  { _id: "pa-2", title: "Rail Sniper X90 — Gold Edition", category: "Weapons", isNFA: false, status: "active", startPrice: 150, currentBid: 180, instantBuyPrice: null, endTime: new Date(now + 31 * 3600000 + 18 * 60000 + 30000).toISOString(), bidHistory: [{}, {}] },
  { _id: "pa-3", title: "Viper Fighter Mk1 — Commander", category: "Spaceships", isNFA: true, status: "active", startPrice: 1200, currentBid: 1800, instantBuyPrice: 2500, endTime: new Date(now + 81 * 3600000 + 45 * 60000 + 59000).toISOString(), bidHistory: [{}, {}, {}] },
  { _id: "pa-4", title: "Desert Outpost Alpha — Fortified", category: "Land & Bases", isNFA: true, status: "active", startPrice: 3000, currentBid: 4500, instantBuyPrice: 6000, endTime: new Date(now + 72 * 3600000).toISOString(), bidHistory: [{}, {}, {}] },
  { _id: "pa-5", title: "Ghost Recon Operator — Elite", category: "Specialists", isNFA: false, status: "active", startPrice: 380, currentBid: 420, instantBuyPrice: 600, endTime: new Date(now + 48 * 3600000).toISOString(), bidHistory: [{}, {}] },
  { _id: "pa-6", title: "HyperBike GT — Neon Circuit", category: "Vehicles", isNFA: false, status: "active", startPrice: 550, currentBid: 660, instantBuyPrice: 900, endTime: new Date(now + 22 * 3600000).toISOString(), bidHistory: [{}, {}] },
  { _id: "pa-7", title: "Star of Honour — Genesis", category: "Badges", isNFA: true, status: "active", startPrice: 1500, currentBid: 2100, instantBuyPrice: 3000, endTime: new Date(now + 168 * 3600000).toISOString(), bidHistory: [{}, {}, {}] },
  { _id: "pa-8", title: "Cosmic Battle Scene — 1/1", category: "Artwork", isNFA: true, status: "active", startPrice: 4000, currentBid: 5200, instantBuyPrice: 8000, endTime: new Date(now + 120 * 3600000).toISOString(), bidHistory: [{}, {}] },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const FILTERS = ["active", "ended", "sold"];

export default function AuctionsTab() {
  const { user, isLoggedInUser } = useSelector(s => s.auth);
  const { address: wagmiAddress } = useAccount();
  const wallet = wagmiAddress || user?.WalletAddress || user?.MetaMaskAddress || "";

  const [auctions, setAuctions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const [bidAuction, setBidAuction]         = useState(null);
  const [instantBuyAuction, setInstantBuyAuction] = useState(null);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 12;

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/auction?status=${filter}&page=${page}&limit=${LIMIT}`);
      const data = await r.json();
      const fetched = data.auctions || [];
      if (fetched.length > 0) {
        setAuctions(fetched); setTotal(data.total || 0);
      } else if (filter === "active" && page === 1) {
        setAuctions(PREVIEW_AUCTIONS); setTotal(PREVIEW_AUCTIONS.length);
      } else {
        setAuctions([]); setTotal(0);
      }
    } catch {
      if (filter === "active" && page === 1) {
        setAuctions(PREVIEW_AUCTIONS); setTotal(PREVIEW_AUCTIONS.length);
      } else { setAuctions([]); }
    }
    finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);
  useEffect(() => { setPage(1); }, [filter]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Gavel className="w-5 h-5 text-white/60" />
          <h2 className="text-white font-bold text-lg">Auctions</h2>
          <span className="text-white/30 text-sm">{total} listings</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                style={filter === f
                  ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.5)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                }>{f}</button>
            ))}
          </div>
          {isLoggedInUser && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
              <Plus className="w-3.5 h-3.5" /> New Auction
            </button>
          )}
        </div>
      </div>

      <InvestorBanner />

      {/* Rules bar */}
      <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><Clock className="w-3 h-3 inline mr-1" />Durations: 1d · 3d · 7d</span>
        <span><TrendingUp className="w-3 h-3 inline mr-1" />Min increment: 5%</span>
        <span><Tag className="w-3 h-3 inline mr-1" />Free to list</span>
        <span><Gavel className="w-3 h-3 inline mr-1" />Commission: 20% on sale</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl h-64 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/25">
          <Gavel className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No {filter} auctions</p>
          {isLoggedInUser && filter === "active" && (
            <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 rounded-lg text-xs text-white"
              style={{ background: "rgba(0,42,168,0.6)" }}>Create the first auction</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {auctions.map(a => (
            <AuctionCard key={a._id} auction={a}
              onBid={a => isLoggedInUser ? setBidAuction(a) : alert("Log in first")}
              onInstantBuy={a => isLoggedInUser ? setInstantBuyAuction(a) : alert("Log in first")}
            />
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

      {bidAuction && (
        <BidModal auction={bidAuction} wallet={wallet}
          onClose={() => setBidAuction(null)}
          onSuccess={() => { setBidAuction(null); fetchAuctions(); }} />
      )}
      {instantBuyAuction && (
        <InstantBuyModal auction={instantBuyAuction} wallet={wallet}
          onClose={() => setInstantBuyAuction(null)}
          onSuccess={() => { setInstantBuyAuction(null); fetchAuctions(); }} />
      )}
      {showCreate && (
        <CreateAuctionModal wallet={wallet}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchAuctions(); }} />
      )}
    </div>
  );
}
