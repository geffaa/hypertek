import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiCopy, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { loginSuccess } from "../Redux/AuthSlice";
import { useDispatch } from "react-redux";
import { ethers } from "ethers";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import AuthLayout from "../Components/Common/AuthLayout";
import { useTranslation } from "react-i18next";

import symbol from "../assets/images/login/Symbol.svg.png";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });

  // Wallet modal state
  const [walletModal, setWalletModal] = useState(null); // { walletAddress, password }
  const [privateKey, setPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [pkPassword, setPkPassword] = useState("");
  const [revealLoading, setRevealLoading] = useState(false);
  const [signupToken, setSignupToken] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRevealPrivateKey = async (e) => {
    e.preventDefault();
    setRevealLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/user/export-wallet`,
        { password: pkPassword },
        { headers: { Authorization: `Bearer ${signupToken}` } }
      );
      setPrivateKey(res.data.PrivateKey);
      setPkPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect password.");
    } finally {
      setRevealLoading(false);
    }
  };

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
        setSignupToken(res.data.token);
        setWalletModal({ walletAddress: res.data.user.WalletAddress, password: formData.password });
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

  // MetaMask
  const handleMetaMask = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) { toast.error("MetaMask is not installed!"); return; }
      try { await window.ethereum.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] }); } catch {}
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      const message = `Login to MyApp - ${Date.now()}`;
      setTimeout(() => toast.info("Check for MetaMask popup!", { duration: 10000 }), 1000);
      const signature = await Promise.race([
        window.ethereum.request({ method: "personal_sign", params: [ethers.hexlify(ethers.toUtf8Bytes(message)), address] }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Signature timeout")), 20000)),
      ]);
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/MetaMask`, { address: address.toLowerCase(), signature, message }, { headers: { "Content-Type": "application/json" } });
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token, isLoggedInUser: true }));
      localStorage.setItem("token", res.data.token);
      toast.success("MetaMask Signup successful!");
      navigate("/profile");
    } catch (err) {
      if (err.code === 4001) toast.error("Signature cancelled.");
      else toast.error(err.response?.data?.message || err.message || "MetaMask error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthLayout>
      {loading && <FullScreenLoader />}

      {/* Wallet Info Modal */}
      {walletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#0f0f1a] border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-1">{t("auth.walletReady")}</h2>
            <p className="text-gray-400 text-sm mb-4">{t("auth.walletReadyDesc")}</p>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-xs font-semibold">
                {t("auth.walletWarning")}
              </p>
            </div>

            {/* Wallet Address */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">{t("auth.walletAddress")}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono text-blue-400 break-all">{walletModal.walletAddress}</span>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(walletModal.walletAddress); toast.success("Copied!"); }}
                  className="text-gray-400 hover:text-white shrink-0"
                >
                  <FiCopy size={15} />
                </button>
              </div>
            </div>

            {/* Private Key Section */}
            {!privateKey ? (
              <form onSubmit={handleRevealPrivateKey} className="space-y-2">
                <p className="text-xs text-gray-400">{t("auth.enterPasswordReveal")}</p>
                <div className="relative">
                  <input
                    type={showPrivateKey ? "text" : "password"}
                    value={pkPassword}
                    onChange={(e) => setPkPassword(e.target.value)}
                    placeholder={t("auth.reEnterPassword")}
                    className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-blue-500/60"
                    required
                  />
                  <button type="button" onClick={() => setShowPrivateKey(!showPrivateKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPrivateKey ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={revealLoading}
                  className="w-full py-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  {revealLoading ? t("auth.verifying") : t("auth.revealPrivateKey")}
                </button>
              </form>
            ) : (
              <div className="bg-black/40 border border-white/10 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-400 mb-1">{t("auth.privateKeyLabel")}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-green-400 break-all">{showPrivateKey ? privateKey : "•".repeat(32)}</span>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => setShowPrivateKey(!showPrivateKey)} className="text-gray-400 hover:text-white">
                      {showPrivateKey ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(privateKey); toast.success("Private key copied!"); }} className="text-gray-400 hover:text-white">
                      <FiCopy size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setWalletModal(null); navigate("/"); }}
              className="w-full mt-4 py-2 border border-white/15 text-white/70 hover:text-white text-sm rounded-lg transition-all"
            >
              {t("auth.savedWalletContinue")}
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

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/40 text-xs">{t("auth.orContinueWith")}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* OAuth buttons */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={handleMetaMask}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition-all"
          title="MetaMask"
        >
          <img src={symbol} alt="MetaMask" className="w-5 h-5" />
        </button>
        {/* Google & Discord — coming soon
        <button type="button" onClick={() => loginWithGoogle()} title="Google"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition-all">
          <img src={google} alt="Google" className="w-5 h-5" />
        </button>
        <button type="button" onClick={() => (window.location.href = discordAuthUrl)} title="Discord"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition-all">
          <img src={discard} alt="Discord" className="w-5 h-5" />
        </button>
        */}
      </div>
    </AuthLayout>
  );
}

export default Signup;
