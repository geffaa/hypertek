import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import AuthLayout from "../Components/Common/AuthLayout";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/reset-password/${token}`, {
        Password: formData.password,
        ConfirmPassword: formData.confirmPassword,
      });
      if (res.status === 200) {
        toast.success("Password reset successful! Please login.");
        setFormData({ password: "", confirmPassword: "" });
        navigate("/signin");
      } else {
        toast.error(res.data.message || "Reset password failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {loading && <FullScreenLoader />}

      {/* Header */}
      <div className="mb-8">
        <Link to="/signin" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors">
          <FaArrowLeft className="text-xs" /> Back to Sign In
        </Link>
        <h1 className="text-white text-3xl font-bold">Reset Password</h1>
        <p className="text-white/50 text-sm mt-2">Enter your new password below.</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* New Password */}
        <div className="relative">
          <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New Password"
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

        {/* Password hint */}
        <p className="text-white/30 text-xs -mt-1">Password must be 8–20 characters.</p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 border border-white/10 text-sm"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
