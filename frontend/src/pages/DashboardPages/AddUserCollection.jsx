import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../../assets/images/CreateCollection/ChainIcon.png";
import { BACKEND_BASE_URL } from "../../Config";

const CATEGORIES = [
  "skins", "military badges and collectables", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases",
];

function AddUserCollection() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [name, setName]             = useState("");
  const [symbol, setSymbol]         = useState("");
  const [chain, setChain]           = useState("Base");
  const [category, setCategory]     = useState(CATEGORIES[0]);
  const [creatorFee, setCreatorFee] = useState("0");
  const [supply, setSupply]         = useState("1");
  const [price, setPrice]           = useState("");
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading]       = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!symbol.trim()) return toast.error("Token symbol is required");
    if (!imageFile) return toast.error("Please upload a collection image");

    const owner = user?.WalletAddress || user?.MetaMaskAddress || user?.Email || "unknown";

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("symbol", symbol.trim().toUpperCase());
      formData.append("chain", chain);
      formData.append("owner", owner);
      formData.append("category", category);
      formData.append("image", imageFile);
      if (price) formData.append("priceETH", price);
      if (supply) formData.append("supply", supply);
      if (creatorFee) formData.append("creatorFee", creatorFee);

      await axios.post(`${BACKEND_BASE_URL}/api/v1/nft/parent-collection/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Collection created successfully!");
      navigate("/dashboard/collections");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-12 flex flex-col gap-6 overflow-x-hidden">

      {/* Header */}
      <h1
        className="font-inter px-2 md:px-4 font-semibold text-[22px] md:text-[25px] text-white z-10"
        style={{ lineHeight: "30px", letterSpacing: "0%" }}
      >
        Add Your Collection
      </h1>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          {/* Name Field */}
          <div className="rounded-md p-2 md:p-4 flex flex-col gap-2 relative z-50 w-full max-w-[434px]">
            <label htmlFor="name" className="font-inter font-normal text-[18px] text-white">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Add Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-white placeholder-[#FFFFFFAB] bg-white/10 border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors rounded px-4 h-10 w-full focus:outline-none"
            />
          </div>

          {/* Token Symbol */}
          <div className="w-full max-w-[405px] h-auto flex flex-col gap-[14px] mt-4 md:mt-8 mx-2 z-10">
            <label
              htmlFor="symbol"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "18px", lineHeight: "100%", color: "white" }}
            >
              Token Symbol
            </label>
            <input
              type="text"
              id="symbol"
              placeholder="e.g. HTSK"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full h-10 px-3 z-10 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
            />
          </div>

          {/* Chain */}
          <div className="w-full max-w-[405px] h-auto flex flex-col gap-[14px] mt-4 md:mt-8 mx-2">
            <label
              htmlFor="chain"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "18px", lineHeight: "100%", color: "white" }}
            >
              Chain
            </label>
            <div className="flex items-center z-10 rounded-md bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors px-2">
              <div
                className="w-[17px] h-[17px] rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)" }}
              >
                <img src={ChainIcon} alt="" className="w-[10.62px] h-[9.78px]" />
              </div>
              <input
                type="text"
                id="chain"
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full h-10 px-3 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div className="w-full max-w-[405px] flex flex-col gap-[14px] mt-4 md:mt-8 mx-2">
            <label
              htmlFor="category"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "18px", lineHeight: "100%", color: "white" }}
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors capitalize"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a0a1a] capitalize">{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row m-2 md:m-3 justify-between gap-4 mt-5">
            {/* Creator Fee */}
            <div className="flex flex-col gap-2 w-full sm:w-[170px]">
              <h1 className="font-inter font-normal text-[18px] m-0 text-white">Creator Fee</h1>
              <div className="flex z-10 bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors items-center rounded-md h-[48px] px-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={creatorFee}
                  onChange={(e) => setCreatorFee(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
                />
                <span className="text-[18px] text-white/70 px-2">%</span>
              </div>
              <p className="text-[14px] text-white/70 font-inter m-0">Support 100% total fee</p>
            </div>

            {/* Supply */}
            <div className="flex flex-col gap-2 w-full sm:w-[170px]">
              <h1 className="font-inter font-normal text-[18px] m-0 text-white">Supply</h1>
              <div className="flex bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors items-center rounded-md h-[48px] px-3">
                <input
                  type="number"
                  min="1"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
                />
              </div>
            </div>
          </div>

          {/* Price Field */}
          <div className="rounded-md p-2 md:p-4 flex flex-col gap-2 w-full max-w-[434px]">
            <label htmlFor="price" className="font-inter font-normal text-[18px] text-white">
              Price (USDC)
            </label>
            <input
              type="number"
              id="price"
              placeholder="Add Price"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="text-white bg-white/10 border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors placeholder-[#FFFFFFAB] rounded px-4 h-10 w-full focus:outline-none"
            />
          </div>
        </div>

        {/* right side - image upload */}
        <div
          className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30 rounded-md w-full max-w-[324px] h-[312px] mx-auto lg:mx-0"
          style={{ borderStyle: "dashed", position: "relative", cursor: "pointer" }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("add-collection-file-upload").click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-w-full max-h-full rounded-md object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
              <div className="relative w-[240px] h-[40px] flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  id="add-collection-file-upload"
                  onChange={handleFileChange}
                  className="absolute w-full h-full opacity-0 pointer-events-none"
                />
                <span className="text-white font-semibold text-center">
                  Click to upload or drag and drop
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row justify-between px-4 md:px-12 items-center gap-4 pt-12 md:pt-24 z-10">
        <button
          onClick={() => navigate("/dashboard/collections")}
          className="flex items-center justify-center rounded-[6px] px-4 py-2 w-full sm:w-[190px] h-[42px] bg-[#002AA8] text-white border-none cursor-pointer"
        >
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "18px" }}>
            Back
          </span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center rounded-[6px] px-4 py-2 w-full sm:w-[190px] h-[42px] bg-[#002AA8] disabled:opacity-50 text-white border-none cursor-pointer"
        >
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "18px" }}>
            {loading ? "Creating..." : "Add to Collection"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default AddUserCollection;
