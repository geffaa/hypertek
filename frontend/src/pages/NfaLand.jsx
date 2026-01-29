import React, { useState, useEffect } from "react";
import CustomButton from "../Components/Buttons/Button1";
import { FiEdit2, FiEye } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../Config";
import FaceOne from "../assets/images/noActivity1.png";
import FaceTwo from "../assets/images/noActivity2.png";

import BuyNfa2 from "../Components/BuyNfa/BuyNfa2";
import { ethers } from "ethers";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
} from "../Web3/Config";

function NfaLand() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { item } = location.state || {};
  const collection = item?.collection;
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onChainOwner, setOnChainOwner] = useState(null);

  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    if (!item) {
      toast.error("No land selected");
      navigate("/buy-nfa");
    }
  }, [item, navigate]);

  // Check connected wallet and ownership
  useEffect(() => {
    checkWalletAndOwnership();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      }
    };
  }, [item]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      checkWalletAndOwnership();
    } else {
      setConnectedWallet(null);
      setIsOwner(false);
      setOnChainOwner(null);
    }
  };

  const checkWalletAndOwnership = async () => {
    try {
      if (!window.ethereum || !item) return;

      // Request accounts to ensure wallet is connected
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const wallet = accounts[0].toLowerCase();
        setConnectedWallet(wallet);
        console.log("Connected wallet:", wallet);
        console.log("Item owner from DB:", item.owner);

        // ✅ If tokenId exists, check BLOCKCHAIN ownership (source of truth)
        if (item.tokenId) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const nftContract = new ethers.Contract(
              NFT_ADDRESS,
              NFT_ABI,
              provider,
            );
            const owner = await nftContract.ownerOf(item.tokenId);
            const ownerLower = owner.toLowerCase();

            setOnChainOwner(ownerLower);
            console.log("On-chain owner:", ownerLower);

            // Update item.owner if blockchain differs from database
            if (item.owner !== ownerLower) {
              console.log("Updating item.owner to match blockchain");
              item.owner = ownerLower;
            }

            const ownerMatch = wallet === ownerLower;
            setIsOwner(ownerMatch);
            console.log("Is owner (blockchain check):", ownerMatch);
          } catch (err) {
            console.error("Error checking on-chain owner:", err);
            // Fallback to database owner if blockchain check fails
            if (item.owner) {
              const ownerMatch = wallet === item.owner.toLowerCase();
              setIsOwner(ownerMatch);
              console.log("Is owner (DB fallback):", ownerMatch);
            } else {
              setIsOwner(false);
            }
          }
        } else {
          // Not minted yet - check database owner or allow anyone to mint
          if (item.owner) {
            const ownerMatch = wallet === item.owner.toLowerCase();
            setIsOwner(ownerMatch);
            console.log("Is owner (not minted, DB check):", ownerMatch);
          } else {
            // If no owner set yet, user can mint it
            setIsOwner(true);
            console.log("No owner - user can mint");
          }
        }

        // Check listing status if tokenId exists
        if (item.tokenId) {
          await checkListingStatus();
        }
      }
    } catch (err) {
      console.error("Error checking wallet:", err);
      // If user rejects, don't show error but allow manual connection
      if (err.code === 4001) {
        console.log("User rejected wallet connection");
      }
    }
  };

  const checkListingStatus = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        provider,
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

  const mintNFTToWallet = async (buyerWallet) => {
    if (!user?.id || !item._id) {
      toast.error("❌ Invalid user or item data");
      return null;
    }

    // Don't show toast here - let the calling function handle it

    try {
      const payload = {
        docId: item._id,
        tokenURI: `ipfs://auto-${Date.now()}`,
        royaltyBps: 500,
        creatorWallet: buyerWallet.toLowerCase(),
      };

      console.log("🎨 Minting NFA with payload:", payload);

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
        console.log("✅ Mint successful, Token ID:", res.data.tokenId);
        return res.data.tokenId;
      } else {
        console.error("❌ Mint response invalid:", res.data);
        return null;
      }
    } catch (err) {
      console.error("❌ Mint error:", err.response?.data || err);
      return null;
    }
  };

  const handleCreateListing = async () => {
    const toastId = toast.loading("Creating listing...");
    setLoading(true);

    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed", { id: toastId });
        setLoading(false);
        return;
      }

      // Switch to Sepolia
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        const switched = await switchToSepolia();
        if (!switched) {
          toast.error("Please switch to Sepolia", { id: toastId });
          setLoading(false);
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

      let tokenId = item.tokenId;

      // If not minted, mint first
      if (!tokenId) {
        toast.loading("Minting NFA...", { id: toastId });
        tokenId = await mintNFTToWallet(walletAddress);
        if (!tokenId) {
          toast.error("Mint failed", { id: toastId });
          setLoading(false);
          return;
        }

        // ✅ UPDATE ITEM TOKEN ID AND OWNER
        item.tokenId = tokenId;
        item.owner = walletAddress.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(walletAddress.toLowerCase());

        // ✅ WAIT FOR BLOCKCHAIN TO SYNC
        toast.loading("Waiting for blockchain confirmation...", {
          id: toastId,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // ✅ VERIFY OWNERSHIP ON-CHAIN BEFORE PROCEEDING
      let owner;
      let retries = 3;
      while (retries > 0) {
        try {
          owner = await nftContract.ownerOf(tokenId);
          console.log("On-chain owner:", owner);
          console.log("Wallet address:", walletAddress);

          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            // ✅ Update local state with blockchain owner
            item.owner = owner.toLowerCase();
            setOnChainOwner(owner.toLowerCase());
            setIsOwner(true);
            break;
          } else if (retries > 1) {
            // Wait and retry if owner doesn't match
            console.log(
              `Owner mismatch, retrying... (${retries - 1} attempts left)`,
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries--;
            continue;
          } else {
            toast.error("You don't own this NFT", { id: toastId });
            setLoading(false);
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
            toast.error(
              "NFT not found on blockchain yet. Please try again in a moment.",
              { id: toastId },
            );
            setLoading(false);
            return;
          }
        }
      }

      // Approve marketplace if not approved
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
        setListingData({ seller: listing[0], price: listing[1], active: true });
        setLoading(false);
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

      // Update database
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
        },
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

      // Refresh listing status
      await checkListingStatus();
    } catch (err) {
      console.error("❌ Listing error:", err);
      let msg = "Listing failed";
      if (err.message?.includes("insufficient funds"))
        msg = "⛽ Add Sepolia ETH";
      else if (err.message?.includes("user rejected"))
        msg = "Transaction rejected";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // BUY NFT (Buyer purchases from listing)
  const handleBuyNFT = async () => {
    const toastId = toast.loading("🛒 Preparing purchase...");
    setLoading(true);

    try {
      // Check MetaMask
      if (!window.ethereum) {
        toast.error("❌ MetaMask not installed", { id: toastId });
        setLoading(false);
        return;
      }

      // Check login
      if (!user?.id) {
        toast.error("❌ Please login first", { id: toastId });
        setLoading(false);
        return;
      }

      // Check network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        toast.dismiss(toastId);
        const switched = await switchToSepolia();
        if (!switched) {
          setLoading(false);
          return;
        }
        toast.loading("🛒 Preparing purchase...", { id: toastId });
      }

      // Get signer
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const buyer = await signer.getAddress();
      console.log("👛 Buyer wallet:", buyer);

      // Check balance
      const balance = await provider.getBalance(buyer);
      console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

      if (balance === 0n) {
        toast.error("❌ Your wallet has no ETH", { id: toastId });
        setLoading(false);
        return;
      }

      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer,
      );
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

      /* ==================== SCENARIO 1: NOT MINTED ==================== */
      if (!item.tokenId) {
        toast.loading("🛒 Processing purchase...", { id: toastId });
        console.log("🆕 NFA not minted yet, minting to buyer...");

        const mintedTokenId = await mintNFTToWallet(buyer);

        if (!mintedTokenId) {
          toast.error("❌ Failed to process purchase", { id: toastId });
          setLoading(false);
          return;
        }

        // Update state
        item.tokenId = mintedTokenId;
        item.owner = buyer.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(buyer.toLowerCase());
        console.log("✅ NFA prepared, Token ID:", mintedTokenId);

        // Small delay
        toast.loading("⏳ Finalizing purchase...", { id: toastId });
        await new Promise((r) => setTimeout(r, 1500));

        toast.success(
          `🎉 NFA Purchased Successfully!\n\n🎫 Token ID: ${mintedTokenId}\n💰 Price: ${item.priceETH || 0.01} ETH\n\n⛓️ Blockchain confirmation in progress...`,
          { id: toastId, duration: 8000 },
        );

        setLoading(false);

        // Redirect to marketplace profile after 2 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 2000);

        return;
      }

      /* ================= SCENARIO 2: ALREADY MINTED ================= */
      toast.loading("🔍 Checking NFT ownership...", { id: toastId });

      let currentOwner;
      try {
        currentOwner = await nftContract.ownerOf(item.tokenId);
        currentOwner = currentOwner.toLowerCase();
        console.log("⛓️ Current NFT owner:", currentOwner);
      } catch (err) {
        console.error("❌ Error checking owner:", err);
        toast.error("❌ NFT not found on blockchain", { id: toastId });
        setLoading(false);
        return;
      }

      // Prevent self-purchase
      if (buyer.toLowerCase() === currentOwner) {
        toast.error("❌ You already own this NFA!", { id: toastId });
        setLoading(false);
        return;
      }

      // Check listing
      toast.loading("📋 Verifying listing...", { id: toastId });
      const listing = await marketplace.getListing(NFT_ADDRESS, item.tokenId);

      if (!listing[2]) {
        toast.error("❌ This NFA is not listed for sale", { id: toastId });
        setLoading(false);
        return;
      }

      const price = listing[1];
      console.log("💰 Listing price:", ethers.formatEther(price), "ETH");

      // Check balance
      if (balance < price) {
        toast.error(
          `❌ Insufficient ETH\n\nNeed: ${ethers.formatEther(price)} ETH\nYou have: ${ethers.formatEther(balance)} ETH`,
          { id: toastId, duration: 6000 },
        );
        setLoading(false);
        return;
      }

      // Execute purchase
      toast.loading("💳 Processing purchase transaction...", { id: toastId });
      console.log("🛒 Executing buyNFT...");

      const buyTx = await marketplace.buyNFT(NFT_ADDRESS, item.tokenId, {
        value: price,
        gasLimit: 400000,
      });

      toast.loading("⏳ Waiting for transaction confirmation...", {
        id: toastId,
      });
      const receipt = await buyTx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);

      // Record sale
      toast.loading("💾 Recording purchase...", { id: toastId });
      try {
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
          },
        );
        console.log("✅ Sale recorded in backend");
      } catch (recordErr) {
        console.error("⚠️ Error recording sale:", recordErr);
      }

      toast.success(
        `🎉 NFA Purchased Successfully!\n\n🎫 Token ID: ${item.tokenId}\n💰 Price: ${ethers.formatEther(price)} ETH\n📜 TX: ${receipt.hash.substring(0, 10)}...`,
        { id: toastId, duration: 8000 },
      );

      // Update state
      item.owner = buyer.toLowerCase();
      setIsOwner(true);
      setOnChainOwner(buyer.toLowerCase());
      setListingData(null);
      console.log("✅ Purchase complete!");

      // Redirect to marketplace profile after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      console.error("❌ Purchase error:", err);
      let msg = "❌ Purchase failed";

      if (err.message?.includes("insufficient funds")) {
        msg = "⛽ Insufficient ETH for gas fees";
      } else if (err.message?.includes("user rejected")) {
        msg = "❌ Transaction rejected by user";
      } else if (err.code === "ACTION_REJECTED") {
        msg = "❌ Transaction was rejected";
      } else if (err.response?.data?.error) {
        msg = `❌ ${err.response.data.error}`;
      }

      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Handle payment with card
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

  if (!item) return null;

  // Determine button text and action
  const isPlatformOwned = !item.owner || item.owner === "admin";

  // Check if NFT is available for purchase (not minted yet OR has different owner)
  const isAvailableForPurchase = () => {
    // Not minted yet - can be purchased by anyone
    if (!item.tokenId) return true;

    // Platform owned - can be purchased
    if (isPlatformOwned) return true;

    // Listed on marketplace - can be purchased by non-owners
    if (listingData?.active && !isOwner) return true;

    // Has an owner but not the current user and not listed
    // This handles user-created NFTs that haven't been listed yet
    if (item.owner && !isOwner && !item.tokenId) return true;

    return false;
  };

  const getButtonAction = () => {
    if (loading) return { text: "⏳ Processing...", disabled: true };

    if (!connectedWallet) {
      return {
        text: "🔌 Connect Wallet",
        action: async () => {
          const toastId = toast.loading("🔌 Connecting wallet...");
          try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            await checkWalletAndOwnership();
            toast.success("✅ Wallet connected", { id: toastId });
          } catch (err) {
            toast.error("❌ Connection failed", { id: toastId });
          }
        },
      };
    }

    // If NFT is available for purchase and user is not the owner
    if (!isOwner && isAvailableForPurchase()) {
      return {
        text: "🛒 Buy Now",
        action: handleBuyNFT,
      };
    }

    // If user is owner but not listed, allow them to list
    if (isOwner && !listingData?.active) {
      return {
        text: "💰 Sell Now",
        action: handleCreateListing,
      };
    }

    // If user is owner and listed, show listed status
    if (isOwner && listingData?.active) {
      return {
        text: "✅ Your NFA (Listed)",
        disabled: true,
      };
    }

    // NFT is owned by someone else and not listed - cannot buy
    if (!isOwner && item.tokenId && !listingData?.active) {
      return {
        text: "❌ Not Listed For Sale",
        disabled: true,
      };
    }

    // Fallback
    return { text: "❌ Not Available", disabled: true };
  };

  const buttonConfig = getButtonAction();

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
      <div className="max-w-[918px] mx-auto w-full mt-10 flex flex-col md:flex-row gap-8 px-4">
        <img
          src={`${BACKEND_BASE_URL}${collection?.image}`}
          alt={collection?.name}
          className="w-full md:w-[365px] h-[330px] rounded-lg object-cover 
