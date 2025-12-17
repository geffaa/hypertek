import React, { useState, useEffect } from "react";
import TVector from "../assets/images/popular/vector.png";
import overview1 from "../assets/images/Overview/overview1.jpg";
import popularCollections from "../assets/images/popular/popolar.png";
import { FiSearch } from "react-icons/fi";
import CustomButton from "../Components/Buttons/Button1";
import Logo from "../assets/images/logo.png";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import symbol from "../assets/images/login/Symbol.svg.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";

function NFA() {
  /* ---------------- MODALS ---------------- */
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);

  const openFirstModal = () => setIsFirstModalOpen(true);
  const closeFirstModal = () => setIsFirstModalOpen(false);

  const handleSellNow = () => {
    closeFirstModal();
    setTimeout(() => setIsSecondModalOpen(true), 100);
  };

  const handleConnectWallet = () => {
    setIsSecondModalOpen(false);
    setTimeout(() => setIsThirdModalOpen(true), 100);
  };

  /* ---------------- DATA ---------------- */
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/collection/get`
        );

        if (res.data.success) {
          // ✅ ONLY NFA TYPE DATA
          const nfaData = res.data.collections.filter(
            (item) => item.collection?.Type === "NFA"
          );
          setMarketData(nfaData);
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8">
      {/* ---------------- HERO ---------------- */}
      <div className="max-w-7xl mx-auto mt-20 lg:mt-[92px]">
        <div
          className="relative h-48 lg:h-[237px] bg-cover bg-top rounded-lg mb-16"
          style={{ backgroundImage: `url(${overview1})` }}
        >
          <div className="absolute top-6 left-6 text-white">
            <h1 className="text-2xl lg:text-[35px] font-semibold">
              A New Era Dawns in Hyper Tek
            </h1>
            <p className="hidden md:block mt-2 text-[18px]">
              Shape the journey. Own the future.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <NavLinks />
          <div className="hidden md:flex items-center gap-3 border border-white/40 rounded-lg px-4 py-2">
            <FiSearch className="text-white" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-white"
            />
          </div>
        </div>
      </div>

      {/* ---------------- NFA SECTION ---------------- */}
      <section className="max-w-7xl mx-auto mb-16">
        <h1 className="text-white text-2xl lg:text-[30px] font-bold mb-6">
          NFA
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          {/* ✅ INSTANT SELL (STATIC CARD) */}
          <div className="bg-gray-800 rounded-lg p-4 text-white flex flex-col items-center justify-center h-[320px] lg:h-[400px]">
            <img src={Logo} className="w-20 h-20" alt="logo" />
            <h2 className="text-xl font-bold my-4">Instant Sell</h2>
            <button onClick={openFirstModal}>
              <CustomButton text="Sell Now" />
            </button>
          </div>

          {/* ✅ NFA DATA FROM API */}
          {marketData.slice(0, 3).map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 rounded-lg p-4 text-white h-[320px] lg:h-[400px] flex flex-col justify-between"
            >
              <div>
                <div className="h-36 overflow-hidden rounded-lg bg-gradient-to-b from-[#977C34] to-[#493F26]">
                  <img
                    src={
                      item.collection?.image
                        ? `${BACKEND_BASE_URL}${item.collection.image}`
                        : popularCollections
                    }
                    alt={item.collection?.name}
                     className="w-full h-full object-cover object-top scale-x-[-1]"
                  />
                </div>

                <h2 className="font-bold mt-4">
                  {item.collection?.name}
                </h2>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm">
                    {item._id.slice(0, 6)} 🔥
                  </span>
                  <div className="flex items-center gap-1">
                    <img src={TVector} className="w-3 h-3" alt="" />
                    <span>${item.priceETH}</span>
                  </div>
                </div>
              </div>

              <Link to="/buy-nfa" state={{ item }} className="mt-6">
                <CustomButton text="Buy Now" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- MODALS (same as yours) ---------------- */}
      {isFirstModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center pt-24 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[400px] text-white">
            <h2 className="text-lg font-bold mb-4">Select item to sell</h2>
            <button onClick={handleSellNow}>
              <CustomButton text="Sell Now" />
            </button>
          </div>
        </div>
      )}

      {isSecondModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center pt-24 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[400px] text-white">
            <h2 className="text-lg font-bold mb-4">Connect Wallet</h2>
            <div onClick={handleConnectWallet} className="cursor-pointer">
              <img src={symbol} className="w-12 mx-auto" alt="" />
            </div>
          </div>
        </div>
      )}

      {isThirdModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center pt-24 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[400px] text-white">
            <h2 className="text-lg font-bold mb-4">Confirm Wallet</h2>
            <CustomButton text="Connect" />
          </div>
        </div>
      )}
    </div>
  );
}

export default NFA;
