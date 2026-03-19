import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import FullScreenLoader from "../Components/Common/Spinner";
import { BACKEND_BASE_URL, getImageUrl } from "../Config";
import { FiSearch } from "react-icons/fi";
import TVector from "../assets/images/popular/vector.png";
import overview1 from "../assets/images/Overview/overview1.jpg";
import Logo from "../assets/logo1.png";
import NavLinks from "../Components/MarketPlaceCom/NavLinks";
import MarketplaceBanner from "../Components/MarketPlaceCom/MarketplaceBanner";
import LazyImage from "../Components/Common/LazyImage";
import CustomButton from "../Components/Buttons/Button1";
import { useAccount } from "wagmi";
import { useEmailWallet } from "../hooks/useEmailWallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";

function CategoryMarketplace() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const { address: wagmiAddress } = useAccount();
  const { emailWalletAddress } = useEmailWallet();
  const activeAddress = wagmiAddress || emailWalletAddress;
  const { openConnectModal } = useConnectModal();

  const [showWalletModal, setShowWalletModal] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNoItemMsg, setShowNoItemMsg] = useState(false);

  // Check if user has unlisted items in this category
  const checkAndNavigate = async () => {
    try {
      if (!token) {
        toast.error("Please login first");
        return;
      }

      if (!activeAddress) {
        setShowWalletModal(true);
        return;
      }

      const wallet = activeAddress.toLowerCase();

      // Fetch user's owned NFTs
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${wallet}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        // Filter items by current category
        const normalizedCategory = category?.toLowerCase().trim();
        const categoryItems = res.data.nfts.flatMap((item) => {
          if (item.category?.toLowerCase().trim() !== normalizedCategory)
            return [];

          if (!item.isParentCollection || !Array.isArray(item.subCollections))
            return [];

          return item.subCollections.filter((sub) => {
            const ownerMatch =
              sub.owner?.toLowerCase() === wallet?.toLowerCase();
            return ownerMatch && sub.listed === false;
          });
        });

        if (categoryItems.length > 0) {
          navigate("/Profile", { state: { category: category.toLowerCase().trim() } });
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

  useEffect(() => {
    const fetchByCategory = async () => {
      if (!category) return setLoading(false);
      setLoading(true);

      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections?category=${category}`);

        const parents = res.data.collections || res.data.nfts || [];

        let allSubs = [];

        for (const parent of parents) {
          try {
            if (parent.subCollections && parent.subCollections.length) {
              const mapped = parent.subCollections.map((sub) => ({
                ...sub,
                parentId: parent._id,
                parentCategory: parent.category || category,
                parentName: parent.collection?.name || "",
                collection: {
                  name: sub.name,
                  image: sub.image,
                  chain: sub.chain || parent.collection?.chain,
                  Type: sub.Type,
                },
              }));
              allSubs.push(...mapped);
            } else {
              const subRes = await axios.get(
                `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parent._id}/sub-collections`
              );

              if (subRes.data.success && subRes.data.subCollections) {
                const mapped = subRes.data.subCollections.map((sub) => ({
                  ...sub,
                  parentId: parent._id,
                  parentCategory: parent.category || category,
                  parentName: parent.collection?.name || "",
                  collection: {
                    name: sub.name,
                    image: sub.image,
                    chain: sub.chain || parent.collection?.chain,
                    Type: sub.Type,
                  },
                }));
                allSubs.push(...mapped);
              }
            }
          } catch (err) {
            console.error(`Error fetching subs for parent ${parent._id}:`, err);
          }
        }

        setItems(allSubs);
      } catch (err) {
        console.error("Error fetching category data:", err);
        toast.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [category]);

  if (loading) return <FullScreenLoader />;

  const filteredItems = items.filter((item) =>
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      {/* Full-width Banner */}
      <div className="mt-16">
        <MarketplaceBanner
          titleOverride={
            items.length > 0
              ? items[0]?.parentName || items[0]?.collection?.name || undefined
              : category ? category.charAt(0).toUpperCase() + category.slice(1) : undefined
          }
          descOverride={`Explore all ${category || ""} items in the marketplace. Discover unique collections and start your journey.`}
          stats={[
            { num: filteredItems.length, label: "Total Items" },
            { num: filteredItems.filter((i) => i.listed).length, label: "Listed" },
            { num: filteredItems.filter((i) => !i.listed).length, label: "Unlisted" },
          ]}
        />
      </div>

      {/* Nav + Content */}
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 md:px-8">
        {/* NavLinks & Search Section */}
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-4 lg:mb-8">
          <NavLinks />
          <div className="hidden mr-20 md:flex lg:w-[280px] items-center gap-3 lg:gap-[17px] px-4 lg:px-[16px] py-1.5 lg:py-1.5 border border-white/50 rounded-[12px] backdrop-blur-sm">
            <FiSearch className="text-white w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent pl-1 text-white placeholder-gray-300 outline-none text-sm lg:text-[16px] font-inter w-full"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <section className="max-w-[1450px] mx-auto flex flex-col gap-4 lg:gap-8 mb-12 lg:mb-16 px-4 sm:px-6 md:px-8">
        {/* Heading */}
        <div className="flex flex-col gap-2 items-start pl-1 lg:pl-[14px]">
          <h1 className="text-white uppercase text-xl sm:text-2xl lg:text-[30px] font-goldman font-bold">
            {items.length > 0
              ? items[0]?.parentName || items[0]?.collection?.name || "Collection"
              : category
                ? category.charAt(0).toUpperCase() + category.slice(1)
                : "Category"}
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

          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                className="relative rounded-[18px] shadow-md text-white p-5 w-full max-w-sm mx-auto lg:max-w-none h-[420px] flex flex-col"
                style={{
                  background:
                    "linear-gradient(147.75deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                }}
              >
                <LazyImage
                  src={getImageUrl(item.collection?.image)}
                  alt={item.collection?.name || item.name || "Item"}
                  fallback={overview1}
                  className="w-full h-[210px] rounded-[16px]"
                  imgClassName="object-cover object-top"
                />

                <h2 className="text-sm sm:text-base lg:text-lg font-bold mt-2 sm:mt-3 lg:mt-4">
                  {item.collection?.name || item.name || "Unnamed"}
                </h2>

                <div className="flex justify-between items-center mb-2 sm:mb-3 lg:mb-4 mt-3 sm:mt-4 lg:mt-5">
                  <h3 className="text-xs sm:text-sm font-semibold">
                    {item.symbol || item._id?.slice(0, 6) || "N/A"} 🔥
                  </h3>
                  <div className="flex items-center">
                    <img src={TVector} alt="" className="w-2 h-2 lg:w-[10px] lg:h-[9px]" />
                    <h3 className="pl-1 sm:pl-2 text-xs sm:text-sm font-semibold">
                      ${item.priceETH || 0}
                    </h3>
                  </div>
                </div>

                <div className="flex justify-center items-center mt-4">
                  <Link to="/buy-nfa" state={{ item }} className="cursor-pointer flex justify-center w-full">
                    <CustomButton text="Buy Now" className="!text-xs sm:!text-sm lg:!text-base !py-1.5 sm:!py-2 lg:!py-2.5 !px-4 sm:!px-6 lg:!px-8" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-white py-8">
              No items found
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

          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                className="relative rounded-[16px] p-3 text-white flex flex-col h-[360px]"
                style={{
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                }}
              >
                <LazyImage
                  src={getImageUrl(item.collection?.image)}
                  alt={item.name}
                  fallback={overview1}
                  className="w-full h-[160px] rounded-[12px] mb-2"
                  imgClassName="object-cover object-top"
                />

                <h3 className="text-xs font-semibold truncate">
                  {item.collection?.name || item.name || "Unnamed"}
                </h3>

                <div className="flex justify-between items-center mt-1 mb-2">
                  <span className="text-[10px] font-medium">{item.symbol || "N/A"}</span>
                  <div className="flex items-center gap-1">
                    <img src={TVector} alt="" className="w-2 h-2" />
                    <span className="text-[10px] font-semibold">${item.priceETH || 0}</span>
                  </div>
                </div>

                <Link to="/buy-nfa" state={{ item }} className="cursor-pointer mt-auto">
                  <CustomButton text="View" className="!text-xs !py-1 !px-2 w-full" />
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-white py-8">
              No items found
            </div>
          )}
        </div>
      </section>

      {/* WALLET SELECTION MODAL */}
      {showWalletModal && ReactDOM.createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-black/80 flex items-center justify-center backdrop-blur-sm px-4"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-[#1f2937] p-8 rounded-2xl w-full max-w-sm mx-4 border border-white/10 shadow-2xl transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  if (openConnectModal) openConnectModal();
                }}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-blue-500/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                    🌐
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">Browser Wallet</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300">
                      MetaMask, Rainbow, etc.
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 group-hover:text-blue-400">→</div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default CategoryMarketplace;
