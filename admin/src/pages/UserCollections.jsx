import React, { useState } from "react";
import Collectionimage from "../assets/CreateCollection/collection.png";
import { useNavigate } from "react-router-dom";
  import { useLocation } from "react-router-dom";
  import { Image_Base_Url } from "../Config";


function UserDetails() {
  const [activeTab, setActiveTab] = useState("details");
  const navigate = useNavigate();

   const location = useLocation();
  const user = location.state; // this is the 'col' object passed

  console.log("your user :",user);


  const handleBackButton =()=>{
    navigate("/users")
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">


{/* BG Effect  */}

  <div
        style={{
          top: "150px",
          left: "320px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

       <div
        style={{
          top: "500px",
          left: "900px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>


      <div className="m-12 flex-1">
        {/* Tab Buttons */}
        <div
          className="flex"
          style={{
            width: "404.056px",
            height: "31px",
            gap: "101px",
            opacity: 1,
          }}
        >
          <button
            onClick={() => setActiveTab("details")}
            className="flex justify-center items-center cursor-pointer"
            style={{
              height: "31px",
              paddingBottom: "6px",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "100%",
              letterSpacing: "0%",
              color: activeTab === "details" ? "#FFFFFF" : "#FFFFFFAB",
              borderBottom:
                activeTab === "details"
                  ? "2px solid #FFFFFF"
                  : "1px solid transparent",
              background: "transparent",
            }}
          >
            User Details
          </button>

          <button
            onClick={() => setActiveTab("collections")}
            className="flex items-center justify-center cursor-pointer"
            style={{
              height: "31px",
              paddingBottom: "6px",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "100%",
              letterSpacing: "0%",
              color: activeTab === "collections" ? "#FFFFFF" : "#FFFFFFAB",
              borderBottom:
                activeTab === "collections"
                  ? "2px solid #FFFFFF"
                  : "1px solid transparent",
              background: "transparent",
            }}
          >
            User Collections
          </button>
        </div>

        {/* Content Section */}
        {activeTab === "details" && (
          <div
            className="mt-12 px-5"
            style={{
              width: "502px",
              height: "220px",
              gap: "0px",
              opacity: 1,
              borderRadius: "6px",
              display: "flex",
              flexDirection: "column",
            }}
          >
       <img
  src={user?.avatar ? `${Image_Base_Url}${user.avatar}` : Collectionimage}
  alt={user?.name || "User"}
  className="w-[117px] h-[122px] mb-[5px] rounded-full object-cover opacity-100"
/>


            <div className="w-[481px] h-[43px] flex items-center gap-[45px] opacity-100">
              <div className="flex flex-col items-start justify-center gap-[2px] w-[56px] h-[41px]">
                <h1 className="font-inter font-semibold text-[18px] leading-[100%] opacity-100">
                  Name:
                </h1>
                <p className="font-inter font-medium text-[14px] leading-[100%] opacity-100">
                 { user.name}
                </p>
              </div>
              <div className="flex flex-col items-start justify-center gap-[2px] w-[160px] h-[41px] opacity-100">
                <h1 className="font-inter font-semibold text-[18px] leading-[100%] opacity-100">
                  Email:
                </h1>
                <p className="font-inter font-medium text-[14px] leading-[100%] opacity-100">
               {user?.supply || "No Email"}
                </p>
              </div>
              <div className="flex flex-col items-start justify-center gap-[2px] w-[160px] h-[41px] opacity-100">
                <h1 className="font-inter font-semibold text-[18px] leading-[100%] opacity-100">
                  UID:
                </h1>
                <p className="font-inter font-medium text-[14px] leading-[100%] opacity-100">
               {user?.id || "No UID"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "collections" && (
          <div className="flex flex-wrap gap-8 mt-12">
            {[1, 2, 3, 4].map((card) => (
              <div
                key={card}
                className="w-[420px] h-[178px] flex items-center gap-4 p-5 rounded-[6px] border-[1px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
                style={{
                  borderImageSource:
                    "linear-gradient(178.61deg, rgba(49, 47, 47, 0.56) 67.55%, rgba(151, 145, 145, 0.33) 98.82%)",
                  borderImageSlice: 1,
                }}
              >
                <img
                  src={Collectionimage}
                  alt="Collection"
                  className="w-[117px] h-[122px] rounded-full object-cover"
                />
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="font-inter font-semibold text-[16px]">
                      Wallet Address:
                    </h1>
                    <p className="font-inter font-normal text-[14px]">
                      Oxc4c16a645...b21a
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-inter font-semibold text-[16px]">Price:</p>
                    <p className="font-inter font-normal text-[14px]">$2000</p>
                  </div>
                  <div>
                    <h1 className="font-inter font-semibold text-[16px]">
                      Description:
                    </h1>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button with proper spacing */}
      <div className="flex justify-start ml-12 py-32">
        <button className="w-[190px] h-[42px] rounded-[6px] cursor-pointer flex items-center justify-center gap-[10px] p-[10px] opacity-100 bg-[#002AA8] text-white" onClick={handleBackButton}>
          Back
        </button>
      </div>
    </div>
  );
}

export default UserDetails;
