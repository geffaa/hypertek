import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";
import { FiArrowLeft, FiInfo } from "react-icons/fi";

const F = "Inter, sans-serif";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/30 text-sm";

const labelClass = "text-white/70 text-sm font-medium mb-1.5 block";

function CreatorEarning() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    royaltyPercent: "",
    royaltyWallet: "",
    supply: "",
  });

  const [basicData, setBasicData] = useState({
    name: "",
    symbol: "",
    chain: "",
    Type: "",
    category: "",
    imagePreview: null,
    selectedFile: null,
  });

  useEffect(() => {
    if (location.state) {
      setBasicData({
        name:          location.state.formData.name          || "",
        symbol:        location.state.formData.symbol        || "",
        chain:         location.state.formData.chain         || "",
        Type:          location.state.formData.Type          || "",
        category:      location.state.formData.category      || "",
        imagePreview:  location.state.formData.imagePreview  || null,
        selectedFile:  location.state.selectedFile           || null,
      });
      setFormData({
        royaltyPercent: location.state.formData.royaltyPercent || "",
        royaltyWallet:  location.state.formData.royaltyWallet  || "",
        supply:         location.state.formData.supply         || "",
      });
    } else {
      const adminDataString = localStorage.getItem("admin_data");
      const adminId = adminDataString ? JSON.parse(adminDataString)?._id : null;
      navigate(adminId ? `/${adminId}/create-collection` : "/");
      toast.error("Please complete the basic information first");
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if ((name === "royaltyPercent" || name === "supply") && value !== "") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.royaltyPercent || !formData.royaltyWallet || !formData.supply) {
      toast.error("All fields are required");
      return;
    }
    if (formData.royaltyWallet.length !== 42) {
      toast.error("Wallet address must be exactly 42 characters");
      return;
    }

    setIsSubmitting(true);
    const loading = toast.loading("Creating collection…");

    try {
      const category = basicData.category || basicData.name.toLowerCase().trim();
      const combinedData = { ...basicData, ...formData, owner: "admin", creator: "admin", category };

      const data = new FormData();
      data.append("name",           combinedData.name);
      data.append("symbol",         combinedData.symbol);
      data.append("chain",          combinedData.chain);
      data.append("Type",           combinedData.Type);
      data.append("royaltyPercent", combinedData.royaltyPercent);
      data.append("royaltyWallet",  combinedData.royaltyWallet);
      data.append("supply",         combinedData.supply);
      data.append("owner",          combinedData.owner);
      data.append("creator",        combinedData.creator);
      data.append("category",       combinedData.category);
      if (basicData.selectedFile) data.append("image", basicData.selectedFile);

      const res = await fetch(`${Dashboard_Base_Url}/v1/nft/parent-collection/create`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Collection Created Successfully", { id: loading });
        window.dispatchEvent(new Event("categoriesUpdated"));
        const adminId = (() => { try { return JSON.parse(localStorage.getItem("admin_data"))?._id; } catch { return null; } })();
        navigate(adminId ? `/${adminId}/collections` : "/collections");
      } else {
        toast.error(result.error || "Failed to create collection", { id: loading });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong", { id: loading });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-10 pt-6 pb-16 max-w-[800px]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>
            Creator Earnings
          </h1>
          <p style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Step 2 of 2 — Set royalty and supply details for{" "}
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {basicData.name || "this collection"}
            </span>
          </p>
        </div>
      </div>

      {/* Preview + Form */}
      <div className="flex flex-col md:flex-row gap-8">

        {/* Image preview */}
        {basicData.imagePreview && (
          <div className="md:w-[200px] flex-shrink-0">
            <p className={labelClass}>Item Preview</p>
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/10">
              <img src={basicData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" }}>
              {basicData.name}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Creator Fee + Supply */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Creator Fee <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="royaltyPercent"
                  value={formData.royaltyPercent}
                  onChange={handleInputChange}
                  placeholder="e.g. 4"
                  className={inputClass}
                  style={{ paddingRight: "2.5rem" }}
                />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>%</span>
              </div>
              <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                Percentage of each secondary sale
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Supply <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="supply"
                value={formData.supply}
                onChange={handleInputChange}
                placeholder="e.g. 100"
                className={inputClass}
              />
              <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                Total number of items in this collection
              </p>
            </div>
          </div>

          {/* Royalty Wallet */}
          <div>
            <label className={labelClass}>
              Recipient Wallet Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="royaltyWallet"
              value={formData.royaltyWallet}
              onChange={handleInputChange}
              placeholder="0x… (42 characters)"
              maxLength={42}
              className={inputClass}
            />
            <p style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
              Wallet address that receives the creator royalty on each sale
            </p>
          </div>

          {/* Info */}
          <div
            className="px-4 py-3 rounded-lg"
            style={{ background: "rgba(0,42,168,0.10)", border: "1px solid rgba(0,80,255,0.18)" }}
          >
            <p style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <FiInfo size={12} /> About Creator Earnings
            </p>
            <ul style={{ fontFamily: F, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, paddingLeft: 0, listStyle: "none", margin: 0 }}>
              <li>• The creator fee is a percentage paid on every secondary marketplace sale.</li>
              <li>• Standard rate is 4% — platform takes 10–16%, buyback fund 5–10%.</li>
              <li>• Wallet must be a valid 0x EVM address (42 characters).</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5 mt-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 h-10 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium"
            >
              <FiArrowLeft size={14} />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: isSubmitting ? "rgba(255,255,255,0.05)" : "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                border: "1px solid rgba(0,80,255,0.3)",
              }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating…
                </>
              ) : (
                "Create Collection →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorEarning;
