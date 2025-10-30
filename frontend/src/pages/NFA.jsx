import React, { useState, useEffect } from "react";
import TVector from "../assets/images/popular/vector.png";
import overview1 from "../assets/images/Overview/overview1.jpg";
import popularCollections from "../assets/images/popular/popolar.png";
import { FiSearch } from "react-icons/fi";
import CustomButton from "../Components/Buttons/Button1";
import Logo from "../assets/images/logo.png";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import Button2 from "../Components/Buttons/Button2";
import symbol from "../assets/images/login/Symbol.svg.png";
import { Link } from "react-router-dom";
import InfoIcon from "../assets/images/info.png";
import axios from "axios";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner"; // ✅ your loader

function NFA() {
  // ✅ State for multiple modals
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ loader state

  // ✅ Open/Close handlers for first modal
  const openFirstModal = () => setIsFirstModalOpen(true);
  const closeFirstModal = () => setIsFirstModalOpen(false);

  // ✅ Open/Close handlers for second modal
  const openSecondModal = () => {
    setIsFirstModalOpen(false); // Close first modal
    setIsSecondModalOpen(true); // Open second modal
  };

  const closeSecondModal = () => setIsSecondModalOpen(false);

  // ✅ Open/Close handlers for third modal
  const openThirdModal = () => {
    setIsSecondModalOpen(false); // Close second modal
    setIsThirdModalOpen(true); // Open third modal
  };

  const closeThirdModal = () => setIsThirdModalOpen(false);

  // ✅ Handle Sell Now click from first modal
  const handleSellNow = () => {
    closeFirstModal();
    // Small delay for smooth transition
    setTimeout(() => {
      openSecondModal();
    }, 100);
  };

  // ✅ Handle Connect Wallet click from second modal
  const handleConnectWallet = () => {
    closeSecondModal();
    // Small delay for smooth transition
    setTimeout(() => {
      openThirdModal();
    }, 100);
  };

  /// get the data from the backend
  const [marketData, setMarketData] = useState([]);

  // get the market data here
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        /// get the land , market and activity through
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/market/getMarket`
        );

        if (res.data?.data) setMarketData(res.data.data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false); // ✅ hide loader after fetch
      }
    };

    fetchMarketData();
  }, []);
  console.log("your market data are here :", marketData);
  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#000000] px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mt-20 lg:mt-[92px]">
          {/* Hero Banner */}
          <div
            className="relative h-48 md:h-56 lg:h-[237px] w-full 
            bg-cover bg-top bg-no-repeat rounded-lg shadow-lg mb-16 lg:mb-24"
            style={{ backgroundImage: `url(${overview1})` }}
          >
            <div
              className="absolute top-4 left-4 lg:top-[20px] lg:left-[48px] 
              w-full lg:w-[902px] max-w-[90%] lg:max-w-none"
            >
              <h1
                className="font-inter font-semibold text-2xl mt-3 md:text-3xl lg:text-[35px] 
                leading-tight text-white mb-2 lg:mb-0"
              >
                A New Era Dawns in Hyper Tek
              </h1>
              <p
                className="font-inter hidden md:block font-medium text-sm md:text-base lg:text-[18px] 
  leading-relaxed text-white"
              >
                It's the start of a living, breathing universe where every
                decision shapes the journey. Whether you're racing at light
                speed, forging alliances in the Overlord Realm, or uncovering
                secrets in HyperQuest, this is your chance to leave your mark on
                the story.
              </p>
            </div>

            {/* Stats Section */}
            <div
              className="absolute bottom-4 left-4 lg:top-[185px] lg:left-[48px] 
              w-full lg:w-[497px] flex flex-wrap gap-4 lg:gap-[18px]"
            >
              {[
                { num: "5K", label: "Total Item" },
                { num: "50.5K", label: "Total Volume" },
                { num: "3.5K", label: "Listed" },
                { num: "2.6K", label: "Owners" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <h1 className="text-sm md:text-[16px] md:w-[86px] font-medium text-white">
                    {stat.num}
                  </h1>
                  <p className="text-xs md:text-[12px] font-normal text-white">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation and Search */}
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8">
            <NavLinks />
            <div
              className="hidden md:flex mr-16 lg:w-[550px] items-center gap-3 lg:gap-[17px] 
    px-4 lg:px-[16px] py-3 lg:py-[12px] border border-white/50 rounded-[12px] 
    bg-white/10 backdrop-blur-sm"
            >
              <FiSearch className="text-white w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none 
      text-sm lg:text-[16px] font-inter w-full"
              />
            </div>
          </div>
        </div>

        {/* NFA Section */}
        <section className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-8 mb-12 lg:mb-16">
          <div className="flex flex-col gap-2 items-start">
            <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
              NFA
            </h1>
            <div className="flex gap-2">
              <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
              <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
              <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
              <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">
            {marketData.slice(0, 4).map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto 
          lg:max-w-none h-[320px] lg:h-[400px] flex flex-col justify-between"
              >
                {index === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
                    <img src={Logo} alt="logo" className="w-[75px] h-[75px]" />
                    <h2 className="text-lg lg:text-xl font-bold my-2">
                      Instant Sell
                    </h2>
                    <div className="flex items-center gap-2">
                      <img
                        src={TVector}
                        alt=""
                        className="w-6 h-6 p-1 rounded-full bg-[linear-gradient(180deg,#2AAC4F,#85F3BE)]"
                      />
                      <p className="text-white font-medium">${item.price}</p>
                    </div>

                    {/* ✅ Open first modal on click */}
                    <button onClick={openFirstModal} className="mt-2">
                      <CustomButton text="Sell Now" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-32 lg:h-[160px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26]">
                      <img
                        src={popularCollections}
                        alt="Collection"
                        className="w-full h-full object-cover object-top scale-x-[-1]"
                      />
                    </div>

                    <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">
                      {item.title}
                    </h2>

                    <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
                      <h3 className="text-xs lg:text-sm font-semibold">
                        {item.serialNumber} 🔥
                      </h3>
                      <div className="flex items-center">
                        <img
                          src={TVector}
                          alt=""
                          className="w-2 h-2 lg:w-[10px] lg:h-[9px]"
                        />
                        <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">
                          ${item.price}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-center">
                      <Link to="/buy-nfa" state={{ item }}>
                        <CustomButton text="Buy Now" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ✅ First Modal - Select Item */}
        {isFirstModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-20">
            <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
              {/* Close Button */}
              <button
                onClick={closeFirstModal}
                className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
              >
                ×
              </button>

              {/* Modal Title */}
              <h2 className="text-white text-lg font-bold text-center my-4">
                Select item to sell
              </h2>

              <hr className="border-t border-gray-600 my-4" />

              {/* NFT Item Display */}
              <div className="w-full">
                <div className="flex items-center justify-between text-white py-4 gap-4">
                  {/* Left side: image + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-20 overflow-hidden rounded-lg bg-gradient-to-b from-[#977C34] to-[#493F26]">
                      <img
                        src={popularCollections}
                        alt="Collection"
                        className="w-[110%] h-auto object-top scale-x-[-1]"
                      />
                    </div>
                    <h1 className="text-sm lg:text-base font-bold">
                      Monkey Ape
                    </h1>
                  </div>

                  {/* Right side: price */}
                  <h3 className="text-sm lg:text-base font-semibold">
                    $1800 USDT
                  </h3>
                </div>
              </div>

              <hr className="border-t border-gray-600 mb-4" />

              {/* Fee Details */}
              <div className="space-y-3 text-white mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="font-semibold">$0.5 USDT</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Fee</span>
                  <span className="font-semibold">$1800.5</span>
                </div>
              </div>

              <hr className="border-t border-gray-600 my-4" />

              {/* Terms Agreement */}
              <p className="text-gray-400 text-xs text-start mb-4">
                By clicking "Sell Now", you agree to the Hyper Tek <br /> Terms
                of Service
              </p>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 justify-between">
                <button onClick={closeFirstModal}>
                  <button>
                    <div className="flex items-center">
                      {/* Left small bar */}
                      <div
                        className="bg-[#002AA8] mr-0.5"
                        style={{
                          width: "0.25rem", // ~3.99px
                          height: "1.3rem", // ~21.93px
                        }}
                      ></div>

                      {/* Left angled border */}
                      <div
                        className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                        style={{
                          borderStyle: "solid",
                          borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                        }}
                      ></div>

                      {/* Main button area */}
                      <div
                        className="flex items-center justify-center text-white font-medium w-[83.89px] h-[19.45] md:w-[150.31px] md:h-[39.59px]"
                        style={{
                          // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                          border: "2.24px solid #002AA8", // ~2.42px
                        }}
                      >
                        Cancel
                      </div>

                      {/* Right angled border */}
                      <div
                        className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                        style={{
                          borderStyle: "solid",
                          borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                        }}
                      ></div>

                      {/* Right small bar */}
                      <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem]"></div>
                    </div>
                  </button>
                </button>

                {/* ✅ Large screen - opens second modal */}
                <button onClick={handleSellNow} className="hidden md:block">
                  <div
                    className="
        flex items-center 
        scale-90 sm:scale-100 
        transition-transform duration-300 ease-in-out 
        md:hover:scale-95   /* Slight zoom out on hover (desktop only) */
        group                /* enables child hover states */
      "
                  >
                    {/* Left small bar */}
                    <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem] mr-0.5 transition-all duration-300 group-hover:bg-[#0034d6]"></div>

                    {/* Left angled border */}
                    <div
                      className="border-[#002AA8] md:w-[7.97px] w-[5.73px] md:h-[42.86px] h-[30.79px] transition-all duration-300 group-hover:border-[#0034d6]"
                      style={{
                        borderStyle: "solid",
                        borderWidth: "0.375rem 0.25rem 0.375rem 0",
                      }}
                    ></div>

                    {/* Main button area */}
                    <div
                      className="
          flex items-center justify-center 
          text-white font-medium 
          text-xs sm:text-sm
          md:w-[150px] md:h-[39px] 
          w-[103px] h-[28px]
          transition-all duration-300 ease-in-out
          group-hover:bg-[linear-gradient(180deg,_#0034D6_0%,_#001B70_100%)]
        "
                      style={{
                        background:
                          "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                        border: "0.15rem solid #002AA8",
                      }}
                    >
                      Sell Now
                    </div>

                    {/* Right angled border */}
                    <div
                      className="border-[#002AA8] md:w-[7.97px] w-[5.73px] md:h-[42.86px] h-[30.79px] transition-all duration-300 group-hover:border-[#0034d6]"
                      style={{
                        borderStyle: "solid",
                        borderWidth: "0.25rem 0 0.375rem 0.25rem",
                      }}
                    ></div>

                    {/* Right small bar */}
                    <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem] transition-all duration-300 group-hover:bg-[#0034d6]"></div>
                  </div>
                </button>

                {/* ✅ Small screen - navigates to /wallet-connect */}
                <Link to="/wallet-connect" className="block md:hidden">
                  <CustomButton text="Sell Now" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Second Modal - Connect Wallet */}
        {isSecondModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
            <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
              {/* Close Button */}
              <button
                onClick={closeSecondModal}
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

              {/* For large screeen  */}
              <div
                onClick={handleConnectWallet}
                className="hidden md:flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20"
              >
                <img
                  src={symbol}
                  alt="Connect wallet image"
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-white font-medium text-lg">MetaMask</h1>
              </div>

              {/* for mobile screeen  */}

              <Link to="/wallet-connect">
                <div className="flex md:hidden items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20">
                  <img
                    src={symbol}
                    alt="Connect wallet image"
                    className="w-10 h-10 object-contain"
                  />
                  <h1 className="text-white font-medium text-lg">MetaMask</h1>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------  */}
        {/* ✅ Third Modal - Final Confirmation */}
        {isThirdModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
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

              {/* Action Buttons - Centered like the image */}
              <div className="flex flex-col items-center gap-4 mt-8">
                <button>
                  <CustomButton text="Connect" />
                </button>
                <div className="flex items-center cursor-pointer" onClick={closeThirdModal}>
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.3rem", // ~21.93px
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.6rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium"
                    style={{
                      width: "12rem", // ~168px
                      height: "2.5rem", // ~39.59px
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
                      height: "2.6rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.3rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* this is only for the small screen  */}
      </div>
    </>
  );
}

export default NFA;
