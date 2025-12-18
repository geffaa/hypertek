import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
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

  // 🔥 Selected NFT item
  const { item } = location.state || {};

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
      toast.error("Payment failed");
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
      toast.error("Payment failed");
    }
  };

  if (!item) return null;



  //// web 3

const createListingAutomatically = async (signer, buyerAddress) => {
  try {
    toast.loading("Creating NFT listing...");
    
    // 1. Create contracts
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
    const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
    
    let tokenId;
    
    // 2. Try to find existing NFTs owned by user
    try {
      // Try tokenId 0 first
      const owner = await nftContract.ownerOf(0);
      if (owner.toLowerCase() === buyerAddress.toLowerCase()) {
        tokenId = 0;
        console.log("User owns tokenId 0");
      } else {
        // Mint new NFT
        toast.loading("Minting new NFT...");
        const mintTx = await nftContract.mint(
          `ipfs://auto-${Date.now()}`,
          500 // 5% royalty
        );
        await mintTx.wait();
        tokenId = 0; // Assuming first mint = tokenId 0
        console.log("Minted new NFT, tokenId:", tokenId);
      }
    } catch (mintError) {
      // If ownerOf fails, mint new NFT
      console.log("Minting new NFT...", mintError.message);
      
      toast.loading("Minting new NFT...");
      const mintTx = await nftContract.mint(
        `ipfs://auto-create-${Date.now()}`,
        500
      );
      await mintTx.wait();
      tokenId = 0; // First NFT = tokenId 0
    }
    
    // 3. Approve marketplace
    toast.loading("Approving marketplace...");
    const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
    await approveTx.wait();
    
    // 4. Create listing with default price
    const priceWei = ethers.parseEther("0.01"); // Default 0.01 ETH
    const priceETH = "0.01";
    
    toast.loading("Creating listing...");
    const listTx = await marketplace.createListing(NFT_ADDRESS, tokenId, priceWei);
    await listTx.wait();
    
    console.log("Listing created:", { tokenId, price: priceETH });
    
    return {
      success: true,
      tokenId: tokenId,
      price: priceETH,
      message: `NFT listed! TokenId: ${tokenId}, Price: ${priceETH} ETH`
    };
    
  } catch (err) {
    console.error("Auto-create error:", err);
    return {
      success: false,
      error: err.reason || err.message,
      message: "Failed to create listing"
    };
  }
};



const handleWeb3Purchase = async () => {
  try {
    // 1. Basic checks
    if (!window.ethereum) {
      toast.error("MetaMask not installed");
      return;
    }
    
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    // 2. Connect wallet
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const buyer = await signer.getAddress();

    console.log("Buyer:", buyer);

    // 3. Create contracts
    const marketplace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      signer
    );

    // 4. Try to buy FIRST - if listing exists
    try {
      // Try tokenId 0 first (most common)
      const tokenId = 0;
      
      console.log("Checking listing for tokenId:", tokenId);
      const listing = await marketplace.getListing(NFT_ADDRESS, tokenId);
      
      // If we get here, listing exists!
      console.log("Listing found:", {
        seller: listing[0],
        price: ethers.formatEther(listing[1]),
        active: listing[2]
      });

      // Check if active
      if (!listing[2]) {
        throw new Error("Listing not active");
      }

      // 5. BUY NFT (listing exists!)
      toast.loading("Confirm purchase in MetaMask...");
      const tx = await marketplace.buyNFT(NFT_ADDRESS, tokenId, {
        value: listing[1]
      });
      
      const receipt = await tx.wait();
      toast.success("NFT purchased successfully! 🎉");

      // 6. Save to backend
      await axios.post(`${BACKEND_BASE_URL}/api/v1/nft/mint`, {
        userId: user.id,
        productId: item._id,
        wallet: buyer,
        tokenId: tokenId,
        txHash: receipt.hash
      });

      setIsSecondOpen(false);
      return; // Success! Exit function

    } catch (buyError) {
      // If listing doesn't exist, create one automatically
      console.log("No listing found, creating one...", buyError.message);
      
      // 7. CREATE LISTING AUTOMATICALLY
      const result = await createListingAutomatically(signer, buyer);
      
      if (result.success) {
        toast.success(`NFT listed! TokenId: ${result.tokenId}, Price: ${result.price} ETH`);
        
        // Ask user to try buying again
        const tryAgain = confirm(
          `Listing created successfully!\n\n` +
          `TokenId: ${result.tokenId}\n` +
          `Price: ${result.price} ETH\n\n` +
          `Click "Buy Now" again to purchase!`
        );
        
        if (tryAgain) {
          // You could auto-retry here, but let's keep it simple
          toast.info("Please click 'Buy Now' again");
        }
      } else {
        toast.error("Failed to create listing: " + result.error);
      }
    }

  } catch (err) {
    console.error("Purchase error:", err);
    toast.error(err.reason || err.message || "Transaction failed");
  }
};

  return (
    <div className="flex flex-col text-white px-4">
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
          <h1 className="text-2xl font-bold">{collection?.name}</h1>

          <p className="opacity-60">
            Chain: {collection?.chain} | Symbol: {collection?.symbol}
          </p>

          <div className="bg-[#17171887] p-6 rounded-lg">
            <div className="flex justify-between opacity-70">
              <span>Price</span>
              <span>Owner: {collection?.owner}</span>
            </div>

            <h2 className="text-xl mt-3">
              {item.collection.supply} {collection?.symbol}
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
                  {item.collection.supply} {collection?.symbol}
                </span>
              </div>

              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Platform Fee</span>
                <span>0.5 {collection?.symbol}</span>
              </div>

              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Total</span>
                <span>
                  {Number(item.collection.supply) + 0.5} {collection?.symbol}
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
          className="fixed inset-0 bg-black/70 flex justify-center items-start pt-20 z-50"
          onClick={() => setIsSecondOpen(false)}
        >
          <div
            className="bg-[#252B37] p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center">Confirm Purchase</h2>

            <div className="flex justify-between bg-white/10 px-4 py-2 mt-6 rounded">
              <span>Total Price</span>
              <span>
                {Number(item.collection.supply) + 0.5} {collection?.symbol}
              </span>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setIsSecondOpen(false)}>
                <CustomButton text="Close" />
              </button>

              {/* <button onClick={() => handlePayment(item._id)}>
                <CustomButton text="Confirm" />
              </button> */}
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
