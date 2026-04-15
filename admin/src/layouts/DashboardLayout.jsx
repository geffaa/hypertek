// components/layouts/DashboardLayout.jsx
import Sidebar from "../components/common/sidebar";

import Header from "../components/common/header";
import { Outlet } from "react-router-dom";
import LogoutModal from "../components/common/LogoutModel";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Dashboard_Base_Url } from "../Config";
import { useDispatch } from "react-redux";
import { setAdmin } from "../Redux/AdminSlice";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const DashboardLayout = () => {
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const shouldHideScroll = false;
  const { userId } = useParams();
  const dispatch = useDispatch();

  // ✅ When redirected from frontend with ?token=...,
  //    capture it once and persist in this (admin) origin.
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("role", "admin");
    }
  }, [location.search]);

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/${userId}`);
        const adminData = res.data?.admin || res.data?.user;
        if (!adminData?._id) throw new Error("Invalid admin data");
        dispatch(setAdmin(adminData));
        localStorage.setItem("admin_data", JSON.stringify(adminData));
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      }
    };
    fetchUserData();
  }, [userId, dispatch]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen text-white relative w-full overflow-hidden" style={{ background: "#060610" }}>

      {/* Global background glow orbs */}
      <div style={{ position: "fixed", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.2)", filter: "blur(500px)", top: "-10%", left: "-10%", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: "700px", height: "700px", borderRadius: "50%", background: "rgba(0,42,168,0.2)", filter: "blur(500px)", bottom: "-10%", right: "-10%", pointerEvents: "none", zIndex: 0 }} />

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        onLogoutClick={() => setShowLogoutModal(true)}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden w-full">
        {/* Header: fixed on top */}
        <div className="top-0 left-0 right-0 z-20">
          <Header toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable main content */}
        <main
          className={`flex-1 pt-3 px-6 z-10 ${shouldHideScroll ? "overflow-hidden" : "overflow-y-auto"
            }`}
        >
          <Outlet />
        </main>


      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href =
            `${import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}/signin`;
          setShowLogoutModal(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;