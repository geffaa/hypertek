import React from 'react';
import { Link } from 'react-router-dom';
import MetaMask from "../assets/images/metamask.svg";

function Wellcome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 px-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 bg-gray-900 rounded-xl p-6 text-white">
        {/* MetaMask Logo */}
        <img src={MetaMask} alt="MetaMask" className="w-20 h-20 object-contain" />

        {/* Welcome Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Welcome Back</h1>

        {/* Password Input */}
      <input
  type="password"
  placeholder="Enter your password"
  className="w-full px-4 py-2 rounded-lg text-white bg-transparent placeholder-gray-400 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>



        {/* Unblock Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-2 rounded-lg">
          Unblock
        </button>

        {/* Forgotten Password Link */}
        <Link
          to="/wallet-forgot-password"
          className="text-blue-400 hover:underline text-sm sm:text-base"
        >
          Forgotten password
        </Link>

        {/* Help/Support */}
        <p className="text-sm sm:text-base text-gray-400 text-center">
          Need help? Contact{" "}
          <a
            href="https://metamask.io/support.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            MetaMask Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default Wellcome;
