import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import {
  ArrowRightLeft, Plus, X, Clock, CheckCircle2, Info, Package, ChevronDown,
} from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  open:      "text-green-400",
  accepted:  "text-amber-300",
  completed: "text-blue-400",
  cancelled: "text-white/25",
  expired:   "text-red-400",
};

// ── Accept Trade Modal ────────────────────────────────────────────────────────
function AcceptTradeModal({ trade, onClose, wallet, token, onSuccess }) {
  const [phase, setPhase] = useState("review"); // review | confirm | sent
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleAccept() {
    if (!wallet) return setErr("Connect your wallet to accept this trade");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade/${trade._id}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ acceptedByWallet: wallet }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to accept trade");
      setPhase("sent");
      onSuccess?.();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        style={{ background: "#080916", border: "1px solid rgba(0,80,255,0.25)" }}>
        <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white z-10">
          <X className="w-4 h-4" />
        </button>

        {/* ── Review phase ── */}
        {phase === "review" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold text-sm">Trade Proposal</span>
            </div>

            <div className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-white font-semibold text-sm">{trade.title}</p>
              <p className="text-white/50 text-xs leading-relaxed">{trade.description}</p>
              <p className="text-white/30 text-[10px] mt-1">Posted by {trade.posterName}</p>
            </div>

            <div className="rounded-xl p-3 flex flex-col gap-2"
              style={{ background: "rgba(0,42,168,0.08)", border: "1px solid rgba(0,80,255,0.2)" }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-300/80 text-[11px] font-semibold">Exchange Details</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-[10px]">They offer</span>
                  <span className="text-green-300 text-[11px] font-semibold">{trade.offering}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-[10px]">They want</span>
                  <span className="text-red-300/80 text-[11px] font-semibold">{trade.requesting}</span>
                </div>
              </div>
            </div>

            {err && <p className="text-red-400 text-xs">{err}</p>}

            <button onClick={() => setPhase("confirm")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.4)" }}>
              Accept This Trade
            </button>
            <p className="text-white/20 text-[10px] text-center">Platform fee applies to both parties</p>
          </div>
        )}

        {/* ── Confirm phase ── */}
        {phase === "confirm" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold text-sm">Confirm Trade</span>
            </div>
            <div className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Trade</span>
                <span className="text-white/80 text-xs font-semibold truncate max-w-[160px]">{trade.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Posted by</span>
                <span className="text-white/60 text-xs">{trade.posterName}</span>
              </div>
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/40 text-[10px] leading-relaxed">
                By accepting, you agree to the exchange terms. The poster will be notified and must confirm before items are transferred.
              </p>
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <div className="flex gap-2">
              <button onClick={() => setPhase("review")} className="flex-1 py-2 rounded-xl text-sm text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Back
              </button>
              <button onClick={handleAccept} disabled={loading}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.4)", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Sending…" : "Confirm"}
              </button>
            </div>
          </div>
        )}

        {/* ── Sent phase ── */}
        {phase === "sent" && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,80,255,0.15)", border: "2px solid rgba(0,120,255,0.5)" }}>
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-[Goldman] font-bold mb-1 text-blue-300">Proposal Sent!</p>
              <p className="text-white/50 text-xs">{trade.posterName} has been notified</p>
            </div>
            <div className="w-full rounded-xl p-4 text-left"
              style={{ background: "rgba(0,42,168,0.08)", border: "1px solid rgba(0,80,255,0.2)" }}>
              <p className="text-white/50 text-[11px] leading-relaxed">
                The trade poster will review your proposal and arrange the exchange. Check your notifications for their response.
              </p>
              <p className="text-white/30 text-[10px] mt-1">⏱ Proposals expire in 30 days if not confirmed.</p>
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.6)", border: "1px solid rgba(0,80,255,0.3)" }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Trade Card ────────────────────────────────────────────────────────────────
function TradeCard({ trade, onAccept, currentWallet }) {
  const isPoster = trade.posterWallet === currentWallet;
  const statusColor = STATUS_COLOR[trade.status] || "text-white/40";

  return (
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}>
      {trade.image && (
        <LazyImage src={getImageUrl(trade.image)} alt={trade.title} fallback={popularFallback}
          className="w-full h-32" imgClassName="object-cover" />
      )}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,80,255,0.18)", color: "rgba(100,160,255,0.9)" }}>
            trade
          </span>
          <span className={`text-[10px] font-bold uppercase ml-auto ${statusColor}`}>{trade.status}</span>
          {isPoster && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
              yours
            </span>
          )}
        </div>

        <p className="text-white/90 text-sm font-semibold truncate">{trade.title}</p>
        {trade.description && (
          <p className="text-white/40 text-[11px] leading-snug line-clamp-2">{trade.description}</p>
        )}

        <div className="text-xs space-y-0.5 mt-0.5">
          <div className="flex justify-between items-center gap-2">
            <span className="text-white/30 text-[10px] shrink-0">Offering</span>
            <span className="text-green-300/80 text-[11px] font-medium truncate text-right">{trade.offering || "—"}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-white/30 text-[10px] shrink-0">Wanting</span>
            <span className="text-blue-300/80 text-[11px] font-medium truncate text-right">{trade.requesting || "Make an offer"}</span>
          </div>
        </div>

        <p className="text-white/25 text-[10px]">by {trade.posterName}</p>

        {trade.status === "open" && !isPoster && (
          <button
            onClick={() => onAccept(trade)}
            className="mt-auto w-full py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)", color: "#fff" }}
          >
            Accept Trade
          </button>
        )}
      </div>
    </div>
  );
}

