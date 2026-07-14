import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createWalletClient, http, custom } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { useWallets } from '@privy-io/react-auth';

const chainId = Number(import.meta.env.VITE_CHAIN_ID) || 8453;
const activeChain = chainId === 84532 ? baseSepolia : base;
const activeRpc = chainId === 84532 ? 'https://base-sepolia-rpc.publicnode.com' : 'https://mainnet.base.org';
import axios from 'axios';
import { BACKEND_BASE_URL, PRIVY_ENABLED } from '../Config.js';

const EmailWalletContext = createContext({});

// ─────────────────────────────────────────────────────────────────────────────
// Privy implementation — the embedded wallet lives on the user's device; the
// signer comes from Privy's EIP-1193 provider and no private key ever reaches
// this app or the backend. Exposes the exact same context shape as the legacy
// provider so call sites (`walletClient || emailWalletClient`) are untouched.
// Only mounted when PRIVY_ENABLED (requires PrivyIntegrationProvider above us).
// ─────────────────────────────────────────────────────────────────────────────
const PrivyEmailWalletProvider = ({ children }) => {
    const { token, user } = useSelector((state) => state.auth);
    const { wallets, ready } = useWallets();

    const [emailWalletAddress, setEmailWalletAddress] = useState(null);
    const [emailWalletClient, setEmailWalletClient] = useState(null);
    const [emailWalletError, setEmailWalletError] = useState(null);

    const embedded = wallets.find(
        (w) => w.walletClientType === 'privy' || w.walletClientType === 'privy-v2'
    );
    const embeddedAddress = embedded?.address || null;

    useEffect(() => {
        let isMounted = true;

        const initFromPrivy = async () => {
            if (!token || !user || !embedded) {
                if (isMounted) {
                    setEmailWalletClient(null);
                    setEmailWalletAddress(null);
                }
                return;
            }
            try {
                const provider = await embedded.getEthereumProvider();
                const client = createWalletClient({
                    account: embedded.address,
                    chain: activeChain,
                    transport: custom(provider),
                });
                if (isMounted) {
                    setEmailWalletAddress(embedded.address);
                    setEmailWalletClient(client);
                    setEmailWalletError(null);
                    console.log('Privy Wallet Client Initialized:', embedded.address);
                }
            } catch (e) {
                console.warn('Privy wallet client init failed:', e.message);
                if (isMounted) setEmailWalletError(e.message);
            }
        };

        initFromPrivy();
        return () => { isMounted = false; };
    }, [token, user, embeddedAddress]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <EmailWalletContext.Provider value={{
            emailWalletAddress,
            emailWalletClient,
            isEmailWalletConnecting: Boolean(token && user) && !ready,
            isEmailWalletConnected: !!emailWalletAddress,
            emailWalletError,
            privateKey: null, // non-custodial: the key never exists in the app
            initWalletWithPrivateKey: () => {
                console.warn('initWalletWithPrivateKey is disabled: wallets are non-custodial (Privy).');
            },
        }}>
            {children}
        </EmailWalletContext.Provider>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy custodial implementation — backend decrypts the user's private key
// and this context turns it into a signer. Being replaced by the Privy path.
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
                                setEmailWalletClient(client);
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

export const EmailWalletProvider = PRIVY_ENABLED ? PrivyEmailWalletProvider : LegacyEmailWalletProvider;

export const useGlobalEmailWallet = () => useContext(EmailWalletContext);
