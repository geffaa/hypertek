// components/layouts/DashboardLayout.jsx
import Sidebar from "../Components/Dashboard/Sidebar";
import Header from "../Components/Dashboard/Header";
import { Outlet } from "react-router-dom";
import LogoutModal from "../Components/Dashboard/LogoutModal";
import { useState } from "react";

const DashboardLayout = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen text-white relative bg-[#100F0F] max-w-[1400px] mx-auto overflow-hidden">

      {/* Global Background Effects */}
      <div
        className="fixed top-[120px] left-[10%] w-[300px] h-[300px] bg-[#002AA8] rounded-full blur-[150px] opacity-40 pointer-events-none z-0"
      ></div>
      <div
        className="fixed bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#002AA8] rounded-full blur-[150px] opacity-40 pointer-events-none z-0"
      ></div>

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
      <div className="flex flex-col flex-1 h-screen relative z-10">

        {/* Header: fixed on top with transparent bg */}
        <div className="top-0 left-0 right-0 z-30">
          <Header onMenuClick={toggleSidebar} />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 mt-[1px] overflow-y-auto p-4 md:p-6 custom-scrollbar">
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
