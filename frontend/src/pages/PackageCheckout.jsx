import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY, BACKEND_BASE_URL } from "../Config";
import { toast } from "react-hot-toast";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
const toCents = (usd) => Math.round(usd * 100);

function CheckoutForm({ pkg, purchase }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?packagePurchase=${purchase._id}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="checkout-form">
      <PaymentElement />
      {errorMessage && <p className="text-red-500 text-sm mt-3 text-center">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        data-testid="pay-button"
        className={`w-full mt-6 py-3 rounded-xl font-semibold text-white text-lg transition-all duration-200 ${
          submitting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        }`}
      >
        {submitting ? "Processing..." : `Pay $${pkg.priceUSD}`}
      </button>
    </form>
  );
}

export default function PackageCheckoutPage() {
  const { idOrSlug } = useParams();
  const { user, token: authToken, isLoggedInUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [purchase, setPurchase] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedInUser) {
      toast.error("Please log in to buy a package");
      navigate("/signin");
      return;
    }

    const run = async () => {
      try {
        const pkgRes = await fetch(`${BACKEND_BASE_URL}/api/v1/packages/${idOrSlug}`);
        const pkgData = await pkgRes.json();
        if (!pkgData.success) throw new Error(pkgData.error || "Package not found");
        setPkg(pkgData.package);

        const purchaseRes = await fetch(`${BACKEND_BASE_URL}/api/v1/packages/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ packageId: pkgData.package._id, buyerWallet: user?.WalletAddress || user?.MetaMaskAddress }),
        });
        const purchaseData = await purchaseRes.json();
        if (!purchaseData.success) throw new Error(purchaseData.error || "Could not start purchase");
        setPurchase(purchaseData.purchase);

        const intentRes = await fetch(`${BACKEND_BASE_URL}/api/v1/payment/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: toCents(pkgData.package.priceUSD),
            userId: user?.id || user?._id,
            email: user?.Email || user?.email,
            productId: "package",
            packageId: pkgData.package._id,
            packagePurchaseId: purchaseData.purchase._id,
          }),
        });
        const intentData = await intentRes.json();
        if (!intentData.clientSecret) throw new Error(intentData.error || "Could not start payment");
        setClientSecret(intentData.clientSecret);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [idOrSlug, isLoggedInUser]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading checkout...</div>;
  }
  if (error || !pkg) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Package not found"}</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-100 via-purple-100 to-indigo-100 py-10 px-4">
      <div className="w-full max-w-lg bg-white/30 backdrop-blur-2xl shadow-xl rounded-2xl p-10 border border-white/20">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Checkout</h2>
        <div className="mb-6 text-center">
          {pkg.image && <img src={pkg.image} alt={pkg.name} className="w-28 h-28 mx-auto rounded-xl object-cover mb-3" />}
          <h3 className="text-xl font-semibold">{pkg.name}</h3>
          <p className="text-lg font-semibold text-indigo-700">${pkg.priceUSD}</p>
        </div>

        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm pkg={pkg} purchase={purchase} />
          </Elements>
        )}
      </div>
    </div>
  );
}
