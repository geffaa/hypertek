import React, { useState, useEffect } from "react";
import CustomButton from "../Components/Buttons/Button1";
import { FiEdit2, FiEye } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../Config";
import BuyNfa2 from "../Components/BuyNfa/BuyNfa2";
import { ethers } from "ethers";
import { MARKETPLACE_ADDRESS, NFT_ADDRESS, MARKETPLACE_ABI, NFT_ABI } from "../Web3/Config";


function NfaLand() {
  const location = useLocation();
  const navigate = useNavigate();


  const { token } = useSelector((state) => state.auth);


  // 🔥 Selected NFT / Land
  const { item } = location.state || {};
  const collection = item?.collection;

  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);

  useEffect(() => {
    if (!item) {
      toast.error("No land selected");
      navigate("/buy-nfa");
    }
  }, [item, navigate]);

  const handlePayment = async (productId) => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/game/create`,
        {
          userId: user.id,
          productId,
        }
      );

      if (res.data?.exist === "no") {
        navigate("/stripe-payment", { state: { item } });
      } else {
        toast.error("Already purchased");
      }
    } catch {
      toast.error("Payment failed");
    }
  };

  const handlePaymentCard = async (productId) => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/game/create`,
        {
          userId: user.id,
          productId,
        }
      );

      if (res.data?.exist === "no") {
        navigate("/offer", { state: { item } });
      } else {
        toast.error("Already purchased");
      }
    } catch {
      toast.error("Payment failed");
    }
  };
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
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




  if (!item) return null;

  return (
    <div className="flex flex-col w-full mt-12 md:px-24 text-white">
      {/* Tabs */}
      {/* <div className="max-w-[1000px] mx-auto px-4">
        <div className="flex gap-6 my-6">
          <Link to="/buy-nfa" className="border-b-2 border-blue-500">
            Overview
          </Link>
          <Link to="/offer-recieved">Offer 0</Link>
        </div>
      </div> */}

<div className="flex flex-col w-full mt-12 md:px-24 text-white">
  <div
    className="flex justify-between items-center text-white mt-4"
    style={{
      width: "200px",
      height: "28px",
      opacity: 1,
    }}
  >
    <Link to="/overview" className="text-white font-medium">
      Overview
    </Link>

    <Link to="/offers" className="text-white font-medium">
      Offers <span>0</span>
    </Link>
  </div>
</div>

      {/* Main Content */}
      <div className="max-w-[918px] mx-auto w-full mt-8 flex flex-col md:flex-row gap-8 px-4">
        
        {/* Image */}
        <img
          src={`${BACKEND_BASE_URL}${collection?.image}`}
          alt={collection?.name}
          className="w-full  md:w-[340px] h-[320px] rounded-lg object-cover"
        />

        {/* Details */}
        <div className="flex-1 space-y-2">
           <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{collection?.name}</h1>
            <p>{collection?.chain}🔥</p>
          </div>
          <p className="opacity-60">
Listed          </p>

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
              {item.collection.chain ?? item.price} {collection?.symbol}
            </h2>

            <div className="flex justify-end mt-3">
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
      <BuyNfa2 />

      {/* ---------------- FIRST MODAL ---------------- */}
    {isOpen && (
  <div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    onClick={() => setIsOpen(false)}
  >
    <div
      className="bg-[#252B37] p-6 rounded-lg w-full max-w-[480px] max-h-[80vh] overflow-x-hidden overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold text-center">Buy Land</h2>

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
            {item.collection.chain ?? item.price} {collection?.symbol}
          </span>
        </div>

        <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
          <span>Platform Fee</span>
          <span>0.5 {collection?.symbol}</span>
        </div>

        <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
          <span>Total</span>
          <span>
            {Number(item.collection.chain ?? item.price) + 0.5} {collection?.symbol}
          </span>
        </div>
      </div>

      <div className="flex justify-between  mt-6">
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
  alt={collection?.name}
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

export default NfaLand;
