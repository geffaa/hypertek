import React, { useState } from "react";
import uploadIcon from "../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../assets/images/CreateCollection/ChainIcon.png";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import FullScreenLoader from "../Components/Common/Spinner";

function CollectionBasicInfo() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Getting the data from the redux store
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedInUser);

  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [chain, setChain] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file); // for API
      setPreviewImage(URL.createObjectURL(file)); // for preview
      // Clear any previous image error
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedImage(file); // for API
      setPreviewImage(URL.createObjectURL(file)); // for preview
      // Clear any previous image error
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedImage) {
      newErrors.image = "Please select an image";
    }

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!symbol.trim()) {
      newErrors.symbol = "Token symbol is required";
    }

    if (!chain.trim()) {
      newErrors.chain = "Chain is required";
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to the next step with state
      navigate("/dashboard/create-earning", {
        state: {
          selectedImage,
          previewImage,
          name,
          symbol,
          chain,
        },
      });
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleDragOver = (event) => event.preventDefault();

  return (
    <div className="flex flex-col min-h-screen bg-transparent overflow-hidden">
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

      {/* Content */}
      <div className="relative z-50 mb-24 ">
        <div className="flex gap-16 mt-16 mx-8 ">
          {/* Left Side: Image Upload */}
          <div
            className={`flex items-center justify-center cursor-pointer backdrop-blur-sm bg-white/5 border rounded-md ${errors.image ? "border-red-500" : "border-white/30"
              }`}
            style={{
              width: "456px",
              height: "440px",
              borderStyle: "dashed",
              position: "relative",
              boxSizing: "border-box",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {/* Hidden file input */}
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {previewImage ? (
              <div className="relative w-full h-full flex items-center justify-center group">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-[454px] h-[436px] "
                />
                {/* Hover overlay with icon and text */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 rounded-md cursor-pointer">
                  <img src={uploadIcon} alt="Change" className="w-10 h-10" />
                  <p className="text-white text-base font-semibold">
                    Click to change image
                  </p>
                  <p className="text-white/70 text-sm">
                    or drag and drop a new one
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
                <div className="relative w-[240px] h-[49px] flex items-center justify-center rounded-md">
                  <label
                    htmlFor="file-upload"
                    className="text-center text-white cursor-pointer"
                  >
                    <span className="font-bold text-blue-400">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </label>
                </div>
                {errors.image && (
                  <p className="text-red-500 text-sm mt-2">{errors.image}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Form */}
          <div className="relative z-50 rounded-lg   flex flex-col gap-8">
            <div className="flex flex-col w-[495px] gap-[14px]">
              <h2 className="text-white text-2xl font-semibold">
                Create your own NFT/NFC
              </h2>
              <p className="text-white/70 text-base">
                Create your own digital universe where every piece you <br />
                mint tells a story, carries emotion, and becomes part of <br />
                something timeless.
              </p>
            </div>

            {/* Name Field */}
            <div className="flex flex-col gap-[14px] w-[451px] h-[84px]">
              <label className="text-white text-base font-normal">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Clear error when user starts typing
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Add Contract Name"
                className={`w-full h-12 px-3 rounded-md bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:bg-white/15 transition ${errors.name ? "border-red-500" : "border-gray-600"
                  }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Token Symbol */}
            <div className="flex flex-col gap-2 w-[451px] h-[84px] gap-[14px]">
              <label className="text-white text-base font-normal text-[18px]">
                Token Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  // Clear error when user starts typing
                  if (errors.symbol)
                    setErrors((prev) => ({ ...prev, symbol: "" }));
                }}
                placeholder="Create Name"
                className={`w-full h-12 px-3 rounded-md bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:bg-white/15 transition ${errors.symbol ? "border-red-500" : "border-gray-600"
                  }`}
              />
              {errors.symbol && (
                <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>
              )}
            </div>

            {/* Chain */}
            <div className="flex flex-col gap-2 w-[451px] h-[84px] gap-[14px]">
              <label className="text-white text-base font-normal">Chain</label>
              <div
                className={`flex items-center gap-2 px-2 h-12 border rounded-md bg-white/10 focus-within:bg-white/15 transition ${errors.chain ? "border-red-500" : "border-gray-600"
                  }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)",
                  }}
                >
                  <img src={ChainIcon} alt="" className="w-[11px] h-[10px]" />
                </div>
                <input
                  type="text"
                  value={chain}
                  onChange={(e) => {
                    setChain(e.target.value);
                    // Clear error when user starts typing
                    if (errors.chain)
                      setErrors((prev) => ({ ...prev, chain: "" }));
                  }}
                  placeholder="USDT"
                  className="w-full bg-transparent outline-none text-white placeholder-white/60"
                />
              </div>
              {errors.chain && (
                <p className="text-red-500 text-sm mt-1">{errors.chain}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-6 mt-16 mx-8">
          <button
            className="
    border border-white 
    text-white 
    hover:bg-white/10 
    transition-colors 
    w-[133px] 
    h-[42px] 
    text-[18px] 
    font-normal       /* ✔ 400 */
    leading-[1]       /* ✔ 100% line-height */
    tracking-normal   /* ✔ 0% letter spacing */
    rounded-md
    font-inter
  "
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button
            onClick={handleNext}
            className="
    flex items-center justify-center gap-[10px]
    w-[190px] h-[42px]
    px-[10px] py-[10px]
    bg-[#002AA8]
    text-white
    text-[18px]
    font-normal
    leading-[1]
    tracking-normal
    rounded-[6px]
    transition-colors
  "
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollectionBasicInfo;
