import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { isWalletTester } from './CdpIntegration.jsx';

const EmailWalletContext = createContext({});

// ─────────────────────────────────────────────────────────────────────────────
// Coinbase CDP implementation — the embedded wallet's keys live in a TEE and
// never exist inside this app or our backend. viem prepares each transaction
// as usual; only the signing step is delegated to CDP (its transaction type
// IS viem's TransactionSerializableEIP1559), then viem broadcasts through the
// normal RPC transport. Exposes the exact same context shape as the legacy
// provider so call sites (`walletClient || emailWalletClient`) are untouched.
// Only mounted when CDP_WALLET_ENABLED (requires CdpIntegrationProvider above).
// ─────────────────────────────────────────────────────────────────────────────
const CdpEmailWalletProvider = ({ children }) => {
    const { token, user } = useSelector((state) => state.auth);
    const { isInitialized } = useIsInitialized();
    const { evmAddress } = useEvmAddress();
    const { signEvmTransaction } = useSignEvmTransaction();
    const { signEvmMessage } = useSignEvmMessage();
    const { signEvmTypedData } = useSignEvmTypedData();

    const loggedIn = Boolean(token && user);
    const emailWalletAddress = loggedIn && evmAddress ? evmAddress : null;

    const emailWalletClient = useMemo(() => {
        if (!emailWalletAddress) return null;
        const account = toAccount({
            address: emailWalletAddress,
            async signMessage({ message }) {
                const raw = typeof message === 'string'
                    ? message
                    : (typeof message.raw === 'string' ? message.raw : new TextDecoder().decode(message.raw));
                const { signature } = await signEvmMessage({ evmAccount: emailWalletAddress, message: raw });
                return signature;
            },
            async signTransaction(transaction) {
                const { signedTransaction } = await signEvmTransaction({ evmAccount: emailWalletAddress, transaction });
                return signedTransaction;
            },
            async signTypedData(typedData) {
                const { signature } = await signEvmTypedData({ evmAccount: emailWalletAddress, typedData });
                return signature;
            },
        });
        const client = createWalletClient({ account, chain: activeChain, transport: http(activeRpc) });
        console.log('CDP Wallet Client Initialized:', emailWalletAddress);
        return client;
    }, [emailWalletAddress]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <EmailWalletContext.Provider value={{
            emailWalletAddress,
            emailWalletClient,
            isEmailWalletConnecting: loggedIn && (!isInitialized || !evmAddress),
            isEmailWalletConnected: !!emailWalletAddress,
            emailWalletError: null,
            privateKey: null, // non-custodial: the key never exists in the app
            initWalletWithPrivateKey: () => {
                console.warn('initWalletWithPrivateKey is disabled: wallets are non-custodial (Coinbase CDP).');
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

// Runtime provider choice: CDP only for designated tester accounts during the
// staged rollout; everyone else keeps the legacy custodial flow. Switching
// component identity on login/logout remounts the subtree, which is fine.
export const EmailWalletProvider = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const useCdp = CDP_WALLET_ENABLED && isWalletTester(user);
    const Provider = useCdp ? CdpEmailWalletProvider : LegacyEmailWalletProvider;
    return <Provider>{children}</Provider>;
};

export const useGlobalEmailWallet = () => useContext(EmailWalletContext);
