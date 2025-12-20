import React, { useEffect, useState } from "react";
import land1Image from "../../assets/images/Overview/land1.jpg";
import ManImage from "../../assets/images/Overview/man.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import NavLinks from "../ProfileSection/Navlinks";
import Profile from "../../assets/images/Profile/Profile.png";
import GlowingOrb from "../Common/BgColoring";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { BACKEND_BASE_URL } from "../../Config";
import { FaUserCircle } from "react-icons/fa";
import FullScreenLoader from "../Common/Spinner"


function PersonalActivity() {
  /// get the activity from the backend
  const [activityData, setActivityData] = useState([]);
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState({});
  const loginUserId = user.id;
            const [loading, setLoading] = useState(true); // ✅ loader state
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 send token here
          },
        });
        setUserData(res.data.user);
        console.log("✅ User profile:", res.data.user);
      } catch (error) {
        console.error(
          "❌ Profile fetch error:",
          error.response?.data || error.message
        );
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
      finally {
        setLoading(false); // ✅ hide loader after fetch
      }
    };

    if (token) {
      fetchProfile(); // only call if token exists
    }
  }, [token]);

  // get the market data here
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        /// get the land , market and activity through
        if (!loginUserId) {
          toast.error("Please Login first!");
        }

        const activity = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/activity/${loginUserId}`
        );
        console.log("your activity data in the console :", activity);

        if (activity.data) {
          const arr = Array.isArray(activity.data)
            ? activity.data
            : Array.isArray(activity.data.data)
            ? activity.data.data
            : [];
          setActivityData(arr);
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false); // ✅ hide loader after fetch
      }
    };

    fetchMarketData();
  }, []); // run once when component mounts

  console.log("your activity  data are here :", activityData);

  const getDaysAgo = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();

    // Difference in milliseconds
    const diffInMs = now.getTime() - created.getTime();

    // If the time is in the future, return "0d"
    if (diffInMs < 0) return "0d";

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return `${diffInDays}d`;
  };


  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <div className="mx-auto mt-18 lg:mt-[68px] max-w-[2000px]">
          <div className="w-full overflow-x-hidden">
            {/* Hero Banner - Fixed height for laptop screens */}
            <div
              className="relative w-full max-w-[1400px] mx-auto 
    h-[250px] sm:h-[300px] md:h-[269px] lg:h-[269px] xl:h-[269px] 2xl:h-[300px] 
    mb-20 md:mb-24 overflow-hidden"
            >
              <img
                src={overview1}
                alt="Hero background"
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
              />
            </div>

            {/* Profile Section - aligned properly with banner */}
            <div className="relative -mt-20 sm:-mt-24 md:-mt-24 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-start">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    {userData?.Avatar ? (
                      <img
                        src={`https://api-hyper-tek-games.deventiatech.com${userData.Avatar}`}
                        alt="Profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 rounded-full shadow-lg -mt-12 sm:-mt-16 md:-mt-16 xl:-mt-20 object-cover border-4 border-gray-900"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 -mt-12 sm:-mt-16 md:-mt-16 xl:-mt-20 border-4 border-gray-900">
                        <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="mt-3 text-left text-white">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                      {userData.FullName
                        ? userData.FullName.replace(/[0-9]/g, "") || ""
                        : userData.Email
                        ? userData.Email.split("@")[0].replace(/[0-9]/g, "")
                        : "Guest"}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 break-words">
                      {userData.DiscordId ||
                        userData.GoogleId ||
                        userData._id ||
                        "null"}
                      <Link to="/edit" state={{ userData }}>
                        <span className="ml-1 sm:ml-2 cursor-pointer underline hover:text-white transition-colors">
                          Edit Profile
                        </span>
                      </Link>
                    </p>
                    <p className="text-green-400 font-semibold mt-1 text-sm sm:text-base md:text-lg">
                    
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {/* Navigation */}
          <div className="relative flex flex-row md:mr-24 lg:flex-row md:justify-center justify-start items-start gap-4 lg:gap-0 mb-4 lg:mb-8">
            <div className="w-full max-w-7xl md:px-4 px-2 lg:px-8">
              <NavLinks />
            </div>
          </div>
        </div>


      {/* Activities Section */}
    <section className="mx-auto flex flex-col gap-6 lg:gap-8 mb-16 px-4 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-20 w-full max-w-[1600px]">
  <GlowingOrb Xaxis={920} Yaxis={550} />

  {/* Responsive Table */}
  <div className="overflow-x-auto rounded-lg z-10">
    <table className="w-full min-w-[500px] text-white border-collapse">
      <thead className="bg-[#00134C]">
        <tr className="text-left">
          {["Name", "Type", "Buyer", "Seller", "Price", "Time"].map((h, i) => (
            <th
              key={i}
              className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-[18px] font-inter font-medium"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {activityData.slice(0, 5).map((item, index) => (
          <tr
            key={index}
            className="border-b border-[#00134C] hover:bg-white/5 transition-colors"
          >
            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={land1Image}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs sm:text-sm lg:text-[18px] font-inter font-medium truncate">
                  {item.name}
                </span>
              </div>
            </td>
            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 text-xs sm:text-sm lg:text-base">
              {item.type}
            </td>
            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 text-xs sm:text-sm lg:text-base">
              {item.buyer}
            </td>
            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 text-xs sm:text-sm lg:text-base">
              {item.seller}
            </td>
            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 text-xs sm:text-sm lg:text-base">
              ${item.price}
            </td>
            <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 text-xs sm:text-sm lg:text-base">
              {getDaysAgo(item.time)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

    </div>
  );
}

export default PersonalActivity;
