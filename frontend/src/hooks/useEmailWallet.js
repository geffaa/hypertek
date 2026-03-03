import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createWalletClient, http, custom } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import axios from 'axios';
import { BACKEND_BASE_URL } from '../Config';

export const useEmailWallet = () => {
  const { token, user } = useSelector((state) => state.auth);
  
  const [emailWalletAddress, setEmailWalletAddress] = useState(null);
  const [emailWalletClient, setEmailWalletClient] = useState(null);
  const [isEmailWalletConnecting, setIsEmailWalletConnecting] = useState(false);
  const [emailWalletError, setEmailWalletError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeEmailWallet = async () => {
      // Only proceed if we have a user and they logged in via email/social (check if we can get a PK)
      if (!token || !user) {
        if (isMounted) setEmailWalletClient(null);
        return;
      }

      try {
        setIsEmailWalletConnecting(true);
        // Attempt to fetch the user's private key securely
        const response = await axios.get(`${BACKEND_BASE_URL}/api/v1/user/export-wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.privateKey && isMounted) {
            const privateKey = response.data.privateKey.startsWith('0x') 
                ? response.data.privateKey 
                : `0x${response.data.privateKey}`;
            
            const account = privateKeyToAccount(privateKey);
            
            const client = createWalletClient({
                account,
                chain: baseSepolia,
                transport: http()
            });

            setEmailWalletAddress(account.address);
            setEmailWalletClient(client);
            setEmailWalletError(null);
            console.log("✅ Email Wallet Initialized Local viem Client:", account.address);
        }
      } catch (err) {
        if (isMounted) {
            console.log("ℹ️ User does not have an active Email Wallet or failed to fetch PK.");
            setEmailWalletError(err.message);
            setEmailWalletClient(null);
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

  return {
    emailWalletAddress,
    emailWalletClient,
    isEmailWalletConnecting,
    isEmailWalletConnected: !!emailWalletClient,
    emailWalletError
  };
};
