import React, { useState } from "react";
import Land1 from "../../assets/images/land1.jpg";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../../Components/Buttons/Button2";
import { FiEdit2 } from "react-icons/fi";
import popularCollections from "../../assets/images/popular/popolar.png";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import buyNfaImage from "../../assets/images/popolar.png";
import symbol from "../../assets/images/login/Symbol.svg.png"; // Make sure this image exists
import { useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY , BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Elements, CardElement } from "@stripe/react-stripe-js";



function Buy1() {
  const location = useLocation();
  const { item } = location.state || {}; // safely access it

  // Access the user object from Redux
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  console.log("your redux user is here :", user?.id);

  console.log("your item in the buy nfa :", item);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const [finalPrice, setFinaPrice] = useState();
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  const openThirdModal = (price) => {
    setFinaPrice(price);
    setIsSecondOpen(false);
    setIsThirdOpen(true);
  };
  const closeThirdModal = () => setIsThirdOpen(false);

  const handleMakeOffer = () => {
    console.log("Make offer clicked");
  };

  const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY); // ⚠️ use your real Stripe publishable key

  //// PAYMENT METHODS
  const handleStripePayment = async () => {
    console.log("your strip publich key :", STRIPE_PUBLISHABLE_KEY);

    if(!finalPrice){
      toast.error("stripe key is required")
    }

    if (!stripePromise || !user?.id || !finalPrice) {
      toast.error("Stripe key, user ID, and amount are required");
      return;
    }

    try {
      setLoading(true);

      // ✅ Step 1: Create PaymentIntent from backend
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/v1/stripe/create-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalPrice * 100, // Stripe expects amount in cents
            userId: user._id,
          }),
        }
      );

      const data = await res.json();
      console.log("Stripe Payment Intent:", data);

      if (!data.clientSecret) {
        toast.error("Client secret missing from backend");
        return;
      }

      // ✅ Step 2: Confirm payment using Stripe.js
      const stripe = await stripePromise;
      const elements = stripe.elements();
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        console.error("Payment error:", error);
        toast.error(`Payment failed: ${error.message}`);
        return;
      }

      // ✅ Step 3: Save Payment Details in Database
      const saveRes = await fetch(
        `${BACKEND_BASE_URL}/api/v1/stripe/payment-success`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            amount: finalPrice,
            currency: "usd",
            provider: "stripe",
            transactionId: paymentIntent.id,
            paymentIntentId: paymentIntent.id,
            paymentMethod: "stripe",
            status: paymentIntent.status,
          }),
        }
      );

      const saveData = await saveRes.json();
      console.log("Saved Payment:", saveData);

      toast.success("Payment successful!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong during payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaypalPayment = () => {
    alert("Redirecting to PayPal checkout...");
    // Integrate PayPal SDK here
  };

  const handleCryptoPayment = () => {
    alert("Connecting to crypto wallet (e.g., MetaMask)...");
    // Integrate MetaMask or crypto API here
  };

  return (
    <div className="max-w-[918px] mt-24 w-full h-auto flex flex-col md:flex-row gap-6 md:gap-[54px] px-4">
      {/* Image */}

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

      {/* --------------------------------------------------------------- */}

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
                  <div className="bg-[#002AA8] mr-0.5 w-[0.25rem] h-[1.2rem]"></div>

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

      {/* ---------------------------------------------------------  */}

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
                  <div className="bg-[#002AA8] mr-0.5 w-[0.25rem] h-[1.2rem]"></div>

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
              <button onClick={() => openThirdModal(item.price + 0.5)}>
                <CustomButton text="Confirm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Third Modal (Connect Wallet) */}
      {isThirdOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-50 pt-16 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full mx-auto relative border border-gray-700 shadow-2xl mt-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg font-semibold">
                  Select Payment Method
                </h2>
                <button
                  onClick={closeThirdModal}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-xl font-light bg-gray-700 hover:bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Choose your preferred payment option
              </p>
            </div>

            {/* Payment Options */}
            <div className="p-6 space-y-4">
              {/* Stripe */}
              <button
                onClick={handleStripePayment}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3.5 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center group shadow-sm"
              >
                <img
                  src="https://cdn.worldvectorlogo.com/logos/stripe-4.svg"
                  alt="Stripe"
                  className="w-5 h-5 mr-3"
                />
                Pay with Stripe
                <span className="ml-2 text-xs text-gray-500 group-hover:text-gray-700">
                  • Cards & Bank
                </span>
              </button>

              {/* PayPal */}
              <button
                onClick={handlePaypalPayment}
                className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-medium py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center group shadow-sm"
              >
                <img
                  src="https://cdn.worldvectorlogo.com/logos/paypal-3.svg"
                  alt="PayPal"
                  className="w-5 h-5 mr-3 bg-white p-0.5 rounded"
                />
                Pay with PayPal
                <span className="ml-2 text-xs text-blue-200 group-hover:text-blue-100">
                  • Secure
                </span>
              </button>

              {/* Crypto */}
              <button
                onClick={handleCryptoPayment}
                className="w-full bg-gray-900 hover:bg-gray-950 text-white font-medium py-3.5 px-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 flex items-center justify-center group shadow-sm"
              >
                <img
                  src="https://cdn.worldvectorlogo.com/logos/bitcoin-btc.svg"
                  alt="Cryptocurrency"
                  className="w-5 h-5 mr-3 bg-orange-500 rounded-full p-0.5"
                />
                Pay with Crypto
                <span className="ml-2 text-xs text-gray-400 group-hover:text-gray-300">
                  • Bitcoin & More
                </span>
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-850 rounded-b-xl border-t border-gray-700">
              <button
                onClick={closeThirdModal}
                className="w-full text-gray-400 hover:text-white text-sm font-medium py-2.5 hover:bg-gray-750 rounded-lg transition-colors duration-200"
              >
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
