import React, { useState } from "react";
import Land1 from "../../assets/images/land1.jpg";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../../Components/Buttons/Button2";
import { FiEdit2 } from "react-icons/fi";
import popularCollections from "../../assets/images/popular/popolar.png";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import buyNfaImage from "../../assets/images/popolar.png";
import symbol from "../../assets/images/login/Symbol.svg.png"; // Make sure this image exists

function Buy1() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  const openThirdModal = () => {
    setIsSecondOpen(false);
    setIsThirdOpen(true);
  };
  const closeThirdModal = () => setIsThirdOpen(false);

  const handleMakeOffer = () => {
    console.log("Make offer clicked");
  };

  return (
    <div className="max-w-[918px] mt-24 w-full h-auto flex flex-col md:flex-row gap-6 md:gap-[54px] px-4">
      {/* Image */}

      <div className="text-white flex items-center sm:hidden">
        <Link to="/buy-nfa" className="border-b-2 border-blue-500">
          Overview
        </Link>
        <Link to="/offer-recieved" className="pl-3">
          Offer 0
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* ✅ Title appears ABOVE the image on small screens */}
        <div className="flex md:hidden items-center gap-2 w-full justify-left">
          <h1 className="font-inter font-semibold text-xl text-white cursor-default">
            Monkey Ape
          </h1>
          <p className="font-inter font-semibold text-sm text-white cursor-default">
            No333 🔥
          </p>
        </div>

        {/* ✅ Image */}
        <img
          src={buyNfaImage}
          alt="land image"
          style={{
            background: "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
          }}
          className="w-full md:w-[375px] h-[230px] md:h-[350px] scale-x-[-1] rounded-[10px] object-cover object-top cursor-default"
        />

        {/* ✅ Content */}
        <div className="w-full md:w-[464px] flex flex-col gap-4">
          {/* ✅ Title visible only on medium+ screens (beside image) */}
          <div className="hidden md:flex items-center gap-2">
            <h1 className="font-inter font-semibold text-2xl text-white cursor-default">
              Monkey Ape
            </h1>
            <p className="font-inter font-semibold text-base text-white cursor-default">
              No333 🔥
            </p>
          </div>

          <p className="font-inter text-sm md:text-base text-white opacity-50 cursor-default">
            Listed
          </p>

          <div className="w-full h-auto bg-[#17171887] px-4 md:px-6 py-6 md:py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white opacity-70 cursor-default gap-2 md:gap-0">
              <p>Price</p>
              <p className="text-xs md:text-sm">
                Owned By : Oxc4c16a645...b21a
              </p>
            </div>

            <h2 className="text-white mt-3 text-lg md:text-xl cursor-default">
              $2000.00
            </h2>

            <div className="flex justify-end mt-4">
              <h3 className="flex items-center px-2">
                <FiEye className="text-white w-5 h-5" />
                <span className="text-white font-medium px-2">505 Views</span>
              </h3>
            </div>

            <div className="w-full flex flex-row justify-center gap-4 mt-2">
              <button
                onClick={openModal}
                className="cursor-pointer w-full md:w-auto"
              >
                <CustomButton text="Buy Now" />
              </button>

              <Link to="/offer" className="cursor-pointer w-full md:w-auto">
                <CustomButton text="Buy With Card" />
              </Link>
            </div>

            <Link
              to="/payment"
              className="hidden md:flex items-center gap-2 mt-4 md:mt-6 text-white cursor-pointer"
              onClick={handleMakeOffer}
            >
              Make Offer
              <FiEdit2 className="text-base md:text-lg" />
            </Link>
          </div>

          <Link
            to="/payment"
            className="flex md:hidden items-center gap-2 mt-4 text-white cursor-pointer"
            onClick={handleMakeOffer}
          >
            Make Offer
            <FiEdit2 className="text-base md:text-lg" />
          </Link>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}

      {/* First Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>

            <h1 className="text-white text-xl font-bold mb-2">Monkey Ape</h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {[
              { label: "List price", value: "$2000 USDT" },
              { label: "Platform Fee", value: "$0.5 USDT" },
              { label: "Total Fee", value: "$2000.5 USDT" },
            ].map((item, index) => (
              <div key={index} className="w-[90%] mb-3">
                <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5 w-[0.25rem] h-[1.2rem]"
                    
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] w-[0.5rem] h-[2.2rem]"
                    style={{
                     
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center w-[7rem] md:w-[9rem] h-[2rem] justify-center text-white font-medium"
                    style={{
                    
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8", // ~2.42px
                    }}
                  >
                    Cancel
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.2rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>

              <button className="w-full md:w-auto" onClickCapture={openSecondModal}>
                <CustomButton text="Buy Now" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------  */}

      {/* Second Modal */}
      {isSecondOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-4"
          onClick={closeSecondModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSecondModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>

            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">List Price</p>
                <p className="text-white text-sm">$2000.5</p>
              </div>
            </div>

            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
               <button onClick={closeSecondModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5 w-[0.25rem] h-[1.2rem]"
                    
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] w-[0.5rem] h-[2.2rem]"
                    style={{
                     
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center w-[7rem] md:w-[9rem] h-[2rem] justify-center text-white font-medium"
                    style={{
                    
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8", // ~2.42px
                    }}
                  >
                    Close
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.2rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>
              <button onClick={openThirdModal}>
                <CustomButton text="Confirm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Third Modal (Connect Wallet) */}
      {isThirdOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-20 pt-24">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
            {/* Close Button */}
            <button
              onClick={closeThirdModal}
              className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
            >
              ×
            </button>

            {/* Modal Title */}
            <h2 className="text-white text-lg font-bold text-center my-4">
              Connect Wallet
            </h2>

            {/* Horizontal Line */}
            <hr className="border-t border-gray-600 my-4" />

            {/* Wallet Image & Name */}
            <div className="flex flex-col items-center justify-center gap-4 mb-6 mt-8">
              <img
                src={symbol}
                alt="Connect wallet image"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-white font-medium text-xl">MetaMask</h1>
            </div>

            {/* Action Buttons - Centered */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <button>
                <CustomButton text="Connect" />
              </button>
              <div className="flex items-center cursor-pointer">
                {/* Left small bar */}
                <div
                  className="bg-[#002AA8] mr-0.5"
                  style={{ width: "0.25rem", height: "1.3rem" }}
                ></div>

                {/* Left angled border */}
                <div
                  className="border-[#002AA8]"
                  style={{
                    width: "0.5rem",
                    height: "2.2rem",
                    borderStyle: "solid",
                    borderWidth: "0.375rem 0.25rem 0.375rem 0",
                  }}
                ></div>

                {/* Main button area */}
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

                {/* Right angled border */}
                <div
                  className="border-[#002AA8]"
                  style={{
                    width: "0.5rem",
                    height: "2.2rem",
                    borderStyle: "solid",
                    borderWidth: "0.25rem 0 0.375rem 0.25rem",
                  }}
                ></div>

                {/* Right small bar */}
                <div
                  className="bg-[#002AA8]"
                  style={{ width: "0.25rem", height: "1.3rem" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buy1;
