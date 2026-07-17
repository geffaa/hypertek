import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

// Must match HB_TO_USD in backend/Controllers/HBController.js (250 HB = $1)
const HB_TO_USD = 250;
const fmt = (hb) => Number(hb || 0).toLocaleString();
const fmtUSD = (hb) => `$${(Number(hb || 0) / HB_TO_USD).toFixed(2)}`;

const CARD = { background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 };
const INPUT_STYLE = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  color: "#fff",
  outline: "none",
  padding: "9px 13px",
  fontSize: 13,
};

const CASHOUT_STATUS_BADGE = {
  pending:    { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Pending" },
  processing: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", label: "Processing" },
  completed:  { bg: "rgba(74,222,128,0.12)", color: "#4ade80", label: "Completed" },
  failed:     { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Failed" },
};

const TABS = ["Cashouts", "User Balances", "Adjust Balance"];

export default function HyperBucksAdmin() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [tab, setTab] = useState(0);

  // ── Cashouts tab ──────────────────────────────────────────────────────────
  const [cashouts, setCashouts]         = useState([]);
  const [cashoutSummary, setCashoutSummary] = useState({});
  const [cashoutFilter, setCashoutFilter]   = useState(""); // "" = all
  const [cashoutLoading, setCashoutLoading] = useState(false);
  const [cashoutPage, setCashoutPage]       = useState(1);
  const [cashoutTotal, setCashoutTotal]     = useState(0);
  // complete modal
  const [completeTarget, setCompleteTarget] = useState(null); // ledger entry
  const [completeTxHash, setCompleteTxHash] = useState("");
  const [completeNote,   setCompleteNote]   = useState("");
  // fail modal
  const [failTarget, setFailTarget] = useState(null);
  const [failReason,  setFailReason] = useState("");

  const fetchCashouts = useCallback(async () => {
    setCashoutLoading(true);
    try {
      const params = { page: cashoutPage, limit: 20 };
      if (cashoutFilter) params.status = cashoutFilter;
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/hb/cashouts`, { params, headers });
      if (res.data.success) {
        setCashouts(res.data.data);
        setCashoutTotal(res.data.pagination.total);
        setCashoutSummary(res.data.summary || {});
      }
    } catch {
      toast.error("Failed to load cashouts");
    } finally {
      setCashoutLoading(false);
    }
  }, [cashoutPage, cashoutFilter, token]);

  useEffect(() => { if (tab === 0) fetchCashouts(); }, [tab, fetchCashouts]);

  const handleComplete = async () => {
    if (!completeTarget) return;
    try {
      const res = await axios.put(
        `${Dashboard_Base_Url}/v1/admin/nfa/hb/cashouts/${completeTarget._id}/complete`,
        { txHash: completeTxHash || undefined, adminNote: completeNote || undefined },
        { headers }
      );
      if (res.data.success) {
        toast.success("Cashout marked as completed");
        setCompleteTarget(null); setCompleteTxHash(""); setCompleteNote("");
        fetchCashouts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleFail = async () => {
    if (!failTarget) return;
    try {
      const res = await axios.put(
        `${Dashboard_Base_Url}/v1/admin/nfa/hb/cashouts/${failTarget._id}/fail`,
        { reason: failReason },
        { headers }
      );
      if (res.data.success) {
        toast.success("Cashout marked failed — HB refunded to user");
        setFailTarget(null); setFailReason("");
        fetchCashouts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  // ── User Balances tab ─────────────────────────────────────────────────────
  const [users, setUsers]             = useState([]);
  const [userSearch, setUserSearch]   = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [userPage, setUserPage]       = useState(1);
  const [userTotal, setUserTotal]     = useState(0);
  const [platformTotalHB, setPlatformTotalHB] = useState(0);
  // ledger drawer
  const [ledgerUser, setLedgerUser]   = useState(null);
  const [ledger, setLedger]           = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/hb/users`, {
        params: { page: userPage, limit: 20, search: userSearch || undefined },
        headers,
      });
      if (res.data.success) {
        setUsers(res.data.data);
        setUserTotal(res.data.pagination.total);
        setPlatformTotalHB(res.data.platformTotalHB || 0);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setUserLoading(false);
    }
  }, [userPage, userSearch, token]);

  useEffect(() => { if (tab === 1) fetchUsers(); }, [tab, fetchUsers]);

  const fetchLedger = async (user) => {
    setLedgerUser(user);
    setLedgerLoading(true);
    try {
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/hb/ledger/${user._id}`, { headers });
      if (res.data.success) setLedger(res.data.data);
    } catch {
      toast.error("Failed to load ledger");
    } finally {
      setLedgerLoading(false);
    }
  };

  // ── Adjust tab ────────────────────────────────────────────────────────────
  const [adjSearch, setAdjSearch]     = useState("");
  const [adjResults, setAdjResults]   = useState([]);
  const [adjSearching, setAdjSearching] = useState(false);
  const [adjTarget, setAdjTarget]     = useState(null);
  const [adjAmount, setAdjAmount]     = useState("");
  const [adjReason, setAdjReason]     = useState("");
  const [adjLoading, setAdjLoading]   = useState(false);

  const searchForUser = async () => {
    if (!adjSearch.trim()) return;
    setAdjSearching(true);
    try {
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/hb/users`, {
        params: { search: adjSearch, limit: 10 },
        headers,
      });
      // Also search zero-balance users
      const allRes = await axios.get(`${Dashboard_Base_Url}/v1/admin/users`, {
        params: { search: adjSearch, limit: 10 },
        headers,
      }).catch(() => ({ data: { data: [] } }));
      const combined = [...(res.data.data || []), ...(allRes.data.data || [])];
      const unique = Object.values(Object.fromEntries(combined.map(u => [u._id, u])));
      setAdjResults(unique);
    } catch {
      toast.error("Search failed");
    } finally {
      setAdjSearching(false);
    }
  };

  const handleAdjust = async () => {
    if (!adjTarget) return;
    const amt = parseInt(adjAmount, 10);
    if (!amt || amt === 0) { toast.error("Enter a non-zero amount"); return; }
    if (!adjReason.trim()) { toast.error("Reason is required"); return; }

    setAdjLoading(true);
    try {
      const res = await axios.post(
        `${Dashboard_Base_Url}/v1/admin/nfa/hb/adjust`,
        { userId: adjTarget._id, amount: amt, reason: adjReason },
        { headers }
      );
      if (res.data.success) {
        toast.success(`${amt > 0 ? "+" : ""}${amt} HB applied. New balance: ${fmt(res.data.newBalance)} HB`);
        setAdjTarget(prev => ({ ...prev, hyperBucks: res.data.newBalance }));
        setAdjAmount(""); setAdjReason("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjust failed");
    } finally {
      setAdjLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          HyperBucks Management
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Monitor cashout requests, view user HB balances, and manually adjust balances.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === i
              ? { background: "#002AA8", color: "#fff" }
              : { background: "transparent", color: "rgba(255,255,255,0.45)" }
            }
          >
            {t}
            {i === 0 && (cashoutSummary.pending || 0) > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#fbbf24", color: "#000" }}>
                {cashoutSummary.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 0: Cashouts ──────────────────────────────────────────────── */}
      {tab === 0 && (
        <div>
          {/* Summary pills */}
          <div className="flex flex-wrap gap-3 mb-5">
            {Object.entries(CASHOUT_STATUS_BADGE).map(([key, badge]) => (
              <button
                key={key}
                onClick={() => { setCashoutFilter(cashoutFilter === key ? "" : key); setCashoutPage(1); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: cashoutFilter === key ? badge.bg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${cashoutFilter === key ? badge.color + "40" : "rgba(255,255,255,0.08)"}`,
                  color: cashoutFilter === key ? badge.color : "rgba(255,255,255,0.5)",
                }}
              >
                {badge.label}
                <span className="opacity-70">{cashoutSummary[key] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-[14px] overflow-hidden" style={CARD}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["User", "Amount (HB)", "USD", "Method", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cashoutLoading ? (
                    <tr><td colSpan={7} className="text-center py-10 text-white/30 text-sm">Loading…</td></tr>
                  ) : cashouts.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-white/30 text-sm">No cashout records found</td></tr>
                  ) : cashouts.map((c) => {
                    const badge = CASHOUT_STATUS_BADGE[c.cashoutStatus] || { bg: "rgba(255,255,255,0.06)", color: "#fff", label: c.cashoutStatus };
                    const user = c.userId;
                    const canAct = !["completed"].includes(c.cashoutStatus);
                    return (
                      <tr key={c._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-4 py-3">
                          <div className="text-white text-xs font-medium">{user?.FullName || user?.Email || "Unknown"}</div>
                          <div className="text-white/30 text-xs font-mono">{user?.Email || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-white font-semibold text-xs">{fmt(Math.abs(c.amount))} HB</td>
                        <td className="px-4 py-3 text-white/70 text-xs">{fmtUSD(Math.abs(c.amount))}</td>
                        <td className="px-4 py-3">
                          <span className="text-white/60 text-xs capitalize">{c.cashoutMethod || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-md text-xs font-semibold" style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {canAct && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setCompleteTarget(c); setCompleteTxHash(""); setCompleteNote(""); }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                                style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80" }}
                              >
                                Complete
                              </button>
                              {c.cashoutStatus !== "failed" && (
                                <button
                                  onClick={() => { setFailTarget(c); setFailReason(""); }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                                  style={{ background: "rgba(248,113,113,0.10)", color: "#f87171" }}
                                >
                                  Fail + Refund
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {cashoutTotal > 20 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-white/30 text-xs">{cashoutTotal} total</span>
                <div className="flex gap-2">
                  <button onClick={() => setCashoutPage(p => Math.max(1, p - 1))} disabled={cashoutPage === 1}
                    className="px-3 py-1 rounded-lg text-xs text-white/60 disabled:opacity-30"
                    style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
                    Prev
                  </button>
                  <button onClick={() => setCashoutPage(p => p + 1)} disabled={cashoutPage * 20 >= cashoutTotal}
                    className="px-3 py-1 rounded-lg text-xs text-white/60 disabled:opacity-30"
                    style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 1: User Balances ─────────────────────────────────────────── */}
      {tab === 1 && (
        <div>
          {/* Platform total */}
          <div className="rounded-[14px] px-5 py-4 mb-5 flex items-center gap-4" style={CARD}>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Platform Total HB in Circulation</p>
              <p className="text-white font-bold text-xl mt-0.5">{fmt(platformTotalHB)} HB</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-white/40 text-xs">USD Equivalent</p>
              <p className="text-green-400 font-semibold text-sm">{fmtUSD(platformTotalHB)}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-5">
            <input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchUsers()}
              placeholder="Search by name, email, or wallet..."
              style={{ ...INPUT_STYLE, flex: 1 }}
            />
            <button
              onClick={fetchUsers}
              className="px-4 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
            >
              Search
            </button>
          </div>

          {ledgerUser ? (
            /* Ledger drawer */
            <div>
              <button
                onClick={() => setLedgerUser(null)}
                className="flex items-center gap-2 text-white/50 text-sm mb-4 hover:text-white transition-colors"
              >
                ← Back to user list
              </button>
              <div className="rounded-[14px] p-5 mb-4" style={CARD}>
                <p className="text-white font-semibold">{ledgerUser.FullName || ledgerUser.Email}</p>
                <p className="text-white/40 text-xs mt-0.5">{ledgerUser.Email}</p>
                <p className="text-yellow-400 font-bold text-lg mt-2">{fmt(ledgerUser.hyperBucks)} HB</p>
                <p className="text-white/30 text-xs">{fmtUSD(ledgerUser.hyperBucks)} USD equivalent</p>
              </div>
              <div className="rounded-[14px] overflow-hidden" style={CARD}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Transaction History</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["Type", "Amount", "Balance After", "Description", "Date"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerLoading ? (
                        <tr><td colSpan={5} className="text-center py-8 text-white/30 text-sm">Loading…</td></tr>
                      ) : ledger.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-white/30 text-sm">No transactions</td></tr>
                      ) : ledger.map(tx => {
                        const isCredit = tx.amount > 0;
                        return (
                          <tr key={tx._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                                style={{
                                  background: tx.type === "cashout" ? "rgba(96,165,250,0.1)" : tx.type === "admin_adjust" ? "rgba(167,139,250,0.1)" : isCredit ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                                  color:      tx.type === "cashout" ? "#60a5fa" : tx.type === "admin_adjust" ? "#a78bfa" : isCredit ? "#4ade80" : "#f87171",
                                }}
                              >
                                {tx.type.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-xs" style={{ color: isCredit ? "#4ade80" : "#f87171" }}>
                              {isCredit ? "+" : ""}{fmt(tx.amount)} HB
                            </td>
                            <td className="px-4 py-3 text-white/60 text-xs">{fmt(tx.balanceAfter)} HB</td>
                            <td className="px-4 py-3 text-white/50 text-xs max-w-[200px] truncate">{tx.description || "—"}</td>
                            <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* User list */
            <div className="rounded-[14px] overflow-hidden" style={CARD}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["User", "Email", "Wallet", "HB Balance", "USD Value", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userLoading ? (
                      <tr><td colSpan={6} className="text-center py-10 text-white/30 text-sm">Loading…</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-white/30 text-sm">No users with HB balance found</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-4 py-3 text-white text-xs font-medium">{u.FullName || "—"}</td>
                        <td className="px-4 py-3 text-white/50 text-xs">{u.Email || "—"}</td>
                        <td className="px-4 py-3 text-white/30 text-xs font-mono">
                          {u.walletAddress ? `${u.walletAddress.slice(0, 8)}…${u.walletAddress.slice(-6)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-yellow-400 font-bold text-xs">{fmt(u.hyperBucks)} HB</td>
                        <td className="px-4 py-3 text-white/50 text-xs">{fmtUSD(u.hyperBucks)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => fetchLedger(u)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: "rgba(0,42,168,0.2)", color: "#60a5fa", border: "1px solid rgba(0,80,255,0.2)" }}
                          >
                            View Ledger
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {userTotal > 20 && (
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/30 text-xs">{userTotal} users</span>
                  <div className="flex gap-2">
                    <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                      className="px-3 py-1 rounded-lg text-xs text-white/60 disabled:opacity-30"
                      style={{ border: "1px solid rgba(255,255,255,0.10)" }}>Prev</button>
                    <button onClick={() => setUserPage(p => p + 1)} disabled={userPage * 20 >= userTotal}
                      className="px-3 py-1 rounded-lg text-xs text-white/60 disabled:opacity-30"
                      style={{ border: "1px solid rgba(255,255,255,0.10)" }}>Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Adjust Balance ────────────────────────────────────────── */}
      {tab === 2 && (
        <div className="max-w-2xl">
          <div className="rounded-[14px] p-6 flex flex-col gap-5" style={CARD}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Search User</p>

            <div className="flex gap-3">
              <input
                value={adjSearch}
                onChange={e => setAdjSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchForUser()}
                placeholder="Name, email, or wallet address..."
                style={{ ...INPUT_STYLE, flex: 1 }}
              />
              <button
                onClick={searchForUser}
                disabled={adjSearching}
                className="px-4 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
              >
                {adjSearching ? "…" : "Find"}
              </button>
            </div>

            {adjResults.length > 0 && !adjTarget && (
              <div className="flex flex-col gap-2">
                {adjResults.map(u => (
                  <button
                    key={u._id}
                    onClick={() => { setAdjTarget(u); setAdjResults([]); setAdjSearch(""); }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{u.FullName || u.Email}</p>
                      <p className="text-white/40 text-xs">{u.Email}</p>
                    </div>
                    <p className="text-yellow-400 font-semibold text-sm">{fmt(u.hyperBucks || 0)} HB</p>
                  </button>
                ))}
              </div>
            )}

            {adjTarget && (
              <>
                {/* Selected user card */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.2)" }}>
                  <div>
                    <p className="text-white text-sm font-semibold">{adjTarget.FullName || adjTarget.Email}</p>
                    <p className="text-white/40 text-xs">{adjTarget.Email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">{fmt(adjTarget.hyperBucks || 0)} HB</p>
                    <button onClick={() => { setAdjTarget(null); setAdjAmount(""); setAdjReason(""); }}
                      className="text-white/30 text-xs hover:text-white/60 transition-colors">
                      change user
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                    Amount (positive = credit, negative = debit)
                  </label>
                  <input
                    type="number"
                    value={adjAmount}
                    onChange={e => setAdjAmount(e.target.value)}
                    placeholder="e.g. 1000 or -500"
                    style={{ ...INPUT_STYLE, width: "100%" }}
                  />
                  {adjAmount && !isNaN(parseInt(adjAmount)) && (
                    <p className="text-white/30 text-xs mt-1.5">
                      New balance: <span className="text-white">{fmt((adjTarget.hyperBucks || 0) + parseInt(adjAmount))} HB</span>
                      {" "}({fmtUSD((adjTarget.hyperBucks || 0) + parseInt(adjAmount))})
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                    Reason (required — recorded in ledger)
                  </label>
                  <input
                    value={adjReason}
                    onChange={e => setAdjReason(e.target.value)}
                    placeholder="e.g. Tournament prize — Race #23, Event reward, Manual correction"
                    style={{ ...INPUT_STYLE, width: "100%" }}
                  />
                </div>

                <button
                  onClick={handleAdjust}
                  disabled={adjLoading || !adjAmount || !adjReason.trim()}
                  className="h-11 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
                >
                  {adjLoading ? "Applying…" : `Apply ${parseInt(adjAmount) > 0 ? "+" : ""}${adjAmount || "?"} HB`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Complete Modal ───────────────────────────────────────────────── */}
      {completeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-[14px] p-6 flex flex-col gap-4" style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-white font-semibold text-base">Mark Cashout as Completed</p>
            <p className="text-white/50 text-sm">
              Marking <span className="text-white font-medium">{fmt(Math.abs(completeTarget.amount))} HB</span> ({fmtUSD(Math.abs(completeTarget.amount))}) cashout as completed.
            </p>
            <div>
              <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">Tx Hash (optional)</label>
              <input value={completeTxHash} onChange={e => setCompleteTxHash(e.target.value)}
                placeholder="0x..." style={{ ...INPUT_STYLE, width: "100%" }} />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">Admin Note (optional)</label>
              <input value={completeNote} onChange={e => setCompleteNote(e.target.value)}
                placeholder="e.g. Stripe payout ref #12345" style={{ ...INPUT_STYLE, width: "100%" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCompleteTarget(null)}
                className="flex-1 h-10 rounded-xl text-white/50 text-sm"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
              <button onClick={handleComplete}
                className="flex-1 h-10 rounded-xl text-white font-semibold text-sm"
                style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}>
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fail + Refund Modal ──────────────────────────────────────────── */}
      {failTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-[14px] p-6 flex flex-col gap-4" style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-white font-semibold text-base">Fail Cashout + Refund HB</p>
            <div className="rounded-xl p-3" style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <p className="text-red-300 text-xs">
                This will mark the cashout as failed and <strong>refund {fmt(Math.abs(failTarget.amount))} HB</strong> back to the user's balance.
              </p>
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5 uppercase tracking-wider">Reason</label>
              <input value={failReason} onChange={e => setFailReason(e.target.value)}
                placeholder="e.g. Bank details invalid, payment returned" style={{ ...INPUT_STYLE, width: "100%" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setFailTarget(null)}
                className="flex-1 h-10 rounded-xl text-white/50 text-sm"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</button>
              <button onClick={handleFail}
                className="flex-1 h-10 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}>
                Fail + Refund HB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
