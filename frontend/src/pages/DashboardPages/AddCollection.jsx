import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import axios from "axios";
import toast from "react-hot-toast";
import { FiArrowLeft, FiImage, FiUploadCloud, FiPackage } from "react-icons/fi";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import ImageCropModal from "../../Components/ImageCropModal";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/30 text-sm";

const labelClass = "text-white/70 text-sm font-medium mb-1.5 block";

function AddCollection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { parentId, parentName } = location.state || {};

  const { user, token } = useSelector((state) => state.auth);
  const { address: wagmiAddress } = useAccount();
  const { emailWalletAddress } = useEmailWallet();

  const [name, setName]             = useState("");
  const [description, setDesc]      = useState("");
  const [price, setPrice]           = useState("");
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setPreview]  = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [cropSrc,  setCropSrc]      = useState(null);
  const [cropFileName, setCropFileName] = useState("");
  const [assetType, setAssetType]   = useState("NFT");
  const [loading, setLoading]       = useState(false);
  const [existingItems, setExistingItems] = useState([]);
  const [loadingItems, setLoadingItems]   = useState(false);

  // Load existing sub-items
  useEffect(() => {
    if (!parentId) return;
    setLoadingItems(true);
    axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parentId}/sub-collections`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((res) => {
      setExistingItems(res.data.subCollections || []);
    }).catch(() => {}).finally(() => setLoadingItems(false));
  }, [parentId]);

  if (!parentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white/60 text-sm">No collection selected.</p>
        <button onClick={() => navigate("/dashboard/collections")}
          className="px-5 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-sm transition">
          ← Go to Collections
        </button>
      </div>
    );
  }

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
    if (!name.trim()) return toast.error("Item name is required");
    if (!imageFile) return toast.error("Please upload an image");

    const owner =
      wagmiAddress?.toLowerCase() ||
      emailWalletAddress?.toLowerCase() ||
      user?.WalletAddress?.toLowerCase() ||
      user?.MetaMaskAddress?.toLowerCase() || "";
    if (!owner) return toast.error("Connect your wallet first");

    try {
      setLoading(true);
      const form = new FormData();
      form.append("name", name.trim());
      form.append("description", description.trim());
      form.append("owner", owner);
      form.append("image", imageFile);
      form.append("assetType", assetType);
      if (price) form.append("priceETH", price);

      const { data } = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${parentId}/sub-collection`,
        form,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      toast.success(`"${name}" added to collection!`);
      // Append to existing list
      const newSub = data.newSubCollection;
      if (newSub) setExistingItems((prev) => [...prev, newSub]);
      // Reset form
      setName(""); setDesc(""); setPrice(""); setImageFile(null); setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          fileName={cropFileName}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/dashboard/collections")}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-xl">Add NFT/NFC Items</h1>
          <p className="text-white/40 text-xs mt-0.5">
            Adding to: <span className="text-white/60 font-medium">{parentName || parentId}</span>
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 text-xs mb-8">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-white/20 text-white/50 font-bold flex items-center justify-center">1</span>
          <span className="text-white/40">Set Up Collection</span>
        </span>
        <span className="text-white/20">→</span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">2</span>
          <span className="text-white font-medium">Add NFT/NFC Items</span>
        </span>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">

        {/* LEFT — Existing Items */}
        <div className="xl:w-[380px] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <FiPackage size={14} />
              Items in Storage
              <span className="text-white/30 font-normal">({existingItems.length})</span>
            </h2>
          </div>

          {loadingItems ? (
            <p className="text-white/30 text-sm">Loading...</p>
          ) : existingItems.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/3 p-6 text-center">
              <FiImage size={28} className="text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No items in storage yet.</p>
              <p className="text-white/20 text-xs mt-1">Use the form → to add your first NFT/NFC item.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {existingItems.map((item) => {
                const img = item.image ? getImageUrl(item.image) : Collectionimage;
                return (
                  <div key={item._id} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
                    <img src={img} alt={item.name}
                      className="w-full aspect-square object-cover"
                      onError={(e) => { e.target.src = Collectionimage; }} />
                    <div className="px-3 py-2">
                      <p className="text-white text-xs font-medium truncate">{item.name || "Unnamed"}</p>
                      <p className="text-white/40 text-[11px] mt-0.5">
                        {item.priceETH ? `${item.priceETH} USDC` : "No price set"}
                        {item.listed && <span className="ml-1.5 text-green-400">· Listed</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {existingItems.length > 0 && (
            <div className="mt-5 p-4 rounded-xl border border-blue-500/15 bg-blue-500/5">
              <p className="text-blue-300/80 text-xs font-medium">{existingItems.length} item{existingItems.length > 1 ? "s" : ""} in storage</p>
              <p className="text-white/40 text-xs mt-1 leading-relaxed">
                Items are stored off-chain. Go to <span className="text-white/60">My Listings</span> to list them on the marketplace — minting happens at that point.
              </p>
              <Link to="/dashboard/collection-on-sale">
                <button className="mt-3 flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.2)" }}>
                  Go to My Listings →
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT — Add Item Form */}
        <div className="flex-1 max-w-[560px]">
          <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">Add New NFT/NFC Item</h2>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image */}
            <div className="sm:w-[180px] flex-shrink-0">
              <div
                className={`relative w-full aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group
                  ${dragOver ? "border-blue-500 bg-blue-500/10" : imagePreview ? "border-white/20" : "border-white/10 hover:border-white/25 bg-white/3"}`}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById("item-file-upload").click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiUploadCloud size={20} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-3 text-center">
                    <FiImage size={18} className="text-white/30" />
                    <p className="text-white/40 text-[11px]">Click or drop</p>
                  </div>
                )}
                <input type="file" accept="image/*" id="item-file-upload"
                  onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className={labelClass}>Item Name <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. Dragon Sword #001"
                  value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Item Description</label>
                <textarea placeholder="Describe this item..." value={description}
                  onChange={(e) => setDesc(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all placeholder-white/30 text-sm resize-none" />
              </div>
              <div>
                <label className={labelClass}>Listing Price (USDC)</label>
                <div className="flex h-10 rounded-lg bg-white/5 border border-white/10 focus-within:border-blue-500 transition-all overflow-hidden">
                  <input type="number" placeholder="0.00" min="0" value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1 bg-transparent px-3 text-white text-sm outline-none placeholder-white/30" />
                  <span className="flex items-center gap-1.5 pr-3">
                    <img src="/usdc-logo.svg" alt="USDC" className="w-4 h-4 opacity-60" />
                    <span className="text-white/30 text-sm">USDC</span>
                  </span>
                </div>
              </div>

              {/* Item Type Selector */}
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
                    <span className="absolute -top-2 -right-1 text-[9px] px-1.5 py-0.5 rounded bg-yellow-600/70 text-yellow-200 font-semibold">Soon</span>
                  </button>
                </div>
                <p className="text-white/25 text-[11px] mt-1.5">NFC creation requires a license — coming in a future update.</p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex items-center gap-2 px-5 h-9 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
                  {loading ? (
                    <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Adding...</>
                  ) : "+ Add Item"}
                </button>
                <button onClick={() => navigate("/dashboard/collections")}
                  className="px-4 h-9 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCollection;
