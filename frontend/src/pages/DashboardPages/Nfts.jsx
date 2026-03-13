import React, { useState } from "react";
import Switch from "@mui/material/Switch";
import searchImage from "../../assets/images/search1.png"
// import Collectionimage from "../assets/CreateCollection/collection.png";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import EditImage from "../../assets/edit.png";
import DeleteImage from "../../assets/delete.png";
import { Link } from "react-router-dom";

function NFTs() {
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: "Character",
      image: Collectionimage,
      supply: 1000,
      status: true,
    },
    { id: 2, name: "NFA", image: Collectionimage, supply: 80, status: false },
    {
      id: 3,
      name: "Weapon",
      image: Collectionimage,
      supply: 2000,
      status: true,
    },
  ]);

  const toggleStatus = (id) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, status: !col.status } : col))
    );
  };

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col w-full max-w-[900px] gap-6 px-4 md:ml-12 z-10">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          NFA's Collection
        </h1>
        <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 w-full sm:max-w-xs">
          <img src={searchImage} alt="search" className="w-4 h-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search collections"
            className="bg-transparent text-white px-2 py-1 rounded w-full placeholder-gray-300 outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      {/* Table Container with overflow for mobile */}
      <div className="px-4 md:pl-24 mt-12 overflow-x-auto custom-scrollbar z-10 w-full relative">
        <table className="min-w-[897px] w-full text-left rounded-lg overflow-hidden">
          <thead>
            <tr className=" h-[50px] backdrop-blur-sm">
              <th className="px-6 py-3 text-white font-semibold text-sm  tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-white font-semibold text-sm   tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-white font-semibold text-sm  tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-white font-semibold text-sm  tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {collections.map((col) => (
              <tr
                key={col.id}
                className="h-[70px]  transition-all duration-200 backdrop-blur-sm"
              >
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                  {col.name}
                </td>
                <td className="px-6 py-4">
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-12 h-12  object-cover border border-white/10"
                  />
                </td>
                <td className="px-6 py-4 text-[#FFFFFFC4]  font-medium">
                  ${col.supply}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button className="p-2  cursor-pointer transition-colors duration-200">
                      <Link to="/dashboard/edit-collection-item">
                        <img src={EditImage} alt="edit" className="w-4 h-4" />
                      </Link>
                    </button>
                    <button className="p-2  cursor-pointer  transition-colors duration-200">
                      <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Switch
                    checked={col.status}
                    onChange={() => toggleStatus(col.id)}
                    sx={{
                      width: 47,
                      height: 20,
                      padding: 0,
                      "& .MuiSwitch-switchBase": {
                        padding: 0,
                        margin: 0,
                        transitionDuration: "300ms",
                        "&.Mui-checked": {
                          transform: "translateX(24px)",
                          color: "#fff",
                          "& + .MuiSwitch-track": {
                            backgroundColor: "#0860eeff",
                            opacity: 1,
                            border: 0,
                          },
                          "&.Mui-disabled + .MuiSwitch-track": {
                            opacity: 0.5,
                          },
                        },
                        "&.Mui-focusVisible .MuiSwitch-thumb": {
                          color: "#3b82f6",
                          border: "6px solid #fff",
                        },
                        "&.Mui-disabled .MuiSwitch-thumb": {
                          color: "gray",
                        },
                        "&.Mui-disabled + .MuiSwitch-track": {
                          opacity: 0.7,
                        },
                      },
                      "& .MuiSwitch-thumb": {
                        boxSizing: "border-box",
                        width: 22,
                        height: 20,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
                      },
                      "& .MuiSwitch-track": {
                        borderRadius: 34 / 2,
                        backgroundColor: "#9ca3af",
                        opacity: 1,
                        transition: "background-color 500ms",
                      },
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Scrollbar and Responsive Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        @media (max-width: 768px) {
          .mt-12 {
            margin-top: 1.5rem;
          }
        }
      `}</style>
    </div >
  );
}

export default NFTs;
