import React, { useState } from "react";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";

function EditNfa() {
  const location = useLocation();
  const { collection } = location.state || {};
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");

  const [imageFile, setImageFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(collection?.image || null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    symbol: collection?.symbol || "",
    chain: collection?.chain || "",
  });

  // If navigated here without state, go back
  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white/60">No collection data found.</p>
        <button
          onClick={() => navigate("/dashboard/collections")}
          className="px-5 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-sm transition"
        >
          ← Go to Collections
        </button>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleUpdate = async () => {
    const id = collection?._id || collection?.id;
    if (!id) return toast.error("Collection ID missing");
    if (!formData.name.trim()) return toast.error("Name is required");

    const form = new FormData();
    form.append("name", formData.name);
    form.append("symbol", formData.symbol);
    form.append("chain", formData.chain);
    if (imageFile) form.append("image", imageFile);

    try {
      setSubmitting(true);
      const response = await axios.put(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        toast.success("Collection updated successfully");
        navigate("/dashboard/collections");
      }
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to update collection");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent overflow-x-hidden">
      <div className="relative z-50 w-full px-4 md:px-8">

        {/* Header */}
        <div className="flex items-center gap-3 mt-6 mb-8">
          <button
            onClick={() => navigate("/dashboard/collections")}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-white font-semibold text-xl">Edit Collection</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* Left — Image Upload */}
          <div
            className="cursor-pointer backdrop-blur-sm bg-white/5 border border-white/30 w-full max-w-[456px] mx-auto lg:mx-0 overflow-hidden"
            style={{ borderRadius: "6px", borderStyle: selectedImage ? "solid" : "dashed", minHeight: "200px" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-auto block rounded-md"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] md:h-[440px]">
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
                  <p className="text-white text-sm">
                    <span className="font-bold text-blue-400">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-white/40 text-xs">PNG, JPG, WebP — max 5MB</p>
                </div>
              </div>
            )}
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Right — Form */}
          <div className="relative z-50 rounded-lg p-0 md:p-6 w-full max-w-[495px] mx-auto lg:mx-0 flex flex-col gap-6">
            <div>
              <h2 className="text-white text-[22px] md:text-2xl font-semibold">Edit Collection</h2>
              <p className="text-white/70 text-[16px] leading-relaxed mt-2">
                Update your collection details below.
              </p>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                type="text"
                placeholder="Add Contract Name"
                className="w-full h-12 px-3 rounded-md bg-white/10 border border-gray-600 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition"
              />
            </div>

            {/* Chain — fixed to Base */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base">Chain</label>
              <div className="flex items-center gap-2 px-3 h-10 border border-white/8 rounded-lg bg-white/3 cursor-not-allowed">
                <svg width="16" height="16" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                  <path d="M55.494 85.816C72.3 85.816 85.97 72.147 85.97 55.341c0-16.806-13.67-30.475-30.476-30.475-15.764 0-28.714 11.98-30.285 27.334h40.04v6.282H25.21c1.571 15.354 14.521 27.334 30.285 27.334z" fill="white"/>
                </svg>
                <span className="text-white/60 text-sm font-medium">Base</span>
                <span className="ml-auto text-white/25 text-xs">Payments in USDC</span>
              </div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6 mt-16 py-12 px-4 md:px-0">
          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="border border-white text-white hover:bg-white/10 transition-colors w-full sm:w-32 h-10 rounded-md font-medium bg-transparent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={submitting}
            className="bg-blue-800 hover:bg-blue-700 transition-colors w-full sm:w-48 h-10 rounded-md font-medium text-white border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditNfa;
