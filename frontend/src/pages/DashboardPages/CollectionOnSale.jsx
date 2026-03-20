import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import EditImage from "../../assets/edit.png";
import DeleteImage from "../../assets/delete.png";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";

function CollectionOnSale() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  const wallet = user?.WalletAddress || user?.MetaMaskAddress || "";

  const fetchListings = async () => {
    if (!wallet) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/listed-subs/${encodeURIComponent(wallet)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(res.data.listedSubCollections || []);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [wallet]);

  const handleDelist = async (item) => {
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${item.parentInfo.parentId}/sub-collection/${item.subId}`,
        { listed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`"${item.name}" delisted`);
      setItems((prev) => prev.filter((i) => i.subId !== item.subId));
    } catch {
      toast.error("Failed to delist item");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${item.parentInfo.parentId}/sub-collection/${item.subId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`"${item.name}" deleted`);
      setItems((prev) => prev.filter((i) => i.subId !== item.subId));
    } catch {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">

      {/* Blur Backgrounds */}
      <div
        style={{ top: "15px", left: "210px", width: "250px", height: "250px", background: "#002AA8", filter: "blur(180px)", pointerEvents: "none" }}
        className="absolute rounded-full"
      />
      <div
        style={{ top: "400px", left: "620px", width: "250px", height: "250px", background: "#002AA8", filter: "blur(180px)", pointerEvents: "none" }}
        className="absolute rounded-full"
      />

      {/* Header */}
      <div className="flex flex-col w-full max-w-[426px] gap-6 px-6 md:ml-12 z-10">
        <h1 className="font-inter font-semibold text-[25px] text-white">Collection On Sale</h1>
      </div>

      {/* Table */}
      <div className="px-6 md:pl-24 mt-12 z-10 relative overflow-x-auto">
        {loading ? (
          <div className="text-white/50 text-sm py-16 text-center">Loading your listings...</div>
        ) : !wallet ? (
          <div className="text-white/50 text-sm py-16 text-center">Connect your wallet to see listings.</div>
        ) : items.length === 0 ? (
          <div className="text-white/50 text-sm py-16 text-center">No items currently listed for sale.</div>
        ) : (
          <table className="w-full min-w-[900px] text-left rounded-lg overflow-hidden">
            <thead>
              <tr className="h-[50px]">
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Image</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Name</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Price</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Collection</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Action</th>
                <th className="px-6 py-3 text-[#FFFFFFC4] font-semibold text-sm">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((item) => {
                const imgSrc = item.image ? getImageUrl(item.image) : Collectionimage;
                return (
                  <tr key={item.subId} className="h-[70px] transition-all duration-200 backdrop-blur-sm">
                    <td className="px-6 py-4">
                      <img src={imgSrc} alt={item.name} className="w-12 h-12 object-cover border border-white/10 rounded" />
                    </td>
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                      {item.priceETH != null ? `${item.priceETH} USDC` : "—"}
                    </td>
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium text-sm">
                      {item.parentInfo?.parentName || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button
                          className="p-2 cursor-pointer"
                          onClick={() => navigate("/dashboard/edit-collection-item", {
                            state: { subId: item.subId, parentId: item.parentInfo?.parentId }
                          })}
                        >
                          <img src={EditImage} alt="edit" className="w-4 h-4" />
                        </button>
                        <button className="p-2 cursor-pointer" onClick={() => handleDelete(item)}>
                          <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Switch
                        checked={item.listed}
                        onChange={() => handleDelist(item)}
                        sx={{
                          width: 46, height: 20, padding: 0,
                          "& .MuiSwitch-switchBase": {
                            padding: 0, margin: 0,
                            "&.Mui-checked": {
                              transform: "translateX(24px)", color: "#fff",
                              "& + .MuiSwitch-track": { backgroundColor: "#0860eeff", opacity: 1 },
                            },
                          },
                          "& .MuiSwitch-thumb": { width: 22, height: 20, background: "#fff" },
                          "& .MuiSwitch-track": { borderRadius: 34 / 2, backgroundColor: "#9ca3af" },
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add More Button */}
      <div className="flex justify-start px-6 md:mx-12 my-12">
        <Link to="/dashboard/add-collection">
          <button className="flex items-center justify-center w-full sm:w-[190px] h-[42px] rounded-[6px] p-[10px] gap-[10px] bg-[#002AA8] text-white font-inter font-medium hover:opacity-90 transition">
            <p className="font-inter font-normal text-[18px] leading-[100%] opacity-100">Add More</p>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CollectionOnSale;
