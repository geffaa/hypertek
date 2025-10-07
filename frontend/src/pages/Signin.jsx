import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { loginSuccess } from "../Redux/AuthSlice";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../assets/images/logo.png";
import discard from "../assets/images/login/discard.png";
import skype from "../assets/images/login/skipe.png";
import symbol from "../assets/images/login/Symbol.svg.png";
import CustomButtonLarge from "../Components/Buttons/SignupButton";
import GlowingOrb from "../Components/Common/BgColoring";
import { ethers } from "ethers";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // ---------------- Email/Password ----------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
    try {
      const res = await axios.post("http://localhost:3000/api/v1/user/login", {
        Email: formData.email,
        Password: formData.password,
      }); 

      dispatch(
        loginSuccess({
          user: res.data.user,
          token: res.data.token,
          isLoggedInUser: true,
        })
      );
      localStorage.setItem("token", res.data.token);
      toast.success("Login successful!");

      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // ---------------- Google Login ----------------
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:3000/api/v1/user/google", {
        token: credentialResponse.credential,
      });

      dispatch(
        loginSuccess({
          user: res.data.user,
          token: res.data.token,
          isLoggedInUser: true,
        })
      );
      localStorage.setItem("token", res.data.token);
      toast.success("Google login successful!");

      navigate("/profile");
    } catch (err) {
      toast.error("Google login failed!");
    }
  };

  // ---------------- Discord Login ----------------
  const DISCORD_CLIENT_ID = "1423260002587639828";
  const REDIRECT_URI = "http://localhost:5173/signin";
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify%20email`;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) return;

    // Clean URL immediately to prevent re-triggers
    window.history.replaceState({}, document.title, "/login");

    const fetchDiscordUser = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/v1/user/discord",
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
            `Discord login successful! Welcome ${res.data.user.FullName}`
          );
          navigate("/profile");
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

 const handleLogin = async () => {
  try {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed!");
      return;
    }

    console.log("MetaMask detected, requesting accounts...");

    // ✅ STEP 1: Clear previous permissions
    try {
      await window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });
      console.log("Previous permissions cleared");
    } catch (error) {
      console.log("No previous permissions to clear");
    }

    // ✅ STEP 2: Request fresh connection
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    console.log("Accounts granted:", accounts);
    const address = accounts[0];
    console.log("Address:", address);

    // ✅ STEP 3: Use a simpler message format
    const message = `Login to MyApp - ${Date.now()}`;
    console.log("Signing message:", message);

    console.log("Requesting signature via personal_sign...");

    // ✅ STEP 4: Add manual popup trigger
    // Sometimes we need to trigger MetaMask manually
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
        method: 'personal_sign',
        params: [ethers.hexlify(ethers.toUtf8Bytes(message)), address],
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Signature timeout - Click MetaMask icon if popup not visible")), 20000)
      )
    ]);

    console.log("✅ Signature received:", signature);

    // Continue with backend...
    const res = await axios.post(
      "http://localhost:3000/api/v1/user/MetaMask",
      { 
        address: address.toLowerCase(),
        signature, 
        message 
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Backend response:", res.data);

    dispatch(
      loginSuccess({
        user: res.data.user,
        token: res.data.token,
        isLoggedInUser: true,
      })
    );
    localStorage.setItem("token", res.data.token);

    toast.success("MetaMask login successful!");
    navigate("/profile");

  } catch (err) {
    console.error("MetaMask login error:", err);
    
    if (err.message?.includes("timeout")) {
      toast.error(
        <div>
          <strong>MetaMask Popup Issue!</strong><br/>
          1. Click the MetaMask icon in your browser<br/>
          2. Look for pending signature requests<br/>
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



  return (
    <div className="flex flex-col relative z-10 items-center justify-center min-h-screen px-4 bg-transparent mt-8">
      <GlowingOrb Xaxis={70} Yaxis={150} />
      <GlowingOrb Xaxis={950} Yaxis={450} />

      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] h-[550px] max-w-md sm:max-w-sm">
        <img
          src={Logo}
          alt="Logo"
          className="w-[67px] h-[67px] sm:w-[50px] sm:h-[50px]"
        />
        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center">
          Welcome Back!
        </h1>
        <p className="text-white text-sm mb-6 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>

        {/* Email/Password Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative w-full max-w-[412px]">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full pl-10 pr-3 rounded-2xl border border-white text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
              style={{ height: "48px" }}
            />
          </div>

          <div className="relative w-full max-w-[412px]">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-10 rounded-2xl border border-white text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
              style={{ height: "48px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="w-full text-right">
            <Link
              to="/forgot-password"
              className="text-blue-400 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center text-white font-semibold rounded-lg transition"
          >
            <CustomButtonLarge text="Sign In" />
          </button>
        </form>

        <div className="flex items-center w-full my-2">
          <hr className="flex-grow border-t border-white/40" />
          <span className="mx-2 text-white/70 text-sm">or continue with</span>
          <hr className="flex-grow border-t border-white/40" />
        </div>

        <div className="flex justify-center gap-4">
          <button className="p-1 rounded-full border border-white transition">
            <img src={skype} alt="Skype" className="w-6 h-6" />
          </button>

          <button
            className="p-1 rounded-full border border-white transition"
            onClick={() => (window.location.href = discordAuthUrl)}
          >
            <img src={discard} alt="Discord" className="w-6 h-6" />
          </button>

          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => toast.error("Google login failed!")}
            useOneTap={false}
            theme="filled_blue"
            size="large"
            shape="circle"
            type="icon"
          />

          <button
            type="button"
            className="p-1 rounded-full border border-white transition cursor-pointer"
            onClick={handleLogin}
          >
            <img src={symbol} alt="MetaMask" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
