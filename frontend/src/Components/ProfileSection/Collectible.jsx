import React, { useState , useEffect, useDebugValue } from "react";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import popularCollections from "../../assets/images/popular/popolar.png";
import TVector from "../../assets/images/popular/vector.png";
import Profile from "../../assets/images/Profile/Profile.png";
import NavLinks from "../ProfileSection/Navlinks";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../Buttons/Button2";
import GlowingOrb from "../Common/BgColoring";
import symbol from "../../assets/images/login/Symbol.svg.png";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";



function MarketPlace() {

  // get the login user data from the redux store 
   const { user, token, isLoggedInUser } = useSelector((state) => state.auth);
   console.log("your data in the profile are :",user.id);


// user data from the database 
const [ userData , setUserData ] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const [isFourthOpen, setIsFourthOpen] = useState(false);

  const openModal = () => setIsOpen(true);
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

  // Handle Connect Wallet click
  const handleConnectWallet = () => {
    closeThirdModal();
    setTimeout(() => {
      openFourthModal();
    }, 150);
  };



useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/v1/getProfile", {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 send token here
          },
        });
        setUserData(res.data.user)
        console.log("✅ User profile:", res.data.user);
      } catch (error) {
        console.error("❌ Profile fetch error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };

    if (token) {
      fetchProfile(); // only call if token exists
    }
  }, [token]);
  
console.log("Full Name:", userData.FullName);


  return (
    <>
      {/* ------------------ Main Section ------------------ */}
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto mt-18 lg:mt-[92px]">
          <div className="w-full">
            <div
              className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] xl:h-[300px] 2xl:h-[360px] w-full bg-cover bg-center bg-no-repeat mb-20 md:mb-24"
              style={{ backgroundImage: `url(${overview1})` }}
            ></div>

            <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  <img
                   src={userData.Avatar ? `http://localhost:3000${userData.Avatar}` : Profile}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 rounded-full shadow-lg -mt-12 sm:-mt-16 md:-mt-16"
                  />
                </div>

                {/* Profile Info */}
                <div className="mt-3 text-left text-white sm:mt-0">
                  <h2 className="text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-semibold">

