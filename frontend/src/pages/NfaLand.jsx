import React, { useState } from "react";
import Land1 from "../assets/images/land1.jpg";
import CustomButton from "../Components/Buttons/Button1";
import CustomButton2 from "../Components/Buttons/Button2";
import { FiEdit2, FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";
import BuyNfa2 from "../Components/BuyNfa/BuyNfa2";

function NfaLand() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  const handleMakeOffer = () => {
    console.log("Make offer clicked");
  };

  return (
    <div className="flex flex-col justify-center w-full mt-24 px-4">
      <div className="flex flex-col md:flex-row gap-6 md:gap-[54px] max-w-[918px] w-full h-auto">
       <div className="text-white flex items-center sm:hidden">
               <Link to="/buy-nfa" className="border-b-2 border-blue-500">
               Overview
              
               </Link>
               <Link to="/offer-recieved" className="pl-3">
               Offer 0
               </Link>
               
             </div>
       
        {/* ✅ Title block on small screens (above the image) */}
        <div className="flex md:hidden items-center justify-left gap-2 mb-2">
          <h1 className="font-inter font-semibold text-[22px] text-white">
            Monkey Ape
          </h1>
          <p className="flex items-center font-inter font-semibold text-[14px] text-white">
            No333 🔥
          </p>
        </div>

        {/* ✅ Image */}
        <img
          src={Land1}
          alt="land image"
          className="w-full md:w-[375px] h-[250px] md:h-[350px] rounded-[10px] bg-[#00000033] object-cover"
        />

        {/* ✅ Content */}
        <div className="w-full md:w-[464px] flex flex-col gap-4">
          {/* ✅ Title block for large screens (beside the image) */}
          <div className="hidden md:flex items-center justify-between gap-2">
            <h1 className="font-inter font-semibold text-[24px] md:text-[30px] text-white">
              Monkey Ape
            </h1>
            <p className="flex items-center font-inter font-semibold text-[14px] md:text-[16px] text-white">
              No333 🔥
            </p>
          </div>

          <p className="text-white opacity-50">Listed</p>

          {/* Card Section */}
          <div className="w-full h-auto bg-[#17171887] px-6 py-6 md:py-8 rounded-[10px]">
            {/* Price & Owner */}
            <div className="flex justify-between items-center text-white opacity-70">
              <p>Price</p>
              <p className="text-xs md:text-sm">
                Owned By : Oxc4c16a645...b21a
              </p>
            </div>

            <h2 className="text-white mt-3 text-lg md:text-xl">$2000.00</h2>

            {/* Buttons */}
            <div className="w-full flex flex-row justify-center gap-4 mt-4 md:mt-6">
              <button onClick={openModal} className="w-full md:w-auto">
                <CustomButton text="Buy Now" />
              </button>

              <Link to="/offer" className="w-full md:w-auto">
                <CustomButton text="Buy With Card" />
              </Link>
            </div>

            {/* Make Offer */}
            <div
              className="hidden md:flex items-center gap-2 mt-4 md:mt-6 text-white cursor-pointer"
              onClick={handleMakeOffer}
            >
              Make Offer
              <FiEdit2 className="text-base md:text-lg" />
            </div>
          </div>
          <div
            className="flex md:hidden items-center gap-2 my-3 text-white cursor-pointer"
            onClick={handleMakeOffer}
          >
            Make Offer
            <FiEdit2 className="text-base md:text-lg" />
          </div>
        </div>
      </div>

      <BuyNfa2 />

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
              Buy Land
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={Land1}
                alt="Land"
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-white text-xl font-bold mb-2">Monkey Ape</h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {[
              { label: "List price", value: "$2000.00" },
              { label: "Platform Fee", value: "$0.5" },
              { label: "Total Fee", value: "$2000.5" },
            ].map((item, index) => (
              <div key={index} className="w-[90%] mb-3">
                <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-row gap-4 mt-6 w-full justify-center">
              <div className="flex items-center">
                {/* Left small bar */}
                <div
                  className="bg-[#002AA8] mr-0.5"
                  style={{
                    width: "0.25rem", // ~3.99px
                    height: "1rem", // ~21.93px
                  }}
                ></div>

                {/* Left angled border */}
                <div
                  className="border-[#002AA8]"
                  style={{
                    width: "0.5rem", // ~7.97px
                    height: "2rem", // ~42.86px
                    borderStyle: "solid",
                    borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                  }}
                ></div>

                {/* Main button area */}
                <div
                  className="flex items-center justify-center text-white font-medium"
                  style={{
                    width: "8rem", // ~168px
                    height: "2rem", // ~39.59px
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
                    height: "1rem", // ~21.93px
                  }}
                ></div>
              </div>

              <button onClick={openSecondModal} className="w-1/2 md:w-auto">
                <CustomButton text="Buy Now" />
              </button>
            </div>
          </div>
        </div>
      )}

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
              Buy Land
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={Land1}
                alt="Land"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">List Price</p>
                <p className="text-white text-sm">$2000.5</p>
              </div>
            </div>

           <div className="flex flex-row gap-4 mt-6 w-full justify-center flex-wrap">
  {/* Cancel button structure */}
  <div className="flex items-center">
    {/* Left small bar */}
    <div
      className="bg-[#002AA8] mr-0.5"
      style={{
        width: "0.25rem", // ~3.99px
        height: "1rem", // ~21.93px
      }}
    ></div>

    {/* Left angled border */}
    <div
      className="border-[#002AA8]"
      style={{
        width: "0.5rem", // ~7.97px
        height: "2rem", // ~42.86px
        borderStyle: "solid",
        borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
      }}
    ></div>

    {/* Main button area */}
    <div
      className="flex items-center justify-center text-white font-medium"
      style={{
        width: "8rem", // ~168px
        height: "2rem", // ~39.59px
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
        height: "1rem", // ~21.93px
      }}
    ></div>
  </div>

  {/* Confirm button */}
  <Link to="/payment" className="w-auto">
    <CustomButton text="Confirm" onClick={closeSecondModal} />
  </Link>
</div>

          </div>
        </div>
      )}
    </div>
  );
}

export default NfaLand;
