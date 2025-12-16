// components/layouts/DashboardLayout.jsx
import Sidebar from "../components/common/sidebar";
import Header from "../components/common/header";
import { Outlet } from "react-router-dom";
import LogoutModal from "../components/common/LogoutModel";


import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";


const DashboardLayout = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="flex h-screen max-w-[1400px] mx-auto text-white relative bg-black overflow-hidden">
      {/* Global Blur Background Circles */}

      {/* Sidebar */}
      <Sidebar onLogoutClick={() => setShowLogoutModal(true)} />

      {/* Main area */}
      <div className="flex flex-col flex-1  h-screen">
        {/* Header: fixed on top with transparent bg */}
        <div className="h-[10px] top-0 left-[298px]  right-0 z-20">
          <Header />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 mt-[40px] overflow-y-auto p-4  z-10">
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
          window.location.href = "/login";
          setShowLogoutModal(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
