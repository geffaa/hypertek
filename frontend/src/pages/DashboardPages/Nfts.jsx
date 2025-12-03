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
    <div className="  flex h-[700px] bg-black flex-col">

        <div
        style={{
          top: `100px`,
          left: `400px`,
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

        <div
        style={{
          top: `550px`,
          left: `880px`,
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
        className="absolute rounded-full
        shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                0_0_100px_50px_rgba(59,130,246,0.4),
                0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>
  
   

      {/* Header */}
      <div className="flex flex-col w-[900px] gap-6 ml-12">
        <h1 className="font-inter font-semibold text-[25px] text-white">
          Collection Management
        </h1>
        <div className="flex justify-between">
          <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20">
            <img src={searchImage} alt="search" className="w-4 h-4 " />
           <input
  type="text"
  placeholder="Search collections"
  className="bg-transparent text-white px-2 py-1 rounded w-full placeholder-gray-300 outline-none focus:ring-0 focus:outline-none"
/>

          </div>
         <Link
  to="/dashboard/add-collection"
  className="w-[150px] h-[40px] flex items-center justify-center text-white text-[16px] rounded-md bg-white/10 backdrop-blur-sm border border-white/20"
>
  Add Collection
</Link>

        </div>
      </div>

      {/* Table */}
      <div className="pl-24 mt-12 ">
        <table className="min-w-[897px] text-left rounded-lg overflow-hidden">
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

      {/* Add some responsive design */}
      <style jsx>{`
        @media (max-width: 768px) {
          .ml-16 {
            margin-left: 1rem;
          }
          .mt-16 {
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default NFTs;
