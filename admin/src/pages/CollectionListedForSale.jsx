import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner";

function Character() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);

  /* ================================
     Fetch Characters (API)
  ================================= */
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${Dashboard_Base_Url}/v1/nft/all`);

        if (res.data.success && res.data.nfts) {
          const mapped = res.data.nfts.map((item) => ({
            _id: item._id,
            name: item.collection?.name || "Unnamed",
            image: item.collection?.image || "",
            price: item.price || 0,
            address: item.ownerAddress || "N/A",
            status: item.status === "active",
          }));
          setCharacters(mapped);
        } else {
          setCharacters([]);
        }
      } catch (err) {
        toast.error("Failed to fetch characters");
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

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-black mt-12">

        {/* ===== SAME BLUR DESIGN ===== */}
        <div
          style={{
            top: "15px",
            left: "210px",
            width: "250px",
            height: "250px",
            background: "#002AA8",
            filter: "blur(180px)",
          }}
          className="absolute rounded-full"
        ></div>

        <div
          style={{
            top: "400px",
            left: "620px",
            width: "250px",
            height: "250px",
            background: "#002AA8",
            filter: "blur(180px)",
          }}
          className="absolute rounded-full"
        ></div>

        {/* ===== HEADER ===== */}
        <div className="flex flex-col w-[426px] gap-6 ml-12 z-10">
          <h1 className="font-inter font-semibold text-[25px] text-white">
            Collection On Sale
          </h1>
        </div>

        {/* ===== TABLE (DESIGN SAME) ===== */}
        <div className="pl-7 mt-12 z-10 relative">
          <table className="w-[927px] text-left rounded-lg overflow-hidden">
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
                <tr key={char._id} className="h-[70px]">
                  <td className="px-6 py-4">
                    {char.image ? (
                      <img
                        src={`${Image_Base_Url}${char.image}`}
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
                    {char.address}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <Link to="../edit-collection-item" state={{ collection: char }}>
                        <img src={EditImage} className="w-4 h-4" />
                      </Link>

                      <button onClick={() => openDeleteModal(char)}>
                        <img src={DeleteImage} className="w-3 h-4" />
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4">
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
