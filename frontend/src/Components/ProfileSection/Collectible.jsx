import React, { useState, useEffect } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import popularCollections from "../../assets/images/popular/popolar.png";
import TVector from "../../assets/images/popular/vector.png";
import NavLinks from "../ProfileSection/Navlinks";
import CustomButton from "../Buttons/Button1";
import GlowingOrb from "../Common/BgColoring";
import symbol from "../../assets/images/login/Symbol.svg.png";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { FaUserCircle } from "react-icons/fa";
import FullScreenLoader from "../Common/Spinner";

function MarketPlace() {
  const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const [isFourthOpen, setIsFourthOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const openSecondModal = () => {
    setIsOpen(false);
    setIsSecondOpen(true);
  };
  const closeSecondModal = () => setIsSecondOpen(false);

  const openThirdModal = () => {
    setIsSecondOpen(false);
    setIsThirdOpen(true);
  };
  const closeThirdModal = () => setIsThirdOpen(false);

  const openFourthModal = () => {
    setIsThirdOpen(false);
    setIsFourthOpen(true);
  };
  const closeFourthModal = () => setIsFourthOpen(false);

  const handleConnectWallet = () => {
    closeThirdModal();
    setTimeout(() => {
      openFourthModal();
    }, 150);
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/collection/get`
        );
        if (res.data.success) setMarketData(res.data.collections);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/getProfile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(res.data.user);
        console.log("✅ Profile fetched:", res.data.user);
      } catch (error) {
        console.error(
          "❌ Profile fetch error:",
          error.response?.data || error.message
        );
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  console.log("your user get data are :", userData);
  // console.log("Avatar:", userData.Bio);

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      {/* ------------------ Main Section ------------------ */}
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
                      {userData?.FullName
                        ? userData.FullName.replace(/[0-9]/g, "") || ""
                        : userData?.Email
                        ? userData.Email.split("@")[0].replace(/[0-9]/g, "")
                        : "Guest"}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 break-words">
                      {userData?.DiscordId ||
                        userData?.GoogleId ||
                        userData?._id ||
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

        {/* ---------------------- Card Sections -------------------------------------- */}
        <section className="flex flex-col relative z-10 gap-4 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 lg:gap-8 mb-12 lg:mb-16">
          <GlowingOrb Xaxis={800} Yaxis={100} />

          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-2 z-10 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
              {marketData.slice(0, 4).map((item, index) => {
                const collection = item.collection; // extract the inner collection object
                return (
                  <div
                    key={index}
                    className="group bg-gray-800 rounded-lg shadow-md text-white p-4 z-10 w-full max-w-xs sm:max-w-sm lg:max-w-none h-[320px] lg:h-[400px] xl:h-[420px] 2xl:h-[450px] flex flex-col justify-between transition-all duration-300"
                  >
                    <div className="w-full h-32 lg:h-[160px] xl:h-[180px] 2xl:h-[200px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26]">
                      <img
                        src={`${BACKEND_BASE_URL}${collection.image}`}
                        alt={collection.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <h2 className="text-base lg:text-lg xl:text-xl font-bold md:mt-3 lg:mt-4 line-clamp-2">
                      {collection.name}
                    </h2>

                    <div className="flex justify-between items-center md:mb-3 lg:mb-4 md:mt-4 lg:mt-5">
                      <h3 className="text-xs lg:text-sm xl:text-base font-semibold">
                        {collection.symbol} 🔥
                      </h3>
                      <div className="flex items-center">
                        <img
                          src={TVector}
                          alt=""
                          className="w-2 h-2 lg:w-[10px] lg:h-[9px] xl:w-[12px] xl:h-[12px]"
                        />
                        <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm xl:text-base font-semibold">
                          ${collection.priceETH || 0}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="block lg:hidden w-full">
                        <button
                          onClick={() => openModal(collection)}
                          className="w-full"
                        >
                          <CustomButton text="List Now" />
                        </button>
                      </div>

                      <div className="hidden lg:group-hover:flex justify-center transition-all duration-300 w-full">
                        <button
                          onClick={() => openModal(collection)}
                          className="w-full"
                        >
                          <CustomButton text="List Now" />
                        </button>
                      </div>

                      <div className="lg:group-hover:hidden hidden md:block text-gray-400 text-sm md:mt-2 transition-all duration-300 text-center">
                        No Listing
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ------------------ First Modal ------------------ */}
      {isOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-sm md:max-w-md h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            {/* Title */}
            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {/* Image + Hover Button */}
            <div className="relative w-[60%] h-32 lg:h-[160px] xl:h-[180px] 2xl:h-[200px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26] flex justify-center mx-auto group">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
              <button className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white text-sm px-4 py-1 rounded-md">
                Preview
              </button>
            </div>

            {/* Asset Title */}
            <h1 className="text-white text-xl font-bold mb-2 mt-4">
              {selectedItem.title}
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {/* Price Details */}
            {[
              { label: "List price", value: `$ ${2000} USDT` },
              { label: "Platform Fee", value: "$0.5 USDT" },
            ].map((item, index) => (
              <div key={index} className="w-[90%] mb-3">
                <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem",
                      height: "1.3rem",
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0",
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium w-[95.89px] h-[19.45] md:w-[150.31px] md:h-[39.59px]"
                    style={{
                      border: "2.24px solid #002AA8",
                    }}
                  >
                    Cancel
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem",
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem]"></div>
                </div>
              </button>

              <button onClick={openSecondModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem",
                      height: "1.3rem",
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0",
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium w-[95.89px] h-[19.45] md:w-[150.31px] md:h-[39.59px]"
                    style={{
                      background:
                        "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8",
                    }}
                  >
                    List Now
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem",
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem]"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Second Modal ------------------ */}
      {isSecondOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          onClick={closeSecondModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-sm md:max-w-md h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSecondModal}
              className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
            >
              &times;
            </button>

            <h1 className="text-white font-bold text-lg md:text-xl">
              Buy Assets
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[60%] h-32 lg:h-[160px] xl:h-[180px] 2xl:h-[200px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26] flex justify-center mx-auto">
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top scale-x-[-1]"
              />
            </div>

            <h1 className="text-white text-lg md:text-xl">
              {selectedItem.title}
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">List Price</p>
                <p className="text-white text-sm">
                  ${selectedItem.price + 0.5}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeSecondModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem",
                      height: "1.3rem",
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0",
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium w-[95.89px] h-[19.45] md:w-[150.31px] md:h-[39.59px]"
                    style={{
                      border: "0.15rem solid #002AA8",
                    }}
                  >
                    Cancel
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem",
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem]"></div>
                </div>
              </button>

              <button onClick={openThirdModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem",
                      height: "1.3rem",
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0",
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium w-[95.89px] h-[19.45] md:w-[150.31px] md:h-[39.59px]"
                    style={{
                      background:
                        "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8",
                    }}
                  >
                    Confirm
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8] h-[30.79px] md:w-[7.97px] w-[5.73px] md:h-[42.86px]"
                    style={{
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem",
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div className="bg-[#002AA8] md:h-[1.5rem] h-[1rem] w-[0.25rem]"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Third Modal (Connect Wallet) ------------------ */}
      {isThirdOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm sm:max-w-md relative">
            <button
              onClick={closeThirdModal}
              className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
            >
              ×
            </button>

            <h2 className="text-white text-lg font-bold text-center my-4">
              Connect Wallet
            </h2>
            <hr className="border-t border-gray-600 my-4" />

            <div
              onClick={handleConnectWallet}
              className="flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-4 cursor-pointer hover:bg-gray-700 transition h-20"
            >
              <img
                src={symbol}
                alt="Connect wallet image"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-white font-medium text-lg">MetaMask</h1>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Fourth Modal ------------------ */}
      {isFourthOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm sm:max-w-md relative">
            <button
              onClick={closeFourthModal}
              className="absolute top-3 right-3 text-white font-bold text-2xl hover:text-gray-300 transition"
            >
              ×
            </button>

            <h2 className="text-white text-lg font-bold text-center my-4">
              Connect Wallet
            </h2>
            <hr className="border-t border-gray-600 my-4" />

            <div className="flex flex-col items-center justify-center gap-4 mb-6 mt-4">
              <img
                src={symbol}
                alt="Connect wallet image"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-white font-medium text-xl">MetaMask</h1>
            </div>

            <div className="flex flex-col items-center gap-4 mt-6">
              <button>
                <CustomButton text="Connect" />
              </button>

              <button onClick={closeFourthModal}>
                <div className="flex items-center cursor-pointer">
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{ width: "0.25rem", height: "1.3rem" }}
                  ></div>

                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem",
                      height: "2.3rem",
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0",
                    }}
                  ></div>

                  <div
                    className="flex items-center justify-center text-white font-medium"
                    style={{
                      width: "7.5rem",
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
                      height: "2.3rem",
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem",
                    }}
                  ></div>

                  <div
                    className="bg-[#002AA8]"
                    style={{ width: "0.25rem", height: "1.2rem" }}
                  ></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MarketPlace;
