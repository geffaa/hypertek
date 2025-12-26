import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Logo from "../assets/logo1.png";
import submitImg from "../assets/images/resetpassword.png";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import GlowingOrb from "../Components/Common/BgColoring";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../Config"
import FullScreenLoader from "../Components/Common/Spinner";




function ResetPassword() {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true); // start spinner

  // Password validations
  if (formData.password.length < 8 || formData.password.length > 20) {
    toast.error("Password must be between 8 and 20 characters");
    setLoading(false); // stop spinner if validation fails
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    setLoading(false); // stop spinner if validation fails
    return;
  }

  try {
    const res = await axios.post(
      `${BACKEND_BASE_URL}/api/v1/user/reset-password/${token}`,
      {
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword,
      }
    );

    if (res.status === 200) {
      toast.success("Password reset successful! Please login.");
      setFormData({ password: "", confirmPassword: "" });
      navigate("/signin");
    } else {
      toast.error(res.data.message || "Reset password failed");
    }
  } catch (error) {
    console.error("Reset Password error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false); // stop spinner after API completes
  }
};


  return (
    <div className="flex flex-col items-center relative z-10 justify-center min-h-screen px-4 bg-transparent mt-8">
      <GlowingOrb Xaxis={70} Yaxis={150}/>
      <GlowingOrb Xaxis={950} Yaxis={450}/>

      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[600px] h-[500px] max-w-[650px] sm:max-w-sm">
        {/* Logo */}
        <img src={Logo} alt="Logo" className="w-[67px] h-[67px] sm:w-[50px] sm:h-[50px]" />

        {/* Title */}
        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center">Reset Password</h1>

        {/* Info */}
        <p className="text-white text-[18px] mb-6 text-center w-[600px]">We sent the new password to your email address, please check your email</p>

        {/* Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
           {loading && <FullScreenLoader />}

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

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3 flex items-center justify-center text-white font-semibold rounded-lg transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
  <div className="flex items-center">
      {/* Left small bar */}
      <div
        className="bg-[#4A6CF7] mr-0.5" // lighter blue
        style={{
          width: "0.35rem",
          height: "1.5rem",
        }}
      ></div>

      {/* Left angled border */}
      <div
        className="border-[#4A6CF7]"
        style={{
          width: "0.6rem",
          height: "2.5rem",
          borderStyle: "solid",
          borderWidth: "0.45rem 0.3rem 0.45rem 0",
        }}
      ></div>

      {/* Main button area */}
      <div
        className="flex items-center justify-center text-white font-medium"
        style={{
          width: "12rem",
          height: "2.8rem",
          background: "linear-gradient(180deg, #3156eaff 0%, #2A4AB3 100%)", // softer gradient
          border: "0.2rem solid #4A6CF7",
        }}
      >
        Reset Password
      </div>

      {/* Right angled border */}
      <div
        className="border-[#4A6CF7]"
        style={{
          width: "0.6rem",
          height: "2.5rem",
          borderStyle: "solid",
          borderWidth: "0.3rem 0 0.45rem 0.3rem",
        }}
      ></div>

      {/* Right small bar */}
      <div
        className="bg-[#4A6CF7]"
        style={{
          width: "0.35rem",
          height: "1.4rem",
        }}
      ></div>
    </div>          </button>
        </form>

        {/* Back to login */}
        <Link to="/signin" className="flex items-center text-white  mt-4">
          <FaArrowLeft className="mr-2" /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;
