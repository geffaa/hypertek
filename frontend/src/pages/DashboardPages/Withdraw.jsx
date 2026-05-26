import React from 'react';
import { BASE_USDC_ADDRESS, ERC20_ABI, BASE_MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '../../Web3/Config';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { useAccount, usePublicClient, useReadContract, useWalletClient } from 'wagmi';
import { useEmailWallet } from '../../hooks/useEmailWallet';

const Withdraw = () => {
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
    const { emailWalletAddress, emailWalletClient, isEmailWalletConnected } = useEmailWallet();
    const activeAddress = wagmiAddress || emailWalletAddress;
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const activeWalletClient = walletClient || emailWalletClient;

    const { data: rawSellerBalance, refetch: refetchSeller } = useReadContract({
        address: BASE_MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'sellerBalance',
        args: activeAddress ? [activeAddress] : undefined,
        query: { enabled: !!activeAddress }
    });

    const { data: rawCreatorBalance, refetch: refetchCreator } = useReadContract({
        address: BASE_MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'creatorBalance',
        args: activeAddress ? [activeAddress] : undefined,
        query: { enabled: !!activeAddress }
    });

    const sellerBalance = rawSellerBalance ? ethers.formatUnits(rawSellerBalance, 6) : '0';
    const creatorBalance = rawCreatorBalance ? ethers.formatUnits(rawCreatorBalance, 6) : '0';

    const handleWithdrawEarnings = async (type) => {
        if (!activeAddress || !activeWalletClient) {
            toast.error("Please connect your wallet");
            return;
        }
        const toastId = toast.loading(`Claiming ${type} earnings...`);
        try {
            const functionName = type === 'seller' ? 'withdrawSeller' : 'withdrawCreator';
            const txHash = await activeWalletClient.writeContract({
                address: BASE_MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName,
                account: activeWalletClient.account || activeAddress,
            });
            toast.loading("Waiting for confirmation...", { id: toastId });
            await publicClient.waitForTransactionReceipt({ hash: txHash });
            toast.success(`${type === 'seller' ? 'Seller' : 'Creator'} earnings claimed!`, { id: toastId });
            if (type === 'seller') refetchSeller();
            else refetchCreator();
        } catch (error) {
            toast.error(`Claim failed: ` + (error.shortMessage || error.message), { id: toastId });
        }
    };

    const hasEarnings = Number(sellerBalance) > 0 || Number(creatorBalance) > 0;

    return (
        <div className="w-full flex flex-col relative z-10">
            <div className="mb-6">
                <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">Marketplace Earnings</h1>
                <p className="text-white/50 text-sm mt-1">Claim USDC earned from NFT sales and creator royalties.</p>
            </div>

            {!activeAddress ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center w-full">
                    <p className="text-white/50 text-sm">Connect your wallet to view marketplace earnings.</p>
                </div>
            ) : !hasEarnings ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center w-full">
                    <p className="text-white/50 text-sm">No marketplace earnings to claim yet.</p>
                    <p className="text-white/30 text-xs mt-2">Earnings from NFT sales will appear here.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4 w-full">
                    {Number(sellerBalance) > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-white/50 text-xs mb-1">Seller Earnings</p>
                                <p className="text-white font-bold text-xl">
                                    {Number(sellerBalance).toFixed(2)}
                                    <span className="text-blue-400 text-sm font-normal ml-1.5">USDC</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleWithdrawEarnings('seller')}
                                className="bg-[#002AA8] hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl font-semibold transition-colors"
                            >
                                Claim
                            </button>
                        </div>
                    )}
                    {Number(creatorBalance) > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-white/50 text-xs mb-1">Creator Royalties</p>
                                <p className="text-white font-bold text-xl">
                                    {Number(creatorBalance).toFixed(2)}
                                    <span className="text-blue-400 text-sm font-normal ml-1.5">USDC</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleWithdrawEarnings('creator')}
                                className="bg-[#002AA8] hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl font-semibold transition-colors"
                            >
                                Claim
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Withdraw;
