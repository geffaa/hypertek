import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import ProfileBanner from "./ProfileBanner";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import NavLinks from "../ProfileSection/Navlinks";
import ProfileListingsTab from "./ProfileListingsTab";
import ProfileQuestingTab from "./ProfileQuestingTab";
import ProfileBountyTab from "./ProfileBountyTab";
import StickyAvatarSidebar from "./StickyAvatarSidebar";

import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import LazyImage from "../Common/LazyImage";
import FullScreenLoader from "../Common/Spinner";
import { ethers } from "ethers";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
  BASE_MARKETPLACE_ADDRESS,
} from "../../Web3/Config";

// RainbowKit imports
import { useAccount, useReadContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import UserProfileHeader from "./UserProfileHeader";


function MarketPlace() {
  const { t } = useTranslation();
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // RainbowKit hooks
  const {
    emailWalletAddress,
    isEmailWalletConnected,
  } = useEmailWallet();

  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Combine wallet state — fallback to Redux user wallet so items show even without active wagmi session
  const activeAddress = isEmailWalletConnected ? emailWalletAddress : wagmiAddress;
  const isConnected = isEmailWalletConnected || isWagmiConnected;
  const fallbackWallet = user?.WalletAddress || user?.MetaMaskAddress || null;

  const [connectedWallet, setConnectedWallet] = useState(null);

  // Sync state
  useEffect(() => {
    const addr = activeAddress || fallbackWallet;
    setConnectedWallet(addr ? addr.toLowerCase() : null);
  }, [activeAddress, fallbackWallet]);

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
  const [searchParams, setSearchParams] = useSearchParams();
  const gridRef = useRef(null);
  const contentRef = useRef(null);

  // Tab ↔ URL slug mapping
  const TAB_SLUG = {
    "My Collectibles": "collectibles",
    "Listings": "listings",
    "Activities": "activities",
    "Trade": "trade",
    "Auction": "auction",
    "Questing": "questing",
    "Bounty": "bounty",
  };
  const SLUG_TAB = Object.fromEntries(Object.entries(TAB_SLUG).map(([k, v]) => [v, k]));

  const tabFromUrl = SLUG_TAB[searchParams.get("tab")] || "My Collectibles";

  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showMobileList, setShowMobileList] = useState({});
  const [userHasInteracted, setUserHasInteracted] = useState({});
  const [activeCategory, setActiveCategory] = useState(location.state?.category || "");
  const [pendingItemId, setPendingItemId] = useState(null);
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // ---- Activities state ----
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txFilter, setTxFilter] = useState("all");

  // ---- Trade (my posted trades) state ----
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  // ---- Auction (my posted auctions) state ----
  const [myAuctions, setMyAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const [auctionStatusFilter, setAuctionStatusFilter] = useState("active");

  // ---- Pagination ----
  const PAGE_SIZE = 10;
  const ACT_PAGE_SIZE = 10;
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [tradePage, setTradePage] = useState(1);
  const [auctionPage, setAuctionPage] = useState(1);

  // local flags for venue cross-reference in My Collectibles grid
  const [sessionAuctionIds] = useState(new Set());
  const [sessionTradeNames] = useState(new Set());


  useEffect(() => {
    setActiveCategory(location.state?.category || "");
  }, [location.state]);

  /* ================= GET MINTED SUB COLLECTION NFTS ================= */
  const extractMintedNFTs = (data) => {
    console.log("🔍 Raw data received:", data);

    if (!Array.isArray(data)) return [];

    const extracted = [];

    data.forEach((item) => {
      // Only items matching activeCategory
      if (activeCategory && (item.category || "").toLowerCase() !== activeCategory.toLowerCase()) return;

      // If parent collection with subCollections
      if (item.isParentCollection && Array.isArray(item.subCollections)) {
        const ownedUnlistedSubs = item.subCollections.filter((subNft) => {
          const subOwner = subNft.owner?.toLowerCase();
          const walletLower = connectedWallet?.toLowerCase();

          // Show ALL items owned by current wallet (listed + unlisted)
          return subOwner === walletLower;
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
            isNFA: subNft.isNFA || false,
            minimumBuybackUSD: subNft.minimumBuybackUSD || 0,
          });
        });
      }
    });

    console.log(`${activeCategory} NFTs extracted:`, extracted.length);
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
      .catch((err) => {
        if (err?.response?.status !== 401) {
          console.error("Profile fetch error:", err?.response?.data || err.message);
        }
      });
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
        console.log("Success! Setting marketData with:", res.data.nfts);
        setMarketData(res.data.nfts);
      }
    } catch (err) {
      console.error(" Error fetching NFTs:", err);
      toast.error("Failed to load NFTs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch NFTs when wallet connects or category changes
  // Also fetch using fallback wallet (Redux) when wagmi isn't connected
  useEffect(() => {
    if (connectedWallet && token) {
      fetchOwnedNFTs(connectedWallet.toLowerCase());
    } else {
      setMarketData([]);
      setLoading(false);
    }
  }, [connectedWallet, token, activeCategory]);

  /* ================= HANDLE SELL NOW CLICK ================= */
  const handleSellNowClick = (itemId) => {
    console.log("🔘 Sell Now clicked for item:", itemId);
    console.log("🔌 Is connected:", isConnected);

    if (!isConnected) {
      // Not connected - open RainbowKit modal
      console.log(" Not connected - opening RainbowKit modal");
      setPendingItemId(itemId);
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    // Already connected - mark as interacted
    console.log("Already connected - marking as interacted");
    setUserHasInteracted((prev) => ({
      ...prev,
      [itemId]: true,
    }));

    toast.success("Wallet connected!");
  };

  /* ================= WATCH FOR CONNECTION SUCCESS ================= */
  useEffect(() => {
    if (isConnected && pendingItemId) {
      console.log("Wallet connected! Pending item:", pendingItemId);

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

  // ---- Fetch transactions when Activities tab is active ----
  useEffect(() => {
    if (activeTab !== "Activities" || !connectedWallet || !token) return;
    setTxLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/nft/user/transactions/${connectedWallet}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTransactions(res.data?.transactions || []))
      .catch((err) => { console.error("Activities fetch error:", err.response?.status, err.message); setTransactions([]); })
      .finally(() => setTxLoading(false));
  }, [activeTab, connectedWallet, token]);

  // ---- Fetch trade posts (eager — needed for venue badges in My Collectibles) ----
  const fetchOffers = () => {
    if (!connectedWallet) return;
    setOffersLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/trade`, {
        params: { type: "trade", posterWallet: connectedWallet, status: "open", limit: 50 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setOffers(res.data?.trades || []))
      .catch(() => setOffers([]))
      .finally(() => setOffersLoading(false));
  };
  useEffect(() => { fetchOffers(); }, [connectedWallet, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Fetch user's posted auctions (eager — needed for venue badges in My Collectibles) ----
  const fetchAuctions = () => {
    if (!connectedWallet) return;
    setAuctionsLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/auction/seller/${connectedWallet}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setMyAuctions(Array.isArray(res.data) ? res.data : res.data?.auctions || []))
      .catch(() => setMyAuctions([]))
      .finally(() => setAuctionsLoading(false));
  };
  useEffect(() => { fetchAuctions(); }, [connectedWallet, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Cancel trade ----
  const handleCancelTrade = async (tradeId) => {
    if (!window.confirm("Cancel this trade listing?")) return;
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/trade/${tradeId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Trade cancelled");
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel trade");
    }
  };

  // ---- Cancel auction ----
  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm("Cancel this auction? (Only possible if no bids have been placed.)")) return;
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/auction/${auctionId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Auction cancelled");
      fetchAuctions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel auction");
    }
  };


  // ---- Utility helpers ----
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const shortAddr = (addr) => {
    if (!addr || addr.length < 10) return addr || "—";
    return `${addr.slice(0, 6)}\u2026${addr.slice(-4)}`;
  };

  // Category sub-filter within My Collectibles tab
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setTxFilter("all");
    setActivitiesPage(1);
  };

  const handleCategoriesLoaded = (_cats) => {
    // Do not auto-select — default tab is "All"
  };

  /* ================= NAVIGATE TO BUY-NFA ================= */
  const navigateToBuyNFA = (item) => {
    // Only allow navigation if user has interacted with this item
    if (!userHasInteracted[item._id]) {
      toast.error("Please connect wallet first");
      return;
    }
    navigate("/buy-nfa", { state: { item, parentId: item.parentId } });
  };

  if (loading) return <FullScreenLoader />;

  /* ================= FILTER LOGIC ================= */
  const filteredCollections = extractMintedNFTs(marketData);

  console.log("🎯 Final filteredCollections to render:", filteredCollections);
  console.log("📊 Total items to display:", filteredCollections.length);

  return (
    <>
      <div className="bg-transparent">
        <div className="mx-auto mt-[68px] max-w-[2000px] pb-16">
          {/* ================= HERO ================= */}
          <ProfileBanner />

          {/* ================= PROFILE ================= */}
          <div>
            <UserProfileHeader
              userData={userData}
              connectedWallet={connectedWallet}
              sellerBalance={sellerBalance}
            />
          </div>

          {/* ================= STICKY NAV BAR ================= */}
          <div
            style={{
              position: "sticky",
              top: 68,
              zIndex: 40,
              background: "rgba(6,6,16,0.96)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
              {/* Compact action buttons */}
              <div className="flex items-center gap-2 pt-2 pb-1 flex-wrap">
                <Link
                  to="/edit"
                  state={{ userData }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:brightness-125"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {t("profile.editProfile", "Edit Profile")}
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:brightness-125"
                  style={{ background: "linear-gradient(180deg,#002AA8 0%,#001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                  {t("profile.dashboard", "Dashboard")}
                </Link>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <img src="/usdc-logo.svg" className="w-3.5 h-3.5" alt="USDC" />
                  <span className="text-xs font-bold text-white font-mono">
                    ${Number(sellerBalance) > 0 ? Number(sellerBalance).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
              {/* Tabs */}
              <div className="pb-2 mt-3">
                <NavLinks
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setSearchParams({ tab: TAB_SLUG[tab] });
                    if (tab !== "My Collectibles") setActiveCategory("");
                    requestAnimationFrame(() => {
                      if (!contentRef.current) return;
                      const top = contentRef.current.getBoundingClientRect().top + window.scrollY - 160;
                      window.scrollTo({ top, behavior: "instant" });
                    });
                  }}
                  activeCategory={activeCategory}
                  onCategoryChange={handleSelectCategory}
                  onCategoriesLoaded={handleCategoriesLoaded}
                />
              </div>
            </div>
          </div>



          {/* ================= CONTENT AREA ================= */}
          <section ref={contentRef} className="relative z-10 mt-8" style={{ overflowY: "clip" }}>

            {/* ---- MY COLLECTIBLES: NFT Grid ---- */}
            {activeTab === "My Collectibles" && (() => {
              const gridItems = filteredCollections;

              return (
                <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                  {gridItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white relative gap-16 -mt-8">
                      <h2 className="text-lg font-semibold -mt-4">
                        {isConnected ? t("profile.noItemsAvailable", "No Items Available") : t("profile.connectWalletToView", "Connect Wallet to View Your Items")}
                      </h2>
                      <div className="relative w-full flex justify-center items-center gap-4 top-[-10px]">
                        <img src={FaceOne} alt="Face One" className="w-34 h-24" />
                        <img src={FaceTwo} alt="Face Two" className="absolute top-24 w-28 h-10" />
                      </div>
                      {!isConnected ? (
                        <button
                          onClick={() => openConnectModal && openConnectModal()}
                          className="bg-[#002AA8] px-6 py-2 rounded-md hover:bg-[#002AA8]-700 transition"
                        >
                          {t("profile.connectWallet", "Connect Wallet")}
                        </button>
                      ) : (
                        <Link to="/market-place">
                          <button className="bg-[#002AA8] px-6 py-2 rounded-md hover:bg-[#002AA8]-700 transition">
                            {t("profile.browseCollection", "Browse Collection")}
                          </button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                      {gridItems.map((item) => {
                        const onAuction = myAuctions.some((a) => String(a.subCollectionId) === String(item._id) && a.status === "active")
                          || sessionAuctionIds.has(item._id);
                        const onTrade = offers.some((t) => t.offering === item.name && t.status === "open")
                          || sessionTradeNames.has(item.name);
                        const anyVenue = item.listed || onAuction || onTrade;
                        return (
                          <div
                            key={item._id}
                            className="group relative rounded-2xl overflow-hidden text-white flex flex-col cursor-pointer"
                            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${anyVenue ? "rgba(74,222,128,0.22)" : "rgba(255,255,255,0.08)"}` }}
                          >
                            {/* Image */}
                            <div className="relative w-full aspect-square overflow-hidden bg-[#0d1632]">
                              <LazyImage
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                                imgClassName="object-cover"
                              />
                              {item.category && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white/80 capitalize"
                                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                                  {item.category}
                                </div>
                              )}
                              {/* Venue badges stacked top-right */}
                              <div className="absolute top-2 right-2 flex flex-col gap-0.5 items-end">
                                {item.listed && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-green-300"
                                    style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)", border: "1px solid rgba(74,222,128,0.35)" }}>
                                    {t("profile.badgeMarket", "Market")}
                                  </span>
                                )}
                                {onAuction && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300"
                                    style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)", border: "1px solid rgba(251,191,36,0.35)" }}>
                                    {t("profile.badgeAuction", "Auction")}
                                  </span>
                                )}
                                {onTrade && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-300"
                                    style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)", border: "1px solid rgba(59,130,246,0.35)" }}>
                                    {t("profile.badgeTrade", "Trade")}
                                  </span>
                                )}
                                {!anyVenue && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white/40"
                                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                                    {t("profile.badgeUnlisted", "Unlisted")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-col p-3 gap-0.5 flex-1">
                              <h3 className="text-sm font-semibold text-white truncate">{item.name || "Unnamed"}</h3>
                              <p className="text-[11px] text-white/40 truncate flex items-center gap-1">
                                {item.priceETH ? (
                                  <>
                                    <img src="/usdc-logo.svg" alt="USDC" className="w-3 h-3 inline-block" />
                                    {item.priceETH} USDC
                                  </>
                                ) : t("profile.noPriceSet", "No price set")}
                              </p>
                            </div>

                            {/* CTA */}
                            <div className="px-3 pb-3 flex flex-col gap-1.5">
                              {item.listed ? (
                                <button
                                  onClick={() => navigate("/buy-nfa", { state: { item, parentId: item.parentId } })}
                                  className="w-full h-8 rounded-lg text-white text-xs font-semibold transition-all hover:brightness-110"
                                  style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}
                                >
                                  {t("profile.viewListing", "View Listing →")}
                                </button>
                              ) : isConnected ? (
                                <button
                                  onClick={() => navigate("/dashboard/collections")}
                                  className="w-full h-8 rounded-lg text-white text-xs font-semibold transition-all hover:brightness-110"
                                  style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
                                >
                                  {t("profile.manageInDashboard", "Manage in Dashboard →")}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSellNowClick(item._id)}
                                  className="w-full h-8 rounded-lg text-white text-xs font-semibold transition-all"
                                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                                >
                                  {t("profile.connectWallet", "Connect Wallet")}
                                </button>
                              )}
                              {isConnected && (
                                <Link
                                  to="/dashboard/collections"
                                  className="w-full h-7 rounded-lg text-white/40 hover:text-white/70 text-[10px] font-medium transition-all flex items-center justify-center gap-1"
                                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  {t("profile.editDeleteDashboard", "Edit / Delete in Dashboard")}
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ---- LISTINGS VIEW ---- */}
            {activeTab === "Listings" && (
              <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                <ProfileListingsTab token={token} />
              </div>
            )}

            {/* ---- ACTIVITIES VIEW ---- */}
            {activeTab === "Activities" && (() => {
              const TX_FILTERS = [
                { key: "all", label: t("profile.activities.filterAll", "All") },
                { key: "buy", label: t("profile.activities.filterBuy", "Buy") },
                { key: "sell", label: t("profile.activities.filterSold", "Sold") },
              ];
              const filtered = txFilter === "all"
                ? transactions
                : transactions.filter((tx) => tx.type === txFilter);
              return (
                <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                  {/* Filter chips */}
                  <div className="flex gap-2 mb-4">
                    {TX_FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setTxFilter(f.key)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          background: txFilter === f.key ? "#002AA8" : "rgba(255,255,255,0.06)",
                          color: txFilter === f.key ? "#fff" : "rgba(255,255,255,0.5)",
                          border: txFilter === f.key ? "1px solid rgba(0,80,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                    <span className="ml-auto text-white/25 text-xs self-center">{filtered.length} {t("profile.activities.records", "records")}</span>
                  </div>

                  {/* Table always renders — body pads to 10-row minimum height */}
                  {(() => {
                    const ROW_H = 52;
                    const MIN_ROWS = 10;
                    const totalPages = Math.ceil(filtered.length / ACT_PAGE_SIZE);
                    const paged = filtered.slice((activitiesPage - 1) * ACT_PAGE_SIZE, activitiesPage * ACT_PAGE_SIZE);
                    const padCount = Math.max(0, MIN_ROWS - paged.length);
                    return (
                      <div className="rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)", overflow: "clip" }}>
                        {/* Sticky header */}
                        <div className="overflow-x-auto" style={{ position: "sticky", top: 158, zIndex: 5, background: "rgba(4,8,28,0.98)" }}>
                          <div className="grid min-w-[640px] gap-4 px-5 py-5 text-[11px] font-semibold uppercase tracking-widest text-white/30"
                            style={{ gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr 1.5fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <span>{t("profile.activities.colItem", "Item")}</span><span>{t("profile.activities.colType", "Type")}</span><span>{t("profile.activities.colPrice", "Price")}</span><span>{t("profile.activities.colFrom", "From")}</span><span>{t("profile.activities.colTo", "To")}</span><span className="text-right">{t("profile.activities.colDate", "Date")}</span>
                          </div>
                        </div>

                        {/* Body */}
                        {txLoading ? (
                          /* Skeleton rows */
                          <div className="overflow-x-auto">
                            {Array.from({ length: MIN_ROWS }).map((_, i) => (
                              <div key={i} className="grid min-w-[640px] gap-4 px-5 items-center"
                                style={{ height: ROW_H, gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr 1.5fr 1fr", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                {Array.from({ length: 6 }).map((__, j) => (
                                  <div key={j} className="h-3 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : filtered.length === 0 ? (
                          <div className="overflow-x-auto">
                            <div className="flex items-center justify-center text-white/25 min-w-[640px]"
                              style={{ height: ROW_H, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                              <p className="text-sm">{t("profile.activities.noTransactions", "No transactions yet")}</p>
                            </div>
                            {Array.from({ length: MIN_ROWS - 1 }).map((_, i) => (
                              <div key={i} className="min-w-[640px]" style={{ height: ROW_H, borderTop: "1px solid rgba(255,255,255,0.04)" }} />
                            ))}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            {paged.map((tx, i) => (
                              <div key={i} className="grid min-w-[640px] gap-4 px-5 py-3 items-center text-sm"
                                style={{ gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr 1.5fr 1fr", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                <span className="text-white/85 text-[13px] font-medium truncate">{tx.itemName || "—"}</span>
                                <span className={`text-xs font-bold ${tx.type === "buy" ? "text-blue-400" : "text-green-400"}`}>
                                  {tx.type === "buy" ? t("profile.activities.typeBought", "Bought") : tx.type === "sell" ? t("profile.activities.typeSold", "Sold") : tx.type || "—"}
                                </span>
                                <span className="text-white/80 text-[13px] font-semibold">{tx.priceETH ? `${tx.priceETH} USDC` : "—"}</span>
                                <span className="text-white/45 text-[12px] font-mono truncate" data-tooltip={tx.seller}>{shortAddr(tx.seller)}</span>
                                <span className="text-white/45 text-[12px] font-mono truncate" data-tooltip={tx.buyer}>{shortAddr(tx.buyer)}</span>
                                <span className="text-white/30 text-[11px] text-right whitespace-nowrap">{tx.createdAt ? timeAgo(tx.createdAt) : "—"}</span>
                              </div>
                            ))}
                            {/* Pad to 10-row minimum */}
                            {Array.from({ length: padCount }).map((_, i) => (
                              <div key={`pad-${i}`} className="min-w-[640px]" style={{ height: ROW_H, borderTop: "1px solid rgba(255,255,255,0.04)" }} />
                            ))}
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(4,8,28,0.6)" }}>
                            <span className="text-white/30 text-xs">{(activitiesPage - 1) * ACT_PAGE_SIZE + 1}–{Math.min(activitiesPage * ACT_PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                            <div className="flex gap-1">
                              <button onClick={() => setActivitiesPage(p => Math.max(1, p - 1))} disabled={activitiesPage === 1}
                                className="px-2.5 py-1 rounded text-xs text-white/50 hover:text-white disabled:opacity-30 transition-colors"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>←</button>
                              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p = totalPages <= 7 ? i + 1 : activitiesPage <= 4 ? i + 1 : activitiesPage >= totalPages - 3 ? totalPages - 6 + i : activitiesPage - 3 + i;
                                return (
                                  <button key={p} onClick={() => setActivitiesPage(p)}
                                    className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                                    style={{ background: activitiesPage === p ? "#002AA8" : "rgba(255,255,255,0.06)", border: `1px solid ${activitiesPage === p ? "rgba(0,80,255,0.4)" : "rgba(255,255,255,0.1)"}`, color: activitiesPage === p ? "#fff" : "rgba(255,255,255,0.45)" }}>{p}</button>
                                );
                              })}
                              <button onClick={() => setActivitiesPage(p => Math.min(totalPages, p + 1))} disabled={activitiesPage === totalPages}
                                className="px-2.5 py-1 rounded text-xs text-white/50 hover:text-white disabled:opacity-30 transition-colors"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>→</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* ---- TRADE VIEW ---- */}
            {activeTab === "Trade" && (() => {
              const tradeData = offers;
              const isLoading = offersLoading;
              const statusColors = {
                open: { text: "text-green-400", bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.25)" },
                accepted: { text: "text-amber-300", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)" },
                completed: { text: "text-blue-400", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)" },
                cancelled: { text: "text-white/25", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
              };
              const totalPages = Math.ceil(tradeData.length / PAGE_SIZE);
              const paged = tradeData.slice((tradePage - 1) * PAGE_SIZE, tradePage * PAGE_SIZE);
              return (
                <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    {!connectedWallet ? (
                      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                        <p className="text-sm">{t("profile.trade.noWallet", "Connect your wallet to view your trade listings")}</p>
                      </div>
                    ) : isLoading ? (
                      <div className="text-white/50 text-sm py-16 text-center">{t("profile.trade.loading", "Loading your trade listings...")}</div>
                    ) : tradeData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                        <p className="text-sm">{t("profile.trade.noListings", "No active trade listings")}</p>
                      </div>
                    ) : (
                      <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "clip" }}>
                        {/* Sticky table header */}
                        <div className="overflow-x-auto" style={{ position: "sticky", top: 158, zIndex: 5, background: "rgba(4,8,28,0.98)" }}>
                          <div className="grid min-w-[640px] px-4 py-5 text-[10px] font-semibold uppercase tracking-widest text-white/30"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 0.8fr 0.7fr" }}>
                            <span>{t("profile.trade.colTradeNo", "Trade No")}</span><span>{t("profile.trade.colOffering", "Offering")}</span><span>{t("profile.trade.colRequesting", "Requesting")}</span><span>{t("profile.trade.colCategory", "Category")}</span><span>{t("profile.trade.colStatus", "Status")}</span><span></span>
                          </div>
                        </div>
                        {/* Body — natural page scroll */}
                        <div className="overflow-x-auto">
                          {paged.map((trade, i) => {
                            const c = statusColors[trade.status] || statusColors.open;
                            const resolvedCat = trade.category || "general";
                            const canCancel = trade.status === "open" || trade.status === "accepted";
                            return (
                              <div key={trade._id} className="grid min-w-[640px] px-4 py-3 items-center"
                                style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 0.8fr 0.7fr" }}>
                                <span className="text-white/60 text-xs font-mono">#{String(trade._id).slice(-6).toUpperCase()}</span>
                                <span className="text-white/80 text-xs truncate">{trade.offering || "—"}</span>
                                <span className="text-white/60 text-xs truncate italic">{trade.requesting || "—"}</span>
                                <span className="text-white/40 text-xs truncate capitalize">{resolvedCat}</span>
                                <span className={`text-[10px] font-semibold capitalize inline-block w-fit ${c.text}`}
                                  style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 7px" }}>{trade.status}</span>
                                <div className="flex justify-end">
                                  {canCancel && (
                                    <button
                                      onClick={() => handleCancelTrade(trade._id)}
                                      className="text-[10px] font-semibold px-2 py-1 rounded transition-opacity hover:opacity-80"
                                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                                    >
                                      {t("profile.trade.cancel", "Cancel")}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(4,8,28,0.6)" }}>
                            <span className="text-white/30 text-xs">{(tradePage - 1) * PAGE_SIZE + 1}–{Math.min(tradePage * PAGE_SIZE, tradeData.length)} of {tradeData.length}</span>
                            <div className="flex gap-1">
                              <button onClick={() => setTradePage(p => Math.max(1, p - 1))} disabled={tradePage === 1}
                                className="px-2.5 py-1 rounded text-xs text-white/50 hover:text-white disabled:opacity-30" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>←</button>
                              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p = totalPages <= 7 ? i + 1 : tradePage <= 4 ? i + 1 : tradePage >= totalPages - 3 ? totalPages - 6 + i : tradePage - 3 + i;
                                return <button key={p} onClick={() => setTradePage(p)} className="px-2.5 py-1 rounded text-xs font-medium"
                                  style={{ background: tradePage === p ? "#002AA8" : "rgba(255,255,255,0.06)", border: `1px solid ${tradePage === p ? "rgba(0,80,255,0.4)" : "rgba(255,255,255,0.1)"}`, color: tradePage === p ? "#fff" : "rgba(255,255,255,0.45)" }}>{p}</button>;
                              })}
                              <button onClick={() => setTradePage(p => Math.min(totalPages, p + 1))} disabled={tradePage === totalPages}
                                className="px-2.5 py-1 rounded text-xs text-white/50 hover:text-white disabled:opacity-30" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>→</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="hidden xl:block"><StickyAvatarSidebar /></div>
                </div>
              );
            })()}

            {/* ---- AUCTION VIEW ---- */}
            {activeTab === "Auction" && (() => {
              const AUCTION_STATUS_FILTERS = [
                { key: "active", label: t("profile.auction.filterActive", "Active") },
                { key: "ended", label: t("profile.auction.filterEnded", "Ended") },
                { key: "sold", label: t("profile.auction.filterSold", "Sold") },
                { key: "all", label: t("profile.activities.filterAll", "All") },
              ];
              const filteredAuctions = auctionStatusFilter === "all"
                ? myAuctions
                : myAuctions.filter((a) => a.status === auctionStatusFilter);
              const isLoading = auctionsLoading;
              const statusColors = {
                active: { text: "text-green-400", bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.25)" },
                ended: { text: "text-amber-300", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)" },
                sold: { text: "text-blue-400", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)" },
                cancelled: { text: "text-white/25", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
              };
              const totalPages = Math.ceil(filteredAuctions.length / PAGE_SIZE);
              const paged = filteredAuctions.slice((auctionPage - 1) * PAGE_SIZE, auctionPage * PAGE_SIZE);
              return (
                <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex gap-4 items-start">
                  <div className="flex-1 min-w-0">
                    {/* Status filter pills */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {AUCTION_STATUS_FILTERS.map((f) => (
                        <button
                          key={f.key}
                          onClick={() => { setAuctionStatusFilter(f.key); setAuctionPage(1); }}
                          className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                          style={auctionStatusFilter === f.key
                            ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.5)", color: "#fff" }
                            : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                          }
                        >{f.label}</button>
                      ))}
                    </div>

                    {!connectedWallet ? (
                      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                        <p className="text-sm">{t("profile.auction.noWallet", "Connect your wallet to view your auction listings")}</p>
                      </div>
                    ) : isLoading ? (
                      <div className="text-white/50 text-sm py-16 text-center">{t("profile.auction.loading", "Loading your auctions...")}</div>
                    ) : filteredAuctions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                        <p className="text-sm">{t("profile.auction.noListings", "No auction listings")}</p>
                      </div>
                    ) : (
                      <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "clip" }}>
                        {/* Sticky table header */}
                        <div className="overflow-x-auto" style={{ position: "sticky", top: 158, zIndex: 5, background: "rgba(4,8,28,0.98)" }}>
                          <div className="grid min-w-[700px] px-4 py-5 text-[10px] font-semibold uppercase tracking-widest text-white/30"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.8fr 0.7fr" }}>
                            <span>{t("profile.auction.colAuctionNo", "Auction No")}</span><span>{t("profile.auction.colItem", "Item")}</span><span>{t("profile.auction.colStartPrice", "Start Price")}</span><span>{t("profile.auction.colCurrentBid", "Current Bid")}</span><span>{t("profile.auction.colEnds", "Ends")}</span><span>{t("profile.auction.colStatus", "Status")}</span><span></span>
                          </div>
                        </div>
                        {/* Body — natural page scroll */}
                        <div className="overflow-x-auto">
                          {paged.map((auction, i) => {
                            const c = statusColors[auction.status] || statusColors.ended;
                            const endDate = auction.endTime ? new Date(auction.endTime) : null;
                            const diff = endDate ? endDate - Date.now() : 0;
                            const timeStr = diff > 0
                              ? (() => { const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000); return d > 0 ? `${d}d ${h}h` : `${h}h`; })()
                              : t("profile.auction.ended", "Ended");
                            const canCancel = auction.status === "active" && (!auction.bidHistory || auction.bidHistory.length === 0);
                            return (
                              <div key={auction._id} className="grid min-w-[700px] px-4 py-3 items-center"
                                style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.8fr 0.7fr" }}>
                                <span className="text-white/60 text-xs font-mono">#{String(auction._id).slice(-6).toUpperCase()}</span>
                                <span className="text-white/80 text-xs truncate">{auction.title || auction.itemName || "—"}</span>
                                <span className="text-white/60 text-xs">{auction.startPrice ? `$${auction.startPrice}` : "—"}</span>
                                <span className="text-green-300/80 text-xs font-medium">{auction.currentBid ? `$${auction.currentBid}` : t("profile.auction.noBids", "No bids")}</span>
                                <span className={`text-xs ${diff > 0 && diff < 86400000 ? "text-red-400" : "text-white/50"}`}>{timeStr}</span>
                                <span className={`text-[10px] font-semibold capitalize inline-block w-fit ${c.text}`}
                                  style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 7px" }}>{auction.status}</span>
                                <div className="flex justify-end">
                                  {canCancel && (
                                    <button
                                      onClick={() => handleCancelAuction(auction._id)}
                                      className="text-[10px] font-semibold px-2 py-1 rounded transition-opacity hover:opacity-80"
                                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                                    >
                                      {t("profile.auction.cancel", "Cancel")}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(4,8,28,0.6)" }}>
                            <span className="text-white/30 text-xs">{(auctionPage - 1) * PAGE_SIZE + 1}–{Math.min(auctionPage * PAGE_SIZE, filteredAuctions.length)} of {filteredAuctions.length}</span>
                            <div className="flex gap-1">
                              <button onClick={() => setAuctionPage(p => Math.max(1, p - 1))} disabled={auctionPage === 1}
                                className="px-2.5 py-1 rounded text-xs text-white/50 hover:text-white disabled:opacity-30" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>←</button>
                              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p = totalPages <= 7 ? i + 1 : auctionPage <= 4 ? i + 1 : auctionPage >= totalPages - 3 ? totalPages - 6 + i : auctionPage - 3 + i;
                                return <button key={p} onClick={() => setAuctionPage(p)} className="px-2.5 py-1 rounded text-xs font-medium"
                                  style={{ background: auctionPage === p ? "#002AA8" : "rgba(255,255,255,0.06)", border: `1px solid ${auctionPage === p ? "rgba(0,80,255,0.4)" : "rgba(255,255,255,0.1)"}`, color: auctionPage === p ? "#fff" : "rgba(255,255,255,0.45)" }}>{p}</button>;
                              })}
                              <button onClick={() => setAuctionPage(p => Math.min(totalPages, p + 1))} disabled={auctionPage === totalPages}
                                className="px-2.5 py-1 rounded text-xs text-white/50 hover:text-white disabled:opacity-30" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>→</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="hidden xl:block"><StickyAvatarSidebar /></div>
                </div>
              );
            })()}

            {/* ---- QUESTING VIEW ---- */}
            {activeTab === "Questing" && (
              <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <ProfileQuestingTab wallet={connectedWallet} token={token} />
                </div>
                <div className="hidden xl:block"><StickyAvatarSidebar /></div>
              </div>
            )}

            {/* ---- BOUNTY VIEW ---- */}
            {activeTab === "Bounty" && (
              <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <ProfileBountyTab wallet={connectedWallet} token={token} />
                </div>
                <div className="hidden xl:block"><StickyAvatarSidebar /></div>
              </div>
            )}
          </section>
        </div>
      </div >

    </>
  );
}

export default MarketPlace;