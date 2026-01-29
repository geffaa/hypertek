import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { ethers } from "ethers";

import TVector from "../../assets/images/popular/vector.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import CustomButton4 from "../Buttons/Button4";
import land1Image from "../../assets/images/Overview/land1.jpg";

import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";
import FullScreenLoader from "../Common/Spinner";

import { BACKEND_BASE_URL } from "../../Config";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
} from "../../Web3/Config";

function Land() {
  const { token } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState(null);
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [listingInProgress, setListingInProgress] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState({});
  const [userHasInteracted, setUserHasInteracted] = useState({});
  const [showMobileList, setShowMobileList] = useState({});
  const navigate = useNavigate();

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
      setLandData([]);
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
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/owned/${wallet}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data?.success) {
        // Filter for Land type only
        const landItems = res.data.nfts.filter(
          (nft) => nft?.collection?.Type === "Land",
        );

        setLandData(
          landItems.map((nft) => ({
            ...nft,
            userOwns: true,
            hasInteracted: userHasInteracted[nft._id] || false, // Preserve interaction state
          })),
        );
      }
    } catch (err) {
      toast.error("Failed to load Land NFTs");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SWITCH TO SEPOLIA ================= */
  const switchToSepolia = async () => {
    const SEPOLIA_CHAIN_ID = "0xaa36a7";
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Failed to add Sepolia:", addError);
          return false;
        }
      }
      console.error("Failed to switch to Sepolia:", switchError);
      return false;
    }
  };

  /* ================= HANDLE SELL NOW CLICK ================= */
  const handleSellNowClick = async (itemId) => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    setConnectingWallet(prev => ({ ...prev, [itemId]: true }));

    try {
      // Force MetaMask popup every time
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

      // Mark this item as interacted
      setUserHasInteracted(prev => ({
        ...prev,
        [itemId]: true,
      }));

      // Update the specific item's state
      setLandData(prev => 
        prev.map(item => 
          item._id === itemId 
            ? { ...item, hasInteracted: true } 
            : item
        )
      );

      // Fetch NFTs for the connected wallet
      await fetchOwnedNFTs(wallet);

      toast.success("Wallet connected!");
    } catch (err) {
      if (err.code === 4001) toast.error("Connection cancelled");
      else toast.error("Wallet connection failed");
    } finally {
      setConnectingWallet(prev => ({ ...prev, [itemId]: false }));
    }
  };

  /* ================= NAVIGATE TO BUY-NFA ================= */
  const navigateToBuyNFA = (item) => {
    if (!userHasInteracted[item._id]) {
      toast.error("Please connect wallet first");
      return;
    }
    navigate("/buy-nfa", { state: { item } });
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
      if (chainId !== "0xaa36a7") {
        const switched = await switchToSepolia();
        if (!switched) {
          toast.error("Please switch to Sepolia", { id: toastId });
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
      const priceWei = ethers.parseEther("0.01");
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

      toast.success(`✅ Listed! Token #${tokenId} @ 0.01 ETH`, {
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
        msg = "⛽ Add Sepolia ETH";
      else if (err.message?.includes("user rejected"))
        msg = "Transaction rejected";
      toast.error(msg, { id: toastId });
    } finally {
      setListingInProgress(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  /* ================= FILTER LOGIC ================= */
  const filteredLandCollections = landData.filter(
    (item) => item?.listed === false,
  );

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

          {/* ================= LAND CARDS ================= */}
          <section className="relative z-10 px-6 mt-10">
            <GlowingOrb Xaxis={800} Yaxis={100} />

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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {filteredLandCollections.map((item) => {
                  const collection = item.collection;
                  const isConnecting = connectingWallet[item._id];
                  const hasInteracted = userHasInteracted[item._id] || item.hasInteracted;
                  
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
                          src={land1Image}
                          alt={collection?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h2 className="text-[14px] sm:text-[16px] lg:text-[18px] font-semibold mt-4 truncate">
                        {collection?.name || "Land NFT"}
                      </h2>

                      <div className="flex justify-between items-center mt-3 text-[11px] sm:text-[13px] lg:text-sm">
                        <span className="font-medium text-gray-300 truncate">
                          {item._id.slice(0, 6)} 🔥
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
                            {collection?.priceETH || item.priceETH || "0.01"}{" "}
                            ETH
                          </span>
                        </div>
                      </div>

                      {/* ================= DESKTOP VIEW ================= */}
                      <div className="hidden md:block mt-auto pt-6">
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
                          <div className="relative group text-center">
                            {/* Default view - Not Listed */}
                            <div className="text-sm text-white py-2 transition-opacity duration-300 group-hover:opacity-0">
                              Not Listed
                            </div>

                            {/* Hover view - List Now button */}
                            <div
                              onClick={() => navigateToBuyNFA(item)}
                              className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            >
                              <div className="w-full max-w-[200px] mx-auto">
                                <CustomButton4 text="List Now" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ================= MOBILE VIEW ================= */}
                      <div className="md:hidden mt-auto pt-6">
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
                          <div className="text-center">
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
                          </div>
                        ) : (
                          /* Mobile: Tapped - show List Now button */
                          <div className="flex justify-center items-center">
                            <button
                              onClick={() => navigateToBuyNFA(item)}
                              className="w-full max-w-[180px] mx-auto"
                            >
                              <CustomButton4 text="List Now" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ================= LIST MODAL ================= */}
          {showListModal && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-[#1F2633] p-6 w-11/12 sm:w-[360px] relative text-white">
                <button
                  onClick={() => setShowListModal(false)}
                  className="absolute top-3 right-3 text-white font-bold text-xl hover:text-gray-300"
                  disabled={listingInProgress}
                >
                  ×
                </button>

                <h2 className="text-white text-sm font-semibold text-center my-3">
                  List Asset
                </h2>

                <hr className="border-t border-white/20 my-3" />

                <div className="flex flex-col items-center gap-3">
                  <div className="w-[90px] h-[90px] overflow-hidden rounded-lg bg-gradient-to-b from-[#9B7C2F] to-[#4A3E22]">
                    <img
                      src={land1Image}
                      alt={selectedItem.collection?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium">
                    {selectedItem.collection?.name || "Land NFT"}
                  </p>
                </div>

                <hr className="border-t border-white/20 my-4" />

                <div className="flex justify-between items-center bg-[#2F3744] px-3 py-2 mb-2">
                  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize text-gray-400">
                    List Price
                  </span>
                  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize">
                    0.01 ETH
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#2F3744] px-3 py-2">
                  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize text-gray-400">
                    Platform Fee
                  </span>
                  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize">
                    0.001 ETH
                  </span>
                </div>

                <hr className="border-t border-white/20 my-4" />

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowListModal(false)}
                    disabled={listingInProgress}
                  >
                    <div className="flex items-center">
                      <div className="bg-[#002AA8] mr-0.5 w-1 h-5"></div>
                      <div
                        className="border-[#002AA8]"
                        style={{
                          width: "0.5rem",
                          height: "2.1rem",
                          borderStyle: "solid",
                          borderWidth: "0.375rem 0.25rem 0.375rem 0",
                        }}
                      />
                      <div
                        className="flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          width: "5.5rem",
                          height: "2rem",
                          border: "0.15rem solid #002AA8",
                        }}
                      >
                        Cancel
                      </div>
                      <div
                        className="border-[#002AA8]"
                        style={{
                          width: "0.5rem",
                          height: "2.1rem",
                          borderStyle: "solid",
                          borderWidth: "0.25rem 0 0.375rem 0.25rem",
                        }}
                      />
                      <div className="bg-[#002AA8] w-1 h-5"></div>
                    </div>
                  </button>

                  {!connectedWallet ? (
                    <button
                      onClick={connectWallet}
                      disabled={listingInProgress}
                    >
                      <CustomButton4 text="Connect Wallet" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateListing}
                      disabled={listingInProgress}
                    >
                      <CustomButton4
                        text={listingInProgress ? "Processing..." : "List Now"}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Land;