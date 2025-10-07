import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import CustomButton from "../Buttons/Button1";
import VisaImage from "../../assets/images/visa.png";
import MasterCard from "../../assets/images/Mastercard.png";

function CardPayment() {
  const navigate = useNavigate();

  return (
    <>
      {/* Back Button */}
     <button
  onClick={() => navigate(-1)}
  className="hidden md:block absolute md:top-[70px] top-[75px] left-[23px] md:left-10 text-white text-lg p-2 hover:bg-gray-800 rounded-full transition-colors duration-200"
>
  <FaArrowLeft />
</button>


      <div
        className="flex flex-col gap-5 p-4 mx-auto mt-24 relative text-white"
        style={{
          maxWidth: "409px",
          width: "100%",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Card Number */}
       <div className="flex flex-col gap-2 relative">
  <label className="text-sm font-medium">Card number</label>
  <input
    type="text"
    placeholder="2341 2678 5432 5423"
    className="w-full h-[46px] px-3 border border-gray-500 rounded text-white placeholder-gray-400 bg-transparent outline-none focus:border-blue-500 transition-colors duration-200"
  />

  {/* Visa & MasterCard Images with white background */}
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2 pointer-events-none">
    {/* Visa */}
    <div className="w-10 h-6 bg-white flex items-center justify-center rounded-sm mt-6">
      <img src={VisaImage} alt="Visa" className="w-6 h-4 object-contain" />
    </div>

    {/* MasterCard */}
    <div className="w-10 h-6 bg-white flex items-center justify-center rounded-sm mt-6">
      <img src={MasterCard} alt="MasterCard" className="w-6 h-4 object-contain" />
    </div>
  </div>
</div>


        {/* Expiry Date + CVV */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 w-1/2">
            <label className="text-sm font-medium">Expiry date</label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full h-[46px] px-3 border border-gray-500 rounded text-white placeholder-gray-400 bg-transparent outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <label className="text-sm font-medium">CVV/CVC</label>
            <input
              type="password"
              placeholder="CVV"
              className="w-full h-[46px] px-3 border border-gray-500 rounded text-white placeholder-gray-400 bg-transparent outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Name on Card */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Name on card</label>
          <input
            type="text"
            placeholder="Name on card"
            className="w-full h-[46px] px-3 border border-gray-500 rounded text-white placeholder-gray-400 bg-transparent outline-none focus:border-blue-500 transition-colors duration-200"
          />
        </div>

        {/* Purchase Button */}
        <div className="flex justify-center mt-4">
          <Link to="/success">
            <CustomButton text="Purchase Now" />
          </Link>
        </div>
      </div>
    </>
  );
}

export default CardPayment;
