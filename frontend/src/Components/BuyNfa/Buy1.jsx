import React, { useState } from "react";
import Land1 from "../../assets/images/land1.jpg";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../../Components/Buttons/Button2";
import { FiEdit2 } from "react-icons/fi";
import popularCollections from "../../assets/images/popular/popolar.png";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import buyNfaImage from "../../assets/images/popolar.png"


function Buy1() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  const handleMakeOffer = () => {
    console.log("Make offer clicked");
  };

  return (
    <div className="max-w-[918px] mt-24 w-full h-auto flex flex-col md:flex-row gap-6 md:gap-[54px] px-4">
      {/* Image */}
     <img
  src={buyNfaImage}
  alt="land image"
  className="w-full md:w-[375px] h-[230px] md:h-[350px] scale-x-[-1] rounded-[10px] bg-[#00000033] object-cover object-top cursor-default"
/>


      {/* Content */}
      <div className="w-full md:w-[464px] flex flex-col gap-4">
        <div className="flex items-center  gap-2">
          <h1 className="font-inter font-semibold text-xl md:text-2xl text-white cursor-default">
            Monkey ape
          </h1>
          <p className="flex items-center font-inter font-semibold text-sm md:text-base text-white cursor-default">
            No333 🔥
          </p>
        </div>
        <p className="font-inter text-sm md:text-base text-white opacity-50 cursor-default">
          Listed
        </p>

        <div className="w-full h-auto bg-[#17171887] px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white opacity-70 cursor-default gap-2 md:gap-0">
            <p>Price</p>
            <p className="text-xs md:text-sm">
              Owned By : Oxc4c16a645...b21a
            </p>
          </div>
          <h2 className="text-white mt-3 text-lg md:text-xl cursor-default">
            $2000.00
          </h2>
          <div className="flex justify-end mt-4 ">
            <h3 className="flex items-center px-2">
                <FiEye className="text-white w-5 h-5" />
      <span className="text-white font-medium px-2">505 Views</span>
            </h3>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-center gap-4 mt-2 ">
            <button onClick={openModal} className="cursor-pointer w-full md:w-auto">
              <CustomButton text="Buy Now" />
            </button>
            
              <Link to="/offer" className="cursor-pointer w-full md:w-auto">
              <CustomButton text="Buy With Card" />
              </Link>
           
          </div>

          <div
            className="flex items-center gap-2 mt-4 md:mt-6 text-white cursor-pointer"
            onClick={handleMakeOffer}
          >
            Make Offer
            <FiEdit2 className="text-base md:text-lg" />
          </div>
        </div>
      </div>

      {/* First Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            <h1 className="text-white font-bold text-lg md:text-xl">Buy Assets</h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>

            <h1 className="text-white text-xl font-bold mb-2">Monkey Ape</h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {[{ label: "List price", value: "$2000 USDT" },
              { label: "Platform Fee", value: "$0.5 USDT" },
              { label: "Total Fee", value: "$2000.5 USDT" }].map((item, index) => (
              <div key={index} className="w-[90%] mb-3">
                <div
                  className="flex justify-between items-center rounded px-4 h-9 bg-white/10"
                >
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-col md:flex-row gap-4 mt-6 w-full justify-center">
              <CustomButton2 text="Cancel" onClick={closeModal} />
              <button onClick={openSecondModal} className="w-full md:w-auto">
                <CustomButton text="Buy Now" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second Modal */}
      {isSecondOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-4"
          onClick={closeSecondModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSecondModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            <h1 className="text-white font-bold text-lg md:text-xl">Buy Assets</h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>

            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">List Price</p>
                <p className="text-white text-sm">$2000.5</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeSecondModal} className="w-full md:w-auto">
                <CustomButton2 text="Close" />
              </button>
              <Link to="/payment" className="w-full md:w-auto">
                <CustomButton text="Confirm" onClick={closeSecondModal} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buy1;
