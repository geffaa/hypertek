import axios from "axios";

import React, { useState, useRef, useEffect } from "react";
import uploadIcon from "../assets/CreateCollection/uploadIcon.png";
import ChainIcon from "../assets/CreateCollection/ChainIcon.png";
import BgEffect2 from "../components/common/BgEffect2";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";
import FullScreenLoader from "./common/Spinner";
import { formGroupClasses } from "@mui/material/FormGroup";

function CreateCollections() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState({});
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    chain: "",
    Type: "",
    priceETH: "",
  });


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear image error if any
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file");
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      if (adminData) {
        setUserData(JSON.parse(adminData));
      }
    } catch (error) {
      console.error("Failed to parse admin data from localStorage", error);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedImage) {
      newErrors.image = "Image is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.name.length > 20 || formData.name.length < 4) {
      newErrors.name = "Name must be 4 - 20 characters";
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Token symbol is required";
    }

    if (formData.symbol.length < 2) {
      newErrors.symbol = "Symbol must be at least 2 characters";
    }

    if (!formData.Type) {
      newErrors.Type = "Collection type is required";
    }

    if (!formData.chain.trim()) {
      newErrors.chain = "Chain is required";
    }

   

    setErrors(newErrors);
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((err) => {
        toast.error(err);
      });
      return;
    }

    navigate(`/${userData._id}/creator-earning`, {
      state: {
        formData: {
          ...formData,
          price: formData.priceETH, // mapping
          imagePreview: selectedImage,
        },
        selectedFile,
      },
    });
  };

  const handleBackButton = () => {
    navigate(-1);
  };
  

  if (isSubmitting) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      {/* Background Glowing Effects */}
      <BgEffect2 Xaxis={950} Yaxis={30} />
      <BgEffect2 Xaxis={750} Yaxis={450} />

      {/* Content */}
      <div className="relative z-50">
        <div className="flex gap-10 mt-[80px] mx-2">
          {/* left side preview / modal - FIXED: Single click handler */}
          <div
            className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30"
            style={{
              width: "456px",
              height: "440px",
              borderRadius: "6px",
              borderStyle: "dashed",
              boxSizing: "border-box",
              position: "relative",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Hidden file input */}
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              style={{
                opacity: 0,
                width: "100%",
                height: "100%",
                position: "absolute",
                cursor: "pointer",
                zIndex: 10,
              }}
              onChange={handleFileChange}
              accept="image/*"
            />

            {selectedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={selectedImage}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "6px",
                  }}
                />

                {/* Hover overlay to change image - FIXED: Only this triggers file input */}
                <div
                  className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 rounded-md cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
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
              <div
                className="flex flex-col items-center justify-center gap-3 cursor-pointer"
                style={{
                  width: "260px",
                  height: "40px",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* icon */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                  }}
                >
                  <img src={uploadIcon} alt="" className="w-[16px] h-[16px]" />
                </div>

                {/* Upload text */}
                <div
                  style={{
                    width: "240px",
                    height: "49px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    <span className="font-bold text-blue-400">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                </div>
                {errors.image && (
                  <p className="text-red-500 text-sm text-center mt-2">
                    {errors.image}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* right side - form */}
          <div
            className="z-50 relative rounded-lg pl-2"
            style={{
              width: "456px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "495px",
                height: "110px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              <div
                className="flex flex-col justify-start"
                style={{
                  width: "495px",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <h2
                  className="px-2"
                  style={{
                    fontWeight: 600,
                    fontStyle: "normal",
                    fontSize: "25px",
                    lineHeight: "30px",
                    letterSpacing: "0%",
                    color: "white",
                    margin: 0,
                  }}
                >
                  Create your own Collection
                </h2>

                <p
                  className="px-2"
                  style={{
                    width: "490px",
                    color: "#FFFFFFAB",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "18px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  Create your own digital universe where every piece you mint
                  tells a story, carries emotion, and becomes part of something
                  timeless.
                </p>
              </div>
            </div>

            {/* Name Field with validation */}
            <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-8 mx-2">
              <label
                htmlFor="name"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#FFFFFF",
                }}
              >
                Name *
              </label>

              <input
                type="text"
                id="name"
                placeholder="Add Contract Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                className={`w-full h-10 px-3 rounded-md bg-white/10 text-white border ${
                  errors.name ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Token Symbol with validation */}
            <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-6 mx-2">
              <label
                htmlFor="symbol"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#FFFFFF",
                }}
              >
                Token Symbol *
              </label>

              <input
                type="text"
                id="symbol"
                placeholder="Create Name"
                value={formData.symbol}
                onChange={(e) => {
                  setFormData({ ...formData, symbol: e.target.value });
                  if (errors.symbol) {
                    setErrors((prev) => ({ ...prev, symbol: "" }));
                  }
                }}
                className={`w-full h-10 px-3 rounded-md bg-white/10 text-white border ${
                  errors.symbol ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors`}
              />
              {errors.symbol && (
                <p className="text-red-500 text-sm">{errors.symbol}</p>
              )}
            </div>

            {/* Collection Type with validation */}
<div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-6 mx-2">
  <label
    htmlFor="type"
    style={{
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontStyle: "normal",
      fontSize: "18px",
      lineHeight: "100%",
      letterSpacing: "0%",
      color: "#FFFFFF",
    }}
  >
    Collection Type *
  </label>

  <select
    id="Type"
    value={formData.Type}
    onChange={(e) => {
      setFormData({ ...formData, Type: e.target.value });
      if (errors.Type) {
        setErrors((prev) => ({ ...prev, Type: "" }));
      }
    }}
    className={`w-full h-10 px-3 rounded-md bg-transparent text-white border ${
      errors.Type ? "border-red-500" : "border-gray-600"
    } focus:outline-none focus:border-blue-500 focus:bg-gray-700 transition-colors`}
  >
    <option value="" className="text-black">
      Select Type
    </option>
    <option value="characters" className="text-black">
      Character
    </option>
    <option value="land" className="text-black">
      Land
    </option>
    
  </select>
  {errors.Type && <p className="text-red-500 text-sm">{errors.Type}</p>}
</div>


            {/* Chain with validation */}
            <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-6 mx-2">
              <label
                htmlFor="chain"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "18px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  color: "#FFFFFF",
                }}
              >
                Chain *
              </label>

              <div
                className={`flex items-center rounded-md bg-white/10 text-white border px-2 ${
                  errors.chain ? "border-red-500" : "border-gray-600"
                } focus-within:border-blue-500 focus-within:bg-white/15 transition-colors`}
              >
                <div
                  className="w-[17px] h-[17px] rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)",
                  }}
                >
                  <img
                    src={ChainIcon}
                    alt=""
                    className="w-[10.62px] h-[9.78px]"
                  />
                </div>

                <input
                  type="text"
                  id="chain"
                  value={formData.chain}
                  onChange={(e) => {
                    setFormData({ ...formData, chain: e.target.value });
                    if (errors.chain) {
                      setErrors((prev) => ({ ...prev, chain: "" }));
                    }
                  }}
                  placeholder="USDT"
                  className="w-full h-10 px-3 bg-transparent outline-none"
                />
              </div>
              {errors.chain && (
                <p className="text-red-500 text-sm">{errors.chain}</p>
              )}
            </div>
          
          </div>
        </div>

        {/* last buttons div  */}
        <div
          className="flex mt-8 justify-end mx-8 pt-16 pb-32 relative z-10"
          style={{
            opacity: 1,
            gap: "37px",
          }}
        >
          <button
            onClick={handleBackButton}
            className="border border-white text-white hover:bg-white/10 transition-colors"
            style={{
              width: "120px",
              height: "36px",
              borderRadius: "6px",
              gap: "10px",
              padding: "6px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "18px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "#FFFFFF",
              }}
            >
              Cancel
            </span>
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-800 hover:bg-blue-700 transition-colors"
            style={{
              width: "120px",
              height: "36px",
              borderRadius: "6px",
              gap: "10px",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "18px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "white",
              }}
            >
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCollections;