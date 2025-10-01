import React, { useState } from "react";
import Logo from "../assets/images/logo.png";
import loginImg from "../assets/images/login/login.png";

import discard from "../assets/images/login/discard.png";
import google from "../assets/images/login/google.png";
import skype from "../assets/images/login/skipe.png";
import symbol from "../assets/images/login/Symbol.svg.png";
import CustomButtonLarge from "../Components/Buttons/SignupButton";
import GlowingOrb from "../Components/Common/BgColoring";

import { Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", formData);
    // Add your login logic here
  };

  return (
    <div className="flex flex-col relative z-10 items-center justify-center min-h-screen px-4 bg-transparent mt-8">
      {/* Login Container */}
  <GlowingOrb Xaxis={70} Yaxis={150}/>
     <GlowingOrb Xaxis={950} Yaxis={450}/>

      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] h-[450px] max-w-md sm:max-w-sm">
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
          {/* Name */}
          <div className="relative w-full max-w-[412px]">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
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
            <CustomButtonLarge text="Sign In"/>
          </button>
        </form>

        {/* Signup Text */}
        <h1 className="flex items-center text-white text-2xl">Signup</h1>

        {/* Or continue with */}
        <div className="flex items-center w-full my-2">
          <hr className="flex-grow border-t border-white/40" />
          <span className="mx-2 text-white/70 text-sm">or continue with</span>
          <hr className="flex-grow border-t border-white/40" />
        </div>

        {/* Social Images */}
        <div className="flex justify-center gap-4">
          <button className="p-1 rounded-full border border-white  transition">
            <img src={skype} alt="Skype" className="w-6 h-6" />
          </button>
          <button className="p-1 rounded-full border border-white  transition">
            <img src={discard} alt="Discord" className="w-6 h-6" />
          </button>
          <button className="p-1 rounded-full border border-white  transition">
            <img src={google} alt="Google" className="w-6 h-6" />
          </button>
          <button className="p-1 rounded-full border border-white  transition">
            <img src={symbol} alt="Symbol" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
