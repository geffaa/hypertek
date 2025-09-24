import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import sendImg from "../assets/images/send.png"; 
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Forgot Password Email:", email);
    // Add your forgot password logic here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-transparent mt-8">
      {/* Container */}
      <div className="rounded-lg flex flex-col items-center justify-center p-8 gap-4 md:w-[412px] h-[420px] max-w-md sm:max-w-sm">
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          className="w-[67px] h-[67px] sm:w-[50px] sm:h-[50px]"
        />

        {/* Title */}
        <h1 className="text-white text-3xl sm:text-2xl font-bold text-center">
          Forgotten Password
        </h1>

        <p className="text-white text-sm mb-6 text-center">
          Enter your email address
        </p>

        {/* Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email Input */}
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

          {/* Send Button */}
          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center text-white font-semibold rounded-lg transition"
          >
            <img
              src={sendImg}
              alt="Send"
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

export default ForgotPassword;
