import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Elements, CardElement } from "@stripe/react-stripe-js";

import CustomButton from "../Buttons/Button1";
import popularCollections from "../../assets/images/popolar.png";
import { FiEye } from "react-icons/fi";
import { FiEdit2 } from "react-icons/fi";
import buyNfaImage from "../../assets/images/popolar.png";
import { STRIPE_PUBLISHABLE_KEY, BACKEND_BASE_URL } from "../../Config";
import axios from "axios";

// Initialize Stripe

function Buy1() {
  const navigate = useNavigate();

  const location = useLocation();
  const { item } = location.state || {};

  console.log("your seelcted item is here :", item);
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      // ✅ Payment successful
      alert("Payment Successful!");
      // Optional: remove session_id from URL
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  /// for stripe methods
  const handlePayment = async (productId) => {
    if (!user?.id) {
      toast.error("User Id is required Please signin");
      return;
    }
    if (!productId) {
      toast.error("Product ID is  required");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/game/create`, {
        userId: user.id,
        productId: productId,
      });

      // Log the actual data
      console.log("Payment response data:", res);

      // Show backend message (success or info)
      if (res.data?.exist === "no") {
        navigate("/stripe-payment", { state: { item } });
      }
      if (res.data?.exist === "yes") {
        toast.error("Sorry you have already purchased it");
      }

      // setIsSecondOpen(false);
    } catch (error) {
      console.error("Payment request error:", error);

      const errorMessage =
        error?.response?.data?.message || error?.message || "Payment failed";

      toast.error(errorMessage);
    }
  };

  // for card methods
  const handlePaymentCard = async (productId) => {
    if (!productId || !user?.id) {
      toast.error("User ID and Payment ID are required");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/v1/game/create`, {
        userId: user.id,
        productId: productId,
      });

      // Log the actual data
      console.log("Payment response data:", res);

      // Show backend message (success or info)
      if (res.data?.exist === "no") {
        navigate("/offer", { state: { item } });
      }
      if (res.data?.exist === "yes") {
        toast.error("Sorry you have already purchased it");
      }

      // setIsSecondOpen(false);
    } catch (error) {
      console.error("Payment request error:", error);

      const errorMessage =
        error?.response?.data?.message || error?.message || "Payment failed";

      toast.error(errorMessage);
    }
  };

  /// for make payment
  const handleMakeOffer = () => {
    if (item) localStorage.setItem("paymentItem", JSON.stringify(item));
  };

  return (
    <>


    <div className="flex flex-col">
       <div className="text-white flex items-center  w-[283px] h-[28px] md:top-[3rem] my-12 md:mt-1 md:absolute lg:relative md:right-[5rem]">
          <Link to="/buy-nfa" className="border-b-2 border-blue-500">
            Overview
          </Link>
          <Link to="/offer-recieved" className="pl-3">
            Offer 0
          </Link>
        </div>
    
    
    <div className="max-w-[918px] md:mt-24 w-full h-auto flex flex-col md:flex-row gap-6 md:gap-[54px] px-4">
      {/* NFT Content */}
      <div>
       

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* ✅ Title appears ABOVE the image on small screens */}
          <div className="flex md:hidden items-center gap-2 w-full justify-left">
            <h1 className="font-inter font-semibold text-xl text-white cursor-default">
              {item.title}
            </h1>
            <p className="font-inter font-semibold text-sm text-white cursor-default">
              {item.serialNumber} 🔥
            </p>
          </div>

          {/* ✅ Image */}
          <img
            src={buyNfaImage}
            alt="land image"
            style={{
              background: "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
            }}
            className="w-full md:w-[375px] h-[230px] md:h-[350px] scale-x-[-1] rounded-[10px] object-cover object-top cursor-default"
          />

          {/* ✅ Content */}
          <div className="w-full md:w-[464px] flex flex-col gap-4">
            {/* ✅ Title visible only on medium+ screens (beside image) */}
            <div className="hidden md:flex items-center gap-2">
              <h1 className="font-inter font-semibold text-2xl text-white cursor-default">
                {item.title}
              </h1>
              <p className="font-inter font-semibold text-base text-white cursor-default">
                {item.serialNumber} 🔥
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
                ${item.price}
              </h2>

              <div className="flex justify-end mt-4">
                <h3 className="flex items-center px-2">
                  <FiEye className="text-white w-5 h-5" />
                  <span className="text-white font-medium px-2">505 Views</span>
                </h3>
              </div>

              <div className="w-full flex flex-row justify-center gap-4 mt-2">
                <button
                  onClick={openModal}
                  className="cursor-pointer w-full md:w-auto"
                >
                  <CustomButton text="Buy Now" />
                </button>

                {/* buy with card option  */}
                <button
                  onClick={() => handlePaymentCard(item._id)}
                  className="cursor-pointer w-full md:w-auto"
                >
                  <CustomButton text="Buy With Card" />
                </button>
              </div>

              <Link
                to="/payment"
                state={{ item }}
                onClick={handleMakeOffer}
                className="hidden md:flex items-center gap-2 mt-4 md:mt-6 text-white cursor-pointer"
              >
                Make Offer
                <FiEdit2 className="text-base md:text-lg" />
              </Link>
            </div>

            <Link
              to="/payment"
              className="flex md:hidden items-center gap-2 mt-4 text-white cursor-pointer"
              onClick={handleMakeOffer}
            >
              Make Offer
              <FiEdit2 className="text-base md:text-lg" />
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------ First Modal ------------------- */}
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

            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            <div className="w-[150px] h-[140px] rounded-lg overflow-hidden mb-4">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>

            <h1 className="text-white text-xl font-bold mb-2">{item.title}</h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {[
              { label: "List price", value: `${item.price}` },
              { label: "Platform Fee", value: "$0.5 USDT" },
              { label: "Total Fee", value: `${item.price + 0.5} USDT` },
            ].map((item, index) => (
              <div key={index} className="w-[90%] mb-3">
                <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="flex  md:flex-row gap-4 mt-6 pl-12 md:pl-1 w-full justify-center">
              <button onClick={closeModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.3rem", // ~21.93px
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium w-[83.89px] h-[19.45] md:w-[168.31px] md:h-[39.59px]"
                    style={{
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "2.24px solid #002AA8", // ~2.42px
                    }}
                  >
                    Cancel
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem]"></div>
                </div>
              </button>

              <button
                className="w-full md:w-auto"
                onClickCapture={openSecondModal}
              >
                <CustomButton text="Buy Now" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Second Modal ------------------- */}
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

            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
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
                <p className="text-white text-sm">${item.price + 0.5}</p>
              </div>
            </div>

            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeSecondModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] md:mr-0.5 mr-0.3 md:h-[1.5rem] h-[1rem]"
                    style={{
                      width: "0.25rem", // ~3.99px
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium w-[83.89px] h-[19.45] md:w-[168.31px] md:h-[39.59px]"
                    style={{
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "2.24px solid #002AA8", // ~2.42px
                    }}
                  >
                    Close
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8] ml-0.5 md:h-[1.5rem] h-[1rem] "
                    style={{
                      width: "0.25rem", // ~3.99px
                    }}
                  ></div>
                </div>
              </button>

              {/* <button onClick={() => openThirdModal(Number(item?.price) + 0.5)}>
               
              </button> */}
              <button onClick={() => handlePayment(item._id)}>
                <CustomButton text="Confirm" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
    </div>
    </>




  );
}

export default Buy1;
