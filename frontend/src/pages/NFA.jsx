import React, { useState, useEffect } from "react";
import TVector from "../assets/images/popular/vector.png";
import popularCollections from "../assets/images/popular/popolar.png";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import { FiSearch } from "react-icons/fi";
import CustomButton from "../Components/Buttons/Button1";
import CustomButton4 from "../Components/Buttons/Button4";
import Logo from "../assets/logo1.png";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import symbol from "../assets/images/login/Symbol.svg.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import FullScreenLoader from "../Components/Common/Spinner";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

function NFA() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  /* ---------------- MODALS ---------------- */
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);

  const openFirstModal = () => setIsFirstModalOpen(true);
  const closeFirstModal = () => setIsFirstModalOpen(false);
  const [showNoItemMsg, setShowNoItemMsg] = useState(false);

  const handleSellNow = () => {
    closeFirstModal();
    setTimeout(() => setIsSecondModalOpen(true), 100);
  };

  const handleConnectWallet = () => {
    setIsSecondModalOpen(false);
    setTimeout(() => setIsThirdModalOpen(true), 100);
  };

  // Check if user has unlisted NFA items
  const checkAndNavigate = async () => {
    try {
      if (!token) {
        toast.error("Please login first");
        return;
      }
      // Get user's wallet address
      if (!window.ethereum) {
        toast.error("Please install MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (!accounts.length) {
        toast.error("Please connect your wallet first");
        return;
      }

      const wallet = accounts[0].toLowerCase();

      // Fetch user's owned NFTs
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${wallet}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data?.success) {
        const unlistedCharacterNFTs = res.data.nfts.flatMap((item) => {
          // only characters parent collection
          if (item.category !== "characters") return [];

          if (!item.isParentCollection || !Array.isArray(item.subCollections))
            return [];

          // get unlisted + owned sub NFTs
          return item.subCollections.filter((sub) => {
            const ownerMatch =
              sub.owner?.toLowerCase() === wallet?.toLowerCase();

            return ownerMatch && sub.listed === false;
          });
        });

        console.log("🎯 Unlisted character NFTs:", unlistedCharacterNFTs);

        if (unlistedCharacterNFTs.length > 0) {
          navigate("/Profile", { state: { category: "characters" } }); // ✅ characters found → go profile
        } else {
          setShowNoItemMsg(true);

          setTimeout(() => {
            setShowNoItemMsg(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error checking items:", error);
      toast.error("Failed to check items");
    }
  };

  /* ---------------- DATA ---------------- */
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        // Fetch parent collections
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/parent-collections`,
        );

        console.log("NFA - Parent Collections Response:", res.data);

        if (res.data.success) {
          const parentCollections = res.data.nfts || res.data.collections;

          console.log("NFA - Parent Collections:", parentCollections);

          let nfaCollections = [];

          // Fetch sub-collections for each parent
          for (const parent of parentCollections) {
            console.log(
              `NFA - Fetching sub-collections for parent: ${parent._id}, category: ${parent.category}`,
            );

            // Only fetch for 'characters' category
            if (parent.category === "characters") {
              try {
                const subRes = await axios.get(
                  `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`,
                );

                console.log(
                  `NFA - Sub-collections response for ${parent._id}:`,
                  subRes.data,
                );

                if (subRes.data.success && subRes.data.subCollections) {
                  const subCollections = subRes.data.subCollections;

                  // Add to NFA with parent info and maintain collection structure for UI compatibility
                  nfaCollections.push(
                    ...subCollections.map((sub) => ({
                      ...sub,
                      parentId: parent._id,
                      parentCategory: parent.category,
                      // Keep collection structure for compatibility with existing UI
                      collection: {
                        name: sub.name,
                        image: sub.image,
                        chain: sub.chain || sub.Type,
                        Type: sub.Type,
                      },
                    })),
                  );
                }
              } catch (subError) {
                console.error(
                  `NFA - Error fetching sub-collections for parent ${parent._id}:`,
                  subError,
                );
                console.error("NFA - Error details:", subError.response?.data);
              }
            }
          }

          console.log("NFA - Final NFA Collections:", nfaCollections);
          setMarketData(nfaCollections);
        }
      } catch (error) {
        console.error("NFA - Error fetching market data:", error);
        console.error("NFA - Error details:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      {/* Full-width Banner */}
      <div className="mt-16">
        <MarketplaceBanner
          titleOverride="NFA"
          stats={[
            { num: "5K", label: "Total Item" },
            { num: "50.5K", label: "Total Volume" },
            { num: "3.5K", label: "Listed" },
            { num: "2.6K", label: "Owners" },
          ]}
        />
      </div>

      {/* Nav + Content */}
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="relative flex md:px-8 px-2 flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8">
          <NavLinks />
          <div className="hidden mr-16 md:flex lg:w-[280px] items-center gap-3 lg:gap-[17px] px-4 lg:px-[16px] py-3 lg:py-[12px] border border-white/50 rounded-[12px] backdrop-blur-sm">
            <FiSearch className="text-white w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent pl-1 text-white placeholder-gray-300 outline-none text-sm lg:text-[16px] font-inter w-full"
            />
          </div>
        </div>
      </div>

      {/* ---------------- NFA SECTION ---------------- */}
      <section className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-8 mb-12 lg:mb-16 px-4 sm:px-6">
        {/* Heading */}
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

        {/* DESKTOP & TABLET GRID */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 mb-5 gap-4 lg:gap-6 justify-center">
          {/* ✅ INSTANT SELL (STATIC CARD) */}
          <div
            className="rounded-[18px] p-5 text-white flex flex-col items-center justify-center h-[420px]"
            style={{
              background:
                "linear-gradient(147.75deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            }}
          >
            <img src={Logo} className="w-20 h-20" alt="logo" />
            <h2 className="text-xl font-bold my-4">Instant Sell</h2>

            <div className="flex items-center mb-4">
              <div
                style={{
                  width: "17px",
                  height: "17px",
                  gap: "0.84px",
                  opacity: 1,
                  borderRadius: "8.5px",
                  paddingTop: "3.62px",
                  paddingRight: "3.2px",
                  paddingBottom: "3.62px",
                  paddingLeft: "3.2px",
                  background:
                    "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)",
                }}
              >
                <img src={TVector} alt="" />
              </div>
              <h1
                style={{
                  width: "55px",
                  height: "19px",
                  opacity: 1,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontStyle: "normal",
                  fontSize: "16px",
                  lineHeight: "19px",
                  letterSpacing: "5%",
                  textAlign: "right",
                  textTransform: "capitalize",
                }}
              >
                $1800
              </h1>
            </div>

            {showNoItemMsg && (
              <div
                className={`bg-black text-white text-xs px-3 py-2 rounded-md shadow-xl transition-all duration-300 ${showNoItemMsg
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
              >
                you don't have any item to sell
              </div>
            )}

            <button
              onClick={checkAndNavigate}
              className="flex justify-center items-center mt-6"
            >
              <CustomButton text="Sell Now" />
            </button>
          </div>

          {/* ✅ NFA DATA FROM API */}
          {marketData && marketData.length > 0 ? (
            marketData.map((item) => (
              <div
                key={item._id}
                className="relative rounded-[18px] shadow-md text-white p-5 w-full max-w-sm mx-auto lg:max-w-none h-[420px] flex flex-col"
                style={{
                  background:
                    "linear-gradient(147.75deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                }}
              >
                <div className="w-full h-[210px] overflow-hidden rounded-[16px] bg-gradient-to-b from-[#977C34] to-[#493F26]">
                  <img
                    src={
                      getImageUrl(item.collection?.image) || popularCollections
                    }
                    alt={item.collection?.name || "NFA Collection"}
                    className="w-full h-full object-cover object-top "
                  />
                </div>

                <h2 className="text-sm sm:text-base lg:text-lg font-bold mt-2 sm:mt-3 lg:mt-4">
                  {item.collection?.name || item.name || "Unnamed"}
                </h2>

                <div className="flex justify-between items-center mb-2 sm:mb-3 lg:mb-4 mt-3 sm:mt-4 lg:mt-5">
                  <h3 className="text-xs sm:text-sm font-semibold">
                    {item.symbol || item._id?.slice(0, 6) || "N/A"} 🔥
                  </h3>
                  <div className="flex items-center">
                    <img
                      src={TVector}
                      alt=""
                      className="w-2 h-2 lg:w-[10px] lg:h-[9px]"
                    />
                    <h3 className="pl-1 sm:pl-2 text-xs sm:text-sm font-semibold">
                      ${item.priceETH || item.chain || item.Type || "USDC"}
                    </h3>
                  </div>
                </div>

                <div className="flex justify-center items-center mt-4">
                  <Link
                    to="/buy-nfa"
                    state={{ item }}
                    className="cursor-pointer flex justify-center w-full"
                  >
                    <CustomButton
                      text="Buy Now"
                      className="!text-xs sm:!text-sm lg:!text-base !py-1.5 sm:!py-2 lg:!py-2.5 !px-4 sm:!px-6 lg:!px-8"
                    />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-white py-8">
              No NFA collections available
            </div>
          )}
        </div>

        {/* MOBILE GRID */}
        <div className="sm:hidden grid grid-cols-2 gap-4 pb-4">
          {/* Instant Sell Card */}
          <div
            className="relative rounded-[16px] p-3 text-white flex flex-col h-[360px]"
            style={{
              background:
                "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
            }}
          >
            <div className="h-[150px] flex items-center justify-center rounded-[14px]">
              <img src={Logo} alt="logo" className="w-16 h-16" />
            </div>

            <h2 className="text-[14px] font-semibold mt-4 text-center truncate">
              Instant Sell
            </h2>

            <div className="flex justify-center items-center mt-3 gap-2 text-[11px]">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                <img src={TVector} alt="" className="w-3 h-3" />
              </div>
              <span className="font-semibold">$1800</span>
            </div>

            <div className="flex justify-center items-center mt-10">
              {showNoItemMsg && (
                <div className="mb-3 bg-black text-white text-xs px-3 py-2 rounded-md shadow-lg">
                  you don't have any item to sell
                </div>
              )}

              <button
                onClick={checkAndNavigate}
                className="flex justify-center items-center mt-6"
              >
                <CustomButton text="Sell Now" />
              </button>
            </div>
          </div>

          {/* Market Cards (Mobile Style) */}
          {marketData && marketData.length > 0 ? (
            marketData.map((item) => (
              <div
                key={item._id}
                className="relative rounded-[16px] p-3 text-white flex flex-col h-[360px]"
                style={{
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                }}
              >
                <div
                  className="h-[150px] rounded-[14px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, #9B7C2F 0%, #4A3E22 100%)",
                  }}
                >
                  <img
                    src={
                      getImageUrl(item.collection?.image) || popularCollections
                    }
                    alt={item.collection?.name || item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-[14px] font-semibold mt-4 truncate">
                  {item.collection?.name || item.name || "Unnamed"}
                </h2>

                <div className="flex justify-between items-center mt-3 text-[11px]">
                  <span className="text-gray-300 font-medium truncate">
                    {item.symbol || item._id?.slice(0, 6) || "N/A"} 🔥
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                      <img src={TVector} alt="" className="w-3 h-3" />
                    </div>
                    <span className="font-semibold truncate">
                      ${item.priceETH || item.chain || item.Type || "USDC"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                  <Link to="/buy-nfa" state={{ item }}>
                    <CustomButton4
                      text="Buy Now"
                      className="!text-xs !py-2 !px-6"
                    />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-white py-8">
              No NFA collections available
            </div>
          )}
        </div>
      </section>

      {/* ---------------- MODALS (same as yours) ---------------- */}
      {/* :white_check_mark: First Modal - Select Item */}
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
                  <h1 className="text-sm lg:text-base font-bold">Monkey Ape</h1>
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
              By clicking "Sell Now", you agree to the Hyper Tek <br /> Terms of
              Service
            </p>
            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button onClick={closeFirstModal}>
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
                      height: "2.0rem", // ~39.59px
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
              {/* :white_check_mark: Large screen - opens second modal */}
              <Link
                to="/wallet-connect"
                onClick={handleSellNow}
                className="hidden md:block"
              >
                <CustomButton4 text="Sell Now" />
              </Link>
              {/* :white_check_mark: Small screen - navigates to /wallet-connect */}
              <Link to="/wallet-connect" className="block md:hidden">
                <CustomButton text="Sell Now" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* {isSecondModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center h-[400px] pt-24 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[400px] text-white">
            <h2 className="text-lg font-bold mb-4">Connect Wallet</h2>
            <div onClick={handleConnectWallet} className="cursor-pointer">
              <img src={symbol} className="w-12 mx-auto" alt="" />
            </div>
          </div>
        </div>
      )} */}

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
