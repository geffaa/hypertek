import { useAccount, useConnect, useDisconnect, useSigner, useNetwork, useSwitchNetwork } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useRainbowWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: signer } = useSigner();
  
  const [walletAddress, setWalletAddress] = useState(null);
  const [isSepolia, setIsSepolia] = useState(false);

  // Update wallet address when connected
  useEffect(() => {
    if (address) {
      setWalletAddress(address.toLowerCase());
    } else {
      setWalletAddress(null);
    }
  }, [address]);

  // Check if on Sepolia
  useEffect(() => {
    if (chain) {
      setIsSepolia(chain.id === sepolia.id);
    } else {
      setIsSepolia(false);
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

  // Switch to Sepolia network
  const switchToSepolia = useCallback(async (showToast = true) => {
    if (!switchNetworkAsync) {
      if (showToast) toast.error('Network switching not available');
      return false;
    }

    try {
      const toastId = showToast ? toast.loading('Switching to Sepolia...') : null;
      await switchNetworkAsync(sepolia.id);
      if (showToast) toast.success('Switched to Sepolia', { id: toastId });
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      if (showToast) {
        if (error.code === 4902) {
          toast.error('Sepolia network not added to wallet');
        } else if (error.code === 4001) {
          toast.error('Network switch cancelled');
        } else {
          toast.error('Failed to switch network');
        }
      }
      return false;
    }
  }, [switchNetworkAsync]);

  // Ensure we're on Sepolia before transactions
  const ensureSepoliaNetwork = useCallback(async (showToast = true) => {
    if (!isConnected) {
      if (showToast) toast.error('Please connect wallet first');
      return false;
    }

    if (!isSepolia) {
      return await switchToSepolia(showToast);
    }

    return true;
  }, [isConnected, isSepolia, switchToSepolia]);

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
    isSepolia,
    chain,
    signer,
    connectWallet,
    disconnectWallet,
    ensureSepoliaNetwork,
    switchToSepolia,
  };
};