import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { useAccount, useReadContract } from 'wagmi';
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BASE_MARKETPLACE_ADDRESS } from "../../Web3/Config";
import { useEmailWallet } from "../../hooks/useEmailWallet";

import TVector from "../../assets/images/popular/vector.png";
import overview1 from "../../assets/images/Profile/Hero1.jpeg";
import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import land1Image from "../../assets/images/Overview/land1.jpg";

import NavLinks from "../ProfileSection/Navlinks";
import UserProfileHeader from "./UserProfileHeader";
import FullScreenLoader from "../Common/Spinner";

import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
} from "../../Web3/Config";

function Land() {
  const { token } = useSelector((state) => state.auth);

  const {
    emailWalletAddress,
    isEmailWalletConnected,
  } = useEmailWallet();

  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Combine wallet state
  const activeAddress = isEmailWalletConnected ? emailWalletAddress : wagmiAddress;
  const isConnected = isEmailWalletConnected || isWagmiConnected;

  // Read internal balances from Marketplace Contract
  const { data: rawSellerBalance } = useReadContract({
    address: BASE_MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'sellerBalance',
    args: activeAddress ? [activeAddress] : undefined,
    query: { enabled: !!activeAddress }
  });
  const sellerBalance = rawSellerBalance ? ethers.formatUnits(rawSellerBalance, 6) : '0';

  const [userData, setUserData] = useState(null);
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [listingInProgress, setListingInProgress] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState({});
  const [pendingItemId, setPendingItemId] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState({});
  const [showMobileList, setShowMobileList] = useState({});
  const navigate = useNavigate();

  // Sync state
  useEffect(() => {
    if (activeAddress) {
      setConnectedWallet(activeAddress.toLowerCase());
    }
  }, [activeAddress]);

  const extractMintedNFTs = (data) => {
    console.log("🔍 Raw data received:", data);

    if (!Array.isArray(data)) return [];

    const extracted = [];

    data.forEach((item, index) => {
      // Only land category
      if (!item.category?.includes("land")) return;

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
            chain: "Base",

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
      .catch((err) => {
        if (err?.response?.status !== 401) {
          console.error("Profile fetch error:", err?.response?.data || err.message);
        }
      });
  }, [token]);

  /* ================= WALLET ================= */
  useEffect(() => {
    checkWallet();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length) {
      const wallet = accounts[0].toLowerCase();
      setConnectedWallet(wallet);
      fetchOwnedNFTs(wallet);
    } else {
      setConnectedWallet(null);
      setLandData([]);
      setMarketData([]);
    }
  };

  const checkWallet = async () => {
    if (!window.ethereum) return setLoading(false);
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      const wallet = accounts[0].toLowerCase();
      setConnectedWallet(wallet);
      fetchOwnedNFTs(wallet);
    } else setLoading(false);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length) {
        const wallet = accounts[0].toLowerCase();
        setConnectedWallet(wallet);
        fetchOwnedNFTs(wallet);
        toast.success("Wallet connected!");
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      toast.error("Failed to connect wallet");
    }
  };

  /* ================= FETCH OWNED NFTS (SINGLE SOURCE) ================= */
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

  /* ================= SWITCH TO IMMUTABLE ================= */
  const switchToBase = async () => {
    const BASE_CHAIN_ID_HEX = "0x2105"; // 8453 Base Mainnet
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_CHAIN_ID_HEX,
                chainName: "Base",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add Immutable:", addError);
          return false;
        }
      }
      console.error("Failed to switch to Immutable:", switchError);
      return false;
    }
  };

  /* ================= HANDLE SELL NOW CLICK ================= */
  const handleSellNowClick = (itemId) => {
    if (!isConnected) {
      setPendingItemId(itemId);
      if (openConnectModal) openConnectModal();
      return;
    }
    setUserHasInteracted((prev) => ({ ...prev, [itemId]: true }));
  };

  /* ================= WATCH FOR CONNECTION SUCCESS ================= */
  useEffect(() => {
    if (isConnected && pendingItemId) {
      setUserHasInteracted((prev) => ({ ...prev, [pendingItemId]: true }));
      setPendingItemId(null);
    }
  }, [isConnected, pendingItemId]);

  /* ================= NAVIGATE TO BUY-NFA ================= */
  const navigateToBuyNFA = (item) => {
    if (!userHasInteracted[item._id]) {
      toast.error("Please connect wallet first");
      return;
    }
    navigate("/buy-land", { state: { item } });
  };

  /* ================= MINT NFT ================= */
  const mintNFTToWallet = async (buyerWallet, item) => {
    if (!item._id) {
      toast.error("Invalid item");
      return null;
    }

    try {
      const payload = {
        docId: item._id,
        tokenURI: `ipfs://auto-${Date.now()}`,
        royaltyBps: 500,
        creatorWallet: buyerWallet.toLowerCase(),
      };

      console.log("🎨 Minting Land NFT:", payload);

      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/mint`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data?.success && res.data?.tokenId) {
        return res.data.tokenId;
      } else {
        return null;
      }
    } catch (err) {
      console.error("❌ Mint error:", err.response?.data || err);
      return null;
    }
  };

  /* ================= LISTING LOGIC ================= */
  const handleCreateListing = async () => {
    if (!selectedItem) return;
    const toastId = toast.loading("Creating listing...");
    setListingInProgress(true);

    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed", { id: toastId });
        setListingInProgress(false);
        return;
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x2105") {
        const switched = await switchToBase();
        if (!switched) {
          toast.error("Please switch to Base network", { id: toastId });
          setListingInProgress(false);
          return;
        }
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer,
      );

      let tokenId = selectedItem.tokenId;

      // Mint if not minted
      if (!tokenId) {
        toast.loading("Minting Land NFT...", { id: toastId });
        tokenId = await mintNFTToWallet(walletAddress, selectedItem);

        if (!tokenId) {
          toast.error("Mint failed", { id: toastId });
          setListingInProgress(false);
          return;
        }

        selectedItem.tokenId = tokenId;
        selectedItem.owner = walletAddress.toLowerCase();

        toast.loading("Waiting for blockchain confirmation...", {
          id: toastId,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Verify ownership
      let owner;
      let retries = 3;
      while (retries > 0) {
        try {
          owner = await nftContract.ownerOf(tokenId);
          console.log("On-chain owner:", owner);
          console.log("Wallet address:", walletAddress);

          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            break;
          } else if (retries > 1) {
            console.log(
              `Owner mismatch, retrying... (${retries - 1} attempts left)`,
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries--;
            continue;
          } else {
            toast.error("You don't own this Land NFT", { id: toastId });
            setListingInProgress(false);
            return;
          }
        } catch (err) {
          console.error("Error getting owner:", err);
          if (retries > 1) {
            console.log(
              `Retrying blockchain check... (${retries - 1} attempts left)`,
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries--;
          } else {
            toast.error("NFT not found on blockchain yet. Please try again.", {
              id: toastId,
            });
            setListingInProgress(false);
            return;
          }
        }
      }

      // Approve marketplace
      const approved = await nftContract.getApproved(tokenId);
      if (approved.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()) {
        toast.loading("Approving marketplace...", { id: toastId });
        const approveTx = await nftContract.approve(
          MARKETPLACE_ADDRESS,
          tokenId,
        );
        await approveTx.wait();
      }

      // Check if already listed
      const listing = await marketplace.getListing(NFT_ADDRESS, tokenId);
      if (listing[2]) {
        toast.success("Already listed!", { id: toastId });
        setListingInProgress(false);
        setShowListModal(false);
        return;
      }

      // Create listing
      toast.loading("Creating listing on marketplace...", { id: toastId });
      const priceWei = ethers.parseUnits("0.01", 6);
      const listTx = await marketplace.createListing(
        NFT_ADDRESS,
        tokenId,
        priceWei,
        {
          gasLimit: 300000,
        },
      );
      await listTx.wait();

      // Save to backend
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/listing/create`,
        {
          nftId: selectedItem._id,
          tokenId,
          seller: walletAddress.toLowerCase(),
          priceETH: 0.01,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`✅ Listed! Token #${tokenId} @ ${selectedItem?.priceETH || 0.5} USDC`, {
        id: toastId,
        duration: 5000,
      });

      // Update local state
      setLandData((prev) =>
        prev.map((item) =>
          item._id === selectedItem._id
            ? { ...item, listed: true, tokenId }
            : item,
        ),
      );

      setShowListModal(false);
    } catch (err) {
      console.error("❌ Listing error:", err);
      let msg = "Listing failed";
      if (err.message?.includes("insufficient funds"))
        msg = "⛽ Add Immutable ETH";
      else if (err.message?.includes("user rejected"))
        msg = "Transaction rejected";
      toast.error(msg, { id: toastId });
    } finally {
      setListingInProgress(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  /* ================= FILTER LOGIC ================= */
  const filteredLandCollections = extractMintedNFTs(marketData);

  return (
    <>
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto mt-[68px] max-w-[2000px]">
          {/* ================= HERO ================= */}
          <div className="relative w-full max-w-[1400px] mx-auto h-[260px] overflow-hidden">
            <img
              src={overview1}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>

          {/* ================= PROFILE ================= */}
          <UserProfileHeader
            userData={userData}
            connectedWallet={connectedWallet}
            sellerBalance={sellerBalance}
          />

          {/* ================= NAV ================= */}
          <div className="mt-6 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
            <NavLinks onSelectCategory={() => {}} selectedCategory="" />
          </div>

          {/* ================= NFT CARDS ================= */}
          <section className="relative z-10 mt-10">

            {filteredLandCollections.length === 0 ? (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                {filteredLandCollections.map((item) => {
                  const isConnecting = connectingWallet[item._id];
                  const hasInteracted = userHasInteracted[item._id];

                  return (
                    <div
                      key={item._id}
                      className="relative rounded-[16px] p-3 sm:p-4 lg:p-5 text-white flex flex-col h-[360px] sm:h-[390px] lg:h-[420px]"
                      style={{
                        background: "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                      }}
                    >
                      {/* Image */}
                      <div className="relative h-[150px] sm:h-[180px] lg:h-[210px] rounded-[14px] overflow-hidden"
                        style={{ background: "linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 100%)" }}>
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                          style={{ background: "rgba(0,80,30,0.85)", border: "1px solid rgba(50,160,60,0.5)" }}>
                          🌍 Land
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="mt-3 text-sm lg:text-base font-semibold text-white truncate">{item.name}</h3>
                        <p className="mt-1 text-xs lg:text-sm text-gray-300 line-clamp-2">
                          {item.description || "No description"}
                        </p>
                      </div>

                      {/* CTA — Desktop */}
                      {!hasInteracted ? (
                        <div className="hidden md:flex justify-center items-center w-full mt-auto pt-4">
                          <button onClick={() => handleSellNowClick(item._id)} className="px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20 w-full">
                            Sell Now
                          </button>
                        </div>
                      ) : (
                        <div className="relative group hidden md:block mt-auto pt-4">
                          <button className="px-6 py-2.5 bg-[#002AA8] text-white font-semibold text-sm rounded-lg border border-white/20 w-full group-hover:opacity-0 transition-opacity duration-300">
                            Not Listed
                          </button>
                          <button
                            onClick={() => navigateToBuyNFA(item)}
                            className="absolute inset-0 px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg border border-white/20 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            List Now
                          </button>
                        </div>
                      )}

                      {/* CTA — Mobile */}
                      <div className="md:hidden mt-auto pt-4 text-center">
                        {!hasInteracted ? (
                          <button onClick={() => handleSellNowClick(item._id)} className="px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20 w-full">
                            Sell Now
                          </button>
                        ) : !showMobileList[item._id] ? (
                          <button
                            onClick={() => setShowMobileList((prev) => ({ ...prev, [item._id]: true }))}
                            className="px-6 py-2 bg-white/10 text-white font-semibold text-sm rounded-lg border border-white/20 w-full"
                          >
                            Not Listed
                          </button>
                        ) : (
                          <button onClick={() => navigateToBuyNFA(item)} className="px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20 w-full">
                            List Now
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
      </div >
    </>
  );
}

export default Land;
