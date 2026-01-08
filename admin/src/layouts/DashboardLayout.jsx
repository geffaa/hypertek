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
  const location = useLocation();
  const hideScrollPages = ["/collections"];
  const shouldHideScroll = hideScrollPages.some((page) =>
    location.pathname.includes(page)
  );
  const { userId } = useParams();
  const dispatch = useDispatch();

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

  return (
    <div className="flex w-full min-h-screen text-white relative bg-black overflow-hidden">

      {/* Global Blur Background Circles */}

      {/* Sidebar */}
      <Sidebar onLogoutClick={() => setShowLogoutModal(true)} />
      
      {/* Main area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Header: fixed on top */}
        <div className="h-[35px] w-full z-20">
          <Header />
        </div>
        
        {/* Scrollable main content */}
     <main
  className={`flex-1 pt-3 px-4 z-10 ${
    shouldHideScroll ? "overflow-hidden" : "overflow-y-auto"
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
            "https://hyper-tek-games.deventiatech.com/signin";
          setShowLogoutModal(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
