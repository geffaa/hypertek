import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner";
import DeleteImage from "../assets/delete.png";
import EditImage from "../assets/edit.png";

function OtherNews() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState(null);

  const adminId = (() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      return adminData ? JSON.parse(adminData)?._id : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${Dashboard_Base_Url}/v1/news/admin`);
        if (res.data.success && res.data.news) {
          setNewsList(res.data.news);
        } else {
          setNewsList([]);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        toast.error("Failed to load news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleEdit = (item) => {
    if (!adminId) {
      toast.error("Admin ID not found");
      return;
    }
    navigate(`/${adminId}/edit-news-item`, { state: { newsItem: item } });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNewsId) return;
    try {
      const res = await axios.delete(`${Dashboard_Base_Url}/v1/news/${selectedNewsId}`);
      if (res.data.success) {
        toast.success("News deleted successfully");
        setNewsList((prev) => prev.filter((n) => n._id !== selectedNewsId));
      } else {
        toast.error(res.data.message || "Failed to delete news");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete news");
    } finally {
      setShowDeleteModal(false);
      setSelectedNewsId(null);
    }
  };

  const handleAddNews = () => {
    if (!adminId) {
      toast.error("Admin ID not found");
      return;
    }
    navigate(`/${adminId}/add-news`);
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-inter font-semibold text-[25px] text-white">
          News Management
        </h1>
        <button
          onClick={handleAddNews}
          className="bg-blue-800 hover:bg-blue-700 transition-colors text-white px-5 py-2 rounded-md text-sm cursor-pointer"
        >
          + Add News
        </button>
      </div>

      {newsList.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-white/60 text-lg">No news found. Add your first news!</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="h-[50px] backdrop-blur-sm">
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Image</th>
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Heading</th>
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Date</th>
                <th className="px-6 py-3 text-white font-semibold text-sm tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {newsList.map((item) => (
                <tr
                  key={item._id}
                  className="h-[70px] transition-all duration-200 backdrop-blur-sm hover:bg-white/5"
                >
                  {/* Image */}
                  <td className="px-6 py-4">
                    {item.image ? (
                      <img
                        src={item.image.startsWith("http") ? item.image : `${Image_Base_Url}${item.image}`}
                        alt={item.name || item.heading}
                        className="w-16 h-12 object-cover rounded border border-white/10"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-700 rounded border border-white/10 flex items-center justify-center">
                        <span className="text-white/40 text-xs">No Image</span>
                      </div>
                    )}
                  </td>

                  {/* Heading */}
                  <td className="px-6 py-4 text-[#FFFFFFC4] font-medium max-w-[300px]">
                    <p className="truncate">{item.name || item.heading || "Untitled"}</p>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-[#FFFFFFC4] text-sm">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded"
                        title="Edit"
                      >
                        <img src={EditImage} alt="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNewsId(item._id);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 cursor-pointer transition-colors duration-200 hover:bg-white/10 rounded"
                        title="Delete"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-8 w-[350px] text-white shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Delete News?</h2>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this news item? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNewsId(null);
                }}
                className="px-4 py-2 rounded bg-gray-600/40 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
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

export default OtherNews;
