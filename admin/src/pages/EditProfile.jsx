import React, { useState, useRef } from "react";
import overview1 from "../assets/Hero1.jpeg";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera, FiCopy, FiEye, FiEyeOff } from "react-icons/fi";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FullScreenLoader from "../components/common/Spinner";

// ✅ Import your Header component
// import Header from "../components/common/header";


function EditAdminProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Admin data from localStorage
  const adminDataString = localStorage.getItem("admin_data");
  const adminData = adminDataString ? JSON.parse(adminDataString) : {};
  const adminId = adminData?._id;

  const [name, setName] = useState(adminData.name || "");
  const [username, setUsername] = useState(adminData.username || "");
  const [email, setEmail] = useState(adminData.email || "");
  const [bio, setBio] = useState(adminData.bio || "");
  const [profileImage, setProfileImage] = useState(
    adminData.Avatar ? `${Image_Base_Url}${adminData.Avatar}` : null
  );

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Profile image upload
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

  // Copy admin ID
  const handleCopy = () => {
    navigator.clipboard.writeText(adminId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit updated profile
  const handleSubmit = async () => {
    if (newPass && newPass !== confirmPass) {
      toast.error("New password and confirm password do not match");
      return;
    }

    const formData = new FormData();
    formData.append("FullName", name);
    formData.append("Username", username);
    formData.append("Email", email);
    formData.append("Bio", bio);
    if (newPass) formData.append("Password", newPass);
    if (file) formData.append("Avatar", file);

    try {
      setLoading(true);
      const res = await fetch(`${Dashboard_Base_Url}/v1/edit/${adminId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        toast.success("Admin profile updated successfully!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Error updating profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_data");
    navigate("/login");
  };

  if (loading) return <FullScreenLoader />;

  return (

    <div className="min-h-screen relative bg-black">
      {/* Hero Banner */}

      {/* ✅ Header */}
      {/* <Header /> */}


      <div
        style={{
          top: "400px",
          left: "800px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full pointer-events-none z-0"
      ></div>

      <div
        style={{
          top: "600px",
          left: "220px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full pointer-events-none z-0"
      ></div>
      <div
        style={{
          bottom: "0", // move to bottom
          left: "80%", // center horizontally
          transform: "translateX(-50%)", // center exactly
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full pointer-events-none z-0"
      ></div>




      <div
        className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] bg-cover bg-top shadow-lg mb-20 md:mb-24"
        style={{ backgroundImage: `url(${overview1})` }}
      ></div>

      {/* Profile Section */}
      <div className="relative -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-36 px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center">
        <div className="relative flex-shrink-0 cursor-pointer">
          {profileImage ? (
            <img
              src={profileImage.startsWith("data:") ? profileImage : `${Image_Base_Url}${profileImage}`}
              alt="Admin Profile"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg border-2 border-white object-cover"
              onError={() => setProfileImage(null)}
            />
          ) : (
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg w-24 h-24 md:w-28 md:h-28 border-2 border-white">
              <FaUserCircle className="w-16 h-16 md:w-20 md:h-20" />
            </div>
          )}

          {/* Camera Icon */}
          <div
            className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full border-2 border-white hover:bg-blue-600"
            onClick={handleProfileClick}
          >
            <FiCamera className="w-4 h-4 text-white" />
          </div>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="mt-3 text-white">
          <h2 className="text-lg md:text-xl font-semibold">{name}</h2>
          <p className="text-xs sm:text-sm text-gray-400 break-words flex items-center gap-2">
            {adminId || "null"}
            <button onClick={handleCopy} className="text-gray-400 hover:text-white transition" title="Copy">
              <FiCopy className="w-4 h-4" />
            </button>
            {copied && <span className="text-green-400 text-[10px]">Copied!</span>}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex justify-center mt-8 pb-24">
        <div className="w-[369px] flex flex-col gap-6">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold">Full Name</label>
            <div className="w-full h-[47px] px-2 rounded-[10px] border border-white flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base"
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold">Username</label>
            <div className="w-full h-[47px] px-2 rounded-[10px] border border-white flex items-center">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold">Email</label>
            <div className="w-full h-[47px] px-2 rounded-[10px] border border-white flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your bio"
              className="w-full h-40 px-3 py-2 rounded-[10px] border border-white bg-transparent text-white outline-none resize-none font-inter text-base"
            />
          </div>

          {/* Passwords */}
          <div className="flex flex-col gap-4">
            <div className="relative flex items-center border border-white rounded-[10px] px-2 h-[47px]">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Current Password"
                className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base pr-10"
              />
              <div className="absolute right-2 cursor-pointer" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <FiEyeOff className="text-white" /> : <FiEye className="text-white" />}
              </div>
            </div>

            <div className="relative flex items-center border border-white rounded-[10px] px-2 h-[47px]">
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New Password"
                className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base pr-10"
              />
              <div className="absolute right-2 cursor-pointer" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FiEyeOff className="text-white" /> : <FiEye className="text-white" />}
              </div>
            </div>

            <div className="relative flex items-center border border-white rounded-[10px] px-2 h-[47px]">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base pr-10"
              />
              <div className="absolute right-2 cursor-pointer" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEyeOff className="text-white" /> : <FiEye className="text-white" />}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-6" onClick={handleSubmit}>
            <div className="flex items-center justify-center w-[120px] h-[39px] text-white font-medium text-sm rounded-[5px] bg-gradient-to-b from-[#002AA8] to-[#001142] hover:from-[#0034D6] hover:to-[#001B70] cursor-pointer">
              Save
            </div>
          </div>

          {/* Logout */}
          <div className="flex justify-center mt-4">
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 text-sm">
              Log out →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditAdminProfile;
