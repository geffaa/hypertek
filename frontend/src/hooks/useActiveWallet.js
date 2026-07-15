import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useAccount, useWalletClient } from "wagmi";
import { useGlobalEmailWallet } from "../context/EmailWalletContext";

/**
 * Single source of truth for wallet state across the app.
 *
 * Two kinds of wallet can be live at once: the account's built-in wallet
 * (CDP or legacy custodial, via EmailWalletContext) and an external wallet
 * connected through RainbowKit/wagmi. The rule that keeps them from fighting:
 *
 *   an external wallet is only trusted for signing when its address is one
 *   of the addresses PROVEN to belong to this account (built-in address,
 *   legacy MetaMaskAddress, or a signature-verified LinkedWallets entry).
 *
 * A foreign wallet that happens to be connected in the browser is surfaced
 * as `connectedUnlinkedAddress` (so the UI can offer to link it) but never
 * changes whose items are shown or which signer is used.
 */
export function useActiveWallet() {
  const { user } = useSelector((state) => state.auth);
  const { address: wagmiAddress, isConnected: wagmiConnected, chain } = useAccount();
  const { data: wagmiClient } = useWalletClient();
  const {
    emailWalletAddress,
    emailWalletClient,
    isEmailWalletConnected,
    isEmailWalletConnecting,
  } = useGlobalEmailWallet() || {};

  const myAddresses = useMemo(() => {
    const set = new Set();
    if (emailWalletAddress) set.add(emailWalletAddress.toLowerCase());
    if (user?.WalletAddress) set.add(user.WalletAddress.toLowerCase());
    if (user?.MetaMaskAddress) set.add(user.MetaMaskAddress.toLowerCase());
    for (const w of user?.LinkedWallets || []) {
      if (w?.address) set.add(w.address.toLowerCase());
    }
    return [...set];
  }, [user, emailWalletAddress]);

  const wagmiLc = wagmiAddress ? wagmiAddress.toLowerCase() : null;
  const externalLinked = Boolean(wagmiConnected && wagmiLc && myAddresses.includes(wagmiLc));

  // The account's own address for display and profile/collection queries.
  // The backend expands it to every linked address server-side.
  const primaryAddress = emailWalletAddress || user?.WalletAddress || user?.MetaMaskAddress || null;

  return {
    /** every address proven to belong to this account (lowercase) */
    myAddresses,
    /** address to display and to query profile/collections with */
    primaryAddress,
    /** address transactions will be signed from */
    signingAddress: externalLinked ? wagmiAddress : emailWalletAddress,
    /** viem wallet client to sign with (external takes precedence when linked) */
    signingClient: (externalLinked ? wagmiClient : null) || emailWalletClient || null,
    isAnyConnected: externalLinked || Boolean(isEmailWalletConnected),
    isConnecting: Boolean(isEmailWalletConnecting),
    /** an external wallet is connected in the browser (linked or not) */
    externalConnected: Boolean(wagmiConnected && wagmiAddress),
    /** the connected external wallet belongs to this account */
    externalLinked,
    /** connected external wallet that is NOT linked to this account (offer to link) */
    connectedUnlinkedAddress: wagmiConnected && wagmiLc && !myAddresses.includes(wagmiLc) ? wagmiAddress : null,
    externalChainId: chain?.id ?? null,
  };
}
