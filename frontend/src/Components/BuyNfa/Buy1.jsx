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
  // 1️⃣ Mint NFT via backend with proper error handling
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
        creatorWallet, // now this will not be undefined
      };

      console.log("Sending mint request to backend with payload:", payload);

      const res = await axios.post(
        // "http://localhost:4700/api/v1/nft/mint",
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
      } else {
        toast.error(res?.data?.error || "Mint failed: No TokenId returned");
        return null;
      }
    } catch (err) {
      console.error("Mint request error:", err.response?.data || err.message);
      const message =
        err.response?.data?.error ||
        (err.message.includes("insufficient funds")
          ? "Insufficient ETH in wallet to mint NFT"
          : err.message);
      toast.error(message);
      return null;
    }
  };

  // 2️⃣ Create listing automatically with safe checks
  const createListingAutomatically = async (signer, buyerAddress) => {
    try {
      const toastId = toast.loading("Minting NFT via backend...");
      const tokenId = await mintNFTBackend();
      if (tokenId) {
        toast.success(`NFT minted! TokenId: ${tokenId}`, { id: toastId });
      } else {
        toast.error("Mint failed", { id: toastId });
      }

      if (!tokenId) {
        toast.error("Cannot list NFT: TokenId not returned");
        return { success: false, error: "TokenId not returned from backend" };
      }

      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      toast.loading("Approving marketplace...");
      const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await approveTx.wait();

      const priceWei = ethers.parseEther("0.01");
      const listTx = await marketplace.createListing(
        NFT_ADDRESS,
        tokenId,
        priceWei
      );
      await listTx.wait();

      toast.success(`NFT listed! TokenId: ${tokenId}`);
      return { success: true, tokenId, price: "0.01" };
    } catch (err) {
      console.error(err);
      let errorMsg = err.message.includes("insufficient funds")
        ? "Insufficient ETH to approve/list NFT"
        : err.message;
      toast.error(errorMsg || "Failed to create listing");
      return { success: false, error: errorMsg };
    }
  };

  // 3️⃣ Handle Web3 purchase with wallet balance check
  const handleWeb3Purchase = async () => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed");
        return;
      }

      if (!user?.id) {
        toast.error("Please login first");
        return;
      }

      // Request wallet connection
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const buyer = await signer.getAddress();

      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      // Use the correct tokenId from item
      const tokenIdToBuy = item.tokenId || 0; // Make sure item has tokenId
      let listingExists = false;

      // Check if listing exists
      try {
        const listing = await marketplace.getListing(NFT_ADDRESS, tokenIdToBuy);
        if (listing.active) {
          listingExists = true;
          toast.loading("Confirm purchase in MetaMask...");

          const tx = await marketplace.buyNFT(NFT_ADDRESS, tokenIdToBuy, {
            value: listing.price || listing[1], // price from contract
          });
          await tx.wait();
          toast.success("NFT purchased successfully! 🎉");

          // No need to mint backend if NFT already exists
          setIsSecondOpen(false);
          return;
        }
      } catch (err) {
        console.log(
          "No active listing found, will mint and list automatically."
        );
      }

      // If no listing exists, mint via backend + list automatically
      if (!listingExists) {
        const result = await createListingAutomatically(signer, buyer);

        if (result.success) {
          toast.success(
            `NFT listed! TokenId: ${result.tokenId}, Price: ${result.price} ETH`
          );

          const tryAgain = confirm(
            `Listing created successfully!\n\nTokenId: ${result.tokenId}\nPrice: ${result.price} ETH\n\nClick "Buy Now" again to purchase!`
          );
          if (tryAgain) toast.info("Please click 'Buy Now' again");
        } else {
          toast.error("Failed to create listing: " + result.error);
        }
      }
    } catch (err) {
      console.error("Purchase error:", err);
      const message = err.message?.includes("insufficient funds")
        ? "Insufficient ETH to complete transaction"
        : err.reason || err.message || "Transaction failed";
      toast.error(message);
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
