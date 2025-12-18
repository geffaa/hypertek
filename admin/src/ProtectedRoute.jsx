import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const ProtectedRoute = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Delay the auth check by 5 seconds
    const timer = setTimeout(() => {
      const data = localStorage.getItem("admin_data");

      if (data) {
        try {
          const admin = JSON.parse(data);
          if (admin && admin._id) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } catch (err) {
          console.error("Failed to parse admin_data:", err);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }

      setIsChecked(true);
    }, 5000); // 5000ms = 5s

    return () => clearTimeout(timer); // cleanup if component unmounts
  }, []);

  // ⛔ Wait until auth check finishes
  if (!isChecked) return null;

  // ❌ Not logged in → redirect AFTER check
  if (!isLoggedIn) {
    toast.error("Please login to access this page");
    window.location.href = "https://hyper-tek-games.deventiatech.com/signin";
    // window.location.href = "http://localhost:5173/signin";
    return null;
  }

  // ✅ Authenticated
  return <Outlet />;
};

export default ProtectedRoute;
