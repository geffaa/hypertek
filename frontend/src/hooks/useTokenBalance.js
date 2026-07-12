import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useEmailWallet } from './useEmailWallet';
import { ERC20_ABI } from '../Web3/Config';

// Must match the configured network (VITE_CHAIN_ID), not be hardcoded to mainnet —
// users on the custodial email wallet (no injected window.ethereum, the primary path
// for non-crypto-native users) always hit this fallback, so a hardcoded mainnet RPC
// silently queries the wrong chain whenever the app runs on testnet.
const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID) || 8453;
const FALLBACK_RPC = CHAIN_ID === 84532 ? 'https://base-sepolia-rpc.publicnode.com' : 'https://mainnet.base.org';

export function useTokenBalance(tokenAddress) {
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { emailWalletAddress } = useEmailWallet();
    const { address: wagmiAddress } = useAccount();
    const activeAddress = wagmiAddress || emailWalletAddress;

    const fetchBalance = useCallback(async () => {
        if (!activeAddress) {
            setBalance('0');
            return;
        }
        setLoading(true);
        try {
            let bal;
            // Best-effort provider: window.ethereum or public RPC
            const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : new ethers.JsonRpcProvider(FALLBACK_RPC);

            console.log(`[useTokenBalance] Address: ${activeAddress}, Token: ${tokenAddress}`);

            if (tokenAddress && tokenAddress !== "0x0000000000000000000000000000000000000000") {
                const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                const rawBal = await contract.balanceOf(activeAddress);
                const decimals = await contract.decimals();
                bal = ethers.formatUnits(rawBal, decimals);
            } else {
                console.warn("[useTokenBalance] No valid token address or using native ETH");
                const rawBal = await provider.getBalance(activeAddress);
                bal = ethers.formatEther(rawBal);
            }

            setBalance(bal);
            setError(null);
        } catch (err) {
            console.error("[useTokenBalance] Error fetching balance:", err);
            setError(err);
            setBalance('0');
        } finally {
            setLoading(false);
        }
    }, [activeAddress, tokenAddress]);

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    return { balance, loading, error, refresh: fetchBalance, activeWallet: { address: activeAddress } };
}
