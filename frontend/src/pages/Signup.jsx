import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { loginSuccess } from "../Redux/AuthSlice";
import { useDispatch } from "react-redux";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import AuthLayout from "../Components/Common/AuthLayout";
import { useTranslation } from "react-i18next";
import { useGlobalEmailWallet } from "../context/EmailWalletContext";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });

  // Wallet modal state — address only; key export lives in Profile settings.
  // For non-custodial signups the address arrives a moment after login (the
  // embedded wallet is created client-side), so the modal starts in a
  // "creating" state and fills in from the wallet context.
  const [walletModal, setWalletModal] = useState(null); // { walletAddress: string | null }
  const { emailWalletAddress } = useGlobalEmailWallet();
  const modalAddress = walletModal?.walletAddress || emailWalletAddress || null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 20) {
      toast.error("Password must be between 8 and 20 characters");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/signup`, {
        FullName: formData.fullName,
        Email: formData.email,
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword,
      });
      if (res.status === 201) {
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token, isLoggedInUser: true }));
        localStorage.setItem("token", res.data.token);
        if (formData.fullName.trim()) {
          localStorage.setItem("hypertek_display_name", formData.fullName.trim().toUpperCase());
        }
        setWalletModal({ walletAddress: res.data.user.WalletAddress || null });
      } else {
        toast.error(res.data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || (error.message === "Network Error" ? "Network Error: Could not connect to the server." : "An unexpected error occurred during signup.");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {loading && <FullScreenLoader />}

      {/* Wallet Info Modal — shows the new wallet's address only. Key export
          lives in Profile settings, never on the signup screen. */}
      {walletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#0f0f1a] border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-1">{t("auth.walletReady")}</h2>
            <p className="text-gray-400 text-sm mb-4">{t("auth.walletReadyDesc")}</p>

            {/* Wallet Address */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">{t("auth.walletAddress")}</p>
              {modalAddress ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono text-blue-400 break-all">{modalAddress}</span>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(modalAddress); toast.success("Copied!"); }}
                    className="text-gray-400 hover:text-white shrink-0"
                  >
                    <FiCopy size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-1">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-400/40 border-t-blue-400 animate-spin" />
                  <span className="text-sm text-blue-300/80">{t("auth.walletCreating", "Creating your secure wallet...")}</span>
                </div>
              )}
            </div>

            {/* Self-custody note */}
            <div className="bg-blue-500/10 border border-blue-500/25 rounded-lg p-3">
              <p className="text-blue-300/90 text-xs leading-relaxed">
                {t("auth.walletKeyNote", "This wallet belongs to you. Your address is always available in your Profile, where you can also export your private key if you ever need it. Never share that key with anyone.")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setWalletModal(null); navigate("/"); }}
              className="w-full mt-4 py-2 bg-[#002AA8] hover:bg-[#003BD4] text-white text-sm font-semibold rounded-lg transition-all"
            >
              {t("auth.walletContinue", "Continue")}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold">{t("auth.signUp")}</h1>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="relative">
          <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t("auth.fullNamePlaceholder")}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all text-sm"
            required
          />
        </div>

        {/* Email */}
        <div className="relative">
          <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("auth.emailPlaceholder")}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 transition-all text-sm"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t("auth.passwordPlaceholder")}
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 transition-all text-sm"
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 transition-all text-sm"
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 border border-white/10 text-sm"
        >
          {loading ? t("auth.creatingAccount") : t("auth.signUpBtn")}
        </button>
      </form>

      {/* Already have account */}
      <p className="text-white/50 text-sm text-center mt-4">
        {t("auth.alreadyAccount")}{" "}
        <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          {t("auth.signInLink")}
        </Link>
      </p>

    </AuthLayout>
  );
}

export default Signup;
