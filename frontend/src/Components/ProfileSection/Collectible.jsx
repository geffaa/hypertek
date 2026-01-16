import React, { useState, useEffect } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import TVector from "../../assets/images/popular/vector.png";
import NavLinks from "../ProfileSection/Navlinks";
import CustomButton from "../Buttons/Button1";
import GlowingOrb from "../Common/BgColoring";
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
          <div className="mt-6">
            <NavLinks />
          </div>

          {/* ================= NFT CARDS ================= */}
          <section className="relative z-10 px-6 mt-10">
            <GlowingOrb Xaxis={800} Yaxis={100} />

            {filteredCollections.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">
                No NFA unlisted collections found
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {filteredCollections.map((item) => {
                  const collection = item.collection;

                  return (
                    <div
                      key={item._id}
                      className="rounded-xl p-4 text-white"
                      style={{
                        background:
                          "linear-gradient(147deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                      }}
                    >
                      <div className="h-40 rounded-lg overflow-hidden bg-gradient-to-b from-[#977C34] to-[#493F26]">
                        <img
                          src={`${BACKEND_BASE_URL}${collection.image}`}
                          alt={collection.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h2 className="mt-3 font-bold text-lg">
                        {collection.name}
                      </h2>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">
                          {collection.symbol}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <img src={TVector} alt="" className="w-3 h-3" />
                          {collection.priceETH} ETH
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsOpen(true);
                        }}
                        className="w-full mt-4"
                      >
                        <CustomButton text="List Now" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default MarketPlace;
