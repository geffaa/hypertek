import { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import searchImage from "../../assets/images/search1.png";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import EditImage from "../../assets/edit.png";
import DeleteImage from "../../assets/delete.png";
import { User_Dashboard_Url, getImageUrl } from "../../Config";

function NFTs() {
  const user  = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");

  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    if (!user?.id) return;
    const fetchCollections = async () => {
      try {
        const res = await axios.get(`${User_Dashboard_Url}/nft/user/collection/get/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setCollections(res.data.collection || []);
        }
      } catch (err) {
        toast.error("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [user?.id, token]);

  const filtered = collections.filter((col) =>
    (col.collection?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this collection?")) return;
    try {
      await axios.delete(`${User_Dashboard_Url}/nft/collection/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollections((prev) => prev.filter((c) => c._id !== id));
      toast.success("Collection deleted");
    } catch {
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col w-full max-w-[900px] gap-6 px-4 md:ml-12 z-10">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          NFA's Collection
        </h1>
        <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 w-full sm:max-w-xs">
          <img src={searchImage} alt="search" className="w-4 h-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search collections"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white px-2 py-1 rounded w-full placeholder-gray-300 outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-4 md:pl-24 mt-12 overflow-x-auto custom-scrollbar z-10 w-full relative">
        {loading ? (
          <p className="text-white/50 text-sm px-2">Loading collections...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/50 text-sm px-2">No collections found.</p>
        ) : (
          <table className="min-w-[897px] w-full text-left rounded-lg overflow-hidden">
            <thead>
              <tr className="h-[50px] backdrop-blur-sm">
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Name</th>
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Image</th>
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Items</th>
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Action</th>
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((col) => {
                const name     = col.collection?.name || "Untitled";
                const image    = getImageUrl(col.collection?.image) || Collectionimage;
                const itemCount = col.subCollections?.length || 0;
                const listedCount = col.subCollections?.filter(s => s.listed).length || 0;

                return (
                  <tr key={col._id} className="h-[70px] transition-all duration-200 backdrop-blur-sm">
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">{name}</td>
                    <td className="px-6 py-4">
                      <img
                        src={image}
                        alt={name}
                        className="w-12 h-12 object-cover border border-white/10"
                        onError={(e) => { e.target.src = Collectionimage; }}
                      />
                    </td>
                    <td className="px-6 py-4 text-[#FFFFFFC4] font-medium">
                      {itemCount} items · {listedCount} listed
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <Link to="/dashboard/edit-nfa" state={{ collectionId: col._id }}>
                          <button className="p-2 cursor-pointer transition-colors duration-200">
                            <img src={EditImage} alt="edit" className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          className="p-2 cursor-pointer transition-colors duration-200"
                          onClick={() => handleDelete(col._id)}
                        >
                          <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Switch
                        checked={listedCount > 0}
                        disabled
                        sx={{
                          width: 47, height: 20, padding: 0,
                          "& .MuiSwitch-switchBase": {
                            padding: 0, margin: 0, transitionDuration: "300ms",
                            "&.Mui-checked": {
                              transform: "translateX(24px)", color: "#fff",
                              "& + .MuiSwitch-track": { backgroundColor: "#0860eeff", opacity: 1, border: 0 },
                            },
                          },
                          "& .MuiSwitch-thumb": { boxSizing: "border-box", width: 22, height: 20, backgroundColor: "#fff" },
                          "& .MuiSwitch-track": { borderRadius: 34 / 2, backgroundColor: "#9ca3af", opacity: 1 },
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        @media (max-width: 768px) { .mt-12 { margin-top: 1.5rem; } }
      `}</style>
    </div>
  );
}

export default NFTs;
