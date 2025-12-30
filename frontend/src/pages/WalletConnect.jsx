import React, { useState } from "react";
import InfoIcon from "../assets/images/info.png";
import symbol from "../assets/images/login/Symbol.svg.png";

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
    setIsVisible(true);
  };

  return (
    <>
     {/* FIRST POPUP */}
{isVisible && (
  <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/40">

    {/* Connect Wallet Modal */}
    <div className="
      absolute top-[20%] left-1/2 -translate-x-1/2
      bg-[#2b3442]
      w-[350px]
      rounded-xl
      text-white
      shadow-xl
    ">
      <button
        onClick={closeFirstModal}
        className="absolute top-3 right-3 text-lg opacity-80 hover:opacity-100"
      >
        ×
      </button>

      <div className="px-5 py-5">
        <h2 className="text-center font-semibold text-[16px]">
          Connect Wallet
        </h2>

        <div className="h-px bg-white/15 my-5" />

        <button
          onClick={handleOnclickFirst}
          className="
            mx-auto
            flex items-center justify-center gap-2
            border border-white/40
            rounded-lg
            px-7 py-2
            text-sm
            hover:bg-white/5
            transition
          "
        >
          <img src={symbol} alt="MetaMask" className="w-5 h-5" />
          <span className="font-medium">MetaMask</span>
        </button>
      </div>
    </div>


          {/* Warning Box */}
          <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 w-[640px] /60 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <img src={InfoIcon} alt="info" className="w-5 h-5" />
              <p className="text-sm text-blue-400">
                HyperTek will never request your seed phrase or private key.
              </p>
            </div>

            <div className="border border-blue-500 rounded-xl px-4 py-3">
  <h3 className="font-semibold mb-1">
    What is a crypto wallet?
  </h3>

  <p className="text-sm text-gray-300 leading-relaxed">
    A crypto wallet lets you interact with the blockchain. You can use
    it to buy, sell or create NFTs.
    <br />
    We recommend MetaMask.
  </p>
</div>

          </div>
        </div>
      )}

    {/* SECOND POPUP */}
{isSecondModalView && (
  <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/40 flex items-center justify-center">

    <div className="
      bg-[#2b3442]
      w-[360px]
      rounded-xl
      text-white
      relative
      px-6
      py-5
      shadow-xl
    ">
      <button
        onClick={closeSecondModal}
        className="absolute top-3 right-3 text-lg opacity-80 hover:opacity-100"
      >
        ×
      </button>

      <h2 className="text-center font-semibold text-[15px] mb-4">
        Connecting to Wallet
      </h2>

      <div className="h-px bg-white/15 mb-6" />

      <div className="flex flex-col items-center gap-4">
        {/* Wallet Icon */}
        <img
          src={symbol}
          alt="wallet"
          className="w-14 h-14"
        />

        <p className="text-sm font-medium opacity-90">
          Sign Message
        </p>

        {/* Loader */}
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
