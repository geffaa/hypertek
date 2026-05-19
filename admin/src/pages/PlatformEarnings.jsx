import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
const MARKETPLACE_ABI = [
  { name: "platformBalance",      type: "function", stateMutability: "view",       inputs: [],                              outputs: [{ type: "uint256" }] },
  { name: "platformWallet",       type: "function", stateMutability: "view",       inputs: [],                              outputs: [{ type: "address" }] },
  { name: "withdrawPlatformFees", type: "function", stateMutability: "nonpayable", inputs: [],                              outputs: [] },
  { name: "creatorBalance",       type: "function", stateMutability: "view",       inputs: [{ type: "address", name: "" }], outputs: [{ type: "uint256" }] },
  { name: "withdrawCreator",      type: "function", stateMutability: "nonpayable", inputs: [],                              outputs: [] },
];

const F    = "Inter, sans-serif";
const CARD = { background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" };

const HISTORY_KEY = "platform_withdraw_history";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(entry) {
  const prev = loadHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...prev].slice(0, 50)));
}

function Badge({ color, children }) {
  const C = {
    green: { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)",  text: "#22c55e" },
    red:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   text: "#ef4444" },
    gray:  { bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.12)", text: "rgba(255,255,255,0.45)" },
  };
  const c = C[color] || C.gray;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: c.bg, border: `1px solid ${c.border}`, fontFamily: F, fontSize: 11, fontWeight: 600, color: c.text, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text, flexShrink: 0 }} />
      {children}
    </span>
  );
}

function EarningsCard({ title, subtitle, balance, isLoading, onWithdraw, canWithdraw, withdrawLabel, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ ...CARD, padding: 28, display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
          <div>
            <p style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>{title}</p>
            <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.38)", margin: "3px 0 0" }}>{subtitle}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
          <span style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Live</span>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: F, fontSize: "10.5px", fontWeight: 500, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Available Balance</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
          <p style={{ fontFamily: F, fontSize: 36, fontWeight: 800, color: isLoading ? "rgba(255,255,255,0.2)" : "white", margin: 0, letterSpacing: "-1.5px", lineHeight: 1 }}>
            {isLoading ? "—" : Number(balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>USDC</span>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      <button
        onClick={onWithdraw}
        disabled={!canWithdraw}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: canWithdraw ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)", background: canWithdraw ? (hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)") : "rgba(255,255,255,0.03)", color: canWithdraw ? "white" : "rgba(255,255,255,0.2)", fontFamily: F, fontSize: 13, fontWeight: 600, cursor: canWithdraw ? "pointer" : "not-allowed", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        {withdrawLabel}
      </button>
    </div>
  );
}

// ─── Withdrawal History (admin's own withdrawals, stored locally) ─────────────

