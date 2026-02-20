import React, { useState } from 'react';
import { useTokenBalance } from '../../hooks/useTokenBalance';
import { IMMUTABLE_USDC_ADDRESS, ERC20_ABI } from '../../Web3/Config';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { passportInstance } from '../../utils/immutablePassport';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract, useBalance, useSendTransaction } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Simple Icons
import { FiDollarSign, FiCreditCard, FiPlusCircle } from 'react-icons/fi';

const Withdraw = () => {
    // Only target Immutable zkEVM Testnet
    const tokenAddress = IMMUTABLE_USDC_ADDRESS;

    const { balance: usdcBalance, loading: usdcLoading, refresh: refreshUsdc, activeWallet } = useTokenBalance(tokenAddress);
    const { balance: ethBalance, loading: ethLoading } = useTokenBalance(null); // Fetch Native ETH

    const [withdrawType, setWithdrawType] = useState('crypto'); // 'crypto', 'bank', or 'add'
    const [selectedToken, setSelectedToken] = useState('USDC'); // 'USDC' or 'ETH'

    // Withdraw states
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [processing, setProcessing] = useState(false);

    // Add Funds states
    const [addAmount, setAddAmount] = useState('');
    const [selectedAddToken, setSelectedAddToken] = useState('USDC'); // 'USDC' or 'ETH'
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
    const { writeContractAsync: writeWagmiContract } = useWriteContract();
    const { sendTransactionAsync } = useSendTransaction();
    const publicClient = usePublicClient();

    // Fetch Immutable USDC balance from MetaMask (on Immutable zkEVM)
    const { data: mmUsdcBalanceData } = useReadContract({
        address: IMMUTABLE_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: wagmiAddress ? [wagmiAddress] : undefined,
        query: { enabled: !!wagmiAddress }
    });
    const mmUsdcBalance = mmUsdcBalanceData ? ethers.formatUnits(mmUsdcBalanceData, 6) : '0';

    // Fetch Immutable Native ETH balance from MetaMask
    const { data: mmEthBalanceData } = useBalance({
        address: wagmiAddress,
        query: { enabled: !!wagmiAddress }
    });
    const mmEthBalance = mmEthBalanceData ? Number(mmEthBalanceData.formatted).toFixed(4) : '0';

    const [withdrawals, setWithdrawals] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // New State for USD Conversion for ETH
    const [conversionRate, setConversionRate] = useState(null);

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

    // Fetch Withdrawal History
    const fetchHistory = async () => {
        try {
            let user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                const authData = JSON.parse(localStorage.getItem('authData'));
                user = authData?.user;
            }
            const userId = user?.id || user?._id;

            if (!userId) return;

            setHistoryLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4700'}/api/v1/withdraw/history/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setWithdrawals(data);
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

        try {
            // Logic to send USDC
            // 1. Get Provider/Signer (Ethers v6)
            let provider, signer;
            let tx;

            if (activeWallet.type === 'immutable') {
                const p = await passportInstance.connectEvm();
                provider = new ethers.BrowserProvider(p);
            }

            if (!provider) throw new Error("No wallet provider found");
            signer = await provider.getSigner();

            if (selectedToken === 'USDC') {
                if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
                    throw new Error("USDC not supported on this network yet.");
                }

                const abi = ["function transfer(address to, uint amount) returns (bool)", "function decimals() view returns (uint8)"];
                const contract = new ethers.Contract(tokenAddress, abi, signer);

                let decimals = 18;
                try {
                    decimals = await contract.decimals();
                } catch (e) {
                    decimals = 6;
                }
                const amountWei = ethers.parseUnits(amount, 6); // STRICTLY 6 DECIMALS FOR USDC

                tx = await contract.transfer(recipient, amountWei);
                toast.loading("USDC Transaction submitted...", { id: 'withdraw-tx' });

                await tx.wait();
                refreshUsdc();
            } else {
                const amountWei = ethers.parseEther(amount);
                tx = await signer.sendTransaction({
                    to: recipient,
                    value: amountWei
                });
                toast.loading("ETH Transaction submitted...", { id: 'withdraw-tx' });
                await tx.wait();
            }

            toast.success("Withdrawal Successful!", { id: 'withdraw-tx' });

            // Log to Backend (Fire and Forget)
            let user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                const authData = JSON.parse(localStorage.getItem('authData'));
                user = authData?.user;
            }
            const userId = user?.id || user?._id;

            if (userId) {
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4700'}/api/v1/withdraw/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userId,
                        amount: Number(amount),
                        type: 'crypto',
                        token: selectedToken,
                        recipientAddress: recipient,
                        txHash: tx.hash
                    })
                }).catch(e => console.error("Failed to log withdrawal", e));
            }

            // Refresh History
            fetchHistory();

            setAmount('');

        } catch (err) {
            console.error("Withdrawal Failed", err);
            toast.error("Withdrawal Failed: " + (err.reason || err.message));
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

        if (!activeWallet.address) {
            toast.error("Immutable wallet address not found. Please relogin.");
            return;
        }

        setProcessing(true);
        const toastId = toast.loading("Initiating Add Funds...");

        try {
            toast.loading("Please confirm the Transfer in MetaMask...", { id: toastId });

            let transferTxHash;

            if (selectedAddToken === 'USDC') {
                const amountWei = ethers.parseUnits(addAmount, 6);
                transferTxHash = await writeWagmiContract({
                    address: IMMUTABLE_USDC_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: 'transfer',
                    args: [activeWallet.address, amountWei],
                });
            } else {
                const amountWei = ethers.parseEther(addAmount);
                transferTxHash = await sendTransactionAsync({
                    to: activeWallet.address,
                    value: amountWei,
                });
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
            setProcessing(false);

        } catch (error) {
            console.error("Add Funds Failed", error);
            toast.error("Add Funds Failed: " + (error.shortMessage || error.message), { id: toastId });
            setProcessing(false);
        }
    };

    const handleBankWithdraw = () => {
        if (!activeWallet.address) {
            toast.error("Immutable wallet not connected.");
            return;
        }

        // MoonPay Sandbox URL construction
        // For production, use https://sell.moonpay.com
        const moonPayUrl = new URL('https://sell-sandbox.moonpay.com');

        // Append required parameters
        const apiKey = 'pk_test_123'; // Placeholder
        moonPayUrl.searchParams.append('apiKey', apiKey);
        moonPayUrl.searchParams.append('baseCurrencyCode', 'usdc');
        moonPayUrl.searchParams.append('refundWalletAddress', activeWallet.address);

        // Open MoonPay in a new tab/window
        window.open(moonPayUrl.toString(), '_blank', 'noopener,noreferrer');

        toast.success("MoonPay interface opened!");
        fetchHistory(); // Refresh custom history if you plan to log it
    };

    // Derived State for Display
    // Unified Logic for ALL Wallets (MetaMask, Immutable, etc.)
    // Card 1: Shows USD Value of Native Balance.
    // Card 2: Shows Native Balance Amount.

    const displayUsdcBalance = (Number(ethBalance) * (conversionRate || 0)).toString();
    const displayNativeBalance = ethBalance;

    return (
        <div className="p-8 text-white min-h-full">
            <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
            <p className="text-white/60 mb-8">Manage your earnings and withdraw to your preferred destination.</p>

            <div className="flex gap-4 mb-8 flex-wrap">
                {/* USDC/USD Balance Card */}
                <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 inline-block min-w-[240px]">
                    <p className="text-white/60 text-sm mb-1">USDC Balance</p>
                    <div className="flex items-end gap-2">
                        <h2 className="text-3xl font-bold">
                            {usdcLoading ? "..." : `$${Number(usdcBalance).toFixed(2)}`}
                        </h2>
                        <span className="text-blue-400 mb-1.5 font-medium">USDC</span>
                    </div>
                </div>

                {/* ETH/Native Balance Card - Optional Display */}
                <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 inline-block min-w-[240px]">
                    <p className="text-white/60 text-sm mb-1">Immutable Native Balance (IMX/ETH)</p>
                    <div className="flex flex-col">
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold">
                                {ethLoading ? "..." : `${Number(displayNativeBalance).toFixed(4)}`}
                            </h2>
                            <span className="text-purple-400 mb-1.5 font-medium">ETH</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug Info */}
            <div className="mb-4 text-xs text-white/30 font-mono">
                Connected: {activeWallet.type ? `${activeWallet.type} (${activeWallet.address?.slice(0, 6)}...${activeWallet.address?.slice(-4)})` : "None"} <br />
                Chain: Immutable zkEVM | USDC Contract: {tokenAddress?.slice(0, 6)}...
            </div>


            {/* Toggle Switch */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
                <button
                    onClick={() => setWithdrawType('crypto')}
                    className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${withdrawType === 'crypto' ? 'text-blue-500' : 'text-white/60 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <FiDollarSign className="text-lg" />
                        Crypto Withdraw
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
                        Bank Withdraw
                    </div>
                    {withdrawType === 'bank' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>}
                </button>
            </div>

            <div className="max-w-2xl">
                {withdrawType === 'crypto' && (
                    <div className="bg-[#1C1C1E] p-8 rounded-xl border border-white/10">
                        <h3 className="text-xl font-semibold mb-6">Withdraw to Crypto Wallet</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-white/70 mb-2">Select Token</label>
                                <div className="flex gap-4">
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
                                        ? `${Number(usdcBalance).toFixed(4)} USDC`
                                        : `${Number(ethBalance).toFixed(4)} ETH`}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/70 mb-2">Recipient Address</label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full bg-[#100F0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors font-mono"
                                />
                                <p className="text-xs text-white/40 mt-1.5 ml-1">Double check network: Immutable Testnet</p>
                            </div>

                            <button
                                onClick={handleCryptoWithdraw}
                                disabled={processing || (selectedToken === 'USDC' ? usdcLoading : ethLoading)}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${processing ? 'bg-blue-900 text-white/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                    }`}
                            >
                                {processing ? "Processing Transaction..." : `Withdraw ${selectedToken}`}
                            </button>
                        </div>
                    </div>
                )}

                {withdrawType === 'add' && (
                    <div className="bg-[#1C1C1E] p-8 rounded-xl border border-white/10">
                        <h3 className="text-xl font-semibold mb-6">Add Funds to Immutable Wallet</h3>
                        <p className="text-white/60 text-sm mb-6">Connect your external MetaMask wallet to transfer USDC into your primary Immutable account.</p>

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
                                        MetaMask Balance: {selectedAddToken === 'USDC' ? `${Number(mmUsdcBalance).toFixed(4)} USDC` : `${mmEthBalance} IMX/ETH`}
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-200">
                                <strong>Destination:</strong> Your Immutable Wallet ({activeWallet.address?.slice(0, 6)}...{activeWallet.address?.slice(-4)})
                            </div>

                            <button
                                onClick={handleAddFunds}
                                disabled={processing}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${processing ? 'bg-blue-900 text-white/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                    }`}
                            >
                                {processing ? "Processing Transfer..." : "Transfer from MetaMask"}
                            </button>
                        </div>
                    </div>
                )}

                {withdrawType === 'bank' && (
                    <div className="bg-[#1C1C1E] p-8 rounded-xl border border-white/10">
                        <h3 className="text-xl font-semibold mb-6">Withdraw to Bank Account</h3>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6 text-sm text-blue-200">
                            <strong>Note:</strong> This process is securely handled by MoonPay. You will be prompted to complete identity verification if required, and enter your bank details securely via their checkout page.
                        </div>

                        <div className="space-y-6">
                            <button
                                onClick={handleBankWithdraw}
                                disabled={processing}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${processing ? 'bg-blue-900 text-white/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                    }`}
                            >
                                {processing ? "Handling Request..." : "Open MoonPay Off-Ramp"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Withdrawal History */}
            <div className="mt-12 max-w-4xl">
                <h3 className="text-xl font-semibold mb-6">Withdrawal History</h3>
                <div className="bg-[#1C1C1E] rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase text-white/50">
                                <tr>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Amount</th>
                                    {/* Status removed */}
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
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tx.type === 'crypto' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {tx.type === 'crypto' ? 'Crypto' : 'Bank'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                {tx.amount} {tx.token || 'USD'}
                                            </td>
                                            {/* Status cell removed */}
                                            <td className="px-6 py-4 text-sm text-white/60">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-white/40 max-w-[200px] truncate">
                                                {tx.type === 'crypto' ? (
                                                    <a href={`https://explorer.testnet.immutable.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 underline">
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
        </div>
    );
};

export default Withdraw;
