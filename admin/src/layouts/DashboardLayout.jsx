// components/layouts/DashboardLayout.jsx
import Sidebar from "../components/common/sidebar";
import BgEffect2 from "../components/common/BgEffect2";
import Header from "../components/common/header";
import { Outlet } from "react-router-dom";
import LogoutModal from "../components/common/LogoutModel";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Dashboard_Base_Url } from "../Config";
import { useDispatch, useSelector } from "react-redux";
import { setAdmin } from "../Redux/AdminSlice";
import toast from "react-hot-toast";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { userId } = useParams();
  const dispatch = useDispatch();

  const hideScrollPages = ["/collections"];
  const shouldHideScroll = hideScrollPages.some((page) =>
    location.pathname.includes(page)
  );

  // When redirected from frontend with ?token=...,
  // capture it once and persist in this (admin) origin.
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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen text-white relative bg-[#100F0F] max-w-[1400px] mx-auto overflow-hidden">

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 h-screen relative w-full overflow-hidden">

        {/* Header: fixed on top */}
        <div className="top-0 left-0 right-0 z-30 bg-[#100F0F]/80 backdrop-blur-md">
          <Header toggleSidebar={toggleSidebar} />
        </div>

        {/* Scrollable main content */}
        <main className={`flex-1 pt-3 px-4 md:px-6 z-10 custom-scrollbar ${shouldHideScroll ? "overflow-hidden" : "overflow-y-auto"}`}>
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
          window.location.href = "https://hyper-tek-games.deventiatech.com/signin";
          setShowLogoutModal(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
