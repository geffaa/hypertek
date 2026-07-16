import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiLink, FiX } from "react-icons/fi";
import { useActiveWallet } from "../../hooks/useActiveWallet";
import { useLinkExternalWallet } from "../../hooks/useLinkExternalWallet";

const short = (a) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "");

/**
 * In-context wallet linking: whenever a logged-in user has an external wallet
 * connected that is not yet linked to their account, offer to link it right
 * there with one click, on any page. Dismissal is remembered per address for
 * the session. Management (list/unlink) stays in Profile settings.
 */
export default function LinkWalletPrompt() {
  const { user, token } = useSelector((s) => s.auth);
  const { connectedUnlinkedAddress } = useActiveWallet();
  const { linkWallet, busy } = useLinkExternalWallet();
  const [dismissedFor, setDismissedFor] = useState(null);

  const addr = connectedUnlinkedAddress;

  // Re-arm when a different wallet connects
  useEffect(() => {
    if (addr && dismissedFor && dismissedFor !== addr.toLowerCase()) setDismissedFor(null);
  }, [addr, dismissedFor]);

  if (!user || !token || !addr) return null;
  const addrLc = addr.toLowerCase();
  if (dismissedFor === addrLc) return null;
  try {
    if (sessionStorage.getItem(`ht_linkprompt_${addrLc}`) === "dismissed") return null;
  } catch { /* ignore */ }

  const dismiss = () => {
    setDismissedFor(addrLc);
    try { sessionStorage.setItem(`ht_linkprompt_${addrLc}`, "dismissed"); } catch { /* ignore */ }
  };

  return (
    <div
      className="fixed bottom-5 left-5 z-[60] max-w-[320px] rounded-2xl p-4 shadow-2xl"
      style={{ background: "rgba(10,14,34,0.97)", border: "1px solid rgba(59,130,246,0.35)", backdropFilter: "blur(10px)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-white text-sm font-semibold leading-snug">
          Link wallet {short(addr)} to your account?
        </p>
        <button type="button" onClick={dismiss} className="text-gray-400 hover:text-white shrink-0 p-0.5">
          <FiX size={15} />
        </button>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed mb-3">
        A wallet is connected but not linked yet. Link it so purchases made from
        it appear in your collections, next to your built-in wallet items.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => linkWallet(addr)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
        >
          <FiLink size={12} />
          {busy ? "Waiting for signature..." : "Link wallet"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="px-3 py-2 border border-white/15 text-white/60 hover:text-white text-xs rounded-lg transition-all"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
