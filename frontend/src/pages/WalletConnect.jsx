import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoIcon from "../assets/images/info.webp";
import symbol from "../assets/images/login/Symbol.svg.webp";

function WalletConnect() {
  const [isVisible, setIsVisible] = useState(true);
  const [isSecondModalView, setIsSecondModalView] = useState(false);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const navigate = useNavigate();

  //  Close & redirect
  const closeAndGoToNfa = () => {
    setIsVisible(false);
    setIsSecondModalView(false);
    navigate("/nfa-expand");
  };

  // 🔹 MetaMask Connect Function (UNCHANGED)
  const connectMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      alert("MetaMask is not installed");
      return;
    }

    if (isConnecting) return;

    try {
      setIsConnecting(true);

      // 🔹 FORCE MetaMask popup EVERY time
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // 🔹 THEN request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);

        setIsVisible(false);
        setIsSecondModalView(true);

        setTimeout(() => {
          setIsSecondModalView(false);
          navigate("/nfa-expand");
        }, 1000);
      }
    } catch (err) {
      console.error("MetaMask error:", err);
      setIsSecondModalView(false);
      setIsVisible(true);
    } finally {
      setIsConnecting(false);
    }
  };



  return (
    <>
      {/* FIRST POPUP */}
      {isVisible && (
        <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center p-4">
          <div className="relative bg-[#2b3442] w-full max-w-[350px] text-white shadow-xl rounded-xl overflow-hidden">
            <button
              onClick={closeAndGoToNfa}
              className="absolute top-3 right-3 text-lg opacity-80 hover:opacity-100 z-10"
            >
              ×
            </button>

            <div className="px-5 py-8">
              <h2 className="text-center font-semibold text-[18px]">
                Connect Wallet
              </h2>

              <div className="h-px bg-white/15 my-5" />

              <button
                onClick={connectMetaMask}
                className="w-full flex items-center justify-center gap-3 border border-white/20 rounded-xl px-7 py-3 text-sm hover:bg-white/5 transition bg-white/5"
              >
                <img src={symbol} alt="MetaMask" className="w-6 h-6" />
                <span className="font-semibold">MetaMask</span>
              </button>
            </div>
          </div>

          {/* Warning Box */}
          <div className="mt-8 w-full max-w-[640px] text-white">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <img src={InfoIcon} alt="info" className="w-5 h-5" />
              <p className="text-sm text-blue-400">
                Hyper Tek will never request your seed phrase or private key.
              </p>
            </div>

            <div className="border border-blue-500/30 bg-blue-500/5 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-1">What is a crypto wallet?</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                A crypto wallet lets you interact with the blockchain.
                We recommend MetaMask.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECOND POPUP */}
      {isSecondModalView && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/40 flex items-center justify-center">
          <div className="bg-[#2b3442] w-[90%] sm:w-[360px] rounded-xl text-white relative px-6 py-5 shadow-xl">
            <button
              onClick={closeAndGoToNfa}
              className="absolute top-3 right-3 text-lg opacity-80 hover:opacity-100"
            >
              ×
            </button>

            <h2 className="text-center font-semibold text-[15px] mb-4">
              Connecting to Wallet
            </h2>

            <div className="h-px bg-white/15 mb-6" />

            <div className="flex flex-col items-center gap-4">
              <img src={symbol} alt="wallet" className="w-14 h-14" />

              <p className="text-sm font-medium opacity-90">
                {account
                  ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                  : "Waiting for confirmation"}
              </p>

              <div className="w-8 h-8 relative mt-1">
                <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-r-transparent border-b-transparent"
                  style={{ transform: "rotate(-225deg)" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WalletConnect;





