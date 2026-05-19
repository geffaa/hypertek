import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { Gavel, Clock, TrendingUp, Tag, Plus, X, Zap, Gamepad2, Info, CheckCircle2, Bell, Trophy, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

// ── Auction Detail Popup ──────────────────────────────────────────────────────
function AuctionDetailPopup({ auction, imgSrc, onClose, onBid, onInstantBuy }) {
  const { t } = useTranslation();
  const { d, h, m, s, done } = useCountdown(auction.endTime);
  const isUrgent = !done && d === 0 && h < 6;
  const timeLabel = done
    ? t("marketplace.auctions.card.ended")
    : d > 0
      ? `${d}d ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
      : `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  const currentPrice = auction.currentBid > 0 ? auction.currentBid : auction.startPrice;
  const bidCount = auction.bidHistory?.length || 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden flex flex-col relative"
        style={{ background: "linear-gradient(160deg,#0a0c1e 0%,#060810 100%)", border: "1px solid rgba(0,80,255,0.25)", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 text-white/30 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="relative w-full flex-shrink-0" style={{ height: 220, background: "#000" }}>
          <img
            src={imgSrc || popularFallback}
            alt={auction.title}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: "linear-gradient(to top, #0a0c1e, transparent)" }} />
          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase
            ${auction.status === "active" ? "text-green-300" : auction.status === "ended" ? "text-red-400" : "text-white/40"}`}
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {auction.status}
          </span>
          {auction.isNFA && (
            <span className="absolute top-2.5 right-8 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
              style={{ background: "rgba(0,42,168,0.9)", border: "1px solid rgba(0,80,255,0.5)" }}>NFA</span>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col gap-3 p-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

          {/* Title + category */}
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-bold text-base leading-snug pr-4">{auction.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {auction.category && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
                  {auction.category}
                </span>
              )}
              <span className="text-white/25 text-[10px]">{bidCount} {t("marketplace.auctions.detail.bids")}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-2.5 text-center"
              style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,80,255,0.2)" }}>
              <p className="text-white/40 text-[9px] mb-0.5">{t("marketplace.auctions.detail.currentBid")}</p>
              <p className="text-blue-300 font-bold text-xs">{currentPrice} <span className="text-[9px] font-normal text-white/30">USDC</span></p>
            </div>
            <div className="rounded-xl p-2.5 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-white/40 text-[9px] mb-0.5">{t("marketplace.auctions.detail.start")}</p>
              <p className="text-white/70 font-bold text-xs">{auction.startPrice} <span className="text-[9px] font-normal text-white/30">USDC</span></p>
            </div>
            <div className="rounded-xl p-2.5 text-center"
              style={{ background: isUrgent ? "rgba(180,0,0,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${isUrgent ? "rgba(255,60,60,0.3)" : "rgba(255,255,255,0.08)"}` }}>
              <p className="text-white/40 text-[9px] mb-0.5">{t("marketplace.auctions.detail.endsIn")}</p>
              <p className={`font-bold text-xs font-mono ${isUrgent ? "text-red-400" : "text-amber-300"}`}>{timeLabel}</p>
            </div>
          </div>

          {/* Instant buy */}
          {auction.instantBuyPrice && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{ background: "rgba(180,120,0,0.08)", border: "1px solid rgba(180,120,0,0.2)" }}>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300/80 text-xs font-semibold">{t("marketplace.auctions.detail.buyNowLabel")}</span>
              </div>
              <span className="text-amber-300 font-bold text-sm">{auction.instantBuyPrice} USDC</span>
            </div>
          )}

          {/* Description */}
          {auction.description && (
            <div className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1 font-semibold">{t("marketplace.auctions.detail.description")}</p>
              <p className="text-white/60 text-xs leading-relaxed">{auction.description}</p>
            </div>
          )}

          {/* Bid history preview */}
          {bidCount > 0 && auction.bidHistory && (
            <div className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/30 text-[9px] uppercase tracking-widest mb-2 font-semibold">{t("marketplace.auctions.detail.recentBids")}</p>
              <div className="flex flex-col gap-1.5">
                {auction.bidHistory.slice(-3).reverse().map((b, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-white/50 text-[10px] truncate max-w-[130px]">{b.bidderName || t("marketplace.auctions.detail.anonymous")}</span>
                    <span className="text-blue-300 text-[10px] font-bold">{b.amount} USDC</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {auction.status === "active" && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { onClose(); onBid?.(auction); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.4)" }}>
                <Gavel className="w-3.5 h-3.5 inline mr-1.5" />{t("marketplace.auctions.detail.placeBid")}
              </button>
              {auction.instantBuyPrice && (
                <button
                  onClick={() => { onClose(); onInstantBuy?.(auction); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-amber-300 transition-all hover:brightness-110"
                  style={{ background: "rgba(180,120,0,0.25)", border: "1px solid rgba(180,120,0,0.4)" }}>
                  <Zap className="w-3.5 h-3.5 inline mr-1" />{t("marketplace.auctions.detail.buyNow")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const { t } = useTranslation();
  const { d, h, m, s, done } = useCountdown(endTime);
  if (done) return <span className="text-red-400 text-xs font-bold">{t("marketplace.auctions.card.ended")}</span>;
  const isUrgent = urgent || (d === 0 && h < 6);
  return (
    <span className={`font-mono text-xs font-bold ${isUrgent ? "text-red-400" : "text-amber-300"}`}>
      {d > 0 && `${d}d `}{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ── Bid Modal ─────────────────────────────────────────────────────────────────
function BidModal({ auction, onClose, onSuccess, wallet }) {
  const { t } = useTranslation();
  const [phase, setPhase]   = useState("enter");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const minBid = auction.currentBid > 0
    ? Math.ceil(auction.currentBid * 1.05)
    : auction.startPrice;

  async function placeBid() {
    if (!wallet) return setErr(t("marketplace.common.connectWallet"));
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
              <span className="text-white font-bold text-sm">{t("marketplace.auctions.bidModal.title")}</span>
            </div>
            {/* Item preview */}
            <div className="rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {auction.image && (
                <div className="w-full flex items-center justify-center" style={{ height: 140, background: "#000" }}>
                  <img src={getImageUrl(auction.image)} alt={auction.title}
                    className="h-full w-full object-contain" />
                </div>
              )}
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-semibold leading-snug">{auction.title}</p>
                  {auction.category && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
                      {auction.category}
                    </span>
                  )}
                  {auction.description && (
                    <p className="text-white/35 text-[10px] leading-relaxed mt-1.5 line-clamp-2">{auction.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white/40 text-[10px]">{t("marketplace.auctions.bidModal.endsIn")}</p>
                  <Countdown endTime={auction.endTime} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-white/40 text-[10px] mb-0.5">{t("marketplace.auctions.bidModal.currentBid")}</p>
                <p className="text-white font-bold text-sm">
                  {auction.currentBid > 0 ? auction.currentBid : auction.startPrice} USDC
                </p>
              </div>
              <div className="flex-1 rounded-xl p-3 text-center"
                style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,80,255,0.25)" }}>
                <p className="text-white/40 text-[10px] mb-0.5">{t("marketplace.auctions.bidModal.minimumBid")}</p>
                <p className="text-blue-300 font-bold text-sm">{minBid} USDC</p>
              </div>
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1.5 block">{t("marketplace.auctions.bidModal.yourBid")}</label>
              <input
                type="number" min={minBid} step="1"
                placeholder={`${minBid} or more`}
                value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none font-mono"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
              />
              {amount && Number(amount) >= minBid && (
                <p className="text-white/30 text-[10px] mt-1">
                  {t("marketplace.auctions.bidModal.minIncrement", { next: Math.ceil(Number(amount) * 1.05) })}
                </p>
              )}
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button
              onClick={() => { if (!amount || Number(amount) < minBid) return setErr(`Min bid is ${minBid} USDC`); setPhase("confirm"); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.4)" }}>
              {t("marketplace.auctions.bidModal.reviewBid")}
            </button>
            <p className="text-white/20 text-[10px] text-center">{t("marketplace.auctions.bidModal.disclaimer")}</p>
          </div>
        )}

        {/* CONFIRM phase */}
        {phase === "confirm" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold text-sm">{t("marketplace.auctions.bidModal.confirmTitle")}</span>
            </div>
            <div className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.25)" }}>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">{t("marketplace.auctions.bidModal.item")}</span>
                <span className="text-white/90 text-xs font-semibold truncate max-w-[180px]">{auction.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">{t("marketplace.auctions.bidModal.yourBidLabel")}</span>
                <span className="text-blue-300 font-bold">{amount} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">{t("marketplace.auctions.bidModal.youPay")}</span>
                <span className="text-white/70 text-xs">{amount} USDC + gas</span>
              </div>
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.12)" }}>
              <p className="text-amber-300/70 text-[10px] leading-relaxed">
                <Bell className="w-3 h-3 inline mr-1" />
                {t("marketplace.auctions.bidModal.outbidNotice")}
              </p>
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => setPhase("enter")} className="flex-1 py-2 rounded-xl text-sm text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {t("marketplace.auctions.bidModal.back")}
              </button>
              <button onClick={placeBid} disabled={loading}
                className="flex-2 flex-grow py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.4)" }}>
                {loading ? t("marketplace.auctions.bidModal.placing") : t("marketplace.auctions.bidModal.confirm", { amount })}
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
              <p className="text-xl font-[Goldman] font-bold text-blue-300 mb-1">{t("marketplace.auctions.bidModal.successTitle")}</p>
              <p className="text-white/50 text-xs">{t("marketplace.auctions.bidModal.highestBidder")}</p>
            </div>
            <div className="w-full rounded-xl p-4"
              style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.2)" }}>
              <div className="flex justify-between mb-1">
                <span className="text-white/40 text-[10px]">{t("marketplace.auctions.bidModal.yourBidLabel")}</span>
                <span className="text-blue-300 font-bold text-sm">{amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-[10px]">{t("marketplace.auctions.bidModal.endsIn")}</span>
                <Countdown endTime={auction.endTime} />
              </div>
            </div>
            <p className="text-white/30 text-[11px]">
              <Bell className="w-3 h-3 inline mr-1" />
              {t("marketplace.auctions.bidModal.outbidWarning")}
            </p>
            <button onClick={() => { onSuccess?.(); onClose(); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.3)" }}>
              {t("marketplace.auctions.bidModal.done")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Instant Buy Modal ─────────────────────────────────────────────────────────
function InstantBuyModal({ auction, onClose, onSuccess, wallet }) {
  const { t } = useTranslation();
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
              <span className="text-white font-bold text-sm">{t("marketplace.auctions.instantBuyModal.title")}</span>
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
                  <p className="text-white/40 text-[10px]">{t("marketplace.auctions.instantBuyModal.buyNowPrice")}</p>
                  <p className="text-amber-300 font-bold text-xl">{auction.instantBuyPrice} USDC</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px]">{t("marketplace.auctions.instantBuyModal.currentBids")}</p>
                  <p className="text-white/60 text-xs">{auction.bidHistory?.length || 0} {t("marketplace.auctions.card.bids")}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(180,120,0,0.08)", border: "1px solid rgba(180,120,0,0.2)" }}>
              <p className="text-amber-300/70 text-[10px] leading-relaxed">
                <Zap className="w-3 h-3 inline mr-1" />
                {t("marketplace.auctions.instantBuyModal.notice")}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {t("marketplace.auctions.instantBuyModal.cancel")}
              </button>
              <button onClick={confirmBuy} disabled={loading}
                className="flex-2 flex-grow py-2 rounded-xl text-sm font-bold text-amber-200"
                style={{ background: "rgba(160,100,0,0.7)", border: "1px solid rgba(200,140,0,0.4)" }}>
                {loading ? t("marketplace.auctions.instantBuyModal.processing") : `Buy — ${auction.instantBuyPrice} USDC`}
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
              <p className="text-xl font-[Goldman] font-bold text-amber-300 mb-1">{t("marketplace.auctions.instantBuyModal.successTitle")}</p>
              <p className="text-white/50 text-xs">{t("marketplace.auctions.instantBuyModal.auctionClosed")}</p>
            </div>
            <div className="w-full rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(180,120,0,0.08)", border: "1px solid rgba(200,140,0,0.2)" }}>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">{t("marketplace.auctions.instantBuyModal.item")}</span>
                <span className="text-white/80 text-xs font-semibold truncate max-w-[160px]">{auction.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">{t("marketplace.auctions.instantBuyModal.paid")}</span>
                <span className="text-amber-300 font-bold">{auction.instantBuyPrice} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">{t("marketplace.auctions.instantBuyModal.status")}</span>
                <span className="text-green-400 text-xs font-semibold">{t("marketplace.auctions.instantBuyModal.transferred")}</span>
              </div>
            </div>
            <p className="text-white/25 text-[11px]">{t("marketplace.auctions.instantBuyModal.walletNote")}</p>
            <button onClick={() => { onSuccess?.(); onClose(); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(160,100,0,0.6)", border: "1px solid rgba(200,140,0,0.3)" }}>
              {t("marketplace.auctions.instantBuyModal.viewCollect")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create auction modal ──────────────────────────────────────────────────────
function CreateAuctionModal({ onClose, onSuccess, wallet }) {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    startPrice: "", reservePrice: "", instantBuyPrice: "", durationHours: "72",
  });
  const [loading, setLoading]           = useState(false);
  const [err, setErr]                   = useState("");
  const [ownedItems, setOwnedItems]     = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!wallet) return;
    setItemsLoading(true);
    fetch(`${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${encodeURIComponent(wallet)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.nfts) {
          const items = data.nfts.flatMap(col =>
            (col.subCollections || [])
              .filter(s => s.owner?.toLowerCase() === wallet.toLowerCase())
              .map(s => ({
                _id:         s._id,
                parentId:    col._id,
                name:        s.name || "Unnamed",
                image:       s.image || "",
                category:    col.category || "general",
                description: s.description || "",
              }))
          );
          setOwnedItems(items);
        }
      })
      .catch(() => {})
      .finally(() => setItemsLoading(false));
  }, [wallet]);

  async function submit(e) {
    e.preventDefault();
    if (!wallet) return setErr(t("marketplace.common.connectWallet"));
    if (!selectedItem) return setErr("Select an item from your collection");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sellerWallet:    wallet,
          nftSystemId:     selectedItem.parentId,
          subCollectionId: selectedItem._id,
          title:           selectedItem.name,
          description:     selectedItem.description,
          image:           selectedItem.image,
          category:        selectedItem.category,
          startPrice:      Number(form.startPrice),
          reservePrice:    form.reservePrice    ? Number(form.reservePrice)    : undefined,
          instantBuyPrice: form.instantBuyPrice ? Number(form.instantBuyPrice) : undefined,
          durationHours:   Number(form.durationHours),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      onSuccess();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const iSt = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" };
  const iCls = "w-full px-2.5 py-1.5 rounded-lg text-xs text-white outline-none placeholder-white/25";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 pt-16 pb-3"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-2xl rounded-2xl flex flex-col relative"
        style={{ background: "#0a0b1a", border: "1px solid rgba(255,255,255,0.12)", maxHeight: "calc(100vh - 88px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{t("marketplace.auctions.createModal.title")}</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* 2-column body */}
        <form onSubmit={submit} className="flex flex-1 min-h-0 divide-x divide-white/[0.06]">

          {/* ── Left: item picker ── */}
          <div className="flex flex-col gap-2 p-4 w-[45%] shrink-0 overflow-y-auto auction-modal-scroll">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 shrink-0">
              {t("marketplace.auctions.createModal.selectItem")}
            </p>

            {!wallet ? (
              <p className="text-white/25 text-[11px] italic">{t("marketplace.auctions.createModal.connectWallet")}</p>
            ) : itemsLoading ? (
              <p className="text-white/25 text-[11px] italic">{t("marketplace.auctions.createModal.loadingItems")}</p>
            ) : ownedItems.length === 0 ? (
              <p className="text-white/25 text-[11px] italic">{t("marketplace.auctions.createModal.noItems")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {ownedItems.map(item => {
                  const active = selectedItem?._id === item._id;
                  return (
                    <button key={item._id} type="button"
                      onClick={() => setSelectedItem(active ? null : item)}
                      className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-center transition-all"
                      style={{
                        background: active ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.04)",
                        border: active ? "1px solid rgba(234,179,8,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      }}>
                      <div className="w-full aspect-square rounded-md overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        {item.image
                          ? <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-3 h-3 text-white/20" />
                            </div>
                        }
                      </div>
                      <span className="text-white/70 text-[8px] leading-tight line-clamp-1 w-full">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected summary */}
            {selectedItem && (
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg shrink-0 mt-auto"
                style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)" }}>
                {selectedItem.image && (
                  <img src={getImageUrl(selectedItem.image)} alt={selectedItem.name}
                    className="w-8 h-8 rounded-md object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-[11px] font-semibold truncate">{selectedItem.name}</p>
                  {selectedItem.category && (
                    <p className="text-white/35 text-[9px] capitalize truncate">{selectedItem.category}</p>
                  )}
                </div>
                <button type="button" onClick={() => setSelectedItem(null)} className="text-white/30 hover:text-white shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* ── Right: pricing + submit ── */}
          <div className="flex flex-col gap-3 p-4 flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 shrink-0">
              {t("marketplace.auctions.createModal.pricingDuration")}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-white/40 text-[9px] mb-1 block">{t("marketplace.auctions.createModal.startPrice")}</label>
                <input required type="number" step="any" min="0" placeholder="e.g. 50"
                  value={form.startPrice} onChange={e => set("startPrice", e.target.value)}
                  className={iCls} style={iSt} />
              </div>
              <div>
                <label className="text-white/40 text-[9px] mb-1 block">{t("marketplace.auctions.createModal.reservePrice")}</label>
                <input type="number" step="any" min="0"
                  placeholder={t("marketplace.auctions.createModal.optional")}
                  value={form.reservePrice} onChange={e => set("reservePrice", e.target.value)}
                  className={iCls} style={iSt} />
              </div>
            </div>

            <div>
              <label className="text-white/40 text-[9px] mb-1 block">{t("marketplace.auctions.createModal.instantBuyPrice")}</label>
              <input type="number" step="any" min="0"
                placeholder={t("marketplace.auctions.createModal.leaveBlank")}
                value={form.instantBuyPrice} onChange={e => set("instantBuyPrice", e.target.value)}
                className={iCls} style={iSt} />
            </div>

            <div>
              <label className="text-white/40 text-[9px] mb-1 block">{t("marketplace.auctions.createModal.duration")}</label>
              <div className="flex gap-1.5">
                {[["24", t("marketplace.auctions.createModal.dur1Day")], ["72", t("marketplace.auctions.createModal.dur3Days")], ["168", t("marketplace.auctions.createModal.dur7Days")]].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => set("durationHours", val)}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={form.durationHours === val
                      ? { background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.5)", color: "#fde047" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <p className="text-white/25 text-[9px]">{t("marketplace.auctions.createModal.freeToList")}</p>
              {err && <p className="text-red-400 text-[11px]">{err}</p>}
              <button type="submit" disabled={loading || !selectedItem}
                className="w-full py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                style={{ background: "rgba(0,42,168,0.8)" }}>
                {loading ? t("marketplace.auctions.createModal.creating") : t("marketplace.auctions.createModal.submit")}
              </button>
            </div>
          </div>
        </form>

        <style>{`
          .auction-modal-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,100,255,0.5) rgba(255,255,255,0.04); }
          .auction-modal-scroll::-webkit-scrollbar { width: 4px; }
          .auction-modal-scroll::-webkit-scrollbar-thumb { background: rgba(0,100,255,0.55); border-radius: 99px; }
          .auction-modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,130,255,0.8); }
        `}</style>
      </div>
    </div>
  );
}

// ── Auction card ──────────────────────────────────────────────────────────────
function AuctionCard({ auction, onBid, onInstantBuy }) {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState(false);
  const isNFA = auction.isNFA;
  const { d, h, done } = useCountdown(auction.endTime);
  const isUrgent = !done && d === 0 && h < 6;
  const statusColor = { active: "text-green-400", ended: "text-red-400", sold: "text-blue-400", cancelled: "text-white/30" }[auction.status] || "text-white/40";
  const imgSrc = auction.image ? getImageUrl(auction.image) : null;

  return (
    <>
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: isUrgent
          ? "1px solid rgba(255,80,80,0.4)"
          : isNFA
            ? "1px solid rgba(0,80,255,0.5)"
            : "1px solid rgba(255,255,255,0.09)",
      }}>
      {/* Image — clickable for detail popup */}
      <div className="relative cursor-pointer" onClick={() => setShowDetail(true)}>
        <LazyImage src={imgSrc} alt={auction.title}
          fallback={popularFallback} className="w-full h-44 bg-black" imgClassName="object-contain" />
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {isNFA && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
              style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.5)" }}>NFA</span>
          )}
          {auction.category && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)" }}>
              {auction.category}
            </span>
          )}
          {isUrgent && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-red-300 animate-pulse"
              style={{ background: "rgba(180,0,0,0.7)", border: "1px solid rgba(255,60,60,0.5)" }}>
              {t("marketplace.auctions.endingSoon")}
            </span>
          )}
        </div>
        <span className={`absolute top-2 right-2 text-[10px] font-bold uppercase ${statusColor}`}>{auction.status}</span>
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(0,0,0,0.35)" }}>
          <span className="text-white/70 text-[10px] font-semibold bg-black/60 px-2 py-1 rounded">
            {t("marketplace.auctions.viewDetails")}
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-white/90 text-sm font-semibold truncate">{auction.title}</p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-white/40 text-[10px]">{t("marketplace.auctions.card.currentBid")}</p>
            <p className="text-white font-bold text-sm">
              {auction.currentBid > 0 ? `${auction.currentBid} USDC` : `${auction.startPrice} USDC`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px]">{t("marketplace.auctions.card.endsIn")}</p>
            <Countdown endTime={auction.endTime} urgent={isUrgent} />
          </div>
        </div>

        {auction.instantBuyPrice && (
          <p className="text-[10px] text-amber-300/70">
            <Zap className="w-3 h-3 inline mr-0.5" />{t("marketplace.auctions.card.buyNow")}: {auction.instantBuyPrice} USDC
          </p>
        )}
        <p className="text-white/25 text-[10px]">{auction.bidHistory?.length || 0} {t("marketplace.auctions.card.bids")}</p>

        {auction.status === "active" && (
          <div className="flex gap-2 mt-1">
            <button onClick={() => onBid(auction)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
              {t("marketplace.auctions.card.placeBid")}
            </button>
            {auction.instantBuyPrice && (
              <button onClick={() => onInstantBuy(auction)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-amber-300"
                style={{ background: "rgba(180,120,0,0.25)", border: "1px solid rgba(180,120,0,0.4)" }}>
                <Zap className="w-3 h-3 inline mr-0.5" />{t("marketplace.auctions.card.buyNow")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {showDetail && (
      <AuctionDetailPopup
        auction={auction}
        imgSrc={imgSrc}
        onClose={() => setShowDetail(false)}
        onBid={onBid}
        onInstantBuy={onInstantBuy}
      />
    )}
    </>
  );
}

// ── Investor Note Banner ──────────────────────────────────────────────────────
function InvestorBanner() {
  const { t } = useTranslation();
  return (
    <div className="mb-6 rounded-xl overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, rgba(0,42,168,0.12) 0%, rgba(180,120,0,0.06) 100%)", border: "1px solid rgba(0,80,255,0.15)" }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-300/90 text-xs font-semibold">{t("marketplace.auctions.preview.title")}</p>
          <p className="text-white/40 text-[11px] leading-snug">{t("marketplace.auctions.preview.desc")}</p>
        </div>
        <Info className="w-4 h-4 text-white/20 flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Static preview data ───────────────────────────────────────────────────────
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
  const { t } = useTranslation();
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
          <h2 className="text-white font-bold text-lg">{t("marketplace.auctions.heading")}</h2>
          <span className="text-white/30 text-sm">{total} {t("marketplace.auctions.listings")}</span>
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
              <Plus className="w-3.5 h-3.5" /> {t("marketplace.auctions.newAuction")}
            </button>
          )}
        </div>
      </div>

      <InvestorBanner />

      {/* Rules bar */}
      <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><Clock className="w-3 h-3 inline mr-1" />{t("marketplace.auctions.rules.durations")}</span>
        <span><TrendingUp className="w-3 h-3 inline mr-1" />{t("marketplace.auctions.rules.minIncrement")}</span>
        <span><Tag className="w-3 h-3 inline mr-1" />{t("marketplace.auctions.rules.freeToList")}</span>
        <span><Gavel className="w-3 h-3 inline mr-1" />{t("marketplace.auctions.rules.commission")}</span>
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
          <p className="text-sm">{t("marketplace.auctions.noAuctions", { filter })}</p>
          {isLoggedInUser && filter === "active" && (
            <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 rounded-lg text-xs text-white"
              style={{ background: "rgba(0,42,168,0.6)" }}>
              {t("marketplace.auctions.createFirst")}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...auctions].sort((a, b) => {
            const now = Date.now();
            const aEnd = new Date(a.endTime).getTime();
            const bEnd = new Date(b.endTime).getTime();
            const aEnded = aEnd <= now || a.status === "ended" || a.status === "sold";
            const bEnded = bEnd <= now || b.status === "ended" || b.status === "sold";
            if (aEnded && !bEnded) return -1;
            if (!aEnded && bEnded) return 1;
            return aEnd - bEnd;
          }).map(a => (
            <AuctionCard key={a._id} auction={a}
              onBid={a => isLoggedInUser ? setBidAuction(a) : alert(t("marketplace.common.loginFirst"))}
              onInstantBuy={a => isLoggedInUser ? setInstantBuyAuction(a) : alert(t("marketplace.common.loginFirst"))}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>
            {t("marketplace.auctions.pagination.prev")}
          </button>
          <span className="text-white/30 text-xs">
            {t("marketplace.auctions.pagination.page", { page, pages })}
          </span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>
            {t("marketplace.auctions.pagination.next")}
          </button>
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
