import React, { useState } from "react";
import Switch from "@mui/material/Switch";
import searchImage from "../../assets/search.png";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import EditImage from "../../assets/edit.png";
import DeleteImage from "../../assets/delete.png";
import { Link } from "react-router-dom";

function CollectionDetails() {
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: "Character",
      image: Collectionimage,
      supply: 120,
      status: true,
    },
    { id: 2, name: "NFA", image: Collectionimage, supply: 80, status: false },
    {
      id: 3,
      name: "Weapon",
      image: Collectionimage,
      supply: 200,
      status: true,
    },
  ]);

  const toggleStatus = (id) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, status: !col.status } : col))
    );
  };

  return (
    <div className=" mt-12 flex h-[700px] bg-black flex-col">
      <div
        style={{
          top: `120px`,
          left: `290px`,
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
          top: `560px`,
          left: `900px`,
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
          NFA Details
        </h1>
        <div className="flex justify-between">
          <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20">
            <img src={searchImage} alt="search" className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search collections"
              className="bg-transparent text-white px-2 py-1 outline-none rounded w-full placeholder-gray-300 "
            />
          </div>
         <Link
  to="/dashboard/add-collection"
  className="w-[150px] h-[40px] flex items-center justify-center text-white text-[16px] rounded-md bg-white/10 backdrop-blur-sm border border-white/20"
>
  Add NFA
</Link>

        </div>
      </div>

    {/* Table */}
{/* Table */}
<div className="w-[900px] ml-24 mt-12 overflow-x-auto custom-scrollbar">
  <table className="min-w-[1200px] text-left rounded-lg">
    <thead>
      <tr className="h-[50px] backdrop-blur-sm">
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Name</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Image</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Symbol</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Chain</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Creator Fee</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Supply</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Wallet Address</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Action</th>
        <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Status</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-white/10">
      {collections.map((col) => (
        <tr key={col.id} className="h-[70px] transition-all duration-200 backdrop-blur-sm">
          <td className="px-6 py-4 text-white/80 font-medium">{col.name}</td>
          <td className="px-6 py-4">
            <img src={col.image} alt={col.name} className="w-12 h-12 object-cover border border-white/10 rounded-md" />
          </td>
          <td className="px-6 py-4 text-white/80 font-medium">{col.symbol}</td>
          <td className="px-6 py-4 text-white/80 font-medium">{col.chain}</td>
          <td className="px-6 py-4 text-white/80 font-medium">{col.creatorFee}%</td>
          <td className="px-6 py-4 text-white/80 font-medium">{col.supply}</td>
          <td className="px-6 py-4 text-white/80 font-medium">{col.recipient}</td>
          <td className="px-6 py-4 flex gap-4">
            <Link to="/dashboard/edit-nfa">
              <img src={EditImage} alt="edit" className="w-4 h-4 cursor-pointer" />
            </Link>
            <img src={DeleteImage} alt="delete" className="w-3 h-4 cursor-pointer" />
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
                  },
                },
                "& .MuiSwitch-thumb": {
                  boxSizing: "border-box",
                  width: 22,
                  height: 20,
                  backgroundColor: "#fff",
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

{/* Add this style at the end of your component or in a global CSS file */}
<style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    height: 6px; /* height of horizontal scrollbar */
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`}</style>



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

export default CollectionDetails;
