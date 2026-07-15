import React, { useRef, useState } from "react";
import { useEvmKeyExportIframe } from "@coinbase/cdp-hooks";

/**
 * Private-key export for non-custodial (CDP) accounts. The button lives in a
 * secure Coinbase-hosted iframe that copies the key straight to the user's
 * clipboard — the key never passes through this app's JavaScript, which is
 * strictly safer than the legacy reveal flow.
 */
export default function CdpKeyExport({ address }) {
  const containerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  const { status } = useEvmKeyExportIframe({
    address,
    containerRef,
    label: "Copy Private Key",
  });

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center text-sm"
        >
          Advanced: Export Private Key
        </button>
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
      {/* Secure export iframe mounts here; hidden until the user opts in */}
      <div ref={containerRef} className={expanded ? "mt-2 min-h-[44px]" : "hidden"} data-export-status={status || "initializing"} />
    </div>
  );
}
