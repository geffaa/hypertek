import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import searchImage from "../../assets/search.png";
import EditImage from "../../assets/edit.png";
import DeleteImage from "../../assets/delete.png";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { User_Dashboard_Url } from "../../Config";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getImageUrl } from "../../Config";
import FullScreenLoader from "../../Components/Common/Spinner";

function CollectionDetails() {
  const [collections, setCollections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);



  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");

  // Axios instance with token
  const api = axios.create({
    baseURL: User_Dashboard_Url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    async function fetchCollections() {
      try {

        setLoading(true); // show loader
        const res = await api.get(`/nft/user/collection/get/${userId}`);
        console.log("User Dashboard data:", res);

        setCollections(
          res.data.collection.map((item) => ({
            id: item._id,
            name: item.collection.name,
            symbol: item.collection.symbol,
            chain: item.collection.chain,
            creatorFee: item.collection.royaltyPercent,
            supply: item.collection.supply,
            image: getImageUrl(item.collection.image),
            recipient: item.collection.owner,
            status: item.status === "active",
          }))
        );
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(err.response?.data?.message || "Failed to fetch collections");
      }
      finally {
        setLoading(false); // hide loader
      }
    }

    fetchCollections();
  }, [user, token]);

  const handleDelete = async () => {
    try {
      await api.delete(`/nft/user/collection/delete/${selectedId}`);
      setCollections((prev) => prev.filter((col) => col.id !== selectedId));
      toast.success("Collection deleted successfully");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete collection");
    }
  };



  const handleCopyWallet = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Wallet address copied!");
    } catch (err) {
      toast.error("Failed to copy wallet address");
    }
  };


  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };




  const toggleStatus = async (id, currentStatus) => {
    if (!id) return toast.error("Collection ID is required");
    const newStatus = currentStatus ? "inactive" : "active";
    // Optimistic update
    setCollections((prev) =>
      prev.map((col) => (col.id === id ? { ...col, status: !currentStatus } : col))
    );
    try {
      await api.put(`/nft/status/${id}`, { status: newStatus });
      toast.success(`Collection ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch (err) {
      // Rollback on failure
      setCollections((prev) =>
        prev.map((col) => (col.id === id ? { ...col, status: currentStatus } : col))
      );
      console.error("Status update error:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };



  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="flex flex-col w-full">
      {loading && <FullScreenLoader size={4} color="white" />}

      {/* Header */}
      <div className="flex flex-col w-full max-w-[900px] gap-6 px-4 md:ml-12 z-10">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">Collection Management</h1>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 w-full sm:max-w-xs">
            <img src={searchImage} alt="search" className="w-4 h-4 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections"
              className="bg-transparent text-white px-2 py-1 outline-none rounded w-full placeholder-gray-300"
            />
          </div>

        </div>
      </div>

      {/* Table Container with overflow for mobile */}
      <div className="w-full max-w-[900px] px-4 md:ml-12 mt-12 max-h-[400px] overflow-x-auto custom-scrollbar z-10">
        <table className="min-w-[800px] w-full text-left rounded-lg border-collapse border-spacing-0">
          <thead>
            <tr className="h-[50px] backdrop-blur-sm">
              {/* {["Name","Image","Symbol","Chain","Creator Fee","Supply","Wallet Address","Action","Status"].map((title) => ( */}
              {["Name", "Image", "Creator Fee", "Wallet Address", "Action", "Status"].map((title) => (
                <th key={title} className=" py-3 text-white font-semibold text-sm tracking-wider">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 overflow-y-scroll  overflow-y-auto max-h-[400px]">
            {filteredCollections.map((col) => (

              <tr key={col.id} className="h-[70px] transition-all duration-200 backdrop-blur-sm">
                <td className="  text-white/80 font-medium">{col.name}</td>
                <td className=" ">
                  <img src={col.image} alt={col.name} className="w-12 h-12 object-cover border border-white/10 rounded-md" />
                </td>
                {/* <td className="px-6 py-4 text-white/80 font-medium">{col.symbol}</td> */}
                {/* <td className="px-6 py-4 text-white/80 font-medium">{col.chain}</td> */}
                <td className="px-6 py-4 text-white/80 font-medium">{col.creatorFee}%</td>
                {/* <td className="px-6 py-4 text-white/80 font-medium">{col.supply}</td> */}
                <td className="text-white/80 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {shortenAddress(col.recipient)}
                    </span>

                    <button
                      onClick={() => handleCopyWallet(col.recipient)}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 transition"
                      title="Copy wallet address"
                    >
                      Copy
                    </button>
                  </div>
                </td>
                <td className=" py-4 mt-3 flex gap-4">
                  <Link to="/dashboard/edit-nfa" state={{ collection: col }}>
                    <img src={EditImage} alt="edit" className="w-4 h-4 cursor-pointer" />
                  </Link>
                  <button onClick={() => { setSelectedId(col.id); setIsModalOpen(true); }}>
                    <img src={DeleteImage} alt="delete" className="w-3 h-4 cursor-pointer" />
                  </button>
                </td>
                <td className=" ">
                  <Switch
                    checked={col.status}
                    onChange={() => toggleStatus(col.id, col.status)}
                    sx={{
                      width: 47,
                      height: 20,
                      padding: 0,
                      "& .MuiSwitch-switchBase": {
                        padding: 0, margin: 0, transitionDuration: "300ms",
                        "&.Mui-checked": {
                          transform: "translateX(24px)", color: "#fff",
                          "& + .MuiSwitch-track": { backgroundColor: "#0860eeff", opacity: 1, border: 0 }
                        }
                      },
                      "& .MuiSwitch-thumb": { boxSizing: "border-box", width: 22, height: 20, backgroundColor: "#fff" },
                      "& .MuiSwitch-track": { borderRadius: 34 / 2, backgroundColor: "#9ca3af", opacity: 1, transition: "background-color 500ms" },
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-800 rounded-lg p-6 w-96 flex flex-col gap-4"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <h2 className="text-white text-lg font-semibold">Confirm Delete</h2>
              <p className="text-white/70">Are you sure you want to delete this collection?</p>
              <div className="flex justify-end gap-4 mt-4">
                <button className="px-4 py-2 border border-white text-white rounded-md hover:bg-white/10"
                  onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
                  onClick={handleDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default CollectionDetails;
