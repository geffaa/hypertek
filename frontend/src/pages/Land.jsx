import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

import TVector from "../assets/images/popular/vector.png";
import overview1 from "../assets/images/Overview/overview1.jpg";
import CustomButton from "../Components/Buttons/Button1";
import Logo from "../assets/images/logo.png";
import land1Image from "../assets/images/Overview/land1.jpg";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import symbol from "../assets/images/login/Symbol.svg.png";

import axios from "axios";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner"; // ✅ loader

function Land() {
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true); // loader state
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);

  // Fetch only collections of type "Land"
  useEffect(() => {
    const fetchLandCollections = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/collection/get`);
        if (res.data.success) {
          const landCollections = res.data.collections.filter(
            (item) => item.collection.Type === "Land"
          );
          setLandData(landCollections);
          console.log("Fetched land collections:", landCollections);
        } else {
          console.error("Failed to fetch collections:", res.data.message);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandCollections();
  }, []);

  // Modal functions
  const openFirstModal = () => setIsFirstModalOpen(true);
  const closeFirstModal = () => setIsFirstModalOpen(false);
  const openSecondModal = () => setIsSecondModalOpen(true);
  const closeSecondModal = () => setIsSecondModalOpen(false);
  const openThirdModal = () => {
    setIsSecondModalOpen(false);
    setIsThirdModalOpen(true);
  };
  const closeThirdModal = () => setIsThirdModalOpen(false);

  const handleSellNow = () => {
    closeFirstModal();
    setTimeout(() => openSecondModal(), 100);
  };

  const handleConnectWallet = () => {
    closeSecondModal();
    setTimeout(() => openThirdModal(), 100);
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-[#000000] px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mt-20 lg:mt-[92px]">
        <div
          className="relative h-48 md:h-56 lg:h-[237px] w-full bg-cover bg-top bg-no-repeat rounded-lg shadow-lg mb-16 lg:mb-24"
          style={{ backgroundImage: `url(${overview1})` }}
        >
          <div className="absolute top-4 left-4 lg:top-[20px] lg:left-[48px] w-full lg:w-[902px] max-w-[90%] lg:max-w-none">
            <h1 className="font-inter font-semibold text-2xl md:text-3xl lg:text-[35px] leading-tight text-white mt-3 mb-2 lg:mb-0">
              A New Era Dawns in Hyper Tek
            </h1>
            <p className="font-inter hidden md:block font-medium text-sm md:text-base lg:text-[18px] leading-relaxed text-white">
              It's the start of a living, breathing universe where every decision shapes the journey...
            </p>
          </div>

          <div className="absolute bottom-4 left-4 lg:top-[185px] lg:left-[48px] w-full lg:w-[497px] flex flex-wrap gap-4 lg:gap-[18px]">
            {[{ num: "5K", label: "Total Item" }, { num: "50.5K", label: "Total Volume" }, { num: "3.5K", label: "Listed" }, { num: "2.6K", label: "Owners" }].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1">
                <h1 className="text-sm md:text-[16px] md:w-[86px] font-medium text-white">{stat.num}</h1>
                <p className="text-xs md:text-[12px] font-normal text-white">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation & Search */}
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8">
          <NavLinks />
          <div className="hidden md:flex mr-16 lg:w-[550px] items-center gap-3 lg:gap-[17px] px-4 lg:px-[16px] py-3 lg:py-[12px] border border-white/50 rounded-[12px] bg-white/10 backdrop-blur-sm">
            <FiSearch className="text-white w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            <input type="text" placeholder=" Search..." className="flex-1 bg-transparent pl-2 text-white placeholder-gray-300 outline-none text-sm lg:text-[16px] font-inter w-full" />
          </div>
        </div>
      </div>

      {/* Land Section */}
      <section className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-8 mb-12 lg:mb-16">
        <div className="flex flex-col gap-2 items-start">
          <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">Land</h1>
          <div className="flex gap-2">
            <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
            <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
            <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
            <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
          </div>
        </div>
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 justify-center">

  {/* ✅ Instant Sell Card (STATIC) */}
  <div className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto lg:max-w-none h-[320px] lg:h-[400px] flex flex-col justify-center items-center gap-4">
    <img src={Logo} alt="logo image" className="w-20 h-20" />
    <h2 className="text-lg lg:text-xl font-bold my-2">Instant Sell</h2>
    <button onClick={openFirstModal}>
      <CustomButton text="Sell Now" />
    </button>
  </div>

  {/* ✅ REAL LAND DATA FROM API */}
  {landData.map((item) => (
    <div
      key={item._id}
      className="bg-gray-800 rounded-lg shadow-md text-white p-4 w-full max-w-sm mx-auto lg:max-w-none h-[320px] lg:h-[400px] flex flex-col justify-between"
    >
      <div>
        <div className="w-full h-32 lg:h-[160px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26]">
          <img
            src={
              item.collection.image
                ? `${BACKEND_BASE_URL}${item.collection.image}`
                : land1Image
            }
            alt={item.collection.name}
            className="w-full h-full object-cover object-top scale-x-[-1]"
          />
        </div>

        <h2 className="text-base lg:text-lg font-bold mt-3 lg:mt-4">
          {item.collection.name}
        </h2>

        <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
          <h3 className="text-xs lg:text-sm font-semibold">
            {item._id.slice(0, 6)} 🔥
          </h3>

          <div className="flex items-center">
            <img src={TVector} alt="" className="w-2 h-2 lg:w-[10px] lg:h-[9px]" />
            <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm font-semibold">
              ${item.priceETH}
            </h3>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link to="/buy-land" state={{ item }}>
          <CustomButton text="Buy Now" />
        </Link>
      </div>
    </div>
  ))}
</div>

      </section>

      {/* Modals */}
      {isFirstModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-20">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
            <button onClick={closeFirstModal} className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition">×</button>
            <h2 className="text-white text-lg font-bold text-center my-4">Select item to sell</h2>
            <hr className="border-t border-gray-600 my-4" />
            <div className="flex justify-end gap-2 justify-between mt-4">
              <button onClick={handleSellNow} className="hidden md:block">
                <CustomButton text="Sell Now" />
              </button>
              <Link to="/wallet-connect" className="block md:hidden">
                <CustomButton text="Sell Now" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {isSecondModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
            <button onClick={closeSecondModal} className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition">×</button>
            <h2 className="text-white text-lg font-bold text-center my-4">Connect Wallet</h2>
            <hr className="border-t border-gray-600 my-4" />
            <div onClick={handleConnectWallet} className="hidden md:flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20">
              <img src={symbol} alt="Connect wallet image" className="w-10 h-10 object-contain" />
              <h1 className="text-white font-medium text-lg">MetaMask</h1>
            </div>
            <Link to="/wallet-connect">
              <div className="flex md:hidden items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20">
                <img src={symbol} alt="Connect wallet image" className="w-10 h-10 object-contain" />
                <h1 className="text-white font-medium text-lg">MetaMask</h1>
              </div>
            </Link>
          </div>
        </div>
      )}

      {isThirdModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
            <button onClick={closeThirdModal} className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition">×</button>
            <h2 className="text-white text-lg font-bold text-center my-4">Connect Wallet</h2>
            <hr className="border-t border-gray-600 my-4" />
            <div className="flex flex-col items-center justify-center gap-4 mb-6 mt-8">
              <img src={symbol} alt="Connect wallet image" className="w-16 h-16 object-contain" />
              <h1 className="text-white font-medium text-xl">MetaMask</h1>
            </div>
            <div className="flex flex-col items-center gap-4 mt-8">
              <button>
                <CustomButton text="Connect" />
              </button>
              <div className="flex items-center cursor-pointer" onClick={closeThirdModal}>
                <CustomButton text="Cancel" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Land;
