import React, { useState } from "react";
import Switch from "@mui/material/Switch";
import Collectionimage from "../assets/CreateCollection/collection.png";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { Link } from "react-router-dom";
import Header from "../components/common/header";

function Character() {
  const [characters, setCharacters] = useState([
    { id: 1, name: "Knight", image: Collectionimage, price: 2000, address: "0x1234...abcd", status: true },
    { id: 2, name: "Mage", image: Collectionimage, price: 1800, address: "0x5678...efgh", status: false },
    { id: 3, name: "Warrior", image: Collectionimage, price: 2200, address: "0x9abc...ijkl", status: true },
    { id: 4, name: "Archer", image: Collectionimage, price: 1500, address: "0x1111...mnop", status: true },
    { id: 5, name: "Paladin", image: Collectionimage, price: 2500, address: "0x2222...qrst", status: false },
    { id: 6, name: "Assassin", image: Collectionimage, price: 3000, address: "0x3333...uvwx", status: true },
    { id: 7, name: "Sorcerer", image: Collectionimage, price: 2700, address: "0x4444...yzab", status: false },
    { id: 8, name: "Berserker", image: Collectionimage, price: 1900, address: "0x5555...cdef", status: true },
  ]);

  const toggleStatus = (id) => {
    setCharacters((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: !item.status } : item))
    );
  };

  return (
  <>
    <div className=" flex flex-col  min-h-screen bg-black ">
      
      {/* Blur Backgrounds */}
      <div
        style={{ top: "15px", left: "210px", width: "250px", height: "250px", background: "#002AA8", filter: "blur(180px)", pointerEvents: "none" }}
        className="absolute rounded-full"
      ></div>
      <div
        style={{ top: "400px", left: "620px", width: "250px", height: "250px", background: "#002AA8", filter: "blur(180px)", pointerEvents: "none" }}
        className="absolute rounded-full"
      ></div>

      {/* Header */}
      <div className="flex flex-col w-[426px] gap-6 ml-12 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">
          Collection On Sale
        </h1>
      </div>

      {/* Table */}
      <div className="pl-24 mt-12 z-10 relative">
        <table className="w-[927px] text-left rounded-lg overflow-hidden">
          <thead>
            <tr className="h-[50px] ">
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Image</th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Name</th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Price</th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Address</th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Action</th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {characters.map((char, index) => (
              <tr key={char.id} className="h-[70px] transition-all duration-200 backdrop-blur-sm">
                <td className="px-6 py-4">
                  <img src={char.image} alt={char.name} className="w-12 h-12 object-cover border border-white/10" />
                </td>
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{char.name}</td>
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">${char.price}</td>
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{char.address}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button className="p-2 cursor-pointer">
                      <Link to="#">
                        <img src={EditImage} alt="edit" className="w-4 h-4" />
                      </Link>
                    </button>
                    <button className="p-2 cursor-pointer">
                      <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Switch
                    checked={char.status}
                    onChange={() => toggleStatus(char.id)}
                    sx={{
                      width: 46,
                      height: 20,
                      padding: 0,
                      "& .MuiSwitch-switchBase": {
                        padding: 0,
                        margin: 0,
                        "&.Mui-checked": {
                          transform: "translateX(24px)",
                          color: "#fff",
                          "& + .MuiSwitch-track": { backgroundColor: "#0860eeff", opacity: 1 },
                        },
                      },
                      "& .MuiSwitch-thumb": { width: 22, height: 20, background: "#fff" },
                      "& .MuiSwitch-track": { borderRadius: 34 / 2, backgroundColor: "#9ca3af" },
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add More Button */}
      <div className="flex justify-start m-12">
        <button
          className="flex items-center justify-center
          w-[190px] h-[42px] rounded-[6px] p-[10px] gap-[10px]
          bg-[#002AA8] text-white font-inter font-medium hover:opacity-90 transition"
        >
          <p className="w-[84px] h-[22px] font-inter font-normal text-[18px] leading-[100%] opacity-100">
            Add More
          </p>
        </button>
      </div>
    </div>
  
  </>
  );
}

export default Character;
