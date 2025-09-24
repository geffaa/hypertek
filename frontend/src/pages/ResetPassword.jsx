import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import submitImg from "../assets/images/resetpassword.png";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Reset Password Submitted:", formData);
    // Add your reset password logic here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-transparent mt-8">
      {/* Container */}
      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] h-[500px] max-w-md sm:max-w-sm">
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          className="w-[67px] h-[67px] sm:w-[50px] sm:h-[50px]"
        />

        {/* Title */}
        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center">
          Reset Password
        </h1>

        {/* Info Text */}
        <p className="text-white text-sm mb-6 text-center">
          We sent a new password to your email, please check.
        </p>

        {/* Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Password */}
          <div className="relative w-full max-w-[412px]">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password"
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

          {/* Confirm Password */}
          <div className="relative w-full max-w-[412px]">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center text-white font-semibold rounded-lg transition"
          >
            <img
              src={submitImg}
              alt="Submit"
              className="h-10 sm:h-8"
              style={{ height: "40px", width: "266px" }}
            />
          </button>
        </form>

        {/* Back to Login */}
        <Link
          to="/signin"
          className="flex items-center text-blue-400 hover:underline mt-4"
        >
          <FaArrowLeft className="mr-2" /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;
