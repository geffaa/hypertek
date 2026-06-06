import React from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import TVector from "../../assets/images/popular/vector.webp";
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
    </div>
  );
}

export default UserProfileHeader;
