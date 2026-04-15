import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";
import EditImage from "../assets/edit.png";
import DeleteImage from "../assets/delete.png";

function Artists() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const adminId = JSON.parse(localStorage.getItem("admin_data") || "{}")?._id;

  const fetchArtists = async () => {
    try {
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/artists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists(res.data.artists || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load artists";
      console.error("Artists fetch error:", err.response?.status, msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtists(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this artist?")) return;
    try {
      await axios.delete(`${Dashboard_Base_Url}/v1/admin/artists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists((prev) => prev.filter((a) => a._id !== id));
      toast.success("Artist deleted");
    } catch {
      toast.error("Failed to delete artist");
    }
  };

  const filtered = artists.filter((a) =>
    (a.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col overflow-x-hidden px-4 md:px-10 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
            Artists
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Manage HyperTek-hired artists and their royalty payment details
          </p>
        </div>
        <button
          onClick={() => navigate(`/${adminId}/artist-form`)}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          + Add Artist
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <input
          type="text"
          placeholder="Search artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm outline-none focus:border-blue-500/60"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-white/50 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/40 text-sm">No artists found.</p>
          <button
            onClick={() => navigate(`/${adminId}/artist-form`)}
            className="mt-4 px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-md"
          >
            Add your first artist
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[780px] w-full text-left rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-white/60 text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-white/60 text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-white/60 text-xs font-semibold uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-white/60 text-xs font-semibold uppercase tracking-wider">Wallet / Bank</th>
                <th className="px-4 py-3 text-white/60 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-white/60 text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((artist) => (
                <tr key={artist._id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-4 text-white font-medium text-sm">{artist.name}</td>
                  <td className="px-4 py-4 text-white/60 text-sm">{artist.email || "—"}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      artist.paymentPreference === "crypto"
                        ? "bg-blue-500/15 text-blue-300"
                        : "bg-green-500/15 text-green-300"
                    }`}>
                      {artist.paymentPreference === "crypto" ? "Crypto (USDC)" : "Bank Transfer"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white/60 text-xs font-mono">
                    {artist.paymentPreference === "crypto"
                      ? artist.walletAddress
                        ? `${artist.walletAddress.slice(0, 10)}...${artist.walletAddress.slice(-6)}`
                        : <span className="text-red-400/70">No wallet set</span>
                      : artist.bankDetails?.bankName
                        ? `${artist.bankDetails.bankName} — ${artist.bankDetails.currency}`
                        : <span className="text-red-400/70">No bank details</span>
                    }
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      artist.isActive ? "text-green-400" : "text-white/30"
                    }`}>
                      {artist.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/${adminId}/artist-form`, { state: { artist } })}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <img src={EditImage} alt="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(artist._id)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Artists;
