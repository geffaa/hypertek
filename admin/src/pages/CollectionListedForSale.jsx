import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, getImageUrl } from "../Config";
import FullScreenLoader from "../components/common/Spinner";

function Character() {
  const [view, setView] = useState("list"); // "list" | "details"
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);

  /* ================================
     Fetch Sub-Collections from All Parent Collections (API)
  ================================= */
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${Dashboard_Base_Url}/v1/nft/parent-collections`);

        if (res.data.success && res.data.collections) {
          const allSubs = [];
          res.data.collections.forEach((parent) => {
            (parent.subCollections || []).forEach((sub) => {
              allSubs.push({
                _id: sub._id,
                parentId: parent._id,
                name: sub.name || sub.symbol || "Unnamed",
                image: sub.image || parent.collection?.image || "",
                price: sub.priceETH || 0,
                address: sub.owner || "N/A",
                description: sub.description || parent.collection?.description || "",
                status: true,
              });
            });
          });
          setCharacters(allSubs);
        } else {
          setCharacters([]);
        }
      } catch (err) {
        toast.error("Failed to fetch sub-collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  /* ================================
     Toggle Status API
  ================================= */
  const handleStatusChange = async (char) => {
    try {
      const newStatus = char.status ? "inactive" : "active";

      const res = await axios.put(
        `${Dashboard_Base_Url}/v1/nft/status/${char._id}`,
        { status: newStatus }
      );

      setCharacters((prev) =>
        prev.map((c) =>
          c._id === char._id
            ? { ...c, status: res.data.nft.status === "active" }
            : c
        )
      );

      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /* ================================
     Delete APIs
  ================================= */
  const openDeleteModal = (char) => {
    setSelectedChar(char);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${Dashboard_Base_Url}/v1/nft/collection/delete/${selectedChar._id}`
      );

      setCharacters((prev) =>
        prev.filter((c) => c._id !== selectedChar._id)
      );

      toast.success("Character deleted");
      setShowDeleteModal(false);
      setSelectedChar(null);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const openDetails = (char) => {
    setSelectedChar(char);
    setView("details");
  };

  const handleEditClick = (e, char) => {
    e.stopPropagation();
    setSelectedChar(char);
    setView("details");
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (view === "details" && selectedChar) {
    return (
      <div className="bg-black mt-12 relative pb-0">

        {/* Content stretches to fill page */}
        <div className="z-10 ml-12 flex flex-col">
          <h1 className="font-inter font-semibold text-[25px] text-white mb-6">Details</h1>

          {/* Detail Card — matches image: dark navy bg, compact, image + inline text */}
          <div
            className="flex gap-10 items-center p-8 rounded-xl w-fit"
            style={{

              border: "1px solid rgba(255,255,255,0.12)",
              minWidth: "550px",
            }}
          >
            {/* Circular Image */}
            <img
              src={getImageUrl(selectedChar.image)}
              alt={selectedChar.name}
              className="w-[120px] h-[120px] rounded-full object-cover flex-shrink-0"
              onError={(e) => (e.target.src = "https://via.placeholder.com/120")}
            />

            {/* Info — inline label + value, matching image font size */}
            <div className="flex flex-col gap-1.5 font-inter">
              <p className="text-white text-[16px]">
                <span className="font-semibold">Owner Address:</span>
                <span className="text-white/75 ml-1">
                  {selectedChar.address && selectedChar.address !== "N/A" && selectedChar.address.length > 10
                    ? `${selectedChar.address.slice(0, 10)}...${selectedChar.address.slice(-4)}`
                    : selectedChar.address}
                </span>
              </p>
              <p className="text-white text-[16px]">
                <span className="font-semibold">Price:</span>
                <span className="text-white/75 ml-1">${selectedChar.price}</span>
              </p>
              <p className="text-white text-[16px]">
                <span className="font-semibold">Description:</span>
                <span className="text-white/75 ml-1">{selectedChar.description || ""}</span>
              </p>
            </div>
          </div>

          {/* Back Button — fixed margin below card */}
          <div className="mt-20">
            <button
              className="bg-[#002AA8] font-inter text-white text-sm rounded-md transition-colors"
              style={{ width: "120px", height: "38px" }}
              onClick={() => setView("list")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-full">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="font-inter font-semibold text-[25px] text-white">
            Collection On Sale
          </h1>
        </div>

        {/* ===== TABLE ===== */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="h-[50px]">
                <th className="px-6 py-3 text-[#FFFFFFC4]">Image</th>
                <th className="px-6 py-3 text-[#FFFFFFC4]">Name</th>
                <th className="px-6 py-3 text-[#FFFFFFC4]">Price</th>
                <th className="px-6 py-3 text-[#FFFFFFC4]">Address</th>
                <th className="px-6 py-3 text-[#FFFFFFC4]">Action</th>
                <th className="px-6 py-3 text-[#FFFFFFC4]">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {characters.map((char) => (
                <tr key={char._id} className="h-[70px] cursor-pointer hover:bg-white/5 transition-colors" onClick={() => openDetails(char)}>
                  <td className="px-6 py-4">
                    {char.image ? (
                      <img
                        src={getImageUrl(char.image)}
                        alt={char.name}
                        className="w-12 h-12 object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 flex items-center justify-center text-xs text-white">
                        No Image
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-[#FFFFFFC4]">{char.name}</td>
                  <td className="px-6 py-4 text-[#FFFFFFC4]">
                    ${char.price}
                  </td>
                  <td className="px-6 py-4 text-[#FFFFFFC4]">
                    {char.address && char.address !== "N/A" && char.address.length > 10
                      ? `${char.address.slice(0, 6)}...${char.address.slice(-4)}`
                      : char.address}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button onClick={(e) => handleEditClick(e, char)}>
                        <img src={EditImage} className="w-4 h-4" />
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); openDeleteModal(char); }}>
                        <img src={DeleteImage} className="w-3 h-4" />
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {/* <Switch
                      checked={char.status}
                      onChange={() => handleStatusChange(char)}
                    /> */}
                    <Switch
                      checked={char.status}
                      onChange={() => handleStatusChange(char)}
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

        {/* ===== DELETE MODAL ===== */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
              <h2 className="text-white text-lg mb-4">
                Delete {selectedChar?.name}?
              </h2>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


export default Character;
