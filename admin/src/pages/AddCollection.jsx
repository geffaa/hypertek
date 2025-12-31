import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import searchImage from "../assets/search.png";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner";

function AddCollection() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [localData, setLocalData] = useState();

  // Fetch data from API
  useEffect(() => {
    const fetchCollections = async () => {
      if (!Dashboard_Base_Url) {
        toast.error("Sorry Base url is required");
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(`${Dashboard_Base_Url}/v1/nft/all`);
        console.log("Collections response:", response.data);

        // ✅ Use "nfts" because API returns nfts
        if (response.data.success && response.data.nfts) {
          const mappedCollections = response.data.nfts.map((item, index) => ({
            id: item._id,
            indexId: index + 1,
            name: item.collection?.name || "Unnamed Collection",
            image: item.collection?.image || "",
            supply: item.collection?.supply || 0,

            // use actual status from API ✔
            status: item.status === "active" ? true : false,

            _id: item._id,
            collectionData: item.collection,
          }));

          setCollections(mappedCollections);
        } else {
          setCollections([]);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast.error("Error fetching collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const toggleStatus = (id) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, status: !col.status } : col))
    );
  };

  // Open delete modal
  const handleOpenDeleteModal = (collection) => {
    setSelectedCollection(collection);
    setShowDeleteModal(true);
  };

  const handleAddCollection = () => {
    const adminDataString = localStorage.getItem("admin_data"); // get from localStorage
    if (!adminDataString) {
      toast.error("Admin ID not found. Please try again."); // no data in storage
      return;
    }

    const adminData = JSON.parse(adminDataString);
    const adminId = adminData._id;

    if (!adminId) {
      toast.error("Admin ID not found. Please try again."); // ID missing
      return;
    }
    console.log("your admin id is :", adminId);

    console.log("Admin ID:", adminId);
    navigate(`/${adminId}/create-collection`); // navigate when ID exists
  };

  const handleEditCollection = (collection) => {
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

  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete the item
  const handleDeleteCollection = async () => {
    if (!selectedCollection?._id) {
      toast.error("Item ID is required");
      return;
    }
    if (!Dashboard_Base_Url) {
      toast.error("Base url is required");
    }

    try {
      const response = await axios.delete(
        `${Dashboard_Base_Url}/v1/nft/collection/delete/${selectedCollection._id}`
      );

      if (response.data.success) {
        // Remove the deleted item from state
        setCollections((prev) =>
          prev.filter((c) => c._id !== selectedCollection._id)
        );
        toast.success("Collection deleted successfully!");
        setShowDeleteModal(false);
        setSelectedCollection(null);
      } else {
        toast.error(response.data.message || "Failed to delete collection");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error(error.response?.data?.message || "Error deleting collection");
    }
  };

  /// handle collection status
  const HandleCollectionStatus = async (collection) => {
    if (!Dashboard_Base_Url || !collection?._id) return;

    console.log("your collection is :", collection.status);
    try {
      // Determine the new status: toggle between 'active' and 'inactive'
      const newStatus =
        collection.status === true || collection.status === "active"
          ? "inactive"
          : "active";

      console.log("Toggling status to:", newStatus);

      // Call API to update status
      const response = await axios.put(
        `${Dashboard_Base_Url}/v1/nft/status/${collection._id}`,
        { status: newStatus }
      );

      // Update local state ONLY after API succeeds
      setCollections((prev) =>
        prev.map((col) =>
          col._id === collection._id
            ? { ...col, status: response.data.nft.status === "active" } // store as boolean for Switch
            : col
        )
      );

      toast.success(`NFT status updated to ${response.data.nft.status}!`);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update collection status"
      );
    }
  };

  // Loading state

  if (loading) {
    return <FullScreenLoader />;
  }

  if (loading) {
    return (
      <div className="mt-12 flex h-[700px] bg-black flex-col items-center justify-center">
        <div className="text-white text-lg">Loading collections...</div>
      </div>
    );
  }

  // Empty state
  if (collections.length === 0 && !loading) {
    return (
      <div className="mt-8 flex h-[700px] bg-black flex-col">
        {/* Background blur divs */}
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

        <div className="flex flex-col w-[900px] h-[200px] gap-6 ml-12">
          <h1 className="font-inter font-semibold text-[25px] text-white z-50">
            Collection Management
          </h1>
          <div className="flex justify-between">
            <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20">
              <img src={searchImage} alt="search" className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search collections"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white px-2 py-1 outline-none rounded w-full placeholder-gray-300"
              />
            </div>
            <div className="flex justify-end mt-4">
            <div className="flex justify-end mt-2">
          <button
  type="button"
  onClick={handleAddCollection}
  className="text-white flex items-center justify-center backdrop-blur-sm transition-colors"
  style={{
    width: "100px",      // reduced width
    height: "30px",      // reduced height
    borderRadius: "6px",
    gap: "8px",
    padding: "4px 8px",  // tighter padding
    fontSize: "12px",    // smaller text
    fontWeight: "500",
    background: "rgba(255, 255, 255, 0.10)",
    border: "1px solid rgba(255, 255, 255, 0.20)",
    cursor: "pointer",
  }}
>
  Add Collection
</button>

</div>



            </div>
          </div>
        </div>

        <div className="flex items-center justify-center h-full">
          <div className="text-white text-lg">
            No collections found. Create your first collection!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 flex h-[500px] bg-black flex-col">
      {/* Background blur divs */}
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
          Collection Management
        </h1>
        <div className="flex justify-between">
          <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20">
            <img src={searchImage} alt="search" className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search collections"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white px-2 py-1 outline-none rounded w-full placeholder-gray-300"
            />
          </div>
          <button onClick={handleAddCollection} className="border rounded-md px-2 py-1 cursor-pointer">
            Add Collection
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="pl-7 mt-12 overflow-x-auto">
        <table className="min-w-[897px] text-left rounded-lg overflow-hidden ml-12">
          <thead>
            <tr className="h-[50px] backdrop-blur-sm">
              {/* <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">
                #
              </th> */}
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm tracking-wider">
                Name
              </th>
              <th className=" py-3 text-[#FFFFFFC4] font-semibold text-sm tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm tracking-wider">
                Supply
              </th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {filteredCollections.map((col) => (
              <tr
                key={col._id} // Use the actual _id as key
                className="h-[70px] transition-all duration-200 backdrop-blur-sm"
              >
                {/* <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                  {col.indexId}
                </td> */}
              <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
  {col.name?.length > 15 ? `${col.name.slice(0, 15)}...` : col.name}
</td>

                <td className=" py-4">
                  {col.image ? (
                    <img
                      src={
                        col.image
                          ? `${Image_Base_Url}${col.image}`
                          : `${Image_Base_Url}${col.image}`
                      }
                      alt={col.name}
                      className="w-12 h-12 object-cover border border-white/10 rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        // e.target.src = "https://via.placeholder.com/48";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 border border-white/10 rounded flex items-center justify-center">
                      <span className="text-white text-xs">No Image</span>
                    </div>
                  )}
                </td>
               <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
  {Number(col.supply).toPrecision(1)}
</td>

                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEditCollection(col)}
                      className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded"
                    >
                      <img src={EditImage} alt="edit" className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenDeleteModal(col)}
                      className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded"
                    >
                      <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Switch
                    checked={col.status} // boolean
                    onChange={() => HandleCollectionStatus(col)}
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
                        "& .Mui-focusVisible .MuiSwitch-thumb": {
                          color: "#3b82f6",
                          border: "6px solid #fff",
                        },
                        "& .Mui-disabled .MuiSwitch-thumb": {
                          color: "gray",
                        },
                        "& .Mui-disabled + .MuiSwitch-track": {
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCollection && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[400px] border border-white/10">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete{" "}
              <strong className="text-white">{selectedCollection.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 border border-gray-400 rounded text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCollection(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer transition-colors"
                onClick={handleDeleteCollection}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCollection;

