import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { CDPHooksProvider, useAuthenticateWithJWT, useIsInitialized, useIsSignedIn, useSignOut } from "@coinbase/cdp-hooks";
import { store } from "../Redux/Store";
import { BACKEND_BASE_URL, CDP_PROJECT_ID, CDP_WALLET_ENABLED } from "../Config.js";

/**
 * Coinbase CDP embedded-wallet integration (custom auth).
 *
 * The site keeps its own email/password login. CDP learns who is logged in
 * through a short-lived RS256 token from GET /user/privy-token, verified
 * against our JWKS at https://api.hypertek100.com/.well-known/jwks.json.
 * On first authentication CDP creates the user's embedded wallet; keys live
 * in a TEE on Coinbase's side, and neither our server nor Coinbase staff can
 * read them. The user can export their key at any time.
 *
 * Everything here is inert unless VITE_CDP_PROJECT_ID is set.
 *
 * Staged rollout: while isWalletTester() gates the CDP path, only designated
 * test accounts get CDP wallets in production; every other user keeps the
 * legacy custodial flow. Widen the gate at cutover, once existing users'
 * wallet migration is decided.
 */

// Production testing happens under throwaway accounts on this domain only.
export function isWalletTester(user) {
  const email = user?.Email || user?.email || "";
  return email.toLowerCase().endsWith("@hypertektest.com");
}

// Called by the CDP SDK whenever it needs to authenticate a request.
// Reads the session token straight from the redux store since this runs
// outside the React tree. Must return undefined (not throw) when logged out.
async function getWalletAuthJwt() {
  const token = store.getState().auth?.token;
  if (!token) return undefined;
  try {
    const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/user/privy-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.token || undefined;
  } catch (e) {
    console.warn("wallet-auth token exchange failed:", e.message);
    return undefined;
  }
}

// Mirrors the site session into CDP: sign in (creating the wallet on first
// login) when our user logs in, sign out when they log out.
function CdpAuthBridge() {
  const { token, user } = useSelector((state) => state.auth);
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { authenticateWithJWT } = useAuthenticateWithJWT();
  const { signOut } = useSignOut();
  const busy = useRef(false);

  useEffect(() => {
    if (!isInitialized || busy.current) return;
    const shouldBeSignedIn = Boolean(token && user) && isWalletTester(user);

    if (shouldBeSignedIn && !isSignedIn) {
      busy.current = true;
      authenticateWithJWT()
        .then(({ isNewUser }) => {
          console.log(`CDP wallet session ready${isNewUser ? " (new wallet created)" : ""}`);
        })
        .catch((e) => console.warn("CDP JWT auth failed:", e?.message))
        .finally(() => { busy.current = false; });
    } else if (!shouldBeSignedIn && isSignedIn) {
      busy.current = true;
      signOut()
        .catch(() => {})
        .finally(() => { busy.current = false; });
    }
  }, [isInitialized, isSignedIn, token, user, authenticateWithJWT, signOut]);

  return null;
}

export function CdpIntegrationProvider({ children }) {
  if (!CDP_WALLET_ENABLED) return children;
  return (
    <CDPHooksProvider config={{ projectId: CDP_PROJECT_ID, customAuth: { getJwt: getWalletAuthJwt } }}>
      <CdpAuthBridge />
      {children}
    </CDPHooksProvider>
  );
}
