import React, { useState } from "react";
import MetaMask from "../assets/images/metamask.svg";
import CustomButton from "../Components/Buttons/Button1";
import CustomButton2 from "../Components/Buttons/Button2";
import { IoClose } from "react-icons/io5";

function SigninWallet() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-50 px-4">
      <div className="relative bg-gray-900 rounded-xl p-8 w-full max-w-sm flex flex-col items-center gap-6 text-white shadow-lg">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <IoClose size={24} />
        </button>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-center">
          Connecting to wallet
        </h2>

        {/* Full horizontal line */}
        <hr className="w-full border-t border-gray-500 -mx-8" />

        {/* Wallet Image */}
        <img
          src={MetaMask}
          alt="Wallet Logo"
          className="w-24 h-24 object-contain"
        />

        {/* Sign message */}
        <p className="text-center text-white font-bold">Signin Message</p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full mt-4 items-center">
          {/* Sign Message Button */}
          <CustomButton text="Sign Message" className="w-48 h-12" />

          {/* Cancel Button */}
          <button
            onClick={handleClose}
            className="w-48 h-12 flex justify-center"
          >
            <div className="flex items-center">
              <div
                className="bg-[#002AA8] mr-0.5"
                style={{ width: "0.25rem", height: "1.2rem" }}
              ></div>
              <div
                className="border-[#002AA8]"
                style={{
                  width: "0.5rem",
                  height: "2.2rem",
                  borderStyle: "solid",
                  borderWidth: "0.375rem 0.25rem 0.375rem 0",
                }}
              ></div>
              <div
                className="flex items-center justify-center text-white font-medium"
                style={{
                  width: "7.5rem",
                  height: "2rem",
                  border: "0.15rem solid #002AA8",
                }}
              >
                Cancel
              </div>
              <div
                className="border-[#002AA8]"
                style={{
                  width: "0.5rem",
                  height: "2.2rem",
                  borderStyle: "solid",
                  borderWidth: "0.25rem 0 0.375rem 0.25rem",
                }}
              ></div>
              <div
                className="bg-[#002AA8]"
                style={{ width: "0.25rem", height: "1.2rem" }}
              ></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SigninWallet;
