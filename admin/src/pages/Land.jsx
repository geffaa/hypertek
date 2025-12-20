import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config"; // make sure these exist

function Land() {
  const [landData, setLandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedLand, setSelectedLand] = useState(null);



const handleOpenDeleteModal = (land) => {
  setSelectedLand(land);
  setShowDeleteModal(true);
};


const handleDeleteLand = async () => {
  if (!selectedLand?.id) return toast.error("Land ID is required");
  if (!Dashboard_Base_Url) return toast.error("Base URL is required");

  try {
    const response = await axios.delete(
      `${Dashboard_Base_Url}/v1/nft/collection/delete/${selectedLand.id}`
    );

    

    if (response.data.success) {
      // Remove deleted land from state
      setLandData((prev) => prev.filter((l) => l.id !== selectedLand.id));
      toast.success("Land deleted successfully!");
      setShowDeleteModal(false);
      setSelectedLand(null);
    } else {
      toast.error(response.data.message || "Failed to delete land");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Error deleting land");
  }
};

const handleEditLand = (collection) => {
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


  // Fetch NFT data
  useEffect(() => {
    const fetchLandData = async () => {
      try {
        const response = await axios.get(`${Dashboard_Base_Url}/v1/nft/all`);

        console.log("your land collection are :",response);
        if (response.data.success && response.data.nfts) {
          // Filter only NFTs that are “land” (if you have a property to identify)
          const lands = response.data.nfts
  .filter(item => item.collection?.Type === "Land") // <-- filter for Land only
  .map((item, index) => ({
    id: item._id,
    indexId: index + 1,
    name: item.collection?.name || "Unnamed Land",
    image: item.collection?.image || "",
    price: item.collection?.price || 0,
    status: item.status === "active",
    collectionData: item.collection,
  }));
setLandData(lands);

          
        } else {
          setLandData([]);
        }
      } catch (error) {
        console.error("Error fetching land data:", error);
        toast.error("Failed to fetch land data");
      } finally {
        setLoading(false);
      }
    };

    fetchLandData();
  }, []);



const handleToggleStatus = async (land) => {
  if (!Dashboard_Base_Url || !land?.id) return; // use land.id

  try {
    // Toggle status: active <-> inactive
    const newStatus = land.status ? "inactive" : "active";

    const response = await axios.put(
      `${Dashboard_Base_Url}/v1/nft/status/${land.id}`,
      { status: newStatus }
    );

    // Update local state ONLY after API succeeds
    setLandData((prev) =>
      prev.map((item) =>
        item.id === land.id
          ? { ...item, status: response.data.nft.status === "active" } // boolean
          : item
      )
    );

    toast.success(`Land status updated to ${response.data.nft.status}!`);
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error(error.response?.data?.message || "Failed to update land status");
  }
};



  return (
    <div className="pt-16 flex h-[700px] bg-black flex-col ">
      {/* Blur Background Left */}
      <div
        style={{
          top: "10px",
          left: "20px",
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
          Land Management
        </h1>
      </div>

      {/* Table */}
      <div className="pl-7 mt-12 z-10 relative">
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
  {landData.map((land, index) => (
    <tr key={land.id} className="h-[70px] transition-all duration-200 backdrop-blur-sm">
      <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{land.indexId}</td>
      <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{land.name}</td>
      <td className="px-6 py-4">
        <img
src={land.image ? `${Image_Base_Url}${land.image}` : `${Image_Base_Url}${land.image}` }          alt={land.name}
          className="w-12 h-12 object-cover border border-white/10 rounded"
        />
      </td>
      <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
        ${land.price || 0}
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-4">
         <button
  onClick={() => handleEditLand(land)}
  className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded"
>
  <img src={EditImage} alt="edit" className="w-4 h-4" />
</button>

          <button onClick={() => handleOpenDeleteModal(land)}>
            <img src={DeleteImage} alt="delete" className="w-3 h-4" />
          </button>
        </div>
      </td>
      <td className="px-6 py-4">
   <Switch
  checked={land.status}
  onChange={() => handleToggleStatus(land)}
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


        {showDeleteModal && selectedLand && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-gray-800 rounded-lg p-6 w-[400px] border border-white/10">
      <h2 className="text-lg font-semibold mb-4 text-white">Confirm Deletion</h2>
      <p className="mb-6 text-gray-300">
        Are you sure you want to delete <strong className="text-white">{selectedLand.name}</strong>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          className="px-4 py-2 border border-gray-400 rounded text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedLand(null);
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer transition-colors"
          onClick={handleDeleteLand}
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

export default Land;
