import React from 'react'
import overview1 from "../assets/images/Profile/Hero.png"
import Profile from "../assets/images/Profile/Profile.png"
import { Link } from 'react-router-dom'
import NavLinks from '../Components/ProfileSection/Navlinks'
import noActivity1 from "../assets/images/NoPersonalActivity/noActivity1.png";
import noActivity2 from "../assets/images/NoPersonalActivity/noActivity2.png";



function NoItem() {
  return (
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
                    src={Profile}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 rounded-full shadow-lg -mt-12 sm:-mt-16 md:-mt-16"
                  />
                </div>

                {/* Profile Info */}
                <div className="mt-3 text-left text-white sm:mt-0">
                  <h2 className="text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-semibold">
                    Lana Kim
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-400 break-words">
                    0xc416a645...b21a{" "}
                    <Link to="/edit">
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