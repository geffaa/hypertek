// components/layouts/DashboardLayout.jsx
import Sidebar from "../Components/Dashboard/Sidebar";
import Header from "../Components/Dashboard/Header";
import { Outlet } from "react-router-dom";
import LogoutModal from "../Components/Dashboard/LogoutModal";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LockOverlay from "../Components/Common/LockOverlay";
import { LAUNCH_LOCKED } from "../Config";

const DashboardLayout = () => {
  const { t } = useTranslation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen text-white relative bg-[#100F0F] w-full overflow-hidden">

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
        <div className="relative top-0 left-0 right-0 z-50">
          <Header onMenuClick={toggleSidebar} />
        </div>

        {/* Scrollable main content.
            Pre-launch: every dashboard sub-page is locked behind one overlay.
            Sign-up and wallet creation live outside this shell, so they keep
            working while this lock is up. */}
        <main className="flex-1 min-h-0 flex flex-col mt-[1px] overflow-hidden pt-4 pb-4 pl-4 md:pt-6 md:pb-6 md:pl-6 relative z-10">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col pr-4 md:pr-6">
            <LockOverlay
              locked={LAUNCH_LOCKED}
              title={t("marketplace.launchLock.dashboardTitle", "Your dashboard unlocks at launch — coming very soon!")}
              desc={t("marketplace.launchLock.desc", "Don't let that stop you. Sign up, explore this amazing project, see how it could reward you, and help make it happen. Become a Hyper Tekin and create something new!")}
            >
              <Outlet />
            </LockOverlay>
          </div>
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
