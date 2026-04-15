import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import DeleteImage from "../assets/delete.png";
import EditImage from "../assets/edit.png";

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// ── Component ─────────────────────────────────────────────────────────────────

function NewsManagement() {
  const navigate = useNavigate();

  const adminId = (() => {
    try {
      return JSON.parse(localStorage.getItem("admin_data"))?._id || null;
    } catch { return null; }
  })();

  const [newsList,        setNewsList]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId,      setSelectedId]      = useState(null);

  // Pagination
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${Dashboard_Base_Url}/v1/news/admin`);
        setNewsList(res.data.news || res.data.data || []);
      } catch {
        toast.error("Failed to load news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Reset page when pageSize changes
  useEffect(() => { setPage(1); }, [pageSize]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = () => {
    if (!adminId) return toast.error("Admin ID not found");
    navigate(`/${adminId}/add-news`);
  };

  const handleEdit = (item) => {
    if (!adminId) return toast.error("Admin ID not found");
    navigate(`/${adminId}/edit-news-item`, { state: { newsItem: item } });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      const res = await axios.delete(`${Dashboard_Base_Url}/v1/news/${selectedId}`);
      if (res.data.success) {
        toast.success("News deleted");
        setNewsList(prev => prev.filter(n => n._id !== selectedId));
        const remaining = newsList.length - 1;
        const maxPage   = Math.max(1, Math.ceil(remaining / pageSize));
        if (page > maxPage) setPage(maxPage);
      } else {
        toast.error(res.data.message || "Failed to delete news");
      }
    } catch {
      toast.error("Failed to delete news");
    } finally {
      setShowDeleteModal(false);
      setSelectedId(null);
    }
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────

  const totalItems = newsList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from       = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to         = Math.min(page * pageSize, totalItems);
  const paged      = newsList.slice((page - 1) * pageSize, page * pageSize);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) {
      if (range[0] > 2) range.unshift("...");
      range.unshift(1);
    }
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) range.push("...");
      range.push(totalPages);
    }
    return range;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-inter font-semibold text-[25px] text-white mb-1">News Management</h1>
          <p className="text-white/40 text-sm">Manage news articles and announcements</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#002AA8] text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          + Create News
        </button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">Loading news…</p>
        </div>
      ) : newsList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">No news found. Create your first article!</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-xl border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Image</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Heading</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Date</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(item => (
                <tr
                  key={item._id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Image */}
                  <td className="px-5 py-3">
                    {item.image ? (
                      <img
                        src={item.image.startsWith("http") ? item.image : `${Image_Base_Url}${item.image}`}
                        alt={item.heading || item.name}
                        className="w-16 h-11 object-cover rounded-lg border border-white/10"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-16 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-white/20 text-xs">No img</span>
                      </div>
                    )}
                  </td>

                  {/* Heading */}
                  <td className="px-5 py-3 text-white text-sm font-medium max-w-xs">
                    <p className="truncate">{item.heading || item.name || "Untitled"}</p>
                    {item.description && (
                      <p className="text-white/40 text-xs mt-0.5 truncate">{item.description}</p>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3 text-white/50 text-sm whitespace-nowrap">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <img src={EditImage} alt="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedId(item._id); setShowDeleteModal(true); }}
                        className="p-1.5 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
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

      {/* ── Pagination ── */}
      {!loading && totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3">
            <p className="text-white/40 text-xs">
              Showing {from}–{to} of {totalItems} articles
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-white/30 text-xs">Per page:</span>
              {PAGE_SIZE_OPTIONS.map(size => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`w-8 h-6 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    pageSize === size
                      ? "bg-[#002AA8] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Prev
            </button>

            {getPageNumbers().map((num, idx) =>
              num === "..." ? (
                <span key={`e-${idx}`} className="px-2 text-white/30 text-xs select-none">…</span>
              ) : (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    num === page
                      ? "bg-[#002AA8] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
          <div className="rounded-xl p-6 w-[400px] border border-white/10" style={{ background: "#0d0e1f" }}>
            <h2 className="text-white font-semibold text-lg mb-2">Delete News</h2>
            <p className="text-white/60 text-sm mb-6">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedId(null); }}
                className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/15 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
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

export default NewsManagement;
