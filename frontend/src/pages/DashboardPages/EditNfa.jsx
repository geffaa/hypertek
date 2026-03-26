import React, { useState } from "react";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../../assets/images/CreateCollection/ChainIcon.png";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { User_Dashboard_Url } from "../../Config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

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
    Type: collection?.Type || "",
  });

  // If navigated here without state, go back
  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white/60 text-lg">No collection data found.</p>
        <button
          onClick={() => navigate("/dashboard/nfa-details")}
          className="px-6 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Go to Collections
        </button>
      </div>
    );
  }

  const api = axios.create({
    baseURL: User_Dashboard_Url,
    headers: { Authorization: `Bearer ${token}` },
  });

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
    if (formData.Type) form.append("Type", formData.Type);
    if (imageFile) form.append("image", imageFile);

    try {
      setSubmitting(true);
      const response = await api.put(
        `/nft/user/collection/update/${id}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        toast.success("Collection updated successfully");
        navigate("/dashboard/nfa-details");
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
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-10 md:mt-16">

          {/* Left — Image Upload */}
          <div
            className="flex items-center justify-center cursor-pointer backdrop-blur-sm bg-white/5 border border-white/30 w-full max-w-[456px] h-[300px] md:h-[440px] mx-auto lg:mx-0"
            style={{ borderRadius: "6px", borderStyle: "dashed" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
                <p className="text-white text-sm">
                  <span className="font-bold text-blue-400">Click to upload</span> or drag & drop
                </p>
                <p className="text-white/40 text-xs">PNG, JPG, WebP — max 5MB</p>
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
              <h2 className="text-white text-[22px] md:text-2xl font-semibold">Edit NFA Collection</h2>
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

            {/* Token Symbol */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base">Token Symbol</label>
              <input
                type="text"
                placeholder="e.g. HTK"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full h-12 px-3 rounded-md bg-white/10 border border-gray-600 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition"
              />
            </div>

            {/* Chain — fixed to Base */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base">Chain</label>
              <div className="flex items-center gap-2 px-2 h-12 border border-gray-600/50 rounded-md bg-white/5 cursor-not-allowed">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)" }}
                >
                  <img src={ChainIcon} alt="" className="w-[11px] h-[10px]" />
                </div>
                <span className="text-white/70 text-sm">Base</span>
                <span className="ml-auto text-white/30 text-xs">Payments in USDC</span>
              </div>
            </div>

            {/* Collection Type */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base">Collection Type</label>
              <select
                value={formData.Type}
                onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
                className="w-full h-12 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              >
                <option value="" className="text-black bg-gray-900">Select Type</option>
                <option value="NFA" className="text-black bg-gray-900">NFA</option>
                <option value="Land" className="text-black bg-gray-900">Land</option>
              </select>
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
