import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";
import GlowingOrb from "../Components/Common/BgColoring";
import axios from "axios";
import toast from "react-hot-toast";
import CustomButton from "../Components/Buttons/Button1";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/forgot-password",
        { Email: email }
      ); 

      if (res.status === 200) {
        toast.success("Password reset email sent! Check your inbox.");
        setEmail(""); // clear input
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Forgot Password error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-transparent mt-8">
      <GlowingOrb Xaxis={70} Yaxis={150}/>
      <GlowingOrb Xaxis={950} Yaxis={450}/>
      
      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] h-[420px] max-w-md sm:max-w-sm">
        <img src={Logo} alt="Logo" className="w-[67px] h-[67px] sm:w-[50px] sm:h-[50px]" />
        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center whitespace-nowrap">Forgotten Password</h1>
        <p className="text-white text-sm mb-6 text-center">Enter your email address</p>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative w-full max-w-[412px]">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-3 py-3 rounded-2xl border border-white text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
              required
              style={{ height: "48px" }}
            />
          </div>

          <button
            type="submit"
            className={`w-full flex items-center justify-center ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            <CustomButton text="Send"/>
          </button>
        </form>

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

export default ForgotPassword;