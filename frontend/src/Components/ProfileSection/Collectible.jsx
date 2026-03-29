import React, { useEffect, useState } from "react";
import ProfileBanner from "./ProfileBanner";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";

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
  const { token, user } = useSelector((state) => state.auth);
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
  const [activeView, setActiveView] = useState(""); // "" | "Activities" | "Listing" | "My Offers"

  // ---- Activities state ----
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  // ---- My Offers state ----
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [navigating, setNavigating] = useState(null);

  // ---- List for Sale modal ----
  const [listingModal, setListingModal] = useState(null); // null | { item }
  const [listingPrice, setListingPrice] = useState("");
  const [listingSubmitting, setListingSubmitting] = useState(false);

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

  // ---- Fetch transactions when Activities view is active ----
  useEffect(() => {
    if (activeView !== "Activities" || !connectedWallet || !token) return;
    setTxLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/nft/user/transactions/${connectedWallet}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTransactions(res.data?.transactions || []))
      .catch((err) => { console.error("Activities fetch error:", err.response?.status, err.message); setTransactions([]); })
      .finally(() => setTxLoading(false));
  }, [activeView, connectedWallet, token]);

  // ---- Fetch offers when My Offers view is active ----
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (activeView !== "My Offers" || !userId || !token) return;
    setOffersLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/offer/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOffers(res.data?.offers || []))
      .catch((err) => {
        if (err.response?.status !== 404) toast.error("Failed to load offers");
      })
      .finally(() => setOffersLoading(false));
  }, [activeView, userId, token]);

  // ---- My Offers helpers ----
  const handleCompletePurchase = async (offer) => {
    setNavigating(offer._id);
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/sub-collection/${offer.gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { item, parentId } = res.data;
      navigate("/buy-nfa", { state: { item, parentId } });
    } catch {
      toast.error("Could not load NFT data");
    } finally {
      setNavigating(null);
    }
  };

  const handleCancelOffer = async (offerId) => {
    if (!window.confirm("Cancel this offer?")) return;
    setCancelling(offerId);
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/offer/${offerId}/request-status`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOffers((prev) =>
        prev.map((o) => o._id === offerId ? { ...o, requestStatus: "cancelled" } : o)
      );
      toast.success("Offer cancelled");
    } catch {
      toast.error("Failed to cancel offer");
    } finally {
      setCancelling(null);
    }
  };

  // ---- List for Sale submit ----
  const handleListForSale = async () => {
    const item = listingModal?.item;
    if (!item || !listingPrice || isNaN(listingPrice) || Number(listingPrice) <= 0)
      return toast.error("Enter a valid price");
    const minReserve = item.minimumBuybackUSD || 0;
    if (item.isNFA && minReserve > 0 && Number(listingPrice) < minReserve)
      return toast.error(`Harga minimum ${parseFloat(minReserve.toPrecision(4))} USDC (buyback reserve)`);
    setListingSubmitting(true);
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/create`,
        {
          parentId: item.parentId,
          subCollectionId: item._id,
          tokenId: item.tokenId,
          seller: connectedWallet,
          priceETH: Number(listingPrice),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`"${item.name}" listed for ${listingPrice} USDC`);
      setListingModal(null);
      setListingPrice("");
      // Refresh NFT list
      if (connectedWallet) fetchOwnedNFTs(connectedWallet.toLowerCase());
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to list NFT");
    } finally {
      setListingSubmitting(false);
    }
  };

  // ---- Utility helpers ----
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000)    return "just now";
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const shortAddr = (addr) => {
    if (!addr || addr.length < 10) return addr || "—";
    return `${addr.slice(0, 6)}\u2026${addr.slice(-4)}`;
  };

  const OFFER_STATUS_COLORS = {
    pending:   { text: "text-yellow-400", bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.25)" },
    accepted:  { text: "text-green-400",  bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.25)" },
    completed: { text: "text-blue-400",   bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)" },
    rejected:  { text: "text-red-400",    bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.25)" },
    cancelled: { text: "text-white/30",   bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
  };

  const getDeadlineText = (acceptDeadlineAt) => {
    if (!acceptDeadlineAt) return null;
    const diff = new Date(acceptDeadlineAt) - Date.now();
    if (diff <= 0) return { label: "Deadline passed", expired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const label = h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : `${h}h ${m}m left`;
    return { label, expired: false };
  };

  // When NavLinks triggers a category selection, update activeCategory
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setActiveView("");
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
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto mt-[68px] max-w-[2000px]">
          {/* ================= HERO ================= */}
          <ProfileBanner />

          {/* ================= PROFILE ================= */}
          <UserProfileHeader
            userData={userData}
            connectedWallet={connectedWallet}
            sellerBalance={sellerBalance}
          />

          {/* ================= NAV ================= */}
          <div className="mt-6 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
            <NavLinks
              onSelectCategory={handleSelectCategory}
              selectedCategory={activeCategory}
              onCategoriesLoaded={handleCategoriesLoaded}
              showAll
              onSelectAll={() => { setActiveCategory(""); setActiveView(""); }}
              onSelectStatic={(name) => { setActiveView(name); setActiveCategory(""); }}
              activeStatic={activeView}
            />
          </div>



          {/* ================= CONTENT AREA ================= */}
          <section className="relative z-10 mt-10">
            <GlowingOrb Xaxis={800} Yaxis={100} />

            {/* ---- DEFAULT / LISTING VIEW: NFT Grid ---- */}
            {(activeView === "" || activeView === "Listing") && (() => {
              const gridItems = activeView === "Listing"
                ? filteredCollections.filter((item) => item.listed === true)
                : filteredCollections;

              return gridItems.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-white relative gap-16 -mt-8">
                  <h2 className="text-lg font-semibold -mt-4">
                    {activeView === "Listing"
                      ? "No active listings"
                      : isConnected
                      ? "No Items Available"
                      : "Connect Wallet to View Your Items"}
                  </h2>
                  <div className="relative w-full flex justify-center items-center gap-4 top-[-10px]">
                    <img src={FaceOne} alt="Face One" className="w-34 h-24" />
                    <img src={FaceTwo} alt="Face Two" className="absolute top-24 w-28 h-10" />
                  </div>
                  {!isConnected && activeView === "" ? (
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                  {gridItems.map((item) => (
                    <div
                      key={item._id}
                      className="group relative rounded-2xl overflow-hidden text-white flex flex-col cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
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
                        {item.listed ? (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-green-300"
                            style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)", border: "1px solid rgba(74,222,128,0.35)" }}>
                            Listed
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white/50"
                            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                            Unlisted
                          </div>
                        )}
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
                          ) : "No price set"}
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="px-3 pb-3">
                        {item.listed ? (
                          <button
                            onClick={() => navigate("/buy-nfa", { state: { item, parentId: item.parentId } })}
                            className="w-full h-8 rounded-lg text-white text-xs font-semibold transition-all hover:brightness-110"
                            style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}
                          >
                            View Listing →
                          </button>
                        ) : isConnected ? (
                          <button
                            onClick={() => { setListingModal({ item }); setListingPrice(item.minimumBuybackUSD > 0 ? String(item.minimumBuybackUSD) : ""); }}
                            className="w-full h-8 rounded-lg text-white text-xs font-semibold transition-all hover:brightness-110"
                            style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
                          >
                            List for Sale →
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSellNowClick(item._id)}
                            className="w-full h-8 rounded-lg text-white text-xs font-semibold transition-all"
                            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                          >
                            Connect Wallet
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ---- ACTIVITIES VIEW ---- */}
            {activeView === "Activities" && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                {txLoading ? (
                  <div className="text-white/50 text-sm py-16 text-center">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4">
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    {/* Header */}
                    <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr_1fr] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-white/30"
                      style={{ background: "rgba(0,20,80,0.5)" }}>
                      <span>Item</span>
                      <span>Type</span>
                      <span>Price</span>
                      <span>From</span>
                      <span>To</span>
                      <span className="text-right">Date</span>
                    </div>
                    {transactions.map((tx, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr_1fr] gap-4 px-5 py-3 items-center text-sm"
                        style={{
                          background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                          borderTop: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <span className="text-white/85 text-[13px] font-medium truncate">{tx.itemName || "—"}</span>
                        <span className={`text-xs font-bold ${tx.type === "buy" ? "text-blue-400" : "text-green-400"}`}>
                          {tx.type === "buy" ? "Bought" : tx.type === "sell" ? "Sold" : tx.type || "—"}
                        </span>
                        <span className="text-white/80 text-[13px] font-semibold">
                          {tx.priceETH ? `${tx.priceETH} USDC` : "—"}
                        </span>
                        <span className="text-white/45 text-[12px] font-mono truncate" title={tx.seller}>{shortAddr(tx.seller)}</span>
                        <span className="text-white/45 text-[12px] font-mono truncate" title={tx.buyer}>{shortAddr(tx.buyer)}</span>
                        <span className="text-white/30 text-[11px] text-right whitespace-nowrap">
                          {tx.createdAt ? timeAgo(tx.createdAt) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---- MY OFFERS VIEW ---- */}
            {activeView === "My Offers" && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                {offersLoading ? (
                  <div className="text-white/50 text-sm py-16 text-center">Loading your offers...</div>
                ) : offers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-4">
                    <p className="text-sm">No offers yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {offers.map((offer) => {
                      const colors = OFFER_STATUS_COLORS[offer.requestStatus] || OFFER_STATUS_COLORS.pending;
                      const isAccepted = offer.requestStatus === "accepted";
                      const canCancel = offer.requestStatus === "pending";
                      const deadline = offer.acceptDeadlineAt ? getDeadlineText(offer.acceptDeadlineAt) : null;

                      return (
                        <div
                          key={offer._id}
                          className="rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          {/* Item info */}
                          <div className="flex flex-col gap-0.5 flex-1 min-w-[150px]">
                            <span className="text-white font-medium text-sm">{offer.gameTitle || "—"}</span>
                            {offer.serialNumber && (
                              <span className="text-white/30 text-xs">#{offer.serialNumber}</span>
                            )}
                          </div>

                          {/* Offer price */}
                          <div className="flex flex-col gap-0.5 min-w-[100px]">
                            <span className="text-white/40 text-[10px] uppercase tracking-wider">Offer</span>
                            <span className="text-white font-semibold text-sm">{offer.offerPrice} USDC</span>
                          </div>

                          {/* Status badge */}
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors.text}`}
                            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                          >
                            {offer.requestStatus || "pending"}
                          </span>

                          {/* Deadline */}
                          {isAccepted && deadline && (
                            <span className={`text-xs font-medium ${deadline.expired ? "text-red-400" : "text-orange-400"}`}>
                              {deadline.label}
                            </span>
                          )}

                          {/* Created date */}
                          <span className="text-white/30 text-xs ml-auto">
                            {offer.createdAt ? timeAgo(offer.createdAt) : ""}
                          </span>

                          {/* Actions */}
                          {isAccepted && !deadline?.expired ? (
                            <button
                              onClick={() => handleCompletePurchase(offer)}
                              disabled={navigating === offer._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
                              style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" }}
                            >
                              {navigating === offer._id ? "Loading..." : "Complete Purchase →"}
                            </button>
                          ) : canCancel ? (
                            <button
                              onClick={() => handleCancelOffer(offer._id)}
                              disabled={cancelling === offer._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                            >
                              {cancelling === offer._id ? "Cancelling..." : "Cancel Offer"}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div >

      {/* ---- List for Sale Modal ---- */}
      {listingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setListingModal(null)}
        >
          <div
            className="rounded-2xl p-6 flex flex-col gap-5 w-full max-w-sm mx-4"
            style={{ background: "#0b1435", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold text-lg">List for Sale</h3>
            <p className="text-white/50 text-sm -mt-2 truncate">{listingModal.item?.name}</p>

            {(() => {
              const minPrice = listingModal?.item?.minimumBuybackUSD || 0;
              const isNFAItem = listingModal?.item?.isNFA;
              const enteredPrice = parseFloat(listingPrice) || 0;
              const belowMin = isNFAItem && minPrice > 0 && enteredPrice < minPrice;

              return (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-white/60 text-xs uppercase tracking-wider">Price (USDC)</label>
                      {isNFAItem && minPrice > 0 && (
                        <span className="text-[11px] text-amber-400/80">
                          Min: {parseFloat(minPrice.toPrecision(4))} USDC
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={isNFAItem && minPrice > 0 ? minPrice : 0}
                      step="any"
                      placeholder={isNFAItem && minPrice > 0 ? `Min ${parseFloat(minPrice.toPrecision(4))}` : "e.g. 0.5"}
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      className={`w-full h-11 px-3 rounded-lg text-white text-sm bg-white/5 border focus:outline-none transition ${
                        belowMin ? "border-red-500/60 focus:border-red-500" : "border-white/15 focus:border-blue-500"
                      }`}
                    />
                    {belowMin && (
                      <p className="text-red-400 text-xs mt-0.5">
                        Harga tidak boleh di bawah minimum buyback reserve ({parseFloat(minPrice.toPrecision(4))} USDC)
                      </p>
                    )}
                    {isNFAItem && minPrice > 0 && !belowMin && listingPrice && (
                      <p className="text-white/30 text-xs mt-0.5">
                        Minimum reserve terjamin untuk pembeli
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setListingModal(null)}
                      className="flex-1 h-10 rounded-lg text-white/50 text-sm hover:text-white transition"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleListForSale}
                      disabled={listingSubmitting || belowMin}
                      className="flex-1 h-10 rounded-lg text-white text-sm font-semibold transition hover:brightness-110 disabled:opacity-50"
                      style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)" }}
                    >
                      {listingSubmitting ? "Listing..." : "List Now"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

export default MarketPlace;