import { useAccount, useConnect, useDisconnect, useSigner, useNetwork, useSwitchNetwork } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const IMMUTABLE_CHAIN_ID = 13473;

export const useRainbowWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: signer } = useSigner();
  
  const [walletAddress, setWalletAddress] = useState(null);
  const [isImmutable, setIsImmutable] = useState(false);

  // Update wallet address when connected
  useEffect(() => {
    if (address) {
      setWalletAddress(address.toLowerCase());
    } else {
      setWalletAddress(null);
    }
  }, [address]);

  // Check if on Immutable zkEVM
  useEffect(() => {
    if (chain) {
      setIsImmutable(chain.id === IMMUTABLE_CHAIN_ID);
    } else {
      setIsImmutable(false);
    }
  }, [chain]);

  // Connect wallet with RainbowKit modal
  const connectWallet = useCallback(async () => {
    try {
      if (openConnectModal) {
        openConnectModal();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error opening connect modal:', error);
      toast.error('Failed to open wallet connection');
      return false;
    }
  }, [openConnectModal]);

  // Switch to Immutable network
  const switchToImmutable = useCallback(async (showToast = true) => {
    if (!switchNetworkAsync) {
      if (showToast) toast.error('Network switching not available');
      return false;
    }

    try {
      const toastId = showToast ? toast.loading('Switching to Immutable...') : null;
      await switchNetworkAsync(IMMUTABLE_CHAIN_ID);
      if (showToast) toast.success('Switched to Immutable', { id: toastId });
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      if (showToast) {
        if (error.code === 4902) {
          toast.error('Immutable network not added to wallet');
        } else if (error.code === 4001) {
          toast.error('Network switch cancelled');
        } else {
          toast.error('Failed to switch network');
        }
      }
      return false;
    }
  }, [switchNetworkAsync]);

  // Ensure we're on Immutable before transactions
  const ensureImmutableNetwork = useCallback(async (showToast = true) => {
    if (!isConnected) {
      if (showToast) toast.error('Please connect wallet first');
      return false;
    }

    if (!isImmutable) {
      return await switchToImmutable(showToast);
    }

    return true;
  }, [isConnected, isImmutable, switchToImmutable]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setWalletAddress(null);
    toast.success('Wallet disconnected');
  }, [disconnect]);

  return {
    address: walletAddress,
    isConnected,
    isConnecting,
    isImmutable,
    chain,
    signer,
    connectWallet,
    disconnectWallet,
    ensureImmutableNetwork,
    switchToImmutable,
  };
};