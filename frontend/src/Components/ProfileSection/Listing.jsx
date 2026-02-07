import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { FaUserCircle } from "react-icons/fa";
import NavLinks from "../ProfileSection/Navlinks";
import overview1 from "../../assets/images/Profile/Hero.png";
import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";
import CustomButton from "../Buttons/Button1";
import CustomButton4 from "../Buttons/Button4";

import {
  MARKETPLACE_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ABI,
} from "../../Web3/Config";
import { BACKEND_BASE_URL } from "../../Config";

function UserListings() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState({});
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      await fetchProfile();
      await checkWallet();
    };
    initializePage();
  }, [token]);

  // Fetch listings when wallet is connected
  useEffect(() => {
    if (connectedWallet) {
      fetchUserListings();
    }
  }, [connectedWallet]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data.user);
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const checkWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask");
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setConnectedWallet(accounts[0].toLowerCase());
        console.log("✅ Wallet connected:", accounts[0].toLowerCase());
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged);
    } catch (err) {
      console.error("Wallet error:", err);
      toast.error("Failed to connect wallet");
      setLoading(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      const newWallet = accounts[0].toLowerCase();
      setConnectedWallet(newWallet);
      console.log("🔄 Wallet changed:", newWallet);
    }
  };

  const fetchUserListings = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/listed-subs/${connectedWallet}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("📋 Listed Sub-Collections Response:", res.data);

      // ✅ Use the properly formatted data from backend
      const listedNFTs = res.data.listedSubCollections.map((sub) => ({
        _id: sub.subId,
        tokenId: sub.tokenId,
        name: sub.name,
        symbol: sub.symbol,
        image: sub.image,
        description: sub.description,
        owner: sub.owner,
        listed: sub.listed,
        priceETH: sub.priceETH,
        priceUSD: sub.priceUSD,
        tokenURI: sub.tokenURI,
        createdAt: sub.createdAt,
        parentId: sub.parentInfo.parentId, // ✅ CRITICAL
        collection: {
          name: sub.parentInfo.parentName,
          image: sub.parentInfo.parentImage,
        },
      }));

      console.log("🔥 Formatted Listed NFTs:", listedNFTs);

      setListings(listedNFTs);
    } catch (err) {
      console.error("❌ Fetch listings error:", err);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCancelClick = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one listing");
      return;
    }
    setShowModal(true);
  };

  const switchToSepolia = async () => {
    const SEPOLIA_CHAIN_ID = "0xaa36a7";
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (err) {
      toast.error("Please switch to Sepolia network");
      return false;
    }
  };

  const handleConfirmCancel = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not installed");
      return;
    }

    const toastId = toast.loading("Cancelling listings...");
    setCancelling(true);

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        const switched = await switchToSepolia();
        if (!switched) {
          toast.error("Switch to Sepolia failed", { id: toastId });
          setCancelling(false);
          return;
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer,
      );

      const selectedListings = listings.filter((item) =>
        selectedItems.includes(item._id),
      );

      let successCount = 0;
      let failCount = 0;

      for (const listing of selectedListings) {
        try {
          console.log("🔄 Cancelling listing:", {
            tokenId: listing.tokenId,
            parentId: listing.parentId,
            _id: listing._id,
          });

          toast.loading(`Cancelling Token #${listing.tokenId}...`, {
            id: toastId,
          });

          // Cancel on blockchain
          const tx = await marketplace.cancelListing(
            NFT_ADDRESS,
            listing.tokenId,
            { gasLimit: 200000 },
          );

          await tx.wait();

          // ✅ Update backend with CORRECT parentId
          const cancelResponse = await axios.post(
            `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/cancel`,
            {
              nftId: listing.parentId, // ✅ PARENT ID
              tokenId: listing.tokenId,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          console.log("✅ Backend response:", cancelResponse.data);

          successCount++;
        } catch (err) {
          console.error(`❌ Failed to cancel token ${listing.tokenId}:`, err);
          if (err.response) {
            console.error("Backend error:", err.response.data);
          }
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Cancelled ${successCount} listing(s)!`, {
          id: toastId,
          duration: 5000,
        });
      }

      if (failCount > 0) {
        toast.error(`❌ Failed to cancel ${failCount} listing(s)`, {
          duration: 5000,
        });
      }

      setShowModal(false);
      setSelectedItems([]);
      await fetchUserListings(); // Refresh the list
    } catch (err) {
      console.error("Cancel error:", err);
      let msg = "Failed to cancel listings";
      if (err.message?.includes("user rejected")) {
        msg = "Transaction rejected";
      }
      toast.error(msg, { id: toastId });
    } finally {
      setCancelling(false);
    }
  };

  const totalSelected = selectedItems.length;
  const selectedListings = listings.filter((item) =>
    selectedItems.includes(item._id),
  );
  const totalPrice = selectedListings.reduce(
    (sum, item) => sum + (item.priceETH || 0),
    0,
  );

  return (
    <div className="bg-transparent min-h-screen">
      {/* Hero Section */}
      <div className="mx-auto mt-18 lg:mt-[68px] max-w-[2000px]">
        <div className="w-full overflow-x-hidden">
          <div className="relative w-full max-w-[1400px] mx-auto h-[250px] sm:h-[300px] md:h-[269px] lg:h-[269px] xl:h-[269px] 2xl:h-[300px] mb-20 md:mb-24 overflow-hidden">
            <img
              src={overview1}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            />
          </div>

          {/* Profile Section */}
          <div className="relative -mt-20 sm:-mt-24 md:-mt-24 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-start">
                <div className="relative flex-shrink-0">
                  {userData?.Avatar ? (
                    <img
                      src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                      alt="Profile"
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 rounded-full shadow-lg -mt-12 sm:-mt-16 md:-mt-16 xl:-mt-20 object-cover border-4 border-gray-900"
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 -mt-12 sm:-mt-16 md:-mt-16 xl:-mt-20 border-4 border-gray-900">
                      <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white" />
                    </div>
                  )}
                </div>

                <div className="mt-3 text-left text-white">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                    {userData.FullName?.replace(/[0-9]/g, "") ||
                      userData.Email?.split("@")[0].replace(/[0-9]/g, "") ||
                      "Guest"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">
                    {connectedWallet
                      ? `${connectedWallet.substring(0, 6)}...${connectedWallet.substring(38)}`
                      : "Not connected"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="relative flex flex-row md:mr-24 lg:flex-row md:justify-center justify-start items-start gap-4 lg:gap-0 mb-4 lg:mb-8">
          <div className="w-full max-w-7xl md:px-4 px-2 lg:px-8">
            <NavLinks />
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <section className="mx-auto w-full max-w-[1400px] flex flex-col gap-6 lg:gap-8 mb-4 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <div className="flex justify-between items-center"></div>

        {loading ? (
          <div className="text-center text-white py-20">
            <p className="text-xl">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-white relative gap-16 -mt-8">
            <h2 className="text-lg font-semibold -mt-4">No Item</h2>

            {/* Floating Faces */}
            <div className="relative w-full flex justify-center items-center gap-4 top-[-10px]">
              <img src={FaceOne} alt="Face One" className="w-34 h-24" />

              <img
                src={FaceTwo}
                alt="Face Two"
                className="absolute top-24 w-28 h-10"
              />
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg z-10">
            <table className="w-full text-white table-auto border-collapse">
              <thead className="bg-[#00134C]">
                <tr className="text-left">
                  {[
                    "Listing",
                    "Status",
                    "Price",
                    "Token ID",
                    "Qty",
                    "Select",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-[18px] font-inter font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {listings.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-[#00134C] transition-colors"
                  >
                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <div
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-md overflow-hidden relative"
                          style={{
                            background:
                              "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
                          }}
                        >
                          <img
                            src={`${BACKEND_BASE_URL}${item.image}`}
                            alt={item.collection?.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <span className="text-xs sm:text-sm lg:text-[18px] font-inter font-medium">
                          {item.name || "Unnamed NFT"}
                        </span>
                      </div>
                    </td>

                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                      <span className="flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-md text-green-400 text-xs sm:text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Listed
                      </span>
                    </td>

                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      {item.priceETH || 0.01} ETH
                    </td>

                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      #{item.tokenId || "N/A"}
                    </td>

                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      1
                    </td>

                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleCheckboxChange(item._id)}
                        className="w-4 h-4 appearance-none border-2 border-blue-500 rounded bg-transparent cursor-pointer checked:border-blue-500 checked:bg-blue-500 checked:before:content-['✔'] checked:before:text-white checked:before:block checked:before:text-center checked:before:leading-4 checked:before:text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalSelected > 0 && (
              <button
                onClick={handleCancelClick}
                disabled={cancelling}
                className="text-white mt-4 sm:mt-6 bg-[#002AA8] px-4 py-1 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling
                  ? "Cancelling..."
                  : `Cancel ${totalSelected} Listing${totalSelected > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Cancel Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div
            className="bg-[#1F2633] p-5 w-[400px] h-[400px] relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => !cancelling && setShowModal(false)}
              className="absolute top-3 right-3 text-white font-bold text-lg hover:text-gray-300"
              disabled={cancelling}
            >
              ×
            </button>

            {/* Title */}
            <h2 className="font-inter font-semibold text-[20px] leading-[100%] text-white text-center mb-6">
              Cancel Listing
            </h2>

            <div className="h-px bg-white/20 mb-4" />

            {/* Item Row */}
            {selectedListings.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between  p-3 rounded-md"
              >
                {/* Image */}
                <div className="w-12 h-12  overflow-hidden bg-gradient-to-b from-[#9B7C2F] to-[#4A3E22]">
                  <img
                    src={`${BACKEND_BASE_URL}${item.collection?.image}`}
                    alt={item.collection?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <div className="flex-1 ml-3 space-y-2">
                  <p className="font-medium text-[18px] leading-[100%] tracking-[0.05em] capitalize text-white -mt-4">
                    {item.name}
                  </p>
                  <p className="font-inter font-medium text-[12px] leading-[100%] tracking-[0.05em] capitalize text-gray-400">
                    Token #{item.tokenId}
                  </p>
                </div>

                {/* Price */}
                <p className="text-sm font-medium text-gray-300">
                  {item.priceETH} ETH
                </p>
              </div>
            ))}

            {/* Buttons */}
            <div className="flex justify-center gap-8  mt-40">
              {/* Cancel – Bracket */}
              <button onClick={() => setShowModal(false)} disabled={cancelling}>
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
                      width: "6.5rem",
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

              {/* Delist */}
              <button onClick={handleConfirmCancel} disabled={cancelling}>
                <CustomButton4
                  text={cancelling ? "Processing..." : "Delist Item"}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserListings;
