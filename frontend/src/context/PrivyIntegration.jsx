import React from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { PrivyProvider, useSubscribeToJwtAuthWithFlag } from "@privy-io/react-auth";
import { BACKEND_BASE_URL, PRIVY_APP_ID, PRIVY_ENABLED } from "../Config.js";

/**
 * Privy custom-auth (JWT) integration.
 *
 * The site keeps its own email/password login. This bridge tells Privy who is
 * logged in: it exchanges the session token for a short-lived RS256 token
 * (GET /user/privy-token), which Privy verifies against the public key
 * configured in its dashboard. On first sync Privy creates the user's
 * embedded wallet client-side; the keys never touch our server.
 *
 * Everything here is inert unless VITE_PRIVY_APP_ID is set (PRIVY_ENABLED).
 */

function PrivyJwtBridge() {
  const { token, user } = useSelector((state) => state.auth);

  useSubscribeToJwtAuthWithFlag({
    isAuthenticated: Boolean(token && user),
    isLoading: false,
    // Must never throw — a throw logs the Privy user out.
    getExternalJwt: async () => {
      if (!token) return undefined;
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/user/privy-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.token || undefined;
      } catch (e) {
        console.warn("privy-token exchange failed:", e.message);
        return undefined;
      }
    },
    onError: (error) => console.warn("Privy JWT sync error:", error?.message),
  });

  return null;
}

export function PrivyIntegrationProvider({ children }) {
  if (!PRIVY_ENABLED) return children;
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: false,
        },
      }}
    >
      <PrivyJwtBridge />
      {children}
    </PrivyProvider>
  );
}
