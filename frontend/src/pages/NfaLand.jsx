import React, { useState, useEffect } from "react";
import CustomButton from "../Components/Buttons/Button1";
import CustomButton4 from "../Components/Buttons/Button4";
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
  IMMUTABLE_MARKETPLACE_ADDRESS,
  IMMUTABLE_NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
  IMMUTABLE_CHAIN_ID,
  IMMUTABLE_USDC_ADDRESS,
  ERC20_ABI,
} from "../Web3/Config";

function NfaLand() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract parent and subCollection properly
  const { item, subCollection: passedSubCollection, parentId } = location.state || {};

  // Determine which is parent and which is sub-collection
  let parentCollection, subCollection;

  if (passedSubCollection) {
    // If subCollection was passed separately
    parentCollection = item;
    subCollection = passedSubCollection;
  } else if (item?.isParentCollection) {
    // If item is a parent collection, extract the first sub-collection
    parentCollection = item;
    subCollection = item.subCollections?.[0];
  } else if (item?.subCollection) {
    // If item has subCollection nested
    subCollection = item.subCollection;
    parentCollection = item;
  } else {
    // Fallback: treat item as the collection to display
    subCollection = item;
  }

  // Use subCollection for display
  const collection = subCollection || item;

  const { token, user } = useSelector((state) => state.auth);

  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onChainOwner, setOnChainOwner] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);

  /* ================================ INIT ================================ */
  useEffect(() => {
    console.log("📦 Location State:", location.state);
    console.log("📦 Parent Collection:", parentCollection);
    console.log("📦 Sub-Collection:", subCollection);
    console.log("📦 Collection (display):", collection);

    if (!collection) {
      toast.error("❌ No NFT data found");
      navigate("/buy-land");
      return;
    }
  }, [collection, navigate]);

  useEffect(() => {
    checkWalletAndOwnership();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [collection]);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      checkWalletAndOwnership();
    } else {
      setConnectedWallet(null);
      setIsOwner(false);
      setOnChainOwner(null);
    }
  };

  /* ===================== WALLET + OWNERSHIP CHECK ===================== */
  const checkWalletAndOwnership = async () => {
    try {
      if (!window.ethereum || !collection) return;

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const wallet = accounts[0].toLowerCase();
        setConnectedWallet(wallet);
        console.log("✅ Connected wallet:", wallet);
        console.log("📋 Collection owner from DB:", collection.owner);

        // Check BLOCKCHAIN ownership if tokenId exists
        if (collection.tokenId) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const nftContract = new ethers.Contract(
              IMMUTABLE_NFT_ADDRESS,
              NFT_ABI,
              provider
            );
            const owner = await nftContract.ownerOf(collection.tokenId);
            const ownerLower = owner.toLowerCase();

            setOnChainOwner(ownerLower);
            console.log("⛓️ On-chain owner:", ownerLower);

            if (collection.owner !== ownerLower) {
              console.log("🔄 Updating collection.owner to match blockchain");
              collection.owner = ownerLower;
            }

            const ownerMatch = wallet === ownerLower;
            setIsOwner(ownerMatch);
            console.log("🔍 Is owner (blockchain check):", ownerMatch);
          } catch (err) {
            console.error("❌ Error checking on-chain owner:", err);
            if (collection.owner) {
              const ownerMatch = wallet === collection.owner.toLowerCase();
              setIsOwner(ownerMatch);
              console.log("🔍 Is owner (DB fallback):", ownerMatch);
            } else {
              setIsOwner(false);
            }
          }
        } else {
          // Not minted yet
          if (collection.owner) {
            const ownerMatch = wallet === collection.owner.toLowerCase();
            setIsOwner(ownerMatch);
            console.log("🔍 Is owner (not minted, DB check):", ownerMatch);
          } else {
            setIsOwner(true);
            console.log("🆕 No owner - user can mint");
          }
        }

        if (collection.tokenId) {
          await checkListingStatus();
        }
      }
    } catch (err) {
      console.error("❌ Error checking wallet:", err);
      if (err.code === 4001) {
        console.log("👤 User rejected wallet connection");
      }
    }
  };

  /* ========================= CHECK LISTING ========================= */
  const checkListingStatus = async () => {
    try {
      if (!collection.tokenId) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = new ethers.Contract(
        IMMUTABLE_MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        provider
      );

      const listing = await marketplace.getListing(
        IMMUTABLE_NFT_ADDRESS,
        collection.tokenId
      );

      setListingData({
        seller: listing[0],
        price: listing[1],
        active: listing[2],
      });

      console.log("📊 Listing status:", listing[2] ? "Active" : "Inactive");

      // Also update local collection state
      collection.listed = listing[2];
    } catch (err) {
      console.error("❌ Error checking listing:", err);
    }
  };

  /* ======================== SWITCH IMMUTABLE ======================== */
  const switchToImmutable = async () => {
    const IMMUTABLE_CHAIN_ID_HEX = "0x34a1"; // 13473
    const toastId = toast.loading("🔄 Switching to Immutable network...");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: IMMUTABLE_CHAIN_ID_HEX }],
      });
      toast.success("✅ Switched to Immutable", { id: toastId });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          toast.loading("➕ Adding Immutable network...", { id: toastId });
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: IMMUTABLE_CHAIN_ID_HEX,
                chainName: "Immutable zkEVM Testnet",
                nativeCurrency: {
                  name: "IMX",
                  symbol: "IMX",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.testnet.immutable.com"],
                blockExplorerUrls: ["https://explorer.testnet.immutable.com"],
              },
            ],
          });
          toast.success("✅ Immutable network added", { id: toastId });
          return true;
        } catch (addError) {
          console.error("❌ Failed to add Immutable:", addError);
          toast.error("❌ Failed to add Immutable network", { id: toastId });
          return false;
        }
      }
      console.error("❌ Failed to switch to Immutable:", switchError);
      toast.error("❌ Failed to switch network", { id: toastId });
      return false;
    }
  };

  /* ========================== BACKEND MINT ========================== */
  const mintNFTToWallet = async (buyerWallet) => {
    if (!user?.id || !item._id) {
      toast.error("❌ Invalid user or item data");
      return null;
    }

    try {
      const payload = {
        parentId: item.parentId, // Add this
        subCollectionId: item._id, // Use this instead of docId
        tokenURI: `ipfs://auto-${Date.now()}`,
        royaltyBps: 500,
        creatorWallet: buyerWallet.toLowerCase(),
        chainId: IMMUTABLE_CHAIN_ID,
      };

      console.log("🎨 Minting NFA with payload:", payload);

      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/mint`,
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

  /* ======================= CREATE LISTING ======================= */
  const handleCreateListing = async () => {
    const toastId = toast.loading("🔧 Preparing to list NFA...");
    setLoading(true);

    try {
      // Check MetaMask
      if (!window.ethereum) {
        toast.error("❌ MetaMask not installed", { id: toastId });
        setLoading(false);
        return;
      }

      // Check network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x34a1") {
        toast.dismiss(toastId);
        const switched = await switchToImmutable();
        if (!switched) {
          setLoading(false);
          return;
        }
        toast.loading("🔧 Preparing to list NFA...", { id: toastId });
      }

      // Get signer
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      console.log("👛 Wallet address:", walletAddress);

      const nftContract = new ethers.Contract(IMMUTABLE_NFT_ADDRESS, NFT_ABI, signer);
      const marketplace = new ethers.Contract(
        IMMUTABLE_MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      let tokenId = collection.tokenId;

      // Mint if not exists
      if (!tokenId) {
        toast.loading("🔧 Processing listing...", { id: toastId });
        tokenId = await mintNFTToWallet(walletAddress);

        if (!tokenId) {
          toast.error("❌ Failed to prepare NFA", { id: toastId });
          setLoading(false);
          return;
        }

        collection.tokenId = tokenId;
        collection.owner = walletAddress.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(walletAddress.toLowerCase());

        toast.loading("⏳ Waiting for blockchain confirmation...", {
          id: toastId,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Verify ownership
      toast.loading("🔍 Verifying ownership...", { id: toastId });
      let owner;
      let retries = 3;

      while (retries > 0) {
        try {
          owner = await nftContract.ownerOf(tokenId);
          console.log("⛓️ On-chain owner:", owner);
          console.log("👛 Your wallet:", walletAddress);

          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            collection.owner = owner.toLowerCase();
            setOnChainOwner(owner.toLowerCase());
            setIsOwner(true);
            console.log("✅ Ownership verified");
            break;
          } else if (retries > 1) {
            console.log(`⏳ Owner mismatch, retrying... (${retries - 1} left)`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries--;
            continue;
          } else {
            toast.error("❌ You don't own this NFA", { id: toastId });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("❌ Error getting owner:", err);
          if (retries > 1) {
            console.log(
              `⏳ Retrying blockchain check... (${retries - 1} left)`
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries--;
          } else {
            toast.error("❌ NFT not found on blockchain. Please try again.", {
              id: toastId,
            });
            setLoading(false);
            return;
          }
        }
      }

      // Check approval
      const approved = await nftContract.getApproved(tokenId);
      if (approved.toLowerCase() !== IMMUTABLE_MARKETPLACE_ADDRESS.toLowerCase()) {
        toast.loading("✍️ Approving marketplace...", { id: toastId });
        const approveTx = await nftContract.approve(
          IMMUTABLE_MARKETPLACE_ADDRESS,
          tokenId
        );
        await approveTx.wait();
        console.log("✅ Marketplace approved");
      }

      // Check if already listed
      const listing = await marketplace.getListing(IMMUTABLE_NFT_ADDRESS, tokenId);
      if (listing[2]) {
        toast.success("✅ Already listed!", { id: toastId });
        setListingData({ seller: listing[0], price: listing[1], active: true });
        setLoading(false);
        return;
      }

      // Create listing on blockchain
      toast.loading("📝 Creating marketplace listing...", { id: toastId });
      const priceWei = ethers.parseUnits(String(collection.priceETH || "0.01"), 6);
      const listTx = await marketplace.createListing(
        IMMUTABLE_NFT_ADDRESS,
        tokenId,
        priceWei,
        { gasLimit: 300000 }
      );
      await listTx.wait();
      console.log("✅ Listing created on blockchain");

      // Record in backend
      toast.loading("💾 Saving listing data...", { id: toastId });

      const listingPayload = {
        subCollectionId: collection._id,
        tokenId,
        seller: walletAddress.toLowerCase(),
        priceETH: collection.priceETH || 0.01,
      };

      // Add parentId if available
      if (parentCollection?._id) {
        listingPayload.parentId = parentCollection._id;
      } else if (parentId) {
        listingPayload.parentId = parentId;
      }

      console.log("📤 Sending listing payload:", listingPayload);

      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/create`,
        listingPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Backend response:", response.data);

      toast.success(
        `🎉 NFA listed for sale @ ${collection.priceETH || 0.01} USDC!`,
        {
          id: toastId,
          duration: 5000,
        }
      );

      setListingData({
        seller: walletAddress.toLowerCase(),
        price: priceWei,
        active: true,
      });

      // Update local state
      collection.listed = true;

      await checkListingStatus();

      navigate("/List");
    } catch (err) {
      console.error("❌ Listing error:", err);
      console.error("❌ Error response:", err.response?.data);

      let msg = "❌ Listing failed";
      if (err.response?.data?.error) {
        msg = `❌ ${err.response.data.error}`;
        msg = "⛽ Insufficient gas. Add Immutable IMX";
      } else if (err.message?.includes("user rejected")) {
        msg = "❌ Transaction rejected by user";
      }
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* ============================ BUY NFT ============================ */
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
      if (chainId !== "0x34a1") {
        toast.dismiss(toastId);
        const switched = await switchToImmutable();
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
      console.log("💰 Native ETH Balance:", ethers.formatEther(balance), "ETH");

      if (balance === 0n) {
        toast.error("❌ Your wallet has no ETH for gas", { id: toastId });
        setLoading(false);
        return;
      }

      const usdcContract = new ethers.Contract(IMMUTABLE_USDC_ADDRESS, ERC20_ABI, provider);
      const usdcBalance = await usdcContract.balanceOf(buyer);
      console.log("💰 USDC Balance:", ethers.formatUnits(usdcBalance, 6), "USDC");

      const marketplace = new ethers.Contract(
        IMMUTABLE_MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );
      const nftContract = new ethers.Contract(IMMUTABLE_NFT_ADDRESS, NFT_ABI, provider);

      /* ==================== SCENARIO 1: NOT MINTED ==================== */
      if (!collection.tokenId) {
        toast.loading("🛒 Processing purchase...", { id: toastId });
        console.log("🆕 NFA not minted yet, minting to buyer...");

        const mintedTokenId = await mintNFTToWallet(buyer);

        if (!mintedTokenId) {
          toast.error("❌ Failed to process purchase", { id: toastId });
          setLoading(false);
          return;
        }

        // Update state
        collection.tokenId = mintedTokenId;
        collection.owner = buyer.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(buyer.toLowerCase());
        console.log("✅ NFA prepared, Token ID:", mintedTokenId);

        // Small delay
        toast.loading("⏳ Finalizing purchase...", { id: toastId });


        toast.success(
          `🎉 NFA Purchased Successfully!\n\n🎫 Token ID: ${mintedTokenId}\n💰 Price: ${collection.priceETH || 0.01} USDC\n\n⛓️ Blockchain confirmation in progress...`,
          { id: toastId, duration: 8000 }
        );

        setLoading(false);

        const targetCategory = (collection.category || collection.parentCategory || item?.category || item?.parentCategory || "land").toLowerCase().trim();
        setTimeout(() => {
          navigate("/Profile", { state: { category: targetCategory } });
        }, 2000);

        return; // Scenario 1 processes mint & sale simultaneously on the backend!
      }

      /* ================= SCENARIO 2: ALREADY MINTED ================= */
      toast.loading("🔍 Checking NFT ownership...", { id: toastId });

      let currentOwner;
      try {
        currentOwner = await nftContract.ownerOf(collection.tokenId);
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
      const listing = await marketplace.getListing(IMMUTABLE_NFT_ADDRESS, collection.tokenId);

      if (!listing[2]) {
        toast.error("❌ This NFA is not listed for sale", { id: toastId });
        setLoading(false);
        return;
      }

      const price = listing[1];
      console.log("💰 Listing price:", ethers.formatEther(price), "USDC/ETH Equivalent");

      // Check balance
      if (usdcBalance < price) {
        toast.error(
          `❌ Insufficient USDC\n\nNeed: ${ethers.formatUnits(price, 6)} USDC\nYou have: ${ethers.formatUnits(usdcBalance, 6)} USDC`,
          { id: toastId, duration: 6000 }
        );
        setLoading(false);
        return;
      }

      toast.loading("🔒 Checking USDC allowance...", { id: toastId });

      const allowance = await usdcContract.allowance(buyer, IMMUTABLE_MARKETPLACE_ADDRESS);

      if (allowance < price) {
        toast.loading("✍️ Approving USDC for purchase...", { id: toastId });
        try {
          const usdcWithSigner = usdcContract.connect(signer);
          const approveTx = await usdcWithSigner.approve(IMMUTABLE_MARKETPLACE_ADDRESS, price);
          await approveTx.wait();
          console.log("✅ USDC Approved!");
        } catch (approveErr) {
          console.error("❌ Approval failed:", approveErr);
          toast.error("❌ USDC Approval failed", { id: toastId });
          setLoading(false);
          return;
        }
      }

      // Execute purchase
      toast.loading("💳 Processing purchase transaction...", { id: toastId });
      console.log("🛒 Executing buyNFT...");

      const buyTx = await marketplace.buyNFT(IMMUTABLE_NFT_ADDRESS, collection.tokenId, {
        gasLimit: 400000, // value removed, using USDC now
      });

      toast.loading("⏳ Waiting for transaction confirmation...", {
        id: toastId,
      });
      const receipt = await buyTx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);

      // Record sale in backend
      toast.loading("💾 Recording purchase...", { id: toastId });
      try {
        const salePayload = {
          tokenId: collection.tokenId,
          buyer: buyer.toLowerCase(),
          seller: listing[0].toLowerCase(),
          priceETH: ethers.formatUnits(price, 6),
          txHash: receipt.hash,
        };

        // Add parent/sub-collection IDs if available
        if (parentCollection?._id) {
          salePayload.parentId = parentCollection._id;
        } else if (parentId) {
          salePayload.parentId = parentId;
        }

        if (collection._id) {
          salePayload.subCollectionId = collection._id;
        }

        console.log("📤 Recording sale with payload:", salePayload);

        await axios.post(
          `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/sale/record`,
          salePayload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ Sale recorded in backend");
      } catch (recordErr) {
        console.error("⚠️ Error recording sale:", recordErr);
        console.error("⚠️ Error response:", recordErr.response?.data);
      }

      toast.success(
        `🎉 NFA Purchased Successfully!\n\n🎫 Token ID: ${collection.tokenId}\n💰 Price: ${ethers.formatUnits(price, 6)} USDC\n📜 TX: ${receipt.hash.substring(0, 10)}...`,
        { id: toastId, duration: 8000 }
      );

      // Update state
      collection.owner = buyer.toLowerCase();
      setIsOwner(true);
      setOnChainOwner(buyer.toLowerCase());
      setListingData(null);
      console.log("✅ Purchase complete!");

      const targetCategory = (collection.category || collection.parentCategory || item?.category || item?.parentCategory || "land").toLowerCase().trim();
      navigate("/Profile", { state: { category: targetCategory } });
    } catch (err) {
      console.error("❌ Purchase error:", err);
      let msg = "❌ Purchase failed";

      if (err.message?.includes("insufficient funds")) {
        msg = "⛽ Insufficient ETH for gas fees";
      } else if (err.message?.includes("user rejected") || err.code === 4001 || err.code === "ACTION_REJECTED") {
        msg = "❌ Transaction rejected by user";
      } else if (err.response?.data?.error) {
        msg = `❌ ${err.response.data.error}`;
      } else {
        msg = `❌ ${err.shortMessage || err.message?.substring(0, 100) || "Unknown Error"}`;
      }

      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* ======================== CARD PAYMENT ======================== */
  const handlePaymentCard = async (productId) => {
    if (!user?.id) {
      toast.error("❌ Please login first");
      return;
    }

    const toastId = toast.loading("💳 Processing card payment...");

    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/game/create`, {
        userId: user.id,
        productId,
      });

      if (res.data?.exist === "no") {
        toast.success("✅ Payment initiated", { id: toastId });
        navigate("/offer", { state: { item: collection } });
      } else {
        toast.error("❌ Already purchased", { id: toastId });
      }
    } catch (err) {
      console.error("❌ Card payment error:", err);
      toast.error("❌ Payment failed", { id: toastId });
    }
  };

  /* ======================== BUTTON LOGIC ======================== */
  const isPlatformOwned = !collection.owner || collection.owner === "admin";

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

    // If user is not owner, and NFT is listed OR platform-owned, show Buy button
    if (!isOwner && (listingData?.active || isPlatformOwned)) {
      return {
        text: "🛒 Buy Now",
        action: handleBuyNFT,
      };
    }

    // If user is owner but not listed, allow them to list
    if (isOwner && !listingData?.active) {
      return {
        text: "📝 List Now",
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
                ? `${ethers.formatUnits(listingData.price, 6)} USDC`
                : `${item.priceETH || 0.01} USDC`}
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
                <CustomButton4 text={buttonConfig.text} />
              </button>

              <button
                onClick={() => handlePaymentCard(item._id)}
                disabled={loading}
              >
                <CustomButton4 text="Buy With Card" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          onClick={() => setIsSecondOpen(false)}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto"
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
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
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
