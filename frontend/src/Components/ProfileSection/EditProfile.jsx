import React, { useState, useRef, useEffect } from "react";
import overview1 from "../../assets/images/Profile/Hero1.webp";
import Profile from "../../assets/images/Profile/Profile.webp";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera, FiCopy, FiEye, FiEyeOff } from "react-icons/fi";
import ImageCropModal from "../ImageCropModal";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FullScreenLoader from "../Common/Spinner";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import { CDP_WALLET_ENABLED } from "../../Config";
import { isCdpUser } from "../../context/CdpIntegration";
import CdpKeyExport from "./CdpKeyExport";
import LinkedWalletsSection from "./LinkedWalletsSection";

function EditProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token) || JSON.parse(localStorage.getItem("auth"))?.token;
  const authUser = useSelector((state) => state.auth.user);
  const cdpAccount = CDP_WALLET_ENABLED && isCdpUser(authUser);
  const { emailWalletAddress } = useEmailWallet();

  const userData = location.state?.userData || {};
  console.log("your recieved data are :", userData);

  const [name, setName] = useState(userData.FullName || "");
  const storedNickname = userData.Nickname && !userData.Nickname.includes("@") ? userData.Nickname : "";
  const [nickname, setNickname] = useState(storedNickname);
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
  const [cropSrc, setCropSrc] = useState(null);
  const [cropFileName, setCropFileName] = useState("");
  const fileInputRef = useRef(null);

  const [privateKey, setPrivateKey] = useState("");
  const [exportingKey, setExportingKey] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pkPassword, setPkPassword] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setCropFileName(selected.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(selected);
    e.target.value = "";
  };

  const handleCropConfirm = (croppedFile) => {
    setCropSrc(null);
    setFile(croppedFile);
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(croppedFile);
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
    formData.append("Nickname", nickname);
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

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          fileName={cropFileName}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-all duration-200 hover:bg-white/10"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Hero */}
      <div
        className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] bg-cover bg-top bg-no-repeat rounded-none shadow-lg mb-20 md:mb-24"
        style={{ backgroundImage: `url(${overview1})` }}
      ></div>





      {/* Profile Info */}
      <div className="relative -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-36 px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center">
        <div className="relative flex-shrink-0 cursor-pointer">
          {profileImage ? (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg border-2 border-white overflow-hidden flex items-center justify-center"
              style={{ background: "#0a1a3a" }}>
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setProfileImage(null)}
              />
            </div>
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
            <button onClick={handleCopy} className="text-gray-400 hover:text-white transition" data-tooltip="Copy">
              <FiCopy className="w-4 h-4" />
            </button>
            {copied && <span className="text-green-400 text-[10px]">Copied!</span>}
          </p>
        </div>
      </div>

      {/* Form ported from EditUser.jsx */}
      <section className="max-w-5xl mx-auto mb-10 px-4">
        <div className="p-6 sm:p-10 bg-transparent rounded-2xl">
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 items-start">
            {/* ── Left column: account details ── */}
            <div className="flex flex-col gap-6">
            {/* Name */}
            <div className="w-full z-10">
              <label
                className="block text-[18px] md:text-[20.97px] text-white font-bold leading-[100%] mb-4 md:mb-8"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Enter your details
              </label>

              <div className="w-full space-y-8">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 30 && /^[a-zA-Z\s]*$/.test(value)) {
                        setName(value);
                      }
                    }}
                    placeholder={userData?.FullName || "Full Name"}
                    className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  />
                  {name.length >= 30 && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Maximum 30 characters allowed
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Nickname */}
            <div className="w-full">
              <label
                className="block text-[18px] md:text-[20.97px] text-white font-bold leading-[100%] mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Marketplace Nickname
              </label>

              {/* Info callout */}
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2.5 mb-3"
                style={{ background: "rgba(0,42,168,0.18)", border: "1px solid rgba(99,179,237,0.25)" }}
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  This nickname will be shown publicly in the marketplace; for example, <span className="text-white/90 font-medium">by {nickname || name || "YourNickname"}</span> on trade and listing cards. Leave blank to use your full name instead.
                </p>
              </div>

              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 30) setNickname(value);
                }}
                placeholder={name || "e.g. ShadowTrader99"}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
              {nickname.length >= 30 && (
                <p className="text-yellow-400 text-xs mt-1">Maximum 30 characters allowed</p>
              )}
            </div>

            {/* Email */}
            <div className="w-full">
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
                placeholder={userData?.Email || "Email"}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white opacity-60 cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Bio */}
            <div className="w-full">
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
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              ></textarea>
            </div>

            {/* Reset Password */}
            <div className="w-full flex flex-col gap-4">
              <label className="block text-white text-[20px] md:text-[25px] font-medium mb-2">
                Reset Password
              </label>

              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 pr-10"
                />
                <div className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>

              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 pr-10"
                />
                <div className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-sm text-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 pr-10"
                />
                <div className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
            </div>

            </div>

            {/* ── Right column: wallets ── */}
            <div className="flex flex-col gap-6">

            {/* Embedded Wallet Settings */}
            <div className="w-full">
              <label
                className="block text-white font-bold text-[18px] md:text-[20.97px] leading-[100%] my-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Embedded Wallet Settings
              </label>

              <div className="bg-[#1C1C1E] border border-blue-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                  Your account comes with a secure, embedded Hyper Tek wallet. <strong className="text-white">You don't need MetaMask to use the platform!</strong>
                  <br /><br />
                  To buy NFAs or list items, simply fund your wallet by sending ETH or USDC (on Base) to your address below.
                </p>

                {emailWalletAddress && (
                  <div className="bg-black/40 p-3 rounded-lg border border-white/10 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Your Wallet Address (Fund via any exchange)</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-blue-400 break-all">{emailWalletAddress}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(emailWalletAddress);
                          toast.success("Wallet address copied!");
                        }}
                        className="text-gray-400 hover:text-white p-2"
                        data-tooltip="Copy to clipboard"
                      >
                        <FiCopy size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {cdpAccount ? (
                  // Non-custodial accounts: key export happens through a secure
                  // Coinbase iframe — the key never touches our code or backend.
                  emailWalletAddress ? <CdpKeyExport address={emailWalletAddress} /> : null
                ) : !privateKey ? (
                  <div>
                    {!showPasswordPrompt ? (
                      <button
                        type="button"
                        onClick={() => setShowPasswordPrompt(true)}
                        className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center text-sm"
                      >
                        Advanced: View Private Key
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400">Enter your password to reveal your private key:</p>
                        <div className="relative">
                          <input
                            type="password"
                            value={pkPassword}
                            onChange={(e) => setPkPassword(e.target.value)}
                            placeholder="Your password"
                            className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/60"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                document.getElementById("confirm-pk-btn")?.click();
                              }
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            id="confirm-pk-btn"
                            type="button"
                            disabled={exportingKey}
                            onClick={async () => {
                              if (!pkPassword) return;
                              setExportingKey(true);
                              try {
                                const res = await axios.post(
                                  `${BACKEND_BASE_URL}/api/v1/user/export-wallet`,
                                  { password: pkPassword },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                setPrivateKey(res.data.PrivateKey || res.data.privateKey);
                                setShowPasswordPrompt(false);
                                setPkPassword("");
                                toast.success("Private key unlocked.");
                              } catch (err) {
                                toast.error(err.response?.data?.message || "Incorrect password.");
                              } finally {
                                setExportingKey(false);
                              }
                            }}
                            className="flex-1 py-2 bg-[#002AA8] hover:bg-[#003BD4] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            {exportingKey ? "Verifying..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowPasswordPrompt(false); setPkPassword(""); }}
                            className="px-4 py-2 border border-white/15 text-white/60 hover:text-white text-sm rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                    <div className="relative">
                      <p className="text-xs text-gray-400 mb-1">Private Key (Advanced)</p>
                      <input
                        type={showPrivateKey ? "text" : "password"}
                        value={privateKey}
                        readOnly
                        className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white pr-20 font-mono focus:outline-none"
                      />
                      <div className="absolute right-2 bottom-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="text-gray-400 hover:text-white p-1"
                          data-tooltip="Toggle visibility"
                        >
                          {showPrivateKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(privateKey);
                            toast.success("Private key copied to clipboard!");
                          }}
                          className="text-gray-400 hover:text-white p-1"
                          data-tooltip="Copy to clipboard"
                        >
                          <FiCopy size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-red-400 leading-tight">
                      ⚠️ Never share this private key. Anyone with this key controls your assets.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Linked external wallets (MetaMask etc.) */}
            <LinkedWalletsSection />
            </div>
            </div>


            <div className="flex justify-center w-full my-12 md:my-16">
              <div className="w-full max-w-md">
                <button
                  type="submit"
                  className="mx-auto block bg-[#002AA8] hover:bg-[#001f7a] transition-colors w-full sm:w-[190px] h-[42px] rounded-md font-medium text-white border-none cursor-pointer"
                >
                  Save Profile
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
