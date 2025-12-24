// components/layouts/DashboardLayout.jsx
import Sidebar from "../components/common/sidebar";
import Header from "../components/common/header";
import { Outlet } from "react-router-dom";
import LogoutModal from "../components/common/LogoutModel";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Dashboard_Base_Url } from "../Config";
import { useDispatch } from "react-redux";
import { setAdmin } from "../Redux/AdminSlice"
import { useParams } from "react-router-dom";



import {  useSelector } from "react-redux";
import toast from "react-hot-toast";


const DashboardLayout = () => {
const [userData, setUserData] = useState(null); // store fetched user data
const location = useLocation(); // hook to access current URL



// List routes where you want to hide scroll
// Hide scroll for specific pages (dynamic user ID)
const hideScrollPages = ["/collections"]; // check if pathname includes this
const shouldHideScroll = hideScrollPages.some((page) =>
  location.pathname.includes(page)
);


  const { userId } = useParams();
console.log("your user Id is:", userId);

  const dispatch = useDispatch();
  // const admin = useSelector((state) => state.admin.admin);

  console.log("your user Id are :",userId);


    
useEffect(() => {
  if (!userId) return;

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/${userId}`);
      const adminData = res.data?.admin || res.data?.user;

      console.log("your user data are :",res);

      if (!adminData?._id) throw new Error("Invalid admin data");

      dispatch(setAdmin(adminData));
      localStorage.setItem("admin_data", JSON.stringify(adminData));
      // toast.success("Admin data loaded successfully");
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      // toast.error("Failed to fetch admin data");
    }
  };

  fetchUserData();
}, [userId, dispatch]);


  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="flex h-screen max-w-[1400px] mx-auto text-white relative bg-black overflow-hidden">
      {/* Global Blur Background Circles */}

      {/* Sidebar */}
      <Sidebar onLogoutClick={() => setShowLogoutModal(true)} />

      {/* Main area */}
      <div className="flex flex-col flex-1  h-screen">
        {/* Header: fixed on top with transparent bg */}
        <div className="h-[35px] top-0 left-[298px]  right-0 z-20">
          <Header />
        </div>
        
        {/* Scrollable main content */}
     <main
  className={`flex-1 mt-[35px] p-4 z-10 ${
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
          window.location.href = "https://hyper-tek-games.deventiatech.com/signin";
          setShowLogoutModal(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
