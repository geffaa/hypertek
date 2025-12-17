import React, { useState, useRef } from "react";
import overview1 from "../assets/Hero.png";
import Profile from "../assets/Profile.png";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera, FiCopy } from "react-icons/fi";
import { Dashboard_Base_Url } from "../Config";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { Image_Base_Url } from "../Config";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


function EditUser() {
   const location = useLocation();
   const navigate = useNavigate()
  const userData = location.state?.userData || {}; 
  console.log("your recieved data are :",userData);


  console.log("your recieved data is here :",userData
  );

const [name, setName] = useState(userData.name || "");
const [email, setEmail] = useState(userData.supply || "");
  const [currentPass, setCurrentPass] = useState("");
  const [bio, setBio] = useState(userData.bio || "");
  const [profileImage, setProfileImage] = useState(
  userData.Avatar ? `${Image_Base_Url}${userData.Avatar}` : null
);


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

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };



  const handleSubmit = async () => {
  if (newPass !== confirmPass) {
    alert("New password and confirm password do not match");
    return;
  }

  const formData = new FormData();
  formData.append("FullName", name);
  formData.append("Email", email);
  formData.append("Bio", bio);

  if (newPass) {
    formData.append("Password", newPass);
  }

  if (file) {
    formData.append("Avatar", file);
  }

  try {
    setLoading(true);
    const res = await fetch(`${Dashboard_Base_Url}/v1/edit/${userData.id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      navigate("/users")
     toast.success("User Profle Update Succesfully")
    } else {
      toast.error("There is some error while updating user profile")
    }
  } catch (err) {
    console.error(err);
    setLoading(false);
    toast.error(err)
  }
};



  const handleCopy = () => {
  navigator.clipboard.writeText(userData._id || ""); // copy user ID or whatever field you want
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

  return (
    <>
      <div className="min-h-screen bg-transparent relative z-10">
        <div
          className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] bg-cover bg-top bg-no-repeat rounded-none shadow-lg mb-20 md:mb-24"
          style={{ backgroundImage: `url(${overview1})` }}
        ></div>
        <div className="relative -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-36 px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center text-center">
            {/* Profile Image */}
            <div className="relative flex-shrink-0 cursor-pointer">
              {profileImage && profileImage !== Profile ? (
                <img
                  src={
                    profileImage.startsWith("data:")
                      ? profileImage
                      : `${Dashboard_Base_Url}${profileImage}`
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
                {userData.id  || "null"}

               
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

        {/* the input field  */}
        <div className="flex justify-center mt-8 pb-24"> {/* Added pb-16 for bottom padding */}
          <div
            className=" justify-center mb-12" 
            style={{
              width: "369px",
              height: "1076.93px",
              gap: "50.36px",
              opacity: 1,
            }}
          >
            {/* first div  */}
            <div
              className="relative flex flex-col"
              style={{
                width: "369px",
                height: "195.4px",
                opacity: 1,
                transform: "rotate(0deg)",
                paddingTop: "20px", // space at the top for the title
              }}
            >
              {/* Label at the top */}
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "21px",
                  lineHeight: "25px",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  color: "#FFFFFF",
                  textAlign: "left",
                  marginBottom: "10px",
                  paddingLeft: "15px",
                }}
              >
                Enter your details
              </div>

              {/* Centered Input Fields */}
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-[345.52px] h-[46.96px] flex items-center px-2 rounded-[10px] border border-white">
                  <input
                    type="text"
                     value={name}                // <-- use state here
  onChange={(e) => setName(e.target.value)} // <-- update state on change
                    placeholder="Name"
                    className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base"
                  />
                </div>

                <div className="w-[345.52px] h-[46.96px] flex items-center px-2 rounded-[10px] border border-white">
                  <input
                    type="text"
                    placeholder="User Name"
                    className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base"
                  />
                </div>
              </div>
            </div>

            {/* the second div for email  */}
            <div
              className="relative flex flex-col mt-16"
              style={{
                width: "369px",
                height: "195.4px",
                opacity: 1,
                transform: "rotate(0deg)",
              }}
            >
              {/* Label at the top */}
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "21px",
                  lineHeight: "25px",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  color: "#FFFFFF",
                  textAlign: "left",
                  paddingLeft: "15px",
                  marginBottom: "8px", // reduce space between title and input
                }}
              >
                Enter your Email
              </div>

              {/* Centered Input Fields */}
              <div className="flex flex-col items-center justify-start gap-2 mt-4">
                <div className="w-[345.52px] h-[46.96px] flex items-center px-2 rounded-[10px] border border-white">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
  onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base"
                  />
                </div>
              </div>
            </div>

            {/* the thrid div  */}

            <div
              className="relative "
              style={{
                width: "369px",
                height: "307.78px",
                opacity: 1,
                transform: "rotate(0deg)", // angle = 0
              }}
            >
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "21px",
                  lineHeight: "25px",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  color: "#FFFFFF",
                  textAlign: "left",
                  paddingLeft: "15px",
                  marginBottom: "8px", // reduce space between title and input
                }}
              >
                Enter your Bio
              </div>

              <div
                className="relative mt-5 mx-3"
                style={{
                  width: "369px", // container width
                  height: "307.78px", // optional container height
                }}
              >
                <textarea
                  className="bg-transparent text-white outline-none font-inter"
                  placeholder="Enter your text here"
                   value={bio}
  onChange={(e) => setBio(e.target.value)}
                  style={{
                    width: "345.52px",
                    height: "233.14px",

                    opacity: 1,
                    borderRadius: "10.06px",
                    borderWidth: "1.68px",
                    borderStyle: "solid",
                    borderColor: "#FFFFFF",
                    transform: "rotate(0deg)",
                    padding: "10px",
                    resize: "none", // optional, disables manual resizing
                    fontSize: "16px", // adjust font size as needed
                  }}
                ></textarea>
              </div>
            </div>

            {/* Fourth div  */}

            <div
              className="relative mx-2"
              style={{
                width: "369px",
                height: "298.55px",
                opacity: 1,
                transform: "rotate(0deg)", // angle
              }}
            >
              {/* Current Password */}
              <div className="w-[345.52px] h-[46.96px] relative flex items-center my-8 px-2 rounded-[10px] border border-white">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Current Password"
                  className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base pr-10"
                />
                <div
                  className="absolute right-2 cursor-pointer"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? (
                    <FiEyeOff className="text-white" />
                  ) : (
                    <FiEye className="text-white" />
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="w-[345.52px] h-[46.96px] relative flex items-center my-8 px-2 rounded-[10px] border border-white">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="New Password"
                  className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base pr-10"
                />
                <div
                  className="absolute right-2 cursor-pointer"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? (
                    <FiEyeOff className="text-white" />
                  ) : (
                    <FiEye className="text-white" />
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="w-[345.52px] h-[46.96px] relative flex items-center px-2 rounded-[10px] border border-white">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full h-full bg-transparent border-none text-white outline-none font-inter text-base pr-10"
                />
                <div
                  className="absolute right-2 cursor-pointer"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <FiEyeOff className="text-white" />
                  ) : (
                    <FiEye className="text-white" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center my-16 mb-24"  onClick={handleSubmit}> 
              <div
                className="
        flex items-center 
        scale-90 sm:scale-100 
        transition-transform duration-300 ease-in-out 
        md:hover:scale-95   /* Slight zoom out on hover (desktop only) */
        group                /* enables child hover states */
      "
              >
                {/* Left small bar */}
                <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem] mr-0.5 transition-all duration-300 group-hover:bg-[#0034d6]"></div>

                {/* Left angled border */}
                <div
                  className="border-[#002AA8] md:w-[7.97px] w-[5.73px] md:h-[42.86px] h-[30.79px] transition-all duration-300 group-hover:border-[#0034d6]"
                  style={{
                    borderStyle: "solid",
                    borderWidth: "0.375rem 0.25rem 0.375rem 0",
                  }}
                ></div>

                {/* Main button area */}
                <div
                  className="
          flex items-center justify-center 
          text-white font-medium 
          text-xs sm:text-sm
          md:w-[190px] md:h-[39px] 
          w-[103px] h-[28px]
          transition-all duration-300 ease-in-out
          group-hover:bg-[linear-gradient(180deg,_#0034D6_0%,_#001B70_100%)]
        "
                  style={{
                    background:
                      "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                    border: "0.15rem solid #002AA8",
                  }}
                >
                  Submit
                </div>

                {/* Right angled border */}
                <div
                  className="border-[#002AA8] md:w-[7.97px] w-[5.73px] md:h-[42.86px] h-[30.79px] transition-all duration-300 group-hover:border-[#0034d6]"
                  style={{
                    borderStyle: "solid",
                    borderWidth: "0.25rem 0 0.375rem 0.25rem",
                  }}
                ></div>

                {/* Right small bar */}
                <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem] transition-all duration-300 group-hover:bg-[#0034d6]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditUser;