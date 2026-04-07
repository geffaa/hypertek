import React, { useState, useRef, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import uploadIcon from "../assets/CreateCollection/uploadIcon.png";

import toast from "react-hot-toast";

import axios from "axios";

import { Dashboard_Base_Url, getImageUrl } from "../Config";



function EditSubCollection() {

  const navigate = useNavigate();

  const location = useLocation();



  const subCollectionId = location.state?.subCollectionId;

  const parentId = location.state?.parentId;

  const existingData = location.state?.existingData;



  const fileInputRef = useRef(null);



  const [selectedImage, setSelectedImage] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [priceETH, setPriceETH] = useState("");

  const [assetType, setAssetType] = useState("NFT");

  const [nfaFrame, setNfaFrame] = useState("");

  const [minimumBuybackUSD, setMinimumBuybackUSD] = useState("");

  const [reservePriceUSD, setReservePriceUSD] = useState("");

  const [minBBError, setMinBBError] = useState("");

  const [royaltyWallet, setRoyaltyWallet] = useState("");
  const [royaltyPaymentPreference, setRoyaltyPaymentPreference] = useState("crypto");
  const [royaltyBankDetails, setRoyaltyBankDetails] = useState({
    accountHolderName: "", bankName: "", accountNumber: "", iban: "", swift: "", routingNumber: "", country: "", currency: "USD",
  });

  const [loading, setLoading] = useState(false);



  // Existing data load کرنا

  useEffect(() => {

    if (existingData) {

      setName(existingData.name || "");

      setDescription(existingData.description || "");

      setPriceETH(existingData.priceETH || existingData.price || "");

      setAssetType(existingData.assetType || (existingData.isNFA ? "NFA" : "NFT"));

      setNfaFrame(existingData.nfaFrame || "");

      setMinimumBuybackUSD(existingData.minimumBuybackUSD || "");

      setReservePriceUSD(existingData.reservePriceUSD || "");

      setRoyaltyWallet(existingData.royaltyWallet || "");
      setRoyaltyPaymentPreference(existingData.royaltyPaymentPreference || "crypto");
      if (existingData.royaltyBankDetails) {
        setRoyaltyBankDetails({ ...royaltyBankDetails, ...existingData.royaltyBankDetails });
      }

      if (existingData.image) {

        setSelectedImage(getImageUrl(existingData.image));

      }

    }

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



  const handleDragOver = (e) => e.preventDefault();



  // Validate min BB against 35% cap of listing price
  const validateMinBB = (minBB, price) => {
    const p = parseFloat(price);
    const m = parseFloat(minBB);
    if (!p || !m) { setMinBBError(""); return true; }
    const max = parseFloat((p * 0.35).toFixed(2));
    if (m > max) {
      setMinBBError(`Max allowed: $${max} (35% of $${p})`);
      return false;
    }
    setMinBBError("");
    return true;
  };

  const handleSubmit = async () => {

    if (!name.trim()) return toast.error("Name is required");

    if (!parentId) return toast.error("Parent collection not found");

    if (!subCollectionId) return toast.error("Sub-collection ID not found");

    if (!validateMinBB(minimumBuybackUSD, priceETH)) return toast.error("Minimum buyback exceeds 35% cap of listing price");



    setLoading(true);

    try {

      const formData = new FormData();

      formData.append("name", name);

      formData.append("description", description);

      formData.append("priceETH", priceETH);

      formData.append("assetType", assetType);

      if (nfaFrame) formData.append("nfaFrame", nfaFrame);

      if (minimumBuybackUSD !== "") formData.append("minimumBuybackUSD", minimumBuybackUSD);

      if (reservePriceUSD !== "") formData.append("reservePriceUSD", reservePriceUSD);

      if (royaltyWallet) formData.append("royaltyWallet", royaltyWallet);
      formData.append("royaltyPaymentPreference", royaltyPaymentPreference);
      formData.append("royaltyBankDetails", JSON.stringify(royaltyBankDetails));



      if (imageFile) {

        formData.append("image", imageFile);

      }



      const response = await axios.put(

        `${Dashboard_Base_Url}/v1/nft/parent-collection/${parentId}/sub-collection/${subCollectionId}`,

        formData,

        { headers: { "Content-Type": "multipart/form-data" } }

      );



      if (response.data.success) {

        toast.success("Sub-collection updated successfully");

        // 🔥 Dispatch event to update Category page and sidebar instantly

        console.log("Dispatching categoriesUpdated event from EditSubCollection");

        window.dispatchEvent(new Event("categoriesUpdated"));

        setTimeout(() => navigate(-1), 800);

      } else {

        toast.error(response.data.message || "Update failed");

      }

    } catch (err) {

      console.error("Update error:", err);

      if (err.response?.data?.error) {

        toast.error(err.response.data.error);

      } else if (err.response?.data?.message) {

        toast.error(err.response.data.message);

      } else {

        toast.error("Failed to update sub-collection");

      }

    } finally {

      setLoading(false);

    }

  };



  if (!parentId || !subCollectionId) {

    return (

      <div className="flex items-center justify-center h-screen bg-black text-white">

        No parent collection or sub-collection selected

      </div>

    );

  }



  return (

    <div className="mt-8 flex h-[700px] bg-black flex-col">



      {/* Header */}

      <h1 className="font-inter px-4 font-semibold text-[25px] text-white">

        Edit Collection

      </h1>



      <div className="flex justify-between items-center">

        {/* Left Form */}

        <div>

          {/* Name */}

          <div className="rounded-md p-4 flex flex-col gap-2 relative z-50 w-[400px]">

            <label className="font-inter font-normal text-[18px] text-white">

              Name

            </label>

            <input

              type="text"

              value={name}

              onChange={(e) => setName(e.target.value)}

              placeholder="Enter Name"

              className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 focus:outline-none bg-transparent"

              style={{ height: "40px" }}

            />

          </div>



          {/* Description */}

          <div className="rounded-md p-4 flex flex-col gap-2 relative z-50 mt-4 w-[400px]">

            <label className="font-inter font-normal text-[18px] text-white">

              Description

            </label>

            <textarea

              value={description}

              onChange={(e) => setDescription(e.target.value)}

              placeholder="Description"

              className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 w-full h-[93px] focus:outline-none resize-none bg-transparent"

            />

          </div>



          {/* Price */}

          <div className="rounded-md p-4 flex flex-col gap-2 mt-4 w-[200px]">

            <label className="font-inter font-normal text-[18px] text-white">

              Price (USDC)

            </label>

            <input

              type="number"

              min="0"

              value={priceETH}

              onChange={(e) => setPriceETH(e.target.value)}

              placeholder="Enter Price"

              className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-3 w-full focus:outline-none bg-transparent"

              style={{ height: "40px" }}

            />

          </div>

          {/* Asset Type Selector */}
          <div className="rounded-md p-4 flex flex-col gap-2 mt-2 w-[400px]">
            <label className="font-inter font-normal text-[18px] text-white">
              Asset Type
            </label>
            <div className="flex gap-2">
              {[
                { value: "NFA", label: "NFA", desc: "Hypertek only · Highest bonus · Buyback guaranteed", color: "#7C3AED" },
                { value: "NFC", label: "NFC", desc: "Hypertek / licensed player · Game bonus · Buyback", color: "#002AA8" },
                { value: "NFT", label: "NFT", desc: "Player created · No game bonus · No buyback", color: "#444" },
              ].map(({ value, label, desc, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAssetType(value)}
                  className="flex-1 py-2 px-2 rounded-md text-sm font-medium border transition-colors text-left"
                  style={{
                    background: assetType === value ? color : "transparent",
                    borderColor: assetType === value ? color : "rgba(255,255,255,0.2)",
                    color: "#fff",
                    opacity: assetType === value ? 1 : 0.5,
                  }}
                >
                  <div className="font-bold text-[13px]">{label}</div>
                  <div className="text-[10px] text-white/60 leading-tight mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* NFA Frame + Buyback fields (NFA and NFC only) */}
          {(assetType === "NFA" || assetType === "NFC") && (
            <>
              {assetType === "NFA" && (
                <div className="rounded-md p-4 flex flex-col gap-2 w-[400px]">
                  <label className="font-inter font-normal text-[16px] text-white/70">
                    NFA Frame Style
                  </label>
                  <select
                    value={nfaFrame}
                    onChange={(e) => setNfaFrame(e.target.value)}
                    className="text-white rounded border border-[#FFFFFFAB] px-4 py-2 focus:outline-none bg-transparent"
                    style={{ background: "#111", height: "40px" }}
                  >
                    <option value="">Default (blue ring)</option>
                    <option value="gold">Gold Frame</option>
                    <option value="silver">Silver Frame</option>
                    <option value="diamond">Diamond Frame</option>
                  </select>
                </div>
              )}

              <div className="rounded-md p-4 flex flex-col gap-2 w-[280px]">
                <label className="font-inter font-normal text-[16px] text-white/70">
                  Reserve Price (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={reservePriceUSD}
                  onChange={(e) => setReservePriceUSD(e.target.value)}
                  placeholder="e.g. 500"
                  className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-2 focus:outline-none bg-transparent"
                  style={{ height: "40px" }}
                />
              </div>

              <div className="rounded-md p-4 flex flex-col gap-2 w-[280px]">
                <label className="font-inter font-normal text-[16px] text-white/70">
                  Minimum Buyback (USD)
                  {priceETH && (
                    <span className="ml-2 text-[11px] text-yellow-400">
                      Max: ${(parseFloat(priceETH) * 0.35).toFixed(2)} (35% of ${priceETH})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={minimumBuybackUSD}
                  onChange={(e) => {
                    setMinimumBuybackUSD(e.target.value);
                    validateMinBB(e.target.value, priceETH);
                  }}
                  placeholder="e.g. 100"
                  className="text-white placeholder-[#FFFFFFAB] rounded border px-4 py-2 focus:outline-none bg-transparent"
                  style={{
                    height: "40px",
                    borderColor: minBBError ? "#EF4444" : "rgba(255,255,255,0.67)",
                  }}
                />
                {minBBError && (
                  <span className="text-red-400 text-[11px]">{minBBError}</span>
                )}
              </div>
            </>
          )}

          {/* Royalty Payment Preference */}
          <div className="rounded-md p-4 flex flex-col gap-3 w-[400px]">
            <label className="font-inter font-normal text-[16px] text-white/70">
              Artist Royalty Payment Method
            </label>
            <div className="flex gap-2">
              {["crypto", "bank"].map((opt) => (
                <button key={opt} type="button"
                  onClick={() => setRoyaltyPaymentPreference(opt)}
                  className="flex-1 py-2 rounded-md text-sm font-medium border transition-colors"
                  style={{
                    background: royaltyPaymentPreference === opt ? "#002AA8" : "transparent",
                    borderColor: royaltyPaymentPreference === opt ? "#002AA8" : "rgba(255,255,255,0.3)",
                    color: royaltyPaymentPreference === opt ? "#fff" : "rgba(255,255,255,0.5)",
                  }}>
                  {opt === "crypto" ? "🔗 Crypto Wallet" : "🏦 Bank Transfer"}
                </button>
              ))}
            </div>
          </div>

          {/* Royalty Wallet (crypto) */}
          {royaltyPaymentPreference === "crypto" && (
            <div className="rounded-md p-4 flex flex-col gap-2 w-[400px]">
              <label className="font-inter font-normal text-[16px] text-white/70">
                Artist Royalty Wallet (0x...)
              </label>
              <input
                type="text"
                value={royaltyWallet}
                onChange={(e) => setRoyaltyWallet(e.target.value)}
                placeholder="0x..."
                className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-4 py-2 focus:outline-none bg-transparent font-mono text-sm"
                style={{ height: "40px" }}
              />
            </div>
          )}

          {/* Bank details (bank) */}
          {royaltyPaymentPreference === "bank" && (
            <div className="rounded-md p-4 flex flex-col gap-3 w-[400px]">
              <label className="font-inter font-normal text-[14px] text-white/50 uppercase tracking-wider">Bank Details</label>
              {[
                { field: "accountHolderName", label: "Account Holder Name", placeholder: "Full legal name" },
                { field: "bankName",           label: "Bank Name",           placeholder: "e.g. Wise, Barclays" },
                { field: "accountNumber",      label: "Account Number",      placeholder: "Account number" },
                { field: "iban",               label: "IBAN",                placeholder: "GB00 XXXX..." },
                { field: "swift",              label: "SWIFT / BIC",         placeholder: "SWIFT code" },
                { field: "routingNumber",      label: "Routing Number (US)", placeholder: "US routing" },
                { field: "country",            label: "Country",             placeholder: "e.g. United Kingdom" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="text-white/50 text-xs mb-1 block">{label}</label>
                  <input
                    type="text"
                    value={royaltyBankDetails[field]}
                    onChange={(e) => setRoyaltyBankDetails({ ...royaltyBankDetails, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="text-white placeholder-[#FFFFFFAB] rounded border border-[#FFFFFFAB] px-3 py-2 w-full focus:outline-none bg-transparent text-sm"
                    style={{ height: "36px" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-white/50 text-xs mb-1 block">Payout Currency</label>
                <select
                  value={royaltyBankDetails.currency}
                  onChange={(e) => setRoyaltyBankDetails({ ...royaltyBankDetails, currency: e.target.value })}
                  className="text-white rounded border border-[#FFFFFFAB] px-3 py-2 w-full focus:outline-none text-sm"
                  style={{ background: "#111", height: "36px" }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
          )}

        </div>



        {/* Right Image Upload */}

        <div

          className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30 rounded-md cursor-pointer"

          style={{

            width: "324px",

            height: "312px",

            borderStyle: "dashed",

            position: "relative",

          }}

          onDrop={handleDrop}

          onDragOver={handleDragOver}

          onClick={() => fileInputRef.current?.click()}

        >

          {selectedImage ? (

            <img

              src={selectedImage}

              alt="Preview"

              className="max-w-full max-h-full rounded-md object-contain"

            />

          ) : (

            <div className="flex flex-col items-center justify-center gap-2">

              <img src={uploadIcon} alt="Upload" className="w-6 h-6" />

              <span className="text-white font-semibold text-center">

                Click to upload or drag and drop

              </span>

              <span className="text-gray-400 text-sm">

                (Leave empty to keep existing image)

              </span>

            </div>

          )}

          <input

            type="file"

            accept="image/*"

            ref={fileInputRef}

            onChange={handleFileChange}

            className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-none"

          />

        </div>

      </div>



      {/* Buttons */}

      <div className="w-full flex justify-between px-12 items-center pt-24">

        <button

          onClick={() => navigate(-1)}

          disabled={loading}

          className="flex items-center justify-center rounded-[6px] px-4 py-2"

          style={{

            width: "190px",

            height: "42px",

            background: "#666",

            border: "none",

            cursor: "pointer",

            opacity: loading ? 0.6 : 1

          }}

        >

          <span className="text-white font-inter text-[18px]">Cancel</span>

        </button>

        <button

          onClick={handleSubmit}

          disabled={loading}

          className="flex items-center justify-center rounded-[6px] px-4 py-2"

          style={{

            width: "190px",

            height: "42px",

            background: "#002AA8",

            border: "none",

            cursor: loading ? "not-allowed" : "pointer",

            opacity: loading ? 0.6 : 1

          }}

        >

          <span className="text-white font-inter text-[18px]">

            {loading ? "Updating..." : "Update Collection"}

          </span>

        </button>

      </div>

    </div>

  );

}



export default EditSubCollection;