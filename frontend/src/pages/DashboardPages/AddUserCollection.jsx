import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";
import { FiUploadCloud, FiImage, FiArrowLeft, FiLink } from "react-icons/fi";
import ImageCropModal from "../../Components/ImageCropModal";

const CATEGORIES = [
  "skins", "military badges", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases",
  "general",
];

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/30 text-sm";

const labelClass = "text-white/70 text-sm font-medium mb-1.5 block";

function CreateNFT() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { address: wagmiAddress } = useAccount();
  const { emailWalletAddress } = useEmailWallet();
  const { openConnectModal } = useConnectModal();

  const owner =
    wagmiAddress?.toLowerCase() ||
    emailWalletAddress?.toLowerCase() ||
    user?.WalletAddress?.toLowerCase() ||
    user?.MetaMaskAddress?.toLowerCase() || "";
  const walletConnected = !!owner;

  const [name, setName]           = useState("");
  const [description, setDesc]    = useState("");
  const [category, setCategory]   = useState(CATEGORIES[0]);
  const [assetType, setAssetType] = useState("NFT");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setPreview] = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [cropSrc,  setCropSrc]    = useState(null);
  const [cropFileName, setCropFileName] = useState("");

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image file");
    if (file.size > 10 * 1024 * 1024) return toast.error("Image must be under 10MB");
    setCropFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = (croppedFile) => {
    setCropSrc(null);
    setImageFile(croppedFile);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(croppedFile);
  };

  const handleSubmit = async () => {
    if (!walletConnected) return openConnectModal?.();
    if (!name.trim()) return toast.error("Item name is required");
    if (!imageFile)   return toast.error("Please upload an image");
    if (!owner) return toast.error("No wallet address found. Please connect your wallet.");

    try {
      setLoading(true);
      const form = new FormData();
      form.append("name", name.trim());
      form.append("description", description.trim());
      form.append("category", category);
      form.append("owner", owner);
      form.append("assetType", assetType);
      form.append("image", imageFile);

      await axios.post(`${BACKEND_BASE_URL}/api/v1/nft/item/create`, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      toast.success(`"${name}" saved to storage!`);
      navigate("/dashboard/collections");
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        toast.error("Request timed out — server is taking too long. Please try again.");
      } else {
        toast.error(err.response?.data?.error || "Failed to save item. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 xl:px-16 py-8 max-w-[1440px]">

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          fileName={cropFileName}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/dashboard/collections")}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-xl">Create NFT/NFC</h1>
          <p className="text-white/40 text-xs mt-0.5">Item is saved in storage — list it on the marketplace when ready.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT — Image Upload */}
        <div className="lg:w-[280px] flex-shrink-0">
          <p className={labelClass}>Item Image <span className="text-red-400">*</span></p>
          <div
            className={`relative w-full aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group
              ${dragOver ? "border-blue-500 bg-blue-500/10" : imagePreview ? "border-white/20" : "border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/5"}`}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById("create-nft-img").click()}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
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
              id="create-nft-img"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
          {imageFile && (
            <p className="text-white/30 text-[11px] mt-2 text-center truncate">{imageFile.name}</p>
          )}
        </div>

        {/* RIGHT — Form */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Name */}
          <div>
            <label className={labelClass}>Item Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Dragon Sword #001"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Item Description</label>
            <textarea
              placeholder="Describe your item..."
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all placeholder-white/30 text-sm resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Storage Box (Category) <span className="text-red-400">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputClass} capitalize appearance-none`}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffffff60' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0d0d1a] capitalize">{cat}</option>
              ))}
            </select>
            <p className="text-white/25 text-[11px] mt-1">
              Item is placed into this storage box until listed on the marketplace.
            </p>
          </div>


          {/* Asset Type */}
          <div>
            <label className={labelClass}>Asset Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAssetType("NFT")}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all border ${
                  assetType === "NFT"
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                NFT
              </button>
              <button
                type="button"
                disabled
                data-tooltip="License required — coming soon"
                className="flex-1 h-9 rounded-lg text-sm font-medium border border-white/10 text-white/20 cursor-not-allowed relative"
              >
                NFC
                <span className="absolute -top-2 -right-1 text-[9px] px-1.5 py-0.5 rounded bg-yellow-600/70 text-yellow-200 font-semibold">
                  Soon
                </span>
              </button>
            </div>
            <p className="text-white/25 text-[11px] mt-1.5">
              NFC creation requires a license — coming in a future update.
            </p>
          </div>

          {/* Blockchain info */}
          <div>
            <label className={labelClass}>Blockchain</label>
            <div className="w-full h-10 px-3 rounded-lg bg-white/3 border border-white/8 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                <path d="M55.494 85.816C72.3 85.816 85.97 72.147 85.97 55.341c0-16.806-13.67-30.475-30.476-30.475-15.764 0-28.714 11.98-30.285 27.334h40.04v6.282H25.21c1.571 15.354 14.521 27.334 30.285 27.334z" fill="white"/>
              </svg>
              <span className="text-white/60 text-sm font-medium">Base</span>
              <span className="ml-auto text-white/25 text-xs">Payments in USDC · Minted on listing</span>
            </div>
          </div>

          {/* Listing channels info note */}
          <div
            className="px-4 py-3 rounded-lg"
            style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.2)" }}
          >
            <p className="text-white/70 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <span>ℹ</span> How listing works
            </p>
            <ul className="text-white/45 text-[11px] space-y-1 leading-relaxed">
              <li>• Save your item to storage first — no gas / fees required.</li>
              <li>• Then list it on the <span className="text-white/65 font-medium">Marketplace</span> (fixed price).</li>
              <li>• Once listed on the <span className="text-white/65 font-medium">Marketplace</span>, open it for <span className="text-white/65 font-medium">Auction</span> (timed bidding with reserve), or offer it in <span className="text-white/65 font-medium">Trade</span>.</li>
              <li>• All three channels can be active at the same time — the first sale cancels the rest.</li>
            </ul>
          </div>

          {/* Wallet warning banner */}
          {!walletConnected && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}
            >
              <FiLink size={14} className="text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-300/80 text-xs flex-1">
                Connect your wallet to save items to storage.
              </p>
              <button
                onClick={() => openConnectModal?.()}
                className="px-3 h-7 rounded-lg text-xs font-semibold text-white flex-shrink-0 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.4)" }}
              >
                Connect Wallet
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5 mt-1">
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
                  Saving...
                </>
              ) : !walletConnected ? (
                <><FiLink size={14} /> Connect Wallet</>
              ) : (
                "Save to Storage →"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateNFT;
