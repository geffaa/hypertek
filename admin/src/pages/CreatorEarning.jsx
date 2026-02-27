import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner"

function CreatorEarning() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    royaltyPercent: "",
    royaltyWallet: "",
    supply: "",
  });

  // State for data from previous page
  const [basicData, setBasicData] = useState({
    name: "",
    symbol: "",
    chain: "",
    Type: "",
    category: "", // ✅ Add category here
    imagePreview: null,
    selectedFile: null
  });

  // Get data from navigation state
  useEffect(() => {
    if (location.state) {
      setBasicData({
        name: location.state.formData.name || "",
        symbol: location.state.formData.symbol || "",
        chain: location.state.formData.chain || "",
        Type: location.state.formData.Type || "",
        category: location.state.formData.category || "", // ✅ Get category from previous page
        imagePreview: location.state.formData.imagePreview || null,
        selectedFile: location.state.selectedFile || null
      });

      // Initialize form with any existing values
      setFormData({
        royaltyPercent: location.state.formData.royaltyPercent || "",
        royaltyWallet: location.state.formData.royaltyWallet || "",
        supply: location.state.formData.supply || ""
      });
    } else {
      // If no state, redirect back to the first step
      navigate("/create-collection");
      toast.error("Please complete the basic information first");
    }
  }, [location.state, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers for royaltyPercent and supply
    if ((name === "royaltyPercent" || name === "supply") && value !== "") {
      // Regex to allow only numbers
      if (!/^\d*\.?\d*$/.test(value)) return; // ignore non-number input
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit data to backend
  const handleSubmit = async () => {
    if (!formData.royaltyPercent || !formData.royaltyWallet || !formData.supply) {
      toast.error("All fields are required");
      return;
    }

    if (formData.royaltyWallet.length !== 42) {
      toast.error("Wallet address must be exactly 42 characters");
      return;
    }

    setIsSubmitting(true);
    const loading = toast.loading("Creating collection...");

    try {
      // ✅ Use the category from CreateCollections.jsx (which is the collection name)
      const category = basicData.category || basicData.name.toLowerCase().trim();

      // Combine data from both steps
      const combinedData = {
        ...basicData,
        ...formData,
        owner: "admin",
        creator: "admin",
        category, // ✅ Use collection name as category
      };

      const data = new FormData();
      data.append("name", combinedData.name);
      data.append("symbol", combinedData.symbol);
      data.append("chain", combinedData.chain);
      data.append("Type", combinedData.Type);
      data.append("royaltyPercent", combinedData.royaltyPercent);
      data.append("royaltyWallet", combinedData.royaltyWallet);
      data.append("supply", combinedData.supply);
      data.append("owner", combinedData.owner);
      data.append("creator", combinedData.creator);
      data.append("category", combinedData.category); // ✅ Add category

      // Add the image file if it exists
      if (basicData.selectedFile) {
        data.append("image", basicData.selectedFile);
      }

      const res = await fetch(
        `${Dashboard_Base_Url}/v1/nft/parent-collection/create`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();

      if (res.ok) {
        toast.success("Collection Created Successfully", { id: loading });

        // 🔥 CRITICAL: Dispatch event to update sidebar categories
        window.dispatchEvent(new Event('categoriesUpdated'));

        // Get admin ID for navigation
        const adminDataString = localStorage.getItem("admin_data");
        const adminId = adminDataString ? JSON.parse(adminDataString)._id : null;

        // Navigate to collections page
        if (adminId) {
          navigate(`/${adminId}/collections`);
        } else {
          navigate("/collections");
        }
      } else {
        toast.error(result.error || "Failed to create collection", {
          id: loading,
        });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong", { id: loading });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackButton = () => {
    navigate(-1);
  };

  if (isSubmitting) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-black pt-4 overflow-hidden h-screen">
      {/* Bg Effect */}
      <div
        style={{
          top: `20px`,
          left: `950px`,
          width: "300px",
          height: "300px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      <div
        style={{
          top: `600px`,
          left: `100px`,
          width: "300px",
          height: "300px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      {/* Main Content */}
      <div className="flex gap-10 mt-6 mx-8 relative z-50">
        {/* Left side - Preview and Basic Info */}

        {/* Right side - Form */}
        <div className="flex flex-col gap-4 p-4 w-[456px]">
          <span className="font-inter font-semibold text-[25px]">
            Earnings
          </span>

          <div className="flex justify-between gap-6 mt-2">
            {/* Creator Fee */}
            <div className="flex flex-col gap-2 w-[180px]">
              <h1 className="font-inter font-normal text-[18px] m-0">Creator Fee</h1>
              <div className="flex items-center border border-[#555] rounded-md h-[40px] px-3">
                <input
                  type="text"
                  name="royaltyPercent"
                  value={formData.royaltyPercent}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
                />
                <span className="text-[18px] text-white/70 px-2">%</span>
              </div>
              <p className="text-[14px] text-white/70 font-inter m-0">
                Support 100% total fee
              </p>
            </div>

            {/* Supply */}
            <div className="flex flex-col gap-2 w-[180px]">
              <h1 className="font-inter font-normal text-[18px] m-0">Supply</h1>
              <div className="flex items-center border border-[#555] rounded-md h-[40px] px-3">
                <input
                  type="text"
                  name="supply"
                  value={formData.supply}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
                />
              </div>
            </div>
          </div>

          {/* Recipient Wallet Address */}
          <div className="flex flex-col gap-2 mt-4 w-full">
            <h1 className="font-inter font-normal text-[18px] m-0">
              Recipient Wallet Address
            </h1>
            <input
              type="text"
              name="royaltyWallet"
              value={formData.royaltyWallet}
              onChange={handleInputChange}
              placeholder="Add wallet address"
              maxLength={42}
              className="w-full h-[40px] px-4 rounded-md border border-white/70 bg-transparent text-[18px] text-white/70 font-inter outline-none"
            />
          </div>

          {/* Creator Earnings Info */}
          <div className="flex flex-col gap-2 mt-4 w-full">
            <h1 className="font-inter font-normal text-[18px] m-0">Creator Earnings</h1>
            <p className="text-[14px] text-white/70 font-inter leading-[120%] m-0">
              orem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{" "}
              <Link to="#">
                <span className="underline">Learn more</span>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end mt-4 mr-12">
        <button
          onClick={handleBackButton}
          className="border border-white text-white hover:bg-white/10 transition-colors w-[133px] h-[36px] rounded-md font-medium text-[16px] flex items-center justify-center cursor-pointer mr-4"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="w-[190px] h-[36px] rounded-md bg-blue-700 text-white font-medium text-[16px] flex items-center justify-center cursor-pointer"
        >
          Create Collection
        </button>
      </div>
    </div>
  );
}

export default CreatorEarning;