bg-gradient-to-b from-[#977C34] to-[#493F26] "
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
            {/* {item.tokenId && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                Minted #{item.tokenId}
              </span>
            )} */}
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

          <div className=" p-6 rounded-lg">
            <div className="flex justify-between opacity-70 w-full">
              <span>Price</span>
              <span
                className="truncate max-w-[150px]"
                title={onChainOwner || item.owner || collection?.owner}
              >
                Owner:{" "}
                {onChainOwner || item.owner
                  ? `${(onChainOwner || item.owner).substring(0, 6)}...${(onChainOwner || item.owner).substring(38)}`
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
      <BuyNfa2 />

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
      {showOffers && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          style={{ alignItems: "flex-start", paddingTop: "100px" }}
        >
          <div className="bg-[#1f2937] w-[700px] relative p-6 text-white">
            <button
              onClick={() => setShowOffers(false)}
              className="absolute top-3 right-4 text-xl opacity-70 hover:opacity-100"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">{collection?.name}</h2>

            <div className="flex gap-6 border-b border-white/10 pb-2 mb-6">
              <span className="opacity-70">Overview</span>
              <span className="font-semibold border-b-2 border-blue-500">
                Offers {offers.length}
              </span>
            </div>

            {offers.length === 0 && (
              <div className="relative flex flex-col justify-center items-center h-[420px] overflow-hidden">
                <h1 className="text-center font-bold text-3xl">
                  No offers right now
                </h1>

                <div className="flex mt-4">
                  <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
                  <h1 className="text-[#8C9ED8] font-bold text-[160px] mx-2">
                    0
                  </h1>
                  <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
                </div>

                <div className="absolute top-[11rem] left-1/2 -translate-x-1/2">
                  <img src={FaceOne} className="w-28 h-24" />
                </div>

                <div className="absolute top-[15rem] left-1/2 -translate-x-1/2">
                  <img src={FaceTwo} className="w-16 h-10 pb-3" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NfaLand;
