import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { FiUploadCloud, FiImage, FiArrowLeft, FiInfo } from "react-icons/fi";
import { BACKEND_BASE_URL, Dashboard_Base_Url } from "../Config";
import ImageCropModal from "./common/ImageCropModal";

const CATEGORIES = [
  "skins", "military badges", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases",
  "general",
];

const NFA_FRAMES = [
  { value: "",        label: "None (default)" },
  { value: "gold",    label: "Gold" },
  { value: "silver",  label: "Silver" },
  { value: "diamond", label: "Diamond" },
  { value: "platinum",label: "Platinum" },
];

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/30 text-sm";

const labelClass = "text-white/70 text-sm font-medium mb-1.5 block";

function CreateCollection() {
  const navigate  = useNavigate();
  const admin     = useSelector((state) => state.admin.admin);
  const token     = localStorage.getItem("token");

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name,       setName]       = useState("");
  const [description,setDesc]       = useState("");
  const [category,   setCategory]   = useState(CATEGORIES[0]);
  const [assetType,  setAssetType]  = useState("NFT");
  const [imageFile,  setImageFile]  = useState(null);
  const [imagePreview, setPreview]  = useState(null);
  const [dragOver,      setDragOver]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [cropSrc,       setCropSrc]       = useState(null);
  const [cropFileName,  setCropFileName]  = useState("");
  const [originalFile,  setOriginalFile]  = useState(null);

  // NFA / NFC admin-only fields
  const [minBuyback,  setMinBuyback]  = useState("");
  const [reservePrice,setReservePrice]= useState("");
  const [nfaFrame,    setNfaFrame]    = useState("");
  const [artistId,    setArtistId]    = useState("");
  const [artists,     setArtists]     = useState([]);

  useEffect(() => {
    axios
      .get(`${Dashboard_Base_Url}/v1/admin/artists`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setArtists(res.data.artists || []))
      .catch(() => {});
  }, []);

  const isNFA = assetType === "NFA";
  const isNFC = assetType === "NFC";

  // ── Image handling ──────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image file");
    if (file.size > 25 * 1024 * 1024) return toast.error("Image must be under 25MB");
    setOriginalFile(file);
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

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim())  return toast.error("Item name is required");
    if (!imageFile)    return toast.error("Please upload an image");

    // NFA-specific validation
    if (isNFA) {
      if (!minBuyback || parseFloat(minBuyback) <= 0)
        return toast.error("NFA requires a Minimum Buyback price");
      if (!reservePrice || parseFloat(reservePrice) <= 0)
        return toast.error("NFA requires a Reserve Price");
      const maxAllowed = parseFloat((parseFloat(reservePrice) * 0.35).toFixed(2));
      if (parseFloat(minBuyback) > maxAllowed)
        return toast.error(`Min Buyback ($${minBuyback}) exceeds 35% cap of Reserve Price. Max: $${maxAllowed}`);
    }

    const owner = (import.meta.env.VITE_PLATFORM_WALLET_ADDRESS || "").toLowerCase();
    if (!owner)
      return toast.error("Platform wallet not configured — set VITE_PLATFORM_WALLET_ADDRESS in .env");

    try {
      setLoading(true);
      const form = new FormData();
      form.append("name",        name.trim());
      form.append("description", description.trim());
      form.append("category",    category);
      form.append("assetType",   assetType);
      form.append("owner",       owner);
      form.append("image",       imageFile);

      if (artistId) form.append("artistId", artistId);
      if (isNFA || isNFC) {
        if (minBuyback)   form.append("minimumBuybackUSD", minBuyback);
        if (reservePrice) form.append("reservePriceUSD",   reservePrice);
        if (nfaFrame)     form.append("nfaFrame",          nfaFrame);
      }

      await axios.post(`${BACKEND_BASE_URL}/api/v1/nft/item/create`, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      toast.success(`"${name}" created and saved to ${category} storage`);
      navigate(`/${admin?._id}/items`);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        toast.error("Request timed out — please try again.");
      } else {
        toast.error(err.response?.data?.error || "Failed to create item. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 md:px-10 pt-6 pb-16">

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
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-[22px]">Create Item</h1>
          <p className="text-white/40 text-xs mt-0.5">
            Admin can create NFT, NFC, or NFA — item is saved to storage until you list it from the Items page.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT — Image Upload */}
        <div className="lg:w-[280px] flex-shrink-0">
          <p className={labelClass}>Item Image <span className="text-red-400">*</span></p>
          <div
            className={`relative w-full aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group
              ${dragOver ? "border-blue-500 bg-blue-500/10" : imagePreview ? "border-white/20" : "border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/5"}`}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById("admin-create-img").click()}
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
                <p className="text-white/20 text-[11px]">PNG, JPG, WebP · max 25MB</p>
              </div>
            )}
            <input
              type="file" accept="image/*"
              id="admin-create-img"
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
              placeholder="Describe this item..."
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
            <label className={labelClass}>Asset Type <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              {[
                { key: "NFT", label: "NFT",  desc: "No in-game bonus" },
                { key: "NFC", label: "NFC",  desc: "Has in-game bonus" },
                { key: "NFA", label: "NFA",  desc: "Admin only · Guaranteed min buyback" },
              ].map(({ key, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAssetType(key)}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-0.5 ${
                    assetType === key
                      ? key === "NFA"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                        : "bg-white/10 border-white/30 text-white"
                      : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] font-normal opacity-60">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── NFA / NFC Admin Fields ────────────────────────────────────── */}
          {(isNFA || isNFC) && (
            <div className="flex flex-col gap-4 px-4 py-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-amber-300/80 text-xs font-semibold flex items-center gap-1.5">
                <FiInfo size={13} />
                {isNFA ? "NFA Settings" : "NFC Settings"} — admin-only fields
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Reserve Price */}
                <div>
                  <label className={labelClass}>
                    Reserve Price (USD) {isNFA && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 500.00"
                      value={reservePrice}
                      onChange={(e) => setReservePrice(e.target.value)}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                  <p className="text-white/25 text-[11px] mt-1">Listing / marketplace price</p>
                </div>

                {/* Min Buyback */}
                <div>
                  <label className={labelClass}>
                    Min Buyback (USD) {isNFA && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 100.00"
                      value={minBuyback}
                      onChange={(e) => setMinBuyback(e.target.value)}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                  <p className="text-white/25 text-[11px] mt-1">
                    Max 35% of reserve price
                    {reservePrice && minBuyback
                      ? ` · cap: $${(parseFloat(reservePrice) * 0.35).toFixed(2)}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* NFA Frame (NFA only) */}
              {isNFA && (
                <div>
                  <label className={labelClass}>NFA Frame Style</label>
                  <select
                    value={nfaFrame}
                    onChange={(e) => setNfaFrame(e.target.value)}
                    className={`${inputClass} appearance-none`}
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffffff60' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  >
                    {NFA_FRAMES.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-[#0d0d1a]">{label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Artist dropdown */}
          <div>
            <label className={labelClass}>Assign Artist <span className="text-white/30 font-normal text-[11px]">(royalty auto-dispatched on sale)</span></label>
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className={`${inputClass} appearance-none`}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffffff60' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              <option value="">— No artist assigned —</option>
              {artists.map(a => (
                <option key={a._id} value={a._id} className="bg-[#0d0d1a]">
                  {a.name}
                  {a.paymentPreference === "crypto"
                    ? ` · ${a.walletAddress ? a.walletAddress.slice(0, 8) + "..." : "no wallet"}`
                    : ` · Bank (${a.bankDetails?.bankName || "—"})`}
                </option>
              ))}
            </select>
            {artistId ? (() => {
              const a = artists.find(x => x._id === artistId);
              if (!a) return null;
              return (
                <p className="text-white/30 text-[11px] mt-1.5">
                  4% royalty → <span className="text-white/55 font-medium">{a.name}</span> via{" "}
                  {a.paymentPreference === "crypto"
                    ? <span className="text-white/55">{a.walletAddress ? `${a.walletAddress.slice(0, 10)}...${a.walletAddress.slice(-6)}` : "no wallet set"}</span>
                    : <span className="text-white/55">bank transfer ({a.bankDetails?.bankName || "—"})</span>
                  }
                </p>
              );
            })() : (
              <p className="text-white/25 text-[11px] mt-1">Leave blank if no external artist for this item.</p>
            )}
          </div>

          {/* Blockchain + owner info */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Blockchain</label>
            <div className="w-full h-10 px-3 rounded-lg bg-white/[0.03] border border-white/8 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                <path d="M55.494 85.816C72.3 85.816 85.97 72.147 85.97 55.341c0-16.806-13.67-30.475-30.476-30.475-15.764 0-28.714 11.98-30.285 27.334h40.04v6.282H25.21c1.571 15.354 14.521 27.334 30.285 27.334z" fill="white"/>
              </svg>
              <span className="text-white/60 text-sm font-medium">Base</span>
              <span className="ml-auto text-white/25 text-xs">Payments in USDC · Minted on listing</span>
            </div>
            {import.meta.env.VITE_PLATFORM_WALLET_ADDRESS ? (
              <p className="text-white/25 text-[11px]">
                Initial owner: <span className="font-mono text-white/40">{import.meta.env.VITE_PLATFORM_WALLET_ADDRESS.slice(0, 10)}...{import.meta.env.VITE_PLATFORM_WALLET_ADDRESS.slice(-6)}</span> (platform wallet)
              </p>
            ) : (
              <p className="text-red-400/60 text-[11px]">⚠ VITE_PLATFORM_WALLET_ADDRESS not set — item cannot be created.</p>
            )}
          </div>

          {/* Info box */}
          <div
            className="px-4 py-3 rounded-lg"
            style={{ background: "rgba(0,42,168,0.10)", border: "1px solid rgba(0,80,255,0.18)" }}
          >
            <p className="text-white/70 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <FiInfo size={12} /> How item creation works
            </p>
            <ul className="text-white/40 text-[11px] space-y-1 leading-relaxed">
              <li>• Item is saved to storage — no gas fees at this stage.</li>
              <li>• From the <span className="text-white/60 font-medium">Items</span> page, click <span className="text-white/60 font-medium">List</span> to set a price and put it for sale on the public marketplace.</li>
              <li>• <span className="text-white/60 font-medium">NFA</span> (Non-Fungible Asset) — created only by Hyper Tek. Guaranteed minimum buy-back: it can never be sold below that value (buy-back is capped at 35% of the reserve price). Carries the biggest in-game bonuses. Sell only — NFAs cannot be traded.</li>
              <li>• <span className="text-white/60 font-medium">NFC</span> (Collectible) — created by Hyper Tek or licensed players. Has in-game bonuses.</li>
              <li>• <span className="text-white/60 font-medium">NFT</span> (Token) — created by anyone. No in-game bonus.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5 mt-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 h-10 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium"
            >
              <FiArrowLeft size={14} />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </>
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

export default CreateCollection;
