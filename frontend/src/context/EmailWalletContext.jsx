import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
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
                const response = await axios.get(`${BACKEND_BASE_URL}/api/v1/user/export-wallet`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data?.PrivateKey && isMounted) {
                    // Note: API returns PrivateKey (capital P) based on EditProfile.jsx
                    const pkRaw = response.data.PrivateKey || response.data.privateKey;
                    const pk = pkRaw.startsWith('0x') ? pkRaw : `0x${pkRaw}`;

                    const account = privateKeyToAccount(pk);

                    const client = createWalletClient({
                        account,
                        chain: baseSepolia,
                        transport: http('https://base-sepolia-rpc.publicnode.com')
                    });

                    setEmailWalletAddress(account.address);
                    setEmailWalletClient(client);
                    setPrivateKey(pk);
                    setEmailWalletError(null);
                    console.log("✅ Global Email Wallet Initialized:", account.address);
                }
            } catch (err) {
                if (isMounted) {
                    console.log("ℹ️ Global Email Wallet failed to fetch or not present.");
                    setEmailWalletError(err.message);
                    setEmailWalletClient(null);
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

    return (
        <EmailWalletContext.Provider value={{
            emailWalletAddress,
            emailWalletClient,
            isEmailWalletConnecting,
            isEmailWalletConnected: !!emailWalletClient,
            emailWalletError,
            privateKey
        }}>
            {children}
        </EmailWalletContext.Provider>
    );
};

export const useGlobalEmailWallet = () => useContext(EmailWalletContext);
