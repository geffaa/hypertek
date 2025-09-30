import React, { useState, useRef } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import Profile from "../../assets/images/Profile/Profile.png";
import { FiCopy } from "react-icons/fi";
import { ArrowRight } from "lucide-react"; // Arrow import
import CustomButton from "../../Components/Buttons/Button1";

function MarketPlace() {
  const walletAddress = "0xc416a645...b21a";
  const [copied, setCopied] = useState(false);

  // Editable states
  const [name, setName] = useState("Lana Kim");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Profile image state
  const [profileImage, setProfileImage] = useState(Profile);
  const fileInputRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name,
      userName,
      email,
      bio,
      currentPass,
      newPass,
      confirmPass,
      profileImage,
    });
    alert("Profile Updated Successfully!");
  };

  // Handle clicking profile image
  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mx-auto mt-20 mb-16 lg:mt-[92px]">
        <div className="w-full">
          {/* Hero Banner */}
          <div
            className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] w-full 
              bg-cover bg-top bg-no-repeat rounded-lg shadow-lg mb-20 md:mb-24"
            style={{ backgroundImage: `url(${overview1})` }}
          ></div>

          {/* Profile Info */}
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col items-center text-center">
              <img
                src={profileImage}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-lg cursor-pointer -mt-12 sm:-mt-16 md:-mt-16"
                onClick={handleProfileClick}
              />
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="mt-3 text-white">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                  {name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 break-words flex items-center gap-2">
                  {walletAddress}
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
        <div className="p-6 sm:p-10">
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
                placeholder="Username"
                className="w-full bg-transparent border border-white rounded-xl px-3 py-2 text-sm text-white "
              />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Username"
                className="w-full bg-transparent mt-5 border border-white rounded-xl px-3 py-2 text-sm text-white "
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

              {/* Logout with Arrow */}
              <p className="text-red-500 text-sm flex items-center gap-2 cursor-pointer">
                Logout
                <ArrowRight className="w-4 h-4" />
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-center ">
              <Link className="cursor-pointer w-full">
                <CustomButton text="Save" />
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default MarketPlace;
