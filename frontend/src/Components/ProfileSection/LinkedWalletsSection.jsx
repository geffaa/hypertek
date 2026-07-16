import React from "react";
import { useSelector } from "react-redux";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { FiLink, FiTrash2 } from "react-icons/fi";
import { useLinkExternalWallet } from "../../hooks/useLinkExternalWallet";

const short = (a) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "");

/**
 * Link external wallets (MetaMask, Coinbase Wallet, ...) to this account.
 * Ownership is proven with a signed message; once linked, purchases made from
 * the wallet appear in this account's profile and collections.
 */
export default function LinkedWalletsSection() {
  const { user } = useSelector((s) => s.auth);
  const { address: connectedAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { linkWallet, unlinkWallet, busy } = useLinkExternalWallet();

  const linked = user?.LinkedWallets || [];
  const myAddresses = new Set(
    [user?.WalletAddress, user?.MetaMaskAddress, ...linked.map((w) => w.address)]
      .filter(Boolean)
      .map((a) => a.toLowerCase())
  );
  const connectedLc = connectedAddress?.toLowerCase();
  const connectedIsMine = connectedLc && myAddresses.has(connectedLc);

  const handleLink = async () => {
    if (!isConnected || !connectedAddress) {
      openConnectModal?.();
      return;
    }
    await linkWallet(connectedAddress);
  };

  const handleUnlink = async (address) => {
    const ok = await unlinkWallet(address);
    if (ok && connectedLc === address.toLowerCase()) disconnect();
  };

  return (
    <div className="w-full max-w-md mt-4">
      <label
        className="block text-white font-bold text-[18px] md:text-[20.97px] leading-[100%] my-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Linked External Wallets
      </label>

      <div className="bg-[#1C1C1E] border border-blue-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          Already have MetaMask or another wallet? Link it here and purchases made
          from it will show up in your collections, right next to items from your
          built-in wallet.
        </p>

        {linked.length > 0 && (
          <div className="space-y-2 mb-4">
            {linked.map((w) => (
              <div key={w.address} className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                <span className="text-sm font-mono text-blue-400">{short(w.address)}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleUnlink(w.address)}
                  className="text-gray-400 hover:text-red-400 p-1 disabled:opacity-40"
                  data-tooltip="Unlink"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isConnected && connectedAddress && !connectedIsMine && (
          <p className="text-xs text-amber-300/80 mb-3">
            Wallet {short(connectedAddress)} is connected but not linked yet.
          </p>
        )}
        {isConnected && connectedIsMine && (
          <p className="text-xs text-green-400/80 mb-3">
            Wallet {short(connectedAddress)} is connected and linked to this account.
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={handleLink}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
        >
          <FiLink size={14} />
          {!isConnected ? "Connect a wallet to link" : connectedIsMine ? "Link another wallet" : `Link ${short(connectedAddress)}`}
        </button>
        {isConnected && connectedIsMine && (
          <p className="text-[11px] text-gray-500 mt-2">
            To link a different wallet, switch accounts in your wallet app first.
          </p>
        )}
      </div>
    </div>
  );
}