// ── Fixed categories ──────────────────────────────────────────────────────────
const TRADE_CATEGORIES = [
  "Skins",
  "Military Badges",
  "Specialists",
  "Weapons",
  "Body Armour",
  "Spaceships",
  "Racing Vehicles",
  "Artwork",
  "Land and Bases",
  "General",
];

// ── Create Trade Modal ────────────────────────────────────────────────────────
function CreateTradeModal({ onClose, onSuccess, wallet, token, posterName }) {
  // Owned items
  const [myItems, setMyItems]   = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // NFT object from owned items

  // Form fields
  const [manualOffering, setManualOffering] = useState(""); // used when no item selected
  const [description, setDescription] = useState("");
  const [reqCategory, setReqCategory] = useState("");
  const [reqItem, setReqItem]         = useState("");
  const [openOffer, setOpenOffer]     = useState(false);

  // Custom image (only used if no selectedItem)
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const iCls = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none placeholder-white/25";
  const iSt  = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" };

  // Fetch user's owned items
  useEffect(() => {
    if (!wallet) return;
    setItemsLoading(true);
    fetch(`${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${wallet}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.nfts) {
          // Flatten sub-collections that the wallet owns
          const items = [];
          data.nfts.forEach((col) => {
            (col.subCollections || []).forEach((sub) => {
              if (sub.owner?.toLowerCase() === wallet.toLowerCase()) {
                items.push({
                  _id:      sub._id,
                  name:     sub.name || col.name,
                  image:    sub.image || col.image || "",
                  category: sub.category || col.category || "",
                });
              }
            });
          });
          setMyItems(items);
        }
      })
      .catch(() => {})
      .finally(() => setItemsLoading(false));
  }, [wallet]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearCustomImage() {
    setImageFile(null);
    setImagePreview("");
  }

  // Derived values — selectedItem takes priority over manual text
  const offeringName     = selectedItem?.name     || manualOffering;
  const offeringCategory = selectedItem?.category || "";
  const offeringImageSrc = selectedItem ? getImageUrl(selectedItem.image) : imagePreview;

  async function submit(e) {
    e.preventDefault();
    if (!wallet) return setErr("Connect your wallet first");
    if (!offeringName.trim()) return setErr("Describe what you're offering");
    const authToken = token || localStorage.getItem("token");
    if (!authToken) return setErr("Please log in first");
    setLoading(true); setErr("");
    try {
      const requesting = openOffer
        ? "Make me an offer"
        : `${reqCategory ? reqCategory + " — " : ""}${reqItem}`.trim();
      if (!openOffer && !reqItem) {
        setErr("Specify what you want in return, or enable open offer");
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("type", "trade");
      fd.append("posterWallet", wallet);
      fd.append("posterName", posterName);
      fd.append("reward", "0");
      fd.append("title", offeringName
        ? `${offeringName} ↔ ${openOffer ? "Open Offer" : (reqItem || "?")}`
        : "Trade Offer");
      fd.append("description", description);
      fd.append("offering", offeringName || "");
      fd.append("requesting", requesting);
      fd.append("category", offeringCategory);
      // Image: use selected item image URL if available, otherwise upload file
      if (!selectedItem && imageFile) {
        fd.append("image", imageFile);
      } else if (selectedItem?.image) {
        // Pass existing URL as text — no upload needed
        fd.append("imageUrl", selectedItem.image);
      }

      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: fd,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      onSuccess();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col relative"
        style={{
          background: "#0a0b1a",
          border: "1px solid rgba(255,255,255,0.12)",
          maxHeight: "90dvh",
        }}>

        {/* Header — sticky, never scrolls */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <span className="text-white font-bold text-sm">Post a Trade</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto trade-modal-scroll flex-1">
        <form onSubmit={submit} className="p-6 flex flex-col gap-5">
          {/* ── Section 1: What you're offering ── */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Your Item — What You're Offering
            </p>
            {wallet && itemsLoading && (
              <p className="text-white/25 text-xs italic">Loading your items…</p>
            )}
            {wallet && !itemsLoading && myItems.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1"
                style={{ scrollbarWidth: "thin" }}>
                {myItems.map((item) => {
                  const active = selectedItem?._id === item._id;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setSelectedItem(active ? null : item)}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-center transition-all"
                      style={{
                        background: active ? "rgba(0,80,255,0.18)" : "rgba(255,255,255,0.04)",
                        border: active ? "1px solid rgba(0,120,255,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      }}>
                      <div className="w-full aspect-square rounded-lg overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        {item.image
                          ? <img src={getImageUrl(item.image)} alt={item.name}
                              className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-white/20" />
                            </div>
                        }
                      </div>
                      <span className="text-white/70 text-[9px] leading-tight line-clamp-2 w-full">{item.name}</span>
                      {item.category && (
                        <span className="text-white/30 text-[8px] truncate w-full">{item.category}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected item summary OR empty state */}
            {selectedItem ? (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(0,80,255,0.1)", border: "1px solid rgba(0,120,255,0.3)" }}>
                {selectedItem.image && (
                  <img src={getImageUrl(selectedItem.image)} alt={selectedItem.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-xs font-semibold truncate">{selectedItem.name}</p>
                  {selectedItem.category && (
                    <p className="text-white/35 text-[10px]">{selectedItem.category}</p>
                  )}
                </div>
                <button type="button" onClick={() => setSelectedItem(null)}
                  className="text-white/30 hover:text-white shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              !wallet || (!itemsLoading && myItems.length === 0) ? (
                <div className="flex flex-col gap-1.5">
                  <p className="text-white/25 text-[10px] italic">
                    {!wallet ? "Connect wallet to browse your items" : "No owned items found — describe your item manually"}
                  </p>
                  <input
                    required
                    placeholder="Item name e.g. Dragon Slayer Elite, Viper Mk2 *"
                    value={manualOffering}
                    onChange={(e) => setManualOffering(e.target.value)}
                    className={iCls}
                    style={iSt}
                  />
                </div>
              ) : null
            )}
          </div>

          {/* ── Section 2: What you want in return ── */}
          <div className="flex flex-col gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              What You Want in Return
            </p>

            {/* Open offer toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="relative w-9 h-5 shrink-0">
                <input type="checkbox" className="sr-only" checked={openOffer}
                  onChange={(e) => setOpenOffer(e.target.checked)} />
                <div className="block rounded-full h-5 w-9 transition-colors"
                  style={{ background: openOffer ? "rgba(0,100,255,0.7)" : "rgba(255,255,255,0.12)" }} />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: openOffer ? "translateX(16px)" : "translateX(0)" }} />
              </div>
              <div>
                <span className="text-white/70 text-xs font-medium">Open offer</span>
                <span className="text-white/30 text-[10px] ml-1.5">— let anyone propose what they'll give you</span>
              </div>
            </label>

            {!openOffer && (
              <div className="flex flex-col gap-2 mt-1">
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value)}
                  className={iCls}
                  style={{ ...iSt, background: "#10112a" }}>
                  <option value="">Any category</option>
                  {TRADE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  required={!openOffer}
                  placeholder="Item name e.g. Dragon Slayer Elite, Scout Vessel Mk2 *"
                  value={reqItem}
                  onChange={(e) => setReqItem(e.target.value)}
                  className={iCls}
                  style={iSt}
                />
              </div>
            )}
          </div>

          {/* ── Section 3: Optional details ── */}
          <div className="flex flex-col gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Additional Details (optional)
            </p>
            <textarea
              placeholder="Any notes about condition, trade terms, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={iCls}
              style={iSt}
            />

            {/* Custom image — only if no item selected from collection */}
            {!selectedItem && (
              <div className="flex flex-col gap-1.5">
                <label className="text-white/30 text-[10px]">Upload item image (optional)</label>
                <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:brightness-110"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)" }}>
                  <Package className="w-3.5 h-3.5 text-white/25 shrink-0" />
                  <span className="text-white/30 text-xs truncate">
                    {imageFile ? imageFile.name : "Choose image…"}
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={clearCustomImage}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.7)" }}>
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info strip */}
          <div className="px-3 py-2 rounded-lg text-[10px] text-white/30"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            Both parties pay a platform fee · Listing expires in 30 days · NFAs cannot be traded — sell only
          </div>

          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" disabled={loading}
            className="py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: "rgba(0,42,168,0.8)",
              border: "1px solid rgba(0,80,255,0.4)",
              opacity: loading ? 0.5 : 1,
            }}>
            {loading ? "Posting…" : "Post Trade"}
          </button>
        </form>
        </div>{/* end scrollable body */}

        <style>{`
          .trade-modal-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(0,100,255,0.5) rgba(255,255,255,0.04);
          }
          .trade-modal-scroll::-webkit-scrollbar {
            width: 5px;
          }
          .trade-modal-scroll::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.03);
            border-radius: 99px;
          }
          .trade-modal-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,100,255,0.55);
            border-radius: 99px;
          }
          .trade-modal-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(0,130,255,0.8);
          }
        `}</style>
      </div>
    </div>
  );
}

// ── Static preview data ───────────────────────────────────────────────────────
const PREVIEW_TRADES = [
  { _id: "pt-2", type: "trade", status: "open", title: "Dual Badge Swap", description: "Have Commander's Cross and Iron Shield Badge. Looking for Star of Honour.", offering: "Commander's Cross + Iron Shield Badge", requesting: "Star of Honour", reward: 0, posterName: "MedalCollector" },
  { _id: "pt-4", type: "trade", status: "open", title: "Viper Fighter for Land Plot", description: "Trading my Viper Fighter Mk1 in exchange for a strategic land plot. Desert or Arctic locations preferred.", offering: "Viper Fighter Mk1", requesting: "Any Land Plot (Desert/Arctic)", reward: 0, posterName: "PilotZero" },
  { _id: "pt-6", type: "trade", status: "open", title: "Assault Rifle for Stealth Kit", description: "Looking to trade my Hyper Assault Rifle for a Stealth Composite Vest.", offering: "Hyper Assault Rifle", requesting: "Stealth Composite Vest", reward: 0, posterName: "ShadowTrader_99" },
  { _id: "pt-9", type: "trade", status: "open", title: "Nano-Mesh Vest for Plasma Pistol", description: "I have a Nano-Mesh Vest — fair swap for Plasma Pistol Mk2.", offering: "Nano-Mesh Vest", requesting: "Plasma Pistol Mk2", reward: 0, posterName: "ArmorDealer_X" },
  { _id: "pt-10", type: "trade", status: "open", title: "Spaceship for Body Armour Set", description: "Trading Scout Vessel for a full body armour set. Open to offers.", offering: "Scout Vessel Mk2", requesting: "Make me an offer", reward: 0, posterName: "SpaceJockey77" },
  { _id: "pt-11", type: "trade", status: "open", title: "Rare Skin Bundle for Weapons", description: "Bundle of 3 rare skins. Willing to trade for high-tier weapons.", offering: "3x Rare Skins Bundle", requesting: "High-tier Weapon", reward: 0, posterName: "SkinTrader" },
];

const STATUS_FILTERS = ["open", "accepted", "completed"];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TradesTab() {
  const { user, isLoggedInUser, token } = useSelector((s) => s.auth);
  const { address: wagmiAddress } = useAccount();
  const wallet = wagmiAddress || user?.WalletAddress || user?.MetaMaskAddress || "";
  const posterName = user?.FullName || user?.Email?.split("@")[0] || "Anonymous";

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [acceptTrade, setAcceptTrade] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: "trade", status: statusFilter, page, limit: LIMIT });
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade?${params}`);
      const data = await r.json();
      const fetched = data.trades || [];
      if (fetched.length > 0) {
        setTrades(fetched);
        setTotal(data.total || 0);
      } else if (statusFilter === "open" && page === 1) {
        setTrades(PREVIEW_TRADES);
        setTotal(PREVIEW_TRADES.length);
      } else {
        setTrades([]);
        setTotal(0);
      }
    } catch {
      if (statusFilter === "open" && page === 1) {
        setTrades(PREVIEW_TRADES);
        setTotal(PREVIEW_TRADES.length);
      } else {
        setTrades([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6 relative">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="w-5 h-5 text-white/60" />
          <h2 className="text-white font-bold text-lg">Trades</h2>
          <span className="text-white/30 text-sm">{total} listings</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filters */}
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className="px-2.5 py-1 rounded-full text-xs capitalize"
                style={statusFilter === f
                  ? { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
                {f}
              </button>
            ))}
          </div>
          {isLoggedInUser && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}>
              <Plus className="w-3.5 h-3.5" /> Post Trade
            </button>
          )}
        </div>
      </div>

      {/* ── Info strip ── */}
      <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><Clock className="w-3 h-3 inline mr-1" />Listings expire in 30 days</span>
        <span><CheckCircle2 className="w-3 h-3 inline mr-1" />Platform fee applies to both parties</span>
        <span><Info className="w-3 h-3 inline mr-1" />NFAs cannot be traded — sell only</span>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl h-44 animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/25">
          <ArrowRightLeft className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No {statusFilter} trades</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trades.map((t) => (
            <TradeCard
              key={t._id}
              trade={t}
              currentWallet={wallet}
              onAccept={(t) => setAcceptTrade(t)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>Prev</button>
          <span className="text-white/30 text-xs">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>Next</button>
        </div>
      )}

      {/* ── Modals ── */}
      {acceptTrade && (
        <AcceptTradeModal
          trade={acceptTrade}
          wallet={wallet}
          token={token}
          onClose={() => setAcceptTrade(null)}
          onSuccess={() => { setAcceptTrade(null); fetchTrades(); }}
        />
      )}
      {showCreate && (
        <CreateTradeModal
          wallet={wallet}
          token={token}
          posterName={posterName}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchTrades(); }}
        />
      )}
    </div>
  );
}
