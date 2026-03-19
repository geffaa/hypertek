import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Redux/AuthSlice";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useGoogleLogin } from "@react-oauth/google";
import { ethers } from "ethers";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import AuthLayout from "../Components/Common/AuthLayout";

import discard from "../assets/images/login/discard.png";
import symbol from "../assets/images/login/Symbol.svg.png";
import google from "../assets/images/login/google.png";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/login`, {
        Email: formData.email,
        Password: formData.password,
      });
      const { user, token } = res.data || {};
      localStorage.setItem("authData", JSON.stringify(res.data));
      dispatch(loginSuccess({ user, token, isLoggedInUser: true }));
      if (token) localStorage.setItem("token", token);
      if (user?.Role) localStorage.setItem("role", user.Role);

      if (user?.Role === "admin") {
        const adminBaseUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";
        const adminUrl = new URL(`${adminBaseUrl}/${user.id}`);
        if (token) adminUrl.searchParams.set("token", token);
        toast.success("Admin login successful!");
        window.location.href = adminUrl.toString();
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (err.message === "Network Error" ? "Network Error: Could not connect to the server." : "An unexpected error occurred during login.");
      toast.error(errorMessage);
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
        toast.success("Google Login successful!");
        navigate("/");
      } catch (err) {
        toast.error(err.response?.data?.message || "An unexpected error occurred during Google login.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => { toast.error("Google login was unsuccessful or cancelled."); setLoading(false); },
  });

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
          toast.success(`Discord login successful! Welcome ${res.data.user.FullName}`);
          navigate("/");
        } else {
          toast.error(res.data.message || "Discord login failed.");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "An unexpected error occurred during Discord login.");
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
      toast.success("MetaMask login successful!");
      navigate("/");
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold">Sign in</h1>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="relative">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-base" />
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

        {/* Forgot password */}
        <div className="text-right -mt-1">
          <Link to="/forgot-password" className="text-white/50 hover:text-white text-xs transition-colors">
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 border border-white/10 text-sm"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Don't have account */}
      <p className="text-white/50 text-sm text-center mt-4">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Sign up
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

export default Login;
