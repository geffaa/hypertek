// components/layouts/DashboardLayout.jsx
import Sidebar from "../Components/Dashboard/Sidebar";
import Header from "../Components/Dashboard/Header";
import { Outlet } from "react-router-dom";
import LogoutModal from "../Components/Dashboard/LogoutModal";
import { useState } from "react";

const DashboardLayout = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="flex h-screen text-white relative bg-black max-w-[1400px] mx-auto overflow-hidden">
      
      {/* Global Blur Background Circles */}
  
     

      {/* Sidebar */}
      <Sidebar onLogoutClick={() => setShowLogoutModal(true)} />

      {/* Main area */}
      <div className="flex flex-col flex-1  h-screen">
        
        {/* Header: fixed on top with transparent bg */}
        <div className="top-0 left-0 right-0 z-20">
          <Header />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 mt-[1px] overflow-y-auto p-4  z-10">
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
          window.location.href = "/signin";
          setShowLogoutModal(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
