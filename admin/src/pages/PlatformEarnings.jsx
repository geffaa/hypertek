import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import toast from "react-hot-toast";

// Use the existing config logic copied from frontend
const MARKETPLACE_ADDRESS = "0x41E374A11391AfE9920c3c107CA8F578e34B6006"; // Active contract with accumulated balances
const MARKETPLACE_ABI = [
    {
        "functionName": "platformBalance",
        "name": "platformBalance",
        "type": "function",
        "stateMutability": "view",
        "inputs": [],
        "outputs": [{ "type": "uint256" }]
    },
    {
        "functionName": "platformWallet",
        "name": "platformWallet",
        "type": "function",
        "stateMutability": "view",
        "inputs": [],
        "outputs": [{ "type": "address" }]
    },
    {
        "functionName": "withdrawPlatformFees",
        "name": "withdrawPlatformFees",
        "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [],
        "outputs": []
    },
    {
        "functionName": "creatorBalance",
        "name": "creatorBalance",
        "type": "function",
        "stateMutability": "view",
        "inputs": [{ "type": "address", "name": "" }],
        "outputs": [{ "type": "uint256" }]
    },
    {
        "functionName": "withdrawCreator",
        "name": "withdrawCreator",
        "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [],
        "outputs": []
    }
];

// USDC for balance check of the wallet itself (optional but helpful)
const USDC_ADDRESS = "0x595BdF23a1e9B945e18ffBe4316572ACCC694aDE";
const USDC_ABI = [
    {
        "name": "balanceOf",
        "type": "function",
        "stateMutability": "view",
        "inputs": [{ "type": "address", "name": "account" }],
        "outputs": [{ "type": "uint256" }]
    }
];

