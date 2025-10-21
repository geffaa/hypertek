import React, { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY, BACKEND_BASE_URL } from "../Config";

import { useLocation } from "react-router-dom"; // add this
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

function ConvertToSubcurrency(amount, factor = 100) {
  return Math.round(amount * factor);
}

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error("STRIPE_PUBLISHABLE_KEY is not defined");
}
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ amount, item, user }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!amount) return;
    if (!amount || !item || !user) {
      toast.error("User data , amount and item details are required");
    }
    const createPaymentIntent = async () => {
      try {
        const res = await fetch(
          `${BACKEND_BASE_URL}/api/v1/payment/create-payment-intent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: ConvertToSubcurrency(amount),
              userId: user?.id,
              gameId: item?._id,
              gameTitle: item?.title,
              serialNumber: item?.serialNumber,
              currency: "usd",
              email: user?.email,
              productId: item?._id,
            }),
          }
        );

        const data = await res.json();
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setErrorMessage("Failed to get client secret");
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to create payment intent");
      }
    };
    createPaymentIntent();
  }, [amount, item, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      toast.error(submitError.message); // show toast for submit error
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `https://hyper-tek-games.deventiatech.com/dashboard?amount=${amount}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      toast.error(error.message); // show toast if payment fails
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success(`Payment Successful! ✅ Amount: $${amount}`); // show success toast
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="bg-white/30 backdrop-blur-2xl shadow-xl rounded-2xl p-10 border border-white/20 hover:shadow-3xl transition-all duration-300">
        <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6 drop-shadow">
          💳 Secure Payment
        </h2>

        {/* ✅ Show Item Details */}
        {item && (
          <div className="mb-6 text-center">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-32 h-32 mx-auto rounded-xl shadow-md object-cover mb-3"
              />
            )}
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-gray-700 text-sm mb-1">{item.description}</p>
            <p className="text-lg font-semibold text-indigo-700">
              ${item.price}
            </p>
          </div>
        )}
        <p className="text-center text-gray-700 mb-4">
          You are paying
          <span className="font-semibold text-gray-900">${amount}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {clientSecret && <PaymentElement />}

          {errorMessage && (
            <p className="text-red-500 text-sm mt-3 text-center animate-pulse">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-center mt-6">
            <button
              disabled={!stripe || loading}
              className={`w-1/2 py-3 rounded-xl font-semibold text-white text-lg tracking-wide transition-all duration-200 
      ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
      }`}
            >
              {loading ? "Processing..." : `Pay $${amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const location = useLocation();
  const { item } = location.state || {};
  const { user, isLoggedInUser } = useSelector((state) => state.auth);

  console.log("Received item:", item);
  console.log("your login user data are :", user);

  const amount = item?.price;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-100 via-purple-100 to-indigo-100">
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: ConvertToSubcurrency(amount),
          currency: "usd",
        }}
      >
        <CheckoutForm amount={amount} item={item} user={user} />
      </Elements>
    </div>
  );
}
