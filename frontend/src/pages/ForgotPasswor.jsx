import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import AuthLayout from "../Components/Common/AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/user/forgot-password`, { Email: email });
      if (res.status === 200) {
        toast.success("Password reset email sent! Check your inbox.");
        setSent(true);
        setEmail("");
      } else {
        toast.error(res.data.message || "Something went wrong");
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
        <h1 className="text-white text-3xl font-bold">Forgot Password</h1>
        <p className="text-white/50 text-sm mt-2">
          {sent
            ? "Check your inbox for a reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      {!sent ? (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative">
            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/60 transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 border border-white/10 text-sm"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            Reset link sent! Please check your email inbox.
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Didn't receive it? Send again
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
