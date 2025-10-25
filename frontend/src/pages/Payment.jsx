import React from "react";
import { useLocation } from "react-router-dom";
import Pay1 from "../Components/Payments/Pay1";

function Payment() {
  const location = useLocation();
  let { item } = location.state || {};

  // fallback to localStorage
  if (!item) {
    const saved = localStorage.getItem("paymentItem");
    if (saved) item = JSON.parse(saved);
  }

  console.log("Payment item:", item);

  return <Pay1 item={item} />;
}

export default Payment;
