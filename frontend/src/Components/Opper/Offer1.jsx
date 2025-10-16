import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import CustomButton from "../Buttons/Button1";
import VisaImage from "../../assets/images/visa.png";
import MasterCard from "../../assets/images/Mastercard.png";

import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { BACKEND_BASE_URL } from "../../Config"



function CardPayment() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const { item } = location.state || {};
   const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  console.log("your login user data are :",user);
  console.log("your login user token are :",token);
  console.log("your selected item is :",item);
  



  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    if(!user || !token){
      toast.error("User and token data is required")
    }
    if (!stripe || !elements) return setError("Stripe not loaded");

    setLoading(true);

    try {
      // Get card elements
      const cardNumberElement = elements.getElement(CardNumberElement);

      // Create payment method
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardNumberElement,
        billing_details: { name },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Send payment data to backend
      const paymentData = {
        userId: user?.id,
        userInfo: { name:user.Fullname, email:user?.email },
        gameDetails: {
          gameId: item?.id || item._id,
          serialNumber: item.serialNumber || item.code,
          title: item.title || item.name,
          price: item.price,
        },
        paymentDetails: {
          amount: item.price * 100,
          payment_method_id: paymentMethod.id,
          provider: "stripe",
          currency: "usd",
        },
      };
      if(!BACKEND_BASE_URL){
        toast.error("Base Url is requried")
      }

      // const response = await axios.post("http://localhost:4700/api/v1/card/pay-with-card", paymentData);
      const response = await axios.post(`${BACKEND_BASE_URL}/api/v1/card/pay-with-card", paymentData`);

      if (response.data.success) {
        toast.success("Payment Successful!");
        navigate("/success", { state: { payment: response.data } });
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="hidden md:block absolute md:top-[70px] top-[75px] left-[23px] md:left-10 text-white text-lg p-2 hover:bg-gray-800 rounded-full transition-colors duration-200"
      >
        <FaArrowLeft />
      </button>

      <form
        onSubmit={handlePayment}
        className="flex flex-col gap-5 p-4 mx-auto mt-24 relative text-white"
        style={{ maxWidth: "409px", width: "100%", fontFamily: "Inter, sans-serif" }}
      >
        {/* Card Number */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium">Card number</label>
          <div className="w-full h-[46px] px-3 border rounded bg-transparent flex items-center">
            <CardNumberElement
              options={{ style: { base: { color: "#fff", fontSize: "16px", '::placeholder': { color: "#999" } } } }}
              className="w-full outline-none bg-transparent"
            />
            <div className="flex gap-2 ml-2 pointer-events-none">
              <img src={VisaImage} alt="Visa" className="w-6 h-4 object-contain" />
              <img src={MasterCard} alt="MasterCard" className="w-6 h-4 object-contain" />
            </div>
          </div>
        </div>

        {/* Expiry + CVV */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 w-1/2">
            <label className="text-sm font-medium">Expiry date</label>
            <div className="w-full h-[46px] px-3 border rounded bg-transparent flex items-center">
              <CardExpiryElement
                options={{ style: { base: { color: "#fff", fontSize: "16px", '::placeholder': { color: "#999" } } } }}
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <label className="text-sm font-medium">CVV/CVC</label>
            <div className="w-full h-[46px] px-3 border rounded bg-transparent flex items-center">
              <CardCvcElement
                options={{ style: { base: { color: "#fff", fontSize: "16px", '::placeholder': { color: "#999" } } } }}
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Name on Card */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Name on card</label>
          <input
            type="text"
            placeholder="Name on card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-[46px] px-3 border rounded text-white placeholder-gray-400 bg-transparent outline-none"
            required
          />
        </div>

        {/* General Error */}
        {error && (
          <div className="text-red-500 text-center bg-red-100 bg-opacity-10 py-2 px-3 rounded">
            {error}
          </div>
        )}

        {/* Purchase Button */}
        <div className="flex justify-center mt-4">
          <button>
                      <CustomButton text={loading ? "Processing..." : "Purchase Now"} disabled={loading} />

          </button>
        </div>
      </form>
    </>
  );
}

export default CardPayment;