function PlatformEarnings() {
    const { address, isConnected } = useAccount();

    const [balanceDisplay, setBalanceDisplay] = useState("0.00");
    const [creatorDisplay, setCreatorDisplay] = useState("0.00");

    // Read the accumulated platform fees
    const { data: rawBalance, refetch: refetchBalance, isLoading: isReading, error: balanceError } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'platformBalance',
        query: {
            refetchInterval: 10000
        }
    });

    // Read Creator Balance for this wallet (admin is also creator)
    const { data: rawCreatorBalance, refetch: refetchCreator } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'creatorBalance',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 10000
        }
    });

    // Read Authorized Wallet
    const { data: authorizedWallet, isLoading: isWalletLoading, error: walletError } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'platformWallet',
    });

    // Wallet's own USDC balance (to address "ye XMI ni USDC ay" potentially)
    const { data: walletUsdcBalance } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!address }
    });

    // Write contract hook for withdrawal
    const { writeContractAsync } = useWriteContract();

    useEffect(() => {
        if (rawBalance !== undefined) {
            setBalanceDisplay(ethers.formatUnits(rawBalance, 6));
        }
    }, [rawBalance]);

    useEffect(() => {
        if (rawCreatorBalance !== undefined) {
            setCreatorDisplay(ethers.formatUnits(rawCreatorBalance, 6));
        }
    }, [rawCreatorBalance]);

    const handleWithdraw = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first.");
            return;
        }

        if (authorizedWallet && address && authorizedWallet.toLowerCase() !== address.toLowerCase()) {
            toast.error("Unauthorized: Connected wallet is not the designated Platform Wallet.");
            return;
        }

        if (Number(balanceDisplay) <= 0) {
            toast.error("No platform fees available to withdraw.");
            return;
        }

        const loadId = toast.loading("Withdrawing platform fees...");
        try {
            const txHash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'withdrawPlatformFees',
            });
            toast.success(`Platform fees withdrawn! Tx: ${txHash.slice(0, 10)}...`, { id: loadId, duration: 5000 });
            setTimeout(() => { refetchBalance(); }, 15000);
        } catch (error) {
            console.error("Withdrawal error:", error);
            toast.error(error.shortMessage || error.message || "Withdrawal failed", { id: loadId });
        }
    };

    const handleCreatorWithdraw = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first.");
            return;
        }
        if (Number(creatorDisplay) <= 0) {
            toast.error("No creator earnings available to withdraw.");
            return;
        }
        const loadId = toast.loading("Withdrawing creator earnings...");
        try {
            const txHash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'withdrawCreator',
            });
            toast.success(`Creator earnings withdrawn! Tx: ${txHash.slice(0, 10)}...`, { id: loadId, duration: 5000 });
            setTimeout(() => { refetchCreator(); }, 15000);
        } catch (error) {
            console.error("Creator withdrawal error:", error);
            toast.error(error.shortMessage || error.message || "Creator withdrawal failed", { id: loadId });
        }
    };


    return (
        <div className="bg-black pt-12 overflow-hidden min-h-screen text-white relative">
            {/* Bg Effect */}
            <div
                style={{
                    top: `20px`,
                    left: `950px`,
                    width: "300px",
                    height: "300px",
                    background: "#002AA8",
                    filter: "blur(180px)",
                }}
                className="absolute rounded-full pointer-events-none"
            ></div>

            <div className="flex flex-col gap-6 p-10 max-w-4xl mx-auto relative z-10 mt-[80px]">
                <h1 className="text-4xl font-bold font-inter mb-2">Platform Treasury</h1>
                <p className="text-white/60 mb-8 max-w-2xl">
                    This dashboard interfaces directly with the Immutable Marketplace Smart Contract.
                    All marketplace fees are held in decentralized escrow and can only be withdrawn by the authorized Platform Wallet.
                </p>

                {/* Security / Connection Panel */}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6 mb-4 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold mb-1">Network Status</h3>
                        {isConnected ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-mono text-white/70">{address.slice(0, 10)}...{address.slice(-8)}</span>
                                </div>
                                {walletUsdcBalance !== undefined && (
                                    <span className="text-xs text-blue-400 mt-1">Wallet USDC: {ethers.formatUnits(walletUsdcBalance, 6)}</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-sm text-white/70">Wallet not connected</span>
                            </div>
                        )}
                    </div>

                    <ConnectButton />
                </div>

                {/* Financials Card - Platform Fees */}
                <div className="bg-[#1C1C1E] border border-green-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                    <h2 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Accumulated Platform Fees (10% fee)</h2>
                    <div className="flex items-end gap-3 mb-6 border-b border-white/10 pb-6">
                        <span className="text-6xl font-bold font-mono">{isReading ? "..." : balanceDisplay}</span>
                        <span className="text-2xl text-blue-400 font-bold mb-1">USDC</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                            <p className="text-sm text-white/50 mb-1">Authorized Platform Wallet:</p>
                            <p className="font-mono text-sm text-white/80 break-all">
                                {isWalletLoading ? "Loading..." : authorizedWallet || "Not Set"}
                            </p>
                            {walletError && <p className="text-[10px] text-red-500 mt-1">Error fetching wallet address</p>}
                        </div>
                        <button
                            onClick={handleWithdraw}
                            disabled={!isConnected || isReading || Number(balanceDisplay) <= 0}
                            className="mt-2 w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-colors"
                        >
                            Withdraw Platform Fees
                        </button>
                    </div>
                </div>

                {/* Creator Earnings Card */}
                <div className="bg-[#1C1C1E] border border-yellow-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                    <h2 className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-2">Creator Earnings (First sales + Royalties)</h2>
                    <div className="flex items-end gap-3 mb-6 border-b border-white/10 pb-6">
                        <span className="text-6xl font-bold font-mono text-yellow-400">{creatorDisplay}</span>
                        <span className="text-2xl text-yellow-400 font-bold mb-1">USDC</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-sm text-white/50">
                            ℹ️ This is the creator royalty balance for wallet <span className="font-mono text-yellow-300">{address?.slice(0, 10)}...</span>
                        </div>
                        <button
                            onClick={handleCreatorWithdraw}
                            disabled={!isConnected || Number(creatorDisplay) <= 0}
                            className="mt-2 w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-colors"
                        >
                            Withdraw Creator Earnings
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PlatformEarnings;
