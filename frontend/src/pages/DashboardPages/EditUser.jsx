import React, { useState, useRef, useEffect } from "react";
import Hero1 from "../../assets/images/Profile/Hero1.jpeg";
import useSiteContent from "../../hooks/useSiteContent";
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
import { User_Dashboard_Url, BACKEND_BASE_URL } from "../../Config";

function EditProfile() {
  const navigate = useNavigate();
  const { data: bannerCms } = useSiteContent("profile_banner");

  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);

  const [copied, setCopied] = useState(false);

  console.log("your login user in profile :", user);

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        };
      };
    });
  };

  const location = useLocation();
  const safeUserData = user || {};


  const [userData, setUserData] = useState(null); // store backend user
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [userName, setUserName] = useState("");


  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [profileImage, setProfileImage] = useState(
    safeUserData.Avatar ? safeUserData.Avatar : Profile
  );
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const walletAddress = userData?.WalletAddress || safeUserData?.WalletAddress || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  // Get the user profile 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data.user;
        console.log("your profile response :", user);
        setUserData(user);
        setProfileImage(user.Avatar ? `${BACKEND_BASE_URL}${user.Avatar}` : Profile);
        setName(user.FullName || "");
        setEmail(user.Email || "");
        setBio(user.Bio || "");
        setUserName(user.UserName || "");

      } catch (error) {
        console.error("❌ Profile fetch error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };

    if (token) fetchProfile();
  }, [token]);



  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Compress image
    const compressedFile = await compressImage(selected);

    // Save compressed file for API
    setFile(compressedFile);

    // Preview (lightweight base64)
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(compressedFile);
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) {
      return toast.error("New password and confirm password do not match");
    }

    if (!user.id) {
      toast.error("User Id is required ");
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("FullName", name);
      formData.append("Email", email);
      formData.append("Password", currentPass);
      formData.append("NewPassword", newPass);
      formData.append("UserName", userName);

      formData.append("Bio", bio);
      if (file) formData.append("Avatar", file);

      const res = await axios.put(
        `${User_Dashboard_Url}/edit/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully!");
      navigate("/dashboard", { state: { userData: res.data.user } });
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
    <div className="flex flex-col w-full relative z-10">
      {/* Hero Banner — full-width, CMS-driven */}
      <div className="mb-16 lg:mt-[1px]">
        <div className="w-full">
          <div
            className="relative h-32 sm:h-48 md:h-56 lg:h-[237px] -mx-4 md:-mx-6 bg-cover bg-top bg-no-repeat rounded-none shadow-lg mb-16 md:mb-24"
            style={{
              backgroundImage: `url(${
                bannerCms.background_image
                  ? bannerCms.background_image.startsWith("http")
                    ? bannerCms.background_image
                    : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:4700"}${bannerCms.background_image}`
                  : Hero1
              })`,
            }}
          ></div>

          {/* Profile Info */}
          <div className="relative -mt-16 sm:-mt-20 md:-mt-[160px] px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col items-center text-center">
              {/* Profile Image */}
              <div className="relative flex-shrink-0 cursor-pointer">
                {profileImage && profileImage !== Profile ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg border-2 border-white object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      setProfileImage(Profile);
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

              <div className="mt-3 text-white max-w-full px-4">
                <h2 className="text-lg md:text-xl font-semibold truncate">{name}</h2>
                {walletAddress && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-white transition flex-shrink-0"
                      title="Copy wallet address"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                    {copied && (
                      <span className="text-green-400 text-[10px] whitespace-nowrap">Copied!</span>
                    )}
                  </div>
                )}
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
            <div className="w-full max-w-md z-10">
              <label
                className="block text-[18px] md:text-[20.97px] text-white font-bold leading-[100%] mb-4 md:mb-8"
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
                  placeholder={user?.FullName || "Name"}
                  className={inputClass}
                />
                {name.length >= 30 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    Maximum 30 characters allowed
                  </p>
                )}
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 30 && /^[a-zA-Z0-9_]*$/.test(value)) {
                      setUserName(value);
                    }
                  }}
                  placeholder={user?.UserName || "User Name"}
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
            <div className="w-full max-w-md mt-2">
              <label
                className="block text-white font-bold text-[18px] md:text-[20.97px] leading-[100%] my-5"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Enter your email
              </label>

              <input
                type="email"
                value={email}
                disabled
                onChange={(e) => setEmail(e.target.value)}
                placeholder={user?.Email || "Email"}
                className={inputClass}
              />
            </div>

            {/* Bio */}
            <div className="w-full max-w-md mt-4">
              <label
                className="block text-white font-bold text-[18px] md:text-[20.97px] leading-[100%] my-5"
                style={{ fontFamily: "Inter, sans-serif", opacity: 1 }}
              >
                Enter Your Bio
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
            {/* {safeUserData.Password && ( */}
            {/* Reset Password */}
            <div className="w-full max-w-md flex flex-col gap-4">
              <label className="block text-white text-[20px] md:text-[25px] font-medium">
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

            {/* Wallet Section */}
            {walletAddress && (
              <div className="w-full max-w-md">
                <label className="block text-white font-bold text-[18px] md:text-[20.97px] leading-[100%] my-5">
                  Your Wallet
                </label>
                <div className="bg-[#0a0a1a] border border-white/10 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-mono break-all">{walletAddress}</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="text-gray-400 hover:text-white transition flex-shrink-0"
                        title="Copy address"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      {copied && <span className="text-green-400 text-xs">Copied!</span>}
                    </div>
                  </div>
                  <a
                    href={`https://basescan.org/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    View on BaseScan →
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-center w-full my-12 md:my-16">
              <div className="w-full max-w-md">
                <button
                  type="submit"
                  className="mx-auto block bg-[#002AA8] hover:bg-[#001f7a] transition-colors w-full sm:w-[190px] h-[42px] rounded-md font-medium text-white border-none cursor-pointer"
                >
                  Save
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
