import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { useAccount, useWalletClient, usePublicClient, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEmailWallet } from "../../hooks/useEmailWallet";

import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import {
  BASE_NFT_ADDRESS,
  BASE_MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,
  PLATFORM_WALLET_ADDRESS,
  BASE_CHAIN_ID,
  BASE_USDC_ADDRESS,
  ERC20_ABI,
} from "../../Web3/Config";
import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { BACKEND_BASE_URL } from "../../Config";
import CustomButton from "../Buttons/Button1";
import { FiEye, FiEdit2, FiCopy } from "react-icons/fi";

function Buy1() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract parent and subCollection properly
  const {
    item,
    subCollection: passedSubCollection,
    parentId,
    subCollectionId,
    buyerWallet,
    priceETH,
    itemType,
    tokenId
  } = location.state || {};

  // Determine which is parent and which is sub-collection
  let parentCollection, subCollection;

  if (passedSubCollection) {
    parentCollection = item;
    subCollection = passedSubCollection;
  } else if (item?.isParentCollection) {
    parentCollection = item;
    subCollection = item.subCollections?.[0];
  } else if (item?.subCollection) {
    subCollection = item.subCollection;
    parentCollection = item;
  } else {
    subCollection = item;
  }

  const collection = subCollection || item;
  if (!collection) return null;
  const { token, user } = useSelector((state) => state.auth);

  // RainbowKit hooks
  const { address: connectedWallet, isConnected, chain, connector } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: walletClient } = useWalletClient();

  // Dynamic Chain Configuration
  const TARGET_CHAIN_ID = BASE_CHAIN_ID;
  const publicClient = usePublicClient({ chainId: TARGET_CHAIN_ID });
  const { switchChain } = useSwitchChain();

  // Primary Addresses
  const CURRENT_NFT_ADDRESS = BASE_NFT_ADDRESS;
  const CURRENT_MARKETPLACE_ADDRESS = BASE_MARKETPLACE_ADDRESS;

  // Email Wallet Hook (Fallback for Email/Social Logins)
  const {
    emailWalletAddress,
    emailWalletClient,
    isEmailWalletConnected,
  } = useEmailWallet();

  // Unified Address & Client Priority: standard Wagmi > local Email Wallet
  const activeAddress = connectedWallet || emailWalletAddress;
  const isAnyConnected = isConnected || isEmailWalletConnected;
  const activeWalletClient = walletClient || emailWalletClient;

  const [isOwner, setIsOwner] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onChainOwner, setOnChainOwner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [listingPrice, setListingPrice] = useState(''); // ✅ Custom price for re-listing
  const [isEditingPrice, setIsEditingPrice] = useState(false); // ✅ Toggle inline edit

  /* ================================ INIT ================================ */
  useEffect(() => {
    console.log("📦 Location State:", location.state);
    console.log("📦 Parent Collection:", parentCollection);
    console.log("📦 Sub-Collection:", subCollection);
    console.log("📦 Collection (display):", collection);

    if (!collection) {
      toast.error("❌ No NFT data found");
      navigate("/buy-nfa");
      return;
    }
  }, [collection, navigate]);

  // ✅ Fetch Fresh Data on Mount
  useEffect(() => {
    const fetchFreshData = async () => {
      if (collection?._id) {
        try {
          // If it's a sub-collection, we might need a specific endpoint or parent lookup
          // But for now, let's rely on checking ownership on-chain which we already do.
          // Or if we have an endpoint for single sub-collection:
          // const res = await axios.get(...) 
          // Since we don't have a direct "get sub-collection by ID" easily exposed without parentId, 
          // we will rely on on-chain data primarily.

          // However, we can re-verify the owner from the backend if possible.
        } catch (e) {
          console.error("Refetch error", e);
        }
      }
    };
    fetchFreshData();
  }, [collection?._id]);

  useEffect(() => {
    if (publicClient && collection) {
      checkWalletAndOwnership();
    }
  }, [collection, isAnyConnected, activeAddress, publicClient]);

  /* ===================== WALLET + OWNERSHIP CHECK ===================== */
  const checkWalletAndOwnership = async () => {
    try {
      if (!publicClient || !collection) return;

      const wallet = activeAddress ? activeAddress.toLowerCase() : null;
      if (wallet) {
        console.log("✅ Connected wallet:", wallet);
      }
      console.log("📋 Collection owner from DB:", collection.owner);

      // Check BLOCKCHAIN ownership if tokenId exists
      if (collection.tokenId) {
        try {
          const nftContract = {
            address: CURRENT_NFT_ADDRESS,
            abi: NFT_ABI,
          };

          const owner = await publicClient.readContract({
            ...nftContract,
            functionName: 'ownerOf',
            args: [collection.tokenId],
          });

          const ownerLower = owner.toLowerCase();

          // SMART CHECK: If on-chain owner is Platform (0x11dd...), but DB says it's a User (0x...),
          // and we are on Immutable (default), it likely means the item is actually on Immutable.
          // In this case, we TRUST THE DB OWNER for display purposes.

          const isPlatform = ownerLower === PLATFORM_WALLET_ADDRESS.toLowerCase();
          const dbOwnerIsUser = collection.owner && collection.owner.toLowerCase() !== PLATFORM_WALLET_ADDRESS.toLowerCase();

          if (isPlatform && dbOwnerIsUser) {
            console.warn("⚠️ Chain mismatch detected! On-chain is Platform, but DB is User. Likely on Immutable.");
            setOnChainOwner(collection.owner.toLowerCase());
          } else {
            setOnChainOwner(ownerLower);
          }

          if (collection.owner !== ownerLower) {
            // Only update if we are sure? No, let's keep local state sync but be careful about overwriting if mismatch
            if (isPlatform && dbOwnerIsUser) {
              // Do NOT overwrite collection.owner with Platform address if DB says User
            } else {
              console.log("🔄 Updating collection.owner to match blockchain");
              collection.owner = ownerLower;
            }
          }

          const ownerToCompare = (isPlatform && dbOwnerIsUser) ? collection.owner.toLowerCase() : ownerLower;
          const ownerMatch = wallet && wallet === ownerToCompare;

          setIsOwner(ownerMatch);
          console.log("🔍 Is owner (blockchain check):", ownerMatch);
        } catch (err) {
          console.error("❌ Error checking on-chain owner:", err);

          // If read fails (e.g. wrong chain), trust DB
          if (collection.owner) {
            const ownerMatch = wallet && wallet === collection.owner.toLowerCase();
            setIsOwner(ownerMatch);
            setOnChainOwner(collection.owner.toLowerCase()); // Trust DB
            console.log("🔍 Is owner (DB fallback):", ownerMatch);
          } else {
            setIsOwner(false);
          }
        }
      } else {
        // Not minted yet
        if (collection.owner) {
          const ownerMatch = wallet && wallet === collection.owner.toLowerCase();
          setIsOwner(ownerMatch);
          console.log("🔍 Is owner (not minted, DB check):", ownerMatch);
        } else {
          setIsOwner(false);
          console.log("🆕 No owner - treated as Platform owned (Buy Now)");
        }
      }

      if (collection.tokenId) {
        await checkListingStatus();
      }
    } catch (err) {
      console.error("❌ Error checking wallet:", err);
    }
  };

  /* ========================= CHECK LISTING ========================= */
  const checkListingStatus = async () => {
    try {
      if (!collection.tokenId || !publicClient) return;

      const marketplaceContract = {
        address: CURRENT_MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
      };

      const listing = await publicClient.readContract({
        ...marketplaceContract,
        functionName: 'getListing',
        args: [CURRENT_NFT_ADDRESS, collection.tokenId],
      });

      setListingData({
        seller: listing[0],
        price: listing[1],
        active: listing[2],
      });

      console.log("📊 Listing status:", listing[2] ? "Active" : "Inactive");
      collection.listed = listing[2];
    } catch (err) {
      console.error("❌ Error checking listing:", err);
    }
  };

  const ensureCorrectNetwork = async () => {
    const targetChainId = TARGET_CHAIN_ID;
    const targetChainName = "Base Sepolia Testnet";

    if (chain?.id === targetChainId) {
      return true;
    }

    const toastId = toast.loading(`🔄 Switching to ${targetChainName}...`);

    try {
      if (switchChain) {
        await switchChain({ chainId: targetChainId });
        toast.success(`✅ Switched to ${targetChainName}`, { id: toastId });
        return true;
      } else {
        toast.error("❌ Network switch not supported by wallet", { id: toastId });
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to switch network:", error);
      toast.error(`❌ Please switch to ${targetChainName} manually`, { id: toastId });
      return false;
    }
  };

  /* ========================== BACKEND MINT ========================== */
  const mintNFTToWallet = async (buyerWallet) => {
    if (!user?.id || !item._id) {
      throw new Error("Invalid user or item data");
    }

    try {
      const payload = {
        parentId: item.parentId,
        subCollectionId: item._id,
        tokenURI: `ipfs://auto-${Date.now()}`,
        royaltyBps: 500,
        creatorWallet: buyerWallet.toLowerCase(),
        chainId: TARGET_CHAIN_ID,
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
        throw new Error(res.data?.error || res.data?.message || "Mint response invalid");
      }
    } catch (err) {
      console.error("❌ Mint error:", err.response?.data || err);
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw err;
    }
  };

  /* ======================= CREATE LISTING ======================= */
  const handleCreateListing = async () => {
    if (!isAnyConnected) {
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    const toastId = toast.loading("🔧 Preparing to list NFA...");
    setLoading(true);

    try {
      if (!activeWalletClient || !publicClient) {
        toast.error("❌ Wallet not connected properly", { id: toastId });
        setLoading(false);
        return;
      }

      // Ensure we're on the correct network
      const networkOk = await ensureCorrectNetwork();
      if (!networkOk) {
        setLoading(false);
        return;
      }

      const walletAddress = activeAddress;
      console.log("👛 Wallet address:", walletAddress);

      let tokenId = collection.tokenId;

      // Mint if not exists
      if (!tokenId) {
        toast.loading("🔧 Processing listing...", { id: toastId });
        try {
          tokenId = await mintNFTToWallet(walletAddress);
        } catch (mintErr) {
          console.error("❌ Minting error:", mintErr);
          const errMsg = mintErr.message || "";
          if (errMsg.toLowerCase().includes("insufficient eth") || errMsg.toLowerCase().includes("fund")) {
            toast.error("❌ Minting Failed: Insufficient funds in backend wallet. Please contact support.", { id: toastId, duration: 8000 });
          } else {
            toast.error(`❌ Minting Failed: ${errMsg}`, { id: toastId, duration: 8000 });
          }
          setLoading(false);
          return;
        }

        collection.tokenId = tokenId;
        collection.owner = walletAddress.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(walletAddress.toLowerCase());

        toast.success("✅ NFT Minted! Indexing...", { id: toastId });

        // Short wait to allow indexing
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // Verify ownership
      toast.loading("🔍 Verifying ownership...", { id: toastId });

      console.log("🔍 Checking ownership on Contract:", CURRENT_NFT_ADDRESS);
      console.log("🔍 Token ID:", tokenId);
      console.log("🔍 Expected Owner:", walletAddress);

      const nftContract = {
        address: CURRENT_NFT_ADDRESS,
        abi: NFT_ABI,
      };

      let owner;
      let retries = 15; // Increased retries

      while (retries > 0) {
        try {
          owner = await publicClient.readContract({
            ...nftContract,
            functionName: 'ownerOf',
            args: [tokenId],
          });

          console.log("⛓️ On-chain owner result:", owner);

          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            collection.owner = owner.toLowerCase();
            setOnChainOwner(owner.toLowerCase());
            setIsOwner(true);
            console.log("✅ Ownership verified");
            break;
          } else if (retries > 1) {
            console.log(`⏳ Owner mismatch/pending (${retries - 1} retries left)...`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            retries--;
            continue;
          } else {
            // ... existing failure logic
            toast.error("❌ Ownership mismatch after retries", { id: toastId });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("❌ Error getting owner:", err);
          if (retries > 1) {
            console.log(
              `⏳ Retrying blockchain check... (${retries - 1} left)`,
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

      // Check approval (Use setApprovalForAll for Marketplace)
      toast.loading("✍️ Checking marketplace approval...", { id: toastId });

      const isApprovedForAll = await publicClient.readContract({
        ...nftContract,
        functionName: 'isApprovedForAll',
        args: [walletAddress, CURRENT_MARKETPLACE_ADDRESS],
      });

      if (!isApprovedForAll) {
        toast.loading("✍️ Approving marketplace (One-time)...", { id: toastId });
        console.log("📝 sending setApprovalForAll tx...");

        try {
          const { request } = await publicClient.simulateContract({
            ...nftContract,
            functionName: 'setApprovalForAll',
            args: [CURRENT_MARKETPLACE_ADDRESS, true],
            account: walletAddress,
          });

          const approveTx = await activeWalletClient.writeContract(request);
          toast.loading("⏳ Waiting for approval confirmation...", { id: toastId });
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
          console.log("✅ Marketplace approved for all");
        } catch (approveError) {
          console.error("❌ Approval failed:", approveError);
          // Special handling for user rejection
          if (approveError.message.includes("User rejected")) {
            toast.error("❌ Approval rejected by user", { id: toastId });
          } else {
            toast.error("❌ Approval transaction failed", { id: toastId });
          }
          setLoading(false);
          return;
        }
      }

      // Check if already listed
      const marketplaceContract = {
        address: CURRENT_MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
      };

      const listing = await publicClient.readContract({
        ...marketplaceContract,
        functionName: 'getListing',
        args: [CURRENT_NFT_ADDRESS, tokenId],
      });

      if (listing[2]) {
        toast.success("✅ Already listed!", { id: toastId });
        setListingData({ seller: listing[0], price: listing[1], active: true });
        setLoading(false);
        return;
      }

      // Use custom listing price if owner set one, otherwise fallback to collection price
      const finalPrice = listingPrice && parseFloat(listingPrice) > 0
        ? listingPrice
        : String(collection.priceETH || "1");
      const priceWei = ethers.parseUnits(finalPrice, 6);

      const { request } = await publicClient.simulateContract({
        ...marketplaceContract,
        functionName: 'createListing',
        args: [CURRENT_NFT_ADDRESS, tokenId, priceWei],
        account: walletAddress,
      });

      const listTx = await activeWalletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: listTx });
      console.log("✅ Listing created on blockchain");

      // Record in backend
      toast.loading("💾 Saving listing data...", { id: toastId });

      const listingPayload = {
        subCollectionId: collection._id,
        tokenId,
        seller: walletAddress.toLowerCase(),
        priceETH: parseFloat(finalPrice),
      };

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
        },
      );

      console.log("✅ Backend response:", response.data);

      toast.success(
        `🎉 NFA listed for sale @ ${finalPrice} USDC!`,
        {
          id: toastId,
          duration: 5000,
        },
      );

      setListingData({
        seller: walletAddress.toLowerCase(),
        price: priceWei,
        active: true,
      });

      collection.listed = true;
      await checkListingStatus();

      navigate("/List");
    } catch (err) {
      console.error("❌ Listing error:", err);
      console.error("❌ Error details:", err);

      let msg = "❌ Listing failed";
      if (err.message?.includes("insufficient funds")) {
        msg = "⛽ Insufficient gas. Add Testnet IMX";
      } else if (err.message?.includes("user rejected") || err.code === 4001) {
        msg = "❌ Transaction rejected by user";
      } else {
        msg = `❌ Error: ${err.shortMessage || err.message?.substring(0, 50) || "Unknown"}`;
      }
      console.error("Listing Error:", err);
      toast.error(msg, { id: toastId, duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  /* ============================ BUY NFT ============================ */
  const handleBuyNFT = async () => {
    if (!isAnyConnected) {
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    const toastId = toast.loading("🛒 Preparing purchase...");
    setLoading(true);

    try {
      if (!activeWalletClient || !publicClient) {
        toast.error("❌ Wallet not connected properly", { id: toastId });
        setLoading(false);
        return;
      }

      if (!user?.id) {
        toast.error("❌ Please login first", { id: toastId });
        setLoading(false);
        return;
      }

      // Ensure we're on the correct network
      const networkOk = await ensureCorrectNetwork();
      if (!networkOk) {
        setLoading(false);
        return;
      }

      const buyer = activeAddress;
      console.log("👛 Buyer wallet:", buyer);

      const balance = await publicClient.getBalance({ address: buyer });
      console.log("💰 Native ETH Balance:", ethers.formatEther(balance), "ETH");

      if (balance === 0n) {
        toast.error(
          <div>
            ❌ Your wallet has no ETH for gas fees.
            <br />
            <button
              onClick={() => window.open('https://faucet.quicknode.com/base/sepolia', '_blank')}
              className="mt-2 bg-white text-black px-2 py-1 rounded text-xs font-bold"
            >
              💰 Add Funds (Faucet)
            </button>
          </div>
          , { id: toastId, duration: 8000 });
        setLoading(false);
        return;
      }

      const usdcContractOptions = {
        address: BASE_USDC_ADDRESS,
        abi: ERC20_ABI,
      };

      const usdcBalance = await publicClient.readContract({
        ...usdcContractOptions,
        functionName: 'balanceOf',
        args: [buyer],
      });
      console.log("💰 USDC Balance:", ethers.formatUnits(usdcBalance, 6), "USDC");

      /* ==================== SCENARIO 1: NOT MINTED ==================== */
      if (!collection.tokenId) {
        toast.loading("🛒 Processing purchase...", { id: toastId });
        console.log("🆕 NFA not minted yet, processing first sale...");

        const mintPrice = collection.priceETH || 0.01;
        const priceWei = ethers.parseUnits(String(mintPrice), 6); // USDC uses 6 decimals

        if (usdcBalance < priceWei) {
          toast.error(
            `❌ Insufficient USDC\n\nNeed: ${ethers.formatUnits(priceWei, 6)} USDC\nYou have: ${ethers.formatUnits(usdcBalance, 6)} USDC`,
            { id: toastId, duration: 6000 },
          );
          setLoading(false);
          return;
        }

        // Check allowance
        toast.loading("🔒 Checking USDC allowance...", { id: toastId });
        const allowance = await publicClient.readContract({
          ...usdcContractOptions,
          functionName: 'allowance',
          args: [buyer, CURRENT_MARKETPLACE_ADDRESS],
        });

        if (allowance < priceWei) {
          toast.loading("✍️ Approving USDC for purchase...", { id: toastId });
          try {
            const { request: approveReq } = await publicClient.simulateContract({
              ...usdcContractOptions,
              functionName: 'approve',
              args: [CURRENT_MARKETPLACE_ADDRESS, priceWei],
              account: activeAddress,
            });
            const approveTxHash = await activeWalletClient.writeContract(approveReq);
            toast.loading("⏳ Waiting for USDC approval...", { id: toastId });
            await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
            console.log("✅ USDC Approved for Marketplace (First Sale)");
          } catch (approveErr) {
            console.error("❌ USDC Approval failed:", approveErr);
            let msg = "❌ USDC Approval failed";
            if (approveErr.message?.includes("user rejected") || approveErr.code === 4001) {
              msg = "❌ Transaction rejected by user";
            } else {
              msg = `❌ Error: ${approveErr.shortMessage || approveErr.message?.substring(0, 50) || "Unknown"}`;
            }
            toast.error(msg, { id: toastId, duration: 8000 });
            setLoading(false);
            return;
          }
        }

        // Determine creator to pay
        // We fallback to PLATFORM_WALLET_ADDRESS if no known creator address
        const creatorWalletRaw = collection.creator || collection.owner;
        const creatorWallet = (creatorWalletRaw && creatorWalletRaw.toLowerCase() !== "admin" && ethers.isAddress(creatorWalletRaw))
          ? creatorWalletRaw.toLowerCase()
          : PLATFORM_WALLET_ADDRESS.toLowerCase();

        // Call depositFirstSalePayment on Marketplace contract
        toast.loading("💸 Depositing payment to smart contract...", { id: toastId });
        try {
          const marketplaceContract = {
            address: CURRENT_MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
          };

          const { request: depositReq } = await publicClient.simulateContract({
            ...marketplaceContract,
            functionName: 'depositFirstSalePayment',
            args: [creatorWallet, priceWei],
            account: activeAddress,
          });
          const depositTxHash = await activeWalletClient.writeContract(depositReq);

          toast.loading("⏳ Finalizing payment...", { id: toastId });
          await publicClient.waitForTransactionReceipt({ hash: depositTxHash });
          console.log("✅ First sale payment deposited to creator:", creatorWallet);
        } catch (depositErr) {
          console.error("❌ Payment failed:", depositErr);
          let msg = "❌ Payment failed during deposit";
          if (depositErr.message?.includes("user rejected") || depositErr.code === 4001) {
            msg = "❌ Transaction rejected by user";
          } else if (depositErr.message?.includes("0xfb8f41b2") || depositErr.message?.includes("ERC20InsufficientAllowance")) {
            msg = "❌ Allowance pending. Please wait a few seconds and try again.";
          } else {
            msg = `❌ Error: ${depositErr.shortMessage || depositErr.message?.substring(0, 50) || "Unknown"}`;
          }
          toast.error(msg, { id: toastId, duration: 8000 });
          setLoading(false);
          return;
        }

        toast.loading("🚀 Processing NFA to your wallet...", { id: toastId });
        let mintedTokenId;
        try {
          mintedTokenId = await mintNFTToWallet(buyer);
        } catch (mintErr) {
          console.error("❌ Minting error:", mintErr);
          const errMsg = mintErr.message || "";
          if (errMsg.toLowerCase().includes("insufficient eth") || errMsg.toLowerCase().includes("fund")) {
            toast.error("❌ Minting Failed: Insufficient funds in backend wallet. Please contact support.", { id: toastId, duration: 8000 });
          } else {
            toast.error(`❌ Payment succeeded but minting failed: ${errMsg}. Please contact support.`, { id: toastId, duration: 8000 });
          }
          setLoading(false);
          return;
        }

        collection.tokenId = mintedTokenId;
        collection.owner = buyer.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(buyer.toLowerCase());
        console.log("✅ NFA prepared, Token ID:", mintedTokenId);

        toast.success(
          `🎉 NFA Purchased Successfully!\n\n🎫 Token ID: ${mintedTokenId}\n💰 Price: ${mintPrice} USDC\n\n⛓️ Blockchain confirmation in progress...`,
          { id: toastId, duration: 8000 },
        );

        setLoading(false);

        const targetCategory = (collection.category || collection.parentCategory || item?.category || item?.parentCategory || "characters").toLowerCase().trim();

        navigate("/Profile", { state: { category: targetCategory } });


        return; // Scenario 1 completed
      }
      /* ================= SCENARIO 2: ALREADY MINTED ================= */
      toast.loading("🔍 Checking NFT ownership...", { id: toastId });

      const nftContract = {
        address: CURRENT_NFT_ADDRESS,
        abi: NFT_ABI,
      };

      let currentOwner;
      try {
        currentOwner = await publicClient.readContract({
          ...nftContract,
          functionName: 'ownerOf',
          args: [collection.tokenId],
        });
        currentOwner = currentOwner.toLowerCase();
        console.log("⛓️ Current NFT owner:", currentOwner);
      } catch (err) {
        console.error("❌ Error checking owner:", err);
        toast.error("❌ NFT not found on blockchain", { id: toastId });
        setLoading(false);
        return;
      }

      if (buyer.toLowerCase() === currentOwner) {
        toast.error("❌ You already own this NFA!", { id: toastId });
        setLoading(false);
        return;
      }

      toast.loading("📋 Verifying listing...", { id: toastId });

      const marketplaceContract = {
        address: CURRENT_MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
      };

      const listing = await publicClient.readContract({
        ...marketplaceContract,
        functionName: 'getListing',
        args: [CURRENT_NFT_ADDRESS, collection.tokenId],
      });

      if (!listing[2]) {
        toast.error("❌ This NFA is not listed for sale", { id: toastId });
        setLoading(false);
        return;
      }

      const price = listing[1];
      console.log("💰 Listing price:", ethers.formatEther(price), "USDC/ETH Equivalent");

      if (usdcBalance < price) {
        toast.error(
          `❌ Insufficient USDC\n\nNeed: ${ethers.formatUnits(price, 6)} USDC\nYou have: ${ethers.formatUnits(usdcBalance, 6)} USDC`,
          { id: toastId, duration: 6000 },
        );
        setLoading(false);
        return;
      }

      toast.loading("🔒 Checking USDC allowance...", { id: toastId });

      const allowance = await publicClient.readContract({
        ...usdcContractOptions,
        functionName: 'allowance',
        args: [buyer, CURRENT_MARKETPLACE_ADDRESS],
      });

      if (allowance < price) {
        toast.loading("✍️ Approving USDC for purchase...", { id: toastId });
        try {
          const { request: approveReq } = await publicClient.simulateContract({
            ...usdcContractOptions,
            functionName: 'approve',
            args: [CURRENT_MARKETPLACE_ADDRESS, price],
            account: activeAddress,
          });
          const approveTxHash = await activeWalletClient.writeContract(approveReq);
          toast.loading("⏳ Waiting for USDC approval...", { id: toastId });
          await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
          console.log("✅ USDC Approved!");
        } catch (approveErr) {
          console.error("❌ Approval failed:", approveErr);
          toast.error("❌ USDC Approval failed", { id: toastId });
          setLoading(false);
          return;
        }
      }

      toast.loading("💳 Processing purchase transaction...", { id: toastId });
      console.log("🛒 Executing buyNFT...");

      const { request } = await publicClient.simulateContract({
        ...marketplaceContract,
        functionName: 'buyNFT',
        args: [CURRENT_NFT_ADDRESS, collection.tokenId],
        account: activeAddress, // value removed, using USDC now
      });

      const buyTx = await activeWalletClient.writeContract(request);

      toast.loading("⏳ Waiting for transaction confirmation...", {
        id: toastId,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: buyTx });
      console.log("✅ Transaction confirmed:", receipt.transactionHash);

      toast.loading("💾 Recording purchase...", { id: toastId });

      try {
        const salePayload = {
          tokenId: collection.tokenId,
          buyer: buyer.toLowerCase(),
          seller: listing[0].toLowerCase(),
          priceETH: ethers.formatUnits(price, 6),
          txHash: receipt.transactionHash,
        };

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
          },
        );
        console.log("✅ Sale recorded in backend");
      } catch (recordErr) {
        console.error("⚠️ Error recording sale:", recordErr);
        console.error("⚠️ Error response:", recordErr.response?.data);
      }

      toast.success(
        `🎉 NFA Purchased Successfully!\n\n🎫 Token ID: ${collection.tokenId}\n💰 Price: ${ethers.formatUnits(price, 6)} USDC\n📜 TX: ${receipt.transactionHash.substring(0, 10)}...`,
        { id: toastId, duration: 8000 },
      );

      collection.owner = buyer.toLowerCase();
      setIsOwner(true);
      setOnChainOwner(buyer.toLowerCase());
      setListingData(null);
      console.log("✅ Purchase complete!");

      const targetCategory = (collection.category || collection.parentCategory || item?.category || item?.parentCategory || "characters").toLowerCase().trim();
      navigate("/Profile", { state: { category: targetCategory } });
    } catch (err) {
      console.error("❌ Purchase error:", err);
      let msg = "❌ Purchase failed";

      if (err.message?.includes("insufficient funds")) {
        msg = "⛽ Insufficient ETH for gas fees";
      } else if (err.message?.includes("user rejected") || err.code === 4001) {
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
      if (!isAnyConnected || !activeAddress) {
        toast.error("❌ Please connect your wallet first to receive the NFT", { id: toastId });
        setLoading(false);
        return;
      }

      console.log("💳 Starting card purchase check for product:", productId);
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/game/create`, {
        userId: user.id || user._id,
        productId,
        priceETH: collection.priceETH || 0.01, // Use collection's price as fallback
        itemType: itemType || "nft",
        tokenId: tokenId || collection.tokenId, // Use tokenId from state or collection
      });

      if (res.data?.exist === "no") {
        toast.success("✅ Payment initiated", { id: toastId });
        navigate("/offer", {
          state: {
            item: collection,
            parentId: parentCollection?._id || parentId || item?.parentId || collection.parentId,
            subCollectionId: collection._id,
            buyerWallet: activeAddress,
            priceETH: collection.priceETH || 0.01,
            itemType: "nft",
            tokenId: collection.tokenId || item?.tokenId
          }
        });
      } else {
        toast.error("❌ Already purchased", { id: toastId });
      }
    } catch (err) {
      console.error("❌ Card payment error:", err);
      toast.error("❌ Payment check failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* ======================== BUTTON LOGIC ======================== */
  const isPlatformOwned =
    !collection.owner ||
    collection.owner === "admin" ||
    (onChainOwner &&
      onChainOwner === PLATFORM_WALLET_ADDRESS.toLowerCase()) ||
    (collection.owner &&
      collection.owner.toLowerCase() ===
      PLATFORM_WALLET_ADDRESS.toLowerCase());

  const getButtonAction = () => {
    if (loading) return { text: "⏳ Processing...", disabled: true };

    if (!isAnyConnected) {
      return {
        text: "🔌 Connect Wallet",
        action: () => setShowWalletModal(true),
      };
    }

    if (!isOwner && (listingData?.active || isPlatformOwned)) {
      return {
        text: "🛒 Buy Now",
        action: handleBuyNFT,
      };
    }

    if (isOwner && !listingData?.active) {
      return {
        text: "📝 List Now",
        action: handleCreateListing,
      };
    }

    if (isOwner && listingData?.active) {
      return {
        text: "✅ Your NFA (Listed)",
        disabled: true,
      };
    }

    return { text: "❌ Not Available", disabled: true };
  };

  const buttonConfig = getButtonAction();

  /* ================================== UI ================================== */
  if (!collection) return null;

  return (
    <div className="flex flex-col w-full mt-14 md:px-24 text-white">
      {/* Tabs */}
      <div className="flex flex-col w-full mt-14 md:px-24 text-white">
        <div
          className="flex justify-between items-center text-white"
          style={{
            width: "200px",
            height: "28px",
            position: "absolute",
            top: "100px",
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
          className="w-full md:w-[365px] h-[330px] rounded-lg object-cover bg-gradient-to-b from-[#977C34] to-[#493F26] "
        />
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{collection?.name}</h1>
            <p>{collection?.symbol || "NFA"} 🔥</p>
          </div>

          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            {connectedWallet && (
              <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                Connected: {connectedWallet.substring(0, 6)}...
                {connectedWallet.substring(38)}
              </span>
            )}



            {listingData?.active && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                Listed
              </span>
            )}
            {isOwner && collection.tokenId && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                You Own This
              </span>
            )}
          </div>

          <div className="p-6 rounded-lg">
            <div className="flex justify-between items-center opacity-70 w-full mb-2">
              <span>Price</span>
              <span
                className="truncate max-w-[150px]"
                title={onChainOwner || collection.owner}
              >
                Owner:{" "}
                {onChainOwner || collection.owner
                  ? `${(onChainOwner || collection.owner).substring(0, 6)}...${(
                    onChainOwner || collection.owner
                  ).substring(38)}`
                  : "Platform"}
              </span>
            </div>

            {/* Price — double-click to edit when owner */}
            {isOwner && !listingData?.active ? (
              isEditingPrice ? (
                // Editing mode — small inline input
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    autoFocus
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    placeholder={String(collection.priceETH || '1')}
                    onBlur={() => setIsEditingPrice(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingPrice(false)}
                    className="bg-white/10 border border-blue-500 rounded-lg px-3 py-1 text-white text-xl font-bold w-36 outline-none"
                  />
                  <span className="text-blue-400 font-bold text-sm">USDC</span>
                  <button
                    onClick={() => setIsEditingPrice(false)}
                    className="text-green-400 text-xs hover:text-green-300"
                  >✓ Done</button>
                </div>
              ) : (
                // Display mode — price + pencil icon
                <div
                  className="flex items-center gap-2 mt-1 cursor-pointer group w-fit"
                  onDoubleClick={() => setIsEditingPrice(true)}
                  title="Double-click to edit price"
                >
                  <h2 className="text-xl font-bold">
                    {listingPrice && parseFloat(listingPrice) > 0
                      ? `${parseFloat(listingPrice).toFixed(2)} USDC`
                      : `${collection.priceETH || 0.01} USDC`}
                  </h2>
                  <span className="text-white/30 group-hover:text-blue-400 transition-colors text-sm" title="Double-click to edit">✏️</span>
                </div>
              )
            ) : (
              <h2 className="text-xl font-bold mt-1">
                {listingData?.active
                  ? `${ethers.formatUnits(listingData.price, 6)} USDC`
                  : `${collection.priceETH || 0.01} USDC`}
              </h2>
            )}

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
                onClick={() => handlePaymentCard(collection._id)}
                disabled={loading}
              >
                <CustomButton text="Buy With Card" />
              </button>
            </div>

            <Link
              to="/payment"
              state={{ item: collection }}
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
                <span>{collection.priceETH || 0.01} USDC</span>
              </div>
              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Platform Fee (10%)</span>
                <span>
                  {((collection.priceETH || 0.01) * 0.1).toFixed(4)} USDC
                </span>
              </div>
              <div className="flex justify-between bg-white/10 px-4 py-2 rounded font-bold">
                <span>Total</span>
                <span>
                  {((collection.priceETH || 0.01) * 1.1).toFixed(4)} USDC
                </span>
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
              {isOwner ? (
                // ✅ Owner: Editable Price Input
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-xs px-1">Set Your Listing Price (USDC)</label>
                  <div className="flex items-center rounded px-4 h-10 bg-white/10 border border-white/20 focus-within:border-blue-400 transition-colors">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder={String(collection.priceETH || '1')}
                      className="bg-transparent text-white text-sm w-full outline-none"
                    />
                    <span className="text-blue-400 text-xs font-bold ml-2">USDC</span>
                  </div>
                  {listingPrice && parseFloat(listingPrice) > 0 && (
                    <p className="text-xs text-green-400 px-1">
                      ✓ Will list at {parseFloat(listingPrice).toFixed(2)} USDC
                    </p>
                  )}
                </div>
              ) : (
                // Buyer: Static price display
                <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-white text-sm">{collection.priceETH || 0.01} USDC</p>
                </div>
              )}
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
                <h1 className="text-center text-white font-bold text-3xl">
                  No offers right now
                </h1>

                <div className="flex text-center mt-4">
                  <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
                  <h1 className="text-[#8C9ED8] font-bold text-[160px] mx-2">
                    0
                  </h1>
                  <h1 className="text-[#8C9ED8] font-bold text-[160px]">4</h1>
                </div>

                <div className="absolute top-[11rem] left-1/2 -translate-x-1/2 pointer-events-none z-10">
                  <img src={FaceOne} alt="Face One" className="w-28 h-24" />
                </div>

                <div className="absolute top-[15rem] left-1/2 -translate-x-1/2 pointer-events-none z-10">
                  <img
                    src={FaceTwo}
                    alt="Face Two"
                    className="w-16 h-10 pb-3"
                  />
                </div>
              </div>
            )}

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
      {/* WALLET SELECTION MODAL */}
      {showWalletModal && ReactDOM.createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-black/80 flex items-center justify-center backdrop-blur-sm px-4"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-[#1f2937] p-8 rounded-2xl w-full max-w-sm mx-4 border border-white/10 shadow-2xl transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  if (openConnectModal) openConnectModal();
                }}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-blue-500/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                    🌐
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">Browser Wallet</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300">
                      MetaMask, Rainbow, etc.
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 group-hover:text-blue-400">→</div>
              </button>

              <div className="text-center mt-2">
                <a href="https://faucet.quicknode.com/base/sepolia" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                  Need Testnet ETH? 💰 Get it here
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


export default Buy1;


