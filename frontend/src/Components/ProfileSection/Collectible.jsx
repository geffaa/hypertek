import React, { useEffect, useState } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link, useNavigate } from "react-router-dom";
import TVector from "../../assets/images/popular/vector.png";
import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";

import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { FaUserCircle } from "react-icons/fa";
import FullScreenLoader from "../Common/Spinner";
import { ethers } from "ethers";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
} from "../../Web3/Config";
import CustomButton4 from "../Buttons/Button4";

function MarketPlace() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showMobileList, setShowMobileList] = useState({});
  const [connectingWallet, setConnectingWallet] = useState({});
  const [userHasInteracted, setUserHasInteracted] = useState({});

  /* ================= GET MINTED SUB COLLECTION NFTS ================= */
 const extractMintedNFTs = (data) => {
  console.log("🔍 Raw data received:", data);

  if (!Array.isArray(data)) return [];

  const extracted = [];

  data.forEach((item, index) => {
    // Only characters category
    if (item.category !== "characters") return;

    // If parent collection with subCollections
    if (item.isParentCollection && Array.isArray(item.subCollections)) {
      const ownedUnlistedSubs = item.subCollections.filter((subNft) => {
        const subOwner = subNft.owner?.toLowerCase();
        const walletLower = connectedWallet?.toLowerCase();

        // ✅ Must belong to current wallet AND not listed
        return subOwner === walletLower && !subNft.listed;
      });

      ownedUnlistedSubs.forEach((subNft) => {
        extracted.push({
          _id: subNft._id,
          parentId: item._id,
          name: subNft.name,
          symbol: subNft.symbol,
          image: subNft.image,
          description: subNft.description,
          owner: subNft.owner,
          listed: subNft.listed || false,
          priceETH: subNft.priceETH,
          isFirstSale: subNft.isFirstSale,
          tokenId: subNft.tokenId,
          tokenURI: subNft.tokenURI,
          createdAt: subNft.createdAt,

          // Parent metadata
          category: item.category,
          chain: "ETH",

          isSubCollection: true,
          userOwns: true,
        });
      });
    }
  });

  console.log("✅ Characters NFTs extracted:", extracted.length);
  return extracted;
};


  /* ================= PROFILE ================= */
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserData(res.data.user))
      .catch(() => toast.error("Failed to fetch profile"));
  }, [token]);

  /* ================= INITIAL WALLET CHECK ================= */
  useEffect(() => {
    if (!window.ethereum) {
      setLoading(false);
      return;
    }

    const checkInitialConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const wallet = accounts[0].toLowerCase();
          setConnectedWallet(wallet);
          setIsWalletConnected(true);
          fetchOwnedNFTs(wallet);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking wallet:", err);
        setLoading(false);
      }
    };

    checkInitialConnection();

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [token]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      const wallet = accounts[0].toLowerCase();
      setConnectedWallet(wallet);
      setIsWalletConnected(true);
      fetchOwnedNFTs(wallet);
      // Reset interactions when wallet changes
      setUserHasInteracted({});
    } else {
      setConnectedWallet(null);
      setIsWalletConnected(false);
      setMarketData([]);
      setUserHasInteracted({});
    }
  };

  /* ================= FETCH OWNED NFTS ================= */
  const fetchOwnedNFTs = async (wallet) => {
    try {
      setLoading(true);

      console.log("🔄 Fetching NFTs for wallet:", wallet);

      // Fetch the user's owned NFTs (including sub-collections)
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${wallet}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("📡 Backend Response:", res.data);
      console.log("📦 NFTs Array:", res.data?.nfts);

      if (res.data?.success) {
        console.log("✅ Success! Setting marketData with:", res.data.nfts);
        setMarketData(res.data.nfts);
      } else {
        console.log("⚠️ Response success is false");
      }
    } catch (err) {
      console.error("❌ Error fetching NFTs:", err);
      console.error("Error details:", err.response?.data);
      toast.error("Failed to load NFTs");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CONNECT/INTERACT WITH WALLET FOR ITEM ================= */
  const handleSellNowClick = async (itemId) => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    setConnectingWallet((prev) => ({ ...prev, [itemId]: true }));

    try {
      // 🔁 Force MetaMask to ask again every time
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        toast.error("Wallet not connected");
        return;
      }

      const wallet = accounts[0].toLowerCase();

      setConnectedWallet(wallet);
      setIsWalletConnected(true);

      setUserHasInteracted((prev) => ({
        ...prev,
        [itemId]: true,
      }));

      // Refresh owned NFTs every time (safe + clean)
      await fetchOwnedNFTs(wallet);

      toast.success("Wallet connected!");
    } catch (err) {
      console.error("MetaMask popup error:", err);

      if (err.code === 4001) {
        toast.error("Connection cancelled");
      } else {
        toast.error("Wallet connection failed");
      }
    } finally {
      setConnectingWallet((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  /* ================= NAVIGATE TO BUY-NFA ================= */
  const navigateToBuyNFA = (item) => {
    // Only allow navigation if user has interacted with this item
    if (!userHasInteracted[item._id]) {
      toast.error("Please connect wallet first");
      return;
    }
    navigate("/buy-nfa", { state: { item } });
  };

  if (loading) return <FullScreenLoader />;

  /* ================= FILTER LOGIC ================= */
  const filteredCollections = extractMintedNFTs(marketData);

  console.log("🎯 Final filteredCollections to render:", filteredCollections);
  console.log("📊 Total items to display:", filteredCollections.length);

  return (
    <>
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto mt-[68px] max-w-[2000px]">
          {/* ================= HERO ================= */}
          <div className="relative w-full max-w-[1400px] mx-auto h-[260px] mb-20 overflow-hidden">
            <img
              src={overview1}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* ================= PROFILE ================= */}
          <div className="relative -mt-24 px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-start text-white">
              <div className="relative">
                {userData?.Avatar ? (
                  <img
                    src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full border-4 border-gray-900 object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-28 h-28 text-gray-400" />
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold">
                {userData?.FullName ||
                  userData?.Email?.split("@")[0] ||
                  "Guest"}
              </h2>
              <Link
                to="/edit"
                state={{ userData }}
                className="text-sm underline text-gray-400 hover:text-white"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* ================= NAV ================= */}
          <div className="mt-6 max-w-7xl mx-auto px-4">
            <NavLinks />
          </div>

          {/* ================= NFT CARDS ================= */}
          <section className="relative z-10 px-6 mt-10">
            <GlowingOrb Xaxis={800} Yaxis={100} />

            {filteredCollections.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-white relative gap-16 -mt-8">
                <h2 className="text-lg font-semibold -mt-4">No Item</h2>
                <div className="relative w-full flex justify-center items-center gap-4 top-[-10px]">
                  <img src={FaceOne} alt="Face One" className="w-34 h-24" />
                  <img
                    src={FaceTwo}
                    alt="Face Two"
                    className="absolute top-24 w-28 h-10"
                  />
                </div>
                <Link to="/market-place">
                  <button className="bg-[#002AA8] px-6 py-2 rounded-md hover:bg-[#002AA8]-700 transition">
                    Browse Collection
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {filteredCollections.map((item) => {
                  const isConnecting = connectingWallet[item._id];
                  const hasInteracted = userHasInteracted[item._id];

                  return (
                    <div
                      key={item._id}
                      className="relative rounded-[16px] p-3 sm:p-4 lg:p-5 text-white flex flex-col h-[360px] sm:h-[390px] lg:h-[420px]"
                      style={{
                        background:
                          "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                      }}
                    >
                      <div
                        className="h-[150px] sm:h-[180px] lg:h-[210px] rounded-[14px] overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(180deg, #9B7C2F 0%, #4A3E22 100%)",
                        }}
                      >
                        <img
                          src={`${BACKEND_BASE_URL}${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h2 className="text-[14px] sm:text-[16px] lg:text-[18px] font-semibold mt-4 truncate">
                        {item.name}
                      </h2>

                      <div className="flex justify-between items-center mt-3 text-[11px] sm:text-[13px] lg:text-sm">
                        <span className="font-medium text-gray-300 truncate">
                          {item.symbol} 🔥
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                            <img
                              src={TVector}
                              className="w-3 h-3"
                              alt="chain"
                            />
                          </div>
                          <span className="font-semibold truncate">
                            ${item.priceETH}
                          </span>
                        </div>
                      </div>

                      {/* ================= DESKTOP VIEW ================= */}
                      <div className="hidden md:block mt-auto pt-6 text-center relative group focus-within:outline-none">
                        {/* Always show Sell Now button first, unless user has interacted */}
                        {!hasInteracted ? (
                          <div className="flex justify-center items-center w-full mt-auto pt-6">
                            <button
                              onClick={() => handleSellNowClick(item._id)}
                              disabled={isConnecting}
                              className="w-full flex justify-center"
                            >
                              <CustomButton4
                                text={
                                  isConnecting ? "Connecting..." : "Sell Now"
                                }
                                disabled={isConnecting}
                              />
                            </button>
                          </div>
                        ) : (
                          /* After interaction, show Not Listed with hover effect */
                          <div className="relative group">
                            {/* Default view - Not Listed */}
                            <div className="text-sm text-white py-2 transition-opacity duration-300 group-hover:opacity-0">
                              Not Listed
                            </div>

                            {/* Hover view - List Now button */}
                            <div
                              onClick={() => navigateToBuyNFA(item)}
                              className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            >
                              <CustomButton4 text="List Now" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ================= MOBILE VIEW ================= */}
                      <div className="md:hidden mt-auto pt-6 text-center">
                        {!hasInteracted ? (
                          /* Mobile: Always show Sell Now first */
                          <div className="flex justify-center items-center w-full mt-auto pt-6">
                            <button
                              onClick={() => handleSellNowClick(item._id)}
                              disabled={isConnecting}
                              className="w-full flex justify-center"
                            >
                              <CustomButton4
                                text={
                                  isConnecting ? "Connecting..." : "Sell Now"
                                }
                                disabled={isConnecting}
                              />
                            </button>
                          </div>
                        ) : !showMobileList[item._id] ? (
                          /* Mobile: After interaction, show Not Listed initially */
                          <button
                            onClick={() =>
                              setShowMobileList((prev) => ({
                                ...prev,
                                [item._id]: true,
                              }))
                            }
                            className="text-sm text-white w-full py-2"
                          >
                            Not Listed
                          </button>
                        ) : (
                          /* Mobile: Tapped - show List Now button */
                          <button
                            onClick={() => navigateToBuyNFA(item)}
                            className="w-full"
                          >
                            <CustomButton4 text="List Now" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default MarketPlace;
