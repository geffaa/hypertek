import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';

const chainId = Number(import.meta.env.VITE_CHAIN_ID) || 8453;
const activeChain = chainId === 84532 ? baseSepolia : base;
const activeRpc = chainId === 84532 ? 'https://base-sepolia-rpc.publicnode.com' : 'https://mainnet.base.org';
import axios from 'axios';
import { BACKEND_BASE_URL } from '../Config.js';

const EmailWalletContext = createContext({});

export const EmailWalletProvider = ({ children }) => {
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

export const useGlobalEmailWallet = () => useContext(EmailWalletContext);
