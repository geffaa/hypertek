import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import Collectionimage from "../assets/CreateCollection/collection.png";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import FullScreenLoader from "../components/common/Spinner";
import { Dashboard_Base_Url, getImageUrl } from "../Config";

function Character() {
  const navigate = useNavigate();

  const [characters, setCharacters] = useState([]);
  const [parentCollections, setParentCollections] = useState([]); // ✅ add state
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

        const parents = parentRes.data.collections || [];
        setParentCollections(parents); // ✅ save parents in state

        let allCharacters = [];

        for (const parent of parents) {
          try {
            const subRes = await axios.get(
              `${Dashboard_Base_Url}/v1/nft/parent-collection/${parent._id}/sub-collections`,
            );

            if (subRes.data.success && subRes.data.subCollections) {
              const charSub = subRes.data.subCollections
                .filter(() => parent.category === "characters")
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
    navigate(`/${adminId}/edit-sub-collection`, {
      state: {
        subCollectionId: char.id,
        parentId: char.parentId,
        existingData: {
          name: char.name,
          description: char.collectionData?.description || "",
          priceETH: char.price,
          image: char.image,
        },
      },
    });
  };

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) return;

    try {
      await axios.delete(
        `${Dashboard_Base_Url}/v1/nft/parent-collection/${selectedCharacter.parentId}/sub-collection/${selectedCharacter.id}`,
      );

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

  const handleAddMore = (parent) => {
    if (!parent?._id) {
      toast.error("Parent collection not found");
      return;
    }

    navigate(`/${adminId}/add-sub-collection`, {
      state: {
        parentId: parent._id,
        parentName: parent.name || "Parent Collection",
      },
    });
  };

  return (
    <div className="mt-8 flex h-[700px] bg-black flex-col">
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
          Character Collection
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
            {characters.map((char) => (
              <tr key={char.id} className="h-[70px] backdrop-blur-sm">
                <td className="px-6 py-4 text-[#FFFFFFC4]">{char.name}</td>
                <td className="px-6 py-4">
                  <img
                    src={char.image ? getImageUrl(char.image) : Collectionimage}
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
                <td className="px-6 py-3">
                  <Switch
                    checked={true} // always active
                    disabled
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
                        width: 22,
                        height: 20,
                        backgroundColor: "#fff",
                      },
                      "& .MuiSwitch-track": {
                        borderRadius: 17,
                        backgroundColor: "#0860eeff",
                        opacity: 1,
                      },
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-start items-center mt-42 px-6 gap-4">
          {parentCollections
            .filter((parent) => parent.category === "characters")
            .slice(0, 1)
            .map((parent) => (
              <button
                key={parent._id}
                onClick={() => handleAddMore(parent)}
                className="bg-blue-700 text-white px-6 py-2 rounded-md text-sm"
              >
                Add More
              </button>
            ))}
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
