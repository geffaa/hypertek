import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import BackHome from "../../assets/images/backhome.png";

import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
} from "../../Web3/Config";
import { BACKEND_BASE_URL } from "../../Config";
import CustomButton from "../Buttons/Button1";
import { FiEye, FiEdit2 } from "react-icons/fi";

function Buy1() {
  const navigate = useNavigate();
  const location = useLocation();
  const { item } = location.state || {};
  const collection = item?.collection;

  const { token, user } = useSelector((state) => state.auth);

  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
const [offers, setOffers] = useState([]);


  /* ---------------------------------- INIT ---------------------------------- */
  useEffect(() => {
    if (!item) {
      toast.error("No land selected");
      navigate("/buy-nfa");
      return;
    }
  }, [item, navigate]);

  useEffect(() => {
    checkWalletAndOwnership();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [item]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      checkWalletAndOwnership();
    } else {
      setConnectedWallet(null);
      setIsOwner(false);
    }
  };

  /* ----------------------- WALLET + OWNERSHIP CHECK ----------------------- */
  const checkWalletAndOwnership = async () => {
    try {
      if (!window.ethereum || !item) return;

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const wallet = accounts[0].toLowerCase();
        setConnectedWallet(wallet);
        console.log("Connected wallet:", wallet);
        console.log("Item owner:", item.owner);

        if (item.owner) {
          const ownerMatch = wallet === item.owner.toLowerCase();
          setIsOwner(ownerMatch);
          console.log("Is owner:", ownerMatch);
        } else {
          setIsOwner(true);
          console.log("No owner - user can mint");
        }

        if (item.tokenId) {
          await checkListingStatus();
        }
      }
    } catch (err) {
      console.error("Error checking wallet:", err);
      if (err.code === 4001) {
        console.log("User rejected wallet connection");
      }
    }
  };

  /* -------------------------- CHECK LISTING -------------------------- */
  const checkListingStatus = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        provider
      );

      const listing = await marketplace.getListing(NFT_ADDRESS, item.tokenId);
      setListingData({
        seller: listing[0],
        price: listing[1],
        active: listing[2],
      });
    } catch (err) {
      console.error("Error checking listing:", err);
    }
  };

  /* -------------------------- SWITCH SEPOLIA -------------------------- */
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

  /* -------------------------- BACKEND MINT -------------------------- */
  const mintNFTToWallet = async (buyerWallet) => {
    if (!user?.id || !item._id) {
      toast.error("Invalid user or item");
      return null;
    }

    try {
      const payload = {
        docId: item._id,
        tokenURI: `ipfs://auto-${Date.now()}`,
        royaltyBps: 500,
        creatorWallet: buyerWallet.toLowerCase(),
      };

      console.log("🎨 Minting NFT:", payload);

      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/mint`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.success && res.data?.tokenId) {
        toast.success(`NFT Minted! Token ID: ${res.data.tokenId}`);
        return res.data.tokenId;
      } else {
        toast.error(res.data?.error || "Mint failed");
        return null;
      }
    } catch (err) {
      console.error("❌ Mint error:", err.response?.data || err);
      toast.error(err.response?.data?.error || "Mint failed");
      return null;
    }
  };

  /* -------------------------- CREATE LISTING -------------------------- */
  const handleCreateListing = async () => {
    const toastId = toast.loading("Creating listing...");
    setLoading(true);

    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed", { id: toastId });
        return;
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        const switched = await switchToSepolia();
        if (!switched) {
          toast.error("Please switch to Sepolia", { id: toastId });
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
        signer
      );

      let tokenId = item.tokenId;

      if (!tokenId) {
        toast.loading("Minting NFT...", { id: toastId });
        tokenId = await mintNFTToWallet(walletAddress);
        if (!tokenId) {
          toast.error("Mint failed", { id: toastId });
          return;
        }
        item.tokenId = tokenId;
      }

      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
        toast.error("You don't own this NFT", { id: toastId });
        return;
      }

      const approved = await nftContract.getApproved(tokenId);
      if (approved.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()) {
        toast.loading("Approving marketplace...", { id: toastId });
        const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
        await approveTx.wait();
      }

      const listing = await marketplace.getListing(NFT_ADDRESS, tokenId);
      if (listing[2]) {
        toast.success("Already listed!", { id: toastId });
        setListingData({ seller: listing[0], price: listing[1], active: true });
        return;
      }

      toast.loading("Creating listing on marketplace...", { id: toastId });
      const priceWei = ethers.parseEther("0.01");
      const listTx = await marketplace.createListing(NFT_ADDRESS, tokenId, priceWei, {
        gasLimit: 300000,
      });
      await listTx.wait();

      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/listing/create`,
        {
          nftId: item._id,
          tokenId,
          seller: walletAddress.toLowerCase(),
          priceETH: 0.01,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`✅ Listed! Token #${tokenId} @ 0.01 ETH`, {
        id: toastId,
        duration: 5000,
      });

      setListingData({
        seller: walletAddress.toLowerCase(),
        price: priceWei,
        active: true,
      });

      await checkListingStatus();
    } catch (err) {
      console.error("❌ Listing error:", err);
      let msg = "Listing failed";
      if (err.message?.includes("insufficient funds")) msg = "⛽ Add Sepolia ETH";
      else if (err.message?.includes("user rejected")) msg = "Transaction rejected";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------- BUY NFT -------------------------- */
  const handleBuyNFT = async () => {
    const toastId = toast.loading("Processing purchase...");
    setLoading(true);

    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed", { id: toastId });
        return;
      }

      if (!user?.id) {
        toast.error("Please login first", { id: toastId });
        return;
      }

      if (!item.tokenId) {
        toast.error("NFT not minted yet", { id: toastId });
        return;
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        const switched = await switchToSepolia();
        if (!switched) {
          toast.error("Please switch to Sepolia", { id: toastId });
          return;
        }
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const buyer = await signer.getAddress();

      if (buyer.toLowerCase() === item.owner?.toLowerCase()) {
        toast.error("❌ You cannot buy your own NFT", { id: toastId });
        return;
      }

      const balance = await provider.getBalance(buyer);
      if (balance === 0n) {
        toast.error("Your wallet has no ETH", { id: toastId });
        return;
      }

      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const listing = await marketplace.getListing(NFT_ADDRESS, item.tokenId);
      if (!listing[2]) {
        toast.error("NFT not listed for sale", { id: toastId });
        return;
      }

      const price = listing[1];

      if (balance < price) {
        toast.error("Insufficient ETH to buy this NFT", { id: toastId });
        return;
      }

      toast.loading("Buying NFT...", { id: toastId });
      const buyTx = await marketplace.buyNFT(NFT_ADDRESS, item.tokenId, {
        value: price,
        gasLimit: 400000,
      });

      const receipt = await buyTx.wait();

      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sale/record`,
        {
          tokenId: item.tokenId,
          buyer: buyer.toLowerCase(),
          seller: listing[0].toLowerCase(),
          priceETH: ethers.formatEther(price),
          txHash: receipt.hash,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        `✅ NFT Purchased Successfully!\n\nToken ID: ${item.tokenId}\nPrice: ${ethers.formatEther(price)} ETH`,
        { id: toastId, duration: 8000 }
      );

      item.owner = buyer.toLowerCase();
      setIsOwner(true);
      setListingData(null);

    
    } catch (err) {
      console.error("❌ Purchase error:", err);
      let msg = "Purchase failed";
      if (err.message?.includes("insufficient funds")) msg = "Insufficient ETH";
      else if (err.message?.includes("user rejected")) msg = "Transaction rejected";
      else if (err.message?.includes("Cannot buy your own NFT"))
        msg = "You cannot buy your own NFT";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------- CARD PAYMENT -------------------------- */
  const handlePaymentCard = async (productId) => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/game/create`, {
        userId: user.id,
        productId,
      });

      if (res.data?.exist === "no") {
        navigate("/offer", { state: { item } });
      } else {
        toast.error("Already purchased");
      }
    } catch {
      toast.error("Payment failed");
    }
  };

  /* -------------------------- BUTTON LOGIC -------------------------- */
  const getButtonAction = () => {
    if (loading) return { text: "Processing...", disabled: true };

    if (!connectedWallet) {
      return {
        text: "Connect Wallet",
        action: async () => {
          try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            await checkWalletAndOwnership();
            toast.success("Wallet connected!");
          } catch (err) {
            toast.error("Failed to connect wallet");
          }
        },
        disabled: false,
      };
    }

    if (!item.tokenId) {
      return {
        text: "Mint & List NFT",
        action: handleCreateListing,
        disabled: false,
      };
    }

    if (listingData?.active) {
      if (isOwner) {
        return { text: "Your NFT (Listed)", disabled: true };
      }
      return { text: "Buy Now", action: handleBuyNFT, disabled: false };
    }

    if (isOwner) {
      return { text: "List for Sale", action: handleCreateListing, disabled: false };
    }

    return { text: "Not Listed", disabled: true };
  };

  const buttonConfig = getButtonAction();

  /* ---------------------------------- UI ---------------------------------- */
  if (!item) return null;

  return (
    <div className="flex flex-col w-full mt-14 md:px-24 text-white">
      {/* Tabs */}
      <div className="flex flex-col w-full mt-14 md:px-24 text-white">
  {/* Tabs */}
  <div
    className="flex justify-between items-center text-white"
    style={{
      width: "200px",
      height: "28px",
      position: "absolute",
      top: "100px", // moved down from 70px to 100px
      left: "134px",
    }}
  >
    <Link to="/market-place" className="text-white font-medium">
      Overview
    </Link>
    <button
      onClick={() => setShowOffers(true)}
      className="text-white font-medium"
    >
      Offers <span>{offers.length}</span>
    </button>
  </div>
</div>


      {/* Main Content */}
      <div className="max-w-[918px] mx-auto w-full mt-2 flex flex-col md:flex-row gap-8 px-4">
        <img
          src={`${BACKEND_BASE_URL}${collection?.image}`}
          alt={collection?.name}
          className="w-full md:w-[365px] h-[330px] rounded-lg object-cover bg-gradient-to-b from-[#977C34] to-[#493F26] scale-x-[-1]"
        />
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{collection?.name}</h1>
            <p>{collection?.chain} 🔥</p>
          </div>

          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            {connectedWallet && (
              <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                Connected: {connectedWallet.substring(0, 6)}...
                {connectedWallet.substring(38)}
              </span>
            )}
            {item.tokenId && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                Minted #{item.tokenId}
              </span>
            )}
            {listingData?.active && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                Listed
              </span>
            )}
            {isOwner && item.tokenId && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                You Own This
              </span>
            )}
          </div>

          <div className="p-6 rounded-lg">
            <div className="flex justify-between opacity-70 w-full">
              <span>Price</span>
              <span className="truncate max-w-[150px]" title={collection?.owner}>
                Owner:{" "}
                {item.owner
                  ? `${item.owner.substring(0, 6)}...${item.owner.substring(38)}`
                  : collection?.owner}
              </span>
            </div>

            <h2 className="text-xl mt-3">
              {listingData?.active
                ? `${ethers.formatEther(listingData.price)} ETH`
                : `${item.priceETH || 0.01} ETH`}
            </h2>

            <div className="flex justify-end mt-3">
              <FiEye /> <span className="ml-2">505 Views</span>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={buttonConfig.action || (() => setIsOpen(true))}
                disabled={buttonConfig.disabled || loading}
                className={
                  buttonConfig.disabled ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                <CustomButton text={buttonConfig.text} />
              </button>

              <button
                onClick={() => handlePaymentCard(item._id)}
                disabled={loading}
              >
                <CustomButton text="Buy With Card" />
              </button>
            </div>

            <Link
              to="/payment"
              state={{ item }}
              className="flex items-center gap-2 mt-4 hover:text-blue-400"
            >
              Make Offer <FiEdit2 />
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#252B37] p-6 rounded-lg w-full max-w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center">Confirm Action</h2>
            <img
              src={`${BACKEND_BASE_URL}${collection?.image}`}
              alt={collection?.name}
              className="w-40 h-36 mx-auto my-4 rounded object-cover"
            />
            <h3 className="text-center font-semibold">{collection?.name}</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>List Price</span>
                <span>0.01 ETH</span>
              </div>
              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Platform Fee (10%)</span>
                <span>0.001 ETH</span>
              </div>
              <div className="flex justify-between bg-white/10 px-4 py-2 rounded font-bold">
                <span>Total</span>
                <span>0.011 ETH</span>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setIsOpen(false)}>
                <CustomButton text="Cancel" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSecondOpen(true);
                }}
              >
                <CustomButton text="Continue" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      {isSecondOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-4"
          onClick={() => setIsSecondOpen(false)}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSecondOpen(false)}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700"
            >
              &times;
            </button>
            <h1 className="text-white font-bold text-lg md:text-xl">
              {isOwner ? "List NFT" : "Buy NFT"}
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>
            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={`${BACKEND_BASE_URL}${collection?.image}`}
                alt={collection?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>
            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">Price</p>
                <p className="text-white text-sm">0.01 ETH</p>
              </div>
            </div>
            <div className="flex md:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={() => setIsSecondOpen(false)}>
                <CustomButton text="Cancel" />
              </button>
              <button
                onClick={() => {
                  setIsSecondOpen(false);
                  if (isOwner) {
                    handleCreateListing();
                  } else {
                    handleBuyNFT();
                  }
                }}
                disabled={loading}
              >
                <CustomButton text={loading ? "Processing..." : "Confirm"} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFERS POPUP */}
{showOffers && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" 
  style={{ alignItems: 'flex-start', paddingTop: '100px' }}>
    <div className="bg-[#1f2937] w-[700px] relative p-6 text-white">

      {/* Close */}
      <button
        onClick={() => setShowOffers(false)}
        className="absolute top-3 right-4 text-xl opacity-70 hover:opacity-100"
      >
        ×
      </button>

      {/* Header */}
      <h2 className="text-lg font-semibold mb-4">
        {collection?.name}
      </h2>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 pb-2 mb-6">
        <span className="opacity-70">Overview</span>
        <span className="font-semibold border-b-2 border-blue-500">
          Offers {offers.length}
        </span>
      </div>
{/* EMPTY STATE */}
{offers.length === 0 && (
  <div className="relative flex flex-col justify-center items-center h-[420px] overflow-hidden">

    <h1 className="text-center text-white font-bold text-3xl">
      No offers right now
    </h1>

    <div className="flex text-center mt-4">
          <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
          <h1 className="text-[#8C9ED8] font-bold text-[160px] mx-2">0</h1>
          <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
        </div>

        {/* Floating Faces */}
        <div className="absolute top-[11rem] left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <img src={FaceOne} alt="Face One" className="w-28 h-24" />
        </div>

        <div className="absolute top-[15rem] left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <img src={FaceTwo} alt="Face Two" className="w-16 h-10 pb-3" />
        </div>


  
  </div>
)}


      {/* OFFERS LIST */}
      {offers.length > 0 && (
        <div className="w-full">
          <div className="grid grid-cols-5 gap-4 text-sm opacity-70 mb-3">
            <span>Price</span>
            <span>Offers</span>
            <span>From</span>
            <span>Expire In</span>
            <span>Action</span>
          </div>

          {offers.map((offer, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 items-center bg-white/5 p-3 rounded"
            >
              <span>{offer.price} USDT</span>
              <span>Collection</span>
              <span>{offer.from}</span>
              <span>{offer.expire}</span>
              <button className="bg-blue-600 px-3 py-1 rounded text-sm">
                Accept Offer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}


    </div>
  );
}

export default Buy1;