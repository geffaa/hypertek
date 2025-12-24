import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import FullScreenLoader from "../Components/Common/Spinner";
import { User_Dashboard_Url } from "../Config";

function CollectionDetails() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [basicInfo, setBasicInfo] = useState({
    selectedImage: null,
    previewImage: null,
    name: "",
    symbol: "",
    chain: "",
  });

  // Getting the data from the redux store
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedInUser);

  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state
  useEffect(() => {
    if (location.state) {
      setBasicInfo(location.state);
    } else {
      // If no state, redirect back to the first step
      navigate("/dashboard/create-collection");
      toast.error("Please complete the basic information first");
    }
  }, [location.state, navigate]);

  // Additional form fields
  const [recipientWallet, setRecipientWallet] = useState("");
  const [collectionType, setCollectionType] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState(0);
  const [royaltyWallet, setRoyaltyWallet] = useState("");
  const [supply, setSupply] = useState(1);

  const validateForm = () => {
    const newErrors = {};

    if (!collectionType) {
      newErrors.collectionType = "Please select a collection type";
    }

    if (!recipientWallet.trim()) {
      newErrors.recipientWallet = "Recipient wallet address is required";
    } else if (recipientWallet.length !== 42) {
      newErrors.recipientWallet =
        "Wallet address must be exactly 42 characters";
    }

    if (isNaN(royaltyPercent) || royaltyPercent < 0 || royaltyPercent > 100) {
      newErrors.royaltyPercent = "Royalty percent must be between 0 and 100";
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // Add basic info
      formData.append("userId", user.id);
      formData.append("creator", "user");
      formData.append("image", basicInfo.selectedImage);
      formData.append("name", basicInfo.name);
      formData.append("symbol", basicInfo.symbol);
      formData.append("chain", basicInfo.chain);

      // Add additional info
      formData.append("Type", collectionType);
      formData.append("owner", recipientWallet);
      formData.append("royaltyPercent", Number(royaltyPercent));
      formData.append("royaltyWallet", royaltyWallet);

      const response = await axios.post(
        `${User_Dashboard_Url}/nft/collection/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API RESPONSE =>", response.data);
      toast.success("Collection created successfully");
      navigate("/dashboard/nfa-details");
    } catch (err) {
      console.error("CREATE COLLECTION ERROR =>", err.response || err);
      toast.error("There was a problem creating the collection");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard/create-collection");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      {loading && <FullScreenLoader size={4} color="white" />}

      {/* Background Blurs */}
      <div
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
        style={{
          top: "20px",
          left: "990px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />
      <div
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
        style={{
          top: "540px",
          left: "50px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />

      {/* Content */}
      <div className="relative z-50">
        <div className="flex gap-10  mx-8">
          {/* Left Side: Basic Information and Preview */}

          {/* Right Side: Form */}
          <div className="relative z-50 rounded-lg p-6 w-[456px] flex flex-col gap-6">
            {/* Earnings */}
            <span className="text-white text-xl font-semibold">Earnings</span>
            <div className="flex gap-6">
              {/* Creator Fee */}
              <div className="flex flex-col gap-2 w-[210px] h-[115px]">
                <label className="text-white text-base font-normal">
                  Creator Fee
                </label>
                <div
                  className={`flex items-center h-12 px-3 border rounded-md bg-white/10 ${
                    errors.royaltyPercent ? "border-red-500" : "border-gray-600"
                  } focus-within:border-blue-500 hover:border-blue-500`}
                >
                  <input
                    type="number"
                    value={royaltyPercent}
                    onChange={(e) => {
                      setRoyaltyPercent(e.target.value);
                      // Clear error when user starts typing
                      if (errors.royaltyPercent)
                        setErrors((prev) => ({ ...prev, royaltyPercent: "" }));
                    }}
                    min="0"
                    max="100"
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/60"
                  />
                  <span className="text-white/70 px-2">%</span>
                </div>
                {errors.royaltyPercent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.royaltyPercent}
                  </p>
                )}
                <p className="text-white/70 text-sm">Support 100% total fee</p>
              </div>
            </div>

            {/* Collection Type */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base font-normal">
                Collection Type
              </label>
              <select
                value={collectionType}
                onChange={(e) => {
                  setCollectionType(e.target.value);
                  // Clear error when user selects an option
                  if (errors.collectionType)
                    setErrors((prev) => ({ ...prev, collectionType: "" }));
                }}
                className={`w-full h-12 px-3 rounded-md text-white bg-transparent border ${
                  errors.collectionType ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:border-blue-500 focus:bg-transparent transition`}
              >
                <option value="" className="bg-gray-700 text-white">
                  Select Type
                </option>
                <option value="NFA" className="bg-gray-700 text-white">
                  NFA
                </option>
                <option value="Land" className="bg-gray-700 text-white">
                  Land
                </option>
              </select>
              {errors.collectionType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.collectionType}
                </p>
              )}
            </div>

            {/* Recipient Wallet */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-white text-base font-normal">
                Recipient Wallet Address
              </label>
              <input
                value={recipientWallet}
                onChange={(e) => {
                  const value = e.target.value;

                  // Prevent typing more than 42 chars
                  if (value.length <= 42) {
                    setRecipientWallet(value);
                  }

                  if (errors.recipientWallet) {
                    setErrors((prev) => ({ ...prev, recipientWallet: "" }));
                  }
                }}
                type="text"
                maxLength={42}
                placeholder="Add wallet address"
                className={`w-full h-12 px-3 rounded-md border bg-white/10 text-white placeholder-white/60 focus:outline-none focus:bg-white/15 transition ${
                  errors.recipientWallet ? "border-red-500" : "border-gray-600"
                }`}
              />

              {errors.recipientWallet && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.recipientWallet}
                </p>
              )}
            </div>

            {/* Creator Earnings Info */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-white text-base font-normal">
                Creator Earnings
              </label>
              <p className="text-white/70 text-sm leading-tight">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.{" "}
                <Link to="#" className="text-blue-400">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-6 mt-16 mx-8">
          <button
            onClick={handleSubmit}
            className="bg-[#002AA8] w-[190px] h-[42px] hover:bg-blue-700 transition-colors w-48 h-10 rounded-md font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollectionDetails;
