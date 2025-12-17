import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";

import CustomButton from "../Buttons/Button1";
import { FiEye, FiEdit2 } from "react-icons/fi";
import { BACKEND_BASE_URL } from "../../Config";

function Buy1() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Selected NFT item
  const { item } = location.state || {};

  // 🔥 Collection coming from item
  const collection = item?.collection;

  const { user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);

  useEffect(() => {
    if (!item) {
      toast.error("No item selected");
      navigate("/buy-nfa");
    }
  }, [item, navigate]);

  const handlePayment = async (productId) => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/game/create`,
        {
          userId: user.id,
          productId,
        }
      );

      if (res.data?.exist === "no") {
        navigate("/stripe-payment", { state: { item } });
      } else {
        toast.error("Already purchased");
      }
    } catch (err) {
      toast.error("Payment failed");
    }
  };

  const handlePaymentCard = async (productId) => {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/game/create`,
        {
          userId: user.id,
          productId,
        }
      );

      if (res.data?.exist === "no") {
        navigate("/offer", { state: { item } });
      } else {
        toast.error("Already purchased");
      }
    } catch (err) {
      toast.error("Payment failed");
    }
  };

  if (!item) return null;

  return (
    <div className="flex flex-col text-white px-4">
      {/* ---------------- NFT DETAILS ---------------- */}
      <div className="max-w-[918px] w-full mx-auto mt-20 flex flex-col md:flex-row gap-8">
        {/* Image */}
        <img
          src={`${BACKEND_BASE_URL}${collection?.image}`}
          alt={collection?.name}
          className="w-full md:w-[375px] h-[350px] rounded-lg object-cover"
        />

        {/* Content */}
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold">
            {collection?.name}
          </h1>

          <p className="opacity-60">
            Chain: {collection?.chain} | Symbol: {collection?.symbol}
          </p>

          <div className="bg-[#17171887] p-6 rounded-lg">
            <div className="flex justify-between opacity-70">
              <span>Price</span>
              <span>Owner: {collection?.owner}</span>
            </div>

            <h2 className="text-xl mt-3">
              {item.priceETH} {collection?.symbol}
            </h2>

            <div className="flex justify-end mt-4">
              <FiEye /> <span className="ml-2">505 Views</span>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setIsOpen(true)}>
                <CustomButton text="Buy Now" />
              </button>

              <button onClick={() => handlePaymentCard(item._id)}>
                <CustomButton text="Buy With Card" />
              </button>
            </div>

            <Link
              to="/payment"
              state={{ item }}
              className="flex items-center gap-2 mt-4"
            >
              Make Offer <FiEdit2 />
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------- FIRST MODAL ---------------- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-start pt-20 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#252B37] p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center">Buy Asset</h2>

            <img
              src={`${BACKEND_BASE_URL}${collection?.image}`}
              alt={collection?.name}
              className="w-40 h-36 mx-auto my-4 rounded object-cover"
            />

            <h3 className="text-center font-semibold">
              {collection?.name}
            </h3>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>List Price</span>
                <span>
                  {item.priceETH} {collection?.symbol}
                </span>
              </div>

              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Platform Fee</span>
                <span>0.5 {collection?.symbol}</span>
              </div>

              <div className="flex justify-between bg-white/10 px-4 py-2 rounded">
                <span>Total</span>
                <span>
                  {Number(item.priceETH) + 0.5} {collection?.symbol}
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setIsOpen(false)}>
                <CustomButton text="Cancel" />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSecondOpen(true);
                }}
              >
                <CustomButton text="Continue" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SECOND MODAL ---------------- */}
      {isSecondOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-start pt-20 z-50"
          onClick={() => setIsSecondOpen(false)}
        >
          <div
            className="bg-[#252B37] p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center">
              Confirm Purchase
            </h2>

            <div className="flex justify-between bg-white/10 px-4 py-2 mt-6 rounded">
              <span>Total Price</span>
              <span>
                {Number(item.priceETH) + 0.5} {collection?.symbol}
              </span>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setIsSecondOpen(false)}>
                <CustomButton text="Close" />
              </button>

              <button onClick={() => handlePayment(item._id)}>
                <CustomButton text="Confirm" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Buy1;
