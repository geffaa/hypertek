import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
  const [maxSupply, setMaxSupply] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setPreview] = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [cropSrc,       setCropSrc]       = useState(null);
  const [cropFileName,  setCropFileName]  = useState("");
  const [originalFile,  setOriginalFile]  = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image file");
    if (file.size > 25 * 1024 * 1024) return toast.error("Image must be under 25MB");
    setCropFileName(file.name);
    setOriginalFile(file);
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
      form.append("maxSupply", Math.max(1, parseInt(maxSupply, 10) || 1));
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
          originalFile={originalFile}
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
          <h1 className="text-white font-semibold text-xl">{t("dashboard.createNFT.title", "Create NFT/NFC")}</h1>
          <p className="text-white/40 text-xs mt-0.5">{t("dashboard.createNFT.subtitle", "Item is saved in storage — list it on the marketplace when ready.")}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT — Image Upload */}
        <div className="lg:w-[280px] flex-shrink-0">
          <p className={labelClass}>{t("dashboard.createNFT.itemImage", "Item Image")} <span className="text-red-400">*</span></p>
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
                  <span className="text-white text-xs font-medium">{t("dashboard.createNFT.changeImage", "Change Image")}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FiImage size={20} className="text-white/40" />
                </div>
                <div>
                  <p className="text-white/60 text-sm font-medium">{t("dashboard.createNFT.dropImage", "Drop image here")}</p>
                  <p className="text-white/30 text-xs mt-1">{t("dashboard.createNFT.clickBrowse", "or click to browse")}</p>
                </div>
                <p className="text-white/20 text-[11px]">{t("dashboard.createNFT.maxSize", "PNG, JPG, WebP · max 25MB")}</p>
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
            <label className={labelClass}>{t("dashboard.createNFT.itemName", "Item Name")} <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder={t("dashboard.createNFT.namePlaceholder", "e.g. Dragon Sword #001")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>{t("dashboard.createNFT.itemDescription", "Item Description")}</label>
            <textarea
              placeholder={t("dashboard.createNFT.descPlaceholder", "Describe your item...")}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all placeholder-white/30 text-sm resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>{t("dashboard.createNFT.storageBox", "Storage Box (Category)")} <span className="text-red-400">*</span></label>
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
              {t("dashboard.createNFT.storageBoxHint", "Item is placed into this storage box until listed on the marketplace.")}
            </p>
          </div>


          {/* Asset Type */}
          <div>
            <label className={labelClass}>{t("dashboard.createNFT.assetType", "Asset Type")}</label>
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
                  {t("dashboard.createNFT.nfcSoon", "Soon")}
                </span>
              </button>
            </div>
            <p className="text-white/25 text-[11px] mt-1.5">
              {t("dashboard.createNFT.nfcHint", "NFC creation requires a license — coming in a future update.")}
            </p>
          </div>

          {/* Max Supply */}
          <div>
            <label className={labelClass}>{t("dashboard.createNFT.maxSupply", "Max Supply")}</label>
            <input
              type="number"
              min={1}
              value={maxSupply}
              onChange={(e) => setMaxSupply(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className={`${inputClass} w-32`}
            />
            <p className="text-white/25 text-[11px] mt-1">
              {t("dashboard.createNFT.maxSupplyHint", "Set to 1 for a unique NFT. Set higher to sell multiple editions — each buyer gets their own minted token.")}
            </p>
          </div>

          {/* Blockchain info */}
          <div>
            <label className={labelClass}>{t("dashboard.createNFT.blockchain", "Blockchain")}</label>
            <div className="w-full h-10 px-3 rounded-lg bg-white/3 border border-white/8 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                <path d="M55.494 85.816C72.3 85.816 85.97 72.147 85.97 55.341c0-16.806-13.67-30.475-30.476-30.475-15.764 0-28.714 11.98-30.285 27.334h40.04v6.282H25.21c1.571 15.354 14.521 27.334 30.285 27.334z" fill="white"/>
              </svg>
              <span className="text-white/60 text-sm font-medium">Base</span>
              <span className="ml-auto text-white/25 text-xs">{t("dashboard.createNFT.blockchainNote", "Payments in USDC · Minted on listing")}</span>
            </div>
          </div>

          {/* Listing channels info note */}
          <div
            className="px-4 py-3 rounded-lg"
            style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.2)" }}
          >
            <p className="text-white/70 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <span>ℹ</span> {t("dashboard.createNFT.howListingTitle", "How listing works")}
            </p>
            <ul className="text-white/45 text-[11px] space-y-1 leading-relaxed">
              <li>• {t("dashboard.createNFT.howListing1", "Save your item to storage first — no gas / fees required.")}</li>
              <li>• {t("dashboard.createNFT.howListing2", "Choose your starting venue: list on the Marketplace (fixed price) or open an Auction straight away.")}</li>
              <li>• {t("dashboard.createNFT.howListing3", "Once active in one venue, you can add the others simultaneously — the first sale cancels the rest.")}</li>
              <li>• {t("dashboard.createNFT.howListing4", "For edition items (Max Supply > 1), one card appears in the Marketplace — each purchase mints a fresh token and reduces the available count.")}</li>
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
                {t("dashboard.createNFT.connectWalletNote", "Connect your wallet to save items to storage.")}
              </p>
              <button
                onClick={() => openConnectModal?.()}
                className="px-3 h-7 rounded-lg text-xs font-semibold text-white flex-shrink-0 transition-all hover:brightness-110"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.4)" }}
              >
                {t("dashboard.createNFT.connectWallet", "Connect Wallet")}
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
              {t("dashboard.createNFT.cancel", "Cancel")}
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
                  {t("dashboard.createNFT.saving", "Saving...")}
                </>
              ) : !walletConnected ? (
                <><FiLink size={14} /> {t("dashboard.createNFT.connectWallet", "Connect Wallet")}</>
              ) : (
                t("dashboard.createNFT.saveToStorage", "Save to Storage →")
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateNFT;
