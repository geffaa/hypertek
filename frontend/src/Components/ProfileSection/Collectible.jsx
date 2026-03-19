import React, { useEffect, useState } from "react";
import ProfileBanner from "./ProfileBanner";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TVector from "../../assets/images/popular/vector.png";
import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";

import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import LazyImage from "../Common/LazyImage";
import { FaUserCircle } from "react-icons/fa";
import FullScreenLoader from "../Common/Spinner";
import { ethers } from "ethers";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
  BASE_MARKETPLACE_ADDRESS,
} from "../../Web3/Config";
import CustomButton4 from "../Buttons/Button4";

// RainbowKit imports
import { useAccount, useReadContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEmailWallet } from "../../hooks/useEmailWallet";

function MarketPlace() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // RainbowKit hooks
  const {
    emailWalletAddress,
    isEmailWalletConnected,
  } = useEmailWallet();

  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Combine wallet state
  const activeAddress = isEmailWalletConnected ? emailWalletAddress : wagmiAddress;
  const isConnected = isEmailWalletConnected || isWagmiConnected;

  const [connectedWallet, setConnectedWallet] = useState(null);

  // Sync state
  useEffect(() => {
    if (activeAddress) {
      setConnectedWallet(activeAddress.toLowerCase());
    } else {
      setConnectedWallet(null);
    }
  }, [activeAddress]);

  // Read internal balances from Marketplace Contract
  const { data: rawSellerBalance } = useReadContract({
    address: BASE_MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'sellerBalance',
    args: connectedWallet ? [connectedWallet] : undefined,
    query: { enabled: !!connectedWallet }
  });
  const sellerBalance = rawSellerBalance ? ethers.formatUnits(rawSellerBalance, 6) : '0';

  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showMobileList, setShowMobileList] = useState({});
  const [userHasInteracted, setUserHasInteracted] = useState({});
  const [activeCategory, setActiveCategory] = useState(location.state?.category || "");
  const [pendingItemId, setPendingItemId] = useState(null);
  const [hasDefaulted, setHasDefaulted] = useState(false);

  useEffect(() => {
    setActiveCategory(location.state?.category || "");
    // Reset hasDefaulted so it can pick the first tab again if we navigated to a clean /Profile
    if (!location.state?.category) {
      setHasDefaulted(false);
    }
  }, [location.state]);

  /* ================= GET MINTED SUB COLLECTION NFTS ================= */
  const extractMintedNFTs = (data) => {
    console.log("🔍 Raw data received:", data);

    if (!Array.isArray(data)) return [];

    const extracted = [];

    data.forEach((item) => {
      // Only items matching activeCategory
      if ((item.category || "").toLowerCase() !== (activeCategory || "").toLowerCase()) return;

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
            category: item.category,
            chain: "ETH",
            isSubCollection: true,
            userOwns: true,
          });
        });
      }
    });

    console.log(`✅ ${activeCategory} NFTs extracted:`, extracted.length);
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

  /* ================= FETCH OWNED NFTS ================= */
  const fetchOwnedNFTs = async (wallet) => {
    try {
      setLoading(true);

      console.log("🔄 Fetching NFTs for wallet:", wallet);

      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${wallet}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("📡 Backend Response:", res.data);

      if (res.data?.success) {
        console.log("✅ Success! Setting marketData with:", res.data.nfts);
        setMarketData(res.data.nfts);
      }
    } catch (err) {
      console.error("❌ Error fetching NFTs:", err);
      toast.error("Failed to load NFTs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch NFTs when wallet connects or category changes
  useEffect(() => {
    if (isConnected && connectedWallet && token) {
      fetchOwnedNFTs(connectedWallet.toLowerCase());
    } else {
      setMarketData([]);
      setLoading(false);
    }
  }, [isConnected, connectedWallet, token, activeCategory]);

  /* ================= HANDLE SELL NOW CLICK ================= */
  const handleSellNowClick = (itemId) => {
    console.log("🔘 Sell Now clicked for item:", itemId);
    console.log("🔌 Is connected:", isConnected);

    if (!isConnected) {
      // Not connected - open RainbowKit modal
      console.log("❌ Not connected - opening RainbowKit modal");
      setPendingItemId(itemId);
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    // Already connected - mark as interacted
    console.log("✅ Already connected - marking as interacted");
    setUserHasInteracted((prev) => ({
      ...prev,
      [itemId]: true,
    }));

    toast.success("Wallet connected!");
  };

  /* ================= WATCH FOR CONNECTION SUCCESS ================= */
  useEffect(() => {
    if (isConnected && pendingItemId) {
      console.log("✅ Wallet connected! Pending item:", pendingItemId);

      // Wallet just connected - mark the pending item as interacted
      setUserHasInteracted((prev) => ({
        ...prev,
        [pendingItemId]: true,
      }));

      toast.success("Wallet connected successfully!");

      // Reset pending item
      setPendingItemId(null);
    }
  }, [isConnected, pendingItemId]);

  // When NavLinks triggers a category selection, update activeCategory
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
  };

  const handleCategoriesLoaded = (cats) => {
    if (!activeCategory && cats.length > 0 && !hasDefaulted) {
      setActiveCategory(cats[0]);
      setHasDefaulted(true);
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
          <ProfileBanner />

          {/* ================= PROFILE ================= */}
          <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex flex-col items-start text-white">
            <div className="relative">
              {userData?.Avatar ? (
                <img
                  src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full border-4 border-gray-900 object-cover -mt-14"
                />
              ) : (
                <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg w-28 h-28 border-4 border-gray-900 -mt-14">
                  <FaUserCircle className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            <h2 className="mt-4 text-xl sm:text-2xl font-semibold mb-1">
              {userData?.FullName ||
                userData?.Email?.split("@")[0] ||
                "Guest"}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
              <span className="font-mono">
                {connectedWallet ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}` : "No Wallet Connected"}
              </span>
              <Link
                to="/edit"
                state={{ userData }}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Edit Profile</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                <img src={TVector} className="w-3 h-3" alt="chain" />
              </div>
              <span className="text-lg font-bold text-white font-mono">
                ${Number(sellerBalance) > 0 ? Number(sellerBalance).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          {/* ================= NAV ================= */}
          <div className="mt-6 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
            <NavLinks
              onSelectCategory={handleSelectCategory}
              selectedCategory={activeCategory}
              onCategoriesLoaded={handleCategoriesLoaded}
            />
          </div>



          {/* ================= NFT CARDS ================= */}
          <section className="relative z-10 mt-10">
            <GlowingOrb Xaxis={800} Yaxis={100} />

            {filteredCollections.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-white relative gap-16 -mt-8">
                <h2 className="text-lg font-semibold -mt-4">
                  {isConnected ? "No Items Available" : "Connect Wallet to View Your Items"}
                </h2>
                <div className="relative w-full flex justify-center items-center gap-4 top-[-10px]">
                  <img src={FaceOne} alt="Face One" className="w-34 h-24" />
                  <img
                    src={FaceTwo}
                    alt="Face Two"
                    className="absolute top-24 w-28 h-10"
                  />
                </div>
                {!isConnected ? (
                  <button
                    onClick={() => openConnectModal && openConnectModal()}
                    className="bg-[#002AA8] px-6 py-2 rounded-md hover:bg-[#002AA8]-700 transition"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <Link to="/market-place">
                    <button className="bg-[#002AA8] px-6 py-2 rounded-md hover:bg-[#002AA8]-700 transition">
                      Browse Collection
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                {filteredCollections.map((item) => {
                  const hasInteracted = userHasInteracted[item._id];
                  const isNFA = item.isNFA || item.type === "NFA";

                  return (
                    <div
                      key={item._id}
                      className="relative rounded-xl overflow-hidden flex flex-col text-white"
                      style={{
                        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
                        border: isNFA ? "1px solid rgba(0,80,255,0.45)" : "1px solid rgba(255,255,255,0.09)",
                      }}
                    >
                      {/* Image */}
                      <div className="relative">
                        <LazyImage
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-[120px] sm:h-[130px]"
                          imgClassName="object-cover"
                        />
                        {isNFA && (
                          <>
                            <div className="absolute inset-0 ring-2 ring-inset ring-[#002AA8] pointer-events-none rounded-none" />
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                              style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.5)" }}>
                              NFA
                            </div>
                          </>
                        )}
                        {/* Unlisted badge */}
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}>
                          Unlisted
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <p className="text-white/90 text-sm font-semibold truncate">{item.name}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-white/35 text-[10px] uppercase tracking-wide">{item.symbol}</span>
                          <span className="text-white/75 text-[12px] font-semibold">
                            {item.priceETH ? `${item.priceETH} USDC` : "—"}
                          </span>
                        </div>

                        {/* CTA */}
                        <div className="mt-auto pt-2">
                          {!hasInteracted ? (
                            <button
                              onClick={() => handleSellNowClick(item._id)}
                              className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-all"
                              style={{ background: "rgba(0,42,168,0.7)", border: "1px solid rgba(0,80,255,0.4)" }}
                            >
                              Connect &amp; List
                            </button>
                          ) : (
                            <button
                              onClick={() => navigateToBuyNFA(item)}
                              className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-all"
                              style={{ background: "rgba(0,42,168,0.85)", border: "1px solid rgba(0,80,255,0.5)" }}
                            >
                              List for Sale
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div >
    </>
  );
}

export default MarketPlace;