import React, { useState } from 'react';
import symbol from "../assets/images/login/Symbol.svg.png"; // Wallet icon
import { useNavigate } from 'react-router-dom';

function WalletConnecting() {
  const navigate = useNavigate()
  // State to control modal visibility
  const [isModalVisible, setIsModalVisible] = useState(true);

  // Close modal function
  const closeModal = () => {
    setIsModalVisible(false);
    navigate("/wallet-connect")

  };

  if (!isModalVisible) return null; // Render nothing if modal is closed

  return (
    <>
      {/* Modal overlay */}
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 px-4">
        <div className="bg-gray-900 rounded-lg p-4 w-full max-w-xs relative text-white">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-white font-bold text-xl hover:text-gray-300 transition"
          >
            ×
          </button>

          {/* Modal Title */}
          <h2 className="text-white text-base font-bold text-center my-3">
            Connecting Wallet
          </h2>

          <hr className="border-t  my-2" />

          {/* Wallet Content */}
          <div className="flex flex-col items-center justify-center gap-3 p-4  rounded-xl mt-3 w-full">
            <img src={symbol} alt="Wallet" className="w-16 h-16 object-contain" />
            
            {/* Half-circle loader */}
            {/* Partial circular loader (20% load) */}
{/* Static 20% circular loader */}
<div className="w-8 h-8 relative mt-2">
  {/* Background circle */}
  <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>

  {/* 20% filled arc */}
  <div
    className="absolute inset-0 rounded-full border-4 border-blue-500 border-solid border-r-transparent border-b-transparent"
    style={{
      transform: "rotate(-230deg)", // Start from top-right
    }}
  ></div>
</div>


          </div>
        </div>
      </div>
    </>
  );
}

export default WalletConnecting;
