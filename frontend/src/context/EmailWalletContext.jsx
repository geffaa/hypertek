import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount, toAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { useEvmAddress, useIsInitialized, useSignEvmTransaction, useSignEvmMessage, useSignEvmTypedData } from '@coinbase/cdp-hooks';

const chainId = Number(import.meta.env.VITE_CHAIN_ID) || 8453;
const activeChain = chainId === 84532 ? baseSepolia : base;
const activeRpc = chainId === 84532 ? 'https://base-sepolia-rpc.publicnode.com' : 'https://mainnet.base.org';
import axios from 'axios';
import { BACKEND_BASE_URL, CDP_WALLET_ENABLED } from '../Config.js';
import { isCdpUser } from './CdpIntegration.jsx';

const EmailWalletContext = createContext({});

// ─────────────────────────────────────────────────────────────────────────────
// Unified provider (mounted when CDP_WALLET_ENABLED). One component serves
// both wallet engines so logging in never swaps the provider identity — a
// swap would remount the whole subtree and wipe page state (e.g. the signup
// wallet modal). Which engine's value is exposed is decided per render:
//
// • CDP path (new accounts, HasCustodialWallet: false, + tester accounts):
//   the embedded wallet's keys live in a TEE and never exist inside this app
//   or our backend. viem prepares each transaction as usual; only the signing
//   step is delegated to CDP (its transaction type IS viem's
//   TransactionSerializableEIP1559), then viem broadcasts through the normal
//   RPC transport. The address is persisted once via POST /user/link-wallet
//   with a signature proving ownership.
//
// • Legacy path (accounts with an existing managed wallet, incl. Don's):
//   backend decrypts the stored key and this context turns it into a signer.
//   Unchanged behavior — these accounts keep their address, items, balances.
// ─────────────────────────────────────────────────────────────────────────────
const UnifiedEmailWalletProvider = ({ children }) => {
    const { token, user } = useSelector((state) => state.auth);
    const cdp = isCdpUser(user);
    const loggedIn = Boolean(token && user);

    // ── CDP engine (hooks always called; inert while signed out of CDP) ──
    const { isInitialized } = useIsInitialized();
    const { evmAddress } = useEvmAddress();
    const { signEvmTransaction } = useSignEvmTransaction();
    const { signEvmMessage } = useSignEvmMessage();
    const { signEvmTypedData } = useSignEvmTypedData();
    const linkAttempted = useRef(false);

    const cdpAddress = cdp && loggedIn && evmAddress ? evmAddress : null;

    // Persist the embedded-wallet address once, proving ownership with a
    // signature. Idempotent server-side; safe to fire on every fresh session.
    useEffect(() => {
        if (!cdpAddress || !token || !user?.id || linkAttempted.current) return;
        if (user.WalletAddress && user.WalletAddress.toLowerCase() === cdpAddress.toLowerCase()) return;
        linkAttempted.current = true;
        (async () => {
            try {
                const { signature } = await signEvmMessage({
                    evmAccount: cdpAddress,
                    message: `hypertek-link-wallet:${user.id}`,
                });
                await axios.post(
                    `${BACKEND_BASE_URL}/api/v1/user/link-wallet`,
                    { address: cdpAddress, signature },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log('CDP wallet linked to account:', cdpAddress);
            } catch (e) {
                linkAttempted.current = false; // retry on next session/render cycle
                console.warn('link-wallet failed:', e.response?.data?.message || e.message);
            }
        })();
    }, [cdpAddress, token, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const cdpClient = useMemo(() => {
        if (!cdpAddress) return null;
        const account = toAccount({
            address: cdpAddress,
            async signMessage({ message }) {
                const raw = typeof message === 'string'
                    ? message
                    : (typeof message.raw === 'string' ? message.raw : new TextDecoder().decode(message.raw));
                const { signature } = await signEvmMessage({ evmAccount: cdpAddress, message: raw });
                return signature;
            },
            async signTransaction(transaction) {
                const { signedTransaction } = await signEvmTransaction({ evmAccount: cdpAddress, transaction });
                return signedTransaction;
            },
            async signTypedData(typedData) {
                const { signature } = await signEvmTypedData({ evmAccount: cdpAddress, typedData });
                return signature;
            },
        });
        const client = createWalletClient({ account, chain: activeChain, transport: http(activeRpc) });
        console.log('CDP Wallet Client Initialized:', cdpAddress);
        return client;
    }, [cdpAddress]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Legacy engine (fetch gated off for CDP users) ──
    const [legacyAddress, setLegacyAddress] = useState(null);
    const [legacyClient, setLegacyClient] = useState(null);
    const [isLegacyConnecting, setIsLegacyConnecting] = useState(false);
    const [legacyError, setLegacyError] = useState(null);
    const [privateKey, setPrivateKey] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const initializeEmailWallet = async () => {
            if (!token || !user || cdp) {
                if (isMounted) {
                    setLegacyClient(null);
                    setLegacyAddress(null);
                    setPrivateKey(null);
                }
                return;
            }

            try {
                setIsLegacyConnecting(true);
                const response = await axios.get(`${BACKEND_BASE_URL}/api/v1/user/wallet-address`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data?.WalletAddress && isMounted) {
                    setLegacyAddress(response.data.WalletAddress);
                    setLegacyError(null);
                    console.log("Email Wallet Address Loaded:", response.data.WalletAddress);

                    // Auto-init wallet client from private key so user can sign transactions
                    // without needing MetaMask. The private key is decrypted server-side and
                    // returned only to the authenticated user (JWT-protected endpoint).
                    if (response.data?.PrivateKey) {
                        try {
                            const pk = response.data.PrivateKey;
                            const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
                            const account = privateKeyToAccount(formattedPk);
                            const client = createWalletClient({ account, chain: activeChain, transport: http(activeRpc) });
                            if (isMounted) {
                                setLegacyClient(client);
                                setPrivateKey(formattedPk);
                                console.log("Email Wallet Client Auto-Initialized");
                            }
                        } catch (e) {
                            console.warn("Auto-init wallet client failed:", e.message);
                        }
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.log("ℹ️ No email wallet found for this user.");
                    setLegacyError(err.message);
                    setLegacyAddress(null);
                }
            } finally {
                if (isMounted) setIsLegacyConnecting(false);
            }
        };

        initializeEmailWallet();

        return () => {
            isMounted = false;
        };
    }, [token, user, cdp]);

    const initWalletWithPrivateKey = (pk) => {
        if (cdp) {
            console.warn('initWalletWithPrivateKey is disabled: this account is non-custodial (Coinbase CDP).');
            return;
        }
        try {
            const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
            const account = privateKeyToAccount(formattedPk);
            const client = createWalletClient({ account, chain: activeChain, transport: http(activeRpc) });
            setLegacyAddress(account.address);
            setLegacyClient(client);
            setPrivateKey(formattedPk);
        } catch (e) {
            console.error("Failed to init wallet from private key:", e);
        }
    };

    const value = cdp
        ? {
            emailWalletAddress: cdpAddress,
            emailWalletClient: cdpClient,
            isEmailWalletConnecting: loggedIn && (!isInitialized || !evmAddress),
            isEmailWalletConnected: !!cdpAddress,
            emailWalletError: null,
            privateKey: null, // non-custodial: the key never exists in the app
            initWalletWithPrivateKey,
        }
        : {
            emailWalletAddress: legacyAddress,
            emailWalletClient: legacyClient,
            isEmailWalletConnecting: isLegacyConnecting,
            isEmailWalletConnected: !!legacyAddress,
            emailWalletError: legacyError,
            privateKey,
            initWalletWithPrivateKey,
        };

    return (
        <EmailWalletContext.Provider value={value}>
            {children}
        </EmailWalletContext.Provider>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy-only provider — used when the CDP integration is disabled at build
// time (no VITE_CDP_PROJECT_ID). Identical to the pre-CDP behavior.
// ─────────────────────────────────────────────────────────────────────────────
const LegacyEmailWalletProvider = ({ children }) => {
    const { token, user } = useSelector((state) => state.auth);

    const [emailWalletAddress, setEmailWalletAddress] = useState(null);
    const [emailWalletClient, setEmailWalletClient] = useState(null);
    const [isEmailWalletConnecting, setIsEmailWalletConnecting] = useState(false);
    const [emailWalletError, setEmailWalletError] = useState(null);
    const [privateKey, setPrivateKey] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const initializeEmailWallet = async () => {
            if (!token || !user) {
                if (isMounted) {
                    setEmailWalletClient(null);
                    setEmailWalletAddress(null);
                    setPrivateKey(null);
                }
                return;
            }

            try {
                setIsEmailWalletConnecting(true);
                const response = await axios.get(`${BACKEND_BASE_URL}/api/v1/user/wallet-address`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data?.WalletAddress && isMounted) {
                    setEmailWalletAddress(response.data.WalletAddress);
                    setEmailWalletError(null);

                    if (response.data?.PrivateKey) {
                        try {
                            const pk = response.data.PrivateKey;
                            const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
                            const account = privateKeyToAccount(formattedPk);
                            const client = createWalletClient({ account, chain: activeChain, transport: http(activeRpc) });
                            if (isMounted) {
                                setEmailWalletClient(client);
                                setPrivateKey(formattedPk);
                            }
                        } catch (e) {
                            console.warn("Auto-init wallet client failed:", e.message);
                        }
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setEmailWalletError(err.message);
                    setEmailWalletAddress(null);
                }
            } finally {
                if (isMounted) setIsEmailWalletConnecting(false);
            }
        };

        initializeEmailWallet();

        return () => {
            isMounted = false;
        };
    }, [token, user]);

    const initWalletWithPrivateKey = (pk) => {
        try {
            const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
            const account = privateKeyToAccount(formattedPk);
            const client = createWalletClient({ account, chain: activeChain, transport: http(activeRpc) });
            setEmailWalletAddress(account.address);
            setEmailWalletClient(client);
            setPrivateKey(formattedPk);
        } catch (e) {
            console.error("Failed to init wallet from private key:", e);
        }
    };

    return (
        <EmailWalletContext.Provider value={{
            emailWalletAddress,
            emailWalletClient,
            isEmailWalletConnecting,
            isEmailWalletConnected: !!emailWalletAddress,
            emailWalletError,
            privateKey,
            initWalletWithPrivateKey,
        }}>
            {children}
        </EmailWalletContext.Provider>
    );
};

// Build-time choice only — stable across logins, so the tree never remounts.
export const EmailWalletProvider = CDP_WALLET_ENABLED ? UnifiedEmailWalletProvider : LegacyEmailWalletProvider;

export const useGlobalEmailWallet = () => useContext(EmailWalletContext);
