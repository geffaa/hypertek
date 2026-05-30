import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY, BACKEND_BASE_URL } from '../../Config';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiZap, FiCheckCircle, FiArrowLeft, FiTrendingUp, FiArrowDownCircle } from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { useEmailWallet } from '../../hooks/useEmailWallet';
import KYCVerification from '../../Components/Dashboard/KYCVerification';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const HB_PACKAGES = [
  { hb: 250,   usd: 1,   label: 'Starter' },
  { hb: 1000,  usd: 4,   label: 'Basic' },
  { hb: 2500,  usd: 10,  label: 'Standard', popular: true },
  { hb: 5000,  usd: 20,  label: 'Plus' },
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

export default function HyperBucks() {
  const { t } = useTranslation();
  const { token: authToken } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { emailWalletAddress, isEmailWalletConnected } = useEmailWallet();
  const activeAddress = wagmiAddress || emailWalletAddress;

  const [activeTab, setActiveTab] = useState('topup');

  // Top Up states
  const [customUsd, setCustomUsd] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loadingIntent, setLoadingIntent] = useState(false);

  // Cashout states
  const [hbCashoutAmount, setHbCashoutAmount] = useState('');
  const [hbCashoutMethod, setHbCashoutMethod] = useState('usdc');
  const [hbProcessing, setHbProcessing] = useState(false);
  const [cashoutStep, setCashoutStep] = useState('form'); // 'form' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

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
  // Step 1 — validate inputs then send OTP to email
  const handleRequestOTP = async () => {
    const hbAmount = parseInt(hbCashoutAmount, 10);
    const method = hbCashoutMethod;

    if (!hbAmount || hbAmount <= 0) { toast.error('Please enter a valid HB amount'); return; }
    if (kycStatus !== 'verified') { setKycGateOpen(true); return; }

    const minHb = method === 'bank' ? 2500 : 250;
    if (hbAmount < minHb) {
      toast.error(method === 'bank' ? 'Minimum bank cashout is 2500 HB ($10)' : 'Minimum USDC cashout is 250 HB ($1)');
      return;
    }
    if (method === 'usdc' && !activeAddress) { toast.error('Connect a wallet to receive USDC'); return; }

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
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/hb/cashout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          amount: parseInt(hbCashoutAmount, 10),
          method: hbCashoutMethod,
          otp: otpCode,
          ...(hbCashoutMethod === 'usdc' ? { walletAddress: activeAddress } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Cashout failed', { id: toastId }); return; }
      toast.success(`${parseInt(hbCashoutAmount, 10).toLocaleString()} HB cashout submitted!`, { id: toastId });
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
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">{t("dashboard.hyperbucks.title", "HyperBucks")}</h1>
        <p className="text-white/50 text-sm mt-1">{t("dashboard.hyperbucks.subtitle", "250 HB = $1 USD · fixed rate")}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-[#002AA8]/20 border border-[#002AA8]/40 rounded-2xl p-4 mb-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#002AA8]/40 flex items-center justify-center">
            <FiZap className="text-blue-300" size={18} />
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
          onClick={() => { setActiveTab('topup'); setClientSecret(''); }}
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
                        = {activeHB.toLocaleString()} {t("dashboard.hyperbucks.topup.hyperBucks", "HyperBucks")}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleProceed}
                    disabled={!activeHB || activeHB < 250 || loadingIntent}
                    className={`w-full py-4 rounded-2xl font-bold text-base text-white transition-all ${
                      activeHB >= 250 && !loadingIntent
                        ? 'bg-[#002AA8] hover:bg-blue-700'
                        : 'bg-white/10 cursor-not-allowed text-white/40'
                    }`}
                  >
                    {loadingIntent
                      ? t("dashboard.hyperbucks.topup.preparing", "Preparing...")
                      : activeHB >= 250
                      ? `${t("dashboard.hyperbucks.topup.proceed", "Proceed to Payment")} — $${activeUSD} USD`
                      : t("dashboard.hyperbucks.topup.enterAmount", "Enter an amount to continue")}
                  </button>

                  <p className="text-white/25 text-xs text-center mt-3">
                    {t("dashboard.hyperbucks.topup.secured", "Secured by Stripe · 250 HB = $1 USD · min $1")}
                  </p>
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
                    {' '}via <span className="text-white font-semibold capitalize">{hbCashoutMethod === 'usdc' ? t("dashboard.hyperbucks.otp.usdcWallet", "USDC Wallet") : t("dashboard.hyperbucks.otp.bankAccount", "Bank Account")}</span>
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
            ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left — amount + button */}
              <div className="w-full lg:flex-1">
                <label className="text-white/50 text-xs mb-2 block">{t("dashboard.hyperbucks.cashout.amountLabel", "Amount (HB)")}</label>
                <div className="relative mb-3">
                  <input
                    type="number"
                    value={hbCashoutAmount}
                    onChange={(e) => setHbCashoutAmount(e.target.value)}
                    placeholder={hbCashoutMethod === 'usdc' ? t("dashboard.hyperbucks.cashout.minUsdc", "Min 250 HB") : t("dashboard.hyperbucks.cashout.minBank", "Min 2500 HB")}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-[#002AA8] transition-colors pr-28"
                  />
                  {hbCashoutAmount && Number(hbCashoutAmount) > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                      ≈ ${(Number(hbCashoutAmount) / 250).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="h-6 mb-5">
                  {hbCashoutMethod === 'usdc' && activeAddress && (
                    <p className="text-white/30 text-xs">
                      To: <span className="font-mono text-white/50">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
                    </p>
                  )}
                  {hbCashoutMethod === 'usdc' && !activeAddress && (
                    <p className="text-yellow-400 text-xs">{t("dashboard.hyperbucks.cashout.noWallet", "No wallet connected")}</p>
                  )}
                </div>

                <button
                  onClick={handleRequestOTP}
                  disabled={sendingOtp}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                    sendingOtp
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-[#002AA8] hover:bg-blue-700 text-white'
                  }`}
                >
                  {sendingOtp ? t("dashboard.hyperbucks.cashout.sendingOtp", "Sending OTP...") : hbCashoutMethod === 'usdc' ? t("dashboard.hyperbucks.cashout.toUsdc", "Cashout to USDC Wallet") : t("dashboard.hyperbucks.cashout.toBank", "Cashout to Bank Account")}
                </button>
              </div>

              {/* Right — method selector + info */}
              <div className="w-full lg:w-[340px] flex-shrink-0">
                <p className="text-white/50 text-xs mb-3">{t("dashboard.hyperbucks.cashout.receiveVia", "Receive via")}</p>
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    onClick={() => setHbCashoutMethod('usdc')}
                    className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold text-left transition-colors ${
                      hbCashoutMethod === 'usdc'
                        ? 'bg-[#002AA8]/30 border-[#002AA8] text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    {t("dashboard.hyperbucks.cashout.usdcWallet", "USDC Wallet")}
                    <span className="block text-[10px] font-normal text-white/30 mt-0.5">{t("dashboard.hyperbucks.cashout.usdcMin", "Min 250 HB · ~$0.01 gas")}</span>
                  </button>
                  <button
                    onClick={() => setHbCashoutMethod('bank')}
                    className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold text-left transition-colors ${
                      hbCashoutMethod === 'bank'
                        ? 'bg-[#002AA8]/30 border-[#002AA8] text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    {t("dashboard.hyperbucks.cashout.bankAccount", "Bank Account")}
                    <span className="block text-[10px] font-normal text-white/30 mt-0.5">{t("dashboard.hyperbucks.cashout.bankMin", "Min 2500 HB ($10) · bank details required")}</span>
                  </button>
                </div>
                {hbCashoutMethod === 'bank' && (
                  <p className="text-xs text-white/30">
                    <a href="/dashboard/edit-profile" className="text-[#002AA8] hover:underline">{t("dashboard.hyperbucks.cashout.addBank", "Add bank details in Profile →")}</a>
                  </p>
                )}
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
            <table className="w-full text-left min-w-[480px]">
              <thead className="bg-white/5 text-xs uppercase text-white/40">
                <tr>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.type", "Type")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.amount", "Amount")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.balanceAfter", "Balance After")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.date", "Date")}</th>
                  <th className="px-4 py-3">{t("dashboard.hyperbucks.history.note", "Note")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hbHistoryLoading ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-white/40 text-sm">{t("dashboard.hyperbucks.history.loading", "Loading...")}</td></tr>
                ) : hbHistory.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-white/40 text-sm">{t("dashboard.hyperbucks.history.empty", "No transactions yet.")}</td></tr>
                ) : (
                  hbHistory.map((tx) => (
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
                      <td className="px-4 py-3 text-xs text-white/40">
                        {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/35 max-w-[140px] truncate">
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
  );
}
