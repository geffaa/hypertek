import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import Collectionimage from "../assets/CreateCollection/collection.png";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FullScreenLoader from "../components/common/Spinner";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";

function Character() {
  const ITEMS_PER_PAGE = 5;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const navigate = useNavigate();

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const adminDataString = localStorage.getItem("admin_data");
  const adminId = adminDataString ? JSON.parse(adminDataString)._id : null;

  useEffect(() => {
    const fetchCharacters = async () => {
      if (!adminId) return setLoading(false);
      setLoading(true);

      try {
        // Fetch parent collections for this admin
        const parentRes = await axios.get(
          `${Dashboard_Base_Url}/v1/nft/parent-collections`,
        );

        if (!parentRes.data.success) {
          toast.error("Failed to fetch parent collections");
          setLoading(false);
          return;
        }

        const parentCollections = parentRes.data.collections || [];

        let allCharacters = [];

        for (const parent of parentCollections) {
          try {
            const subRes = await axios.get(
              `${Dashboard_Base_Url}/v1/nft/parent-collection/${parent._id}/sub-collections`,
            );

            if (subRes.data.success && subRes.data.subCollections) {
              const charSub = subRes.data.subCollections
                .filter(() => parent.category === "land")
                .map((sub) => ({
                  id: sub._id,
                  name: sub.name || "Unnamed Character",
                  image: sub.image || "",
                  price: sub.priceETH || 0,
                  status: sub.listed,
                  collectionData: parent,
                  parentId: parent._id,
                }));

              allCharacters.push(...charSub);
            }
          } catch (err) {
            console.error(
              `Error fetching sub-collections for parent ${parent._id}:`,
              err,
            );
          }
        }

        setCharacters(allCharacters);
      } catch (err) {
        console.error("Error fetching characters:", err);
        toast.error("Failed to fetch characters");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [adminId]);

  if (loading) return <FullScreenLoader />;

  const handleEditCharacter = (char) => {
    navigate(`/${adminId}/edit-collection-item`, {
      state: {
        collection: char.collectionData,
        collectionId: char.id,
        parentId: char.parentId,
      },
    });
  };

  const handleToggleStatus = async (char) => {
    try {
      const newStatus = char.status ? "inactive" : "active";
      const res = await axios.put(
        `${Dashboard_Base_Url}/v1/nft/status/${char.id}`,
        { status: newStatus },
      );

      setCharacters((prev) =>
        prev.map((c) =>
          c.id === char.id
            ? { ...c, status: res.data.nft.status === "active" }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) return;

    try {
      await axios.delete(
        `${Dashboard_Base_Url}/v1/nft/parent-collection/${selectedCharacter.parentId}/sub-collection/${selectedCharacter.id}`,
      );

      // Remove from frontend state
      setCharacters((prev) =>
        prev.filter((c) => c.id !== selectedCharacter.id),
      );

      setShowDeleteModal(false);
      toast.success("Character deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Delete failed");
      }
    }
  };

  const handleAddMore = () => {
    navigate(`/${adminId}/edit-collection-item`, {
      state: {
        parentCollectionId: adminId,
        isCreatingSubCollection: true,
        category: "characters",
      },
    });
  };

  return (
    <div className="pt-16 flex h-[700px] bg-black flex-col relative">
      {/* Blur Backgrounds */}
      <div
        className="absolute rounded-full"
        style={{
          top: "10px",
          left: "20px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "400px",
          left: "620px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
        }}
      />

      {/* Header */}
      <div className="flex flex-col w-[426px] gap-6 ml-12 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">
          Land Collection
        </h1>
      </div>

      {/* Table */}
      <div className="pl-7 mt-12 z-10 relative h-[500px] ml-12 overflow-x-auto">
        <table className="min-w-[950px] text-left rounded-lg overflow-hidden">
          <thead>
            <tr className="h-[50px] backdrop-blur-sm">
              <th className="px-6 py-3 text-white text-sm">Name</th>
              <th className="px-6 py-3 text-white text-sm">Image</th>
              <th className="px-6 py-3 text-white text-sm">Price</th>
              <th className="px-6 py-3 text-white text-sm">Action</th>
              <th className="px-6 py-3 text-white text-sm">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {characters.slice(0, visibleCount).map((char) => (
              <tr key={char.id} className="h-[70px] backdrop-blur-sm">
                <td className="px-6 py-4 text-[#FFFFFFC4]">{char.name}</td>
                <td className="px-6 py-4">
                  <img
                    src={
                      char.image
                        ? `${Image_Base_Url}${char.image}`
                        : Collectionimage
                    }
                    className="w-12 h-12 rounded border border-white/10"
                    alt=""
                  />
                </td>
                <td className="px-6 py-4 text-[#FFFFFFC4]">${char.price}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button onClick={() => handleEditCharacter(char)}>
                      <img src={EditImage} className="w-4 h-4" alt="Edit" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCharacter(char);
                        setShowDeleteModal(true);
                      }}
                    >
                      <img src={DeleteImage} className="w-3 h-4" alt="Delete" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Switch
                    checked={char.status}
                    onChange={() => handleToggleStatus(char)}
                    sx={{
                      width: 47,
                      height: 20,
                      padding: 0,
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#0860eeff",
                        },
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between items-center mt-8 px-6">
          <button
            onClick={handleAddMore}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm"
          >
            Add More
          </button>

          {visibleCount < characters.length && (
            <button onClick={() => setVisibleCount((v) => v + ITEMS_PER_PAGE)}>
              {/* Replace with your ArrowIcon */}
              <span className="text-white text-xl">{">"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
            <h2 className="text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-300 mb-6">
              Delete <strong>{selectedCharacter.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="border px-4 py-2 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCharacter}
                className="bg-red-600 px-4 py-2 text-white"
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

export default Character;
