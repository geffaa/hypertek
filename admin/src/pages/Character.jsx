import React, { useState , useEffect} from "react";
import Switch from "@mui/material/Switch";
import Collectionimage from "../assets/CreateCollection/collection.png";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { Dashboard_Base_Url, Image_Base_Url } from "../Config";


function Character() {
  const navigate = useNavigate()
  const [characters, setCharacters] = useState([]);
const [loading, setLoading] = useState(true);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedCharacter, setSelectedCharacter] = useState(null);


useEffect(() => {
  const fetchCharacters = async () => {
    try {
      const response = await axios.get(`${Dashboard_Base_Url}/v1/nft/all`);
      if (response.data.success && response.data.nfts) {
       const chars = response.data.nfts
  .filter(item => item.collection?.Type === "NFA") // <-- filter NFA only
  .map((item, index) => ({
    id: item._id,
    indexId: index + 1,
    name: item.collection?.name || "Unnamed Character",
    image: item.collection?.image || Collectionimage,
    price: item.collection?.price || 0,
    status: item.status === "active",
    collectionData: item.collection,
  }));

        setCharacters(chars);
      } else {
        setCharacters([]);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
      toast.error("Failed to fetch characters");
    } finally {
      setLoading(false);
    }
  };

  fetchCharacters();
}, []);


const handleEditCharacter = (collection) => {
  const adminDataString = localStorage.getItem("admin_data");
  if (!adminDataString) {
    toast.error("Admin ID not found. Please try again.");
    return;
  }

  const adminData = JSON.parse(adminDataString);
  const adminId = adminData._id;

  if (!adminId) {
    toast.error("Admin ID not found. Please try again.");
    return;
  }

  console.log("Editing collection:", collection._id, "Admin ID:", adminId);

  // Navigate with admin ID and pass collection data via state
  navigate(`/${adminId}/edit-collection-item`, { state: { collection } });
};


 const handleToggleStatus = async (char) => {
  if (!Dashboard_Base_Url || !char?.id) return;

  try {
    const newStatus = char.status ? "inactive" : "active";

    const response = await axios.put(
      `${Dashboard_Base_Url}/v1/nft/status/${char.id}`,
      { status: newStatus }
    );

    setCharacters((prev) =>
      prev.map((item) =>
        item.id === char.id
          ? { ...item, status: response.data.nft.status === "active" }
          : item
      )
    );

    toast.success(`Character status updated to ${response.data.nft.status}!`);
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error(error.response?.data?.message || "Failed to update status");
  }
};



const handleOpenDeleteModal = (char) => {
  setSelectedCharacter(char);
  setShowDeleteModal(true);
};

const handleDeleteCharacter = async () => {
  if (!selectedCharacter?.id) return toast.error("Character ID is required");
  if (!Dashboard_Base_Url) return toast.error("Base URL is required");

  try {
    const response = await axios.delete(
      `${Dashboard_Base_Url}/v1/nft/collection/delete/${selectedCharacter.id}`
    );

    if (response.data.success) {
      setCharacters((prev) => prev.filter((c) => c.id !== selectedCharacter.id));
      toast.success("Character deleted successfully!");
      setShowDeleteModal(false);
      setSelectedCharacter(null);
    } else {
      toast.error(response.data.message || "Failed to delete character");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Error deleting character");
  }
};


  return (
    <div className="pt-16 flex h-[700px] bg-black flex-col ">
      {/* Blur Background Left */}
      <div
        style={{
          top: "10px",
          left: "100px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      {/* Blur Background Right */}
      <div
        style={{
          top: "400px",
          left: "620px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      {/* Header */}
      <div className="flex flex-col w-[426px] gap-6 ml-12 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">
          Character Management
        </h1>
      </div>

      {/* Table */}
      <div className="pl-24 mt-12 z-10 relative">
        <table className="min-w-[950px] text-left rounded-lg overflow-hidden">
          <thead>
            <tr className="h-[50px] backdrop-blur-sm">
              <th className="px-6 py-3 text-white font-semibold text-sm">No.</th>
              <th className="px-6 py-3 text-white font-semibold text-sm">Name</th>
              <th className="px-6 py-3 text-white font-semibold text-sm">Image</th>
              <th className="px-6 py-3 text-white font-semibold text-sm">Price</th>
              <th className="px-6 py-3 text-white font-semibold text-sm">Action</th>
              <th className="px-6 py-3 text-white font-semibold text-sm">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {characters.map((char, index) => (
              <tr
                key={char.id}
                className="h-[70px] transition-all duration-200 backdrop-blur-sm"
              >
                {/* Number */}
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                  {index + 1}
                </td>

                {/* Name */}
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                  {char.name}
                </td>

                {/* Image */}
                <td className="px-6 py-4">
                  <img
                      src={char.image ? `${Image_Base_Url}${char.image}` : `${Image_Base_Url}${char.image}` }
                    
                    alt={char.name}
                    className="w-12 h-12 object-cover border border-white/10"
                  />
                </td>

                {/* Price */}
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                  ${char.price}
                </td>

                {/* Action */}
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                     <button
                      onClick={() => handleEditCharacter(char)}
                      className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded"
                    >
                      <img src={EditImage} alt="edit" className="w-4 h-4" />
                    </button>

                    <button className="p-2 cursor-pointer" onClick={() => handleOpenDeleteModal(char)}>
                      <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                    </button>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <Switch
                    checked={char.status}
  onChange={() => handleToggleStatus(char)}
                    sx={{
                      width: 47,
                      height: 20,
                      padding: 0,
                      "& .MuiSwitch-switchBase": {
                        padding: 0,
                        margin: 0,
                        "&.Mui-checked": {
                          transform: "translateX(24px)",
                          color: "#fff",
                          "& + .MuiSwitch-track": {
                            backgroundColor: "#0860eeff",
                            opacity: 1,
                          },
                        },
                      },
                      "& .MuiSwitch-thumb": {
                        width: 22,
                        height: 20,
                        background: "#fff",
                      },
                      "& .MuiSwitch-track": {
                        borderRadius: 34 / 2,
                        backgroundColor: "#9ca3af",
                      },
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {showDeleteModal && selectedCharacter && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-gray-800 rounded-lg p-6 w-[400px] border border-white/10">
      <h2 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h2>
      <p className="mb-6 text-gray-300">
        Are you sure you want to delete <strong className="text-white">{selectedCharacter.name}</strong>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          className="px-4 py-2 border border-gray-400 rounded text-gray-300 hover:bg-gray-700"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedCharacter(null);
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={handleDeleteCharacter}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}

export default Character;
