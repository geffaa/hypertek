import React, { useState } from "react";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../../assets/images/CreateCollection/ChainIcon.png";
import { Link , useNavigate } from "react-router-dom";
import { useAnimate } from "framer-motion";

function CreateCollections() {
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate()

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackClick = ()=>{
    navigate("/dashboard/nfa-details")
  }

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      {/* Content */}
      <div className="relative z-50">
        <div className="flex gap-10 mt-[80px] mx-8">
          {/* Left side: Image upload */}
          <div
            className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30 cursor-pointer"
            style={{
              width: "456px",
              height: "440px",
              borderRadius: "6px",
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
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: "6px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "260px",
                  height: "40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "4px",
                    marginBottom: "1px",
                  }}
                >
                  <img src={uploadIcon} alt="" className="w-[16px] h-[16px]" />
                </div>
                <div className=""
                  style={{
                    width: "240px",
                    height: "49px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    style={{
                      opacity: 0,
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      pointerEvents: "none",
                    }}
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    style={{ color: "white", textAlign: "center" }}
                  >
                    <span className="font-bold text-blue-400">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right side: Form */}
          <div
            className="z-50 relative rounded-lg p-6"
            style={{
              width: "456px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "495px",
                height: "110px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              <div
                className="flex flex-col justify-start"
                style={{
                  width: "495px",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <h2
                  className="px-2 text-white font-semibold text-[25px]"
                  style={{ margin: 0 }}
                >
                  Create your own NFTs
                </h2>
                <p
                  className="px-2 text-white/70 text-[18px] leading-[24px]"
                  style={{ width: "490px", margin: 0, wordBreak: "break-word" }}
                >
                  Create your own digital universe where every piece you mint
                  tells a story, carries emotion, and becomes part of something
                  timeless.
                </p>
              </div>
            </div>

            {/* Input Fields */}
            <div className="w-[430px] flex flex-col gap-4 mt-8 mx-2">
              <label className="text-white font-normal text-[18px]">Name</label>
              <input
                type="text"
                placeholder="Add Contract Name"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />

              <label className="text-white font-normal text-[18px]">Token Symbol</label>
              <input
                type="text"
                placeholder="Create Name"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />

              <label className="text-white font-normal text-[18px]">Chain</label>
              <div className="flex items-center rounded-md bg-white/10 border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors px-2">
                <div
                  className="w-[17px] h-[17px] rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)",
                  }}
                >
                  <img src={ChainIcon} alt="" className="w-[10.62px] h-[9.78px]" />
                </div>
                <input
                  type="text"
                  placeholder="USDT"
                  className="w-full h-10 px-3 bg-transparent text-white outline-none"
                />
              </div>

              <span className="font-inter font-semibold ml-1 text-[25px] mt-4">
                Earnings
              </span>

              <div className="flex justify-between gap-6">
                {/* Creator Fee */}
                <div className="flex flex-col gap-2 w-[180px]">
                  <h1 className="text-white text-[18px] m-0">Creator Fee</h1>
                  <div className="flex items-center bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors border border-gray-600 rounded-md h-[48px] px-3">
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full bg-transparent border-none outline-none text-white/70 text-[18px]"
                    />
                    <span className="text-white/70 px-2">%</span>
                  </div>
                  <p className="text-white/70 text-[14px] m-0">
                    Support 100% total fee
                  </p>
                </div>

                {/* Supply */}
                <div className="flex flex-col gap-2 w-[180px]">
                  <h1 className="text-white text-[18px] m-0">Supply</h1>
                  <div className="flex bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors items-center border border-gray-600 rounded-md h-[48px] px-3">
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full bg-transparent border-none outline-none text-white/70 text-[18px]"
                    />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="text-white text-[18px]">Price</label>
                <input
                  type="text"
                  placeholder="Add Price"
                  className="w-full h-10 px-4 rounded border border-white/70 text-white/70 bg-transparent outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                />
              </div>

              {/* Recipient Wallet Address */}
              <div className="flex flex-col gap-2">
                <label className="text-white text-[18px]">Recipient Wallet Address</label>
                <input
                  type="text"
                  placeholder="Add wallet address"
                  className="w-full h-12 px-4 rounded-md border border-white/70 bg-transparent text-white/70 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                />
              </div>

              {/* Creator Earnings Info */}
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-[18px]">Creator Earnings</h1>
                <p className="text-white/70 text-[14px] leading-[100%]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                  enim ad minim veniam, quis nostrud exercitation ullamco laboris
                  nisi ut aliquip ex ea commodo consequat.{" "}
                  <Link to="#">
                    <span className="underline">Learn more</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex mt-16 justify-end mx-8 pt-16 pb-32 relative z-10 gap-6">
          <button onClick={handleBackClick} className="w-[133px] h-[42px] rounded-md border border-white text-white hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button className="w-[190px] h-[42px] rounded-md bg-blue-800 hover:bg-blue-700 text-white transition-colors">
            Publish Contract
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCollections;
