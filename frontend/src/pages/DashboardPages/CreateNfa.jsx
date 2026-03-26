import React, { useState } from "react";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../../assets/images/CreateCollection/ChainIcon.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";

function CreateCollections() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    chain: "Base", // hardcoded — platform only supports Base
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      toast.error("Only PNG, JPEG, JPG, or WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.symbol.trim()) return toast.error("Token Symbol is required");
    if (!form.chain.trim()) return toast.error("Chain is required");
    if (!imageFile) return toast.error("Please upload a collection image");

    const owner = user?.WalletAddress || user?.MetaMaskAddress || "";
    if (!owner) return toast.error("No wallet address found. Please connect your wallet.");

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("symbol", form.symbol.trim());
    formData.append("chain", form.chain.trim());
    formData.append("owner", owner);
    formData.append("image", imageFile);

    try {
      setSubmitting(true);
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/collection/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Collection created successfully!");
      navigate("/dashboard/nfa-details");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create collection");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent overflow-x-hidden">
      <div className="relative z-50 w-full px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-10 md:mt-16">

          {/* Left — Image upload */}
          <div
            className="flex items-center justify-center cursor-pointer backdrop-blur-sm bg-white/5 border border-white/30 w-full max-w-[456px] h-[300px] md:h-[440px] mx-auto lg:mx-0"
            style={{ borderRadius: "6px", borderStyle: "dashed" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <img src={uploadIcon} alt="" className="w-[16px] h-[16px]" />
                <p className="text-white text-sm">
                  <span className="font-bold text-blue-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-white/40 text-xs">PNG, JPG, WebP — max 5MB</p>
              </div>
            )}
            <input
              type="file"
              id="file-upload"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Right — Form */}
          <div className="z-50 relative rounded-lg p-0 md:p-6 w-full max-w-[495px] mx-auto lg:mx-0">
            <div className="flex flex-col gap-3">
              <h2 className="text-white font-semibold text-[22px] md:text-[25px]">
                Create your own NFA's
              </h2>
              <p className="text-white/70 text-[16px] leading-relaxed">
                Create your own digital universe where every piece you mint tells a story,
                carries emotion, and becomes part of something timeless.
              </p>
            </div>

            {/* Name */}
            <div className="w-full flex flex-col gap-2 mt-8">
              <label htmlFor="name" className="text-white text-[18px]">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Add Contract Name"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />
            </div>

            {/* Token Symbol */}
            <div className="w-full flex flex-col gap-2 mt-6">
              <label htmlFor="symbol" className="text-white text-[18px]">Token Symbol</label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={form.symbol}
                onChange={handleChange}
                placeholder="e.g. HTK"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />
            </div>

            {/* Chain — fixed to Base */}
            <div className="w-full flex flex-col gap-2 mt-6">
              <label className="text-white text-[18px]">Chain</label>
              <div className="flex items-center gap-2 rounded-md bg-white/5 text-white border border-gray-600/50 px-3 h-10 cursor-not-allowed">
                <div
                  className="w-[17px] h-[17px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)" }}
                >
                  <img src={ChainIcon} alt="" className="w-[10.62px] h-[9.78px]" />
                </div>
                <span className="text-white/70 text-sm">Base</span>
                <span className="ml-auto text-white/30 text-xs">Fixed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row mt-16 justify-end py-12 px-4 md:px-0 gap-4 sm:gap-[37px]">
          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="w-full sm:w-[133px] h-[42px] rounded-md border border-white text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer bg-transparent disabled:opacity-50"
          >
            <span className="font-inter text-[18px]">Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-[190px] h-[42px] rounded-md bg-blue-800 hover:bg-blue-700 transition-colors flex items-center justify-center border-none cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-inter text-[18px]">
              {submitting ? "Publishing..." : "Publish Contract"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCollections;
