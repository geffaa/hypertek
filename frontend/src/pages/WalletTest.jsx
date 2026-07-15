import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useGlobalEmailWallet } from "../context/EmailWalletContext";
import { isCdpUser } from "../context/CdpIntegration";
import { CDP_WALLET_ENABLED } from "../Config";

/**
 * Staged-rollout smoke-test page for the CDP embedded wallet.
 * Only reachable by designated tester accounts while the CDP path is gated;
 * everyone else is redirected home. Remove after the full cutover.
 */
export default function WalletTest() {
  const { user } = useSelector((s) => s.auth);
  const { emailWalletAddress, emailWalletClient, isEmailWalletConnecting } = useGlobalEmailWallet();
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const add = (m) => setLog((l) => [...l, `${new Date().toISOString().slice(11, 19)}  ${m}`]);

  if (!CDP_WALLET_ENABLED || !isCdpUser(user)) return <Navigate to="/" replace />;

  const signTest = async () => {
    if (!emailWalletClient) return add("wallet client not ready");
    setBusy(true);
    try {
      add("signing test message...");
      const sig = await emailWalletClient.signMessage({
        account: emailWalletClient.account,
        message: "hypertek cdp wallet test",
      });
      add(`SIGN OK: ${sig.slice(0, 34)}...`);
    } catch (e) {
      add(`SIGN ERROR: ${e.shortMessage || e.message}`);
    } finally { setBusy(false); }
  };

  const sendTest = async () => {
    if (!emailWalletClient) return add("wallet client not ready");
    setBusy(true);
    try {
      add("sending 0-value self-transfer...");
      const hash = await emailWalletClient.sendTransaction({
        account: emailWalletClient.account,
        to: emailWalletAddress,
        value: 0n,
      });
      add(`TX OK: ${hash}`);
    } catch (e) {
      add(`TX ERROR: ${e.shortMessage || e.message}`);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen text-white pt-[100px] px-8" style={{ background: "#060610" }}>
      <h1 className="text-xl font-bold mb-4">CDP Wallet Test (tester only)</h1>
      <p className="text-white/60 text-sm mb-1">User: {user?.Email}</p>
      <p className="text-white/60 text-sm mb-6" data-testid="wallet-address">
        CDP wallet: {emailWalletAddress || (isEmailWalletConnecting ? "connecting..." : "none")}
      </p>
      <div className="flex gap-3 mb-6">
        <button onClick={signTest} disabled={busy || !emailWalletClient} data-testid="btn-sign"
          className="px-4 py-2 rounded-lg bg-[#002AA8] disabled:opacity-40 text-sm font-semibold">
          Sign test message
        </button>
        <button onClick={sendTest} disabled={busy || !emailWalletClient} data-testid="btn-send"
          className="px-4 py-2 rounded-lg bg-[#0a5c2e] disabled:opacity-40 text-sm font-semibold">
          Send 0-value self-transfer
        </button>
      </div>
      <pre data-testid="log" className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed">
        {log.join("\n")}
      </pre>
    </div>
  );
}
