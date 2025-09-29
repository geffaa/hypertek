import React from 'react'
import BuyNfa2 from '../Components/BuyNfa/BuyNfa2'
import Land1 from "../assets/images/land1.jpg"
import CustomButton from '../Components/Buttons/Button1'
import { FiEdit2 } from "react-icons/fi"; // Feather pencil icon


function NfaLand() {
  return (
    <>
  

    <div className="max-w-[918px] mt-24 w-full h-auto flex flex-col md:flex-row gap-6 md:gap-[54px] opacity-100 px-4">
      {/* Image */}
      <img
        src={Land1}
        alt="land image"
        className="w-full md:w-[375px] h-[250px] md:h-[350px] rounded-[10px] bg-[#00000033] object-cover"
      />

      {/* Content */}
      <div className="w-full md:w-[464px] flex flex-col gap-4">
        {/* heading */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-inter font-semibold text-[24px] md:text-[30px] leading-[100%] tracking-[0.05em] capitalize text-white">
            Monkey ape
          </h1>
          <p className="flex items-center font-inter font-semibold text-[14px] md:text-[16px] leading-[100%] tracking-[0.05em] capitalize text-white">
            No333 🔥
          </p>
        </div>

        <p className="font-inter font-normal text-[14px] md:text-[16px] leading-[100%] tracking-[0.05em] capitalize text-white opacity-50">
          Listed
        </p>

        {/* card section */}
        <div className="w-full h-auto bg-[#17171887] px-6 py-8 rounded-[10px]">
          {/* price div */}
          <div className="flex justify-between items-center text-white opacity-70">
            <p>Price</p>
            <p className="text-xs md:text-sm">Owned By : Oxc4c16a645...b21a</p>
          </div>

          <h2 className="text-white mt-3 text-lg md:text-xl">$2000.00</h2>

          {/* button div */}
          <div className="w-full flex flex-row justify-center gap-4 mt-6 md:mt-16">
            <CustomButton text="Buy Now" />
            <CustomButton text="Buy With Card" />
          </div>

          {/* Make Offer below buttons */}
          <h3 className="flex items-center gap-2 md:mt-6 mt-2 text-white font-inter font-normal text-[14px] md:text-[16px] leading-none tracking-[0.05em] capitalize">
            Make Offer
            <FiEdit2 className="text-[16px] md:text-[18px] text-white cursor-pointer" />
          </h3>
        </div>
      </div>
    </div>
 


    <BuyNfa2/>
    </>
  )
}

export default NfaLand