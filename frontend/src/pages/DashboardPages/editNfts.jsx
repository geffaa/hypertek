import React from "react";
// import GlowingOrb from "../components/common/BgEffect";

function CollectionDetails() {
  return (
<div className="min-h-screen bg-black flex flex-col justify-between text-white overflow-x-hidden pt-16 pb-5">


     {/* <div
      style={{
        top: `${20}px`,
        left: `${60}px`,
        position:"absolute",
        width: "250px",
        height: "200px",
        background: "#002AA8",
        opacity: 1,
        filter: "blur(160px)", // main blur
        // backdropFilter: "blur(600px)", 
      }}
      className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
    ></div> */}
          

      {/* BG EFFECT LAYER (Behind Everything) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
      
      </div>

      {/* MAIN CONTENT - Centered vertically */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="z-10 w-full max-w-[495px] px-6"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "42px",
          }}
        >


       
          {/* Header */}
          <div className="flex flex-col gap-[14px]">
            <h1 className="font-inter font-semibold text-[22px] md:text-[25px] m-0 text-white">
              NFT's Details
            </h1>
            <p className="font-inter font-normal text-[16px] md:text-[18px] text-white/70 m-0">
              Create your own collection.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-[25px]">
            {["Name", "URL", "Twitter", "Discord"].map((label) => (
              <div key={label} className="flex flex-col gap-[6px]">
                <label className="font-inter font-normal text-[16px] md:text-[18px] text-white">
                  {label}
                </label>
                <input
                  placeholder={`Add ${label}`}
                  className="w-full h-[48px] rounded-[4px] border border-gray-600 px-4 py-2 text-white bg-transparent outline-none focus:border-blue-500 hover:border-gray-400 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
        {/* <div
      style={{
        top: `${660}px`,
        left: `${420}px`,
        position:"absolute",
        width: "300px",
        height: "300px",
        background: "#002AA8",
        opacity: 1,
        filter: "blur(180px)", // main blur
        // backdropFilter: "blur(600px)", 
      }}
      className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
    ></div> */}

      {/* Publish Button - Fixed at bottom */}
      <div className="w-full flex justify-center sm:justify-end pt-8 mb-12 z-10 px-6 sm:px-0">
        <button
          className="w-full sm:w-[190px] h-[42px] rounded-[6px] bg-[#002AA8] text-white font-inter text-[18px] border-none cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25 sm:mx-8"
        >
          Publish
        </button>
      </div>
    </div>
  );
}

export default CollectionDetails;