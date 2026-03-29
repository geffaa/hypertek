import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { useAccount, useReadContract, useWriteContract, usePublicClient, useBalance, useSendTransaction } from 'wagmi';
import { BASE_MARKETPLACE_ADDRESS } from "../../Web3/Config";
import { useEmailWallet } from "../../hooks/useEmailWallet";

import overview1 from "../../assets/images/Profile/Hero1.jpeg";
import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import CustomButton4 from "../Buttons/Button4";
import land1Image from "../../assets/images/Overview/land1.jpg";

import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";
import FullScreenLoader from "../Common/Spinner";

import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
} from "../../Web3/Config";

function ProfileCategory() {
  const { category: encodedCategory } = useParams();
  const category = decodeURIComponent(encodedCategory || "");
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    emailWalletAddress,
    isEmailWalletConnected,
  } = useEmailWallet();

  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [listingInProgress, setListingInProgress] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState({});
  const [userHasInteracted, setUserHasInteracted] = useState({});
  const [showMobileList, setShowMobileList] = useState({});

  // Sync state
  useEffect(() => {
    if (activeAddress) {
      setConnectedWallet(activeAddress.toLowerCase());
    }
  }, [activeAddress]);

  // Extract items by category
  const extractItemsByCategory = (data, targetCategory) => {
    if (!Array.isArray(data)) return [];

    const extracted = [];
    const normalizedTarget = (targetCategory || "").toLowerCase().trim();

    data.forEach((item) => {
      const itemCategory = (item.category || "").toLowerCase().trim();

      // Match category
      if (itemCategory !== normalizedTarget) return;

      // If parent collection with subCollections
      if (item.isParentCollection && Array.isArray(item.subCollections)) {
        const ownedUnlistedSubs = item.subCollections.filter((subNft) => {
          const subOwner = (subNft.owner || "").toLowerCase();
          const walletLower = (connectedWallet || "").toLowerCase();

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
      setItems([]);
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

  /* ================= FETCH OWNED NFTs ================= */
  const fetchOwnedNFTs = async (wallet) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${wallet}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success && res.data.nfts) {
        const extractedItems = extractItemsByCategory(res.data.nfts, category);
        setItems(extractedItems);
      }
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      toast.error("Failed to fetch NFTs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectedWallet && token) {
      fetchOwnedNFTs(connectedWallet);
    }
  }, [connectedWallet, token, category]);

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
        await fetchOwnedNFTs(wallet);
        toast.success("Wallet connected!");
      }
    } catch (err) {
      if (err.code !== 4001) toast.error("Wallet connection failed");
    }
  };

  /* ================= HANDLE SELL NOW CLICK ================= */
  const handleSellNowClick = async (itemId) => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    setConnectingWallet((prev) => ({ ...prev, [itemId]: true }));

    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || !accounts.length) return;

      const wallet = accounts[0].toLowerCase();
      setConnectedWallet(wallet);

      setUserHasInteracted((prev) => ({
        ...prev,
        [itemId]: true,
      }));

      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, hasInteracted: true } : item
        )
      );

      await fetchOwnedNFTs(wallet);

      toast.success("Wallet connected!");
    } catch (err) {
      if (err.code === 4001) toast.error("Connection cancelled");
      else toast.error("Wallet connection failed");
    } finally {
      setConnectingWallet((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  /* ================= NAVIGATE TO BUY ================= */
  const navigateToBuy = (item) => {
    if (!userHasInteracted[item._id]) {
      toast.error("Please connect wallet first");
      return;
    }

    const categoryLower = (category || "").toLowerCase();
    if (categoryLower === "land") {
      navigate("/buy-land", { state: { item } });
    } else {
      navigate("/buy-nfa", { state: { item } });
    }
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
      };

      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/mint`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) return res.data.sub;
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || "Error minting NFT. Check contract."
      );
    }
    return null;
  };

  /* ================= HANDLE LIST FOR SALE ================= */
  const handleListForSale = async (item) => {
    if (!connectedWallet) {
      toast.error("Please connect wallet first");
      return;
    }
    setSelectedItem(item);
    setShowListModal(true);
  };

  /* ================= LIST NFT ON MARKETPLACE ================= */
  const listNFTOnMarketplace = async () => {
    if (!selectedItem || !connectedWallet) return;

    const toastId = toast.loading("Processing...");
    setListingInProgress(true);

    try {
      const signer = await new ethers.BrowserProvider(
        window.ethereum
      ).getSigner();
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const tokenId = selectedItem.tokenId;

      // Check owner with retries
      let retries = 3;
      while (retries > 0) {
        try {
          const owner = await nftContract.ownerOf(tokenId);
          if (owner.toLowerCase() === connectedWallet) {
            break;
          } else {
            toast.error("You don't own this NFT", { id: toastId });
            setListingInProgress(false);
            return;
          }
        } catch (err) {
          console.error("Error getting owner:", err);
          if (retries > 1) {
            console.log(
              `Retrying blockchain check... (${retries - 1} attempts left)`
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
          tokenId
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
        priceWei
      );
      await listTx.wait();

      // Update database
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/sub-nft/${selectedItem._id}`,
        { listed: true, priceETH: "0.01" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Listed successfully!", { id: toastId });
      setShowListModal(false);
      await fetchOwnedNFTs(connectedWallet);
    } catch (err) {
      console.error("Error listing:", err);
      toast.error(err.reason || "Failed to list NFT", { id: toastId });
    } finally {
      setListingInProgress(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="relative w-full bg-black min-h-screen">
      <GlowingOrb Xaxis={200} Yaxis={200} />

      {/* ================= HERO SECTION ================= */}
      <div className="mx-auto max-w-[2000px]">
        <div className="relative w-full max-w-[1400px] mx-auto h-[200px] sm:h-[250px] lg:h-[400px] overflow-hidden bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(${overview1})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* ================= PROFILE SECTION ================= */}
        <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 mt-4 md:mt-0">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-white/20 to-white/5 p-1 flex items-center justify-center -mt-10 sm:-mt-14 lg:-mt-18 flex-shrink-0">
            {userData?.profileImage ? (
              <img
                src={`${BACKEND_BASE_URL}${userData.profileImage}`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full text-white/50" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-1">
              {userData?.name || "Profile"}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
              <span>
                {connectedWallet ? `${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}` : "No Wallet Connected"}
              </span>
              <Link to="/edit" className="flex items-center gap-1 hover:text-white transition-colors">
                <span>Edit Profile</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                <img src="/usdc-logo.svg" className="w-3 h-3" alt="USDC" />
              </div>
              <span className="text-lg font-bold text-white font-mono">
                ${Number(sellerBalance) > 0 ? Number(sellerBalance).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= NAV LINKS ================= */}
        <div className="mt-6 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10">
          <NavLinks
            onSelectCategory={(cat) => navigate(`/profile/${cat}`)}
            selectedCategory={category}
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="mt-8 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-10 mb-20 relative z-10">
          <div className="flex flex-col gap-2 items-start mb-8">
            <h1 className="text-white uppercase text-2xl lg:text-[30px] font-goldman font-bold">
              {items.length > 0
                ? items[0]?.parentName || "Collection"
                : category
                  ? category.charAt(0).toUpperCase() + category.slice(1)
                  : "Category"}{" "}
              Collection
            </h1>
            <div className="flex gap-2">
              <div className="h-[3px] w-8 lg:w-12 bg-white"></div>
              <div className="h-[3px] w-12 lg:w-20 bg-white"></div>
              <div className="h-[3px] w-6 lg:w-8 bg-white"></div>
              <div className="h-[3px] w-20 lg:w-40 bg-gradient-to-r from-white to-transparent"></div>
            </div>
          </div>

          {items.length === 0 ? (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {items.map((item) => {
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
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h3 className="mt-3 text-sm lg:text-base font-semibold text-white truncate">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs lg:text-sm text-gray-300 line-clamp-2">
                        {item.description || "No description"}
                      </p>
                    </div>

                    {!hasInteracted ? (
                      /* Desktop: show Sell Now (connect) */
                      <div className="hidden md:flex justify-center items-center w-full mt-auto pt-6">
                        <button
                          onClick={() => handleSellNowClick(item._id)}
                          disabled={isConnecting}
                          className="w-full flex justify-center"
                        >
                          <CustomButton4
                            text={isConnecting ? "Connecting..." : "Sell Now"}
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
                          onClick={() => navigateToBuy(item)}
                          className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        >
                          <CustomButton4 text="List Now" />
                        </div>
                      </div>
                    )}

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
                              text={isConnecting ? "Connecting..." : "Sell Now"}
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
                        <button onClick={() => navigateToBuy(item)} className="w-full">
                          <CustomButton4 text="List Now" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= LIST MODAL ================= */}
        {showListModal && selectedItem && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a2e] rounded-lg p-6 max-w-sm w-full border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">List for Sale</h2>
              <p className="text-gray-300 mb-4">
                Are you sure you want to list{" "}
                <span className="font-semibold">{selectedItem.name}</span> for
                sale?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowListModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={listNFTOnMarketplace}
                  disabled={listingInProgress}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#002AA8] text-white hover:bg-[#00219c] transition disabled:opacity-50"
                >
                  {listingInProgress ? "Listing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div></div>
  );
}

export default ProfileCategory;
