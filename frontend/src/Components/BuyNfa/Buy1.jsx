import React, { useState } from "react";
import Land1 from "../../assets/images/land1.jpg";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../../Components/Buttons/Button2";
import { FiEdit2 } from "react-icons/fi";
import popularCollections from "../../assets/images/popular/popolar.png";
import { Link } from "react-router-dom";

function Buy1() {
  const [isOpen, setIsOpen] = useState(false); // First modal
  const [isSecondOpen, setIsSecondOpen] = useState(false); // Second modal

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const openSecondModal = () => {
    setIsOpen(false); // Close first modal
    setIsSecondOpen(true); // Open second modal
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  const handleMakeOffer = () => {
    console.log("Make offer clicked");
  };

  return (
    <div className="max-w-[918px] mt-24 w-full h-auto flex flex-col md:flex-row gap-6 md:gap-[54px] px-4">
      {/* Image */}
      <img
        src={Land1}
        alt="land image"
        className="w-full md:w-[375px] h-[250px] md:h-[350px] rounded-[10px] bg-[#00000033] object-cover cursor-default"
      />

      {/* Content */}
      <div className="w-full md:w-[464px] flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-inter font-semibold text-[24px] md:text-[30px] text-white cursor-default">
            Monkey ape
          </h1>
          <p className="flex items-center font-inter font-semibold text-[14px] md:text-[16px] text-white cursor-default">
            No333 🔥
          </p>
        </div>
        <p className="font-inter text-[14px] md:text-[16px] text-white opacity-50 cursor-default">
          Listed
        </p>

        <div className="w-full h-auto bg-[#17171887] px-6 py-8 rounded-[10px]">
          <div className="flex justify-between items-center text-white opacity-70 cursor-default">
            <p>Price</p>
            <p className="text-xs md:text-sm">Owned By : Oxc4c16a645...b21a</p>
          </div>
          <h2 className="text-white mt-3 text-lg md:text-xl cursor-default">
            $2000.00
          </h2>

          <div className="w-full flex flex-row justify-center gap-4 mt-6 md:mt-16">
            <button onClick={openModal} className="cursor-pointer">
              <CustomButton text="Buy Now" />
            </button>
           <button className="cursor-pointer">
             <CustomButton text="Buy With Card"  />
           </button>
          </div>

          <div
            className="flex items-center gap-2 mt-2 md:mt-6 text-white cursor-pointer"
            onClick={handleMakeOffer}
          >
            Make Offer
            <FiEdit2 className="text-[16px] md:text-[18px]" />
          </div>
        </div>
      </div>

      {/* First Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70"
          onClick={closeModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative"
            style={{ width: "449px", minHeight: "500px", marginTop: "50px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            <h1 className="text-white font-bold">Buy Assets</h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            <div className="w-[166px] h-[144px] rounded-[10.41px] overflow-hidden mb-4">
              <div className="w-full h-full bg-gradient-to-b from-[#977C34] to-[#493F26] rounded-[10.41px] overflow-hidden">
                <img
                  src={popularCollections}
                  alt="Collection"
                  className="w-full h-full object-cover object-top scale-x-[-1]"
                />
              </div>
            </div>

            <h1 className="text-white text-xl font-bold mb-2">Monkey Ape</h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {[{ label: "List price", value: "$2000 USDT" },
              { label: "Platform Fee", value: "$0.5 USDT" },
              { label: "Total Fee", value: "$2000.5 USDT" }].map((item, index) => (
              <div key={index} className="w-[90%] mb-3">
                <div
                  className="flex justify-between items-center rounded-[4px] px-4"
                  style={{ height: "36px", background: "rgba(255,255,255,0.08)" }}
                >
                  <p className="text-gray-400 font-medium text-[14px] capitalize">{item.label}</p>
                  <p className="text-white font-medium text-[14px] capitalize">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-4 mt-6">
              <CustomButton2 text="Cancel" onClick={closeModal} />
              <button onClick={openSecondModal}>
                <CustomButton text="Buy Now" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second Modal */}
      {isSecondOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70"
          onClick={closeSecondModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative"
            style={{ width: "449px", minHeight: "500px", marginTop: "50px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSecondModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            <h1 className="text-white font-bold">Buy Assets</h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[166px] h-[144px] rounded-[10.41px] overflow-hidden mb-4">
              <div className="w-full h-full bg-gradient-to-b from-[#977C34] to-[#493F26] rounded-[10.41px] overflow-hidden">
                <img
                  src={popularCollections}
                  alt="Collection"
                  className="w-full h-full object-cover object-top scale-x-[-1]"
                />
              </div>
            </div>

            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[90%] mb-3">
              <div
                className="flex justify-between items-center rounded-[4px] px-4"
                style={{ height: "36px", background: "rgba(255,255,255,0.08)" }}
              >
                <p className="text-gray-400 font-medium text-[14px] capitalize">List Price</p>
                <p className="text-white font-medium text-[14px] capitalize">$2000.5</p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
             <button onClick={closeSecondModal}>
               <CustomButton2 text="Close"  />
             </button>
             <Link to="/payment">
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
