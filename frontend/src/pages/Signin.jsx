import React, { useState } from "react";
import Logo from "../assets/images/logo.png";
import discard from "../assets/images/login/discard.png";
import google from "../assets/images/login/google.png";
import skype from "../assets/images/login/skipe.png";
import symbol from "../assets/images/login/Symbol.svg.png";
import CustomButtonLarge from "../Components/Buttons/SignupButton";
import GlowingOrb from "../Components/Common/BgColoring";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Redux/AuthSlice";
import { GoogleLogin } from "@react-oauth/google"; // ✅ use GoogleLogin instead of useGoogleLogin

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Email/Password login
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

      if (res.status === 200) {
        dispatch(
          loginSuccess({
            user: res.data.user,
            token: res.data.token,
            isLoggedInUser: true,
          })
        );
        localStorage.setItem("token", res.data.token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Google login
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      console.log("Google ID Token:", credentialResponse.credential);

      // Send ID token to backend
      const res = await axios.post("http://localhost:3000/api/v1/user/google", {
        token: credentialResponse.credential, // 👈 backend expects "token"
      });

      if (res.status === 200) {
        dispatch(
          loginSuccess({
            user: res.data.user,
            token: res.data.token,
            isLoggedInUser: true,
          })
        );
        localStorage.setItem("token", res.data.token);
        toast.success("Google login successful!");
        
        navigate("/");
      } else {
        toast.error(res.data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Error sending token to backend:", error);
      toast.error("Google login failed!");
    }
  };

  return (
    <div className="flex flex-col relative z-10 items-center justify-center min-h-screen px-4 bg-transparent mt-8">
      <GlowingOrb Xaxis={70} Yaxis={150} />
      <GlowingOrb Xaxis={950} Yaxis={450} />

      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] h-[550px] max-w-md sm:max-w-sm">
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          className="w-[67px] h-[67px] sm:w-[50px] sm:h-[50px]"
        />

        {/* Title */}
        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center">
          Welcome Back!
        </h1>

        <p className="text-white text-sm mb-6 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>

        {/* Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
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

          {/* Password */}
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

          {/* Forgot Password */}
          <div className="w-full text-right">
            <Link
              to="/forgot-password"
              className="text-blue-400 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center text-white font-semibold rounded-lg transition"
          >
            <CustomButtonLarge text="Sign In" />
          </button>
        </form>

        {/* Or continue with */}
        <div className="flex items-center w-full my-2">
          <hr className="flex-grow border-t border-white/40" />
          <span className="mx-2 text-white/70 text-sm">or continue with</span>
          <hr className="flex-grow border-t border-white/40" />
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-4">
          <button className="p-1 rounded-full border border-white transition">
            <img src={skype} alt="Skype" className="w-6 h-6" />
          </button>
          <button className="p-1 rounded-full border border-white transition">
            <img src={discard} alt="Discord" className="w-6 h-6" />
          </button>

          {/* ✅ Google Custom Button with ID Token */}
          {/* Social Icons */}
          <div className="flex justify-center gap-4">
            {/* ✅ Proper Google Login Button */}
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                toast.error("Google login failed!");
              }}
              useOneTap={false}
              theme="filled_blue"
              size="large"
              shape="circle"
              type="icon"
            />
          </div>

          <button className="p-1 rounded-full border border-white transition">
            <img src={symbol} alt="Symbol" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