function WithdrawHistory({ history }) {
  if (history.length === 0) {
    return (
      <div style={{ ...CARD, padding: "32px 20px", textAlign: "center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 10 }}>
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          No withdrawals yet. History will appear here after the first withdrawal.
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...CARD, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Type", "Amount", "Tx Hash", "Wallet", "Date"].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontFamily: F, fontWeight: 600, fontSize: "10.5px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.12s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "13px 20px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: F, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
                    {row.type === "platform" ? "Platform Fees" : "Creator Earnings"}
                  </span>
                </td>
                <td style={{ padding: "13px 20px", fontFamily: F, fontSize: 13, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
                  {Number(row.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
                </td>
                <td style={{ padding: "13px 20px" }}>
                  <a
                    href={`https://basescan.org/tx/${row.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontFamily: "monospace", fontSize: 11, color: "#4d7aff", textDecoration: "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                  >
                    {row.txHash.slice(0, 12)}…{row.txHash.slice(-6)}
                  </a>
                </td>
                <td style={{ padding: "13px 20px", fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap" }}>
                  {row.wallet.slice(0, 8)}…{row.wallet.slice(-6)}
                </td>
                <td style={{ padding: "13px 20px", fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                  {new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

function PlatformEarnings() {
  const { address, isConnected } = useAccount();
  const [balanceDisplay, setBalanceDisplay] = useState("0.00");
  const [creatorDisplay, setCreatorDisplay] = useState("0.00");
  const [history, setHistory] = useState(loadHistory);

  const { data: rawBalance,        isLoading: isReading,      error: balanceError } = useReadContract({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "platformBalance",  query: { refetchInterval: 10000 } });
  const { data: rawCreatorBalance, refetch: refetchCreator }                         = useReadContract({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "creatorBalance",   args: address ? [address] : undefined, query: { enabled: !!address, refetchInterval: 10000 } });
  const { data: authorizedWallet,  isLoading: isWalletLoading, error: walletError } = useReadContract({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "platformWallet" });
  const { writeContractAsync } = useWriteContract();

  useEffect(() => { if (rawBalance        !== undefined) setBalanceDisplay(ethers.formatUnits(rawBalance, 6)); },        [rawBalance]);
  useEffect(() => { if (rawCreatorBalance !== undefined) setCreatorDisplay(ethers.formatUnits(rawCreatorBalance, 6)); }, [rawCreatorBalance]);

  const isAuthorized = isConnected && authorizedWallet && address &&
    authorizedWallet.toLowerCase() === address.toLowerCase();

  const recordHistory = (type, amount, txHash) => {
    const entry = { type, amount, txHash, wallet: address, date: new Date().toISOString() };
    saveHistory(entry);
    setHistory(loadHistory());
  };

  const handleWithdraw = async () => {
    if (!isConnected)  { toast.error("Connect your wallet first."); return; }
    if (!isAuthorized) { toast.error("This wallet is not the platform wallet."); return; }
    if (Number(balanceDisplay) <= 0) { toast.error("No fees to withdraw."); return; }
    const id = toast.loading("Withdrawing platform fees…");
    try {
      const tx = await writeContractAsync({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "withdrawPlatformFees" });
      toast.success(`Withdrawn! Tx: ${tx.slice(0, 10)}…`, { id, duration: 5000 });
      recordHistory("platform", balanceDisplay, tx);
    } catch (e) { toast.error(e.shortMessage || e.message || "Failed", { id }); }
  };

  const handleCreatorWithdraw = async () => {
    if (!isConnected) { toast.error("Connect your wallet first."); return; }
    if (Number(creatorDisplay) <= 0) { toast.error("No creator earnings to withdraw."); return; }
    const id = toast.loading("Withdrawing creator earnings…");
    try {
      const tx = await writeContractAsync({ address: MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI, functionName: "withdrawCreator" });
      toast.success(`Withdrawn! Tx: ${tx.slice(0, 10)}…`, { id, duration: 5000 });
      recordHistory("creator", creatorDisplay, tx);
      setTimeout(() => refetchCreator(), 15000);
    } catch (e) { toast.error(e.shortMessage || e.message || "Failed", { id }); }
  };

  const authBadge = !isConnected
    ? <Badge color="gray">Wallet not connected</Badge>
    : isWalletLoading
    ? <Badge color="gray">Checking…</Badge>
    : isAuthorized
    ? <Badge color="green">Authorized Platform Wallet</Badge>
    : <Badge color="red">Unauthorized Wallet</Badge>;

  return (
    <div style={{ fontFamily: F, color: "white", paddingBottom: 40 }}>

      {/* header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.2 }}>Platform Treasury</h1>
        <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>
          Manage and withdraw accumulated platform fees and creator earnings from the smart contract.
        </p>
      </div>

      {/* wallet bar */}
      <div style={{ ...CARD, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontFamily: F, fontSize: "10.5px", fontWeight: 500, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Wallet</p>
          {isConnected && (
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }}>
              {address.slice(0, 10)}…{address.slice(-8)}
            </span>
          )}
          {authBadge}
        </div>
        <ConnectButton />
      </div>

      {/* contract error */}
      {(balanceError || walletError) && (
        <div style={{ ...CARD, padding: "14px 20px", marginBottom: 20, borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.07)" }}>
          <p style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#ef4444", margin: 0 }}>
            Contract read error — check network or contract address.
          </p>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(239,68,68,0.7)", margin: "6px 0 0", wordBreak: "break-all" }}>
            {(balanceError || walletError)?.shortMessage || (balanceError || walletError)?.message}
          </p>
        </div>
      )}

      {/* earnings cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 20 }}>
        <EarningsCard
          title="Platform Fees" subtitle="Accumulated secondary marketplace fees"
          balance={balanceDisplay} isLoading={isReading}
          onWithdraw={handleWithdraw}
          canWithdraw={isConnected && isAuthorized && !isReading && Number(balanceDisplay) > 0}
          withdrawLabel={!isConnected ? "Connect wallet to withdraw" : !isAuthorized ? "Unauthorized wallet" : "Withdraw Platform Fees"}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>}
        />
        <EarningsCard
          title="Creator Earnings" subtitle={isConnected ? `Royalties for ${address?.slice(0, 8)}…${address?.slice(-6)}` : "Connect wallet to view"}
          balance={creatorDisplay} isLoading={false}
          onWithdraw={handleCreatorWithdraw}
          canWithdraw={isConnected && Number(creatorDisplay) > 0}
          withdrawLabel={!isConnected ? "Connect wallet to withdraw" : "Withdraw Creator Earnings"}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/><path d="M2 22c0-4.418 4.477-8 10-8s10 3.582 10 8"/></svg>}
        />
      </div>

      {/* authorized wallet */}
      <div style={{ ...CARD, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p style={{ fontFamily: F, fontSize: "10.5px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Authorized Platform Wallet</p>
        </div>
        <p style={{ fontFamily: "monospace", fontSize: 13, color: isAuthorized ? "#22c55e" : "rgba(255,255,255,0.55)", margin: 0, wordBreak: "break-all" }}>
          {isWalletLoading ? "Loading…" : authorizedWallet || "Not configured"}
        </p>
        <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.28)", margin: "8px 0 0" }}>
          Only this wallet can withdraw platform fees. Creator earnings can be withdrawn by any connected creator wallet.
        </p>
      </div>

      {/* withdrawal history */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: F, fontWeight: 600, fontSize: "10.5px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
          Withdrawal History
        </p>
        <WithdrawHistory history={history} />
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export default PlatformEarnings;
