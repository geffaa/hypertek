import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import TVector from "../../assets/images/popular/vector.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import popularCollections from "../../assets/images/popular/popolar.png";
import CustomButton from "../../Components/Buttons/Button1";
import Logo from "../../assets/images/logo.png";
import land1Image from "../../assets/images/Overview/land1.jpg";
import NavLinks from "../ProfileSection/Navlinks"; // ✅ Import same as MarketPlace
import Profile from "../../assets/images/Profile/Profile.png";
import GlowingOrb from "../Common/BgColoring";
import symbol from "../../assets/images/login/Symbol.svg.png";

function Land() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const [isFourthOpen, setIsFourthOpen] = useState(false);

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

  const openFourthModal = () => {
    setIsThirdOpen(false);
    setIsFourthOpen(true);
  };
  const closeFourthModal = () => setIsFourthOpen(false);

  // Handle Connect Wallet click
  const handleConnectWallet = () => {
    closeThirdModal();
    setTimeout(() => {
      openFourthModal();
    }, 150);
  };

  return (
    <>
      <div className=" ">
        {/* Hero Section */}
        <div className="mx-auto mt-18 lg:mt-[92px]">
          <div className="">
            {/* Hero Banner */}
            <div
              className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] w-full
      bg-cover bg-top bg-no-repeat mb-20 md:mb-24"
              style={{ backgroundImage: `url(${overview1})` }}
            ></div>

            {/* Profile Content Section */}
            <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 lg:px-12">
              <div className="flex flex-col items-start">
                {" "}
                {/* Left aligned on all screens */}
                {/* Profile Image */}
                <div className="relative">
                  <img
                    src={Profile}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-lg 
            -mt-12 sm:-mt-16 md:-mt-16"
                  />
                </div>
                {/* Profile Info */}
                <div className="mt-3 text-left text-white">
                  {" "}
                  {/* Text left-aligned */}
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                    Lana Kim
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">
                    0xc416a645...b21a{" "}
                    <Link to="/edit">
                      <span className="ml-1 sm:ml-2 cursor-pointer underline">
                        Edit Profile
                      </span>
                    </Link>
                  </p>
                  <p className="text-green-400 font-semibold mt-1 text-sm sm:text-base md:text-lg">
                    $3000
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="relative flex flex-col lg:flex-row justify-start items-start gap-4 lg:gap-0 mb-4 lg:mb-8">
            {/* ✅ Reused NavLinks component */}
            <NavLinks />
          </div>
        </div>

        {/* Rest of Land Page */}
      <section className="flex flex-col relative z-10 gap-4 px-4 sm:px-12 xl:px-18 2xl:px-32 lg:gap-8 mb-12 lg:mb-16">
  {/* Heading */}
  <GlowingOrb Xaxis={800} Yaxis={100} />

  {/* Cards Section */}
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-800 rounded-lg z-10 shadow-md text-white p-4 w-full h-[380px] lg:h-[400px] flex flex-col justify-between group relative"
      >
        <div
          className="w-full h-32 lg:h-[160px] overflow-hidden rounded-[19px] 
            bg-gradient-to-b from-[#977C34] to-[#493F26]"
        >
          <img
            src={land1Image}
            alt="Collection"
            className="w-full h-full object-cover object-top scale-x-[-1]"
          />
        </div>

        <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">
          Monkey Ape
        </h2>

        <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
          <h3 className="text-xs lg:text-sm font-semibold">No33 🔥</h3>
          <div className="flex items-center">
            <img
              src={TVector}
              alt=""
              className="w-2 h-2 lg:w-[10px] lg:h-[9px]"
            />
            <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">
              $2,000
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center mt-auto w-full min-h-[60px]">
          {/* Small screens: always show List Now */}
          <div className="block lg:hidden w-full">
            <button onClick={openModal} className="w-full">
              <CustomButton text="List Now" />
            </button>
          </div>

          {/* Large screens: conditional display */}
          <div className="hidden lg:flex flex-col items-center justify-center w-full">
            {/* Show CustomButton on hover */}
            <div className="w-full transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-95">
              <button onClick={openModal} className="w-full">
                <CustomButton text="List Now" />
              </button>
            </div>
            
            {/* Show "No Listing" text when not hovered */}
            <div className="w-full transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:h-0 group-hover:overflow-hidden text-center">
              <div className="text-gray-400 text-sm py-3">
                No Listing
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
      </div>

      {/* ------------------ First Modal ------------------ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-sm md:max-w-md h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            {/* Title */}
            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {/* Image + Hover Button */}
            <div className="relative w-[60%] h-32 lg:h-[160px] xl:h-[180px] 2xl:h-[200px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26] flex justify-center mx-auto group">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
              <button className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white text-sm px-4 py-1 rounded-md">
                Preview
              </button>
            </div>

            {/* Asset Title */}
            <h1 className="text-white text-xl font-bold mb-2 mt-4">
              Monkey Ape
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {/* Price Details */}
            {[
              { label: "List price", value: "$2000 USDT" },
              { label: "Platform Fee", value: "$0.5 USDT" },
            ].map((item, index) => (
              <div key={index} className="w-[90%] mb-3">
                <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.1rem", // ~21.93px
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
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
                      height: "1.1rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>
              <button
                onClick={openSecondModal}
                className="w-full md:w-auto text-normal"
              >
                <CustomButton text="List now " />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Second Modal ------------------ */}
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

            <div className="w-[60%] h-32 lg:h-[160px] xl:h-[180px] 2xl:h-[200px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26] flex justify-center mx-auto">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>

            <h1 className="text-white  text-lg md:text-xl">Monkey Ape</h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">List Price</p>
                <p className="text-white text-sm">$2000.5</p>
              </div>
            </div>

            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
              <button
                onClick={closeSecondModal}
                className="w-full w-[8rem] md:w-auto"
              >
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.1rem", // ~21.93px
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex  items-center justify-center text-white font-medium"
                    style={{
                      width: "8rem", // ~168px
                      height: "2rem", // ~39.59px
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
                      height: "1.1rem", // ~21.93px
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

      {/* ------------------ Third Modal (Connect Wallet) ------------------ */}
      {isThirdOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
            <button
              onClick={closeThirdModal}
              className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
            >
              ×
            </button>

            <h2 className="text-white text-lg font-bold text-center my-4">
              Connect Wallet
            </h2>
            <hr className="border-t border-gray-600 my-4" />

            <div
              onClick={handleConnectWallet}
              className="flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20"
            >
              <img
                src={symbol}
                alt="Connect wallet image"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-white font-medium text-lg">MetaMask</h1>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Fourth Modal ------------------ */}
      {isFourthOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
            <button
              onClick={closeFourthModal}
              className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
            >
              ×
            </button>

            <h2 className="text-white text-lg font-bold text-center my-4">
              Connect Wallet
            </h2>
            <hr className="border-t border-gray-600 my-4" />

            <div className="flex flex-col items-center justify-center gap-4 mb-6 mt-8">
              <img
                src={symbol}
                alt="Connect wallet image"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-white font-medium text-xl">MetaMask</h1>
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
              <button>
                <CustomButton text="Connect" />
              </button>

              <div className="flex items-center cursor-pointer">
                <div
                  className="bg-[#002AA8] mr-0.5"
                  style={{ width: "0.25rem", height: "1.3rem" }}
                ></div>

                <div
                  className="border-[#002AA8]"
                  style={{
                    width: "0.5rem",
                    height: "2.7rem",
                    borderStyle: "solid",
                    borderWidth: "0.375rem 0.25rem 0.375rem 0",
                  }}
                ></div>

                <div
                  className="flex items-center justify-center text-white font-medium"
                  style={{
                    width: "9rem",
                    height: "2.5rem",
                    border: "0.15rem solid #002AA8",
                  }}
                >
                  Cancel
                </div>

                <div
                  className="border-[#002AA8]"
                  style={{
                    width: "0.5rem",
                    height: "2.7rem",
                    borderStyle: "solid",
                    borderWidth: "0.25rem 0 0.375rem 0.25rem",
                  }}
                ></div>

                <div
                  className="bg-[#002AA8]"
                  style={{ width: "0.25rem", height: "1.3rem" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Land;
