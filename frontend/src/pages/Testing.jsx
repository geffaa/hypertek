import React from "react";
import "../index.css";
import popularCollections from "../assets/images/popular/popolar.png";
import Picture1 from "../assets/images/Picture1.png";
import TVector from "../assets/images/popular/vector.png";
import CustomButton from "../Components/Buttons/Button1";
import { Link } from "react-router-dom";

function Testing() {
  return (
    <>
      {/* main section container */}
      <div className="md:w-[1344px] mx-auto mt-[4rem] flex flex-col items-center gap-[2rem]">
        {/* heading section */}
        <div className="flex flex-col items-center gap-[10px] text-center">
          <h1
            className="
              text-[20px] md:text-[30px]
              font-goldman font-bold uppercase
              leading-[100%] text-white
              w-[314px] md:w-[435px]
            "
          >
            Popular Collections
          </h1>

          {/* underline lines */}
          <div className="flex justify-center gap-[10px] opacity-100">
            <div className="w-[39px] md:w-[55px] border-t-2 border-white"></div>
            <div className="w-[33px] md:w-[55px] border-t-2 border-white"></div>
            <div className="w-[24px] md:w-[55px] border-t-2 border-white"></div>
            <div
              className="w-[177px] md:w-[216px] border-t-2"
              style={{
                borderImage:
                  "linear-gradient(90deg, #FFFFFF 0%, #0F0F0F 100%) 1",
                borderImageSlice: 1,
              }}
            ></div>
          </div>
        </div>

        {/* cards section */}
        <div className="flex flex-col md:flex-row gap-[37px] md:gap-[24px] justify-center">
          {/* single card */}
        <div
  className="
    relative flex flex-col 
    md:w-[318px] md:h-[480px] md:rounded-[15px]  /* Reduced height here */
    w-[139px] h-[237.35px] rounded-[6.56px]
    bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)]
    backdrop-blur-[8.74px] md:backdrop-blur-[20px]
    p-2
  "
>
  {/* Image box */}
  <div
    className="
      w-[130.26px] h-[114.08px] md:w-[298px] md:h-[261px] rounded-[8.17px] md:rounded-[18.68px] 
      bg-gradient-to-b from-[#977C34] to-[#493F26] 
      overflow-hidden
    "
  >
    <img
      src={Picture1}
      alt="Collection"
      className="w-full h-full object-cover object-top "
    />
  </div>

  {/* Title below image */}
  <h1
    className="
      mt-4 font-inter font-normal text-[13px] md:text-[25px] 
      w-[70px] md:w-[160px] h-[13px] md:h-[30px]
      capitalize tracking-[5%] leading-[100%] 
      text-white
      text-left
    "
  >
    Monkey ape
  </h1>

  {/* Content section */}
  <div className="w-[127.635px] h-[62.943px] md:w-[298px] md:h-[144px] mt-4 gap-[23.6px] md:gap-[54px] opacity-100">
    {/* Top row with number and price */}
    <div className="w-[130.258px] md:w-[298px] h-[9.616px] md:h-[22px] flex justify-between opacity-100 items-center">
      {/* Left side - Number */}
      <div className="w-[29.616px] md:w-[45px] h-[8.742px] md:h-[19px] opacity-100">
        <h1 className="w-[45px] h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] capitalize text-white">
          No33
        </h1>
      </div>

      {/* Right side - Price */}
      <div className="w-[32.346px] flex items-center md:w-[74px] h-[8px] md:h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] text-right text-white capitalize">
        <img
          src={TVector}
          alt=""
          className="w-[10px] h-[9px] bg-blue-400 rounded-md"
        />
        <h3 className="pl-2 text-sm font-semibold">${2000}</h3>
      </div>
    </div>

    {/* Custom button */}
    <div className="mt-4 flex justify-center">
      <button>
        <Link to="/market-place">
          <CustomButton text="Buy Now" />
        </Link>
      </button>
    </div>
  </div>
</div>

<div
  className="
    relative flex flex-col 
    md:w-[318px] md:h-[480px] md:rounded-[15px]  /* Reduced height here */
    w-[139px] h-[237.35px] rounded-[6.56px]
    bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)]
    backdrop-blur-[8.74px] md:backdrop-blur-[20px]
    p-2
  "
>
  {/* Image box */}
  <div
    className="
      w-[130.26px] h-[114.08px] md:w-[298px] md:h-[261px] rounded-[8.17px] md:rounded-[18.68px] 
      bg-gradient-to-b from-[#977C34] to-[#493F26] 
      overflow-hidden
    "
  >
    <img
      src={Picture1}
      alt="Collection"
      className="w-full h-full object-cover object-top "
    />
  </div>

  {/* Title below image */}
  <h1
    className="
      mt-4 font-inter font-normal text-[13px] md:text-[25px] 
      w-[70px] md:w-[160px] h-[13px] md:h-[30px]
      capitalize tracking-[5%] leading-[100%] 
      text-white
      text-left
    "
  >
    Monkey ape
  </h1>

  {/* Content section */}
  <div className="w-[127.635px] h-[62.943px] md:w-[298px] md:h-[144px] mt-4 gap-[23.6px] md:gap-[54px] opacity-100">
    {/* Top row with number and price */}
    <div className="w-[130.258px] md:w-[298px] h-[9.616px] md:h-[22px] flex justify-between opacity-100 items-center">
      {/* Left side - Number */}
      <div className="w-[29.616px] md:w-[45px] h-[8.742px] md:h-[19px] opacity-100">
        <h1 className="w-[45px] h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] capitalize text-white">
          No33
        </h1>
      </div>

      {/* Right side - Price */}
      <div className="w-[32.346px] flex items-center md:w-[74px] h-[8px] md:h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] text-right text-white capitalize">
        <img
          src={TVector}
          alt=""
          className="w-[10px] h-[9px] bg-blue-400 rounded-md"
        />
        <h3 className="pl-2 text-sm font-semibold">${2000}</h3>
      </div>
    </div>

    {/* Custom button */}
    <div className="mt-4 flex justify-center">
      <button>
        <Link to="/market-place">
          <CustomButton text="Buy Now" />
        </Link>
      </button>
    </div>
  </div>
</div>

<div
  className="
    relative flex flex-col 
    md:w-[318px] md:h-[480px] md:rounded-[15px]  /* Reduced height here */
    w-[139px] h-[237.35px] rounded-[6.56px]
    bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)]
    backdrop-blur-[8.74px] md:backdrop-blur-[20px]
    p-2
  "
