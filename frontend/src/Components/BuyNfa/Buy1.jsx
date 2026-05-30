import React, { useEffect, useState, useMemo, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../../Config";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { useAccount, useWalletClient, usePublicClient, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEmailWallet } from "../../hooks/useEmailWallet";

import FaceOne from "../../assets/images/noActivity1.png";
import overview1 from "../../assets/images/Overview/overview1.jpg";
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
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import { openTransakOnRamp } from "../../utils/transakUtils";
import { FiEye, FiEdit2, FiCopy } from "react-icons/fi";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import { Wallet, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import PriceHistory from "./BuyNfa2";

// ── Stripe NFT Payment Modal ─────────────────────────────────────────────────
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

function StripeNFTCheckoutForm({ amount, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message); setLoading(false); return; }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (confirmErr) {
      setError(confirmErr.message);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">💳 {t("buyNfa.stripe.title", "Pay with Card")}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl">×</button>
        </div>
        <p className="text-sm text-white/50 mb-4">{t("buyNfa.stripe.amount", "Amount:")} <span className="text-white font-semibold">${amount} USD</span></p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PaymentElement />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/20 text-white/70 hover:text-white text-sm transition-colors">
              {t("buyNfa.stripe.cancel", "Cancel")}
            </button>
            <button type="submit" disabled={!stripe || loading}
              className="flex-1 py-2.5 rounded-lg bg-[#002AA8] hover:bg-[#0038d4] disabled:opacity-50 text-white font-semibold text-sm transition-colors">
              {loading ? t("buyNfa.stripe.processing", "Processing...") : `${t("buyNfa.stripe.pay", "Pay")} $${amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    tokenId,
    marketplaceScrollY,
  } = location.state || {};

  // Determine which is parent and which is sub-collection
  let parentCollection, subCollection;

  if (passedSubCollection) {
    // Explicit sub-collection passed alongside parent item
    parentCollection = item;
    subCollection = passedSubCollection;
  } else if (item?.isParentCollection) {
    // Item is a parent — use its first sub-collection
    parentCollection = item;
    subCollection = item.subCollections?.[0];
  } else if (item?.isSubCollection || item?.parentId) {
    // Item is a sub-collection (from Collectible.jsx / Profile flow)
    subCollection = item;
    // parentCollection stays undefined — we use parentId from location.state or item.parentId
  } else {
    subCollection = item;
  }

  // Resolve the effective parentId from all possible sources
  const resolvedParentId = parentCollection?._id || parentId || item?.parentId;

  const collection = subCollection || item;
  if (!collection) return null;
  const assetType = collection.assetType || (collection.isNFA ? "NFA" : "NFT");
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

  // For card payments: always prefer email wallet so NFT lands in profile-visible address
  // If user only has MetaMask (no email wallet), fall back to activeAddress
  const cardBuyerWallet = emailWalletAddress || activeAddress;

  const [activeTab, setActiveTab] = useState("marketplace");
  const [isOwner, setIsOwner] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onChainOwner, setOnChainOwner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false); // post-purchase modal
  const [transferFailed, setTransferFailed] = useState(null);  // { paymentIntentId, error }
  const [listingPrice, setListingPrice] = useState(''); // Custom listing price set in confirm modal
  const [walletCopied, setWalletCopied] = useState(false);
  const [fundModal, setFundModal] = useState(null); // { needed, have, priceUsdc }
  const [stripeModal, setStripeModal] = useState(null); // { clientSecret, amount }
  const [gasModal, setGasModal] = useState(false); // true when no ETH for gas

  // ── Auction tab data ──
  const [auctionInfo, setAuctionInfo] = useState(null);
  const [auctionInfoLoading, setAuctionInfoLoading] = useState(false);
  const [auctionFetched, setAuctionFetched] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  // ── Trade tab data ──
  const [tradeListings, setTradeListings] = useState([]);
  const [tradeListingsLoading, setTradeListingsLoading] = useState(false);
  const [tradeFetched, setTradeFetched] = useState(false);

  // Fetch Native ETH Balance for Embedded Wallet display
  const { balance: ethBalance } = useTokenBalance("0x0000000000000000000000000000000000000000");
  const { t } = useTranslation();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  };

  /* ================================ INIT ================================ */
  useEffect(() => {
    console.log("📦 Location State:", location.state);
    console.log("📦 Parent Collection:", parentCollection);
    console.log("📦 Sub-Collection:", subCollection);
    console.log("📦 Collection (display):", collection);

    if (!collection) {
      toast.error(" No NFT data found");
      navigate("/buy-nfa");
      return;
    }
  }, [collection, navigate]);

  // Fetch Fresh Data on Mount
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

  /* ======================== FETCH OFFERS ======================== */
  useEffect(() => {
    if (!collection?._id || !user) return;
    const fetchOffers = async () => {
      try {
        const ownerId = collection.owner || "platform";
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/offer/owner/${encodeURIComponent(ownerId)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const all = res.data?.offers || res.data || [];
        // Filter to only offers for this specific NFT
        const forThisNft = all.filter((o) => String(o.gameId) === String(collection._id));
        // Non-owners only see their own offers (privacy)
        const filtered = isOwner
          ? forThisNft
          : forThisNft.filter((o) => String(o.userId) === String(user?.id || user?._id));
        setOffers(filtered);
      } catch {
        // silently fail — offers are non-critical
      }
    };
    fetchOffers();
  }, [collection?._id, isOwner, showOffers]);

  /* ====================== UPDATE OFFER STATUS ====================== */
  const handleOfferStatus = async (offerId, status) => {
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/offer/${offerId}/request-status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state instantly — no re-fetch needed
      setOffers((prev) =>
        prev.map((o) => o._id === offerId ? { ...o, requestStatus: status } : o)
      );
      toast.success(`Offer ${status}`);
    } catch {
      toast.error("Failed to update offer status");
    }
  };

  /* ===================== WALLET + OWNERSHIP CHECK ===================== */
  const checkWalletAndOwnership = async () => {
    try {
      if (!publicClient || !collection) return;

      const wallet = activeAddress ? activeAddress.toLowerCase() : null;
      if (wallet) {
        console.log("Connected wallet:", wallet);
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
          console.error(" Error checking on-chain owner:", err);

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
      console.error(" Error checking wallet:", err);
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
      console.error(" Error checking listing:", err);
    }
  };

  /* ================== FETCH AUCTION FOR THIS ITEM ================== */
  // Uses seller/:wallet endpoint then filters client-side by subCollectionId,
  // because the GET /auction list endpoint has no subCollectionId query param.
  const fetchAuctionInfo = async () => {
    if (auctionFetched) return;
    setAuctionInfoLoading(true);
    try {
      const sellerWallet = collection.owner || onChainOwner;
      if (!sellerWallet || sellerWallet === "admin") {
        setAuctionInfo(null);
        return;
      }
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/auction/seller/${encodeURIComponent(sellerWallet)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const list = Array.isArray(res.data) ? res.data : (res.data?.auctions || []);
      const match = list.find(
        (a) => String(a.subCollectionId) === String(collection._id) && a.status === "active"
      );
      setAuctionInfo(match || null);
    } catch { setAuctionInfo(null); }
    finally { setAuctionInfoLoading(false); setAuctionFetched(true); }
  };

  /* ================== FETCH TRADE LISTINGS FOR THIS ITEM ================== */
  // Uses posterWallet filter then filters client-side by offering name,
  // because the GET /trade endpoint has no offering query filter.
  const fetchTradeListings = async () => {
    if (tradeFetched) return;
    setTradeListingsLoading(true);
    try {
      const posterWallet = collection.owner || onChainOwner;
      if (!posterWallet || posterWallet === "admin") {
        setTradeListings([]);
        return;
      }
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/trade`, {
        params: { posterWallet, status: "open", type: "trade", limit: 50 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const list = res.data?.trades || [];
      const matches = list.filter(
        (t) => t.offering === collection.name && t.status === "open"
      );
      setTradeListings(matches);
    } catch { setTradeListings([]); }
    finally { setTradeListingsLoading(false); setTradeFetched(true); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "auction") fetchAuctionInfo();
    if (tab === "trade") fetchTradeListings();
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
        toast.success(`Switched to ${targetChainName}`, { id: toastId });
        return true;
      } else {
        toast.error(" Network switch not supported by wallet", { id: toastId });
        return false;
      }
    } catch (error) {
      console.error(" Failed to switch network:", error);
      toast.error(` Please switch to ${targetChainName} manually`, { id: toastId });
      return false;
    }
  };

  /* ========================== BACKEND MINT ========================== */
  const mintNFTToWallet = async (buyerWallet) => {
    if (!user?.id || !collection._id) {
      throw new Error("Invalid user or item data");
    }
    if (!resolvedParentId) {
      throw new Error("Missing parent collection ID. Go back to your Profile and try again.");
    }

    try {
      const payload = {
        parentId: resolvedParentId,
        subCollectionId: collection._id,
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
        console.log("Mint successful, Token ID:", res.data.tokenId);
        return res.data.tokenId;
      } else {
        console.error(" Mint response invalid:", res.data);
        throw new Error(res.data?.error || res.data?.message || "Mint response invalid");
      }
    } catch (err) {
      console.error(" Mint error:", err.response?.data || err);
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

    const toastId = toast.loading(`🔧 Preparing to list ${assetType}...`);
    setLoading(true);

    try {
      if (!activeWalletClient) {
        toast.dismiss(toastId);
        setLoading(false);
        toast.error("Connect MetaMask or another wallet to sign this transaction. Email wallets cannot sign on-chain.", { duration: 6000 });
        if (openConnectModal) openConnectModal();
        return;
      }
      if (!publicClient) {
        toast.error(" Network client not ready", { id: toastId });
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
          console.error(" Minting error:", mintErr);
          const errMsg = mintErr.message || "";
          if (errMsg.toLowerCase().includes("insufficient eth") || errMsg.toLowerCase().includes("fund")) {
            toast.error(" Minting Failed: Insufficient funds in backend wallet. Please contact support.", { id: toastId, duration: 8000 });
          } else {
            toast.error(` Minting Failed: ${errMsg}`, { id: toastId, duration: 8000 });
          }
          setLoading(false);
          return;
        }

        collection.tokenId = tokenId;
        collection.owner = walletAddress.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(walletAddress.toLowerCase());

        toast.success("NFT Minted! Indexing...", { id: toastId });

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
            console.log("Ownership verified");
            break;
          } else if (retries > 1) {
            console.log(`⏳ Owner mismatch/pending (${retries - 1} retries left)...`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            retries--;
            continue;
          } else {
            // ... existing failure logic
            toast.error(" Ownership mismatch after retries", { id: toastId });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error(" Error getting owner:", err);
          if (retries > 1) {
            console.log(
              `⏳ Retrying blockchain check... (${retries - 1} left)`,
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries--;
          } else {
            toast.error(" NFT not found on blockchain. Please try again.", {
              id: toastId,
            });
            setLoading(false);
            return;
          }
        }
      }

      // Check ETH balance for gas before any on-chain writes
      const ethBal = await publicClient.getBalance({ address: walletAddress });
      if (ethBal === 0n) {
        toast.dismiss(toastId);
        setGasModal(true);
        setLoading(false);
        return;
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
          const approveTx = await activeWalletClient.writeContract({
            ...nftContract,
            functionName: 'setApprovalForAll',
            args: [CURRENT_MARKETPLACE_ADDRESS, true],
            account: activeWalletClient.account || walletAddress,
          });
          toast.loading("⏳ Waiting for approval confirmation...", { id: toastId });
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
          console.log("Marketplace approved for all");
        } catch (approveError) {
          console.error(" Approval failed:", approveError);
          // Special handling for user rejection
          if (approveError.message.includes("User rejected")) {
            toast.error(" Approval rejected by user", { id: toastId });
          } else {
            toast.error(" Approval transaction failed", { id: toastId });
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
        toast.success("Already listed!", { id: toastId });
        setListingData({ seller: listing[0], price: listing[1], active: true });
        setLoading(false);
        return;
      }

      // Use custom listing price if owner set one, otherwise fallback to collection price
      const finalPrice = listingPrice && parseFloat(listingPrice) > 0
        ? listingPrice
        : String(collection.priceETH || "1");
      const priceWei = ethers.parseUnits(finalPrice, 6);

      const listTx = await activeWalletClient.writeContract({
        ...marketplaceContract,
        functionName: 'createListing',
        args: [CURRENT_NFT_ADDRESS, tokenId, priceWei],
        account: activeWalletClient.account || walletAddress,
      });
      await publicClient.waitForTransactionReceipt({ hash: listTx });
      console.log("Listing created on blockchain");

      // Record in backend
      toast.loading("💾 Saving listing data...", { id: toastId });

      const listingPayload = {
        subCollectionId: collection._id,
        tokenId,
        seller: walletAddress.toLowerCase(),
        priceETH: parseFloat(finalPrice),
        parentId: resolvedParentId,
      };

      console.log("📤 Sending listing payload:", listingPayload);

      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/create`,
        listingPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Backend response:", response.data);

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
      console.error(" Listing error:", err);
      console.error(" Error details:", err);

      let msg = " Listing failed";
      if (err.message?.includes("insufficient funds")) {
        msg = "⛽ Insufficient ETH for gas. Add ETH to your wallet on Base.";
      } else if (err.message?.includes("user rejected") || err.code === 4001) {
        msg = " Transaction rejected by user";
      } else {
        msg = ` Error: ${err.shortMessage || err.message?.substring(0, 50) || "Unknown"}`;
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
        toast.error("Wallet not connected properly", { id: toastId });
        setLoading(false);
        return;
      }

      if (!user?.id) {
        toast.error("Please login first", { id: toastId });
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
        toast.error(' Your wallet has no ETH for gas fees.', { id: toastId, duration: 8000 });
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
          toast.dismiss(toastId);
          setFundModal({
            needed: ethers.formatUnits(priceWei, 6),
            have: ethers.formatUnits(usdcBalance, 6),
            priceUsdc: ethers.formatUnits(priceWei, 6),
          });
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
            const approveTxHash = await activeWalletClient.writeContract({
              ...usdcContractOptions,
              functionName: 'approve',
              args: [CURRENT_MARKETPLACE_ADDRESS, priceWei],
              account: activeWalletClient.account || activeAddress,
            });
            toast.loading("⏳ Waiting for USDC approval...", { id: toastId });
            await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
            console.log("USDC Approved for Marketplace (First Sale)");
          } catch (approveErr) {
            console.error(" USDC Approval failed:", approveErr);
            let msg = " USDC Approval failed";
            if (approveErr.message?.includes("user rejected") || approveErr.code === 4001) {
              msg = " Transaction rejected by user";
            } else {
              msg = ` Error: ${approveErr.shortMessage || approveErr.message?.substring(0, 50) || "Unknown"}`;
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

          const depositTxHash = await activeWalletClient.writeContract({
            ...marketplaceContract,
            functionName: 'depositFirstSalePayment',
            args: [creatorWallet, priceWei],
            account: activeWalletClient.account || activeAddress,
          });

          toast.loading("⏳ Finalizing payment...", { id: toastId });
          await publicClient.waitForTransactionReceipt({ hash: depositTxHash });
          console.log("First sale payment deposited to creator:", creatorWallet);
        } catch (depositErr) {
          console.error(" Payment failed:", depositErr);
          let msg = " Payment failed during deposit";
          if (depositErr.message?.includes("user rejected") || depositErr.code === 4001) {
            msg = " Transaction rejected by user";
          } else if (depositErr.message?.includes("0xfb8f41b2") || depositErr.message?.includes("ERC20InsufficientAllowance")) {
            msg = " Allowance pending. Please wait a few seconds and try again.";
          } else {
            msg = ` Error: ${depositErr.shortMessage || depositErr.message?.substring(0, 50) || "Unknown"}`;
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
          console.error(" Minting error:", mintErr);
          const errMsg = mintErr.message || "";
          if (errMsg.toLowerCase().includes("insufficient eth") || errMsg.toLowerCase().includes("fund")) {
            toast.error(" Minting Failed: Insufficient funds in backend wallet. Please contact support.", { id: toastId, duration: 8000 });
          } else {
            toast.error(` Payment succeeded but minting failed: ${errMsg}. Please contact support.`, { id: toastId, duration: 8000 });
          }
          setLoading(false);
          return;
        }

        collection.tokenId = mintedTokenId;
        collection.owner = buyer.toLowerCase();
        setIsOwner(true);
        setOnChainOwner(buyer.toLowerCase());
        console.log("NFA prepared, Token ID:", mintedTokenId);

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
        console.error(" Error checking owner:", err);
        toast.error(" NFT not found on blockchain", { id: toastId });
        setLoading(false);
        return;
      }

      if (buyer.toLowerCase() === currentOwner) {
        toast.error(" You already own this NFA!", { id: toastId });
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
        toast.error(" This NFA is not listed for sale", { id: toastId });
        setLoading(false);
        return;
      }

      const price = listing[1];
      console.log("💰 Listing price:", ethers.formatEther(price), "USDC/ETH Equivalent");

      if (usdcBalance < price) {
        toast.dismiss(toastId);
        setFundModal({
          needed: ethers.formatUnits(price, 6),
          have: ethers.formatUnits(usdcBalance, 6),
          priceUsdc: ethers.formatUnits(price, 6),
        });
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
          const approveTxHash = await activeWalletClient.writeContract({
            ...usdcContractOptions,
            functionName: 'approve',
            args: [CURRENT_MARKETPLACE_ADDRESS, price],
            account: activeWalletClient.account || activeAddress,
          });
          toast.loading("⏳ Waiting for USDC approval...", { id: toastId });
          await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
          console.log("USDC Approved!");
        } catch (approveErr) {
          console.error(" Approval failed:", approveErr);
          toast.error(" USDC Approval failed", { id: toastId });
          setLoading(false);
          return;
        }
      }

      toast.loading("💳 Processing purchase transaction...", { id: toastId });
      console.log("🛒 Executing buyNFT...");

      const buyTx = await activeWalletClient.writeContract({
        ...marketplaceContract,
        functionName: 'buyNFT',
        args: [CURRENT_NFT_ADDRESS, collection.tokenId],
        account: activeWalletClient.account || activeAddress, // value removed, using USDC now
      });

      toast.loading("⏳ Waiting for transaction confirmation...", {
        id: toastId,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: buyTx });
      console.log("Transaction confirmed:", receipt.transactionHash);

      toast.loading("💾 Recording purchase...", { id: toastId });

      try {
        // Find accepted offer from this buyer (if purchase is completing an offer)
        const myAcceptedOffer = offers.find(
          (o) => String(o.userId) === String(user?.id || user?._id) && o.requestStatus === "accepted"
        );

        const salePayload = {
          tokenId: collection.tokenId,
          buyer: buyer.toLowerCase(),
          seller: listing[0].toLowerCase(),
          priceETH: ethers.formatUnits(price, 6),
          txHash: receipt.transactionHash,
          parentId: resolvedParentId,
          subCollectionId: collection._id,
          ...(myAcceptedOffer ? { offerId: myAcceptedOffer._id } : {}),
        };

        console.log("📤 Recording sale with payload:", salePayload);

        await axios.post(
          `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/sale/record`,
          salePayload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log("Sale recorded in backend");
      } catch (recordErr) {
        console.error("⚠️ Error recording sale:", recordErr);
        console.error("⚠️ Error response:", recordErr.response?.data);
      }

      toast.dismiss(toastId);
      collection.owner = buyer.toLowerCase();
      setIsOwner(true);
      setOnChainOwner(buyer.toLowerCase());
      setListingData(null);
      setPurchaseSuccess(true);
    } catch (err) {
      console.error(" Purchase error:", err);
      let msg = " Purchase failed";

      if (err.message?.includes("insufficient funds")) {
        msg = "⛽ Insufficient ETH for gas fees";
      } else if (err.message?.includes("user rejected") || err.code === 4001) {
        msg = " Transaction rejected by user";
      } else if (err.response?.data?.error) {
        msg = ` ${err.response.data.error}`;
      } else {
        msg = ` ${err.shortMessage || err.message?.substring(0, 100) || "Unknown Error"}`;
      }

      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* ======================== CARD PAYMENT ======================== */
  const handlePaymentCard = async () => {
    if (!user?.id) { toast.error(" Please login first"); return; }
    if (!stripePromise) { toast.error(" Card payments not configured"); return; }
    if (!isAnyConnected || !activeAddress) {
      toast.error(" Connect wallet first to receive the NFT");
      return;
    }

    const priceUsdc = parseFloat(collection.priceETH || 0.01);
    const amountCents = Math.max(50, Math.round(priceUsdc * 100)); // Stripe minimum = $0.50 = 50 cents
    const toastId = toast.loading("💳 Preparing card payment...");

    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/payment/create-payment-intent`, {
        amount: amountCents,
        userId: user.id || user._id,
        email: user.Email || user.email || "",
        parentId: resolvedParentId || "",
        subCollectionId: collection._id,
        buyerWallet: cardBuyerWallet,
        priceETH: priceUsdc,
        gameTitle: collection.name || "NFT Purchase",
      });

      toast.dismiss(toastId);
      if (res.data?.clientSecret) {
        setStripeModal({
          clientSecret: res.data.clientSecret,
          amount: priceUsdc,
          meta: {
            parentId: resolvedParentId || null,
            subCollectionId: collection._id,
            buyerWallet: cardBuyerWallet,
            priceETH: priceUsdc,
          },
        });
      } else {
        toast.error(" Could not initiate card payment");
      }
    } catch (err) {
      toast.error(" Card payment setup failed", { id: toastId });
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
    if (loading) return { text: `⏳ ${t("buyNfa.marketplace.processing", "Processing...")}`, disabled: true };

    if (!isAnyConnected) {
      return {
        text: `🔌 ${t("buyNfa.marketplace.connectWallet", "Connect Wallet")}`,
        action: () => setShowWalletModal(true),
      };
    }

    if (!isOwner && (listingData?.active || isPlatformOwned)) {
      return {
        text: `🛒 ${t("buyNfa.marketplace.buyNow", "Buy Now")}`,
        action: handleBuyNFT,
      };
    }

    if (isOwner && !listingData?.active && !collection.listed) {
      return {
        text: `📝 ${t("buyNfa.marketplace.listNow", "List Now")}`,
        action: handleCreateListing,
      };
    }

    if (isOwner && (listingData?.active || collection.listed)) {
      return {
        text: `${t("buyNfa.marketplace.yourListed", "Your {{type}} (Listed)", { type: assetType })}`,
        disabled: true,
      };
    }

    return { text: ` ${t("buyNfa.marketplace.notAvailable", "Not Available")}`, disabled: true };
  };

  const buttonConfig = getButtonAction();

  /* ========================== PLACE BID ========================== */
  const handlePlaceBid = async () => {
    if (!isAnyConnected || !activeAddress) return toast.error("Connect your wallet first");
    if (!user?.id) return toast.error("Login required to bid");
    if (!bidAmount || parseFloat(bidAmount) <= 0) return toast.error("Enter a valid bid amount");
    if (!auctionInfo?._id) return;
    const minBid = auctionInfo.currentBid > 0
      ? Number((auctionInfo.currentBid * 1.05).toFixed(4))
      : auctionInfo.startPrice;
    if (parseFloat(bidAmount) < minBid)
      return toast.error(`Bid must be at least ${minBid} USDC`);
    try {
      setBidLoading(true);
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/auction/${auctionInfo._id}/bid`,
        { amount: parseFloat(bidAmount), bidderWallet: activeAddress.toLowerCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Bid placed!");
      setBidAmount("");
      setAuctionFetched(false);
      await fetchAuctionInfo();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to place bid");
    } finally { setBidLoading(false); }
  };

  /* ====================== TIME REMAINING HELPER ====================== */
  const timeRemaining = (endTime) => {
    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return "Ended";
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h remaining`;
    return `${h}h ${m}m remaining`;
  };

  /* ================================== UI ================================== */
  if (!collection) return null;

  return (
    <div className="text-white px-4 sm:px-6 lg:px-12 xl:px-16 pb-8 max-w-6xl mx-auto pt-6 w-full">

      {/* ── Insufficient USDC Modal ── */}
      {fundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">{t("buyNfa.fundModal.title", "Insufficient USDC")}</h3>
            <p className="text-sm text-white/50 mb-3">
              {t("buyNfa.fundModal.youNeed", "You need")} <span className="text-white font-semibold">{fundModal.needed} USDC</span> {t("buyNfa.fundModal.butHave", "but your wallet only has")}{" "}
              <span className="text-white font-semibold">{fundModal.have} USDC</span>.
            </p>
            <p className="text-sm text-white/50 mb-6">
              {t("buyNfa.fundModal.desc2", "Fund your wallet instantly with a credit or debit card via Transak, then come back to complete the purchase.")}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  openTransakOnRamp({ walletAddress: activeAddress, fiatAmount: String(Math.ceil(parseFloat(fundModal.priceUsdc) * 1.05)), network: "base" });
                  setFundModal(null);
                }}
                className="w-full bg-[#002AA8] hover:bg-[#003BD4] transition-colors text-white font-semibold py-2.5 rounded-lg text-sm"
              >
                {t("buyNfa.fundModal.fundBtn", "Fund Wallet with Card (Transak)")}
              </button>
              <button onClick={() => setFundModal(null)} className="w-full text-white/40 hover:text-white transition text-sm py-2">
                {t("buyNfa.fundModal.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── No ETH Gas Modal ── */}
      {gasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">⛽ {t("buyNfa.gasModal.title", "ETH Required for Gas")}</h3>
            <p className="text-sm text-white/50 mb-3">
              {t("buyNfa.gasModal.desc", "To list your NFA on-chain you need a small amount of")} <span className="text-white font-semibold">ETH</span> {t("buyNfa.gasModal.descSuffix", "in your wallet to pay for gas fees on Base.")}
            </p>
            <p className="text-sm text-white/40 mb-1 leading-relaxed">
              {TARGET_CHAIN_ID === 8453
                ? t("buyNfa.gasModal.mainnetNote", "You're on Base Mainnet. Buy a small amount of ETH (≈ $1–2) on Coinbase or bridge from Ethereum via bridge.base.org.")
                : t("buyNfa.gasModal.testnetNote", "You're on Base Sepolia Testnet. Get free test ETH from a faucet.")}
            </p>
            <div className="flex flex-col gap-3 mt-4">
              {TARGET_CHAIN_ID !== 8453 && (
                <a
                  href="https://faucet.quicknode.com/base/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-[#002AA8] hover:bg-[#003BD4] transition-colors text-white font-semibold py-2.5 rounded-lg text-sm"
                  onClick={() => setGasModal(false)}
                >
                  {t("buyNfa.gasModal.faucetBtn", "Get Testnet ETH (Faucet)")}
                </a>
              )}
              {TARGET_CHAIN_ID === 8453 && (
                <a
                  href="https://bridge.base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-[#002AA8] hover:bg-[#003BD4] transition-colors text-white font-semibold py-2.5 rounded-lg text-sm"
                  onClick={() => setGasModal(false)}
                >
                  {t("buyNfa.gasModal.bridgeBtn", "Bridge ETH to Base")}
                </a>
              )}
              <button onClick={() => setGasModal(false)} className="w-full text-white/40 hover:text-white transition text-sm py-2">
                {t("buyNfa.gasModal.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stripe Card Payment Modal ── */}
      {stripeModal && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret: stripeModal.clientSecret, appearance: { theme: "night" } }}>
          <StripeNFTCheckoutForm
            amount={stripeModal.amount}
            onClose={() => setStripeModal(null)}
            onSuccess={async (paymentIntent) => {
              setStripeModal(null);
              const meta = stripeModal.meta || {};
              try {
                const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/nft/finalize-by-payment-intent`, {
                  paymentIntentId: paymentIntent.id,
                  parentId: meta.parentId || null,
                  subCollectionId: meta.subCollectionId,
                  buyerWallet: meta.buyerWallet,
                  priceETH: meta.priceETH,
                  offerId: meta.offerId || null,
                });
                if (res.data?.success) {
                  setPurchaseSuccess(true);
                } else {
                  setTransferFailed({ paymentIntentId: paymentIntent.id, error: res.data?.error });
                }
              } catch (err) {
                console.error("⚠️ [Stripe] finalize error:", err.message);
                setTransferFailed({ paymentIntentId: paymentIntent.id, error: err.message });
              }
            }}
          />
        </Elements>
      )}

      {/* ── Breadcrumb / Tabs ── */}
      <div className="flex items-end gap-6 mt-8 mb-8 border-b border-white/10 flex-wrap">
        <button
          onClick={() => navigate("/market-place", { state: { restoreScrollY: marketplaceScrollY ?? 0 } })}
          className="pb-3 flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors group mr-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {t("buyNfa.nav.backToMarketplace", "Back to Marketplace")}
        </button>
        <div className="pb-3 w-px h-4 bg-white/10 self-center mb-0.5" />
        <button
          onClick={() => navigate("/Profile?tab=collectibles", { state: { scrollToGrid: true } })}
          className="pb-3 flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors group mr-2"
        >
          {t("buyNfa.nav.backToCollections", "Back to Collections")}
        </button>
        <div className="pb-3 w-px h-4 bg-white/10 self-center mb-0.5" />

        {/* NFT Detail label — clicking goes to marketplace tab */}
        <button
          onClick={() => setActiveTab("marketplace")}
          className="pb-3 text-sm font-medium transition-colors"
          style={activeTab === "marketplace"
            ? { color: "#fff", borderBottom: "2px solid #3b82f6", marginBottom: "-1px" }
            : { color: "rgba(255,255,255,0.4)" }}
        >
          {isOwner ? t("buyNfa.nav.detail", "{{type}} Detail", { type: assetType }) : t("buyNfa.nav.buy", "Buy {{type}}", { type: assetType })}
        </button>

        {/* Offers tab */}
        <button
          onClick={() => setShowOffers(true)}
          className="pb-3 text-sm font-medium text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
        >
          {t("buyNfa.nav.offers", "Offers")}
          {offers.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${offers.some(o => o.requestStatus === "accepted")
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-white/10 text-white/40"
              }`}>
              {offers.length}
            </span>
          )}
        </button>

        {/* Marketplace / Auction / Trade — in-page tabs */}
        <div className="pb-3 w-px h-4 bg-white/10 self-center mb-0.5" />
        <button
          onClick={() => handleTabChange("marketplace")}
          className="pb-3 text-sm font-medium transition-colors"
          style={activeTab === "marketplace"
            ? { color: "#fff", borderBottom: "2px solid #3b82f6", marginBottom: "-1px" }
            : { color: "rgba(255,255,255,0.4)" }}
        >
          {t("buyNfa.nav.marketplace", "Marketplace")}
        </button>
        <button
          onClick={() => handleTabChange("auction")}
          className="pb-3 text-sm font-medium transition-colors"
          style={activeTab === "auction"
            ? { color: "#fbbf24", borderBottom: "2px solid #fbbf24", marginBottom: "-1px" }
            : { color: "rgba(255,255,255,0.4)" }}
        >
          {t("buyNfa.nav.auction", "Auction")}
        </button>
        <button
          onClick={() => handleTabChange("trade")}
          className="pb-3 text-sm font-medium transition-colors"
          style={activeTab === "trade"
            ? { color: "#60a5fa", borderBottom: "2px solid #60a5fa", marginBottom: "-1px" }
            : { color: "rgba(255,255,255,0.4)" }}
        >
          {t("buyNfa.nav.trade", "Trade")}
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-stretch">

        {/* Left — Image (always visible) */}
        <div className="w-full md:w-[420px] lg:w-[520px] xl:w-[580px] shrink-0">
          <img
            src={collection?.image ? getImageUrl(collection.image) : overview1}
            alt={collection?.name}
            className="w-full h-full min-h-[300px] md:min-h-[440px] rounded-2xl object-contain object-center"
            style={{ background: "rgba(13,22,50,0.8)" }}
            onError={(e) => { e.target.src = overview1; }}
          />
        </div>

        {/* Right — Tab panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* ── Marketplace Panel ── */}
          {activeTab === "marketplace" && <>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Asset type badge */}
              {(() => {
                const aType = collection.assetType || (collection.isNFA ? "NFA" : "NFT"); // NFC always has assetType set
                const cfg = {
                  NFA: { label: "NFA", bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
                  NFC: { label: "NFC", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
                  NFT: { label: "NFT", bg: "bg-white/10", text: "text-white/50", border: "border-white/10" },
                }[aType] || null;
                return cfg ? (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                    {cfg.label}
                  </span>
                ) : null;
              })()}
              {listingData?.active && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {t("buyNfa.marketplace.listed", "Listed")}
                </span>
              )}
              {isOwner && collection.tokenId && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {t("buyNfa.marketplace.youOwn", "You Own This")}
                </span>
              )}
            </div>

            {/* Name + meta */}
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">{collection?.name}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-white/40 text-sm">
                  {collection?.symbol || assetType}
                  {collection?.tokenId ? ` · Token #${collection.tokenId}` : ` · ${t("buyNfa.marketplace.notMinted", "Not minted yet")}`}
                </span>
                {(onChainOwner || collection.owner) && (
                  <span className="text-white/20 text-sm">·</span>
                )}
                <span className="text-white/40 text-sm">
                  {t("buyNfa.marketplace.ownedBy", "Owned by")}{" "}
                  <span className="text-blue-400 font-medium">
                    {onChainOwner || collection.owner
                      ? `${(onChainOwner || collection.owner).substring(0, 6)}...${(onChainOwner || collection.owner).substring(38)}`
                      : t("buyNfa.marketplace.platform", "Platform")}
                  </span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div
              className="rounded-xl p-4 min-h-[80px]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-white/50 text-sm leading-relaxed">
                {collection?.description && collection.description.trim().length > 0
                  ? collection.description
                  : t("buyNfa.marketplace.noDesc", "No description provided for this item.")}
              </p>
            </div>

            {/* Price Card */}
            <div
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Price row */}
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{t("buyNfa.marketplace.price", "Price")}</p>

                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">
                    {listingData?.active
                      ? ethers.formatUnits(listingData.price, 6)
                      : (collection.priceETH || 0.01)}
                  </span>
                  <span className="text-blue-400 font-semibold">USDC</span>
                </div>

                {collection.category && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-white/50 capitalize"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {collection.category}
                  </span>
                )}
              </div>

              {/* Min Buyback + Reserve Price (NFA / NFC only) */}
              {(() => {
                const aType = collection.assetType || (collection.isNFA ? "NFA" : "NFT"); // NFC always has assetType set
                const minBB = collection.minimumBuybackUSD;
                const reserve = collection.reservePriceUSD;
                if ((aType === "NFA" || aType === "NFC") && (minBB > 0 || reserve > 0)) {
                  return (
                    <div className="rounded-xl p-3 flex flex-col gap-1.5"
                      style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.2)" }}>
                      {minBB > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">{t("buyNfa.marketplace.minBuyback", "Min Buyback Guarantee")}</span>
                          <span className="text-green-400 font-semibold">${minBB} USD</span>
                        </div>
                      )}
                      {reserve > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/50">{t("buyNfa.marketplace.reservePrice", "Reserve Price")}</span>
                          <span className="text-blue-300 font-semibold">${reserve} USD</span>
                        </div>
                      )}
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {t("buyNfa.marketplace.buybackNote", "This asset cannot be sold below its minimum buyback value.")}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}


              {/* Embedded wallet display */}
              {isEmailWalletConnected && emailWalletAddress && (
                <div
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition"
                  onClick={() => copyToClipboard(emailWalletAddress)}
                  data-tooltip="Copy wallet address"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-white/60 flex items-center gap-2">
                        {emailWalletAddress.slice(0, 6)}...{emailWalletAddress.slice(-4)}
                        {walletCopied
                          ? <span className="text-green-400 text-[10px]">Copied!</span>
                          : <Copy className="w-3 h-3 text-white/30" />}
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {Number(ethBalance).toFixed(4)} ETH
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Network info */}
              <div className="flex items-center gap-2 text-[11px] text-white/30 -mt-1">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span>{t("buyNfa.marketplace.networkNote", "USDC on Base · Base ETH required for gas (wallet payments only)")}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={buttonConfig.action || (() => setIsOpen(true))}
                  disabled={buttonConfig.disabled || loading}
                  className="flex-1 px-6 py-2.5 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all duration-300 border border-white/20"
                >
                  {buttonConfig.text}
                </button>
                {!isOwner && (
                  <button
                    onClick={handlePaymentCard}
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 border border-white/20 hover:border-white/40 hover:bg-white/5 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all duration-300"
                  >
                    💳 {t("buyNfa.marketplace.buyWithCard", "Buy With Card")}
                  </button>
                )}
              </div>

              {/* Make Offer — only for non-owners */}
              {!isOwner && (
                <Link
                  to="/make-offer"
                  state={{ item: collection }}
                  className="flex items-center justify-center gap-1.5 text-white/40 hover:text-blue-400 text-sm transition-colors"
                >
                  {t("buyNfa.marketplace.makeOffer", "Make Offer")} <FiEdit2 size={12} />
                </Link>
              )}
            </div>

          </>}

          {/* ── Auction Panel ── */}
          {activeTab === "auction" && (
            <div className="flex flex-col gap-4">

              {/* Item header */}
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight">{collection?.name}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-white/40 text-sm">
                    {assetType}{collection?.tokenId ? ` · Token #${collection.tokenId}` : ` · ${t("buyNfa.marketplace.notMinted", "Not minted yet")}`}
                  </span>
                  {(onChainOwner || collection.owner) && (
                    <span className="text-white/40 text-sm">
                      · {t("buyNfa.marketplace.ownedBy", "Owned by")}{" "}
                      <span className="text-amber-400 font-medium">
                        {(() => { const w = onChainOwner || collection.owner; return `${w.substring(0, 6)}...${w.substring(38)}`; })()}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white/50 text-sm leading-relaxed">
                  {collection?.description?.trim() || t("buyNfa.marketplace.noDesc", "No description provided for this item.")}
                </p>
              </div>

              {/* Auction content */}
              {auctionInfoLoading ? (
                <div className="rounded-2xl p-10 flex flex-col items-center gap-3"
                  style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)" }}>
                  <div className="w-6 h-6 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
                  <p className="text-white/40 text-sm">{t("buyNfa.auction.loading", "Loading auction data…")}</p>
                </div>

              ) : auctionInfo ? (
                <div className="rounded-2xl p-5 flex flex-col gap-5"
                  style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.2)" }}>

                  {/* Status row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-amber-300 text-sm font-semibold">{t("buyNfa.auction.active", "Active Auction")}</span>
                    </div>
                    {auctionInfo.endTime && (
                      <span className="text-white/40 text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                        ⏱ {timeRemaining(auctionInfo.endTime)}
                      </span>
                    )}
                  </div>

                  {/* Price grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 flex flex-col gap-0.5"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <p className="text-white/35 text-[10px] uppercase tracking-widest">{t("buyNfa.auction.startPrice", "Start Price")}</p>
                      <p className="text-white font-bold text-base">{auctionInfo.startPrice} <span className="text-white/50 text-xs font-normal">USDC</span></p>
                    </div>

                    <div className="rounded-xl p-3 flex flex-col gap-0.5"
                      style={{ background: auctionInfo.currentBid > 0 ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.04)", border: auctionInfo.currentBid > 0 ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(255,255,255,0.08)" }}>
                      <p className="text-white/35 text-[10px] uppercase tracking-widest">{t("buyNfa.auction.currentBid", "Current Bid")}</p>
                      {auctionInfo.currentBid > 0
                        ? <p className="text-green-300 font-bold text-base">{auctionInfo.currentBid} <span className="text-green-400/60 text-xs font-normal">USDC</span></p>
                        : <p className="text-white/30 text-sm italic">{t("buyNfa.auction.noBids", "No bids yet")}</p>}
                    </div>

                    {auctionInfo.instantBuyPrice > 0 && (
                      <div className="rounded-xl p-3 flex flex-col gap-0.5"
                        style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
                        <p className="text-white/35 text-[10px] uppercase tracking-widest">{t("buyNfa.auction.instantBuy", "Instant Buy")}</p>
                        <p className="text-amber-300 font-bold text-base">{auctionInfo.instantBuyPrice} <span className="text-amber-400/60 text-xs font-normal">USDC</span></p>
                      </div>
                    )}

                    {auctionInfo.reservePrice > 0 && (
                      <div className="rounded-xl p-3 flex flex-col gap-0.5"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="text-white/35 text-[10px] uppercase tracking-widest">{t("buyNfa.auction.reservePrice", "Reserve Price")}</p>
                        <p className="text-white/70 font-semibold text-base">{auctionInfo.reservePrice} <span className="text-white/30 text-xs font-normal">USDC</span></p>
                      </div>
                    )}
                  </div>

                  {/* Bid history summary */}
                  {auctionInfo.bidHistory?.length > 0 && (
                    <div className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="px-3 py-2 flex items-center justify-between"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-white/40 text-xs uppercase tracking-widest">{t("buyNfa.auction.bidHistory", "Bid History")}</p>
                        <span className="text-white/30 text-xs">{auctionInfo.bidHistory.length} bid{auctionInfo.bidHistory.length !== 1 ? "s" : ""}</span>
                      </div>
                      {[...auctionInfo.bidHistory].reverse().slice(0, 3).map((bid, i) => (
                        <div key={i} className="px-3 py-2 flex items-center justify-between border-t border-white/5">
                          <span className="text-white/50 text-xs font-mono">
                            {bid.bidderWallet ? `${bid.bidderWallet.substring(0, 6)}...${bid.bidderWallet.substring(38)}` : bid.bidderName || "—"}
                          </span>
                          <span className="text-white/80 text-xs font-semibold">{bid.amount} USDC</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bid form — non-owners only */}
                  {!isOwner && (
                    <div className="flex flex-col gap-3 pt-1 border-t border-white/08">
                      <p className="text-white/40 text-xs">
                        {t("buyNfa.auction.minBid", "Min bid:")}{" "}
                        <span className="text-white/70 font-medium">
                          {auctionInfo.currentBid > 0
                            ? Number((auctionInfo.currentBid * 1.05).toFixed(4))
                            : auctionInfo.startPrice} USDC
                        </span>
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center rounded-lg overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                          <input
                            type="number" min="0" step="0.01"
                            placeholder={String(auctionInfo.currentBid > 0 ? Number((auctionInfo.currentBid * 1.05).toFixed(4)) : auctionInfo.startPrice)}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="flex-1 bg-transparent px-3 py-2.5 text-white text-sm outline-none placeholder-white/25"
                          />
                          <span className="pr-3 text-amber-400/70 text-xs font-semibold">USDC</span>
                        </div>
                        <button
                          onClick={handlePlaceBid}
                          disabled={bidLoading || !isAnyConnected}
                          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
                          style={{ background: "rgba(251,191,36,0.25)", border: "1px solid rgba(251,191,36,0.45)" }}
                        >
                          {bidLoading ? t("buyNfa.auction.bidding", "Bidding…") : t("buyNfa.auction.placeBid", "Place Bid")}
                        </button>
                      </div>

                      {auctionInfo.instantBuyPrice > 0 && (
                        <button
                          onClick={async () => {
                            if (!isAnyConnected) return toast.error("Connect your wallet first");
                            if (!user?.id) return toast.error("Login required");
                            try {
                              setBidLoading(true);
                              await axios.post(
                                `${BACKEND_BASE_URL}/api/v1/auction/${auctionInfo._id}/instant-buy`,
                                { buyerWallet: activeAddress.toLowerCase() },
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              toast.success("Item purchased instantly!");
                              setAuctionFetched(false);
                              fetchAuctionInfo();
                            } catch (err) {
                              toast.error(err.response?.data?.error || "Instant buy failed");
                            } finally { setBidLoading(false); }
                          }}
                          disabled={bidLoading}
                          className="w-full py-2.5 rounded-lg text-sm font-semibold text-amber-200 disabled:opacity-50 transition-all"
                          style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}
                        >
                          ⚡ Instant Buy — {auctionInfo.instantBuyPrice} USDC
                        </button>
                      )}

                      {!isAnyConnected && (
                        <p className="text-white/30 text-xs text-center">{t("buyNfa.auction.connectWallet", "Connect your wallet to place a bid")}</p>
                      )}
                    </div>
                  )}

                  {/* Owner view */}
                  {isOwner && (
                    <div className="pt-2 border-t border-white/08 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <p className="text-white/50 text-xs">{t("buyNfa.auction.ownerNote", "Your item is listed on auction. Bids will appear here as they come in.")}</p>
                    </div>
                  )}

                  {/* End time footer */}
                  {auctionInfo.endTime && (
                    <p className="text-white/25 text-[11px] text-right">
                      Ends {new Date(auctionInfo.endTime).toLocaleString()}
                    </p>
                  )}
                </div>

              ) : (
                /* No auction empty state */
                <div className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                    style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-sm font-medium">{t("buyNfa.auction.noAuction", "No active auction for this item")}</p>
                  {isOwner
                    ? <p className="text-white/25 text-xs max-w-[200px]">{t("buyNfa.auction.ownerSetup", "Go to your Collections and click List to set up an auction.")}</p>
                    : <p className="text-white/25 text-xs">{t("buyNfa.auction.notAvailable", "This item has no open auction at the moment.")}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Trade Panel ── */}
          {activeTab === "trade" && (
            <div className="flex flex-col gap-4">

              {/* Item header */}
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight">{collection?.name}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-white/40 text-sm">
                    {assetType} · <span className="capitalize">{collection?.category || "general"}</span>
                  </span>
                  {(onChainOwner || collection.owner) && (
                    <span className="text-white/40 text-sm">
                      · {t("buyNfa.marketplace.ownedBy", "Owned by")}{" "}
                      <span className="text-blue-400 font-medium">
                        {(() => { const w = onChainOwner || collection.owner; return `${w.substring(0, 6)}...${w.substring(38)}`; })()}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white/50 text-sm leading-relaxed">
                  {collection?.description?.trim() || t("buyNfa.marketplace.noDesc", "No description provided for this item.")}
                </p>
              </div>

              {/* Trade listings */}
              {tradeListingsLoading ? (
                <div className="rounded-2xl p-10 flex flex-col items-center gap-3"
                  style={{ background: "rgba(0,80,255,0.04)", border: "1px solid rgba(0,80,255,0.15)" }}>
                  <div className="w-6 h-6 rounded-full border-2 border-blue-400/40 border-t-blue-400 animate-spin" />
                  <p className="text-white/40 text-sm">{t("buyNfa.trade.loading", "Loading trade listings…")}</p>
                </div>

              ) : tradeListings.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-white/30 text-xs uppercase tracking-widest pl-1">
                    {tradeListings.length} {tradeListings.length !== 1 ? t("buyNfa.trade.actives", "active trade listings") : t("buyNfa.trade.active", "active trade listing")}
                  </p>
                  {tradeListings.map((trade) => (
                    <div key={trade._id} className="rounded-xl p-4 flex flex-col gap-3"
                      style={{ background: "rgba(0,80,255,0.05)", border: "1px solid rgba(0,80,255,0.2)" }}>

                      {/* Trade exchange row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-0 rounded-lg px-3 py-2"
                          style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.15)" }}>
                          <p className="text-[10px] text-green-400/60 uppercase tracking-widest mb-0.5">{t("buyNfa.trade.offering", "Offering")}</p>
                          <p className="text-green-300 text-sm font-medium truncate">{trade.offering}</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
                        </svg>
                        <div className="flex-1 min-w-0 rounded-lg px-3 py-2"
                          style={{ background: "rgba(0,80,255,0.08)", border: "1px solid rgba(0,80,255,0.2)" }}>
                          <p className="text-[10px] text-blue-400/60 uppercase tracking-widest mb-0.5">{t("buyNfa.trade.wants", "Wants")}</p>
                          <p className="text-blue-300 text-sm font-medium truncate">
                            {trade.requesting === "Make me an offer" || !trade.requesting
                              ? <span className="italic text-white/40">{t("buyNfa.trade.openOffer", "Open offer")}</span>
                              : trade.requesting}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {trade.description && (
                        <p className="text-white/35 text-xs leading-relaxed px-1">{trade.description}</p>
                      )}

                      {/* Footer: poster + action */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/06">
                        <span className="text-white/30 text-xs">
                          {trade.posterName ? `${t("buyNfa.trade.by", "By")} ${trade.posterName}` : trade.posterWallet ? `${trade.posterWallet.substring(0, 6)}...${trade.posterWallet.substring(38)}` : ""}
                        </span>
                        {!isOwner && (
                          <Link
                            to="/market-place?tab=trades"
                            state={{ tradeId: trade._id }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          >
                            {t("buyNfa.trade.proposeTrade", "Propose Trade →")}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              ) : (
                /* No trades empty state */
                <div className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                    style={{ background: "rgba(0,80,255,0.08)", border: "1px solid rgba(0,80,255,0.15)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-sm font-medium">{t("buyNfa.trade.noTrades", "No active trade listings")}</p>
                  {isOwner
                    ? <p className="text-white/25 text-xs max-w-[200px]">{t("buyNfa.trade.ownerSetup", "Go to your Collections and click List to set up a trade.")}</p>
                    : <p className="text-white/25 text-xs">{t("buyNfa.trade.notAvailable", "The owner has no open trade listings for this item.")}</p>}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Confirmation Modal 1 ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#0f0f2a] border border-white/10 p-6 rounded-2xl w-full max-w-[480px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-center mb-4">{t("buyNfa.confirmModal1.title", "Confirm Action")}</h2>
            <img
              src={collection?.image ? getImageUrl(collection.image) : overview1}
              alt={collection?.name}
              className="w-32 h-28 mx-auto mb-3 rounded-xl object-cover object-center"
              onError={(e) => { e.target.src = overview1; }}
            />
            <h3 className="text-center font-semibold mb-4">{collection?.name}</h3>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between bg-white/5 border border-white/08 px-4 py-2.5 rounded-lg text-sm">
                <span className="text-white/50">{t("buyNfa.confirmModal1.listPrice", "List Price")}</span>
                <span className="text-white font-medium">{collection.priceETH || 0.01} USDC</span>
              </div>
              <div className="flex justify-between bg-white/5 border border-white/08 px-4 py-2.5 rounded-lg text-sm">
                <span className="text-white/50">{t("buyNfa.confirmModal1.platformFee", "Platform Fee (10%)")}</span>
                <span className="text-white font-medium">{((collection.priceETH || 0.01) * 0.1).toFixed(4)} USDC</span>
              </div>
              <div className="flex justify-between bg-[#002AA8]/20 border border-blue-500/30 px-4 py-2.5 rounded-lg text-sm">
                <span className="text-white font-semibold">{t("buyNfa.confirmModal1.total", "Total")}</span>
                <span className="text-white font-bold">{((collection.priceETH || 0.01) * 1.1).toFixed(4)} USDC</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/20 text-white/70 hover:text-white text-sm font-semibold transition-colors"
              >
                {t("buyNfa.confirmModal1.cancel", "Cancel")}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsSecondOpen(true); }}
                className="flex-1 py-2.5 rounded-lg bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm transition-colors"
              >
                {t("buyNfa.confirmModal1.continue", "Continue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal 2 ── */}
      {isSecondOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setIsSecondOpen(false)}
        >
          <div
            className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-bold text-white">{isOwner ? t("buyNfa.nav.detail", "{{type}} Detail", { type: assetType }) : t("buyNfa.nav.buy", "Buy {{type}}", { type: assetType })}</h1>
              <button onClick={() => setIsSecondOpen(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="border-t border-white/08 mb-4" />

            <img
              src={collection?.image ? getImageUrl(collection.image) : overview1}
              alt={collection?.name}
              className="w-28 h-24 rounded-xl object-cover object-center mx-auto mb-4"
              onError={(e) => { e.target.src = overview1; }}
            />

            <div className="border-t border-white/08 mb-4" />

            <div className="mb-4">
              {isOwner ? (
                <div className="flex flex-col gap-1">
                  <label className="text-white/40 text-xs px-1">{t("buyNfa.confirmModal2.setPrice", "Set Your Listing Price (USDC)")}</label>
                  <div className="flex items-center rounded-lg px-4 h-11 bg-white/5 border border-white/15 focus-within:border-blue-400 transition-colors">
                    <input
                      type="number" min="0.01" step="0.01"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder={String(collection.priceETH || "1")}
                      className="bg-transparent text-white text-sm w-full outline-none"
                    />
                    <span className="text-blue-400 text-xs font-bold ml-2">USDC</span>
                  </div>
                  {listingPrice && parseFloat(listingPrice) > 0 && (
                    <p className="text-xs text-green-400 px-1">{t("buyNfa.confirmModal2.willList", "✓ Will list at {{price}} USDC", { price: parseFloat(listingPrice).toFixed(2) })}</p>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <span className="text-white/50 text-sm">{t("buyNfa.confirmModal2.price", "Price")}</span>
                  <span className="text-white font-semibold text-sm">{collection.priceETH || 0.01} USDC</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsSecondOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/20 text-white/70 hover:text-white text-sm font-semibold transition-colors"
              >
                {t("buyNfa.confirmModal2.cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  setIsSecondOpen(false);
                  if (isOwner) { handleCreateListing(); } else { handleBuyNFT(); }
                }}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
              >
                {loading ? t("buyNfa.confirmModal2.processing", "Processing...") : t("buyNfa.confirmModal2.confirm", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Offers Modal ── */}
      {showOffers && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowOffers(false)}
        >
          <div
            className="bg-[#0f0f2a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/10">
              <div>
                <h2 className="text-base font-semibold text-white">{collection?.name}</h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {offers.length === 0 ? t("buyNfa.offers.noOffers", "No offers yet") : `${offers.length} ${offers.length > 1 ? t("buyNfa.offers.offers", "offers") : t("buyNfa.offers.offer", "offer")}`}
                </p>
              </div>
              <button onClick={() => setShowOffers(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>

            {offers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="relative">
                  <h1 className="text-[#8C9ED8] font-bold text-8xl tracking-widest opacity-30">404</h1>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src={FaceOne} alt="" className="w-20 h-16" />
                  </div>
                </div>
                <p className="text-white font-bold text-xl mt-2">{t("buyNfa.offers.noOffersTitle", "No offers right now")}</p>
                <p className="text-white/40 text-sm">{t("buyNfa.offers.noOffersDesc", "Be the first to make an offer")}</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 px-3">
                  <span>{t("buyNfa.offers.colPrice", "Price")}</span><span>{t("buyNfa.offers.colStatus", "Status")}</span><span>{t("buyNfa.offers.colFrom", "From")}</span><span>{t("buyNfa.offers.colExpires", "Expires")}</span><span>{t("buyNfa.offers.colAction", "Action")}</span>
                </div>
                {offers.map((offer) => {
                  const isMyOffer = String(offer.userId) === String(user?.id || user?._id);
                  const statusColor =
                    offer.requestStatus === "completed" ? "text-blue-400" :
                      offer.requestStatus === "accepted" ? "text-green-400" :
                        offer.requestStatus === "rejected" ? "text-red-400" :
                          offer.requestStatus === "cancelled" ? "text-white/30" :
                            "text-yellow-400"; // pending

                  return (
                    <div key={offer._id} className="grid grid-cols-5 gap-4 items-center bg-white/5 border border-white/08 p-3 rounded-lg mb-2 text-sm">
                      <span className="text-white font-medium">{offer.offerPrice} USDC</span>
                      <span className={`text-xs font-medium capitalize ${statusColor}`}>
                        {offer.requestStatus || "pending"}
                      </span>
                      <span className="text-white/50 truncate text-xs">{offer.userName || "—"}</span>
                      <span className="text-white/50 text-xs">{offer.priceDuration}</span>
                      <div className="flex gap-1.5">
                        {isOwner && offer.requestStatus === "pending" ? (
                          <>
                            <button
                              onClick={() => handleOfferStatus(offer._id, "accepted")}
                              className="px-2.5 py-1 bg-[#002AA8] hover:bg-[#003BD4] rounded-lg text-xs font-semibold transition-colors"
                            >
                              {t("buyNfa.offers.accept", "Accept")}
                            </button>
                            <button
                              onClick={() => handleOfferStatus(offer._id, "rejected")}
                              className="px-2.5 py-1 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-lg text-xs text-white/50 hover:text-red-400 transition-colors"
                            >
                              {t("buyNfa.offers.reject", "Reject")}
                            </button>
                          </>
                        ) : isMyOffer && offer.requestStatus === "pending" ? (
                          <button
                            onClick={() => handleOfferStatus(offer._id, "cancelled")}
                            className="px-2.5 py-1 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-lg text-xs text-white/40 hover:text-red-400 transition-colors"
                          >
                            {t("buyNfa.offers.cancel", "Cancel")}
                          </button>
                        ) : isMyOffer && offer.requestStatus === "accepted" ? (
                          // Seller accepted — buyer completes purchase via card
                          <div className="flex flex-col gap-1 items-start">
                            {offer.acceptDeadlineAt && (() => {
                              const diff = new Date(offer.acceptDeadlineAt) - Date.now();
                              if (diff <= 0) return <span className="text-red-400 text-xs">{t("buyNfa.offers.expired", "Expired")}</span>;
                              const h = Math.floor(diff / 3600000);
                              const m = Math.floor((diff % 3600000) / 60000);
                              return (
                                <span className="text-orange-400 text-xs">
                                  ⏳ {h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`} left
                                </span>
                              );
                            })()}
                            <button
                              onClick={async () => {
                                setShowOffers(false);
                                const offerPriceUsdc = parseFloat(offer.offerPrice);
                                const amountCents = Math.max(50, Math.round(offerPriceUsdc * 100));
                                try {
                                  const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/payment/create-payment-intent`, {
                                    amount: amountCents,
                                    userId: user.id || user._id,
                                    email: user.Email || user.email || "",
                                    parentId: resolvedParentId || "",
                                    subCollectionId: collection._id,
                                    buyerWallet: cardBuyerWallet,
                                    priceETH: offerPriceUsdc,
                                    gameTitle: collection.name || "NFT Purchase",
                                    offerId: offer._id,
                                  });
                                  if (res.data?.clientSecret) {
                                    setStripeModal({
                                      clientSecret: res.data.clientSecret,
                                      amount: offerPriceUsdc,
                                      meta: {
                                        parentId: resolvedParentId || null,
                                        subCollectionId: collection._id,
                                        buyerWallet: cardBuyerWallet,
                                        priceETH: offerPriceUsdc,
                                        offerId: offer._id,
                                      },
                                    });
                                  } else {
                                    toast.error("Could not initiate payment");
                                  }
                                } catch {
                                  toast.error("Payment setup failed");
                                }
                              }}
                              className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs font-semibold text-green-400 transition-colors"
                            >
                              {t("buyNfa.offers.completePurchase", "Complete Purchase")}
                            </button>
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Price History Chart ── */}
      <PriceHistory subId={collection?._id} />

      {/* ── Purchase Success Modal ── */}
      {purchaseSuccess && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <div
            className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-5 text-center"
            style={{ animation: "scaleIn 0.25s ease" }}
          >
            {/* Animated check */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.4)" }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M8 20L16 28L32 12"
                  stroke="#4ade80"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeDasharray: 40, strokeDashoffset: 0, animation: "drawCheck 0.4s ease 0.1s both" }}
                />
              </svg>
            </div>

            <div>
              <h2 className="text-white text-xl font-bold mb-1">{t("buyNfa.successModal.title", "Purchase Successful!")}</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                {t("buyNfa.successModal.desc", "{{name}} has been purchased. Your NFT will be transferred to your wallet shortly.", { name: collection?.name })}
              </p>
              <p className="text-white/30 text-xs mt-2">
                {t("buyNfa.successModal.note", "Transfer is processed automatically via our system.")}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => { setPurchaseSuccess(false); navigate("/Profile"); }}
                className="w-full h-11 rounded-xl text-white font-semibold text-sm transition-all"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
              >
                {t("buyNfa.successModal.viewProfile", "View in My Profile")}
              </button>
              <button
                onClick={() => { setPurchaseSuccess(false); navigate("/market-place"); }}
                className="w-full h-10 rounded-xl text-white/50 hover:text-white text-sm transition-colors"
              >
                {t("buyNfa.successModal.continueShopping", "Continue Shopping")}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
            @keyframes scaleIn { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
            @keyframes drawCheck { from { stroke-dashoffset: 40 } to { stroke-dashoffset: 0 } }
          `}</style>
        </div>
      )}

      {/* ── Transfer Failed Modal ── */}
      {transferFailed && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <div
            className="bg-[#0f0f2a] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-5 text-center"
            style={{ animation: "scaleIn 0.25s ease" }}
          >
            {/* Warning icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.35)" }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 13v9M20 27h.01" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                <path d="M17.3 6.5L3.5 31a3 3 0 002.6 4.5h27.8a3 3 0 002.6-4.5L22.7 6.5a3 3 0 00-5.4 0z" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div>
              <h2 className="text-white text-xl font-bold mb-1">{t("buyNfa.transferFailed.title", "Payment Received — Transfer Pending")}</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                {t("buyNfa.transferFailed.desc", "Your payment was successful, but the NFT transfer encountered an issue. Your funds are safe — our team will complete the transfer manually.")}
              </p>
              <div
                className="mt-3 px-3 py-2 rounded-lg text-left"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <p className="text-white/40 text-[10px] font-mono break-all">
                  Ref: {transferFailed.paymentIntentId}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => { setTransferFailed(null); navigate("/Profile"); }}
                className="w-full h-11 rounded-xl text-white font-semibold text-sm transition-all"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)" }}
              >
                {t("buyNfa.transferFailed.viewProfile", "View My Profile")}
              </button>
              <button
                onClick={() => setTransferFailed(null)}
                className="w-full h-10 rounded-xl text-white/40 hover:text-white text-sm transition-colors"
              >
                {t("buyNfa.transferFailed.dismiss", "Dismiss")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Buy1;
