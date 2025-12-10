import React, { useState, useRef } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { FiCopy } from "react-icons/fi";
import CustomButton from "../../Components/Buttons/Button1";
import Profile from "../../assets/images/Profile/Profile.png";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import FullScreenLoader from "../../Components/Common/Spinner";
import { useSelector } from "react-redux";
import { BACKEND_BASE_URL } from "../../Config";

function EditProfile() {
  const navigate = useNavigate();
  const walletAddress = "0xc416a645...b21a";
  const [copied, setCopied] = useState(false);

  const token =
    useSelector((state) => state.auth.token) ||
    JSON.parse(localStorage.getItem("auth"))?.token;

  const location = useLocation();
  const { userData } = location.state || {};
  const dummyData = {
    FullName: "John Doe",
    Email: "john.doe@example.com",
    Bio: "This is a sample bio",
    Avatar: null,
    Password: true,
    DiscordId: null,
    GoogleId: null,
    _id: "1234567890",
  };
  const safeUserData = userData || dummyData;

  const [name, setName] = useState(safeUserData.FullName);
  const [email, setEmail] = useState(safeUserData.Email);
  const [bio, setBio] = useState(safeUserData.Bio);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [profileImage, setProfileImage] = useState(
    safeUserData.Avatar ? safeUserData.Avatar : Profile
  );
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) {
      return toast.error("New password and confirm password do not match");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("FullName", name);
      formData.append("Email", email);
      formData.append("Password", currentPass);
      formData.append("NewPassword", newPass);
      formData.append("Bio", bio);
      if (file) formData.append("Avatar", file);

      const res = await axios.put(
        `${BACKEND_BASE_URL}/api/v1/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully!");
      navigate("/profile", { state: { userData: res.data.user } });
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white " +
    "hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200";

  return (
    <div className="min-h-screen bg-transparent px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Bg EFFECT */}
      <div
        style={{
          top: `130px`,
          left: `130px`,
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      <div
        style={{
          top: `430px`,
          left: `730px`,
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      <div
        style={{
          top: `930px`,
          left: `130px`,
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      {/* Hero Section */}
      <div className="mb-16 lg:mt-[1px]">
        <div className="w-full">
          <div
            className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] sm:-mx-6 lg:-mx-8 bg-cover bg-top bg-no-repeat rounded-none shadow-lg mb-20 md:mb-24"
            style={{ backgroundImage: `url(${overview1})` }}
          ></div>

          {/* Profile Info */}
          <div className="relative -mt-16 sm:-mt-20 md:-mt-[160px] px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col items-center text-center">
              {/* Profile Image */}
              <div className="relative flex-shrink-0 cursor-pointer">
                {profileImage && profileImage !== Profile ? (
                  <img
                    src={
                      profileImage.startsWith("data:")
                        ? profileImage
                        : `${BACKEND_BASE_URL}${profileImage}`
                    }
                    alt="Profile"
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg border-2 border-white object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      setProfileImage(null);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg w-24 h-24 md:w-28 md:h-28 border-2 border-white">
                    <FaUserCircle className="w-16 h-16 md:w-20 md:h-20" />
                  </div>
                )}

                {/* Camera Icon Overlay */}
                <div
                  className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full border-2 border-white hover:bg-blue-600"
                  onClick={handleProfileClick}
                >
                  <FiCamera className="w-4 h-4 text-white" />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mt-3 text-white">
                <h2 className="text-lg md:text-xl font-semibold">{name}</h2>
                <p className="text-xs sm:text-sm text-gray-400 break-words flex items-center gap-2">
                  {safeUserData.DiscordId ||
                    safeUserData.GoogleId ||
                    safeUserData._id ||
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
            {loading && <FullScreenLoader />}

            {/* Name */}
            <div className="w-[369px] max-w-md">
              <label
                className="block text-[20.97px] text-white font-bold leading-[100%] mb-8"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Enter your details
              </label>

              <div className="w-full space-y-8 max-w-md">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 30 && /^[a-zA-Z\s]*$/.test(value)) {
                      setName(value);
                    }
                  }}
                  placeholder="Full Name"
                  className={inputClass}
                />
                {name.length >= 30 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    Maximum 30 characters allowed
                  </p>
                )}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 30 && /^[a-zA-Z\s]*$/.test(value)) {
                      setName(value);
                    }
                  }}
                  placeholder="User Name"
                  className={inputClass}
                />
                {name.length >= 30 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    Maximum 30 characters allowed
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="w-[369px] max-w-md mt-2">
              <label
                className="block text-white font-bold text-[20.97px] leading-[100%] my-8"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Enter your email
              </label>

              <input
                type="email"
                value={email}
                disabled
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClass}
              />
            </div>

            {/* Bio */}
            <div className="w-[369px] max-w-md mt-4">
              <label
                className="block text-white font-bold text-[20.97px] leading-[100%] my-8"
                style={{ fontFamily: "Inter, sans-serif", opacity: 1 }}
              >
                Reset Password
              </label>

              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter Your Bio"
                className={inputClass}
              ></textarea>
            </div>

            {/* Reset Password */}
            {safeUserData.Password && (
              <div className="w-[369px] max-w-md flex flex-col gap-4">
                <label className="block text-[#FFFFFF] text-[25px] font-medium">
                  Reset Password
                </label>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

             <div className="flex justify-center w-full my-16">
              <div className="max-w-md w-full">
                <button type="submit" className="mx-auto block">
                  <CustomButton text="Save" />
                </button>
              </div> {/* Save Button */}
          
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default EditProfile;