>
  {/* Image box */}
  <div
    className="
      w-[130.26px] h-[114.08px] md:w-[298px] md:h-[261px] rounded-[8.17px] md:rounded-[18.68px] 
      bg-gradient-to-b from-[#977C34] to-[#493F26] 
      overflow-hidden
    "
  >
    <img
      src={Picture1}
      alt="Collection"
      className="w-full h-full object-cover object-top "
    />
  </div>

  {/* Title below image */}
  <h1
    className="
      mt-4 font-inter font-normal text-[13px] md:text-[25px] 
      w-[70px] md:w-[160px] h-[13px] md:h-[30px]
      capitalize tracking-[5%] leading-[100%] 
      text-white
      text-left
    "
  >
    Monkey ape
  </h1>

  {/* Content section */}
  <div className="w-[127.635px] h-[62.943px] md:w-[298px] md:h-[144px] mt-4 gap-[23.6px] md:gap-[54px] opacity-100">
    {/* Top row with number and price */}
    <div className="w-[130.258px] md:w-[298px] h-[9.616px] md:h-[22px] flex justify-between opacity-100 items-center">
      {/* Left side - Number */}
      <div className="w-[29.616px] md:w-[45px] h-[8.742px] md:h-[19px] opacity-100">
        <h1 className="w-[45px] h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] capitalize text-white">
          No33
        </h1>
      </div>

      {/* Right side - Price */}
      <div className="w-[32.346px] flex items-center md:w-[74px] h-[8px] md:h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] text-right text-white capitalize">
        <img
          src={TVector}
          alt=""
          className="w-[10px] h-[9px] bg-blue-400 rounded-md"
        />
        <h3 className="pl-2 text-sm font-semibold">${2000}</h3>
      </div>
    </div>

    {/* Custom button */}
    <div className="mt-4 flex justify-center">
      <button>
        <Link to="/market-place">
          <CustomButton text="Buy Now" />
        </Link>
      </button>
    </div>
  </div>
</div>

<div
  className="
    relative flex flex-col 
    md:w-[318px] md:h-[480px] md:rounded-[15px]  /* Reduced height here */
    w-[139px] h-[237.35px] rounded-[6.56px]
    bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)]
    backdrop-blur-[8.74px] md:backdrop-blur-[20px]
    p-2
  "
>
  {/* Image box */}
  <div
    className="
      w-[130.26px] h-[114.08px] md:w-[298px] md:h-[261px] rounded-[8.17px] md:rounded-[18.68px] 
      bg-gradient-to-b from-[#977C34] to-[#493F26] 
      overflow-hidden
    "
  >
    <img
      src={Picture1}
      alt="Collection"
      className="w-full h-full object-cover object-top "
    />
  </div>

  {/* Title below image */}
  <h1
    className="
      mt-4 font-inter font-normal text-[13px] md:text-[25px] 
      w-[70px] md:w-[160px] h-[13px] md:h-[30px]
      capitalize tracking-[5%] leading-[100%] 
      text-white
      text-left
    "
  >
    Monkey ape
  </h1>

  {/* Content section */}
  <div className="w-[127.635px] h-[62.943px] md:w-[298px] md:h-[144px] mt-4 gap-[23.6px] md:gap-[54px] opacity-100">
    {/* Top row with number and price */}
    <div className="w-[130.258px] md:w-[298px] h-[9.616px] md:h-[22px] flex justify-between opacity-100 items-center">
      {/* Left side - Number */}
      <div className="w-[29.616px] md:w-[45px] h-[8.742px] md:h-[19px] opacity-100">
        <h1 className="w-[45px] h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] capitalize text-white">
          No33
        </h1>
      </div>

      {/* Right side - Price */}
      <div className="w-[32.346px] flex items-center md:w-[74px] h-[8px] md:h-[19px] opacity-100 font-inter font-semibold text-[6.99px] md:text-[16px] leading-[100%] tracking-[5%] text-right text-white capitalize">
        <img
          src={TVector}
          alt=""
          className="w-[10px] h-[9px] bg-blue-400 rounded-md"
        />
        <h3 className="pl-2 text-sm font-semibold">${2000}</h3>
      </div>
    </div>

    {/* Custom button */}
    <div className="mt-4 flex justify-center pt-5">
      <button>
        <Link to="/market-place">
          <CustomButton text="Buy Now" />
        </Link>
      </button>
    </div>
  </div>
</div>

        </div>
        
      </div>
    </>
  );
}

export default Testing;
