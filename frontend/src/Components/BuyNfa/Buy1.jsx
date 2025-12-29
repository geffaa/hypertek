import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
  NFT_ABI,  
} from "../../Web3/Config";

import CustomButton from "../Buttons/Button1";
import { FiEye, FiEdit2 } from "react-icons/fi";
import { BACKEND_BASE_URL } from "../../Config";

function Buy1() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const { token, isLoggedInUser } = useSelector((state) => state.auth);

  console.log("your user token are :", token);

  // 🔥 Selected NFT item
  const { item } = location.state || {};
  console.log("your items is here :", item._id);

  // 🔥 Collection coming from item
  const collection = item?.collection;

  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);

  useEffect(() => {
    if (!item) {
      toast.error("No item selected");
      navigate("/buy-nfa");
    }
  }, [item, navigate]);

  const handlePayment = async (productId) => {
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
        navigate("/stripe-payment", { state: { item } });
      } else {
        toast.error("Already purchased");
      }
    } catch (err) {
      toast.error("Payment failed", err);
    }
  };

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
    } catch (err) {
      toast.error("Payment failed", err);
    }
  };

  if (!item) return null;

  //// web 3

  // ---------------------------------
  // 1️⃣ Mint NFT via backend with proper error handling - UPDATED
const mintNFTBackend = async () => {
  if (!user?.id) {
    toast.error("Please login first");
    return null;
  }

  if (!item._id) {
    toast.error("Your Item is required");
    return null;
  }

  try {
    // Get wallet from Redux if exists, otherwise from MetaMask
    let creatorWallet = user.wallet;
    if (!creatorWallet && window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      creatorWallet = await signer.getAddress();
    }

    const payload = {
      docId: item._id,
      tokenURI: `ipfs://auto-${Date.now()}`,
      royaltyBps: 500,
      creatorWallet,
    };

    console.log("Sending mint request to backend with payload:", payload);

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

    console.log("Mint API response:", res);

    if (res?.data?.success) {
      toast.success(`NFT minted! TokenId: ${res.data.tokenId}`);
      return res.data.tokenId;
    } 
  } catch (err) {
    console.error("Mint request error:", err.response?.data || err.message);

    // Handle "NFT already minted" case specifically
    if (err.response?.data?.error?.includes("NFT already minted")) {
      toast.error("This NFT has already been minted. Please check your owned NFTs.");
      return null;
    }
    
    if (err.response?.data?.error?.includes("already exists")) {
      toast.error("NFT already exists. Please check your owned NFTs.");
      return null;
    }

    if (err.response) {
      toast.error(
        `Server error: ${err.response.data.error || err.response.data.message || "Unknown error"}`
      );
    } else if (err.request) {
      toast.error("No response from server. Please check your connection.");
    } else {
      toast.error(`Request error: ${err.message}`);
    }

    return null;
  }
};

// 2️⃣ Create listing automatically with safe checks - COMPLETELY UPDATED
const createListingAutomatically = async (signer, buyerAddress) => {
  let mintToastId = null;
  let approveToastId = null;
  let listToastId = null;
  
  try {
    mintToastId = toast.loading("Minting NFT via backend...");
    const tokenId = await mintNFTBackend();
    
    // Dismiss minting toast
    if (mintToastId) toast.dismiss(mintToastId);
    
    if (!tokenId) {
      // Check if it's an "already minted" error
      return { 
        success: false, 
        error: "NFT already minted or minting failed",
        isAlreadyMinted: true 
      };
    }

    // Clear any remaining toasts
    toast.dismiss();

    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
    const marketplace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      signer
    );

    // Check if already approved before showing approval toast
    try {
      const approvedAddress = await nftContract.getApproved(tokenId);
      const needsApproval = approvedAddress !== MARKETPLACE_ADDRESS;
      
      if (needsApproval) {
        approveToastId = toast.loading("Approving marketplace...");
        const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
        // await approveTx.wait();
        if (approveToastId) toast.dismiss(approveToastId);
        toast.success("Marketplace approved!");
      } else {
        toast.success("Marketplace already approved");
      }
    } catch (approveErr) {
      if (approveToastId) toast.dismiss(approveToastId);
      console.error("Approval check failed:", approveErr);
      toast.error("Failed to check/approve marketplace");
      return { success: false, error: "Approval failed" };
    }

    listToastId = toast.loading("Creating listing...");
    const priceWei = ethers.parseEther("0.01");
    const listTx = await marketplace.createListing(
      NFT_ADDRESS,
      tokenId,
      priceWei
    );
    await listTx.wait();
    
    if (listToastId) toast.dismiss(listToastId);
    toast.success(`NFT listed! TokenId: ${tokenId}`);
    
    return { success: true, tokenId, price: "0.01" };
  } catch (err) {
    // Clean up all toasts on error
    if (mintToastId) toast.dismiss(mintToastId);
    if (approveToastId) toast.dismiss(approveToastId);
    if (listToastId) toast.dismiss(listToastId);
    
    console.error("Create listing error:", err);
    
    toast.error(err.message || "Failed to create listing");
    return { success: false, error: err.message || "Failed to create listing" };
  }
};

