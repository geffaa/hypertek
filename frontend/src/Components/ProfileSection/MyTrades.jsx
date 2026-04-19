import { Fragment, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BACKEND_BASE_URL } from "../../Config";
import toast from "react-hot-toast";

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORY_ORDER = [
  "skins", "military badges", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases", "general",
];

const ACTIVITY_LABELS = {
  selling_general: "Selling General",
  selling_auction: "Selling Auction",
  buying_general:  "Buying General",
  buying_auction:  "Buying Auction",
  trading:         "Trading",
  hiring:          "Hiring",
};

const STATUS_COLORS = {
  active:    { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.5)", text: "#10b981" },
  pending:   { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.5)", text: "#f59e0b" },
  expired:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.5)",  text: "#ef4444" },
  sold:      { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.5)", text: "#6366f1" },
  cancelled: { bg: "rgba(107,114,128,0.15)",border: "rgba(107,114,128,0.5)",text: "#6b7280" },
};

const COL_W = {
  item:     180,
  activity: 140,
  price:    130,
  offer:    130,
  status:   90,
  action:   80,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""; }

function timeLeft(expiresAt) {
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return { label: "Expired", warn: true };
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  const warn = h < 24;
  return { label: d > 0 ? `${d}d ${h % 24}h` : `${h}h left`, warn };
}

