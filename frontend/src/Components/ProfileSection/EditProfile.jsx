import React, { useState, useRef, useEffect } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import Profile from "../../assets/images/Profile/Profile.png";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera, FiCopy, FiEye, FiEyeOff } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FullScreenLoader from "../Common/Spinner";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";

function EditProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token) || JSON.parse(localStorage.getItem("auth"))?.token;

  const userData = location.state?.userData || {};
  console.log("your recieved data are :",userData);

  const [name, setName] = useState(userData.FullName || "");
  const [email, setEmail] = useState(userData.Email || "");
  const [bio, setBio] = useState(userData.Bio || "");
  const [profileImage, setProfileImage] = useState(userData.Avatar ? `${BACKEND_BASE_URL}${userData.Avatar}` : null);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleProfileClick = () => fileInputRef.current.click();

  const handleCopy = () => {
    navigator.clipboard.writeText(userData._id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
  if (newPass && newPass !== confirmPass) {
    toast.error("New password and confirm password do not match");
    return;
  }

  const formData = new FormData();
  formData.append("FullName", name);
  formData.append("Email", email);
  formData.append("Bio", bio);
  if (newPass) formData.append("Password", currentPass); // current password
  if (newPass) formData.append("NewPassword", newPass);  // new password
  if (file) formData.append("Avatar", file);

  try {
    setLoading(true);
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/profile`, { // updated route
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);

    if (data.message === "Profile updated successfully") {
      toast.success("Profile updated successfully!");
      navigate("/profile", { state: { userData: data.user } });
    } else {
      toast.error(data.message || "Error updating profile");
    }
  } catch (err) {
    console.error(err);
    setLoading(false);
    toast.error(err.message || "Something went wrong");
  }
};




  return (
    <div className="min-h-screen bg-transparent relative z-10 mt-16">
      {loading && <FullScreenLoader />}

      {/* Hero */}
      <div
        className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] bg-cover bg-top bg-no-repeat rounded-none shadow-lg mb-20 md:mb-24"
        style={{ backgroundImage: `url(${overview1})` }}
      ></div>
   




      {/* Profile Info */}
      <div className="relative -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-36 px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center">
        <div className="relative flex-shrink-0 cursor-pointer">
          {profileImage ? (
            <img
              src={profileImage.startsWith("data:") ? profileImage : profileImage}
              alt="Profile"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg border-2 border-white object-cover"
              onError={() => setProfileImage(null)}
            />
          ) : (
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg w-24 h-24 md:w-28 md:h-28 border-2 border-white">
              <FaUserCircle className="w-16 h-16 md:w-20 md:h-20" />
            </div>
          )}
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
          <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
            {userData._id || userData.id || "null"}
            <button onClick={handleCopy} className="text-gray-400 hover:text-white transition" title="Copy">
              <FiCopy className="w-4 h-4" />
            </button>
            {copied && <span className="text-green-400 text-[10px]">Copied!</span>}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center mt-8 gap-6 px-4 sm:px-6 lg:px-12">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full max-w-md bg-transparent border border-white rounded-xl px-3 py-2 text-white"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full max-w-md bg-transparent border border-white rounded-xl px-3 py-2 text-white"
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          rows={4}
          className="w-full max-w-md bg-transparent border border-white rounded-xl px-3 py-2 text-white"
        />

        {/* Passwords */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Current Password"
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 pr-10 text-white"
            />
            <div className="absolute right-2 top-2 cursor-pointer" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <FiEyeOff className="text-white" /> : <FiEye className="text-white" />}
            </div>
          </div>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New Password"
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 pr-10 text-white"
            />
            <div className="absolute right-2 top-2 cursor-pointer" onClick={() => setShowNew(!showNew)}>
              {showNew ? <FiEyeOff className="text-white" /> : <FiEye className="text-white" />}
            </div>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 pr-10 text-white"
            />
            <div className="absolute right-2 top-2 cursor-pointer" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff className="text-white" /> : <FiEye className="text-white" />}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default EditProfile;
