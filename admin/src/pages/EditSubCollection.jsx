import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import uploadIcon from "../assets/CreateCollection/uploadIcon.png";
import toast from "react-hot-toast";
import axios from "axios";
import { Dashboard_Base_Url, getImageUrl } from "../Config";

const F    = "Inter, sans-serif";
const CARD = { background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 };

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  color: "white", fontFamily: F, fontSize: 13, outline: "none",
};

const labelStyle = { fontFamily: F, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" };

function EditSubCollection() {
  const navigate = useNavigate();
  const location = useLocation();

  const subCollectionId = location.state?.subCollectionId;
  const parentId        = location.state?.parentId;
  const existingData    = location.state?.existingData;

  const fileInputRef = useRef(null);

  const [selectedImage,    setSelectedImage]    = useState(null);
  const [imageFile,        setImageFile]        = useState(null);
  const [name,             setName]             = useState("");
  const [description,      setDescription]      = useState("");
  const [priceETH,         setPriceETH]         = useState("");
  const [assetType,        setAssetType]        = useState("NFT");
  const [nfaFrame,         setNfaFrame]         = useState("");
  const [minimumBuybackUSD, setMinimumBuybackUSD] = useState("");
  const [reservePriceUSD,  setReservePriceUSD]  = useState("");
  const [minBBError,       setMinBBError]       = useState("");
  const [artistId,         setArtistId]         = useState("");
  const [artists,          setArtists]          = useState([]);
  const [loading,          setLoading]          = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${Dashboard_Base_Url}/v1/admin/artists`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setArtists(res.data.artists || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!existingData) return;
    setName(existingData.name || "");
    setDescription(existingData.description || "");
    setPriceETH(existingData.priceETH || existingData.price || "");
    setAssetType(existingData.assetType || (existingData.isNFA ? "NFA" : "NFT"));
    setNfaFrame(existingData.nfaFrame || "");
    setMinimumBuybackUSD(existingData.minimumBuybackUSD || "");
    setReservePriceUSD(existingData.reservePriceUSD || "");
    setArtistId(existingData.artistId || "");
    if (existingData.image) setSelectedImage(getImageUrl(existingData.image));
  }, [existingData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const validateMinBB = (minBB, price) => {
    const p = parseFloat(price);
    const m = parseFloat(minBB);
    if (!p || !m) { setMinBBError(""); return true; }
    const max = parseFloat((p * 0.35).toFixed(2));
    if (m > max) { setMinBBError(`Max allowed: $${max} (35% of $${p})`); return false; }
    setMinBBError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!parentId)    return toast.error("Parent collection not found");
    if (!subCollectionId) return toast.error("Sub-collection ID not found");
    if (!validateMinBB(minimumBuybackUSD, priceETH)) return toast.error("Minimum buyback exceeds 35% cap");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("priceETH", priceETH);
      formData.append("assetType", assetType);
      if (nfaFrame) formData.append("nfaFrame", nfaFrame);
      if (minimumBuybackUSD !== "") formData.append("minimumBuybackUSD", minimumBuybackUSD);
      if (reservePriceUSD !== "")  formData.append("reservePriceUSD", reservePriceUSD);
      if (artistId) formData.append("artistId", artistId);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.put(
        `${Dashboard_Base_Url}/v1/nft/parent-collection/${parentId}/sub-collection/${subCollectionId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        toast.success("Item updated successfully");
        window.dispatchEvent(new Event("categoriesUpdated"));
        setTimeout(() => navigate(-1), 800);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (!parentId || !subCollectionId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, fontFamily: F, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
        No item selected — navigate here from the Items page.
      </div>
    );
  }

  const selectedArtist = artists.find(a => a._id === artistId);
  const showBuybackFields = assetType === "NFA" || assetType === "NFC";

  return (
    <div style={{ fontFamily: F, color: "white", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span style={{ fontFamily: F, fontSize: 12 }}>Back</span>
          </button>
        </div>
        <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>Edit Item</h1>
        <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          Update item details. Changes take effect immediately.
        </p>
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* Left — form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Basic Info */}
          <div style={{ ...CARD, padding: 20 }}>
            <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Basic Info</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Item name"
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, height: 80, resize: "vertical" }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Item description"
                />
              </div>
              <div style={{ maxWidth: 200 }}>
                <label style={labelStyle}>Price (USDC)</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={priceETH}
                  onChange={e => setPriceETH(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Asset Type */}
          <div style={{ ...CARD, padding: 20 }}>
            <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Asset Type</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { value: "NFA", label: "NFA", desc: "Hypertek only · Highest bonus · Buyback guaranteed", accent: "#7C3AED" },
                { value: "NFC", label: "NFC", desc: "Hypertek / licensed player · Game bonus · Buyback",  accent: "#002AA8" },
                { value: "NFT", label: "NFT", desc: "Player created · No game bonus · No buyback",        accent: "#374151" },
              ].map(({ value, label, desc, accent }) => {
                const active = assetType === value;
                return (
                  <button
                    key={value}
                    onClick={() => setAssetType(value)}
                    style={{
                      flex: 1, padding: "12px 10px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                      background: active ? `${accent}22` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? accent : "rgba(255,255,255,0.1)"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: active ? "white" : "rgba(255,255,255,0.5)" }}>{label}</div>
                    <div style={{ fontFamily: F, fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buyback / NFA fields */}
          {showBuybackFields && (
            <div style={{ ...CARD, padding: 20 }}>
              <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Buyback Settings</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {assetType === "NFA" && (
                  <div>
                    <label style={labelStyle}>NFA Frame Style</label>
                    <select
                      value={nfaFrame}
                      onChange={e => setNfaFrame(e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">Default (blue ring)</option>
                      <option value="gold">Gold Frame</option>
                      <option value="silver">Silver Frame</option>
                      <option value="diamond">Diamond Frame</option>
                    </select>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Reserve Price (USD)</label>
                    <input
                      style={inputStyle}
                      type="number"
                      min="0"
                      value={reservePriceUSD}
                      onChange={e => setReservePriceUSD(e.target.value)}
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Minimum Buyback (USD)
                      {priceETH && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: "#f59e0b" }}>
                          Max: ${(parseFloat(priceETH) * 0.35).toFixed(2)}
                        </span>
                      )}
                    </label>
                    <input
                      style={{ ...inputStyle, borderColor: minBBError ? "#EF4444" : "rgba(255,255,255,0.12)" }}
                      type="number"
                      min="0"
                      value={minimumBuybackUSD}
                      onChange={e => { setMinimumBuybackUSD(e.target.value); validateMinBB(e.target.value, priceETH); }}
                      placeholder="e.g. 100"
                    />
                    {minBBError && <p style={{ fontFamily: F, fontSize: 11, color: "#ef4444", marginTop: 4 }}>{minBBError}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Artist */}
          <div style={{ ...CARD, padding: 20 }}>
            <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              Artist Assignment
            </p>
            <label style={labelStyle}>
              Assign Artist
              <span style={{ marginLeft: 6, fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>royalty auto-dispatched on sale</span>
            </label>
            <select
              value={artistId}
              onChange={e => setArtistId(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">— No artist assigned —</option>
              {artists.map(a => (
                <option key={a._id} value={a._id}>
                  {a.name}
                  {a.paymentPreference === "crypto"
                    ? ` · ${a.walletAddress ? a.walletAddress.slice(0, 8) + "..." : "no wallet"}`
                    : ` · Bank (${a.bankDetails?.bankName || "—"})`}
                </option>
              ))}
            </select>
            {selectedArtist && (
              <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
                4% royalty → <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{selectedArtist.name}</span> via{" "}
                {selectedArtist.paymentPreference === "crypto" ? "crypto wallet" : "bank transfer"}
              </p>
            )}
          </div>

        </div>

        {/* Right — image */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
          <div style={{ ...CARD, padding: 20 }}>
            <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Item Image</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                width: "100%", aspectRatio: "1 / 1", borderRadius: 10, cursor: "pointer",
                border: "2px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <img src={uploadIcon} alt="Upload" style={{ width: 28, height: 28, opacity: 0.4 }} />
                  <span style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
                    Click or drag to upload
                  </span>
                  <span style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                    Leave empty to keep existing
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
            {selectedImage && (
              <button
                onClick={e => { e.stopPropagation(); setSelectedImage(null); setImageFile(null); }}
                style={{ marginTop: 10, width: "100%", padding: "7px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontFamily: F, fontSize: 12, cursor: "pointer" }}
              >
                Remove image
              </button>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "rgba(0,42,168,0.5)" : "#002AA8",
                color: "white", fontFamily: F, fontSize: 14, fontWeight: 600, transition: "background 0.15s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Saving…" : "Update Item"}
            </button>
            <button
              onClick={() => navigate(-1)}
              disabled={loading}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", fontFamily: F, fontSize: 14, fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EditSubCollection;
