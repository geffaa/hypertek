import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY, BACKEND_BASE_URL } from '../../Config';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiZap, FiCheckCircle, FiArrowLeft, FiTrendingUp, FiArrowDownCircle } from 'react-icons/fi';
import { CreditCard, Wallet } from 'lucide-react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { useEmailWallet } from '../../hooks/useEmailWallet';
import KYCVerification from '../../Components/Dashboard/KYCVerification';
import HBCoinIcon from '../../Components/Common/HBCoinIcon';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const HB_PACKAGES = [
  { hb: 250,   usd: 1,   label: 'Starter' },
  { hb: 1000,  usd: 4,   label: 'Basic' },
  { hb: 2500,  usd: 10,  label: 'Standard', popular: true },
  { hb: 5000,  usd: 20,  label: 'Plus', mostPopular: true },
  { hb: 10000, usd: 40,  label: 'Pro' },
  { hb: 25000, usd: 100, label: 'Elite' },
];

function CheckoutForm({ hbAmount, usdAmount, onBack }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/topup?success=true&hb=${hbAmount}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-white/50 hover:text-white transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <p className="text-white/50 text-xs">{t("dashboard.hyperbucks.topup.paying", "Paying")}</p>
          <p className="text-white font-bold text-base">
            ${usdAmount} USD
            <span className="text-[#002AA8] text-sm font-normal ml-2">= {hbAmount.toLocaleString()} HB</span>
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#002AA8] hover:bg-blue-700'
          }`}
        >
          {loading ? t("dashboard.hyperbucks.topup.processing", "Processing...") : `${t("dashboard.hyperbucks.topup.pay", "Pay")} $${usdAmount} USD`}
        </button>
      </form>
    </div>
  );
}

// Inner form — must be rendered inside <Elements>
function DebitCardFormInner({ onSaved, onCancel, authToken, savingCard, setSavingCard }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSavingCard(true);
    try {
      const cardElement = elements.getElement('card');
      const { token, error } = await stripe.createToken(cardElement, { name: cardName, currency: 'aud' });
      if (error) { toast.error(error.message); return; }
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/debit-card`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ cardToken: token.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to save card'); return; }
      toast.success('Debit card saved!');
      onSaved(data.debitCard);
    } catch (err) {
      toast.error('Failed to save card: ' + err.message);
    } finally {
      setSavingCard(false);
    }
  };

  useEffect(() => {
    if (!stripe || !elements) return;
    const existing = elements.getElement('card');
    if (existing) return;
    const card = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: { color: '#fff', fontSize: '14px', '::placeholder': { color: 'rgba(255,255,255,0.3)' } },
        invalid: { color: '#f87171' },
      },
    });
    card.mount('#stripe-debit-card-element');
  }, [stripe, elements]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-white/40 text-xs mb-1 block">Cardholder Name *</label>
        <input
          type="text"
          value={cardName}
          onChange={e => setCardName(e.target.value)}
          placeholder="Name on card"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
          required
        />
      </div>
      <div>
        <label className="text-white/40 text-xs mb-1 block">Card Details *</label>
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-3">
          <div id="stripe-debit-card-element" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-xl border border-white/20 text-white/50 text-sm hover:text-white transition-colors">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={savingCard || !stripe}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${savingCard ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-black'}`}
        >
          {savingCard ? 'Saving...' : 'Save Debit Card'}
        </button>
      </div>
    </form>
  );
}

function DebitCardForm(props) {
  return (
    <Elements stripe={stripePromise}>
      <DebitCardFormInner {...props} />
    </Elements>
  );
}

