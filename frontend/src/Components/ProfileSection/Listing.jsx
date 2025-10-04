import React, { useState } from "react";
import ManImage from "../../assets/images/Overview/man.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import NavLinks from "../ProfileSection/Navlinks";
import Profile from "../../assets/images/Profile/Profile.png";
import GlowingOrb from "../Common/BgColoring";

function PersonalActivity() {
  // Activities data
  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "Monkey Ape",
      status: "Active",
      price: 2000,
      floor: 2000,
      qty: 1,
      image: ManImage,
      checked: false,
    },
  ]);

  // Toggle checkbox
  const handleCheckboxChange = (id) => {
    setActivities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Internal calculation (not shown unless > 0)
  const selectedItems = activities.filter((a) => a.checked);
  const totalSelected = selectedItems.length;
  const totalValue = selectedItems.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <div className="mx-auto mt-20 lg:mt-[92px]">
        <div className="w-full">
          <div
            className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] w-full 
           bg-cover bg-top bg-no-repeat mb-20 md:mb-24"
            style={{ backgroundImage: `url(${overview1})` }}
          ></div>

          {/* Profile Content Section */}
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col items-center sm:items-start">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={Profile}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-lg 
                 -mt-12 sm:-mt-16 md:-mt-16"
                />
              </div>

              {/* Profile Info */}
              <div className="mt-3 text-center sm:text-left text-white">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                  Lana Kim
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 break-words">
                  0xc416a645...b21a{" "}
                  <Link to="/edit">
                    <span className="ml-1 sm:ml-2 cursor-pointer underline">
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

        {/* Navigation */}
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <NavLinks />
        </div>
      </div>

      {/* Activities Section */}
      <section className="mx-auto flex flex-col gap-6 lg:gap-8 mb-4 px-6 sm:px-12 xl:px-18 2xl:px-32">
        <GlowingOrb Xaxis={920} Yaxis={600} />

        {/* Table */}
        <div className="overflow-x-auto rounded-lg z-10">
          <table className="w-full min-w-[800px] text-white">
            <thead className="bg-[#00134C]">
              <tr className="text-left">
                {["Listing", "Status", "Price", "Floor", "Qty", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-sm lg:text-[18px] font-inter font-medium"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {activities.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#00134C] hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 lg:px-6 py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="h-10 w-10 lg:h-12 lg:w-12 rounded-md overflow-hidden relative"
                        style={{
                          background:
                            "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
                        }}
                      >
                        <img
                          src={item.image}
                          alt="Collection"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <span className="text-sm lg:text-[18px] font-inter font-medium">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 lg:px-6 py-3">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-md text-green-400 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 lg:px-6 py-3">${item.price}</td>
                  <td className="px-4 lg:px-6 py-3">${item.floor}</td>
                  <td className="px-4 lg:px-6 py-3">{item.qty}</td>

                  {/* Checkbox */}
                  <td className="px-4 lg:px-6 py-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      className="
                        w-4 h-4 
                        appearance-none 
                        border-2 border-blue-500 rounded 
                        bg-transparent 
                        cursor-pointer
                        checked:border-blue-500 
                        checked:bg-blue-500
                        checked:before:content-['✔'] 
                        checked:before:text-white 
                        checked:before:block 
                        checked:before:text-center 
                        checked:before:leading-4 
                        checked:before:text-xs 
                      "
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Conditionally show the Cancel text only when items selected */}
{totalSelected > 0 && (
  <p className="text-white mt-12 bg-blue-500 px-3 py-1 rounded-md inline-block">
    Cancel {totalSelected} Listing{totalSelected > 1 ? "s" : ""}
  </p>
)}

        </div>
      </section>
    </div>
  );
}

export default PersonalActivity;
