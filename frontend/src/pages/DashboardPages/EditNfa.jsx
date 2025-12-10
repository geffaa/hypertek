import React, { useState } from "react";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../../assets/images/CreateCollection/ChainIcon.png";
import { Link } from "react-router-dom";

function EditNfa() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
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
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
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
            className="flex items-center justify-center cursor-pointer backdrop-blur-sm bg-white/5 border border-white/30 rounded-md"
            style={{
              width: "456px",
              height: "440px",
              borderStyle: "dashed",
              position: "relative",
              boxSizing: "border-box",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-full rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <img src={uploadIcon} alt="Upload" className="w-6 h-6" />
                <div className="relative w-[240px] h-[49px] flex items-center justify-center rounded-md">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    className="absolute w-full h-full opacity-0 pointer-events-none"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="text-center text-white">
                    <span className="font-bold text-blue-400">Click to upload</span> or drag and drop
                  </label>
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
                  placeholder="USDT"
                  className="w-full bg-transparent outline-none text-white placeholder-white/60"
                />
              </div>
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
          <button className="bg-blue-800 hover:bg-blue-700 transition-colors w-48 h-10 rounded-md font-medium text-white">
            Publish Contract
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditNfa;
