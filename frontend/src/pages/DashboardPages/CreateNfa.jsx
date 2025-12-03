import React, { useState } from "react";
import uploadIcon from "../../assets/images/CreateCollection/uploadIcon.png";
import ChainIcon from "../../assets/images/CreateCollection/ChainIcon.png";
// import BgEffect2 from "../components/common/BgEffect2"
import { Link } from "react-router-dom";

function CreateCollections() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result); // base64 string
      };
      reader.readAsDataURL(file);
    }
  };

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
    event.preventDefault(); // allow drop
  };

  return (
    <div className="flex flex-col  min-h-screen bg-black  overflow-hidden">
      <div
        style={{
          top: `20px`,
          left: `990px`,
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      <div
        style={{
          top: `540px`,
          left: `650px`,
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      {/* Content */}
      <div className="relative z-50">
        <div className="flex gap-10 mt-[80px] mx-8">
          {/* left side preview / modal */}
    // Inside your JSX, replace the current left-side div content with this:

<div
  className="flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/30"
  style={{
    width: "456px",
    height: "440px",
    borderRadius: "6px",
    borderStyle: "dashed",
    boxSizing: "border-box",
    position: "relative",
    cursor: "pointer", // show pointer
  }}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onClick={() => document.getElementById("file-upload").click()} // trigger input click
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
      {/* icon */}
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

      {/* file input */}
      <div
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
            pointerEvents: "none", // input won't block div click
          }}
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          style={{
            color: "white",
            textAlign: "center",
          }}
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


          {/* right side - form */}
          <div
            className="z-50 relative rounded-lg p-6"
            style={{
              width: "456px",
              // height: "440px",
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
                  className="px-2"
                  style={{
                    fontWeight: 600,
                    fontStyle: "normal",
                    fontSize: "25px",
                    lineHeight: "30px",
                    letterSpacing: "0%",
                    color: "white",
                    margin: 0,
                  }}
                >
                  Create your own NFA's
                </h2>

                <p
                  className="px-2"
                  style={{
                    width: "490px",
                    color: "#FFFFFFAB",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "18px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  Create your own digital universe where every piece you mint
                  tells a story, carries emotion, and becomes part of something
                  timeless.
                </p>
              </div>
            </div>

            {/* input fields  */}

            <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-8 mx-2">
              <label
                htmlFor="name"
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
                Name
              </label>

              <input
                type="text"
                id="name"
                placeholder="Add Contract Name"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />
            </div>

            {/* second  */}

            <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-8 mx-2">
              <label
                htmlFor="symbol"
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
                Token Symbol
              </label>

              <input
                type="text"
                id="symbol"
                placeholder="Create Name"
                className="w-full h-10 px-3 rounded-md bg-white/10 text-white border border-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-colors"
              />
            </div>

            {/* third  */}
            <div className="w-[430px] h-[84px] flex flex-col gap-[14px] mt-8 mx-2">
              <label
                htmlFor="chain"
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
                Chain
              </label>

              <div className="flex items-center rounded-md bg-white/10 text-white border border-gray-600 focus-within:border-blue-500 focus-within:bg-white/15 transition-colors px-2">
                <div
                  className="w-[17px] h-[17px] rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(180deg, #2AAC4F 0%, #85F3BE 100%)",
                  }}
                >
                  <img
                    src={ChainIcon}
                    alt=""
                    className="w-[10.62px] h-[9.78px]"
                  />
                </div>

                <input
                  type="text"
                  id="chain"
                  placeholder="USDT"
                  className="w-full h-10 px-3 bg-transparent outline-none"
                />
              </div>
            </div>
            <span className="font-inter font-semibold text-[25px]">
              Earnings
            </span>

            <div className="flex justify-between gap-6 mt-5">
              {/* Creator Fee */}
              <div className="flex flex-col gap-2 w-[180px]">
                <h1 className="font-inter font-normal text-[18px] m-0">
                  Creator Fee
                </h1>
                <div className="flex items-center border border-[#555] rounded-md h-[48px] px-3">
                  <input
                    type="text"
                    defaultValue="0"
                    className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
                  />
                  <span className="text-[18px] text-white/70 px-2">%</span>
                </div>
                <p className="text-[14px] text-white/70 font-inter m-0">
                  Support 100% total fee
                </p>
              </div>

              {/* Supply */}
              <div className="flex flex-col gap-2 w-[180px]">
                <h1 className="font-inter font-normal text-[18px] m-0">
                  Supply
                </h1>
                <div className="flex items-center border border-[#555] rounded-md h-[48px] px-3">
                  <input
                    type="text"
                    defaultValue="0"
                    className="w-full bg-transparent border-none outline-none text-[18px] text-white/70 font-inter"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Wallet Address */}
            <div className="flex flex-col gap-2 mt-8 w-full">
              <h1 className="font-inter font-normal text-[18px] m-0">
                Recipient Wallet Address
              </h1>
              <input
                type="text"
                placeholder="Add wallet address"
                className="w-full h-[48px] px-4 rounded-md border border-white/70 bg-transparent text-[18px] text-white/70 font-inter outline-none"
              />
            </div>

            {/* Creator Earnings Info */}
            <div className="flex flex-col gap-2 mt-8 w-full">
              <h1 className="font-inter font-normal text-[18px] m-0">
                Creator Earnings
              </h1>
              <p className="text-[14px] text-white/70 font-inter leading-[100%] m-0">
                orem ipsum dolor sit amet, consectetur adipiscing elit, sed do
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

        {/* last buttons div  */}
        <div
          className="flex mt-16  justify-end mx-8 pt-16 pb-32 relative z-10"
          style={{
            opacity: 1,
            gap: "37px",
          }}
        >
          <button
            className="border border-white text-white hover:bg-white/10 transition-colors"
            style={{
              width: "133px",
              height: "42px",
              borderRadius: "6px",
              gap: "10px",
              padding: "10px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span
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
              Cancel
            </span>
          </button>
          <button
            className="bg-blue-800 hover:bg-blue-700 transition-colors"
            style={{
              width: "190px",
              height: "42px",
              borderRadius: "6px",
              gap: "10px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
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
              Publish Contract
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCollections;
