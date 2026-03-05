import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import toast from "react-hot-toast";

// Use the existing config logic copied from frontend
const MARKETPLACE_ADDRESS = "0x08C05937428c53b6fE248fd96C6DADD511cBC1b3"; // Active contract with accumulated balances
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
    <div className="w-full min-h-[950px] bg-black text-white px-16 pb-16 relative">

      {/* Background circles */}
      <div
        style={{
          top: "20px",
          left: "360px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      <div
        style={{
          top: "610px",
          left: "860px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      {/* Header */}
      <div style={{ width: "426px", height: "95px", gap: "22px" }}>
        <h1
          style={{
            width: "426px",
            height: "30px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "25px",
            color: "white",
            marginBottom: "22px",
          }}
        >
          Platform Treasury
        </h1>

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            color: "#FFFFFFAB",
          }}
        >
          Manage platform fees and creator earnings directly from the smart contract.
        </p>
      </div>

      {/* Wallet Status */}
      <div className="mt-10 w-full max-w-[954px] bg-[#FFFFFF1C] rounded-md p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left">
          {isConnected ? (
            <p className="text-sm text-[#FFFFFFAB] font-mono break-all">
              Connected: {address.slice(0, 10)}...{address.slice(-8)}
            </p>
          ) : (
            <p className="text-sm text-[#FFFFFFAB]">
              Wallet not connected
            </p>
          )}
        </div>

        <div className="flex justify-center sm:justify-end">
          <ConnectButton />
        </div>
      </div>

      {/* Platform Fees Section */}
      <div className="mt-12 w-full max-w-[954px] space-y-6">

        <div className="flex justify-between items-center border-b border-white/20 pb-6">
          <div>
            <p className="text-[#FFFFFFAB] text-sm">Accumulated Platform Fees</p>
            <h2 className="text-4xl font-semibold mt-2">
              {isReading ? "..." : balanceDisplay} USDC
            </h2>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={!isConnected || isReading || Number(balanceDisplay) <= 0}
            className="px-8 py-3 bg-white text-black rounded-md font-medium disabled:opacity-40"
          >
            Withdraw
          </button>
        </div>

        {/* Authorized Wallet */}
        <div className="bg-[#FFFFFF1C] p-4 rounded-md">
          <p className="text-sm text-[#FFFFFFAB] mb-1">
            Authorized Platform Wallet
          </p>
          <p className="text-sm font-mono break-all">
            {isWalletLoading ? "Loading..." : authorizedWallet || "Not Set"}
          </p>
        </div>

        {/* Creator Earnings */}
        <div className="flex justify-between items-center border-b border-white/20 pb-6 mt-10">
          <div>
            <p className="text-[#FFFFFFAB] text-sm">Creator Earnings</p>
            <h2 className="text-4xl font-semibold mt-2">
              {creatorDisplay} USDC
            </h2>
          </div>

          <button
            onClick={handleCreatorWithdraw}
            disabled={!isConnected || Number(creatorDisplay) <= 0}
            className="px-8 py-3 bg-white text-black rounded-md font-medium disabled:opacity-40"
          >
            Withdraw
          </button>
        </div>

      </div>
    </div>
  );
}

export default PlatformEarnings;

// 