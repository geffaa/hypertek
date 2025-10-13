import React, { useState , useEffect} from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import CustomButton from "../Buttons/Button1";
import popularCollections from "../../assets/images/popolar.png";
import { FiEye } from "react-icons/fi";
import { FiEdit2 } from "react-icons/fi";
import buyNfaImage from "../../assets/images/popolar.png";
import symbol from "../../assets/images/login/Symbol.svg.png"; // Wallet image
import { STRIPE_PUBLISHABLE_KEY, BACKEND_BASE_URL } from "../../Config";


// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

function Buy1() {

  const location = useLocation();
  const { item } = location.state || {};
  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  const openThirdModal = (price) => {
  if (!price || isNaN(price)) {
    toast.error("Invalid price");
    return;
  }
  setFinalPrice(price);
  setIsSecondOpen(false);
  setIsThirdOpen(true);
};

  const closeThirdModal = () => {
    setIsThirdOpen(false);
    setShowStripeForm(false);
  };

  const handlePaypalPayment = () => toast("Redirecting to PayPal checkout...");
  const handleCryptoPayment = () => toast("Connecting to crypto wallet...");


   const handleMakeOffer = () => {
    console.log("Make offer clicked");
  };


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




  return (
    <div className="max-w-[918px] mt-24 w-full h-auto flex flex-col md:flex-row gap-6 md:gap-[54px] px-4">
      {/* NFT Content */}
   <div className="text-white flex items-center sm:hidden">
        <Link to="/buy-nfa" className="border-b-2 border-blue-500">
          Overview
        </Link>
        <Link to="/offer-recieved" className="pl-3">
          Offer 0
        </Link>
      </div>

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

              <Link to="/offer" className="cursor-pointer w-full md:w-auto">
                <CustomButton text="Buy With Card" />
              </Link>
            </div>

            <Link
              to="/payment"
              className="hidden md:flex items-center gap-2 mt-4 md:mt-6 text-white cursor-pointer"
              onClick={handleMakeOffer}
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

            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5 w-[0.25rem] h-[1.2rem]"
                    
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] w-[0.5rem] h-[2.2rem]"
                    style={{
                     
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center w-[7rem] md:w-[9rem] h-[2rem] justify-center text-white font-medium"
                    style={{
                    
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8", // ~2.42px
                    }}
                  >
                    Cancel
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.2rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>

              <button className="w-full md:w-auto" onClickCapture={openSecondModal}>
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
                    className="bg-[#002AA8] mr-0.5 w-[0.25rem] h-[1.2rem]"
                    
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] w-[0.5rem] h-[2.2rem]"
                    style={{
                     
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center w-[7rem] md:w-[9rem] h-[2rem] justify-center text-white font-medium"
                    style={{
                    
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8", // ~2.42px
                    }}
                  >
                    Close
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.2rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>
              
<button onClick={() => openThirdModal(Number(item?.price) + 0.5)}>
  <CustomButton text="Confirm" />
</button>

            </div>
          </div>
        </div>
      )}

      {/* ------------------ Third Modal (Payment) ------------------- */}
  {/* ------------------ Third Modal (Payment) ------------------- */}
{isThirdOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-20 pt-24">
    <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
      <button onClick={closeThirdModal} className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition">×</button>

      <h2 className="text-white text-lg font-bold text-center my-4">
        Select Payment Method
      </h2>
      <hr className="border-t border-gray-600 my-4" />

      <div className="flex flex-col items-center gap-4 mb-6 mt-4">
        {/* Stripe Checkout */}



<button
  onClick={async () => {
    try {
      const res = await fetch(`http://localhost:4700/api/v1/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPrice * 100,   // in cents
          userId: user.id,
          redirectUrl:`${window.location.origin}/dashboard`, // pass current page URL
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        toast.error("Failed to start Stripe checkout");
      }
    } catch (err) {
      console.error(err);
      toast.error("Stripe checkout error");
    }
  }}
  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3.5 px-4 rounded-lg flex items-center justify-center"
>
  Pay with Stripe
</button>


        <button onClick={handlePaypalPayment} className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-medium py-3.5 px-4 rounded-lg flex items-center justify-center">
          Pay with PayPal
        </button>

        <button onClick={handleCryptoPayment} className="w-full bg-gray-900 hover:bg-gray-950 text-white font-medium py-3.5 px-4 rounded-lg flex items-center justify-center">
          Pay with Crypto
        </button>
      </div>

      <div className="flex justify-center mt-4">
        <button onClick={closeThirdModal} className="text-gray-400 hover:text-white font-medium">
          Cancel Payment
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}

export default Buy1;
