import React, { useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteImage from "../assets/delete.png";

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// ── Component ─────────────────────────────────────────────────────────────────

function UserDetails() {
  const [users,           setUsers]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId,  setSelectedUserId]  = useState(null);

  // Pagination
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${Dashboard_Base_Url}/v1/users`);
        if (res.data.success && res.data.users) {
          const mapped = res.data.users
            .filter(u => u.Role !== "admin")
            .map(u => ({
              id:     u._id,
              name:   u.FullName || "No Name",
              email:  u.Email    || "—",
              avatar: u.Avatar   || "",
              status: u.isActive,
            }));
          setUsers(mapped);
        }
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Reset to page 1 when page size changes
  useEffect(() => { setPage(1); }, [pageSize]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleStatus = async (id, current) => {
    const next = !current;
    try {
      await axios.patch(`${Dashboard_Base_Url}/v1/user/status/${id}`, { isActive: next });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: next } : u));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    try {
      const res = await axios.delete(`${Dashboard_Base_Url}/v1/delete/${selectedUserId}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(u => u.id !== selectedUserId));
        toast.success("User deleted");
        // adjust page if last item on page was deleted
        const remaining = users.length - 1;
        const maxPage   = Math.max(1, Math.ceil(remaining / pageSize));
        if (page > maxPage) setPage(maxPage);
      }
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setShowDeleteModal(false);
      setSelectedUserId(null);
    }
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────

  const totalItems  = users.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / pageSize));
  const from        = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to          = Math.min(page * pageSize, totalItems);
  const paged       = users.slice((page - 1) * pageSize, page * pageSize);

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
      <div className="mb-6">
        <h1 className="font-inter font-semibold text-[25px] text-white mb-1">Users</h1>
        <p className="text-white/40 text-sm">Manage platform users</p>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-white/40 text-sm">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-xl border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">User</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Email</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Status</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(user => (
                <tr
                  key={user.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* User */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={`${Image_Base_Url}${user.avatar}`}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
                          onError={e => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-9 h-9 rounded-full bg-blue-600 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
                        style={{ display: user.avatar ? "none" : "flex" }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">{user.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3 text-white/60 text-sm">{user.email}</td>

                  {/* Status toggle */}
                  <td className="px-5 py-3">
                    <Switch
                      checked={!!user.status}
                      onChange={() => toggleStatus(user.id, user.status)}
                      size="small"
                      sx={{
                        width: 47, height: 20, padding: 0,
                        "& .MuiSwitch-switchBase": {
                          padding: 0, margin: 0, transitionDuration: "300ms",
                          "&.Mui-checked": {
                            transform: "translateX(24px)", color: "#fff",
                            "& + .MuiSwitch-track": { backgroundColor: "#0860ee", opacity: 1, border: 0 },
                          },
                        },
                        "& .MuiSwitch-thumb": { boxSizing: "border-box", width: 22, height: 20, backgroundColor: "#fff" },
                        "& .MuiSwitch-track": { borderRadius: 17, backgroundColor: "#9ca3af", opacity: 1 },
                      }}
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setSelectedUserId(user.id); setShowDeleteModal(true); }}
                      className="p-1.5 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete user"
                    >
                      <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                    </button>
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
              {totalItems === 0 ? "No users" : `Showing ${from}–${to} of ${totalItems} users`}
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
            <h2 className="text-white font-semibold text-lg mb-2">Delete User</h2>
            <p className="text-white/60 text-sm mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedUserId(null); }}
                className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/15 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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

export default UserDetails;
