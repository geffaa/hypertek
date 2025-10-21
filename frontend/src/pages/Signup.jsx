import React, { useState, useEffect } from "react";
import Logo from "../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import CustomButtonLarge from "../Components/Buttons/SignupButton";
import GlowingOrb from "../Components/Common/BgColoring";
import axios from "axios";
import toast from "react-hot-toast";
import { loginSuccess } from "../Redux/AuthSlice";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";

import symbol from "../assets/images/login/Symbol.svg.png";
import google from "../assets/images/login/google.png";
import skype from "../assets/images/login/skipe.png";
import discard from "../assets/images/login/discard.png";
import { ethers } from "ethers";
import { BACKEND_BASE_URL } from "../Config";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle manual signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 20) {
      toast.error("Password must be between 8 and 20 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/signup`, {
        Email: formData.email,
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword,
      });

      if (res.status === 201) {

            dispatch(
              loginSuccess({
                user: res.data.user,
                token: res.data.token,
                isLoggedInUser: true,
              })
            );
            localStorage.setItem("token", res.data.token);
        toast.success("Signup successful!");
        navigate("/");
      } else {
        toast.error(res.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  
 
  // ---------------- Discord Signup ----------------
  const DISCORD_CLIENT_ID = "1423260002587639828";
  const REDIRECT_URI = "https://hyper-tek-games.deventiatech.com/signin";
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify%20email`;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return;

    window.history.replaceState({}, document.title, "/signin");

    const fetchDiscordUser = async () => {
      try {
        const res = await axios.post(
          `${BACKEND_BASE_URL}/api/v1/user/discord`,
          { code }
        );
        if (res.data.success && res.data.user) {
          dispatch(
            loginSuccess({
              user: res.data.user,
              token: res.data.token,
              isLoggedInUser: true,
            })
          );
          localStorage.setItem("token", res.data.token);
          toast.success(
            `Discord Signup successful! Welcome ${res.data.user.FullName}`
          );
          navigate("/");
        } else {
          toast.error(res.data.message || "Discord login failed!");
        }
      } catch (err) {
        console.error("Discord login error:", err);
        toast.error(err.response?.data?.message || "Discord login failed!");
      }
    };

    fetchDiscordUser();
  }, [dispatch, navigate]);

  // ---------------------- signup with MetaMask -------------------------
  const handleLogin = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask is not installed!");
        return;
      }

      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch {}

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      const message = `Login to MyApp - ${Date.now()}`;

      setTimeout(() => {
        toast.info(
          <div>
            <p>Check for MetaMask popup!</p>
            <p>If not showing, click the MetaMask icon in your browser.</p>
          </div>,
          { duration: 10000 }
        );
      }, 1000);

      const signature = await Promise.race([
        window.ethereum.request({
          method: "personal_sign",
          params: [ethers.hexlify(ethers.toUtf8Bytes(message)), address],
        }),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Signature timeout - Click MetaMask icon if popup not visible"
                )
              ),
            20000
          )
        ),
      ]);

      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/user/MetaMask`,
        { address: address.toLowerCase(), signature, message },
        { headers: { "Content-Type": "application/json" } }
      );

      dispatch(
        loginSuccess({
          user: res.data.user,
          token: res.data.token,
          isLoggedInUser: true,
        })
      );
      localStorage.setItem("token", res.data.token);
      toast.success("MetaMask Signup successful!");
      navigate("/profile");
    } catch (err) {
      console.error("MetaMask login error:", err);
      if (err.message?.includes("timeout")) {
        toast.error(
          <div>
            <strong>MetaMask Popup Issue!</strong>
            <br />
            1. Click the MetaMask icon in your browser
            <br />
            2. Look for pending signature requests
            <br />
            3. Refresh the page and try again
          </div>,
          { duration: 8000 }
        );
      } else if (err.code === 4001) {
        toast.error("Signature cancelled.");
      } else {
        toast.error("Login failed: " + (err.message || "Unknown error"));
      }
    }
  };

  // ---------------- Twitter Login ----------------
  const handleTwitterLogin = async () => {
    // Placeholder: implement Twitter OAuth flow if needed
    toast.info("Twitter login clicked!");
  };



  /// signup with google 
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // tokenResponse.access_token is what Google returns
        // const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/google`, {
        const res = await axios.post(
          // `http://localhost:4700/api/v1/user/google`,
          `${BACKEND_BASE_URL}/api/v1/user/google`,

          {
            token: tokenResponse.access_token, // or response.credential for ID token version
          }
        );

        dispatch(
          loginSuccess({
            user: res.data.user,
            token: res.data.token,
            isLoggedInUser: true,
          })
        );
        localStorage.setItem("token", res.data.token);
        toast.success("Google Signup successful!");
        navigate("/profile");
      } catch (err) {
        console.error("Google login error:", err);
        toast.error(err.response?.data?.message || "Google login failed!");
      }
    },
    onError: () => toast.error("Google login failed!"),
  });

  return (
    <div className="flex flex-col relative z-10 items-center justify-center min-h-screen px-4 bg-transparent mt-12">
      <GlowingOrb Xaxis={70} Yaxis={150} />
      <GlowingOrb Xaxis={950} Yaxis={450} />

      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] max-w-md sm:max-w-sm">
        <img src={Logo} alt="Logo" className="w-[67px] h-[67px] mb-4" />

        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-white text-sm mb-6 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>

        {/* Signup Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full pl-10 pr-3 py-3 rounded-2xl border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 flex items-center justify-center text-white font-semibold rounded-lg transition"
          >
            <CustomButtonLarge text="Sign Up" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-4">
          <hr className="flex-grow border-t border-white/40" />
          <span className="mx-2 text-white/70 text-sm">or continue with</span>
          <hr className="flex-grow border-t border-white/40" />
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center gap-4">
          {/* MetaMask */}
          <button
            type="button"
            className="flex items-center justify-center rounded-full border border-white w-[44px] h-[44px] transition cursor-pointer"
            onClick={handleLogin}
          >
            <img src={symbol} alt="MetaMask" className="w-[23px] h-[22px]" />
          </button>

          {/* Twitter */}
          {/* <button
            className="flex items-center justify-center rounded-full border border-white w-[44px] h-[44px] transition cursor-pointer"
            onClick={handleTwitterLogin}
          >
            <img src={skype} alt="Skype" className="w-6 h-6" />
          </button> */}

          {/* Google */}
       
          <button
            onClick={() => login()}
            className="flex items-center justify-center rounded-full border border-white w-[44px] h-[44px] transition cursor-pointer"
          >
            <img
              src={google}
              alt="Google"
              className="w-6 h-6" 
            />
          </button>

          {/* Discord */}
          <button
            className="flex items-center justify-center rounded-full border border-white w-[44px] h-[44px] transition"
            onClick={() => (window.location.href = discordAuthUrl)}
          >
            <img src={discard} alt="Discord" className="w-[23px] h-[22px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
