import React, { useState } from "react";
import InfoIcon from "../assets/images/info.png";
import symbol from "../assets/images/login/Symbol.svg.png"; // Wallet icon

function WalletConnect() {
  const [isVisible, setIsVisible] = useState(true);
  const [isSecondModalView, setIsSecondModalView] = useState(false);

  const closeFirstModal = () => setIsVisible(false);

  const handleOnclickFirst = () => {
    setIsVisible(false);
    setIsSecondModalView(true);
  };

  const closeSecondModal = () => {
    setIsSecondModalView(false);
    setIsVisible(true); // ✅ reopen first modal
  };

  return (
    <>
      {/* First Modal */}
      {isVisible && (
        <div className="fixed inset-0 flex items-start justify-center z-30 pt-24 px-4 bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative text-white">
            <button
              onClick={closeFirstModal}
              className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
            >
              ×
            </button>

            <h2 className="text-white text-lg font-bold text-center my-4">
              Connect Wallet
            </h2>
            <hr className="border-t border-gray-600 my-4" />

            {/* Large Screen */}
            <button onClick={handleOnclickFirst}>
              <div className="hidden md:flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20 w-[25rem]">
                <img src={symbol} alt="Connect wallet" className="w-10 h-10 object-contain" />
                <h1 className="text-white font-medium text-lg">MetaMask</h1>
              </div>
            </button>

            {/* Small Screen */}
            <button onClick={handleOnclickFirst}>
              <div className="flex md:hidden items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20 w-[15rem] max-w-[25rem] mx-auto">
                <img src={symbol} alt="Connect wallet" className="w-10 h-10 object-contain" />
                <h1 className="text-white font-medium text-lg">MetaMask</h1>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Warning Section */}
      {isVisible && (
        <div className="mt-[26rem] px-5 py-4 border-2 rounded-[2rem] border-blue-500 max-w-md mx-4 sm:mx-auto">
          <div className="flex items-start gap-3 p-4 rounded mb-4">
            <div className="flex-shrink-0 rounded-full p-1 flex items-center justify-center">
              <img src={InfoIcon} alt="Info" className="w-6 h-6" />
            </div>
            <p className="text-sm sm:text-base text-white font-medium">
              <span className="text-blue-700">HyperTek</span> will never request your seed phrase or private key.
            </p>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-white">What is a crypto wallet?</h2>
          <p className="text-xs sm:text-base font-normal leading-[1.5] text-gray-300">
            A crypto wallet lets you interact with the blockchain. You can use it to buy, sell, or create NFTs. <br />
            We recommend MetaMask.
          </p>
        </div>
      )}

      {/* Second Modal */}
      {isSecondModalView && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 px-4">
          <div className="bg-gray-900 rounded-lg p-4 w-full max-w-xs relative text-white">
            <button
              onClick={closeSecondModal}
              className="absolute top-2 right-2 text-white font-bold text-xl hover:text-gray-300 transition"
            >
              ×
            </button>

            <h2 className="text-white text-base font-bold text-center my-3">Connecting Wallet</h2>
            <hr className="border-t  my-2" />

            <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl mt-3 w-full">
              <img src={symbol} alt="Wallet" className="w-16 h-16 object-contain" />
              <div className="w-8 h-8 relative mt-2">
                <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-solid border-r-transparent border-b-transparent"
                  style={{ transform: "rotate(-230deg)" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WalletConnect;
