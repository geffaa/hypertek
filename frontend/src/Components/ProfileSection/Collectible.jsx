import React, { useState, useEffect } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import TVector from "../../assets/images/popular/vector.png";
import NavLinks from "../ProfileSection/Navlinks";
import CustomButton from "../Buttons/Button1";
import CustomButton4 from "../Buttons/Button4";
import GlowingOrb from "../Common/BgColoring";
import FaceOne from "../../assets/images/noActivity1.png";
import FaceTwo from "../../assets/images/noActivity2.png";

import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { FaUserCircle } from "react-icons/fa";
import FullScreenLoader from "../Common/Spinner";

function MarketPlace() {
  const { user, token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [showListModal, setShowListModal] = useState(false);


  /* ================= FETCH USER COLLECTIONS (MIDDLEWARE API) ================= */
  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchUserCollections = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/user/collection/get/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success) {
          setMarketData(res.data.collection || []);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch collections"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserCollections();
  }, [user?.id, token]);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/getProfile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(res.data.user);
      } catch (error) {
        toast.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) return <FullScreenLoader />;

  /* ================= FILTER LOGIC ================= */
  const filteredCollections = marketData.filter(
    (item) =>
      item?.collection?.Type === "NFA" &&
      item?.listed === false
  );

  return (
    <>
      {/* ================= HERO ================= */}
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto mt-[68px] max-w-[2000px]">
          <div className="relative w-full max-w-[1400px] mx-auto h-[260px] mb-20 overflow-hidden">
            <img
              src={overview1}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* ================= PROFILE ================= */}
          <div className="relative -mt-24 px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-start text-white">
              <div className="relative">
                {userData?.Avatar ? (
                  <img
                    src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full border-4 border-gray-900 object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-28 h-28 text-gray-400" />
                )}
              </div>

              <h2 className="mt-3 text-xl font-semibold">
                {userData?.FullName ||
                  userData?.Email?.split("@")[0] ||
                  "Guest"}
              </h2>

              <Link
                to="/edit"
                state={{ userData }}
                className="text-sm underline text-gray-400 hover:text-white"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* ================= NAV ================= */}
          <div className="mt-6 max-w-7xl mx-auto px-4">
            <NavLinks />
          </div>

          {/* ================= NFT CARDS ================= */}
          <section className="relative z-10 px-6 mt-10">
            <GlowingOrb Xaxis={800} Yaxis={100} />

            {filteredCollections.length === 0 ? (
           <div className="col-span-full flex flex-col items-center justify-center py-20 text-white relative gap-16 -mt-8">


<h2 className="text-lg font-semibold -mt-4">

             No Item
           </h2>
         
           {/* Floating Faces */}
           <div className="relative w-full flex justify-center items-center gap-4  top-[-10px]">
             <img
               src={FaceOne}
               alt="Face One"
               className="w-34 h-24"
             />
         
             <img
               src={FaceTwo}
               alt="Face Two"
               className="absolute top-24 w-28 h-10"
             />
           </div>
         
           <Link to="/market-place">
  <button className="bg-[#002AA8] px-6 py-2 rounded-md hover:bg-[#002AA8]-700 transition">
    Browse Collection
  </button>
</Link>
         
         </div>
         
           
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {filteredCollections.map((item) => {
                  const collection = item.collection;

                  return (
                    <div
                    key={item._id}
                    className="relative rounded-[16px] p-3 sm:p-4 lg:p-5 text-white flex flex-col
                               h-[360px] sm:h-[390px] lg:h-[420px]"
                    style={{
                      background:
                        "linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                    }}
                  >
                    {/* IMAGE */}
                    <div
                      className="h-[150px] sm:h-[180px] lg:h-[210px] rounded-[14px] overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(180deg, #9B7C2F 0%, #4A3E22 100%)",
                      }}
                    >
                      <img
                        src={`${BACKEND_BASE_URL}${collection.image}`}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  
                    {/* TITLE */}
                    <h2 className="text-[14px] sm:text-[16px] lg:text-[18px] font-semibold mt-4 truncate">
                      {collection.name}
                    </h2>
                  
                    {/* INFO */}
                    <div className="flex justify-between items-center mt-3 text-[11px] sm:text-[13px] lg:text-sm">
                      <span className="font-medium text-gray-300 truncate">
                        {collection.symbol} 🔥
                      </span>
                  
                      {/* GREEN CIRCLE + PRICE */}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#2AAC4F] to-[#85F3BE] flex items-center justify-center">
                          <img src={TVector} className="w-3 h-3" alt="chain" />
                        </div>
                        <span className="font-semibold truncate">
                          ${collection.chain}
                        </span>
                      </div>
                    </div>
                  
                    {/* STATUS */}
                    <p
                      onClick={() => {
                        setSelectedItem(item);
                        setShowListModal(true);
                      }}
                      className="mt-auto pt-6 text-center text-sm text-white-400 cursor-pointer transition"
                    >
                      Not Listed
                    </p>
                  </div>
                  
                  
                  
                  );
                })}
              </div>
            )}
          </section>
          {showListModal && selectedItem && (
 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
 <div className="bg-[#1F2633] p-6 w-11/12 sm:w-[360px] relative text-white">

      {/* Close */}
      <button
        onClick={() => setShowListModal(false)}
        className="absolute top-3 right-3 text-white font-bold text-xl hover:text-gray-300"
      >
        ×
      </button>

      {/* Title */}
      <h2 className="text-white text-sm font-semibold text-center my-3">
        List Asset
      </h2>

      <hr className="border-t border-white/20 my-3" />

      {/* NFT */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-[90px] h-[90px] overflow-hidden rounded-lg bg-gradient-to-b from-[#9B7C2F] to-[#4A3E22]">
          <img
            src={`${BACKEND_BASE_URL}${selectedItem.collection.image}`}
            alt={selectedItem.collection.name}
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-sm font-medium">
          {selectedItem.collection.name}
        </p>
      </div>

      <hr className="border-t border-white/20 my-4" />

      {/* List Price */}
      <div className="flex justify-between items-center bg-[#2F3744] px-3 py-2 mb-2">
  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize text-gray-400">
    List Price
  </span>

  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize">
    $2000 USDT
  </span>
</div>

<div className="flex justify-between items-center bg-[#2F3744] px-3 py-2">
  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize text-gray-400">
    Platform Fee
  </span>

  <span className="font-inter font-medium text-[14px] leading-[100%] tracking-[0.05em] capitalize">
    $0.5 USDT
  </span>
</div>


      <hr className="border-t border-white/20 my-4" />

      {/* Buttons */}
      <div className="flex justify-end gap-4">

        {/* Cancel – SAME BRACKET BUTTON AS NFA */}
        <button onClick={() => setShowListModal(false)}>
          <div className="flex items-center">
            <div className="bg-[#002AA8] mr-0.5 w-1 h-5"></div>

            <div
              className="border-[#002AA8]"
              style={{
                width: "0.5rem",
                height: "2.1rem",
                borderStyle: "solid",
                borderWidth: "0.375rem 0.25rem 0.375rem 0",
              }}
            />

            <div
              className="flex items-center justify-center text-white text-sm font-medium"
              style={{
                width: "5.5rem",
                height: "2rem",
                border: "0.15rem solid #002AA8",
              }}
            >
              Cancel
            </div>

            <div
              className="border-[#002AA8]"
              style={{
                width: "0.5rem",
                height: "2.1rem",
                borderStyle: "solid",
                borderWidth: "0.25rem 0 0.375rem 0.25rem",
              }}
            />

            <div className="bg-[#002AA8] w-1 h-5"></div>
          </div>
        </button>

        {/* List Now – SAME AS NFA */}
        <CustomButton4 text="List Now" />
      </div>
    </div>
  </div>
)}


        </div>
      </div>
    </>

    
  );
}

export default MarketPlace;
