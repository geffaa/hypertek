import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import searchImage from "../assets/search.png";
import Collectionimage from "../assets/CreateCollection/collection.png";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { Link, useNavigate } from "react-router-dom";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import axios from "axios";
import toast from "react-hot-toast";
import FullScreenLoader from "../components/common/Spinner";
import { FaUserCircle } from "react-icons/fa"; // Added for fallback avatar

function AddCollection() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(""); // Added to track user role

  const handleEditUser = (collection) => {
    console.log("your user data are :", collection);
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
    navigate(`/${adminId}/edit-user`, { state: { userData: collection } });
  };

  const handleViewProfile = (user) => {
    const adminDataString = localStorage.getItem("admin_data");

    if (!adminDataString) {
      toast.error("Admin not found. Please login again.");
      return;
    }

    const adminData = JSON.parse(adminDataString);
    const adminId = adminData?._id;

    if (!adminId) {
      toast.error("Admin ID missing");
      return;
    }

    navigate(`/${adminId}/user-details`, {
      state: {
        userData: user,
      },
    });
  };

  useEffect(() => {
    // Get user role from localStorage
    const adminDataString = localStorage.getItem("admin_data");
    if (adminDataString) {
      const adminData = JSON.parse(adminDataString);
      setUserRole(adminData.role || "");
    }

    const fetchUsers = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${Dashboard_Base_Url}/v1/users`);
    console.log("API response:", res.data.users);

    if (res.data.success && res.data.users) {
      // Filter out admin users first
      const filteredUsers = res.data.users.filter(user => user.Role !== "admin");

      const mapped = filteredUsers.map((user) => ({
        id: user._id,
        name: user.FullName || "No Name",
        avatar: user.Avatar,
        supply: user.Email,
        status: user.isActive, // use database value
        role: user.role || "user",
      }));

      setCollections(mapped);
    }
  } catch (err) {
    console.log("Error fetching users:", err);
  } finally {
    setLoading(false);
  }
};


    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    if (!id) {
      toast.error("Id is required");
      return;
    }

    try {
      // Toggle the status
      const newStatus = !currentStatus;

      // Call API to update status
      await axios.patch(`${Dashboard_Base_Url}/v1/user/status/${id}`, {
        isActive: newStatus
      });

      // Update state locally after successful API call
      setCollections((prev) =>
        prev.map((col) => (col.id === id ? { ...col, status: newStatus } : col))
      );

      toast.success(`Status updated successfully!`);
    } catch (err) {
      console.log("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const deleteUser = async () => {
    if (!selectedUserId) return;

    try {
      const res = await axios.delete(
        `${Dashboard_Base_Url}/v1/delete/${selectedUserId}`
      );

      if (res.data.success) {
        toast.success("User deleted successfully");

        setCollections(prev =>
          prev.filter(u => u.id !== selectedUserId)
        );

        setShowDeleteModal(false);
        setSelectedUserId(null);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  // Check if current user is admin
  const isAdmin = userRole === "admin";

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden relative">
      {/* Background Effects */}
      <div
        style={{
          top: `200px`,
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
      <div className="flex flex-col w-full gap-6 p-6 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">
          User Details
        </h1>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto p-6 z-10">
        <table className="min-w-full text-left rounded-lg overflow-hidden">
          <thead>
            <tr className="h-[50px] backdrop-blur-sm">
              <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Image</th>
              <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Name</th>
              <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">UID</th>
              {/* Only show Action column if user is not admin */}
              {!isAdmin && (
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Action</th>
              )}
              <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {collections.map((col) => (
              <tr
                key={col.id}
                className="h-[70px] transition-all duration-200 backdrop-blur-sm hover:bg-white/5"
              >
                {/* Image Cell */}
                <td className="px-6 py-4 cursor-pointer" onClick={() => handleViewProfile(col)}>
                  {col.avatar ? (
                    <img
                      src={`${Image_Base_Url}${col.avatar}`}
                      alt={col.name}
                      className="w-12 h-12 object-cover border border-white/10 rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none"; // hide broken image
                        // Show fallback icon
                        e.target.parentElement.innerHTML = `
                          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg border border-white/10">
                            ${col.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg border border-white/10">
                      {col.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </td>

                {/* Name Cell */}
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{col.name}</td>
                
                {/* UID Cell */}
                <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{col.supply}</td>
                
                {/* Action Cell - Only show if user is not admin */}
                {!isAdmin && (
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditUser(col)}
                        className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded"
                      >
                        <img src={EditImage} alt="edit" className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10"
                        onClick={() => {
                          setSelectedUserId(col.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                      </button>
                    </div>
                  </td>
                )}
                
                {/* Status Cell */}
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
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-8 w-[350px] text-white animate-scaleIn shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Delete User?</h2>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-600/40 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
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