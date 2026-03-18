import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { loginSuccess } from "../Redux/AuthSlice";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { ethers } from "ethers";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import AuthLayout from "../Components/Common/AuthLayout";

import symbol from "../assets/images/login/Symbol.svg.png";
import google from "../assets/images/login/google.png";
import discard from "../assets/images/login/discard.png";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });

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
        Email: formData.email,
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword,
      });
      if (res.status === 201) {
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token, isLoggedInUser: true }));
        localStorage.setItem("token", res.data.token);
        toast.success("Signup successful!");
        navigate("/");
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

  // Discord
  const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || "1423260002587639828";
  const REDIRECT_URI = `${window.location.origin}/signin`;
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return;
    window.history.replaceState({}, document.title, "/signin");
    const fetchDiscordUser = async () => {
      setLoading(true);
      try {
        const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/discord`, { code });
        if (res.data.success && res.data.user) {
          dispatch(loginSuccess({ user: res.data.user, token: res.data.token, isLoggedInUser: true }));
          localStorage.setItem("token", res.data.token);
          toast.success(`Discord Signup successful! Welcome ${res.data.user.FullName}`);
          navigate("/");
        } else {
          toast.error(res.data.message || "Discord signup failed.");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "An unexpected error occurred during Discord signup.");
      } finally {
        setLoading(false);
      }
    };
    fetchDiscordUser();
  }, [dispatch, navigate]);

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

  // Google
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/google`, { token: tokenResponse.access_token });
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token, isLoggedInUser: true }));
        localStorage.setItem("token", res.data.token);
        toast.success("Google Signup successful!");
        navigate("/profile");
      } catch (err) {
        toast.error(err.response?.data?.message || "An unexpected error occurred during Google signup.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => { setLoading(false); toast.error("Google signup was unsuccessful or cancelled."); },
  });

  return (
    <AuthLayout>
      {loading && <FullScreenLoader />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold">Sign up</h1>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="relative">
          <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type="text"
            placeholder="Name"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all text-sm"
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
            placeholder="Email"
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
            placeholder="Password"
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
            placeholder="Confirm Password"
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
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {/* Already have account */}
      <p className="text-white/50 text-sm text-center mt-4">
        Already have an account?{" "}
        <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Sign in
        </Link>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/40 text-xs">Or continue with</span>
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
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition-all"
          title="Google"
        >
          <img src={google} alt="Google" className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = discordAuthUrl)}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition-all"
          title="Discord"
        >
          <img src={discard} alt="Discord" className="w-5 h-5" />
        </button>
      </div>
    </AuthLayout>
  );
}

export default Signup;
