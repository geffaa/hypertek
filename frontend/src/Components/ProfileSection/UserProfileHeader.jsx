import React from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import TVector from "../../assets/images/popular/vector.png";
import { BACKEND_BASE_URL } from "../../Config";

function UserProfileHeader({ userData, connectedWallet, sellerBalance }) {
  return (
    <div className="relative w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex flex-col items-start text-white">
      <div className="relative">
        {userData?.Avatar ? (
          <img
            src={`${BACKEND_BASE_URL}${userData.Avatar}`}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-gray-900 object-cover -mt-14"
          />
        ) : (
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg w-28 h-28 border-4 border-gray-900 -mt-14">
            <FaUserCircle className="w-16 h-16 text-white" />
          </div>
        )}
      </div>
      <h2 className="mt-4 text-xl sm:text-2xl font-semibold mb-1">
        {userData?.FullName || userData?.Email?.split("@")[0] || "Guest"}
      </h2>
      <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
        <span className="font-mono">
          {connectedWallet
            ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`
            : "No Wallet Connected"}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Link
          to="/edit"
          state={{ userData }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:brightness-125"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Edit Profile</span>
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:brightness-125"
          style={{
            background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
            border: "1px solid rgba(0,80,255,0.3)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          <span>Dashboard</span>
        </Link>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <img src="/usdc-logo.svg" className="w-4 h-4" alt="USDC" />
          <span className="text-sm font-bold text-white font-mono">
            ${Number(sellerBalance) > 0 ? Number(sellerBalance).toFixed(2) : "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserProfileHeader;
