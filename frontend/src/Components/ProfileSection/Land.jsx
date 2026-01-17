import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import TVector from "../../assets/images/popular/vector.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import popularCollections from "../../assets/images/popular/popolar.png";
import land1Image from "../../assets/images/Overview/land1.jpg";
import symbol from "../../assets/images/login/Symbol.svg.png";

import CustomButton from "../../Components/Buttons/Button1";
import NavLinks from "../ProfileSection/Navlinks";
import GlowingOrb from "../Common/BgColoring";
import FullScreenLoader from "../Common/Spinner";

import { BACKEND_BASE_URL } from "../../Config";

function Land() {
  const { user, token } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState(null);
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const [isFourthOpen, setIsFourthOpen] = useState(false);

  /* ================= PROFILE ================= */
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data.user);
      } catch (err) {
        toast.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [token]);

  /* ================= LAND COLLECTIONS (SAME API) ================= */
  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchLandCollections = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/user/collection/get/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.data?.success) {
          const landItems = res.data.collection.filter(
            (item) =>
              item?.collection?.Type === "Land" && item?.listed === false,
          );

          setLandData(landItems);
        }
      } catch (err) {
        toast.error("Failed to fetch land data");
      } finally {
        setLoading(false);
      }
    };

    fetchLandCollections();
  }, [user?.id, token]);

  if (loading) return <FullScreenLoader />;

  return (
    <>
      {/* ================= HERO ================= */}
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
            {userData?.Avatar ? (
              <img
                src={`${BACKEND_BASE_URL}${userData.Avatar}`}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-gray-900 object-cover"
              />
            ) : (
              <FaUserCircle className="w-28 h-28 text-gray-400" />
            )}

            <h2 className="mt-3 text-xl font-semibold">
              {userData?.FullName || userData?.Email?.split("@")[0] || "Guest"}
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

        {/* ================= LAND CARDS ================= */}
        <section className="relative z-10 px-6 mt-10">
          <GlowingOrb Xaxis={800} Yaxis={100} />

          {landData.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">
              No Land collections found
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {landData.map((item) => {
                const collection = item.collection;

                return (
                  <div
                    key={item._id}
                    className="rounded-xl p-4 text-white group"
                    style={{
                      background:
                        "linear-gradient(147deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                    }}
                  >
                    <div className="h-40 rounded-lg overflow-hidden bg-gradient-to-b from-[#977C34] to-[#493F26]">
                      <img
                        src={land1Image}
                        alt={collection?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h2 className="mt-3 font-bold text-lg">
                      {collection?.name}
                    </h2>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">{item._id.slice(0, 6)}</span>
                      <span className="flex items-center gap-1 text-sm">
                        <img src={TVector} alt="" className="w-3 h-3" />
                        {collection?.priceETH || item.priceETH} ETH
                      </span>
                    </div>

                    <div className="mt-4 hidden lg:group-hover:block">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsOpen(true);
                        }}
                        className="w-full"
                      >
                        <CustomButton text="List Now" />
                      </button>
                    </div>

                    <div className="lg:hidden mt-4">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsOpen(true);
                        }}
                        className="w-full"
                      >
                        <CustomButton text="List Now" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ================= MODALS ================= */}
      {isOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#252B37] p-6 rounded-lg w-[90%] max-w-md text-white">
            <h2 className="text-lg font-bold mb-4">List Asset</h2>
            <p>{selectedItem?.collection?.name}</p>

            <div className="flex gap-4 mt-6 justify-end">
              <button onClick={() => setIsOpen(false)}>
                <CustomButton text="Cancel" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSecondOpen(true);
                }}
              >
                <CustomButton text="Continue" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remaining modals (Second, Third, Fourth) */}
      {/* Your existing modal code remains SAME */}
    </>
  );
}

export default Land;
