import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Switch from "@mui/material/Switch";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Dashboard_Base_Url, getImageUrl } from "../Config";
import DeleteImage from "../assets/delete.png";
import EditImage from "../assets/edit.png";

// ── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const TYPE_FILTERS = [
  { key: "all", label: "All Types" },
  { key: "NFT", label: "NFT" },
  { key: "NFC", label: "NFC" },
  { key: "NFA", label: "NFA" },
];

const ASSET_CONFIG = {
  NFA: { label: "NFA", color: "bg-amber-500/15 text-amber-300 border border-amber-500/30" },
  NFC: { label: "NFC", color: "bg-blue-500/15 text-blue-300 border border-blue-500/30" },
  NFT: { label: "NFT", color: "bg-purple-500/15 text-purple-300 border border-purple-500/30" },
};

// ── Component ─────────────────────────────────────────────────────────────────

function Items() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const adminDataString = localStorage.getItem("admin_data");
  const adminId  = adminDataString ? JSON.parse(adminDataString)?._id : null;

  const [items,      setItems]      = useState([]);
  const [summary,    setSummary]    = useState({ NFT: 0, NFC: 0, NFA: 0, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter,  setCatFilter]  = useState("all");
  const [search,     setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Pagination
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(PAGE_SIZE_OPTIONS[0]);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("assetType", typeFilter);
      if (catFilter  !== "all") params.set("category",  catFilter);
      if (search)               params.set("search",    search);
      params.set("page",  String(page));
      params.set("limit", String(pageSize));

      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/items${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.data    || []);
      setSummary(res.data.summary || { NFT: 0, NFC: 0, NFA: 0, total: 0 });
      setTotalItems(res.data.total || 0);
    } catch (err) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, catFilter, search, page, pageSize, token]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${Dashboard_Base_Url}/v1/nft/parent-collections`);
      const parents = res.data.collections || [];
      const cats = [...new Set(parents.map(p => (p.category || "").toLowerCase()).filter(Boolean))];
      setCategories(cats);
    } catch {
      // non-critical
    }
  };

  useEffect(() => { fetchItems(); },    [fetchItems]);
  useEffect(() => { fetchCategories(); }, []);

  // Reset to page 1 whenever filters, search, or page size change
  useEffect(() => { setPage(1); }, [typeFilter, catFilter, search, pageSize]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    try {
      await axios.put(
        `${Dashboard_Base_Url}/v1/admin/nfa/items/${item.parentId}/${item._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(prev => prev.map(i =>
        i._id.toString() === item._id.toString() ? { ...i, status: newStatus } : i
      ));
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleEditItem = (item) => {
    if (!adminId) return toast.error("Admin ID not found");
    navigate(`/${adminId}/edit-sub-collection`, {
      state: {
        subCollectionId: item._id,
        parentId:        item.parentId,
        existingData: {
          name:               item.name,
          priceETH:           item.priceETH,
          image:              item.image,
          assetType:          item.assetType,
          minimumBuybackUSD:  item.minimumBuybackUSD,
          reservePriceUSD:    item.reservePriceUSD,
          nfaFrame:           item.nfaFrame,
          artistId:           item.artistId || "",
        },
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${Dashboard_Base_Url}/v1/admin/nfa/items/${deleteTarget.parentId}/${deleteTarget._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(prev => prev.filter(i => i._id.toString() !== deleteTarget._id.toString()));
      setSummary(prev => ({
        ...prev,
        [deleteTarget.assetType]: Math.max(0, (prev[deleteTarget.assetType] || 1) - 1),
        total: Math.max(0, (prev.total || 1) - 1),
      }));
      toast.success("Item deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full pb-12">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-inter font-semibold text-[25px] text-white mb-1">Items</h1>
        <p className="text-white/40 text-sm">All NFT / NFC / NFA items across all categories</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { key: "total", label: "Total Items",  color: "border-white/10",        text: "text-white" },
          { key: "NFT",   label: "NFT",           color: "border-purple-500/30",   text: "text-purple-300" },
          { key: "NFC",   label: "NFC",           color: "border-blue-500/30",     text: "text-blue-300" },
          { key: "NFA",   label: "NFA",           color: "border-amber-500/30",    text: "text-amber-300" },
        ].map(({ key, label, color, text }) => (
          <div
            key={key}
            className={`rounded-xl border ${color} p-4`}
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-white/50 text-xs mb-1">{label}</p>
            <p className={`font-bold text-2xl ${text}`}>{summary[key] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Type filter */}
        <div className="flex gap-2">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === f.key
                  ? "bg-[#002AA8] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/70 border border-white/10 outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 ml-auto">
          <input
            type="text"
            placeholder="Search by name or category…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white border border-white/10 outline-none w-52 placeholder-white/30"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#002AA8] text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchInput(""); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/50 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-white/40 text-sm">Loading items…</div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-white/40 text-sm">No items found</div>
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-xl border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Item</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Type</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Category</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Artist</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Price (ETH)</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Listed</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Min Buyback</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Status</th>
                <th className="px-5 py-3 text-white/50 font-semibold text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const typeCfg = ASSET_CONFIG[item.assetType] || ASSET_CONFIG.NFT;
                return (
                  <tr
                    key={`${item._id}-${idx}`}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Item name + image */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                            onError={e => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-white/20 text-xs">IMG</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-semibold leading-tight">{item.name}</p>
                          <p className="text-white/30 text-xs mt-0.5">{item.parentName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${typeCfg.color}`}>
                        {typeCfg.label}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3 text-white/60 text-sm capitalize">{item.category || "—"}</td>

                    {/* Artist */}
                    <td className="px-5 py-3">
                      {item.artistName
                        ? <span className="text-blue-300 text-xs font-medium">{item.artistName}</span>
                        : <span className="text-white/25 text-xs">—</span>}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3 text-white/80 text-sm font-mono">
                      {item.priceETH > 0 ? item.priceETH.toFixed(4) : <span className="text-white/30">—</span>}
                    </td>

                    {/* Listed */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${item.listed ? "text-green-400" : "text-white/30"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.listed ? "bg-green-400" : "bg-white/20"}`} />
                        {item.listed ? "Listed" : "Unlisted"}
                      </span>
                    </td>

                    {/* Min Buyback */}
                    <td className="px-5 py-3 text-white/60 text-sm font-mono">
                      {item.minimumBuybackUSD > 0
                        ? <span className="text-amber-300">${item.minimumBuybackUSD.toFixed(2)}</span>
                        : <span className="text-white/30">—</span>}
                    </td>

                    {/* Status toggle */}
                    <td className="px-5 py-3">
                      <Switch
                        checked={item.status === "active"}
                        onChange={() => handleToggleStatus(item)}
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

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit item"
                        >
                          <img src={EditImage} alt="edit" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <img src={DeleteImage} alt="delete" className="w-3 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalItems > 0 && (() => {
        const totalPages = Math.ceil(totalItems / pageSize);
        const from = (page - 1) * pageSize + 1;
        const to   = Math.min(page * pageSize, totalItems);

        // Build visible page numbers (max 5 around current)
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

        return (
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-3">
              <p className="text-white/40 text-xs">
                Showing {from}–{to} of {totalItems} items
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
                  <span key={`ellipsis-${idx}`} className="px-2 text-white/30 text-xs select-none">…</span>
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
        );
      })()}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
          <div
            className="rounded-xl p-6 w-[400px] border border-white/10"
            style={{ background: "#0d0e1f" }}
          >
            <h2 className="text-white font-semibold text-lg mb-2">Delete Item</h2>
            <p className="text-white/60 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">"{deleteTarget.name}"</span>?
              {" "}This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/15 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Items;
