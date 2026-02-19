import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import { passportInstance } from '../utils/immutablePassport';
import { SEPOLIA_USDC_ADDRESS, IMMUTABLE_USDC_ADDRESS, ERC20_ABI } from '../Web3/Config';

// Helper to get provider based on connection type
// const getProvider = async (walletType) => { ... } // Removed unused helper causing v5 confusion


export function useTokenBalance(tokenAddress) {
    const { address: wagmiAddress, isConnected: isWagmiConnected, chainId } = useAccount();
    // Assuming you have a way to know if Immutable is connected from your global state or context
    // For now, we'll try to detect it or pass it in. 
    // Ideally, this hook should integrate `useImmutableWallet` or similar context.
    
    // We will maintain local state for balance
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Determines active wallet info
    // In a real app, this might come from a unified "useWallet" hook
    const [activeWallet, setActiveWallet] = useState({ type: null, address: null });

    useEffect(() => {
        const checkConnection = async () => {
            // Check Wagmi first
            if (isWagmiConnected && wagmiAddress) {
                setActiveWallet({ type: 'wagmi', address: wagmiAddress });
                return;
            }

            // Check Immutable
            try {
                 const user = await passportInstance.getUserInfo();
                 if(user){
                    try {
                        const provider = await passportInstance.connectEvm();
                        const accounts = await provider.request({ method: 'eth_requestAccounts' });
                        if(accounts[0]){
                            setActiveWallet({ type: 'immutable', address: accounts[0] });
                        }
                    } catch (innerErr) {
                         console.warn("Immutable EVM connection failed (likely not logged in to EVM or network issue):", innerErr);
                    }
                 }
            } catch (e) {
                // Not connected to immutable
                console.log("Not connected to Immutable in hook");
            }
        };
        checkConnection();
    }, [isWagmiConnected, wagmiAddress]);


    const fetchBalance = useCallback(async () => {
        if (!activeWallet.address) return;
        setLoading(true);
        try {
            let bal;
            let provider;
            
            // Determine Provider (Ethers v6)
            if (activeWallet.type === 'immutable') {
                const p = await passportInstance.connectEvm();
                provider = new ethers.BrowserProvider(p);
            } else {
                 // Fallback for Wagmi/Window
                 if(window.ethereum) {
                    provider = new ethers.BrowserProvider(window.ethereum);
                 }
            }

            if(!provider) throw new Error("No provider found");
            
            console.log(`[useTokenBalance] Wallet: ${activeWallet.type}, Address: ${activeWallet.address}, Token: ${tokenAddress}`);

            // Fetch Token Balance (ERC20)
            if (tokenAddress && tokenAddress !== "0x0000000000000000000000000000000000000000") {
                try {
                    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
                    const rawBal = await contract.balanceOf(activeWallet.address);
                    const decimals = await contract.decimals();
                    bal = ethers.formatUnits(rawBal, decimals);
                } catch (contractErr) {
                    console.error("[useTokenBalance] Contract Call Failed:", contractErr);
                    // If contract call fails (e.g. wrong network), fallback to 0 but keep error for debugging if needed
                    throw contractErr; 
                }
            } else {
                console.warn("[useTokenBalance] No valid token address or using native ETH");
                // Fetch Native Balance (ETH) if no specific token or fallback
                const rawBal = await provider.getBalance(activeWallet.address);
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
    }, [activeWallet, tokenAddress]);

    // Poll balance every 15 seconds
    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, [fetchBalance]);


    return { balance, loading, error, refresh: fetchBalance, activeWallet };
}