function fmt(val) {
  if (val == null) return "—";
  return `$${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.cancelled;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
      padding: "2px 7px", borderRadius: 20, whiteSpace: "nowrap",
      fontFamily: "Orbitron, monospace",
    }}>
      {status.toUpperCase()}
    </span>
  );
}

// ── Row Detail Dropdown ────────────────────────────────────────────────────────
function RowDetail({ listing, onClose, onRenew, onDelete }) {
  const timeInfo = timeLeft(listing.expiresAt);
  const bids     = listing.bidHistory   ?? [];
  const offers   = listing.offerHistory ?? [];

  return (
    <tr>
      <td colSpan={7} style={{ padding: 0 }}>
        <div style={{
          background: "rgba(0,0,0,0.55)", borderBottom: "1px solid rgba(0,212,255,0.2)",
          padding: "14px 20px", display: "flex", gap: 32, flexWrap: "wrap",
        }}>

          {/* Item info */}
          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 6 }}>ITEM DETAILS</div>
            {listing.itemImage && (
              <img src={listing.itemImage} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, marginBottom: 8, border: "1px solid rgba(0,212,255,0.2)" }} />
            )}
            <div style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{listing.itemName}</div>
            {listing.itemDescription && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4, maxWidth: 220 }}>{listing.itemDescription}</div>
            )}
            <div style={{ fontSize: 9, color: timeInfo.warn ? "#ef4444" : "rgba(255,255,255,0.4)", marginTop: 6 }}>
              ⏱ {timeInfo.label}{listing.renewed ? " · Renewed" : ""}
            </div>
          </div>

          {/* Analytics */}
          <div style={{ minWidth: 120 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 6 }}>ANALYTICS</div>
            <Stat label="Views"       value={listing.viewCount ?? 0} />
            <Stat label="Commission"  value={`${listing.commissionTier}%`} />
            <Stat label="Total Bids"  value={bids.length} />
            <Stat label="Total Offers" value={offers.length} />
          </div>

          {/* Bid / Offer history */}
          {bids.length > 0 && (
            <div style={{ minWidth: 200 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 6 }}>BID HISTORY</div>
              {bids.slice(-5).reverse().map((b, i) => (
                <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 3, display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>{b.bidderName}</span>
                  <span style={{ color: "#00D4FF" }}>{fmt(b.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {offers.length > 0 && (
            <div style={{ minWidth: 200 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginBottom: 6 }}>OFFER HISTORY</div>
              {offers.slice(-5).reverse().map((o, i) => (
                <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 3, display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>{o.offererName}</span>
                  <span style={{ color: "#00D4FF" }}>{fmt(o.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", justifyContent: "flex-start" }}>
            {listing.status === "expired" && !listing.renewed && (
              <ActionBtn label="Renew 7d" color="#00D4FF" onClick={() => onRenew(listing._id)} />
            )}
            <ActionBtn label="Remove"   color="#ef4444" onClick={() => onDelete(listing._id)} />
            <ActionBtn label="Close"    color="rgba(255,255,255,0.3)" onClick={onClose} />
          </div>
        </div>
      </td>
    </tr>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: `1px solid ${color}`, color,
      fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
      padding: "4px 12px", borderRadius: 4, cursor: "pointer",
      transition: "opacity 0.15s", whiteSpace: "nowrap",
      fontFamily: "Orbitron, monospace",
    }}>{label}</button>
  );
}

// ── Create Listing Modal ───────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    category: "skins", activityType: "selling_general",
    itemName: "", itemDescription: "", price: "", reservePrice: "", commissionTier: 20,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.itemName.trim()) { toast.error("Item name required"); return; }
    setSaving(true);
    try { await onCreate(form); onClose(); }
    catch { /* error handled in parent */ }
    finally { setSaving(false); }
  };

  const needsPrice    = ["selling_general", "buying_general"].includes(form.activityType);
  const needsReserve  = ["selling_auction", "buying_auction"].includes(form.activityType);
  const commissions   = [
    { value: 20, label: "20% — Instant delivery" },
    { value: 12, label: "12% — Up to 4 hours (quest)" },
    { value: 10, label: "10% — Up to 12 hours (quest)" },
    { value:  8, label:  "8% — Up to 24 hours (quest)" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 16,
    }}>
      <div style={{
        background: "rgba(4,10,26,0.98)", border: "1px solid rgba(0,212,255,0.3)",
        borderRadius: 12, padding: "20px 24px", width: "100%", maxWidth: 480,
        display: "flex", flexDirection: "column", gap: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 13, fontWeight: 700, color: "#00D4FF", letterSpacing: "0.1em" }}>
            NEW LISTING
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer" }}>×</button>
        </div>

        <Row label="Category">
          <Select value={form.category} onChange={(v) => set("category", v)} options={CATEGORY_ORDER.map((c) => ({ value: c, label: cap(c) }))} />
        </Row>

        <Row label="Activity Type">
          <Select value={form.activityType} onChange={(v) => set("activityType", v)}
            options={Object.entries(ACTIVITY_LABELS).map(([value, label]) => ({ value, label }))} />
        </Row>

        <Row label="Item Name">
          <Input value={form.itemName} onChange={(v) => set("itemName", v)} placeholder="e.g. Shadow Ops Skin" />
        </Row>

        <Row label="Description (optional)">
          <Input value={form.itemDescription} onChange={(v) => set("itemDescription", v)} placeholder="Brief description..." />
        </Row>

        {needsPrice && (
          <Row label="Price (USDC)">
            <Input type="number" value={form.price} onChange={(v) => set("price", v)} placeholder="0.00" />
          </Row>
        )}

        {needsReserve && (
          <Row label="Reserve Price (USDC)">
            <Input type="number" value={form.reservePrice} onChange={(v) => set("reservePrice", v)} placeholder="0.00" />
          </Row>
        )}

        <Row label="Commission / Delivery">
          {commissions.map((c) => (
            <label key={c.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 4 }}>
              <input type="radio" checked={form.commissionTier === c.value} onChange={() => set("commissionTier", c.value)}
                style={{ accentColor: "#00D4FF" }} />
              <span style={{ fontSize: 10, color: form.commissionTier === c.value ? "#00D4FF" : "rgba(255,255,255,0.6)" }}>
                {c.label}
              </span>
              {c.value !== 20 && (
                <span style={{ fontSize: 9, color: "rgba(255,200,0,0.7)", marginLeft: 4 }}>
                  ⚠ In-game content not yet available
                </span>
              )}
            </label>
          ))}
        </Row>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            background: "linear-gradient(135deg, rgba(0,42,168,0.8), rgba(0,100,255,0.6))",
            border: "1px solid rgba(0,80,255,0.6)", color: "#fff",
            fontFamily: "Orbitron,sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", padding: "10px 0", borderRadius: 6,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "CREATING..." : "CREATE LISTING"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", fontWeight: 600 }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
      color: "#fff", fontSize: 11, padding: "6px 10px", borderRadius: 5, outline: "none", width: "100%",
    }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{
        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff", fontSize: 11, padding: "6px 10px", borderRadius: 5, outline: "none", width: "100%",
      }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MyTrades() {
  const { token } = useSelector((s) => s.auth);
  const [grouped,       setGrouped]       = useState({});
  const [loading,       setLoading]       = useState(true);
  const [expanded,      setExpanded]      = useState({});   // category → bool
  const [openRow,       setOpenRow]       = useState(null); // listing _id
  const [showCreate,    setShowCreate]    = useState(false);

  const fetchListings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/listings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrouped(res.data.grouped ?? {});
    } catch (err) {
      console.error("MyTrades fetch:", err);
      toast.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const toggleCategory = (cat) => setExpanded((p) => ({ ...p, [cat]: !p[cat] }));
  const toggleRow      = (id)  => setOpenRow((p) => (p === id ? null : id));

  const handleCreate = async (form) => {
    try {
      await axios.post(`${BACKEND_BASE_URL}/api/v1/listings`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Listing created!");
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
      throw err;
    }
  };

  const handleRenew = async (id) => {
    try {
      await axios.put(`${BACKEND_BASE_URL}/api/v1/listings/${id}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Listing renewed for 7 more days!");
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to renew");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/v1/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Listing removed");
      setOpenRow(null);
      fetchListings();
    } catch {
      toast.error("Failed to remove listing");
    }
  };

  // Categories that have data, in canonical order
  const activeCategories = CATEGORY_ORDER.filter((c) => (grouped[c] ?? []).length > 0);

  const thStyle = {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)",
    padding: "8px 12px", textAlign: "left", whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(0,212,255,0.15)",
    fontFamily: "Orbitron, monospace",
    background: "rgba(4,10,26,0.97)",
    position: "sticky", top: 0, zIndex: 10,
  };

  const tdStyle = {
    fontSize: 10, color: "rgba(255,255,255,0.8)",
    padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "middle",
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
      <div style={{ color: "rgba(0,212,255,0.7)", fontFamily: "Orbitron,sans-serif", fontSize: 11, letterSpacing: "0.1em" }}>
        LOADING TRADES...
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 16px 60px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "Orbitron,sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", margin: 0 }}>
            MY TRADES
          </h2>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {[3, 12, 8, 20].map((w, i) => (
              <div key={i} style={{ height: 3, width: w, background: i < 3 ? "#fff" : "linear-gradient(to right,#fff,transparent)", borderRadius: 2 }} />
            ))}
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          background: "linear-gradient(135deg, rgba(0,42,168,0.8), rgba(0,100,255,0.5))",
          border: "1px solid rgba(0,80,255,0.6)", color: "#fff",
          fontFamily: "Orbitron,sans-serif", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.08em", padding: "8px 16px", borderRadius: 6,
          cursor: "pointer",
        }}>
          + NEW LISTING
        </button>
      </div>

      {activeCategories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontFamily: "Orbitron,sans-serif", fontSize: 12, letterSpacing: "0.1em" }}>NO ACTIVE LISTINGS</div>
          <div style={{ fontSize: 11, marginTop: 8 }}>Create your first listing to get started</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeCategories.map((cat) => {
            const listings = grouped[cat] ?? [];
            const isOpen   = expanded[cat] !== false; // default open

            return (
              <div key={cat} style={{
                background: "rgba(4,10,26,0.8)",
                border: "1px solid rgba(0,212,255,0.18)",
                borderRadius: 8, overflow: "hidden",
              }}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    background: "rgba(0,212,255,0.06)", border: "none",
                    padding: "10px 16px", cursor: "pointer",
                    borderBottom: isOpen ? "1px solid rgba(0,212,255,0.15)" : "none",
                  }}
                >
                  <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 11, fontWeight: 700, color: "#00D4FF", letterSpacing: "0.12em" }}>
                    {cap(cat).toUpperCase()}
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", background: "rgba(0,212,255,0.12)", padding: "2px 8px", borderRadius: 10 }}>
                    {listings.length}
                  </span>
                  <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* Table */}
                {isOpen && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, width: COL_W.item }}>ITEM</th>
                          <th style={{ ...thStyle, width: COL_W.activity }}>ACTIVITY TYPE</th>
                          <th style={{ ...thStyle, width: COL_W.price }}>PRICE / RESERVE</th>
                          <th style={{ ...thStyle, width: COL_W.offer }}>CURRENT OFFER / BID</th>
                          <th style={{ ...thStyle, width: COL_W.status }}>STATUS</th>
                          <th style={{ ...thStyle, width: COL_W.action }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((listing) => {
                          const isRowOpen = openRow === listing._id;
                          const tInfo     = timeLeft(listing.expiresAt);

                          return (
                            <Fragment key={listing._id}>
                              <tr
                                onClick={() => toggleRow(listing._id)}
                                style={{
                                  cursor: "pointer",
                                  background: isRowOpen ? "rgba(0,212,255,0.06)" : "transparent",
                                  transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => { if (!isRowOpen) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                                onMouseLeave={(e) => { if (!isRowOpen) e.currentTarget.style.background = "transparent"; }}
                              >
                                {/* Item */}
                                <td style={tdStyle}>
                                  <div style={{ fontWeight: 600, color: "#fff", marginBottom: 2 }}>{listing.itemName}</div>
                                  <div style={{ fontSize: 9, color: tInfo.warn ? "#ef4444" : "rgba(255,255,255,0.35)" }}>
                                    ⏱ {tInfo.label}
                                  </div>
                                </td>

                                {/* Activity type */}
                                <td style={tdStyle}>
                                  <span style={{
                                    fontSize: 9, fontWeight: 600, letterSpacing: "0.05em",
                                    color: "rgba(0,212,255,0.85)", fontFamily: "Orbitron,monospace",
                                  }}>
                                    {ACTIVITY_LABELS[listing.activityType] ?? listing.activityType}
                                  </span>
                                </td>

                                {/* Price / Reserve */}
                                <td style={tdStyle}>
                                  {listing.activityType === "selling_general" || listing.activityType === "buying_general"
                                    ? fmt(listing.price)
                                    : listing.reservePrice != null
                                      ? <span><span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginRight: 4 }}>RESERVE</span>{fmt(listing.reservePrice)}</span>
                                      : "—"}
                                </td>

                                {/* Current offer / bid */}
                                <td style={tdStyle}>
                                  {listing.currentBid != null
                                    ? <span style={{ color: "#10b981" }}>{fmt(listing.currentBid)} <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>C.BID</span></span>
                                    : listing.currentOffer != null
                                      ? <span style={{ color: "#f59e0b" }}>{fmt(listing.currentOffer)} <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>C.OFFER</span></span>
                                      : "—"}
                                </td>

                                {/* Status */}
                                <td style={tdStyle}><StatusBadge status={listing.status} /></td>

                                {/* Expand */}
                                <td style={{ ...tdStyle, textAlign: "center", color: "rgba(0,212,255,0.6)", fontSize: 14 }}>
                                  {isRowOpen ? "▲" : "▼"}
                                </td>
                              </tr>

                              {isRowOpen && (
                                <RowDetail
                                  listing={listing}
                                  onClose={() => setOpenRow(null)}
                                  onRenew={handleRenew}
                                  onDelete={handleDelete}
                                />
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