{userData.FullName || "N/A"}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-400 break-words">
                   {userData.DiscordId || userData.GoogleId || userData._id || "null"}

                    <Link to="/edit"   state={{ userData }}>
                      <span className="ml-1 sm:ml-2 cursor-pointer underline">
                        Edit Profile
                      </span>
                    </Link>
                  </p>
                  <p className="text-green-400 font-semibold mt-1 text-sm sm:text-base md:text-lg xl:text-xl">
                    $3000
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-row justify-between items-center gap-2 mb-4 lg:mb-8 xl:px-12 2xl:px-24">
            <NavLinks />
          </div>
        </div>

        <section className="mx-auto flex flex-col gap-6 lg:gap-2 mb-2 px-2 sm:px-12 xl:px-20 2xl:px-32 relative z-10 lg:mb-2">
          <GlowingOrb Xaxis={800} Yaxis={100} />

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 justify-center">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="group bg-gray-800 rounded-lg shadow-md text-white p-4 z-10 w-full max-w-sm mx-auto lg:max-w-none h-[380px] lg:h-[400px] xl:h-[420px] 2xl:h-[450px] flex flex-col justify-between transition-all duration-300"
              >
                <div className="w-full h-32 lg:h-[160px] xl:h-[180px] 2xl:h-[200px] overflow-hidden rounded-[19px] bg-gradient-to-b from-[#977C34] to-[#493F26]">
                  <img
                    src={popularCollections}
                    alt="Collection"
                    className="w-full h-full object-cover object-top scale-x-[-1]"
                  />
                </div>

                <h2 className="text-base lg:text-lg xl:text-xl font-bold mt-3 lg:mt-4">
                  Monkey Ape
                </h2>

                <div className="flex justify-between items-center mb-3 lg:mb-4 mt-4 lg:mt-5">
                  <h3 className="text-xs lg:text-sm xl:text-base font-semibold">
                    No33 🔥
                  </h3>
                  <div className="flex items-center">
                    <img
                      src={TVector}
                      alt=""
                      className="w-2 h-2 lg:w-[10px] lg:h-[9px] xl:w-[12px] xl:h-[12px]"
                    />
                    <h3 className="pl-1 lg:pl-2 text-xs lg:text-sm xl:text-base font-semibold">
                      $2,000
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center mt-auto w-full">
                  {/* Small screens: always show List Now */}
                  <div className="block lg:hidden w-full">
                    <button onClick={openModal} className="w-full">
                      <CustomButton text="List Now" />
                    </button>
                  </div>

                  {/* Large screens: show on hover */}
                  <div className="hidden lg:group-hover:block transition-all duration-300 w-full">
                    <button onClick={openModal} className="w-full">
                      <CustomButton text="List Now" />
                    </button>
                  </div>

                  {/* No Listing text for hover state on large screens */}
                  <div className="lg:group-hover:hidden text-gray-400 text-sm mt-2 transition-all duration-300">
                    No Listing
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ------------------ First Modal ------------------ */}
      {isOpen && (
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
              Monkey Ape
            </h1>
            <div className="w-[90%] h-[1px] bg-gray-500 my-4"></div>

            {/* Price Details */}
            {[
              { label: "List price", value: "$2000 USDT" },
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
            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
              <button onClick={closeModal}>
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.1rem", // ~21.93px
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex items-center justify-center text-white font-medium"
                    style={{
                      width: "8rem", // ~168px
                      height: "2rem", // ~39.59px
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8", // ~2.42px
                    }}
                  >
                    Cancel
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.1rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>
              <button
                onClick={openSecondModal}
                className="w-full md:w-auto text-normal"
              >
                <CustomButton text="List now " />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Second Modal ------------------ */}
      {isSecondOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-4"
          onClick={closeSecondModal}
        >
          <div
            className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
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

            <h1 className="text-white  text-lg md:text-xl">Monkey Ape</h1>
            <div className="w-[90%] h-[1px] bg-gray-300 my-4"></div>

            <div className="w-[90%] mb-3">
              <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
                <p className="text-gray-400 text-sm">List Price</p>
                <p className="text-white text-sm">$2000.5</p>
              </div>
            </div>

            <div className="flex  md:flex-row gap-4 mt-6 w-full justify-center">
              <button
                onClick={closeSecondModal}
                className="w-full w-[8rem] md:w-auto"
              >
                <div className="flex items-center">
                  {/* Left small bar */}
                  <div
                    className="bg-[#002AA8] mr-0.5"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.1rem", // ~21.93px
                    }}
                  ></div>

                  {/* Left angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
                    }}
                  ></div>

                  {/* Main button area */}
                  <div
                    className="flex  items-center justify-center text-white font-medium"
                    style={{
                      width: "8rem", // ~168px
                      height: "2rem", // ~39.59px
                      // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                      border: "0.15rem solid #002AA8", // ~2.42px
                    }}
                  >
                    Close
                  </div>

                  {/* Right angled border */}
                  <div
                    className="border-[#002AA8]"
                    style={{
                      width: "0.5rem", // ~7.97px
                      height: "2.2rem", // ~42.86px
                      borderStyle: "solid",
                      borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
                    }}
                  ></div>

                  {/* Right small bar */}
                  <div
                    className="bg-[#002AA8]"
                    style={{
                      width: "0.25rem", // ~3.99px
                      height: "1.1rem", // ~21.93px
                    }}
                  ></div>
                </div>
              </button>
              <button onClick={openThirdModal}>
                <CustomButton text="Confirm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Third Modal (Connect Wallet) ------------------ */}
      {isThirdOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
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
              className="flex items-center justify-center gap-4 p-6 bg-gray-800 border border-gray-700 rounded-xl mt-8 cursor-pointer hover:bg-gray-700 transition h-20"
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-24">
          <div className="bg-gray-900 rounded-lg p-6 w-11/12 sm:w-[450px] relative">
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

            <div className="flex flex-col items-center justify-center gap-4 mb-6 mt-8">
              <img
                src={symbol}
                alt="Connect wallet image"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-white font-medium text-xl">MetaMask</h1>
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
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
