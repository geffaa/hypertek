import { Link } from "react-router-dom";
import React from "react";

function CreatorEarning() {
  return (
    <div className="bg-black pt-12  overflow-hidden h-[850px]">
      {/* Bg Effect */}
      <div
        style={{
          top: `20px`,
          left: `950px`,
          width: "300px",
          height: "300px",
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
          top: `600px`,
          left: `100px`,
          width: "300px",
          height: "300px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      {/* Main Content */}
      <div className="flex flex-col gap-6 p-6 w-[515px] mx-24 relative z-50">
        <span className="font-inter font-semibold text-[25px]">
          Earnings
        </span>

        <div className="flex justify-between gap-6 mt-5">
          {/* Creator Fee */}
          <div className="flex flex-col gap-2 w-[180px]">
            <h1 className="font-inter font-normal text-[18px] m-0">Creator Fee</h1>
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
            <h1 className="font-inter font-normal text-[18px] m-0">Supply</h1>
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
          <h1 className="font-inter font-normal text-[18px] m-0">Creator Earnings</h1>
          <p className="text-[14px] text-white/70 font-inter leading-[100%] m-0">
            orem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{" "}
            <Link to="#">
              <span className="underline">Learn more</span>
            </Link>
          </p>
        </div>

        {/* Save Button */}
       
      </div>
       <div className="flex justify-end mt-12 mr-12">
          <button
            className="w-[190px] h-[42px] rounded-md bg-blue-700 text-white font-medium text-[16px] flex items-center justify-center cursor-pointer"
          >
            Save
          </button>
        </div>
    </div>
  );
}

export default CreatorEarning;
