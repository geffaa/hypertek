import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import SearchIcon from "./assets/search.png";
import Collectionimage from "./assets/CreateCollection/collection.png";
import { Link } from "react-router-dom";
import EditImage from "./assets/edit.png";
import Switch from "@mui/material/Switch";
import DeleteImage from "./assets/delete.png";
import { Dashboard_Base_Url, Image_Base_Url } from "./Config";
import toast from "react-hot-toast";

function EditNews() {
  const navigate = useNavigate()
 const [collections, setCollections] = useState([]);
useEffect(() => {
  const fetchNews = async () => {
    try {
      const res = await axios.get(`${Dashboard_Base_Url}/v1/news/admin`);

      console.log("Your news response:", res.data.data);

      if (res.data) {
       const newsData = res.data.data.map((item) => {
  // Get the image file name only
  const imageName = item.image ? item.image.split("/").pop() : null;

  // Construct the proper URL
  const imageUrl = imageName
    ? `${Image_Base_Url}/uploads/news/${imageName}` // <-- use correct folder 'news'
    : null;

  console.log("Your complete image URL:", imageUrl);

  return {
    id: item._id,
    name: item.heading,
    image: imageUrl, // <-- use dynamic URL here
    supply: new Date(item.createdAt).toLocaleDateString(),
    status: item.status === "active",
    description: item.description,
  };
});


        console.log("Processed newsData:", newsData); // Full URLs with file names
        setCollections(newsData);
      }
    } catch (error) {
      console.log("Error fetching news:", error);
    }
  };

  fetchNews();
}, []);

const handleEditNews = (news) => {
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
  console.log("your news data are :",news);

  // Navigate to UpdateNews page with news data
  navigate(`/${adminId}/edit-news-item`, { state: { newsItem: news } });
};
  const [collections, setCollections] = useState([]);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${Dashboard_Base_Url}/v1/news/admin`);

        console.log("Your news response:", res.data.data);

        if (res.data) {
          const newsData = res.data.data.map((item) => {
            // Get the image file name only
            const imageName = item.image ? item.image.split("/").pop() : null;

            // Construct the proper URL
            const imageUrl = imageName
              ? `${Image_Base_Url}/uploads/news/${imageName}` // <-- use correct folder 'news'
              : null;

            console.log("Your complete image URL:", imageUrl);

            return {
              id: item._id,
              name: item.heading,
              image: imageUrl, // <-- use dynamic URL here
              supply: new Date(item.createdAt).toLocaleDateString(),
              status: item.status === "active",
              description: item.description,
            };
          });

          console.log("Processed newsData:", newsData); // Full URLs with file names
          setCollections(newsData);
        }
      } catch (error) {
        console.log("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    collectionId: null,
    collectionName: "",
  });

  const toggleStatus = async (id, currentStatus) => {
    try {
      if (!id || currentStatus === undefined || currentStatus === null) {
        toast.error("ID and status are required");
        return;
      }

      console.log("Current ID:", id);
      console.log("Current Status:", currentStatus);

      if (currentStatus === true) {
        // Send PUT request to backend
        const response = await axios.put(
          `${Dashboard_Base_Url}/v1/news/update-status/${id}`,
          { status: "inactive" } // send new status
        );

        console.log("Status update response:", response.data);

        if (response.data.success) {
          // Update frontend state
          setCollections((prev) =>
            prev.map((col) =>
              col.id === id ? { ...col, status: !currentStatus } : col
            )
          );
          toast.success("Status updated Inactive");
        } else {
          toast.error("Failed to update status");
        }
      }

      if (currentStatus === false) {
        const response = await axios.put(
          `${Dashboard_Base_Url}/v1/news/update-status/${id}`,
          { status: "active" } // send new status
        );

        console.log("Status update response:", response.data);

        if (response.data.success) {
          // Update frontend state
          setCollections((prev) =>
            prev.map((col) =>
              col.id === id ? { ...col, status: !currentStatus } : col
            )
          );
          toast.success("Status updated to Active");
        } else {
          toast.error("Failed to update status");
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Error updating status");
    }
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({
      isOpen: true,
      collectionId: id,
      collectionName: name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      collectionId: null,
      collectionName: "",
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.collectionId) {
      toast.error("Deletion Id is required");
      return;
    }

    console.log("Deleting ID:", deleteModal.collectionId);

    try {
      const response = await axios.delete(
        `${Dashboard_Base_Url}/v1/news/${deleteModal.collectionId}`
      );

      console.log("Delete response:", response.data);

      if (response.status === 200) {
        setCollections((prev) =>
          prev.filter((col) => col.id !== deleteModal.collectionId)
        );
        toast.success("News deleted successfully");
        closeDeleteModal();
      } else {
        toast.error("Failed to delete article");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting article");
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white p-16 h-[850px]">
      {/* Background effect */}
      <div
        style={{
          top: `${20}px`,
          left: `${940}px`,
          position: "absolute",
          width: "250px",
          height: "200px",
          background: "#002AA8",
          opacity: 1,
          filter: "blur(160px)",
        }}
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      <div
        style={{
          top: `${620}px`,
          left: `${760}px`,
          position: "absolute",
          width: "250px",
          height: "200px",
          background: "#002AA8",
          opacity: 1,
          filter: "blur(160px)",
        }}
        className="absolute rounded-full shadow-[0_0_40px_20px_rgba(59,130,246,0.6),0_0_100px_50px_rgba(59,130,246,0.4),0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

      <div className="">
        <div className="pl-5 mt-5 overflow-x-auto w-full">
          <table className="min-w-[897px] text-left rounded-lg overflow-hidden overflow-x-scroll">
            <thead>
              <tr className=" h-[50px] backdrop-blur-sm">
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-white font-semibold text-sm  tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-white font-semibold text-sm   tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-white font-semibold text-sm   tracking-wider">
                  Impression
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
                  <Link to="/user-details">
                    <td className="px-6 py-4">
                      <img
                        src={col.image ? col.image : Collectionimage}
                        alt={col.name}
                        className="w-12 h-12  object-cover border border-white/10"
                      />
                    </td>
                  </Link>
                  <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                    {col.name.length > 20
                      ? col.name.slice(0, 20) + "..."
                      : col.name}
                  </td>
                  <td className="px-6 py-4 text-[#FFFFFFC4]  font-medium">
                    {col.supply}
                  </td>
                  <td className="px-6 py-4 text-[#FFFFFFC4]  font-medium">
                    {col.description.length > 40
                      ? col.description.slice(0, 40) + "..."
                      : col.description}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button onClick={() => handleEditNews(col)} className="p-2  cursor-pointer transition-colors duration-200">
                       
                          <img src={EditImage} alt="edit" className="w-4 h-4" />
                        
                      </button>
                      <button
                        className="p-2  cursor-pointer  transition-colors duration-200"
                        onClick={() => openDeleteModal(col.id, col.name)}
                      >
                        <img
                          src={DeleteImage}
                          alt="delete"
                          className="w-3 h-4"
                        />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Switch
                      checked={col.status}
                      onChange={() => toggleStatus(col.id, col.status)}
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

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeDeleteModal}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
              <div className="text-center">
                {/* Warning Icon */}
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  Delete Article?
                </h3>

                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete the article "
                  {deleteModal.collectionName}"? This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={closeDeleteModal}
                    className="px-6 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}

export default EditNews;
