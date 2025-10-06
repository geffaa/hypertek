import React, { useState } from "react";
import ManImage from "../../assets/images/Overview/man.png";
import overview1 from "../../assets/images/Profile/Hero.png";
import { Link } from "react-router-dom";
import NavLinks from "../ProfileSection/Navlinks";
import Profile from "../../assets/images/Profile/Profile.png";
import GlowingOrb from "../Common/BgColoring";
import CustomButton from "../Buttons/Button1";
import land1Image from "../../assets/images/Overview/land1.jpg";


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
    {
      id: 2,
      name: "Crypto Tiger",
      status: "Inactive",
      price: 1500,
      floor: 1200,
      qty: 2,
      image: ManImage,
      checked: false,
    },
    {
      id: 3,
      name: "Golden Ape",
      status: "Active",
      price: 3000,
      floor: 2800,
      qty: 1,
      image: ManImage,
      checked: false,
    },
  ]);

  // State for modal visibility
  const [showModal, setShowModal] = useState(false);

  // State to track which items are being cancelled
  const [selectedToCancel, setSelectedToCancel] = useState([]);

  // Toggle checkbox
  const handleCheckboxChange = (id) => {
    setActivities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Calculate selected items dynamically
  const selectedItems = activities.filter((a) => a.checked);
  const totalSelected = selectedItems.length;

  // Open modal on cancel button click
  const handleCancelClick = () => {
    setSelectedToCancel(selectedItems.map((a) => a.id));
    setShowModal(true);
  };

  // Confirm cancellation
  const handleConfirmCancel = () => {
    setActivities((prev) =>
      prev.map((item) =>
        selectedToCancel.includes(item.id) ? { ...item, checked: false } : item
      )
    );
    setShowModal(false);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <div className="mt-20 lg:mt-[92px]">
        {/* Hero Banner */}
        <div
          className="relative h-40 sm:h-48 md:h-56 lg:h-[237px] w-full mb-20 md:mb-24 bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: `url(${overview1})` }}
        ></div>

        {/* Profile Content Section */}
        <div className="relative -mt-16 sm:-mt-20 md:-mt-24 px-0 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-0">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={Profile}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-lg -mt-12 sm:-mt-16 md:-mt-16"
              />
            </div>

            {/* Profile Info */}
            <div className="text-left text-white">
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

        {/* Navigation Section */}
        <div className="relative flex flex-col lg:flex-row justify-start items-start gap-4 mb-8">
          <NavLinks />
        </div>
      </div>

      {/* Activities Section */}
      <section className="mx-auto flex flex-col gap-6 lg:gap-8 mb-4 px-4 sm:px-12 xl:px-18 2xl:px-32">
        <GlowingOrb Xaxis={920} Yaxis={600} />

        {/* Table */}
        <div className="overflow-x-auto rounded-lg z-10">
          <table className="w-full text-white table-auto">
            <thead className="bg-[#00134C]">
              <tr className="text-left">
                {["Listing", "Status", "Price", "Floor", "Qty", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-[18px] font-inter font-medium"
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
                  {/* Listing */}
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-md overflow-hidden relative"
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
                      <span className="text-xs sm:text-sm lg:text-[18px] font-inter font-medium">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                    <span className="flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-md text-green-400 text-xs sm:text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      {item.status}
                    </span>
                  </td>

                  {/* Price, Floor, Qty */}
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                    ${item.price}
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                    ${item.floor}
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                    {item.qty}
                  </td>

                  {/* Checkbox */}
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      className="
                        w-4 h-4 appearance-none border-2 border-blue-500 rounded 
                        bg-transparent cursor-pointer
                        checked:border-blue-500 checked:bg-blue-500
                        checked:before:content-['✔'] checked:before:text-white 
                        checked:before:block checked:before:text-center 
                        checked:before:leading-4 checked:before:text-xs
                      "
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cancel Button */}
          {totalSelected > 0 && (
            <button
              onClick={handleCancelClick}
              className="text-white mt-4 sm:mt-6 bg-blue-500 px-3 py-1 rounded-md inline-block transition-all duration-300"
            >
              Cancel {totalSelected} Listing{totalSelected > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </section>

      {/* Modal */}
  {showModal && (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center p-4"
    // Removed background overlay
    onClick={handleCloseModal}
  >
    <div
      className="bg-[#252B37] rounded-lg p-6 flex flex-col items-center relative w-full max-w-md md:max-w-lg h-auto mt-12"
      onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
    >
      {/* Close button top-right */}
      <button
        onClick={handleCloseModal}
        className="absolute top-3 right-3 text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 hover:text-red-500"
      >
        &times;
      </button>

      {/* Modal Title */}
      <h1 className="text-white font-bold text-lg md:text-xl mb-4 text-center">
        Cancel Listing
      </h1>
      <div className="w-[90%] h-[1px] bg-gray-300 mb-4"></div>

      {/* Optional Listing Preview Box */}
   <div className="flex items-start justify-between w-full max-w-xl  rounded-[19px] p-4 mx-auto mb-4">
  {/* Left: Small Image */}
  <div className="w-1/5 h-20 lg:h-24 xl:h-28 2xl:h-32 flex items-center justify-center rounded-[15px] bg-gradient-to-b from-[#977C34] to-[#493F26] overflow-hidden">
    <img
      src={land1Image}
      alt="Collection"
      className="w-3/4 h-3/4 object-cover object-center"
    />
  </div>

  {/* Middle: Title & Description */}
  <div className="flex-1 ml-4 ">
    <h2 className="text-white font-bold text-lg">Monkey Ape</h2>
    <p className="text-gray-200 text-sm mt-1">
      You own 1
    </p>
  </div>

  {/* Right: Price */}
  <div className="flex-shrink-0 ml-4">
    <p className="text-gray-500 font-semibold text-lg">Listed : $2000.05</p>
  </div>
</div>



      {/* Listing Name */}
      <h1 className="text-white text-lg md:text-xl mb-4">
        {selectedToCancel.length === 1
          ? selectedToCancel[0].name
          : `${selectedToCancel.length} Items`}
      </h1>
      <div className="w-[90%] h-[1px] bg-gray-300 mb-6"></div>

      {/* Price Info */}
      <div className="w-[90%] mb-6">
        <div className="flex justify-between items-center rounded px-4 h-9 bg-white/10">
          <p className="text-gray-400 text-sm">Total Price</p>
          <p className="text-white text-sm">
            $
            {selectedToCancel.reduce((sum, item) => sum + item.price, 0)}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex md:flex-row gap-4 w-full justify-center">
        {/* Cancel Button */}
        <button onClick={handleCloseModal} className="w-full md:w-auto">
          <div className="flex items-center">
            {/* Left small bar */}
            <div className="bg-[#002AA8] mr-0.5" style={{ width: "0.25rem", height: "1.1rem" }}></div>
            {/* Left angled border */}
            <div
              className="border-[#002AA8]"
              style={{
                width: "0.5rem",
                height: "2.2rem",
                borderStyle: "solid",
                borderWidth: "0.375rem 0.25rem 0.375rem 0",
              }}
            ></div>
            {/* Main button */}
            <div
              className="flex items-center justify-center text-white font-medium"
              style={{ width: "8rem", height: "2rem", border: "0.15rem solid #002AA8" }}
            >
              Close
            </div>
            {/* Right angled border */}
            <div
              className="border-[#002AA8]"
              style={{
                width: "0.5rem",
                height: "2.2rem",
                borderStyle: "solid",
                borderWidth: "0.25rem 0 0.375rem 0.25rem",
              }}
            ></div>
            {/* Right small bar */}
            <div className="bg-[#002AA8]" style={{ width: "0.25rem", height: "1.1rem" }}></div>
          </div>
        </button>

        {/* Confirm Button */}
        <button onClick={handleConfirmCancel}>
          <CustomButton text="Confirm" />
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}

export default PersonalActivity;
