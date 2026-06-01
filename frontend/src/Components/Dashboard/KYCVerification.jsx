import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BACKEND_BASE_URL } from '../../Config';
import toast from 'react-hot-toast';
import { FiShield, FiCheckCircle, FiAlertCircle, FiClock, FiExternalLink } from 'react-icons/fi';

const STATUS_CONFIG = {
  not_started: {
    icon: <FiShield size={28} className="text-white/40" />,
    title: 'Identity Verification Required',
    description: 'You need to verify your identity before you can cash out HyperBucks. This is required to prevent money laundering and protect all users on the platform.',
    badgeClass: 'bg-white/10 text-white/60',
    badge: 'Not Started',
  },
  pending: {
    icon: <FiClock size={28} className="text-yellow-400" />,
    title: 'Verification In Progress',
    description: 'Your identity verification is being processed. This usually takes a few minutes. You will be able to cash out once verification is complete.',
    badgeClass: 'bg-yellow-500/20 text-yellow-300',
    badge: 'Pending',
  },
  verified: {
    icon: <FiCheckCircle size={28} className="text-green-400" />,
    title: 'Identity Verified',
    description: 'Your identity has been successfully verified. You can now cash out HyperBucks.',
    badgeClass: 'bg-green-500/20 text-green-300',
    badge: 'Verified',
  },
  failed: {
    icon: <FiAlertCircle size={28} className="text-red-400" />,
    title: 'Verification Failed',
    description: 'Your identity verification was unsuccessful. Please try again with a valid government-issued ID.',
    badgeClass: 'bg-red-500/20 text-red-300',
    badge: 'Failed',
  },
};

export default function KYCVerification({ onVerified, initialStatus = null }) {
  const { token: authToken } = useSelector((state) => state.auth);
  const [kycStatus, setKycStatus] = useState(initialStatus || 'not_started');
  const [loading, setLoading] = useState(initialStatus === null);
  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (initialStatus === null) fetchStatus();
  }, []);

  // Auto-poll every 8 seconds while pending
  useEffect(() => {
    if (kycStatus !== 'pending') return;
    const interval = setInterval(() => fetchStatus(true), 8000);
    return () => clearInterval(interval);
  }, [kycStatus]);

  const fetchStatus = async (silent = false) => {
    if (!silent) setChecking(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/kyc/status`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setKycStatus(data.status || 'not_started');
      if (data.status === 'verified' && onVerified) onVerified();
    } catch {
      setKycStatus('not_started');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  const handleStartVerification = async () => {
    setStarting(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/kyc/session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Load Stripe.js and open the verification flow
      const { loadStripe } = await import('@stripe/stripe-js');
      const { STRIPE_PUBLISHABLE_KEY } = await import('../../Config');
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

      const { error } = await stripe.verifyIdentity(data.clientSecret);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification submitted. Processing...');
        setKycStatus('pending');
        // Poll for status update
        setTimeout(fetchStatus, 3000);
      }
    } catch (err) {
      toast.error('Failed to start verification. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const config = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.not_started;

  if (kycStatus === 'verified') return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-sm">{config.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badgeClass}`}>
              {config.badge}
            </span>
          </div>
          <p className="text-white/50 text-xs leading-relaxed mb-4">{config.description}</p>

          {(kycStatus === 'not_started' || kycStatus === 'failed') && (
            <button
              onClick={handleStartVerification}
              disabled={starting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                starting
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-[#002AA8] hover:bg-blue-700 text-white'
              }`}
            >
              <FiExternalLink size={14} />
              {starting ? 'Starting...' : kycStatus === 'failed' ? 'Try Again' : 'Verify Identity'}
            </button>
          )}

          {kycStatus === 'pending' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchStatus(false)}
                disabled={checking}
                className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checking ? 'Checking...' : 'Check status'}
              </button>
              {checking && (
                <div className="w-3 h-3 border border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
              )}
              <span className="text-xs text-white/25">Auto-checks every 8s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
