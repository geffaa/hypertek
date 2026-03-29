import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";
import { FiUploadCloud, FiImage, FiArrowLeft } from "react-icons/fi";

const CATEGORIES = [
  "skins", "military badges and collectables", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases",
];

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/30 text-sm";

const labelClass = "text-white/70 text-sm font-medium mb-1.5 block";

function AddUserCollection() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { address: wagmiAddress } = useAccount();
  const { emailWalletAddress } = useEmailWallet();

  const [name, setName]             = useState("");
  const [symbol, setSymbol]         = useState("");
  const [category, setCategory]     = useState(CATEGORIES[0]);
  const [supply, setSupply]         = useState("1");
  const [price, setPrice]           = useState("");
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [dragOver, setDragOver]     = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image file");
    if (file.size > 10 * 1024 * 1024) return toast.error("Image must be under 10MB");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!symbol.trim()) return toast.error("Token symbol is required");
    if (!imageFile) return toast.error("Please upload a collection image");

    const owner = wagmiAddress?.toLowerCase() || emailWalletAddress?.toLowerCase() || user?.WalletAddress || user?.MetaMaskAddress || "";
    if (!owner) return toast.error("No wallet address found. Please connect your wallet.");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("symbol", symbol.trim().toUpperCase());
      formData.append("chain", "Base");
      formData.append("owner", owner);
      formData.append("category", category);
      formData.append("image", imageFile);
      if (price) formData.append("priceETH", price);
      if (supply) formData.append("supply", supply);

      const { data } = await axios.post(`${BACKEND_BASE_URL}/api/v1/nft/parent-collection/create`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      toast.success("Collection created! Now add items to it.");
      navigate("/dashboard/add-nfts", {
        state: { parentId: data.doc._id, parentName: data.doc.collection?.name },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/dashboard/collections")}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-xl">Create New Collection</h1>
          <p className="text-white/40 text-xs mt-0.5">Set up a parent collection. Add individual items after creation.</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full overflow-hidden">

        {/* Step indicator */}
        <div className="px-0 py-3 border-b border-white/5 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">1</span><span className="text-white font-medium">Create Collection</span></span>
          <span className="text-white/20">→</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-white/10 text-white/30 font-bold flex items-center justify-center">2</span><span className="text-white/30">Add Items</span></span>
        </div>

        <div className="flex flex-col lg:flex-row">

          {/* LEFT — Image Upload */}
          <div className="lg:w-[300px] flex-shrink-0 pt-6 pb-6 pr-8 border-b lg:border-b-0 lg:border-r border-white/5">
            <p className={labelClass}>Collection Image <span className="text-red-400">*</span></p>
            <div
              className={`relative w-full aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group
                ${dragOver ? "border-blue-500 bg-blue-500/10" : imagePreview ? "border-white/20" : "border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/5"}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => document.getElementById("add-collection-file-upload").click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <FiUploadCloud size={24} className="text-white" />
                    <span className="text-white text-xs font-medium">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FiImage size={20} className="text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-medium">Drop image here</p>
                    <p className="text-white/30 text-xs mt-1">or click to browse</p>
                  </div>
                  <p className="text-white/20 text-[11px]">PNG, JPG, WebP · max 10MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                id="add-collection-file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {imageFile && (
              <p className="text-white/30 text-[11px] mt-2 text-center truncate">{imageFile.name}</p>
            )}
          </div>

          {/* RIGHT — Form */}
          <div className="flex-1 pl-8 pt-6 pb-6 flex flex-col gap-5">

            {/* Row 1: Name + Symbol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Collection Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. HyperTek Skins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="symbol" className={labelClass}>
                  Token Symbol <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="symbol"
                  placeholder="e.g. HTSK"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className={inputClass}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Chain — read only */}
            <div>
              <label className={labelClass}>Blockchain</label>
              <div className="w-full h-10 px-3 rounded-lg bg-white/3 border border-white/8 flex items-center gap-2">
                {/* Base chain logo */}
                <svg width="16" height="16" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                  <path d="M55.494 85.816C72.3 85.816 85.97 72.147 85.97 55.341c0-16.806-13.67-30.475-30.476-30.475-15.764 0-28.714 11.98-30.285 27.334h40.04v6.282H25.21c1.571 15.354 14.521 27.334 30.285 27.334z" fill="white"/>
                </svg>
                <span className="text-white/60 text-sm font-medium">Base</span>
                <span className="ml-auto text-white/25 text-xs">Payments in USDC</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className={labelClass}>Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputClass} capitalize appearance-none`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffffff60' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0d0d1a] capitalize">{cat}</option>
                ))}
              </select>
            </div>

            {/* Supply */}
            <div>
              <label className={labelClass}>Supply</label>
              <input
                type="number"
                min="1"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                className={inputClass}
                placeholder="1"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className={labelClass}>Default Price (USDC)</label>
              <div className="flex h-10 rounded-lg bg-white/5 border border-white/10 focus-within:border-blue-500 transition-all overflow-hidden">
                <input
                  type="number"
                  id="price"
                  placeholder="0.00"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-white text-sm outline-none placeholder-white/30"
                />
                <span className="flex items-center pr-3 gap-1.5">
                  <img src="/usdc-logo.svg" alt="USDC" className="w-4 h-4 opacity-60" />
                  <span className="text-white/30 text-sm font-medium">USDC</span>
                </span>
              </div>
              <p className="text-white/25 text-[11px] mt-1">Optional — can be set individually per item</p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-0 py-6 border-t border-white/5 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/dashboard/collections")}
            className="flex items-center gap-2 px-5 h-10 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium"
          >
            <FiArrowLeft size={14} />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: loading ? undefined : "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating...
              </>
            ) : (
              "Create Collection →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUserCollection;
