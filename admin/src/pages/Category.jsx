import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";
import Collectionimage from "../assets/CreateCollection/collection.png";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";
import axios from "axios";
import toast from "react-hot-toast";
import FullScreenLoader from "../components/common/Spinner";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";

function Category() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]); // combined subcollections
  const [parentCollections, setParentCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const adminDataString = localStorage.getItem("admin_data");
  const adminId = adminDataString ? JSON.parse(adminDataString)._id : null;

  useEffect(() => {
    const fetchByCategory = async () => {
      if (!category) return setLoading(false);
      setLoading(true);

      try {
        // Fetch parent collections filtered by category
        const res = await axios.get(
          `${Dashboard_Base_Url}/v1/nft/parent-collections?category=${category}`,
        );

        const parents = res.data.collections || [];
        setParentCollections(parents);

        // For each parent, collect its subCollections
        let allSubs = [];
        for (const parent of parents) {
          // If backend already returns subCollections in parent document, use it
          if (parent.subCollections && parent.subCollections.length) {
            const mapped = parent.subCollections.map((sub) => ({
              id: sub._id,
              name: sub.name || "Unnamed",
              image: sub.image || parent.collection?.image || "",
              price: sub.priceETH || 0,
              listed: sub.listed || false,
              parentId: parent._id,
              parentName: parent.collection?.name || "",
            }));
            allSubs.push(...mapped);
          } else {
            // Fallback: call sub-collections endpoint
            try {
              const subRes = await axios.get(
                `${Dashboard_Base_Url}/v1/nft/parent-collection/${parent._id}/sub-collections`,
              );
              if (subRes.data.subCollections) {
                const mapped = subRes.data.subCollections.map((sub) => ({
                  id: sub._id,
                  name: sub.name || "Unnamed",
                  image: sub.image || parent.collection?.image || "",
                  price: sub.priceETH || 0,
                  listed: sub.listed || false,
                  parentId: parent._id,
                  parentName: parent.collection?.name || "",
                }));
                allSubs.push(...mapped);
              }
            } catch (err) {
              console.error(`Failed to fetch subs for parent ${parent._id}:`, err);
            }
          }
        }

        setItems(allSubs);
      } catch (err) {
        console.error("Error fetching category data:", err);
        toast.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [category]);

  if (loading) return <FullScreenLoader />;

  const handleAddMore = (parent) => {
    if (!parent?._id) {
      toast.error("Parent collection not found");
      return;
    }

    navigate(`/${adminId}/add-sub-collection`, {
      state: {
        parentId: parent._id,
        parentName: parent.collection?.name || "Parent Collection",
      },
    });
  };

  const handleEdit = (item) => {
    navigate(`/${adminId}/edit-sub-collection`, {
      state: {
        subCollectionId: item.id,
        parentId: item.parentId,
        existingData: {
          name: item.name,
          priceETH: item.price,
          image: item.image,
        },
      },
    });
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await axios.delete(
        `${Dashboard_Base_Url}/v1/nft/parent-collection/${selectedItem.parentId}/sub-collection/${selectedItem.id}`,
      );
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setShowDeleteModal(false);
      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="mt-8 flex h-[700px] bg-black flex-col">
      <div className="flex flex-col w-[426px] gap-6 ml-12 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">
          {category ? category.charAt(0).toUpperCase() + category.slice(1) : "Category"} Collection
        </h1>
      </div>

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
            {items.map((item) => (
              <tr key={item.id} className="h-[70px] backdrop-blur-sm">
                <td className="px-6 py-4 text-[#FFFFFFC4]">{item.name}</td>
                <td className="px-6 py-4">
                  <img
                    src={item.image ? `${Image_Base_Url}${item.image}` : Collectionimage}
                    className="w-12 h-12 rounded border border-white/10"
                    alt=""
                  />
                </td>
                <td className="px-6 py-4 text-[#FFFFFFC4]">${item.price}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button onClick={() => handleEdit(item)}>
                      <img src={EditImage} className="w-4 h-4" alt="Edit" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
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

        <div className="flex justify-start items-center mt-6 px-6 gap-4">
          {parentCollections.slice(0, 1).map((parent) => (
            <button key={parent._id} onClick={() => handleAddMore(parent)} className="bg-blue-700 text-white px-6 py-2 rounded-md text-sm">
              Add More
            </button>
          ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
            <h2 className="text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-300 mb-6">Delete <strong>{selectedItem?.name}</strong>?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="border px-4 py-2 text-gray-300">Cancel</button>
              <button onClick={handleDelete} className="bg-red-600 px-4 py-2 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Category;
