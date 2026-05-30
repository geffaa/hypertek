import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const ProtectedRoute = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("admin_data");

    if (data) {
      try {
        const admin = JSON.parse(data);
        if (admin && admin._id) {
          setIsLoggedIn(true);
          setIsChecked(true);
          return;
        }
      } catch (err) {
        console.error("Failed to parse admin_data:", err);
      }
    }

    // Fresh admin login: token arrives via URL ?token=... before DashboardLayout
    // has time to fetch and store admin_data. Allow entry so DashboardLayout can
    // complete the handshake (fetch admin, store admin_data).
    const tokenFromUrl = new URLSearchParams(window.location.search).get("token");
    if (tokenFromUrl) {
      setIsLoggedIn(true);
      setIsChecked(true);
      return;
    }

    setIsChecked(true);
  }, []);

  // ⏳ Show loading screen while checking auth
  if (!isChecked) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTop: "3px solid #002AA8",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#888" }}>
          Verifying authentication...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  //  Not logged in → redirect to frontend login
  if (!isLoggedIn) {
    toast.error("Please login to access this page");
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    window.location.href = `${frontendUrl}/signin`;
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTop: "3px solid #002AA8",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#888" }}>
          Redirecting to login...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Authenticated
  return <Outlet />;
};

export default ProtectedRoute;