export default function HyperBucks() {
  const { t } = useTranslation();
  const { token: authToken } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { address: wagmiAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { emailWalletAddress, emailWalletClient } = useEmailWallet();
  const activeAddress = wagmiAddress || emailWalletAddress;
  const activeWalletClient = walletClient || emailWalletClient;
  // True only when a wallet capable of signing txs is connected (MetaMask / WalletConnect or email wallet with PK loaded)
  const hasSigningWallet = !!(walletClient || emailWalletClient);

  const [activeTab, setActiveTab] = useState('topup');

  // Top Up states
  const [customUsd, setCustomUsd] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loadingIntent, setLoadingIntent] = useState(false);

  // Cashout states
  const [hbCashoutAmount, setHbCashoutAmount] = useState('');
  const [hbCashoutMethod, setHbCashoutMethod] = useState('usdc'); // 'usdc' | 'bank'
  const [payoutSpeed, setPayoutSpeed] = useState('standard'); // 'standard' | 'instant'
  const [hbProcessing, setHbProcessing] = useState(false);
  const [cashoutStep, setCashoutStep] = useState('form'); // 'form' | 'confirm' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [savedBankDetails, setSavedBankDetails] = useState(undefined);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ accountHolderName: '', bankName: '', accountNumber: '', iban: '', swift: '', routingNumber: '', country: '', currency: 'USD' });
  const [savingBank, setSavingBank] = useState(false);
  const [savedDebitCard, setSavedDebitCard] = useState(undefined); // undefined = not fetched, null = none
  const [showDebitCardForm, setShowDebitCardForm] = useState(false);
  const [savingCard, setSavingCard] = useState(false);

  // USDC top-up states
  const [usdcTopupStep, setUsdcTopupStep] = useState('idle'); // 'idle' | 'approving' | 'sending' | 'verifying' | 'done'
  const [topupMethod, setTopupMethod] = useState(null); // null | 'card' | 'usdc'

  // KYC gate — only shown when user tries to cashout without being verified
  const [kycStatus, setKycStatus] = useState(null); // null = not fetched
  const [kycGateOpen, setKycGateOpen] = useState(false);

  // Shared
  const [hbBalance, setHbBalance] = useState(null);
  const [hbHistory, setHbHistory] = useState([]);
  const [hbHistoryLoading, setHbHistoryLoading] = useState(false);

  const isSuccess = searchParams.get('success') === 'true';
  const successHB = parseInt(searchParams.get('hb') || '0');

  const fetchBalance = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/balance`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data !== undefined) setHbBalance(data);
    } catch {}
  }, [authToken]);

  const fetchHistory = useCallback(async () => {
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
    } catch {}
    finally { setHbHistoryLoading(false); }
  }, [authToken]);

  const fetchKycStatus = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/kyc/status`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setKycStatus(data.status || 'not_started');
    } catch {
      setKycStatus('not_started');
    }
  }, [authToken]);

  const fetchBankDetails = useCallback(async () => {
    if (!authToken) return;
    setBankDetailsLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/bank-details`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setSavedBankDetails(data.bankDetails || null); // null = fetched but no bank details
    } catch {}
    finally { setBankDetailsLoading(false); }
  }, [authToken]);

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, [isSuccess, fetchBalance, fetchHistory]);

  // Pre-fetch KYC status when user opens cashout tab
  useEffect(() => {
    if (activeTab === 'cashout' && kycStatus === null) {
      fetchKycStatus();
    }
  }, [activeTab, kycStatus, fetchKycStatus]);

  // Fetch bank details when bank method is selected (only if not fetched yet)
  useEffect(() => {
    if (activeTab === 'cashout' && hbCashoutMethod === 'bank' && savedBankDetails === undefined) {
      fetchBankDetails();
    }
  }, [activeTab, hbCashoutMethod, savedBankDetails, fetchBankDetails]);

  const fetchDebitCard = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/debit-card`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setSavedDebitCard(data.debitCard || null);
    } catch {}
  }, [authToken]);

  // Fetch debit card when instant speed is selected
  useEffect(() => {
    if (activeTab === 'cashout' && hbCashoutMethod === 'bank' && payoutSpeed === 'instant' && savedDebitCard === undefined) {
      fetchDebitCard();
    }
  }, [activeTab, hbCashoutMethod, payoutSpeed, savedDebitCard, fetchDebitCard]);

  // Instant payout fee: 1.5% for AU/US/NZ/AE, 1% for others
  const getInstantFee = (usdAmount, country) => {
    const highFeeCountries = ['AU', 'US', 'NZ', 'AE'];
    const rate = highFeeCountries.includes((country || 'US').toUpperCase()) ? 0.015 : 0.01;
    return { rate, fee: usdAmount * rate, receive: usdAmount * (1 - rate) };
  };

  // ── Top Up ────────────────────────────────────────────────────────
  const parsedUsd = customUsd ? parseFloat(customUsd) : 0;
  const activeHB = parsedUsd >= 1 ? Math.floor(parsedUsd * 250) : 0;
  const activeUSD = parsedUsd;

  // clicking a package fills the input
  const handleSelectPackage = (pkg) => {
    setCustomUsd(pkg.usd.toString());
    setClientSecret('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setCustomUsd(val);
      setClientSecret('');
    }
  };

  // which package is currently selected (matches input value)
  const activePackageHb = HB_PACKAGES.find((p) => p.usd === parsedUsd)?.hb || null;

  const handleProceed = async () => {
    if (!activeHB || activeHB < 250) {
      toast.error('Minimum top-up is $1 USD (250 HB)');
      return;
    }
    const hbAmount = Math.floor(activeHB / 250) * 250;
    setLoadingIntent(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/topup/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ hbAmount }),
      });
      const data = await res.json();
      if (data.clientSecret) setClientSecret(data.clientSecret);
      else toast.error(data.error || 'Failed to initialize payment');
    } catch {
      toast.error('Failed to initialize payment');
    } finally {
      setLoadingIntent(false);
    }
  };

  // ── Cashout ───────────────────────────────────────────────────────
  // USDC top-up — direct wallet transfer, fully automated
  const handleUSDCTopup = async () => {
    if (!activeUSD || activeUSD < 1) { toast.error('Enter an amount first'); return; }
    if (!activeWalletClient) { toast.error('Connect a wallet first'); return; }

    const usdcAddr = import.meta.env.VITE_USDC_ADDRESS;
    const platformWallet = import.meta.env.VITE_PLATFORM_WALLET;
    if (!usdcAddr || !platformWallet) { toast.error('Platform wallet not configured'); return; }

    try {
      // Step 1 — send USDC from user wallet to platform wallet
      setUsdcTopupStep('sending');
      const amountUnits = BigInt(Math.round(activeUSD * 1_000_000)); // USDC = 6 decimals

      const txHash = await activeWalletClient.writeContract({
        address: usdcAddr,
        abi: [{ name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] }],
        functionName: 'transfer',
        args: [platformWallet, amountUnits],
        account: activeWalletClient.account || activeAddress,
      });

      toast.loading('Waiting for transaction confirmation...', { id: 'usdc-topup' });

      // Step 2 — wait for confirmation
      setUsdcTopupStep('verifying');
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Step 3 — notify backend to credit HB
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/topup/usdc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ txHash, usdcAmount: activeUSD }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Verification failed', { id: 'usdc-topup' }); setUsdcTopupStep('idle'); return; }

      toast.success(`${data.hbAmount.toLocaleString()} HB credited!`, { id: 'usdc-topup' });
      setUsdcTopupStep('done');
      setCustomUsd('');
      setTopupMethod(null);
      fetchBalance();
      fetchHistory();
    } catch (err) {
      toast.dismiss('usdc-topup');
      if (err.message?.includes('rejected') || err.message?.includes('denied')) {
        toast.error('Transaction cancelled');
      } else {
        toast.error('Failed: ' + err.message);
      }
      setUsdcTopupStep('idle');
    }
  };

  const handleSaveBankDetails = async () => {
    if (!bankForm.accountHolderName || !bankForm.bankName || !bankForm.accountNumber) {
      toast.error('Account holder name, bank name, and account number are required');
      return;
    }
    setSavingBank(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/bank-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(bankForm),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to save bank details'); return; }
      setSavedBankDetails(data.bankDetails);
      setShowBankForm(false);
      toast.success('Bank details saved');
    } catch (err) {
      toast.error('Failed to save bank details: ' + err.message);
    } finally {
      setSavingBank(false);
    }
  };

  // Step 1 — validate inputs then show confirmation modal
  const handleRequestOTP = async () => {
    const hbAmount = parseInt(hbCashoutAmount, 10);
    if (!hbAmount || hbAmount <= 0) { toast.error('Please enter a valid HB amount'); return; }
    if (kycStatus !== 'verified') { setKycGateOpen(true); return; }
    if (hbAmount < 250) { toast.error('Minimum cashout is 250 HB ($1)'); return; }
    if (hbCashoutMethod === 'usdc' && !activeAddress) { toast.error('Connect a wallet to receive USDC'); return; }
    if (hbCashoutMethod === 'bank' && !savedBankDetails) { toast.error('Please add your bank details first'); return; }
    setCashoutStep('confirm');
  };

  // Step 2 — confirmed, send OTP
  const handleConfirmAndSendOTP = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/cashout/otp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to send OTP'); return; }
      toast.success('OTP sent to your email');
      setOtpCode('');
      setCashoutStep('otp');
    } catch (err) {
      toast.error('Failed to send OTP: ' + err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2 — submit cashout with OTP
  const handleHBCashout = async () => {
    if (!otpCode || otpCode.length !== 6) { toast.error('Enter the 6-digit OTP from your email'); return; }

    setHbProcessing(true);
    const toastId = toast.loading('Verifying OTP & processing cashout...');
    try {
      const payload = {
        amount: parseInt(hbCashoutAmount, 10),
        method: hbCashoutMethod,
        otp: otpCode,
      };
      if (hbCashoutMethod === 'usdc') payload.walletAddress = activeAddress;
      if (hbCashoutMethod === 'bank') payload.payoutSpeed = payoutSpeed;

      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/cashout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Cashout failed', { id: toastId }); return; }

      if (data.cashoutStatus === 'completed') {
        toast.success(data.message || 'Cashout sent successfully!', { id: toastId, duration: 6000 });
      } else if (data.cashoutStatus === 'processing') {
        toast.success(data.message || 'Bank transfer initiated. Funds arrive in 1-3 business days.', { id: toastId, duration: 8000 });
      } else if (data.cashoutStatus === 'pending') {
        toast(data.message || 'Cashout queued — admin will process shortly.', {
          id: toastId, icon: '⏳', duration: 8000,
          style: { background: '#1a1a2e', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' },
        });
      } else {
        toast.success(data.message || 'Cashout submitted.', { id: toastId });
      }
      setHbCashoutAmount('');
      setOtpCode('');
      setCashoutStep('form');
      fetchBalance();
      fetchHistory();
    } catch (err) {
      toast.error('Cashout failed: ' + err.message, { id: toastId });
    } finally {
      setHbProcessing(false);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = React.useState(isSuccess);

  // clear ?success params from URL without re-render loop
  React.useEffect(() => {
    if (isSuccess) {
      setShowSuccessModal(true);
      navigate('/dashboard/topup', { replace: true });
    }
  }, []);

  const hbNum = hbBalance?.hyperBucks ?? hbBalance?.balance ?? null;
  const usdEquiv = hbNum != null ? (hbNum / 250).toFixed(2) : null;

  return (
    <div className="w-full flex flex-col relative z-10">
      {/* ── Success Modal ───────────────────────────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-10 text-center max-w-sm w-full shadow-2xl">
            <FiCheckCircle className="text-green-400 mx-auto mb-4" size={52} />
            <h2 className="text-white text-2xl font-bold mb-2">{t("dashboard.hyperbucks.success.title", "Top-Up Successful!")}</h2>
            {successHB > 0 && (
              <p className="text-white/60 mb-1">
                <span className="text-white font-semibold">{successHB.toLocaleString()} HB</span> {t("dashboard.hyperbucks.success.added", "added to your account.")}
              </p>
            )}
            <p className="text-white/40 text-sm mb-7">{t("dashboard.hyperbucks.success.reflectSoon", "Your balance will reflect shortly.")}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white text-sm transition-colors"
              >
                {t("dashboard.hyperbucks.success.topUpAgain", "Top Up Again")}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-[#002AA8] hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
              >
                {t("dashboard.hyperbucks.success.goDashboard", "Go to Dashboard")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">{t("dashboard.hyperbucks.title", "Hyper Bucks")}</h1>
        <p className="text-white/50 text-sm mt-1">{t("dashboard.hyperbucks.subtitle", "250 HB = $1 USD · fixed rate")}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-[#002AA8]/20 border border-[#002AA8]/40 rounded-2xl p-4 mb-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#002AA8]/40 flex items-center justify-center">
            <HBCoinIcon size={48} />
          </div>
          <div>
            <p className="text-white/50 text-xs">{t("dashboard.hyperbucks.currentBalance", "Current Balance")}</p>
            <p className="text-white font-bold text-lg">
              {hbNum != null ? hbNum.toLocaleString() : '—'} HB
            </p>
          </div>
        </div>
        {usdEquiv && <p className="text-white/40 text-sm">${usdEquiv} USD</p>}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 mb-6">
        <button
          onClick={() => { setActiveTab('topup'); setClientSecret(''); setTopupMethod(null); setUsdcTopupStep('idle'); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'topup' ? 'text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <FiTrendingUp size={14} />
          {t("dashboard.hyperbucks.tabTopUp", "Top Up")}
          {activeTab === 'topup' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#002AA8] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('cashout')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'cashout' ? 'text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <FiArrowDownCircle size={14} />
          {t("dashboard.hyperbucks.tabCashout", "Cashout")}
          {activeTab === 'cashout' && (
            <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#002AA8] rounded-t-full" />
          )}
        </button>
      </div>

      <div className="w-full">
        {/* ── TOP UP TAB ─────────────────────────────────────────────── */}
        {activeTab === 'topup' && (
          <>
            {!clientSecret ? (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left — amount input + proceed */}
                <div className="w-full lg:flex-1">
                  <label className="text-white/50 text-xs mb-2 block">{t("dashboard.hyperbucks.topup.amountLabel", "Amount (USD)")}</label>
                  <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg font-light">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={customUsd}
                      onChange={handleCustomChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-[#002AA8] transition-colors"
                    />
                  </div>

                  {/* HB equivalent */}
                  <div className="h-6 mb-5">
                    {activeHB > 0 && (
                      <p className="text-blue-300 text-sm font-semibold">
                        = {activeHB.toLocaleString()} {t("dashboard.hyperbucks.topup.hyperBucks", "Hyper Bucks")}
                      </p>
                    )}
                  </div>

                  {/* Payment method selector */}
                  <div className="flex gap-3 mb-4">
                    {[
                      { key: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, etc.', Icon: CreditCard },
                      { key: 'usdc', label: 'USDC via Wallet', sub: 'Base network · no extra fee', Icon: Wallet },
                    ].map(({ key, label, sub, Icon }) => (
                      <button
                        key={key}
                        onClick={() => { setTopupMethod(key); setUsdcTopupStep('idle'); }}
                        className={`flex-1 rounded-2xl p-3 text-left border transition-all ${
                          topupMethod === key
                            ? 'bg-[#002AA8]/30 border-[#002AA8] text-white'
                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                        }`}
                      >
                        <Icon size={20} strokeWidth={1.5} className={topupMethod === key ? 'text-blue-400' : 'text-white/40'} />
                        <p className="text-sm font-semibold mt-1">{label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>
                      </button>
                    ))}
                  </div>

                  {/* Single action button */}
                  {topupMethod === 'card' && (
                    <button
                      onClick={handleProceed}
                      disabled={!activeHB || activeHB < 250 || loadingIntent}
                      className={`w-full py-4 rounded-2xl font-bold text-base text-white transition-all ${
                        activeHB >= 250 && !loadingIntent ? 'bg-[#002AA8] hover:bg-blue-700' : 'bg-white/10 cursor-not-allowed text-white/40'
                      }`}
                    >
                      {loadingIntent ? t("dashboard.hyperbucks.topup.preparing", "Preparing...") : activeHB >= 250 ? `Continue — $${activeUSD} USD` : t("dashboard.hyperbucks.topup.enterAmount", "Enter an amount to continue")}
                    </button>
                  )}

                  {topupMethod === 'usdc' && (
                    <div className="space-y-3">
                      {!activeAddress ? (
                        <p className="text-yellow-400 text-sm text-center py-2">{t("dashboard.hyperbucks.cashout.noWallet", "Connect a wallet to continue")}</p>
                      ) : !hasSigningWallet ? (
                        <>
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/40 flex justify-between">
                            <span>{t("dashboard.hyperbucks.usdcTopup.from", "From")}</span>
                            <span className="font-mono text-white/60">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
                          </div>
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-center">
                            <p className="text-yellow-300 text-sm font-semibold mb-1">External wallet required</p>
                            <p className="text-yellow-300/60 text-xs">Your HyperTek account wallet cannot sign on-chain transactions directly. Connect MetaMask or WalletConnect to use USDC top-up.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/40 flex justify-between">
                            <span>{t("dashboard.hyperbucks.usdcTopup.from", "From")}</span>
                            <span className="font-mono text-white/60">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
                          </div>
                          <button
                            onClick={handleUSDCTopup}
                            disabled={!activeHB || activeHB < 250 || ['sending', 'verifying'].includes(usdcTopupStep)}
                            className={`w-full py-4 rounded-2xl font-bold text-base text-white transition-all ${
                              activeHB >= 250 && !['sending', 'verifying'].includes(usdcTopupStep)
                                ? 'bg-[#002AA8] hover:bg-blue-700'
                                : 'bg-white/10 cursor-not-allowed text-white/40'
                            }`}
                          >
                            {usdcTopupStep === 'sending' ? 'Confirm in wallet...' :
                             usdcTopupStep === 'verifying' ? 'Verifying on-chain...' :
                             activeHB >= 250 ? `Pay ${activeUSD} USDC → ${activeHB.toLocaleString()} HB` :
                             t("dashboard.hyperbucks.topup.enterAmount", "Enter an amount to continue")}
                          </button>
                          {usdcTopupStep === 'done' && (
                            <div className="flex items-center gap-2 text-green-400 text-sm justify-center">
                              <FiCheckCircle size={16} /> Hyper Bucks credited successfully!
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {!topupMethod && (
                    <p className="text-white/25 text-xs text-center mt-1">{t("dashboard.hyperbucks.topup.rate", "250 HB = $1 USD · min $1")}</p>
                  )}
                </div>

                {/* Right — package shortcuts */}
                <div className="w-full lg:w-[340px] flex-shrink-0">
                  <p className="text-white/50 text-xs mb-3">{t("dashboard.hyperbucks.topup.quickSelect", "Quick Select")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {HB_PACKAGES.map((pkg) => {
                      const isActive = activePackageHb === pkg.hb;
                      return (
                        <button
                          key={pkg.hb}
                          onClick={() => handleSelectPackage(pkg)}
                          className={`relative rounded-xl p-3 text-left border transition-all ${
                            isActive
                              ? 'bg-[#002AA8]/30 border-[#002AA8]'
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#002AA8] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              POPULAR
                            </span>
                          )}
                          {pkg.mostPopular && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              MOST POPULAR
                            </span>
                          )}
                          <p className="text-white/40 text-[10px] mb-0.5">{pkg.label}</p>
                          <p className="text-white font-bold text-sm">{pkg.hb.toLocaleString()} HB</p>
                          <p className={`text-xs font-semibold ${isActive ? 'text-blue-300' : 'text-white/50'}`}>${pkg.usd} USD</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#002AA8',
                      colorBackground: '#1a1a2e',
                      colorText: '#ffffff',
                      borderRadius: '12px',
                    },
                  },
                }}
              >
                <CheckoutForm
                  hbAmount={Math.floor(activeHB / 250) * 250}
                  usdAmount={activeUSD}
                  onBack={() => setClientSecret('')}
                />
              </Elements>
            )}
          </>
        )}

        {/* ── CASHOUT TAB ────────────────────────────────────────────── */}
        {activeTab === 'cashout' && (
          <div className="space-y-5 w-full">
            {/* KYC Gate — shown only when user tries to cashout without verification */}
            {kycGateOpen ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setKycGateOpen(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <FiArrowLeft size={16} />
                  </button>
                  <p className="text-white/60 text-sm">{t("dashboard.hyperbucks.cashout.kycNote", "Complete identity verification to continue")}</p>
                </div>
                <KYCVerification
                  initialStatus={kycStatus}
                  onVerified={() => {
                    setKycStatus('verified');
                    setKycGateOpen(false);
                  }}
                />
              </div>
            ) : cashoutStep === 'otp' ? (
              /* OTP Step */
              <div className="w-full">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setCashoutStep('form')} className="text-white/40 hover:text-white transition-colors">
                    <FiArrowLeft size={16} />
                  </button>
                  <div>
                    <p className="text-white font-semibold text-sm">{t("dashboard.hyperbucks.otp.title", "Enter verification code")}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {t("dashboard.hyperbucks.otp.subtitle", "A 6-digit code was sent to your email · expires in 5 minutes")}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                  <div className="mb-2 text-white/50 text-xs">
                    {t("dashboard.hyperbucks.otp.cashingOut", "Cashing out")} <span className="text-white font-semibold">{parseInt(hbCashoutAmount, 10).toLocaleString()} HB</span>
                    {' '}≈ <span className="text-white font-semibold">${(parseInt(hbCashoutAmount, 10) / 250).toFixed(2)} USD</span>
                    {' '}via <span className="text-white font-semibold">{hbCashoutMethod === 'bank' ? 'Bank Transfer' : 'USDC on Base'}</span>
                  </div>
                </div>

                <label className="text-white/50 text-xs mb-2 block">{t("dashboard.hyperbucks.otp.label", "OTP Code")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-3xl font-bold tracking-[0.5em] text-center focus:outline-none focus:border-[#002AA8] transition-colors mb-3"
                />

                <button
                  onClick={handleHBCashout}
                  disabled={hbProcessing || otpCode.length !== 6}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all mb-3 ${
                    hbProcessing || otpCode.length !== 6
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-[#002AA8] hover:bg-blue-700 text-white'
                  }`}
                >
                  {hbProcessing ? t("dashboard.hyperbucks.otp.processing", "Processing...") : t("dashboard.hyperbucks.otp.confirm", "Confirm Cashout")}
                </button>

                <button
                  onClick={handleRequestOTP}
                  disabled={sendingOtp}
                  className="w-full text-xs text-white/30 hover:text-white/60 transition-colors py-2"
                >
                  {sendingOtp ? t("dashboard.hyperbucks.otp.sending", "Sending...") : t("dashboard.hyperbucks.otp.resend", "Resend code")}
                </button>
              </div>
            ) : cashoutStep === 'confirm' ? (
              /* Confirmation Modal Step */
              <div className="w-full max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setCashoutStep('form')} className="text-white/40 hover:text-white transition-colors">
                    <FiArrowLeft size={16} />
                  </button>
                  <p className="text-white font-semibold text-sm">{t("dashboard.hyperbucks.confirm.title", "Confirm Cashout")}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">{t("dashboard.hyperbucks.confirm.amount", "Amount")}</span>
                    <span className="text-white font-bold text-lg">{parseInt(hbCashoutAmount, 10).toLocaleString()} HB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">{t("dashboard.hyperbucks.confirm.usdEquiv", "USD Equivalent")}</span>
                    <span className="text-white font-semibold">${(parseInt(hbCashoutAmount, 10) / 250).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">{t("dashboard.hyperbucks.confirm.method", "Method")}</span>
                    <span className="text-white font-semibold">{hbCashoutMethod === 'bank' ? 'Bank Transfer' : 'USDC on Base'}</span>
                  </div>
                  {hbCashoutMethod === 'usdc' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-sm">{t("dashboard.hyperbucks.confirm.wallet", "To Wallet")}</span>
                        <span className="text-white font-mono text-sm">{activeAddress?.slice(0, 6)}...{activeAddress?.slice(-4)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/50 text-sm">{t("dashboard.hyperbucks.confirm.fee", "Gas Fee")}</span>
                          <span className="text-white/70 font-semibold">~$0.01 (paid by platform)</span>
                        </div>
                      </div>
                      <div className="bg-[#002AA8]/10 border border-[#002AA8]/30 rounded-xl p-3">
                        <p className="text-white/50 text-xs">USDC will be sent to your wallet on Base network. Near-instant transfer.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-sm">To Bank</span>
                        <span className="text-white text-sm font-semibold">{savedBankDetails?.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-sm">Account Holder</span>
                        <span className="text-white text-sm">{savedBankDetails?.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-sm">Account</span>
                        <span className="text-white font-mono text-sm">****{savedBankDetails?.accountNumber?.slice(-4)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/50 text-sm">Transfer Fee</span>
                          <span className="text-white/70 font-semibold">Free</span>
                        </div>
                      </div>
                      <div className="bg-[#002AA8]/10 border border-[#002AA8]/30 rounded-xl p-3">
                        <p className="text-white/50 text-xs">Funds will arrive in your bank account within 1 to 3 business days. This is standard banking processing time and not a platform limitation.</p>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleConfirmAndSendOTP}
                  disabled={sendingOtp}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                    sendingOtp ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-[#002AA8] hover:bg-blue-700 text-white'
                  }`}
                >
                  {sendingOtp ? t("dashboard.hyperbucks.cashout.sendingOtp", "Sending OTP...") : t("dashboard.hyperbucks.confirm.confirmSendOtp", "Confirm & Send OTP")}
                </button>
              </div>
            ) : (
            /* Form Step */
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:flex-1 space-y-4">

                {/* Method selector */}
                <div>
                  <label className="text-white/50 text-xs mb-2 block">Cashout Method</label>
                  <div className="flex gap-3">
                    {[
                      { key: 'usdc', label: 'USDC Wallet', sub: 'Instant · Base network', Icon: Wallet },
                      { key: 'bank', label: 'Bank Transfer', sub: 'Standard or Instant', Icon: CreditCard },
                    ].map(({ key, label, sub, Icon }) => (
                      <button
                        key={key}
                        onClick={() => { setHbCashoutMethod(key); setCashoutStep('form'); }}
                        className={`flex-1 rounded-2xl p-3 text-left border transition-all ${
                          hbCashoutMethod === key
                            ? 'bg-[#002AA8]/30 border-[#002AA8] text-white'
                            : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.5} className={hbCashoutMethod === key ? 'text-blue-400' : 'text-white/40'} />
                        <p className="text-sm font-semibold mt-1">{label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout speed selector — only for bank */}
                {hbCashoutMethod === 'bank' && (
                  <div>
                    <label className="text-white/50 text-xs mb-2 block">Payout Speed</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPayoutSpeed('standard')}
                        className={`flex-1 rounded-2xl p-3 text-left border transition-all ${payoutSpeed === 'standard' ? 'bg-[#002AA8]/30 border-[#002AA8] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}
                      >
                        <p className="text-sm font-semibold">Standard</p>
                        <p className="text-[10px] text-white/30 mt-0.5">1–3 business days · No fee</p>
                        <p className="text-[10px] text-white/20 mt-0.5">Bank account required</p>
                      </button>
                      <button
                        onClick={() => { setPayoutSpeed('instant'); if (savedDebitCard === undefined) fetchDebitCard(); }}
                        className={`flex-1 rounded-2xl p-3 text-left border transition-all ${payoutSpeed === 'instant' ? 'bg-amber-500/20 border-amber-500/60 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}
                      >
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          Instant <span className="text-[9px] bg-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-bold">~minutes</span>
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {savedDebitCard?.country ? `${getInstantFee(1, savedDebitCard.country).rate * 100}% fee` : '1–1.5% fee'} · Deducted by Stripe
                        </p>
                        <p className="text-[10px] text-white/20 mt-0.5">Debit card required</p>
                      </button>
                    </div>
                    {/* Instant fee preview */}
                    {payoutSpeed === 'instant' && hbCashoutAmount && Number(hbCashoutAmount) >= 250 && (
                      <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs space-y-0.5">
                        {(() => {
                          const usd = Number(hbCashoutAmount) / 250;
                          const { rate, fee, receive } = getInstantFee(usd, savedDebitCard?.country);
                          return (
                            <>
                              <div className="flex justify-between text-white/50"><span>Cashout amount</span><span>${usd.toFixed(2)}</span></div>
                              <div className="flex justify-between text-amber-400/70"><span>Stripe instant fee ({(rate * 100).toFixed(1)}%)</span><span>-${fee.toFixed(2)}</span></div>
                              <div className="flex justify-between text-white font-semibold border-t border-white/10 pt-1 mt-1"><span>You will receive</span><span>${receive.toFixed(2)}</span></div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Amount input */}
                <div>
                  <label className="text-white/50 text-xs mb-2 block">{t("dashboard.hyperbucks.cashout.amountLabel", "Amount (HB)")}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={hbCashoutAmount}
                      onChange={(e) => setHbCashoutAmount(e.target.value)}
                      placeholder="Min 250 HB"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-[#002AA8] transition-colors pr-28"
                    />
                    {hbCashoutAmount && Number(hbCashoutAmount) > 0 && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                        ≈ ${(Number(hbCashoutAmount) / 250).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* USDC: wallet address display */}
                {hbCashoutMethod === 'usdc' && (
                  activeAddress ? (
                    <p className="text-white/30 text-xs">
                      {t("dashboard.hyperbucks.cashout.toWallet", "To:")} <span className="font-mono text-white/50">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
                    </p>
                  ) : (
                    <p className="text-yellow-400 text-xs">{t("dashboard.hyperbucks.cashout.noWallet", "Connect a wallet to receive USDC")}</p>
                  )
                )}

                {/* Bank: bank details section (standard) */}
                {hbCashoutMethod === 'bank' && payoutSpeed === 'standard' && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    {bankDetailsLoading || savedBankDetails === undefined ? (
                      <p className="text-white/40 text-sm text-center py-2">Loading bank details...</p>
                    ) : savedBankDetails && !showBankForm ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Saved Bank Account</p>
                          <button onClick={() => {
                            setBankForm({
                              accountHolderName: savedBankDetails.accountHolderName || '',
                              bankName: savedBankDetails.bankName || '',
                              accountNumber: savedBankDetails.accountNumber || '',
                              iban: savedBankDetails.iban || '',
                              swift: savedBankDetails.swift || '',
                              routingNumber: savedBankDetails.routingNumber || '',
                              country: savedBankDetails.country || '',
                              currency: savedBankDetails.currency || 'USD',
                            });
                            setShowBankForm(true);
                          }} className="text-blue-400 text-xs hover:text-blue-300">Edit</button>
                        </div>
                        <p className="text-white text-sm font-semibold">{savedBankDetails.accountHolderName}</p>
                        <p className="text-white/50 text-xs">{savedBankDetails.bankName}</p>
                        <p className="text-white/40 text-xs font-mono">****{savedBankDetails.accountNumber?.slice(-4)}</p>
                        {savedBankDetails.iban && <p className="text-white/40 text-xs">IBAN: {savedBankDetails.iban}</p>}
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${savedBankDetails.verified ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                          {savedBankDetails.verified ? '✓ Verified' : '⏳ Pending verification'}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1">{savedBankDetails ? 'Update Bank Details' : 'Add Bank Details'}</p>
                        {[
                          { field: 'accountHolderName', label: 'Account Holder Name', required: true },
                          { field: 'bankName', label: 'Bank Name', required: true },
                          { field: 'accountNumber', label: 'Account Number', required: true },
                          { field: 'iban', label: 'IBAN (international)', required: false },
                          { field: 'swift', label: 'SWIFT / BIC', required: false },
                          { field: 'routingNumber', label: 'Routing / Sort / BSB Code', required: false },
                          { field: 'country', label: 'Country', required: false },
                          { field: 'currency', label: 'Currency (e.g. USD, EUR, AUD)', required: false },
                        ].map(({ field, label, required }) => (
                          <div key={field}>
                            <label className="text-white/40 text-xs mb-1 block">{label}{required && ' *'}</label>
                            <input
                              type="text"
                              value={bankForm[field]}
                              onChange={(e) => setBankForm(prev => ({ ...prev, [field]: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#002AA8] transition-colors"
                            />
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          {savedBankDetails && (
                            <button onClick={() => setShowBankForm(false)} className="flex-1 py-2 rounded-xl border border-white/20 text-white/50 text-sm hover:text-white transition-colors">
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={handleSaveBankDetails}
                            disabled={savingBank}
                            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${savingBank ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-[#002AA8] hover:bg-blue-700 text-white'}`}
                          >
                            {savingBank ? 'Saving...' : 'Save Bank Details'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Debit card section (instant only) */}
                {hbCashoutMethod === 'bank' && payoutSpeed === 'instant' && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    {savedDebitCard === undefined ? (
                      <p className="text-white/40 text-sm text-center py-2">Loading card details...</p>
                    ) : savedDebitCard && !showDebitCardForm ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Saved Debit Card</p>
                          <button onClick={() => setShowDebitCardForm(true)} className="text-blue-400 text-xs hover:text-blue-300">Change</button>
                        </div>
                        <p className="text-white text-sm font-semibold">{savedDebitCard.cardHolderName}</p>
                        <p className="text-white/50 text-xs">{savedDebitCard.brand} •••• {savedDebitCard.last4}</p>
                        <p className="text-white/30 text-xs">{savedDebitCard.country} · {savedDebitCard.currency}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1">
                          {savedDebitCard ? 'Update Debit Card' : 'Add Debit Card for Instant Payout'}
                        </p>
                        <p className="text-white/30 text-xs">Enter your debit card number below. Only Visa/Mastercard debit cards are accepted.</p>
                        <DebitCardForm
                          onSaved={(card) => { setSavedDebitCard(card); setShowDebitCardForm(false); }}
                          onCancel={savedDebitCard ? () => setShowDebitCardForm(false) : null}
                          authToken={authToken}
                          savingCard={savingCard}
                          setSavingCard={setSavingCard}
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleRequestOTP}
                  disabled={sendingOtp}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                    sendingOtp ? 'bg-white/10 text-white/40 cursor-not-allowed' : payoutSpeed === 'instant' ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-[#002AA8] hover:bg-blue-700 text-white'
                  }`}
                >
                  {sendingOtp ? 'Sending OTP...' : hbCashoutMethod === 'bank'
                    ? (payoutSpeed === 'instant' ? '⚡ Instant Cashout' : 'Cashout to Bank Account')
                    : 'Cashout to USDC Wallet'}
                </button>
              </div>

              <div className="w-full lg:w-[260px] flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <p className="text-white font-semibold text-sm">
                  {hbCashoutMethod === 'usdc' ? 'USDC Wallet' : payoutSpeed === 'instant' ? '⚡ Instant Bank Transfer' : 'Bank Transfer'}
                </p>
                <div className="space-y-1.5 text-xs text-white/40">
                  <p>Min 250 HB ($1)</p>
                  {hbCashoutMethod === 'bank' && payoutSpeed === 'instant' ? (
                    <>
                      <p className="text-amber-400/70">1–1.5% Stripe fee (deducted automatically)</p>
                      <p>Arrives within minutes</p>
                      <p>Requires a Visa/Mastercard debit card</p>
                      <p>Real money to your debit card</p>
                    </>
                  ) : hbCashoutMethod === 'bank' ? (
                    <>
                      <p>No transfer fee</p>
                      <p>Typically 1–3 business days (often faster)</p>
                      <p>Real money to your bank account</p>
                    </>
                  ) : (
                    <>
                      <p>~$0.01 gas fee (paid by platform)</p>
                      <p>Near-instant on Base network</p>
                      <p>Convert to local currency via Coinbase or Binance</p>
                    </>
                  )}
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-white/25 text-xs">KYC verification required before cashout.</p>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

      </div>

      {/* HB Transaction History */}
      <div className="mt-10 w-full">
        <h3 className="text-white font-semibold text-base mb-4">{t("dashboard.hyperbucks.history.title", "Transaction History")}</h3>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-white/5 text-xs uppercase text-white/40">
                <tr>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.type", "Type")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.amount", "Amount")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.balanceAfter", "Balance After")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.status", "Status")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.date", "Date")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.note", "Note")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hbHistoryLoading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-white/40 text-sm">{t("dashboard.hyperbucks.history.loading", "Loading...")}</td></tr>
                ) : hbHistory.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-white/40 text-sm">{t("dashboard.hyperbucks.history.empty", "No transactions yet.")}</td></tr>
                ) : (
                  hbHistory.map((tx) => {
                    const basescanBase = Number(import.meta.env.VITE_CHAIN_ID) === 84532
                      ? 'https://sepolia.basescan.org/tx/'
                      : 'https://basescan.org/tx/';
                    const hasTxHash = tx.cashoutTxHash && tx.cashoutTxHash.startsWith('0x');
                    return (
                    <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          tx.type === 'earn' || tx.type === 'prize'
                            ? 'bg-green-500/10 text-green-400'
                            : tx.type === 'cashout'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-mono font-semibold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="px-4 py-3 font-mono text-white/50 text-sm">{tx.balanceAfter}</td>
                      <td className="px-4 py-3">
                        {tx.type === 'cashout' ? (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium w-fit ${
                              tx.cashoutStatus === 'completed'  ? 'bg-green-500/15 text-green-400' :
                              tx.cashoutStatus === 'failed'     ? 'bg-red-500/15 text-red-400' :
                              tx.cashoutStatus === 'processing' ? 'bg-blue-500/15 text-blue-400' :
                                                                  'bg-yellow-500/15 text-yellow-400'
                            }`}>
                              {tx.cashoutStatus === 'completed'  ? '✓ Sent' :
                               tx.cashoutStatus === 'failed'     ? '✕ Failed' :
                               tx.cashoutStatus === 'processing' ? '⟳ Processing' :
                                                                   '⏳ Pending'}
                            </span>
                            {hasTxHash && (
                              <a href={`${basescanBase}${tx.cashoutTxHash}`} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 hover:text-blue-300 underline font-mono">
                                {tx.cashoutTxHash.slice(0, 6)}...{tx.cashoutTxHash.slice(-4)} ↗
                              </a>
                            )}
                          </div>
                        ) : tx.type === 'earn' ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium w-fit bg-green-500/15 text-green-400">
                              ✓ Confirmed
                            </span>
                            {tx.reference?.startsWith('0x') && (
                              <a href={`${basescanBase}${tx.reference}`} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 hover:text-blue-300 underline font-mono">
                                {tx.reference.slice(0, 6)}...{tx.reference.slice(-4)} ↗
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/35 max-w-[140px] truncate">
                        {tx.description || '—'}
                      </td>
                    </tr>
                  );})
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
