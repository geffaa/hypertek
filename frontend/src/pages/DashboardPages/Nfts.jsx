import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import axios from "axios";
import toast from "react-hot-toast";
import searchImage from "../../assets/images/search1.png";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import EditImage from "../../assets/edit.png";
import DeleteImage from "../../assets/delete.png";
import { BACKEND_BASE_URL, User_Dashboard_Url, getImageUrl } from "../../Config";
import { FiEye } from "react-icons/fi";

function NFTs() {
  const navigate = useNavigate();
  const user  = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");
  const { address: wagmiAddress } = useAccount();
  const { emailWalletAddress } = useEmailWallet();
  const wallet = wagmiAddress?.toLowerCase() || emailWalletAddress?.toLowerCase() || user?.WalletAddress?.toLowerCase() || user?.MetaMaskAddress?.toLowerCase() || "";

  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    const fetchCollections = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/parent-collections?owner=${encodeURIComponent(wallet)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setCollections(res.data.collections || []);
        }
      } catch (err) {
        toast.error("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [wallet, token]);

  const filtered = collections.filter((col) =>
    (col.collection?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this collection?")) return;
    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${id}`, {
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
      <div className="flex flex-col w-full gap-4 px-4 md:px-12 z-10">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          NFA's Collection
        </h1>
        <div className="flex items-center gap-3">
          <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 flex-1 sm:max-w-xs">
            <img src={searchImage} alt="search" className="w-4 h-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search collections"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white px-2 py-1 rounded w-full placeholder-gray-300 outline-none focus:ring-0 focus:outline-none"
            />
          </div>
          <Link to="/dashboard/add-user-collection" className="ml-auto">
            <button className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-white text-sm font-semibold whitespace-nowrap transition-all"
              style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
              + New Collection
            </button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 md:px-12 mt-8 overflow-x-auto custom-scrollbar z-10 w-full relative">
        {loading ? (
          <p className="text-white/50 text-sm px-2">Loading collections...</p>
        ) : !wallet ? (
          <p className="text-white/50 text-sm px-2">Connect your wallet to see collections.</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/50 text-sm px-2">No collections found. <Link to="/dashboard/add-user-collection" className="text-blue-400 underline">Create your first collection →</Link></p>
        ) : (
          <table className="min-w-[897px] w-full text-left rounded-lg overflow-hidden">
            <thead>
              <tr className="h-[50px] backdrop-blur-sm">
                <th className="px-6 py-3 text-white/60 font-semibold text-xs tracking-wider uppercase">Name</th>
                <th className="px-6 py-3 text-white/60 font-semibold text-xs tracking-wider uppercase">Image</th>
                <th className="px-6 py-3 text-white/60 font-semibold text-xs tracking-wider uppercase">Items</th>
                <th className="px-6 py-3 text-white/60 font-semibold text-xs tracking-wider uppercase">Category</th>
                <th className="px-6 py-3 text-white/60 font-semibold text-xs tracking-wider uppercase">Actions</th>
                <th className="px-6 py-3 text-white/60 font-semibold text-xs tracking-wider uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((col) => {
                const name        = col.collection?.name || "Untitled";
                const image       = getImageUrl(col.collection?.image) || Collectionimage;
                const itemCount   = col.subCollections?.length || 0;
                const listedCount = col.subCollections?.filter(s => s.listed).length || 0;
                const category    = col.category || "—";

                return (
                  <tr key={col._id} className="h-[70px] transition-all duration-200 backdrop-blur-sm">
                    <td className="px-6 py-4 text-white font-medium">{name}</td>
                    <td className="px-6 py-4">
                      <img
                        src={image}
                        alt={name}
                        className="w-12 h-12 object-cover border border-white/10 rounded-md"
                        onError={(e) => { e.target.src = Collectionimage; }}
                      />
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {itemCount} items · {listedCount} listed
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm capitalize">{category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* View / Manage Items */}
                        <button
                          title="View & Manage Items"
                          onClick={() => navigate("/dashboard/add-nfts", { state: { parentId: col._id, parentName: name } })}
                          className="flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium text-blue-300 hover:text-white transition-all"
                          style={{ background: "rgba(0,42,168,0.25)", border: "1px solid rgba(0,80,255,0.3)" }}
                        >
                          <FiEye size={12} />
                          {itemCount > 0 ? `${itemCount} Items` : "+ Items"}
                        </button>
                        {/* Edit */}
                        <button
                          title="Edit Collection"
                          onClick={() => navigate("/dashboard/edit-nfa", {
                            state: {
                              collection: {
                                _id: col._id,
                                name,
                                image,
                                symbol: col.collection?.symbol || "",
                                chain: col.collection?.chain || "Base",
                              }
                            }
                          })}
                          className="p-2 cursor-pointer hover:bg-white/5 rounded-md transition-colors"
                        >
                          <img src={EditImage} alt="edit" className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                          title="Delete"
                          className="p-2 cursor-pointer hover:bg-white/5 rounded-md transition-colors"
                          onClick={() => handleDelete(col._id)}
                        >
                          <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {listedCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-green-300"
                          style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          {listedCount} Listed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white/40"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                          Unlisted
                        </span>
                      )}
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
