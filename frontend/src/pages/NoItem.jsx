import React , { useState , useEffect} from 'react'
import overview1 from "../assets/images/Profile/Hero.png"
import Profile from "../assets/images/Profile/Profile.png"
import { Link } from 'react-router-dom'
import NavLinks from '../Components/ProfileSection/Navlinks'
import noActivity1 from "../assets/images/NoPersonalActivity/noActivity1.png";
import noActivity2 from "../assets/images/NoPersonalActivity/noActivity2.png";
import axios from "axios";
import { useSelector } from "react-redux";
import FullScreenLoader from "../Components/Common/Spinner"
import { BACKEND_BASE_URL } from "../Config"
import toast from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";





function NoItem() {
    const { user, token, isLoggedInUser } = useSelector((state) => state.auth);

    const [userData, setUserData] = useState({});
      const [loading, setLoading] = useState(true); // ✅ loader state
    
  



  /// get the profile api
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
      } finally {
        setLoading(false); // ✅ hide loader after fetch
      }
    };

    if (token) {
      fetchProfile(); // only call if token exists
    }
  }, [token]);


  return (
    <div className="min-h-screen bg-transparent">


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
                      $3000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="relative flex flex-row md:mr-24 lg:flex-row md:justify-center justify-start items-start gap-4 lg:gap-0 mb-4 lg:mb-8">
            <div className="w-full max-w-7xl md:px-4 px-2 lg:px-8">
              <NavLinks />
            </div>
          </div>
        </div>



         <div className="flex flex-col justify-center items-center text-white gap-4 mt-16 min-h-[400px]">
                  <p className="text-lg font-medium">No Items</p>
                  <img
                    src={noActivity1}
                    alt="No activity one"
                    className="w-[200px] h-auto object-contain"
                  />
                  <img
                    src={noActivity2}
                    alt="No activity two"
                    className="w-[100px] h-auto object-contain"
                  />
                  <button className="w-[207px] h-[43px] mt-5 bg-[#002AA8] rounded-md hover:bg-blue-700 transition-colors">
                    Browse Collection
                  </button>
                </div>
    </div>
  )
}

export default NoItem