import React, { useState } from "react";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../../assets/images/CreateCollection/ChainIcon.png";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User_Dashboard_Url } from "../../Config";
import toast from "react-hot-toast";




function EditNfa() {
  const location = useLocation();
 const { collection } = location.state || {};
 const navigate = useNavigate();
const [imageFile, setImageFile] = useState(null);



 console.log("your collection data are here :",collection);
const [selectedImage, setSelectedImage] = useState(collection?.image || null);


const [formData, setFormData] = useState({
  name: collection?.name || "",
  symbol: collection?.symbol || "",
  chain: collection?.chain || "",
  Type: collection?.Type || "",
  royaltyPercent: collection?.creatorFee || "",
  supply: collection?.supply || "",
  royaltyWallet: collection?.recipient || "",
});


  // Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    setImageFile(file); // <-- important (store file)
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  }
};

  // Handle drag and drop
 const handleDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    setImageFile(file); // <-- SAVE FILE
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  }
};


const handleUpdate = async () => {
  try {
    const id = collection?._id || collection?.id;

    if (!id) {
      toast.error("Collection ID missing");
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("symbol", formData.symbol);
    form.append("chain", formData.chain);
    form.append("Type", formData.Type);
    form.append("royaltyPercent", formData.royaltyPercent);
    form.append("supply", formData.supply);
    form.append("royaltyWallet", formData.royaltyWallet);

    // Only append image if user uploaded a new one
    if (imageFile) {
      form.append("image", imageFile);
    }

    const response = await axios.put(
      `${User_Dashboard_Url}/nft/collection/update/${id}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    if (response.data.success) {
      toast.success("Collection Updated Successfully");
      navigate("/dashboard/nfa-details");
    }
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    toast.error("Failed to update collection");
  }
};

  const handleDragOver = (event) => event.preventDefault();

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden relative">
      {/* Background Blurs */}
      <div
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
        style={{
          top: "20px",
          left: "990px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />
      <div
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
        style={{
          top: "540px",
          left: "650px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />

      {/* Content */}
      <div className="relative z-50">
        <div className="flex gap-10 mt-20 mx-8">
          {/* Left Side: Image Upload */}
     <div
  className="flex items-center justify-center cursor-pointer backdrop-blur-sm bg-white/5 border border-white/30 rounded-md relative"
  style={{
    width: "456px",
    height: "440px",
    borderStyle: "dashed",
    boxSizing: "border-box",
  }}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onClick={() => document.getElementById("file-upload").click()} // parent triggers input
>
  {/* Preview Image */}
  {selectedImage && (
    <img
      src={selectedImage}
      alt="Preview"
      className="max-w-full max-h-full rounded-md"
    />
  )}

  {/* File Input */}
  <input
    type="file"
    id="file-upload"
    accept="image/*"
    onChange={handleFileChange}
    className="hidden" // hide it completely
  />

  {/* Placeholder */}
  {!selectedImage && (
    <div className="flex flex-col items-center justify-center gap-2">
      <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
      <div className="text-center text-white">
        <span className="font-bold text-blue-400">Click to upload</span> or drag & drop
      </div>
    </div>
  )}
</div>


          {/* Right Side: Form */}
          <div className="relative z-50 rounded-lg p-6 w-[456px] flex flex-col gap-6">
            <h2 className="text-white text-2xl font-semibold">Edit your own NFA's</h2>
            <p className="text-white/70 text-base">
              Edit your own digital universe where every piece you mint tells a story, carries emotion, and becomes part of something timeless.
            </p>

            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base font-normal">Name</label>
              <input
               value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                type="text"
                placeholder="Add Contract Name"
                className="w-full h-12 px-3 rounded-md bg-white/10 border border-gray-600 text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition"
              />
            </div>

            {/* Token Symbol */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base font-normal">Token Symbol</label>
              <input
                type="text"
                placeholder="Create Name"
                 value={formData.symbol}
  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full h-12 px-3 rounded-md bg-white/10 border border-gray-600 text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition"
              />
            </div>

            {/* Chain */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-base font-normal">Chain</label>
              <div className="flex items-center gap-2 px-2 h-12 border border-gray-600 rounded-md bg-white/10 focus-within:border-blue-500 focus-within:bg-white/15 transition">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)" }}>
                  <img src={ChainIcon} alt="" className="w-[11px] h-[10px]" />
                </div>
                <input
                  type="text"
                    value={formData.chain}
  onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
                  placeholder="USDT"
                  className="w-full bg-transparent outline-none text-white placeholder-white/60"
                />
              </div>
            </div>
             <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-8 mx-2">
  <label
    htmlFor="type"
    style={{
      fontFamily: "Inter, sans-serif",
      fontWeight: 400,
      fontStyle: "normal",
      fontSize: "18px",
      lineHeight: "100%",
      letterSpacing: "0%",
      color: "white",
    }}
  >
    Collection Type
  </label>

<select
  id="Type"
   value={formData.Type}
  onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
  className="w-full h-10 px-3 rounded-md bg-transparent text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-gray-700 transition-colors"
>
  <option value="" className="text-black">Select Type</option>
  <option value="NFA" className="text-black">NFA</option>
  <option value="Land" className="text-black">Land</option>
</select>


</div>


            {/* Earnings */}
            <span className="text-white text-xl font-semibold">Earnings</span>
            <div className="flex gap-6">
              {/* Creator Fee */}
              <div className="flex flex-col gap-2 w-1/2">
                <label className="text-white text-base font-normal">Creator Fee</label>
                <div className="flex bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors items-center h-12 px-3 border border-gray-600 rounded-md bg-white/10">
                  <input
                    type="text"
                      value={formData.royaltyPercent}
  onChange={(e) => setFormData({ ...formData, royaltyPercent: e.target.value })}
                    defaultValue="0"
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/60"
                  />
                  <span className="text-white/70 px-2">%</span>
                </div>
                <p className="text-white/70 text-sm">Support 100% total fee</p>
              </div>

              {/* Supply */}
              <div className="flex flex-col gap-2 w-1/2">
                <label className="text-white text-base font-normal">Supply</label>
                <div className="flex bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors items-center h-12 px-3 border border-gray-600 rounded-md bg-white/10">
                  <input
                    type="text"
                     value={formData.supply}
  onChange={(e) => setFormData({ ...formData, supply: e.target.value })}
                    defaultValue="0"
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/60"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Wallet */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-white text-base font-normal">Recipient Wallet Address</label>
              <input
                type="text"
                 value={formData.royaltyWallet}
  onChange={(e) => setFormData({ ...formData, royaltyWallet: e.target.value })}
                placeholder="Add wallet address"
                className="w-full h-12 px-3 rounded-md border border-gray-600 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition"
              />
            </div>

            {/* Creator Earnings Info */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-white text-base font-normal">Creator Earnings</label>
              <p className="text-white/70 text-sm leading-tight">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{" "}
                <Link to="#" className="underline">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-6 mt-16 mx-8">
          <button className="border border-white text-white hover:bg-white/10 transition-colors w-32 h-10 rounded-md font-medium">
            Cancel
          </button>
          <button   onClick={handleUpdate} className="bg-blue-800 hover:bg-blue-700 transition-colors w-48 h-10 rounded-md font-medium text-white">
            Publish Contract
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditNfa;
