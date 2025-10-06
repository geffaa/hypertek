import React, { useState } from "react";
import { Link } from "react-router-dom";
import InfoIcon from "../assets/images/info.png";
import symbol from "../assets/images/login/Symbol.svg.png"; // Wallet icon

function WalletConnect() {
  // State to control modal visibility
  const [isVisible, setIsVisible] = useState(true);

  // Close modal function
  const closeModal = () => {
    setIsVisible(false);
  };

  // If modal is closed, render nothing
  if (!isVisible) return null;

  return (
    <>
      {/* Wrapper for modal and warning */}
      <div className="flex flex-col gap-5">
        {/* Main Modal */}
        <div className="fixed inset-0 flex items-start justify-center z-30 pt-24 px-4 bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative text-white">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
            >
              ×
            </button>

            {/* Modal Title */}
            <h2 className="text-white text-lg font-bold text-center my-4">
              Connect Wallet
            </h2>

            <hr className="border-t border-gray-600 my-4" />

            {/* Wallet Options */}
            {/* Large Screen */}
            <Link to="/wallet-connecting">
            <div
            
              className="hidden md:flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20"
            >
              <img src={symbol} alt="Connect wallet" className="w-10 h-10 object-contain" />
              <h1 className="text-white font-medium text-lg">MetaMask</h1>
            </div>
            </Link>

            {/* Small Screen */}
            <Link to="/wallet-connecting" className="md:hidden">
              <div className="flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20">
                <img src={symbol} alt="Connect wallet" className="w-10 h-10 object-contain" />
                <h1 className="text-white font-medium text-lg">MetaMask</h1>
              </div>
            </Link>
          </div>
        </div>

        {/* Warning/Info Section - Only on small screens */}
        <div className="mt-[26rem] px-5 py-4 border-2 rounded-[2rem] border-blue-500 max-w-md mx-4 sm:mx-auto">
          <div className="flex items-start gap-3 p-4 rounded mb-4">
            <div className="flex-shrink-0 rounded-full p-1 flex items-center justify-center">
              <img src={InfoIcon} alt="Info" className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base text-white font-medium">
              <span className="text-blue-700">HyperTek</span> will never request your seed phrase or private key.
            </p>
          </div>

          <h2 className="text-lg sm:text-xl font-bold mb-2 text-white">
            What is a crypto wallet?
          </h2>
          <p className="text-xs sm:text-base font-normal leading-[1.5] text-gray-300">
            A crypto wallet lets you interact with the blockchain. You can use it to buy, sell, or create NFTs.
            <br />
            We recommend MetaMask.
          </p>
        </div>
      </div>
    </>
  );
}

export default WalletConnect;