// 3️⃣ Handle Web3 purchase with wallet balance check - UPDATED
const handleWeb3Purchase = async () => {
  try {
    console.log("=== WEB3 PURCHASE DEBUG START ===");
    
    if (!window.ethereum) {
      toast.error("MetaMask not installed");
      return;
    }

    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    // Clear ALL toasts before starting
    toast.dismiss();

    // 🔥 SIMPLER NETWORK CHECK - NO AUTO-ADDING
    const checkAndPromptNetwork = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      
      console.log("Current network chainId:", currentChainId);
      console.log("Network Name:", network.name);
      
      if (currentChainId !== 31337) {
        const shouldSwitch = window.confirm(
          `❌ Wrong Network!\n\nCurrent Network: ${network.name} (ID: ${currentChainId})\nPlease switch to Hardhat Localhost (31337)\n\n1. Click OK to open MetaMask\n2. Select "Hardhat Localhost" from network dropdown\n3. Click "Confirm" again`
        );
        
        if (shouldSwitch) {
          await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        }
        
        throw new Error(`Please switch to Hardhat Localhost (31337). Current: ${currentChainId} (${network.name})`);
      }
      return { provider, network };
    };

    // Check network first
    const { provider, network } = await checkAndPromptNetwork();
    
    // Now request accounts
    const accounts = await window.ethereum.request({ 
      method: "eth_requestAccounts" 
    });
    
    const signer = await provider.getSigner();
    const buyer = await signer.getAddress();
    
    // Get wallet balance
    const balanceBigInt = await provider.getBalance(buyer);
    const balanceEth = ethers.formatEther(balanceBigInt);
    const balanceNum = Number(balanceEth);
    
    const accountCheckToast = toast.loading(`Checking account ${buyer.slice(0, 6)}...${buyer.slice(-4)}`);
    
    // Show balance check in UI
    if (balanceNum <= 0) {
      toast.dismiss(accountCheckToast);
      toast.error(`Insufficient ETH balance: ${balanceEth} ETH`);
      return;
    }
    
    // ✅ ALL CHECKS PASSED - SHOW CONFIRMATION
    console.log("✅ All checks passed! Proceeding with purchase...");
    toast.dismiss(accountCheckToast);
    toast.success(`Account ready! ${balanceEth} ETH available`);
    
    // 🎯 SHOW TRANSACTION CONFIRMATION WITH ACCOUNT INFO
    const confirmPurchase = confirm(
      `💰 Confirm Purchase\n\n` +
      `Account: ${buyer.slice(0, 8)}...${buyer.slice(-6)}\n` +
      `Balance: ${balanceEth} ETH\n` +
      `Network: ${network.name}\n\n` +
      `Proceed with transaction?`
    );
    
    if (!confirmPurchase) {
      toast.error("Transaction cancelled");
      return;
    }
    
    // Clear any existing toasts before starting purchase
    toast.dismiss();
    
    const marketplace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      signer
    );

    const tokenIdToBuy = item.tokenId || 0;
    let listingExists = false;

    // Check if listing exists
    try {
      const listing = await marketplace.getListing(NFT_ADDRESS, tokenIdToBuy);
      console.log("Listing found:", listing);
      if (listing.active) {
        listingExists = true;
        
        const txValue = listing.price || listing[1];
        const txValueEth = ethers.formatEther(txValue);
        
        const purchaseToast = toast.loading(`Purchasing for ${txValueEth} ETH...`);
        
        const tx = await marketplace.buyNFT(NFT_ADDRESS, tokenIdToBuy, {
          value: txValue,
        });
        
        console.log("Transaction sent:", tx.hash);
        toast.loading(`Transaction sent! Hash: ${tx.hash.slice(0, 10)}...`, { id: purchaseToast });
        
        const receipt = await tx.wait();
        
        // Clear all toasts and show success
        toast.dismiss();
        toast.success("NFT purchased successfully! 🎉");
        
        const newBalance = await provider.getBalance(buyer);
        const newBalanceEth = ethers.formatEther(newBalance);
        
        console.log("✅ Purchase complete!");
        console.log("Old balance:", balanceEth, "ETH");
        console.log("New balance:", newBalanceEth, "ETH");
        console.log("Balance change:", (balanceNum - Number(newBalanceEth)).toFixed(6), "ETH");
        console.log("Transaction receipt:", receipt);
        
        // Close modal after successful purchase
        setTimeout(() => {
          setIsSecondOpen(false);
        }, 1500);
        
        return;
      }
    } catch (err) {
      console.log("No active listing found:", err.message);
    }

    if (!listingExists) {
      const result = await createListingAutomatically(signer, buyer);
      if (result.success) {
        // Clear all toasts before showing success
        toast.dismiss();
        toast.success(`NFT listed! TokenId: ${result.tokenId}, Price: ${result.price} ETH`);
        
        // If it's already minted, give specific instructions
        if (result.isAlreadyMinted) {
          toast.error("This NFT is already minted. Please check your owned NFTs in your profile.");
        } else {
          const tryAgain = confirm(
            `Listing created successfully!\n\n` +
            `From account: ${buyer.slice(0, 8)}...${buyer.slice(-6)}\n` +
            `TokenId: ${result.tokenId}\n` +
            `Price: ${result.price} ETH\n\n` +
            `Click "Buy Now" again to purchase!`
          );
          if (tryAgain) {
            // Update item with tokenId for next time
            item.tokenId = result.tokenId;
            toast.info("Please click 'Buy Now' again to purchase");
          }
        }
      } else {
        // Clean error message based on error type
        toast.dismiss();
        if (result.error.includes("already minted")) {
          toast.error("NFT already minted. Please check your owned NFTs.");
        } else {
          toast.error(`Failed: ${result.error}`);
        }
      }
    }
    
  } catch (err) {
    console.error("Purchase error:", err);
    
    // Clear all toasts on error
    toast.dismiss();
    
    if (err.code === 4001) {
      toast.error("Transaction rejected by user");
      return;
    }
    
    const message = err.message?.includes("insufficient funds")
      ? "Insufficient ETH to complete transaction"
      : err.reason || err.message || "Transaction failed";
    toast.error(message);
  }
};
  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);
  const openThirdModal = () => {
    setIsSecondOpen(false);
    setIsThirdOpen(true);
  };
  const closeThirdModal = () => setIsThirdOpen(false);
  const handleMakeOffer = () => {
    console.log("Make offer clicked");
  };










 
  return (
    <div className="flex flex-col text-white px-4">
      <div
        className="flex justify-between items-center text-white"
        style={{
          width: "200px",
          height: "28px",
          transform: "rotate(0deg)",
          opacity: 1,
          position: "absolute",
          top: "70px",
          left: "134px",
        }}
      >
        <Link to="/overview" className="text-white font-medium">
          Overview
        </Link>

        <Link to="/offers" className="text-white font-medium">
          Offers <span>0</span>
        </Link>
      </div>

      {/* ---------------- NFT DETAILS ---------------- */}
      <div className="max-w-[918px] w-full mx-auto mt-20 flex flex-col md:flex-row gap-8">
        {/* Image */}
        <img
          src={`${BACKEND_BASE_URL}${collection?.image}`}
          alt={collection?.name}
          className="w-full md:w-[375px] h-[350px] rounded-lg object-cover"
        />

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{collection?.name}</h1>
            <p>{collection?.chain}🔥</p>
          </div>

          <p className="opacity-60">Listed</p>

          <div className="bg-[#17171887] p-6 rounded-lg">
            <div className="flex justify-between opacity-70 w-full">
              <span>Price</span>
              <span
                className="truncate max-w-[150px]" // adjust max-width as needed
                title={collection?.owner} // full address on hover
              >
                Owner: {collection?.owner}
              </span>
            </div>

            <h2 className="text-xl mt-3">
              {item.collection.chain} {collection?.symbol}
            </h2>

            <div className="flex justify-end mt-4">
              <FiEye /> <span className="ml-2">505 Views</span>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setIsOpen(true)}>
                <CustomButton text="Buy Now" />
              </button>

              <button onClick={() => handlePaymentCard(item._id)}>
                <CustomButton text="Buy With Card" />
              </button>
            </div>

            <Link
              to="/payment"
              state={{ item }}
              className="flex items-center gap-2 mt-4"
            >
              Make Offer <FiEdit2 />
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------- FIRST MODAL ---------------- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-start pt-20 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#252B37] p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center">Buy Asset</h2>

            <img
              src={`${BACKEND_BASE_URL}${collection?.image}`}
              alt={collection?.name}
              className="w-40 h-36 mx-auto my-4 rounded object-cover"
            />

            <h3 className="text-center font-semibold">{collection?.name}</h3>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>List Price</span>
                <span>
                  {item.collection.chain} {collection?.symbol}
                </span>
              </div>

              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Platform Fee</span>
                <span>0.5 {collection?.symbol}</span>
              </div>

              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Total</span>
                <span>
                  {Number(item.collection.chain) + 0.5} {collection?.symbol}
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

      {/* ---------------- SECOND MODAL ---------------- */}
    {isSecondOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-4"
          onClick={closeSecondModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSecondModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>
            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>
            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={`${BACKEND_BASE_URL}${collection?.image}`}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>
            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">List Price</p>
                <p className="text-white text-sm">$2000.5</p>
              </div>
            </div>
            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
               <button onClick={closeSecondModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5 w-[0.25rem] h-[1.2rem]"
                  ></div>
                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] w-[0.5rem] h-[2.2rem]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>
                  {/* Main button area */}
                  <div
                    className="flex items-center w-[7rem] md:w-[9rem] h-[2rem] justify-center text-white font-medium"
                    style={{
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8", // ~2.42px
                    }}
                  >
                    Close
                  </div>
                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>
                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.2rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>
              <button onClick={handleWeb3Purchase}>
  <CustomButton text="Confirm" />
</button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Buy1;
