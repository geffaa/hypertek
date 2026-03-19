import React, { useState } from 'react';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import { BASE_USDC_ADDRESS, ERC20_ABI, BASE_MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '../../Web3/Config';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract, useBalance, useSendTransaction, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEmailWallet } from '../../hooks/useEmailWallet';
import { BACKEND_BASE_URL } from '../../Config';
import { openTransakOnRamp, openTransakOffRamp } from '../../utils/transakUtils';

// Simple Icons
import { FiDollarSign, FiCreditCard, FiPlusCircle, FiZap } from 'react-icons/fi';
import { useSelector } from 'react-redux';


const Withdraw = () => {
    // Only target Base Testnet
    const tokenAddress = BASE_USDC_ADDRESS;

    const { balance: usdcBalance, loading: usdcLoading, refresh: refreshUsdc } = useTokenBalance(tokenAddress);
    const { balance: ethBalance, loading: ethLoading } = useTokenBalance(null); // Fetch Native ETH

    const [withdrawType, setWithdrawType] = useState('crypto'); // 'crypto', 'bank', 'add', or 'hb'
    const [showTransak, setShowTransak] = useState(false);
    const [transakUrl, setTransakUrl] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC'); // 'USDC' or 'ETH'

    // Withdraw states
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [processing, setProcessing] = useState(false);

    // Add Funds states
    const [addAmount, setAddAmount] = useState('');
    const [selectedAddToken, setSelectedAddToken] = useState('USDC'); // 'USDC' or 'ETH'
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();

    const {
        emailWalletAddress,
        emailWalletClient,
        isEmailWalletConnected
    } = useEmailWallet();

    const activeAddress = wagmiAddress || emailWalletAddress;
    const isAnyConnected = isWagmiConnected || isEmailWalletConnected;

    const { sendTransactionAsync: sendWagmiTransaction } = useSendTransaction();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const activeWalletClient = walletClient || emailWalletClient;
    // Fetch Base USDC balance from the active address
    const { data: mmUsdcBalanceData } = useReadContract({
        address: BASE_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: activeAddress ? [activeAddress] : undefined,
        query: { enabled: !!activeAddress }
    });
    const mmUsdcBalance = mmUsdcBalanceData ? ethers.formatUnits(mmUsdcBalanceData, 6) : '0';

    // Fetch Base Native ETH balance from the active address
    const { data: mmEthBalanceData } = useBalance({
        address: activeAddress,
        query: { enabled: !!activeAddress }
    });
    const mmEthBalance = mmEthBalanceData ? Number(mmEthBalanceData.formatted).toFixed(4) : '0';

    const [withdrawals, setWithdrawals] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // HB states
    const { token: authToken } = useSelector((state) => state.auth);
    const [hbBalance, setHbBalance] = useState(null);
    const [hbHistory, setHbHistory] = useState([]);
    const [hbHistoryLoading, setHbHistoryLoading] = useState(false);
    const [hbCashoutAmountUsdc, setHbCashoutAmountUsdc] = useState('');
    const [hbCashoutAmountBank, setHbCashoutAmountBank] = useState('');
    const [hbProcessing, setHbProcessing] = useState(false);

    // New State for USD Conversion for ETH
    const [conversionRate, setConversionRate] = useState(null);

    // Read internal balances from Marketplace Contract for the active address
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
        if (!isAnyConnected || !activeAddress) {
            toast.error("Please connect your wallet");
            return;
        }

        const toastId = toast.loading(`Initiating ${type} withdrawal...`);
        try {
            const functionName = type === 'seller' ? 'withdrawSeller' : 'withdrawCreator';

            // Use activeWalletClient which handles both MetaMask and Email Wallet
            const txHash = await activeWalletClient.writeContract({
                address: BASE_MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: functionName,
                account: activeWalletClient.account || activeAddress,
            });

            toast.loading("Waiting for confirmation...", { id: toastId });
            await publicClient.waitForTransactionReceipt({ hash: txHash });

            toast.success(`Successfully withdrew ${type} earnings!`, { id: toastId });

            if (type === 'seller') refetchSeller();
            if (type === 'creator') refetchCreator();
            refreshUsdc();
        } catch (error) {
            console.error(`${type} withdrawal Failed:`, error);
            toast.error(`${type} withdrawal Failed: ` + (error.shortMessage || error.message), { id: toastId });
        }
    };

    // Fetch Price
    React.useEffect(() => {
        const fetchPrice = async () => {
            try {
                // Fetch ETH price always, regardless of selection
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
                const data = await response.json();
                if (data.ethereum?.usd) {
                    setConversionRate(data.ethereum.usd);
                }
            } catch (error) {
                console.warn("Failed to fetch price", error);
                setConversionRate(2500); // Fallback
            }
        };

        fetchPrice();
        // Optional: Polling every Minute
        // Optional: Polling every Minute
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchHistory = async () => {
        try {
            let user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                const authData = JSON.parse(localStorage.getItem('authData'));
                user = authData?.user;
            }
            const userId = user?.id || user?._id;
            const authToken = user?.token || localStorage.getItem('token');

            if (!userId) return;

            setHistoryLoading(true);
            const response = await fetch(`${BACKEND_BASE_URL}/api/v1/withdraw/history/${userId}`, {
                headers: {
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
                }
            });
            if (response.ok) {
                const data = await response.json();
                setWithdrawals(data);
            } else {
                console.error("Failed to fetch history:", await response.text());
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    React.useEffect(() => {
        fetchHistory();
    }, []);

    // Cleanup unused functions

    const handleCryptoWithdraw = async () => {
        if (!amount || !recipient) {
            toast.error("Please fill in all fields");
            return;
        }

        if (!ethers.isAddress(recipient)) {
            toast.error("Invalid recipient address");
            return;
        }

        setProcessing(true);
        const toastId = toast.loading("Preparing withdrawal...");

        try {
            let txHash;

            if (!isAnyConnected || !activeWalletClient) {
                toast.error("Please connect your wallet first", { id: toastId });
                setProcessing(false);
                return;
            }

            toast.loading("Please confirm in your wallet...", { id: toastId });

            if (selectedToken === 'USDC') {
                const amountWei = ethers.parseUnits(amount, 6);
                txHash = await activeWalletClient.writeContract({
                    address: BASE_USDC_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: 'transfer',
                    args: [recipient, amountWei],
                    account: activeWalletClient.account || activeAddress,
                });
            } else {
                // ETH / native
                const amountWei = ethers.parseEther(amount);

                if (isWagmiConnected) {
                    txHash = await sendWagmiTransaction({
                        to: recipient,
                        value: amountWei,
                    });
                } else {
                    // Email Wallet (Viem)
                    txHash = await activeWalletClient.sendTransaction({
                        to: recipient,
                        value: amountWei,
                        account: activeWalletClient.account,
                        chain: activeWalletClient.chain
                    });
                }
            }

            if (publicClient) {
                toast.loading("Waiting for confirmation...", { id: toastId });
                await publicClient.waitForTransactionReceipt({ hash: txHash });
            }

            toast.success("✅ Withdrawal Successful!", { id: toastId });
            refreshUsdc();

            // ... (rest of the history logging logic remains the same)

            // ── Log to Backend ─────────────────────────────────────────
            let user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                const authData = JSON.parse(localStorage.getItem('authData'));
                user = authData?.user;
            }
            const userId = user?.id || user?._id;
            const authToken = user?.token || localStorage.getItem('token');

            if (userId) {
                fetch(`${BACKEND_BASE_URL}/api/v1/withdraw/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({
                        userId,
                        amount: Number(amount),
                        type: 'crypto',
                        token: selectedToken,
                        recipientAddress: recipient,
                        txHash,
                    }),
                }).catch(e => console.error("Failed to log withdrawal", e));
            }

            fetchHistory();
            setAmount('');
            setRecipient('');

        } catch (err) {
            console.error("Withdrawal Failed", err);
            toast.error("❌ Withdrawal Failed: " + (err.shortMessage || err.reason || err.message), { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    const handleAddFunds = async () => {
        if (!addAmount || parseFloat(addAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!isWagmiConnected || !wagmiAddress) {
            toast.error("Please connect your MetaMask wallet first");
            return;
        }

        setProcessing(true);
        const toastId = toast.loading("Initiating Add Funds...");

        try {
            toast.loading("Please confirm the Transfer in MetaMask...", { id: toastId });

            let transferTxHash;

            if (selectedAddToken === 'USDC') {
                const amountWei = ethers.parseUnits(addAmount, 6);
                transferTxHash = await activeWalletClient.writeContract({
                    address: BASE_USDC_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: 'transfer',
                    args: [activeAddress, amountWei],
                    account: activeWalletClient.account || wagmiAddress,
                });
            } else {
                const amountWei = ethers.parseEther(addAmount);
                if (isWagmiConnected) {
                    transferTxHash = await sendWagmiTransaction({
                        to: activeAddress,
                        value: amountWei,
                    });
                } else {
                    transferTxHash = await activeWalletClient.sendTransaction({
                        to: activeAddress,
                        value: amountWei,
                        account: activeWalletClient.account
                    });
                }
            }

            toast.loading("Waiting for Transfer confirmation...", { id: toastId });

            if (publicClient) {
                const receipt = await publicClient.waitForTransactionReceipt({ hash: transferTxHash });
                if (receipt.status !== 'success') {
                    throw new Error("Transfer Transaction reverted on chain.");
                }
            } else {
                await new Promise(res => setTimeout(res, 4000));
            }

            toast.success("Successfully added funds! Balance will update shortly.", { id: toastId });
            refreshUsdc();
            setAddAmount('');

            // ── Log to Backend ─────────────────────────────────────────
            let user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                const authData = JSON.parse(localStorage.getItem('authData'));
                user = authData?.user;
            }
            const userId = user?.id || user?._id;
            const authToken = user?.token || localStorage.getItem('token');

            if (userId) {
                fetch(`${BACKEND_BASE_URL}/api/v1/withdraw/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({
                        userId,
                        amount: Number(addAmount),
                        type: 'deposit', // Flag as deposit instead of crypto withdrawal
                        token: selectedAddToken,
                        recipientAddress: wagmiAddress,
                        txHash: transferTxHash,
                    }),
                }).catch(e => console.error("Failed to log add funds", e));
            }

            fetchHistory();
            setProcessing(false);

        } catch (error) {
            console.error("Add Funds Failed", error);
            toast.error("Add Funds Failed: " + (error.shortMessage || error.message), { id: toastId });
            setProcessing(false);
        }
    };

    // ── Transak Bank Withdrawal (popup) ────────────────────────────
    const handleBankWithdraw = () => openTransakOffRamp({ walletAddress: wagmiAddress });

    // ── Transak On-Ramp (Buy crypto with fiat) ─────────────────────
    const handleTransakOnRamp = () => openTransakOnRamp({ walletAddress: wagmiAddress });

    // ── HB balance fetch ────────────────────────────────────────────
    const fetchHBBalance = React.useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/balance`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHbBalance(data);
            }
        } catch (err) {
            console.warn("Failed to fetch HB balance", err);
        }
    }, [authToken]);

    const fetchHBHistory = React.useCallback(async () => {
        if (!authToken) return;
        setHbHistoryLoading(true);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/history?limit=20`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHbHistory(data.entries || []);
            }
        } catch (err) {
            console.warn("Failed to fetch HB history", err);
        } finally {
            setHbHistoryLoading(false);
        }
    }, [authToken]);

    React.useEffect(() => {
        if (withdrawType === 'hb') {
            fetchHBBalance();
            fetchHBHistory();
        }
    }, [withdrawType, fetchHBBalance, fetchHBHistory]);

    const handleHBCashout = async (method) => {
        const rawAmount = method === 'usdc' ? hbCashoutAmountUsdc : hbCashoutAmountBank;
        const hbAmount = parseInt(rawAmount, 10);

        if (!hbAmount || hbAmount <= 0) {
            toast.error("Please enter a valid HB amount");
            return;
        }

        if (method === 'usdc' && !activeAddress) {
            toast.error("Connect a wallet to receive USDC");
            return;
        }

        setHbProcessing(true);
        const toastId = toast.loading(`Processing HB cashout via ${method.toUpperCase()}...`);

        try {
            const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/cashout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    amount: hbAmount,
                    method,
                    ...(method === 'usdc' ? { walletAddress: activeAddress } : {}),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Cashout failed", { id: toastId });
                return;
            }

            toast.success(`Cashout of ${hbAmount} HB ($${data.usdAmount}) submitted!`, { id: toastId });
            if (method === 'usdc') setHbCashoutAmountUsdc('');
            else setHbCashoutAmountBank('');
            fetchHBBalance();
            fetchHBHistory();
        } catch (err) {
            toast.error("Cashout failed: " + err.message, { id: toastId });
        } finally {
            setHbProcessing(false);
        }
    };

    // Derived State for Display
    // Unified Logic for ALL Wallets (MetaMask, Immutable, etc.)
    const effectiveUsdcBalance = isWagmiConnected ? mmUsdcBalance : usdcBalance;
    const effectiveEthBalance = isWagmiConnected ? mmEthBalance : ethBalance;

    const displayUsdcBalance = (Number(ethBalance) * (conversionRate || 0)).toString();
    const displayNativeBalance = effectiveEthBalance;

    return (
        <>
            <div className="p-4 md:p-8 text-white relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Withdraw Funds</h1>
                <p className="text-white/60 text-sm md:text-base mb-8">Manage your earnings and withdraw to your preferred destination.</p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* USDC Balance Card */}
                    <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 w-full sm:min-w-[240px] sm:w-auto">
                        <p className="text-white/60 text-sm mb-1">USDC Balance</p>
                        <div className="flex items-end gap-2">
                            <h2 className="text-2xl md:text-3xl font-bold">
                                {usdcLoading && !isWagmiConnected ? "..." : `${Number(effectiveUsdcBalance).toFixed(2)}`}
                            </h2>
                            <span className="text-blue-400 mb-1.5 font-medium">USDC</span>
                        </div>
                    </div>

                    {/* ETH/Native Balance Card - Optional Display */}
                    <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 w-full sm:min-w-[240px] sm:w-auto">
                        <p className="text-white/60 text-sm mb-1">Base Native Balance</p>
                        <div className="flex flex-col">
                            <div className="flex items-end gap-2">
                                <h2 className="text-2xl md:text-3xl font-bold">
                                    {ethLoading && !isWagmiConnected ? "..." : `${Number(effectiveEthBalance).toFixed(4)}`}
                                </h2>
                                <span className="text-purple-400 mb-1.5 font-medium">ETH</span>
                            </div>
                        </div>
                    </div>
                    {/* Marketplace Earnings Card */}
                    {(Number(sellerBalance) > 0 || Number(creatorBalance) > 0) && (
                        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-green-500/30 inline-block min-w-[240px]">
                            <p className="text-white/60 text-sm mb-1 text-green-400">Marketplace Earnings Available</p>
                            <div className="flex flex-col gap-3 mt-4">
                                {Number(sellerBalance) > 0 && (
                                    <div className="flex items-center justify-between border border-white/10 p-3 rounded-lg bg-black/20">
                                        <div>
                                            <p className="text-sm text-white/50">Seller Earnings</p>
                                            <p className="font-bold text-lg">{Number(sellerBalance).toFixed(2)} <span className="text-xs text-blue-400 font-normal">USDC</span></p>
                                        </div>
                                        <button
                                            onClick={() => handleWithdrawEarnings('seller')}
                                            className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded font-bold transition-colors"
                                        >
                                            Claim
                                        </button>
                                    </div>
                                )}
                                {Number(creatorBalance) > 0 && (
                                    <div className="flex items-center justify-between border border-white/10 p-3 rounded-lg bg-black/20">
                                        <div>
                                            <p className="text-sm text-white/50">Creator Fees</p>
                                            <p className="font-bold text-lg">{Number(creatorBalance).toFixed(2)} <span className="text-xs text-blue-400 font-normal">USDC</span></p>
                                        </div>
                                        <button
                                            onClick={() => handleWithdrawEarnings('creator')}
                                            className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded font-bold transition-colors"
                                        >
                                            Claim
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Debug Info */}
                <div className="mb-4 text-xs text-white/30 font-mono">
                    Connected: {activeAddress ? `${isEmailWalletConnected ? 'Embedded' : 'External'} Wallet (${activeAddress?.slice(0, 6)}...${activeAddress?.slice(-4)})` : "None"} <br />
                    Chain: Base Sepolia Testnet | USDC Contract: {tokenAddress?.slice(0, 6)}...
                </div>


                {/* Toggle Switch */}
                <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-1">
                    <button
                        onClick={() => setWithdrawType('crypto')}
                        className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${withdrawType === 'crypto' ? 'text-blue-500' : 'text-white/60 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <FiDollarSign className="text-lg" />
                            Crypto
                        </div>
                        {withdrawType === 'crypto' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setWithdrawType('add')}
                        className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${withdrawType === 'add' ? 'text-blue-500' : 'text-white/60 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <FiPlusCircle className="text-lg" />
                            Add Funds
                        </div>
                        {withdrawType === 'add' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setWithdrawType('bank')}
                        className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${withdrawType === 'bank' ? 'text-blue-500' : 'text-white/60 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <FiCreditCard className="text-lg" />
                            Bank
                        </div>
                        {withdrawType === 'bank' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setWithdrawType('hb')}
                        className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${withdrawType === 'hb' ? 'text-yellow-400' : 'text-white/60 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <FiZap className="text-lg" />
                            Hyper Bucks
                        </div>
                        {withdrawType === 'hb' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-yellow-400 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="max-w-2xl">
                    {withdrawType === 'crypto' && (
                        <div className="bg-[#1C1C1E] p-4 md:p-8 rounded-xl border border-white/10">
                            <h3 className="text-lg md:text-xl font-semibold mb-6">Withdraw to Crypto Wallet</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Select Token</label>
                                    <div className="flex gap-3 md:gap-4">
                                        <button
                                            onClick={() => setSelectedToken('USDC')}
                                            className={`flex-1 py-3 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${selectedToken === 'USDC' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-[#100F0F] border-white/10 text-white/60 hover:border-white/30'}`}
                                        >
                                            <span className="font-bold">USDC</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedToken('ETH')}
                                            className={`flex-1 py-3 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${selectedToken === 'ETH' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-[#100F0F] border-white/10 text-white/60 hover:border-white/30'}`}
                                        >
                                            <span className="font-bold">ETH</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Amount ({selectedToken})</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-[#100F0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    />
                                    <div className="text-xs text-white/40 mt-1.5 text-right">
                                        Balance: {selectedToken === 'USDC'
                                            ? `${Number(effectiveUsdcBalance).toFixed(4)} USDC`
                                            : `${Number(effectiveEthBalance).toFixed(4)} ETH`}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Recipient Address</label>
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-[#100F0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                                    />
                                    <p className="text-xs text-white/40 mt-1.5 ml-1">Double check network: Base Sepolia Testnet</p>
                                </div>

                                <button
                                    onClick={handleCryptoWithdraw}
                                    disabled={processing || (!isWagmiConnected && (selectedToken === 'USDC' ? usdcLoading : ethLoading))}
                                    className={`w-full py-4 rounded-lg font-bold text-base md:text-lg transition-all ${processing ? 'bg-blue-900 text-white/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                        }`}
                                >
                                    {processing ? "Processing Transaction..." : `Withdraw ${selectedToken}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {withdrawType === 'add' && (
                        <div className="bg-[#1C1C1E] p-8 rounded-xl border border-white/10">
                            <h3 className="text-xl font-semibold mb-6">Add Funds to Base Wallet</h3>
                            <p className="text-white/60 text-sm mb-6">Connect your external MetaMask wallet to transfer USDC into your primary Base account.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Connect External Wallet</label>
                                    <ConnectButton />
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Select Token</label>
                                    <div className="flex gap-4 mb-4">
                                        <button
                                            onClick={() => setSelectedAddToken('USDC')}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${selectedAddToken === 'USDC' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-[#100F0F] border-white/10 text-white/60 hover:border-white/30'}`}
                                        >
                                            <span className="font-bold">USDC</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedAddToken('ETH')}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${selectedAddToken === 'ETH' ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-[#100F0F] border-white/10 text-white/60 hover:border-white/30'}`}
                                        >
                                            <span className="font-bold">ETH</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Amount ({selectedAddToken})</label>
                                    <input
                                        type="number"
                                        value={addAmount}
                                        onChange={(e) => setAddAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-[#100F0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    />
                                    {isWagmiConnected && (
                                        <div className="text-xs text-white/40 mt-1.5 text-right font-mono">
                                            MetaMask Balance: {selectedAddToken === 'USDC' ? `${Number(mmUsdcBalance).toFixed(4)} USDC` : `${mmEthBalance} ETH/ETH`}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-200">
                                    <strong>Destination:</strong> Your {isEmailWalletConnected ? "Email Wallet" : "Base Wallet"} ({activeAddress?.slice(0, 6)}...{activeAddress?.slice(-4)})
                                </div>

                                <button
                                    onClick={handleAddFunds}
                                    disabled={processing}
                                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${processing ? 'bg-blue-900 text-white/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                        }`}
                                >
                                    {processing ? "Processing Transfer..." : "Transfer from MetaMask"}
                                </button>

                                {/* Transak On-Ramp */}
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-white/40 text-xs text-center mb-3">— or buy USDC directly with fiat —</p>
                                    <button
                                        onClick={handleTransakOnRamp}
                                        className="w-full py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-all"
                                    >
                                        💳 Buy USDC via Transak
                                    </button>
                                    <p className="text-xs text-white/30 mt-2 text-center">Card, bank transfer & more · Powered by Transak</p>
                                </div>
                            </div>
                        </div>
                    )}


                    {withdrawType === 'bank' && (
                        <div className="bg-[#1C1C1E] p-4 md:p-8 rounded-xl border border-white/10">
                            <h3 className="text-lg md:text-xl font-semibold mb-2">Withdraw to Bank Account</h3>
                            <p className="text-white/50 text-sm mb-6">
                                Sell your USDC and receive funds directly in your bank account via Transak.
                            </p>

                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6 text-sm text-blue-200">
                                Transak will handle KYC verification and bank details securely.
                            </div>

                            <button
                                onClick={handleBankWithdraw}
                                className="w-full py-4 rounded-lg font-bold text-base md:text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all"
                            >
                                Withdraw via Transak
                            </button>
                        </div>
                    )}

                    {withdrawType === 'hb' && (
                        <div className="space-y-6">
                            {/* HB Balance Card */}
                            <div className="bg-[#1C1C1E] p-6 rounded-xl border border-yellow-500/30">
                                <p className="text-white/60 text-sm mb-1">Hyper Bucks Balance</p>
                                <div className="flex items-end gap-2 mb-1">
                                    <h2 className="text-3xl font-bold text-yellow-300">
                                        {hbBalance ? hbBalance.hyperBucks : '—'}
                                    </h2>
                                    <span className="text-yellow-500 mb-1.5 font-medium">HB</span>
                                </div>
                                <p className="text-white/40 text-sm">
                                    ${hbBalance ? hbBalance.usdEquivalent : '0.00'} USD equivalent
                                </p>
                            </div>

                            {/* Info Card */}
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-200">
                                <p className="font-semibold mb-1">About Hyper Bucks (HB)</p>
                                <p className="text-yellow-200/70 mb-2">250 HB = $1 USD. Earn HB by playing games and spend on the marketplace.</p>
                                <p className="text-yellow-200/70">Set up a crypto wallet to convert HB instantly at point of sale. Or withdraw to your bank account (min $10).</p>
                            </div>

                            {/* USDC Cashout */}
                            <div className="bg-[#1C1C1E] p-4 md:p-6 rounded-xl border border-white/10">
                                <h3 className="text-base font-semibold mb-1">Cashout to USDC Wallet</h3>
                                <p className="text-white/50 text-sm mb-4">Minimum: 250 HB ($1.00) · ~$0.01 gas fee</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="number"
                                        value={hbCashoutAmountUsdc}
                                        onChange={(e) => setHbCashoutAmountUsdc(e.target.value)}
                                        placeholder="Amount in HB (min 250)"
                                        className="flex-1 bg-[#100F0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
                                    />
                                    <button
                                        onClick={() => handleHBCashout('usdc')}
                                        disabled={hbProcessing}
                                        className={`w-full sm:w-auto px-5 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${hbProcessing ? 'bg-yellow-900 text-white/50 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg'}`}
                                    >
                                        {hbProcessing ? 'Processing...' : 'Cashout to Wallet'}
                                    </button>
                                </div>
                                {hbCashoutAmountUsdc && Number(hbCashoutAmountUsdc) > 0 && (
                                    <p className="text-xs text-white/40 mt-2">
                                        ≈ ${(Number(hbCashoutAmountUsdc) / 250).toFixed(2)} USD
                                    </p>
                                )}
                            </div>

                            {/* Bank Cashout */}
                            <div className="bg-[#1C1C1E] p-4 md:p-6 rounded-xl border border-white/10">
                                <h3 className="text-base font-semibold mb-1">Bank Transfer</h3>
                                <p className="text-white/50 text-sm mb-4">Minimum: 2500 HB ($10.00) · Bank details required</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="number"
                                        value={hbCashoutAmountBank}
                                        onChange={(e) => setHbCashoutAmountBank(e.target.value)}
                                        placeholder="Amount in HB (min 2500)"
                                        className="flex-1 bg-[#100F0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
                                    />
                                    <button
                                        onClick={() => handleHBCashout('bank')}
                                        disabled={hbProcessing}
                                        className={`w-full sm:w-auto px-5 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${hbProcessing ? 'bg-yellow-900 text-white/50 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg'}`}
                                    >
                                        {hbProcessing ? 'Processing...' : 'Cashout to Bank'}
                                    </button>
                                </div>
                                {hbCashoutAmountBank && Number(hbCashoutAmountBank) > 0 && (
                                    <p className="text-xs text-white/40 mt-2">
                                        ≈ ${(Number(hbCashoutAmountBank) / 250).toFixed(2)} USD
                                    </p>
                                )}
                                <p className="text-xs text-white/30 mt-3">
                                    Need to add bank details?{' '}
                                    <a href="/dashboard/edit-profile" className="text-yellow-400 underline hover:text-yellow-300">
                                        Go to Profile Settings
                                    </a>
                                </p>
                            </div>

                            {/* HB Transaction History */}
                            <div className="mt-4">
                                <h3 className="text-base font-semibold mb-4">HB Transaction History</h3>
                                <div className="bg-[#1C1C1E] rounded-xl border border-white/10 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[500px]">
                                            <thead className="bg-white/5 text-xs uppercase text-white/50">
                                                <tr>
                                                    <th className="px-4 py-3">Type</th>
                                                    <th className="px-4 py-3">Amount (HB)</th>
                                                    <th className="px-4 py-3">Balance After</th>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {hbHistoryLoading ? (
                                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-white/40">Loading history...</td></tr>
                                                ) : hbHistory.length === 0 ? (
                                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-white/40">No HB transactions yet.</td></tr>
                                                ) : (
                                                    hbHistory.map((tx) => (
                                                        <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                    tx.type === 'earn' || tx.type === 'prize'
                                                                        ? 'bg-green-500/10 text-green-400'
                                                                        : tx.type === 'cashout'
                                                                        ? 'bg-yellow-500/10 text-yellow-400'
                                                                        : 'bg-red-500/10 text-red-400'
                                                                }`}>
                                                                    {tx.type}
                                                                </span>
                                                            </td>
                                                            <td className={`px-4 py-3 font-mono font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-white/60">{tx.balanceAfter}</td>
                                                            <td className="px-4 py-3 text-sm text-white/50">
                                                                {new Date(tx.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-white/40 max-w-[160px] truncate">
                                                                {tx.description || '—'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Withdrawal History */}
                <div className="mt-12 w-full max-w-4xl z-10 relative">
                    <h3 className="text-lg md:text-xl font-semibold mb-6">Withdrawal History</h3>
                    <div className="bg-[#1C1C1E] rounded-xl border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-white/5 text-xs uppercase text-white/50">
                                    <tr>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {historyLoading ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-white/40">Loading history...</td></tr>
                                    ) : withdrawals.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-white/40">No withdrawal history found.</td></tr>
                                    ) : (
                                        withdrawals.map((tx) => (
                                            <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tx.type === 'crypto' || tx.type === 'deposit' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                        {tx.type === 'crypto' ? 'Crypto' : tx.type === 'deposit' ? 'Deposit' : 'Bank'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono">
                                                    {tx.amount} {tx.token || 'USD'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white/60">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-white/40 max-w-[200px] truncate">
                                                    {tx.type === 'crypto' ? (
                                                        <a href={`https://sepolia.basescan.org/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 underline">
                                                            {tx.txHash?.slice(0, 10)}...
                                                        </a>
                                                    ) : (
                                                        `${tx.bankDetails?.bankName} (***${tx.bankDetails?.accountNumber?.slice(-4)})`
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div >

            {showTransak && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowTransak(false); }}
                >
                    <div className="relative w-full max-w-md h-[680px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <button
                            onClick={() => setShowTransak(false)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors text-lg"
                        >
                            ✕
                        </button>
                        <iframe
                            src={transakUrl}
                            allow="camera;microphone;payment"
                            className="w-full h-full border-0"
                            title="Transak Bank Withdrawal"
                        />
                    </div>
                </div>
            )
            }
        </>
    );
};

export default Withdraw;
