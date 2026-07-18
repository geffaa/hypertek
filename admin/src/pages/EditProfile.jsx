import React, { useState, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera, FiCopy, FiEye, FiEyeOff, FiLogOut } from "react-icons/fi";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const F = "Inter, sans-serif";
const CARD = { background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" };

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-white/8 transition-all placeholder-white/30 text-sm";
const labelClass = "text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5 block";

function PasswordInput({ value, onChange, placeholder, show, onToggle }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
      >
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  );
}

function EditAdminProfile() {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  const adminDataString = localStorage.getItem("admin_data");
  const adminData       = adminDataString ? JSON.parse(adminDataString) : {};
  const adminId         = adminData?._id;

  const [name,         setName]        = useState(adminData.name     || adminData.FullName   || "");
  const [username,     setUsername]    = useState(adminData.username  || adminData.Username  || "");
  const [email,        setEmail]       = useState(adminData.email     || adminData.Email     || "");
  const [bio,          setBio]         = useState(adminData.bio       || adminData.Bio       || "");
  const [profileImage, setProfileImage]= useState(
    adminData.Avatar ? `${Image_Base_Url}${adminData.Avatar}` : null
  );
  const [currentPass,  setCurrentPass] = useState("");
  const [newPass,      setNewPass]     = useState("");
  const [confirmPass,  setConfirmPass] = useState("");
  const [showCurrent,  setShowCurrent] = useState(false);
  const [showNew,      setShowNew]     = useState(false);
  const [showConfirm,  setShowConfirm] = useState(false);
  const [copied,       setCopied]      = useState(false);
  const [file,         setFile]        = useState(null);
  const [loading,      setLoading]     = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(adminId || "");
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
    formData.append("Username", username);
    formData.append("Email", email);
    formData.append("Bio", bio);
    if (newPass) formData.append("Password", newPass);
    if (file)    formData.append("Avatar", file);

    try {
      setLoading(true);
      const res  = await fetch(`${Dashboard_Base_Url}/v1/edit/${adminId}`, { method: "PUT", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully");
        navigate(`/${adminId}/dashboard`);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    window.location.href = `${frontendUrl}/signin`;
  };

  const avatarSrc = profileImage?.startsWith("data:") ? profileImage : profileImage ? `${Image_Base_Url}${profileImage}` : null;

  return (
    <div style={{ fontFamily: F, color: "white", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>Edit Profile</h1>
        <p style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
          Update your admin account information and password
        </p>
      </div>

      {/* Profile picture + ID */}
      <div style={{ ...CARD, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.15)", background: "rgba(0,42,168,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setProfileImage(null)} />
                : <FaUserCircle style={{ width: 44, height: 44, color: "rgba(255,255,255,0.5)" }} />
              }
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#002AA8", border: "2px solid #0c0c18", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <FiCamera size={11} color="white" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Name + ID */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>
              {name || "Admin"}
            </p>
            {username && (
              <p style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "2px 0 6px" }}>
                @{username}
              </p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.07)" }}>
                {adminId || "—"}
              </span>
              <button
                onClick={handleCopy}
                title="Copy ID"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", padding: 0 }}
              >
                <FiCopy size={13} />
              </button>
              {copied && <span style={{ fontFamily: F, fontSize: 11, color: "#22c55e" }}>Copied!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout: Account Info + Password */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, alignItems: "start" }}>

        {/* Account Information */}
        <div style={{ ...CARD, padding: 24 }}>
          <p style={{ fontFamily: F, fontWeight: 600, fontSize: "10.5px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
            Account Information
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short description about you…"
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all placeholder-white/30 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ ...CARD, padding: 24 }}>
          <p style={{ fontFamily: F, fontWeight: 600, fontSize: "10.5px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Change Password
          </p>
          <p style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
            Leave blank to keep your current password
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className={labelClass}>Current Password</label>
              <PasswordInput value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="Current password" show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <PasswordInput value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password" show={showNew} onToggle={() => setShowNew(!showNew)} />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <PasswordInput value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm new password" show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: 13, color: "rgba(239,68,68,0.7)", padding: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(239,68,68,0.7)"}
        >
          <FiLogOut size={14} />
          Log out
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            fontFamily: F,
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
            border: "1px solid rgba(0,80,255,0.3)",
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EditAdminProfile;
