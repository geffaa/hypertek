import React, { useEffect, useState } from "react";
import ProfileBanner from "./ProfileBanner";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";
import ProfileListingsTab from "./ProfileListingsTab";
import ProfileQuestingTab from "./ProfileQuestingTab";
import ProfileBountyTab from "./ProfileBountyTab";

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

  // Tab ↔ URL slug mapping
  const TAB_SLUG = {
    "My Collectibles": "collectibles",
    "Listings":        "listings",
    "Activities":      "activities",
    "Trade":           "trade",
    "Auction":         "auction",
    "Questing":        "questing",
    "Bounty":          "bounty",
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

  // ---- Fetch trade posts when Trade tab is active ----
  useEffect(() => {
    if (activeTab !== "Trade" || !connectedWallet) return;
    setOffersLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/trade`, {
        params: { type: "trade", posterWallet: connectedWallet, status: "open", limit: 50 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setOffers(res.data?.trades || []))
      .catch(() => setOffers([]))
      .finally(() => setOffersLoading(false));
  }, [activeTab, connectedWallet, token]);

  // ---- Fetch user's posted auctions when Auction tab is active ----
  useEffect(() => {
    if (activeTab !== "Auction" || !connectedWallet) return;
    setAuctionsLoading(true);
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/auction/seller/${connectedWallet}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setMyAuctions(Array.isArray(res.data) ? res.data : res.data?.auctions || []))
      .catch(() => setMyAuctions([]))
      .finally(() => setAuctionsLoading(false));
  }, [activeTab, connectedWallet, token]);

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

  // Category sub-filter within My Collectibles tab
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setTxFilter("all");
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
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSearchParams({ tab: TAB_SLUG[tab] });
                if (tab !== "My Collectibles") setActiveCategory("");
              }}
              activeCategory={activeCategory}
              onCategoryChange={handleSelectCategory}
              onCategoriesLoaded={handleCategoriesLoaded}
            />
          </div>



          {/* ================= CONTENT AREA ================= */}
          <section className="relative z-10 mt-10 pb-24">
            <GlowingOrb Xaxis={800} Yaxis={100} />

            {/* ---- MY COLLECTIBLES: NFT Grid ---- */}
            {activeTab === "My Collectibles" && (() => {
              const gridItems = filteredCollections;

              return gridItems.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-white relative gap-16 -mt-8">
                  <h2 className="text-lg font-semibold -mt-4">
                    {isConnected ? "No Items Available" : "Connect Wallet to View Your Items"}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
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
                      <div className="px-3 pb-3 flex flex-col gap-1.5">
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
                        {isConnected && (
                          <Link
                            to="/dashboard/collections"
                            className="w-full h-7 rounded-lg text-white/40 hover:text-white/70 text-[10px] font-medium transition-all flex items-center justify-center gap-1"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit / Delete in Dashboard
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ---- LISTINGS VIEW ---- */}
            {activeTab === "Listings" && (
              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                <ProfileListingsTab token={token} />
              </div>
            )}

            {/* ---- ACTIVITIES VIEW ---- */}
            {activeTab === "Activities" && (() => {
              const TX_FILTERS = [
                { key: "all",  label: "All"  },
                { key: "buy",  label: "Buy"  },
                { key: "sell", label: "Sell" },
              ];
              const filtered = txFilter === "all"
                ? transactions
                : transactions.filter((tx) => tx.type === txFilter);
              return (
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
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
                    <span className="ml-auto text-white/25 text-xs self-center">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
                  </div>

                  {txLoading ? (
                    <div className="text-white/50 text-sm py-16 text-center">Loading transactions...</div>
                  ) : filtered.length === 0 ? (
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
                      {filtered.map((tx, i) => (
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
              );
            })()}

            {/* ---- TRADE VIEW (user's posted trades) ---- */}
            {activeTab === "Trade" && (
              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                {!connectedWallet ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                    <p className="text-sm">Connect your wallet to view your trade listings</p>
                  </div>
                ) : offersLoading ? (
                  <div className="text-white/50 text-sm py-16 text-center">Loading your trade listings...</div>
                ) : offers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                    <p className="text-sm">No active trade listings</p>
                    <p className="text-xs text-white/20">Post a trade on the Marketplace → Trades tab to see it here</p>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="grid min-w-[560px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
                      style={{ background: "rgba(0,20,80,0.5)", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 0.8fr" }}>
                      <span>Trade No</span>
                      <span>Offering</span>
                      <span>Requesting</span>
                      <span>Category</span>
                      <span>Status</span>
                    </div>
                    {offers.map((trade, i) => {
                      const statusColors = {
                        open:      { text: "text-green-400",  bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.25)" },
                        accepted:  { text: "text-amber-300",  bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)" },
                        completed: { text: "text-blue-400",   bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)" },
                        cancelled: { text: "text-white/25",   bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
                      };
                      const c = statusColors[trade.status] || statusColors.open;
                      return (
                        <div key={trade._id} className="grid min-w-[560px] px-4 py-3 items-center"
                          style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 0.8fr" }}>
                          <span className="text-white/60 text-xs font-mono">#{String(trade._id).slice(-6).toUpperCase()}</span>
                          <span className="text-white/80 text-xs truncate">{trade.offering || "—"}</span>
                          <span className="text-white/60 text-xs truncate italic">{trade.requesting || "—"}</span>
                          <span className="text-white/40 text-xs truncate">{trade.category || "—"}</span>
                          <span className={`text-[10px] font-semibold capitalize inline-block w-fit ${c.text}`}
                            style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 7px" }}>
                            {trade.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ---- AUCTION VIEW (user's posted auctions) ---- */}
            {activeTab === "Auction" && (
              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                {!connectedWallet ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                    <p className="text-sm">Connect your wallet to view your auction listings</p>
                  </div>
                ) : auctionsLoading ? (
                  <div className="text-white/50 text-sm py-16 text-center">Loading your auctions...</div>
                ) : myAuctions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                    <p className="text-sm">No auction listings</p>
                    <p className="text-xs text-white/20">Start an auction from the Marketplace → Auctions tab to see it here</p>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="grid min-w-[620px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
                      style={{ background: "rgba(0,20,80,0.5)", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.8fr" }}>
                      <span>Auction No</span>
                      <span>Item</span>
                      <span>Start Price</span>
                      <span>Current Bid</span>
                      <span>Ends</span>
                      <span>Status</span>
                    </div>
                    {myAuctions.map((auction, i) => {
                      const statusColors = {
                        active:    { text: "text-green-400",  bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.25)" },
                        ended:     { text: "text-amber-300",  bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)" },
                        sold:      { text: "text-blue-400",   bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)" },
                        cancelled: { text: "text-white/25",   bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
                      };
                      const c = statusColors[auction.status] || statusColors.ended;
                      const endDate = auction.endTime ? new Date(auction.endTime) : null;
                      const diff = endDate ? endDate - Date.now() : 0;
                      const timeStr = diff > 0
                        ? (() => { const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000); return d > 0 ? `${d}d ${h}h` : `${h}h`; })()
                        : "Ended";
                      return (
                        <div key={auction._id} className="grid min-w-[620px] px-4 py-3 items-center"
                          style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.8fr" }}>
                          <span className="text-white/60 text-xs font-mono">#{String(auction._id).slice(-6).toUpperCase()}</span>
                          <span className="text-white/80 text-xs truncate">{auction.title || auction.itemName || "—"}</span>
                          <span className="text-white/60 text-xs">{auction.startPrice ? `$${auction.startPrice}` : "—"}</span>
                          <span className="text-green-300/80 text-xs font-medium">{auction.currentBid ? `$${auction.currentBid}` : "No bids"}</span>
                          <span className={`text-xs ${diff > 0 && diff < 86400000 ? "text-red-400" : "text-white/50"}`}>{timeStr}</span>
                          <span className={`text-[10px] font-semibold capitalize inline-block w-fit ${c.text}`}
                            style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 7px" }}>
                            {auction.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ---- QUESTING VIEW ---- */}
            {activeTab === "Questing" && (
              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                <ProfileQuestingTab wallet={connectedWallet} token={token} />
              </div>
            )}

            {/* ---- BOUNTY VIEW ---- */}
            {activeTab === "Bounty" && (
              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
                <ProfileBountyTab wallet={connectedWallet} token={token} />
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