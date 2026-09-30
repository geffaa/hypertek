import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, getImageUrl } from "../Config";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "archived", label: "Archived" },
];

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-white/10 text-white/60" },
  active: { label: "Active", color: "bg-green-500/15 text-green-400" },
  paused: { label: "Paused", color: "bg-amber-500/15 text-amber-400" },
  archived: { label: "Archived", color: "bg-white/5 text-white/35" },
  disabled_item_sold: { label: "Item Sold", color: "bg-red-500/15 text-red-400" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function Packages() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const adminDataString = localStorage.getItem("admin_data");
  const adminId = adminDataString ? JSON.parse(adminDataString)?._id : null;

  const [packages, setPackages] = useState([]);
  const [summary, setSummary] = useState({ draft: 0, active: 0, paused: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/packages?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPackages(res.data.data || []);
      setSummary(res.data.summary || { draft: 0, active: 0, paused: 0, total: 0 });
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, pageSize, token]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const changeStatus = async (pkg, status) => {
    setBusyId(pkg._id);
    try {
      const res = await axios.put(
        `${Dashboard_Base_Url}/v1/admin/packages/${pkg._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(res.data?.message || "Status updated");
      fetchPackages();
    } catch (err) {
      const data = err.response?.data;
      // Activation runs every guard again, so it can fail for a specific,
      // fixable reason. Surface that reason rather than a generic error.
      if (data?.blocked?.length) {
        toast.error(`${data.blocked[0].itemName || "An item"}: ${data.blocked[0].reason}`, {
          duration: 6000,
        });
      } else {
        toast.error(data?.message || "Failed to update status");
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`${Dashboard_Base_Url}/v1/admin/packages/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data?.message || "Package removed");
      setDeleteTarget(null);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete package");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-inter font-semibold text-[25px] text-white mb-1">Packages</h1>
          <p className="text-white/40 text-sm">
            Bundle existing items and sell them together at a discount
          </p>
        </div>
        <button
          onClick={() => adminId && navigate(`/${adminId}/package-form`)}
          className="flex items-center gap-2 px-5 h-10 rounded-lg text-white text-sm font-semibold transition-all flex-shrink-0"
          style={{
            background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
            border: "1px solid rgba(0,80,255,0.3)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Package
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: summary.total, color: "border-white/10" },
          { label: "Active", value: summary.active, color: "border-green-500/25" },
          { label: "Draft", value: summary.draft, color: "border-white/10" },
          { label: "Paused", value: summary.paused, color: "border-amber-500/25" },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border ${card.color} p-4`}
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-white/50 text-xs mb-1">{card.label}</p>
            <p className="font-bold text-2xl text-white">{card.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === f.key ? "bg-[#002AA8] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}

        <form onSubmit={handleSearchSubmit} className="flex gap-2 ml-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search packages…"
            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white border border-white/10 outline-none placeholder-white/30 w-48"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#002AA8] text-white cursor-pointer"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-white/40 text-sm">Loading packages…</div>
        </div>
      ) : packages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-white/40 text-sm">No packages yet</div>
          <button
            onClick={() => adminId && navigate(`/${adminId}/package-form`)}
            className="text-[#4d7aff] text-sm font-semibold hover:underline cursor-pointer"
          >
            Create the first one
          </button>
        </div>
      ) : (
        <div
          className="overflow-x-auto w-full rounded-xl border border-white/8"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Package", "Items", "Base Total", "Price", "Discount", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr
                  key={pkg._id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {pkg.image ? (
                        <img
                          src={getImageUrl(pkg.image)}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/25 text-[10px] flex-shrink-0">
                          IMG
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate max-w-[220px]">{pkg.name}</p>
                        {pkg.badge && <p className="text-[#4d7aff] text-[11px]">{pkg.badge}</p>}
                        {!pkg.pricingValid && (
                          <p className="text-amber-400 text-[11px] flex items-center gap-1">
                            <span>⚠</span> Buyback floors rose above this price
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className="text-white/70 text-sm"
                      title={(pkg.items || []).map((i) => i.name).join(", ")}
                    >
                      {pkg.itemCount ?? pkg.items?.length ?? 0}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-white/40 text-sm line-through">
                    ${Number(pkg.basePriceTotalUSD || 0).toFixed(2)}
                  </td>

                  <td className="px-5 py-3 text-white text-sm font-bold">
                    ${Number(pkg.priceUSD || 0).toFixed(2)}
                  </td>

                  <td className="px-5 py-3">
                    {pkg.discountPercent > 0 ? (
                      <span className="text-green-400 text-sm font-semibold">
                        −{pkg.discountPercent}%
                      </span>
                    ) : (
                      <span className="text-white/25 text-sm">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <StatusPill status={pkg.status} />
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {pkg.status === "draft" || pkg.status === "paused" ? (
                        <button
                          disabled={busyId === pkg._id}
                          onClick={() => changeStatus(pkg, "active")}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-600/80 hover:bg-green-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {busyId === pkg._id ? "…" : "Activate"}
                        </button>
                      ) : pkg.status === "active" ? (
                        <button
                          disabled={busyId === pkg._id}
                          onClick={() => changeStatus(pkg, "paused")}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-600/80 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {busyId === pkg._id ? "…" : "Pause"}
                        </button>
                      ) : null}

                      <button
                        onClick={() => adminId && navigate(`/${adminId}/package-form?id=${pkg._id}`)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteTarget(pkg)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading &&
        total > 0 &&
        (() => {
          const totalPages = Math.ceil(total / pageSize);
          const from = (page - 1) * pageSize + 1;
          const to = Math.min(page * pageSize, total);

          return (
            <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs">
                  Showing {from}–{to} of {total}
                </span>
                <div className="flex gap-1">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      onClick={() => setPageSize(size)}
                      className={`w-8 h-6 rounded text-xs font-semibold cursor-pointer ${
                        pageSize === size ? "bg-[#002AA8] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 h-8 rounded-lg text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="text-white/40 text-xs px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 h-8 rounded-lg text-xs font-semibold bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          );
        })()}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
          <div className="rounded-xl p-6 w-[400px] border border-white/10" style={{ background: "#0d0e1f" }}>
            <h2 className="text-white font-semibold text-lg mb-2">
              {deleteTarget.status === "draft" ? "Delete package" : "Archive package"}
            </h2>
            <p className="text-white/60 text-sm mb-6">
              <span className="text-white font-semibold">"{deleteTarget.name}"</span>{" "}
              {deleteTarget.status === "draft"
                ? "will be permanently deleted. The items inside it are not affected and stay in your Items list."
                : "will be archived and hidden. It is kept for your sales history."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/15 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Removing…" : deleteTarget.status === "draft" ? "Delete" : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Packages;
