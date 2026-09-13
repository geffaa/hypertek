import React, { useRef, useState } from "react";
import { useEvmKeyExportIframe } from "@coinbase/cdp-hooks";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";

// Must live at module scope: the hook recreates the iframe whenever its
// options change identity, so an inline object here puts it in a mount loop.
// Transparent page + the site's primary button style.
const EXPORT_IFRAME_THEME = {
  pageBg: "transparent",
  buttonBg: "#002AA8",
  buttonBgHover: "#003BD4",
  buttonBgPressed: "#001F7A",
  buttonBgFocus: "#003BD4",
  buttonBorder: "#FFFFFF33",
  buttonBorderHover: "#FFFFFF4D",
  buttonBorderPressed: "#FFFFFF33",
  buttonBorderFocus: "#60A5FA",
  buttonText: "#FFFFFF",
  buttonTextHover: "#FFFFFF",
  buttonTextPressed: "#FFFFFF",
  buttonTextFocus: "#FFFFFF",
  buttonBorderRadius: 8,
  buttonFontSize: 14,
  buttonFontWeight: 600,
  buttonSize: "md",
};

/**
 * Private-key export for non-custodial (CDP) accounts. Gated behind a
 * password re-entry, same pattern as the legacy custodial reveal flow, before
 * the Coinbase-hosted export button is even mounted. The key itself still
 * never passes through this app's JavaScript once unlocked — that part is
 * unchanged, only the "can this session reach the button at all" check is new.
 */
export default function CdpKeyExport({ address }) {
  const token = useSelector((state) => state.auth.token);
  const containerRef = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  const { status } = useEvmKeyExportIframe({
    address,
    containerRef,
    label: "Copy Private Key",
    copiedLabel: "Copied to clipboard!",
    theme: EXPORT_IFRAME_THEME,
  });

  const handleVerify = async () => {
    if (!password) return;
    setVerifying(true);
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/user/verify-password`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUnlocked(true);
      setShowPasswordPrompt(false);
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect password.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {!unlocked ? (
        !showPasswordPrompt ? (
          <button
            type="button"
            onClick={() => setShowPasswordPrompt(true)}
            className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center text-sm"
          >
            Advanced: Export Private Key
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Enter your password to continue:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={verifying}
                onClick={handleVerify}
                className="flex-1 py-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
              >
                {verifying ? "Verifying..." : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordPrompt(false); setPassword(""); }}
                className="px-4 py-2 border border-white/15 text-white/60 hover:text-white text-sm rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            Your key is held in your own wallet, secured by Coinbase. The button below copies it
            to your clipboard through a secure window; it is never visible to this site.
          </p>
          <p className="text-[11px] text-red-400 leading-tight">
            ⚠️ Never share this private key. Anyone with this key controls your assets.
          </p>
        </div>
      )}
      {/* Secure export iframe mounts here; hidden until the password check passes */}
      <div ref={containerRef} className={unlocked ? "mt-2 min-h-[44px]" : "hidden"} data-export-status={status || "initializing"} />
    </div>
  );
}
