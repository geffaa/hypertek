import React, { useState, useRef } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { FiCopy } from "react-icons/fi";
import { ArrowRight } from "lucide-react";
import CustomButton from "../../Components/Buttons/Button1";
import GlowingOrb from "../Common/BgColoring";
import Profile from "../../assets/images/Profile/Profile.png";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { logout } from "../../Redux/AuthSlice";


function EditProfile() {
  const navigate = useNavigate();
  const walletAddress = "0xc416a645...b21a";
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();

  // ✅ Get token from Redux or localStorage
  const token =
    useSelector((state) => state.auth.token) ||
    JSON.parse(localStorage.getItem("auth"))?.token;

  // ✅ Get user data passed from Profile page
  const location = useLocation();
  const { userData } = location.state || {};

  // ✅ Initialize states
  const [name, setName] = useState(userData?.FullName || "");
  const [email, setEmail] = useState(userData?.Email || "");
  const [bio, setBio] = useState(userData?.Bio || "");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [profileImage, setProfileImage] = useState(
    userData?.Avatar ? userData.Avatar : Profile
  );



const handleLogout = () => {
  dispatch(logout());    
  toast.success("User Logout Successfully")    // ✅ clears Redux state & localStorage
  navigate("/signin");        // ✅ redirect to login page
};


  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ Copy wallet
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Handle image selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  // ✅ Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPass && newPass !== confirmPass) {
      return toast.error("New password and confirm password do not match");
    }

    try {
      const formData = new FormData();
      formData.append("FullName", name);
      formData.append("Email", email);
      formData.append("Password", currentPass);
      formData.append("NewPassword", newPass);
      formData.append("Bio", bio);
      if (file) formData.append("Avatar", file);

      const res = await axios.put(
        "http://localhost:3000/api/v1/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully!");
      console.log("✅ Updated user:", res.data.user);

      // Redirect back to profile or another page
      navigate("/profile", { state: { userData: res.data.user } });
    } catch (error) {
      console.error("❌ Update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Glowing Orbs */}
      <GlowingOrb Xaxis={100} Yaxis={100} />
      <GlowingOrb Xaxis={920} Yaxis={480} />
      <GlowingOrb Xaxis={180} Yaxis={680} />
      <GlowingOrb Xaxis={920} Yaxis={1000} />

      {/* Hero Section */}
      <div className="mx-auto mt-20 mb-16 lg:mt-[92px]">
        <div className="w-full">
          <div
            className="relative h-40 sm:h-48 md:h-56 lg:h-[237px]   sm:-mx-6 lg:-mx-8 bg-cover bg-top bg-no-repeat rounded-none shadow-lg mb-20 md:mb-24"
            style={{ backgroundImage: `url(${overview1})` }}
          ></div>

          {/* Profile Info */}
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col items-center text-center">
              <img
                   src={userData.Avatar ? `http://localhost:3000${userData.Avatar}` : Profile}
                alt="Profile"
                className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg cursor-pointer -mt-16 border-2 border-white"
                onClick={handleProfileClick}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="mt-3 text-white">
                <h2 className="text-lg md:text-xl font-semibold">{name}</h2>
                <p className="text-xs sm:text-sm text-gray-400 break-words flex items-center gap-2">
                  {userData?.DiscordId ||
                    userData?.GoogleId ||
                    userData?._id ||
                    "null"}
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition"
                    title="Copy to clipboard"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-green-400 text-[10px]">Copied!</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Form */}
      <section className="max-w-3xl mx-auto mb-10 px-4">
        <div className="p-6 sm:p-10 bg-transparent rounded-2xl">
          <form
            className="flex flex-col gap-6 items-center"
            onSubmit={handleSubmit}
          >
            {/* Name */}
            <div className="w-full max-w-md">
              <label className="block text-[25px] text-[#FFFFFF] font-medium mb-4">
                Enter your details
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-transparent border border-white rounded-xl px-3 py-2 text-sm text-white "
              />
            </div>

            {/* Email */}
            <div className="w-full max-w-md">
              <label className="block text-[#FFFFFF] text-[25px] font-medium mb-4">
                Enter your email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white "
              />
            </div>

            {/* Bio */}
            <div className="w-full max-w-md">
              <label className="block text-[#FFFFFF] text-[25px] font-medium mb-1">
                Enter your bio
              </label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter Your Bio"
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white "
              ></textarea>
            </div>

            {/* Reset Password */}
            <div className="w-full max-w-md flex flex-col gap-4">
              <label className="block text-[#FFFFFF] text-[25px] font-medium">
                Reset Password
              </label>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white "
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white focus:outline-none "
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white focus:outline-none "
              />

              <button
  type="button"
  onClick={handleLogout}
  className="text-red-500 text-sm flex items-center gap-2 cursor-pointer"
>
  Logout
  <ArrowRight className="w-4 h-4" />
</button>

            </div>

            {/* Save Button */}
           {/* Save Button */}
<div className="flex justify-center w-full">
  <div className="max-w-md w-full">
    <button type="submit" className="mx-auto block">
      <CustomButton text="Save" />
    </button>
  </div>
</div>


          </form>
        </div>
      </section>
    </div>
  );
}

export default EditProfile;
