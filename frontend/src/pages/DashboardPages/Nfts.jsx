import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { useEmailWallet } from "../../hooks/useEmailWallet";
import axios from "axios";
import toast from "react-hot-toast";
import Collectionimage from "../../assets/images/CreateCollection/collection.png";
import { BACKEND_BASE_URL, getImageUrl } from "../../Config";
import { FiSearch, FiEdit2, FiTrash2, FiTag, FiPackage, FiX, FiUploadCloud, FiAlertTriangle } from "react-icons/fi";

const ASSET_BADGE = {
  NFA: { bg: "rgba(124,58,237,0.2)", border: "rgba(124,58,237,0.5)", text: "#c4b5fd" },
  NFC: { bg: "rgba(0,42,168,0.25)",  border: "rgba(0,80,255,0.4)",   text: "#93c5fd" },
  NFT: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.15)", text: "rgba(255,255,255,0.5)" },
};

const ALL_CATEGORIES = [
  "all", "skins", "military badges", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases", "general",
];

function NFTs() {
  const user  = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");
  const { address: wagmiAddress } = useAccount();
  const { emailWalletAddress } = useEmailWallet();
  const wallet = wagmiAddress?.toLowerCase() || emailWalletAddress?.toLowerCase() || user?.WalletAddress?.toLowerCase() || user?.MetaMaskAddress?.toLowerCase() || "";

  const [allItems, setAllItems]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // — Listing modal
  const [listingItem, setListingItem]       = useState(null);
  const [listingPrice, setListingPrice]     = useState("");
  const [listingLoading, setListingLoading] = useState(false);

  // — Edit modal
  const [editItem, setEditItem]             = useState(null);
  const [editName, setEditName]             = useState("");
  const [editDesc, setEditDesc]             = useState("");
  const [editFile, setEditFile]             = useState(null);
  const [editPreview, setEditPreview]       = useState(null);
  const [editLoading, setEditLoading]       = useState(false);

  // — Delete modal
  const [deleteItem, setDeleteItem]         = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    // Use owned-with-subs (queries subCollections.owner) so old data with
    // mismatched collection.owner still shows up correctly.
    axios.get(
      `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${encodeURIComponent(wallet)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((res) => {
      if (res.data.success) {
        const items = (res.data.nfts || []).flatMap((col) =>
          (col.subCollections || [])
            .filter((sub) => sub.owner?.toLowerCase() === wallet.toLowerCase())
            .map((item) => ({
              ...item,
              parentId: col._id,
              category: col.category || "general",
            }))
        );
        setAllItems(items);
      }
    }).catch(() => toast.error("Failed to load items"))
      .finally(() => setLoading(false));
  }, [wallet, token]);

  // ── Listing ────────────────────────────────────────────────────────
  const openListModal = (item) => {
    setListingItem(item);
    setListingPrice("");
  };

  const handleList = async () => {
    if (!listingPrice || parseFloat(listingPrice) <= 0)
      return toast.error("Please enter a valid price");
    if (!wallet) return toast.error("Connect your wallet first");
    try {
      setListingLoading(true);
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/create`,
        { subCollectionId: listingItem._id, parentId: listingItem.parentId, seller: wallet, priceETH: parseFloat(listingPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllItems((prev) =>
        prev.map((i) => i._id === listingItem._id ? { ...i, listed: true, priceETH: parseFloat(listingPrice) } : i)
      );
      toast.success(`"${listingItem.name}" is now listed!`);
      setListingItem(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to list item");
    } finally {
      setListingLoading(false);
    }
  };

  // ── Cancel listing ─────────────────────────────────────────────────
  const handleCancelListing = async (item) => {
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/cancel`,
        { nftId: item.parentId, subId: item._id, seller: wallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllItems((prev) =>
        prev.map((i) => i._id === item._id ? { ...i, listed: false } : i)
      );
      toast.success("Listing cancelled");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel listing");
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────
  const openEditModal = (item) => {
    if (item.listed) return toast.error("Cancel the listing first before editing");
    setEditItem(item);
    setEditName(item.name || "");
    setEditDesc(item.description || "");
    setEditFile(null);
    setEditPreview(item.image ? getImageUrl(item.image) : null);
  };

  const handleEditFile = (file) => {
    if (!file) return;
    setEditFile(file);
    const reader = new FileReader();
    reader.onload = () => setEditPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!editName.trim()) return toast.error("Item name is required");
    try {
      setEditLoading(true);
      const form = new FormData();
      form.append("name", editName.trim());
      form.append("description", editDesc.trim());
      if (editFile) form.append("image", editFile);

      const { data } = await axios.put(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${editItem.parentId}/sub-collection/${editItem._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      setAllItems((prev) =>
        prev.map((i) =>
          i._id === editItem._id
            ? { ...i, name: editName.trim(), description: editDesc.trim(), image: data.subCollection?.image || i.image }
            : i
        )
      );
      toast.success("Item updated");
      setEditItem(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update item");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────
  const openDeleteModal = (item) => {
    if (item.listed) return toast.error("Cancel the listing first before deleting");
    if (item.tokenId) return toast.error("This item is already on-chain and cannot be deleted");
    setDeleteItem(item);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${deleteItem.parentId}/sub-collection/${deleteItem._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllItems((prev) => prev.filter((i) => i._id !== deleteItem._id));
      toast.success("Item deleted");
      setDeleteItem(null);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = allItems.filter((item) => {
    const matchCat = categoryFilter === "all" || item.category === categoryFilter;
    const matchSearch = (item.name || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryCounts = ALL_CATEGORIES.slice(1).reduce((acc, cat) => {
    acc[cat] = allItems.filter((i) => i.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col overflow-x-hidden pb-12">

      {/* Header */}
      <div className="flex flex-col w-full gap-4 px-4 md:px-12 z-10">
        <div className="flex items-center justify-between">
          <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">My Collections</h1>
          <Link to="/dashboard/add-user-collection">
            <button
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-white text-sm font-semibold whitespace-nowrap transition-all"
              style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
            >
              + Create NFT/NFC
            </button>
          </Link>
        </div>

        <div className="rounded-md flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 max-w-xs">
          <FiSearch size={14} className="text-white/40 flex-shrink-0" />
          <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white px-2 py-1 rounded w-full placeholder-gray-300 outline-none text-sm" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategoryFilter("all")}
            className={`px-3 h-7 rounded-full text-xs font-medium transition-all border ${categoryFilter === "all" ? "bg-white/15 border-white/30 text-white" : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"}`}>
            All ({allItems.length})
          </button>
          {ALL_CATEGORIES.slice(1).map((cat) => {
            const count = categoryCounts[cat] || 0;
            if (count === 0) return null;
            return (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 h-7 rounded-full text-xs font-medium transition-all border capitalize ${categoryFilter === cat ? "bg-white/15 border-white/30 text-white" : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"}`}>
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 md:px-12 mt-6">
        {loading ? (
          <p className="text-white/50 text-sm">Loading items...</p>
        ) : !wallet ? (
          <p className="text-white/50 text-sm">Connect your wallet to see your items.</p>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FiPackage size={28} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-white/50 text-sm">Your storage is empty.</p>
              <p className="text-white/30 text-xs mt-1">Create your first NFT/NFC to get started.</p>
            </div>
            <Link to="/dashboard/add-user-collection">
              <button className="flex items-center gap-2 px-5 h-9 rounded-lg text-white text-sm font-semibold transition-all"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
                + Create NFT/NFC
              </button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/50 text-sm">No items match your search.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((item) => {
              const img = item.image ? getImageUrl(item.image) : Collectionimage;
              const aType = item.assetType || (item.isNFA ? "NFA" : "NFT"); // NFC always has assetType set
              const badge = ASSET_BADGE[aType] || ASSET_BADGE.NFT;
              const isOnChain = !!item.tokenId;
              return (
                <div key={item._id}
                  className="rounded-xl border overflow-hidden flex flex-col transition-all hover:brightness-110"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: item.listed ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)" }}>
                  <div className="relative aspect-square">
                    <img src={img} alt={item.name} className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = Collectionimage; }} />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}>
                      {aType}
                    </span>
                    {item.listed && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-green-300"
                        style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}>
                        Listed
                      </span>
                    )}
                    {isOnChain && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-purple-300"
                        style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)" }}>
                        On-chain
                      </span>
                    )}
                  </div>

                  <div className="px-3 pt-2 pb-1 flex-1 flex flex-col gap-0.5">
                    <p className="text-white text-xs font-medium truncate">{item.name || "Unnamed"}</p>
                    <p className="text-white/30 text-[10px] capitalize">{item.category}</p>
                    {item.priceETH > 0 && (
                      <p className="text-white/60 text-[11px] mt-0.5">{item.priceETH} USDC</p>
                    )}
                  </div>

                  <div className="px-3 pb-2 flex items-center gap-1.5 mt-1">
                    {!item.listed ? (
                      <button onClick={() => openListModal(item)}
                        className="flex items-center gap-1 flex-1 h-6 rounded-md text-[10px] font-semibold text-blue-300 hover:text-white transition-all justify-center"
                        style={{ background: "rgba(0,42,168,0.25)", border: "1px solid rgba(0,80,255,0.3)" }}>
                        <FiTag size={10} /> List
                      </button>
                    ) : (
                      <button onClick={() => handleCancelListing(item)}
                        className="flex items-center gap-1 flex-1 h-6 rounded-md text-[10px] font-semibold text-red-300/80 hover:text-red-200 transition-all justify-center"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <FiX size={10} /> Unlist
                      </button>
                    )}
                    <button onClick={() => openEditModal(item)} title={item.listed ? "Cancel listing to edit" : "Edit"}
                      className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${item.listed ? "text-white/15 cursor-not-allowed" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                      <FiEdit2 size={11} />
                    </button>
                    <button onClick={() => openDeleteModal(item)} title={item.listed ? "Cancel listing to delete" : isOnChain ? "On-chain, cannot delete" : "Delete"}
                      className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${(item.listed || isOnChain) ? "text-white/15 cursor-not-allowed" : "text-white/40 hover:text-red-400 hover:bg-red-400/5"}`}>
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── List Modal ── */}
      {listingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d1a] p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-white font-semibold text-base">List on Marketplace</h2>
                <p className="text-white/40 text-xs mt-0.5">No gas fee now — item is minted on-chain only when someone buys it.</p>
              </div>
              <button onClick={() => setListingItem(null)} className="text-white/40 hover:text-white transition-colors mt-0.5"><FiX size={18} /></button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
              <img src={listingItem.image ? getImageUrl(listingItem.image) : Collectionimage} alt={listingItem.name}
                className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = Collectionimage; }} />
              <div>
                <p className="text-white text-sm font-medium">{listingItem.name}</p>
                <p className="text-white/40 text-xs capitalize">{listingItem.category}</p>
              </div>
            </div>
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Listing Price (USDC) <span className="text-red-400">*</span></label>
              <div className="flex h-11 rounded-lg bg-white/5 border border-white/10 focus-within:border-blue-500 transition-all overflow-hidden">
                <input type="number" placeholder="0.00" min="0" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-white text-sm outline-none placeholder-white/30" autoFocus />
                <span className="flex items-center pr-3 gap-1.5">
                  <img src="/usdc-logo.svg" alt="USDC" className="w-4 h-4 opacity-60" />
                  <span className="text-white/30 text-sm font-medium">USDC</span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setListingItem(null)}
                className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleList} disabled={listingLoading}
                className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
                {listingLoading ? "Listing..." : "List Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d1a] p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <h2 className="text-white font-semibold text-base">Edit Item</h2>
              <button onClick={() => setEditItem(null)} className="text-white/40 hover:text-white transition-colors"><FiX size={18} /></button>
            </div>

            {/* Image */}
            <div
              className="relative w-full h-32 rounded-xl border border-dashed border-white/15 bg-white/3 flex items-center justify-center cursor-pointer overflow-hidden group"
              onClick={() => document.getElementById("edit-img-input").click()}
            >
              {editPreview ? (
                <>
                  <img src={editPreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <FiUploadCloud size={18} className="text-white" />
                    <span className="text-white text-xs">Change image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-white/30">
                  <FiUploadCloud size={20} />
                  <span className="text-xs">Click to change image</span>
                </div>
              )}
              <input type="file" id="edit-img-input" accept="image/*" className="hidden"
                onChange={(e) => handleEditFile(e.target.files[0])} />
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Item Name <span className="text-red-400">*</span></label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all text-sm" />
            </div>

            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Description</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all text-sm resize-none placeholder-white/30" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditItem(null)}
                className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleEdit} disabled={editLoading}
                className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d1a] p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle size={18} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">Delete Item</h2>
                  <p className="text-white/40 text-xs mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <button onClick={() => setDeleteItem(null)} className="text-white/40 hover:text-white transition-colors"><FiX size={18} /></button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
              <img src={deleteItem.image ? getImageUrl(deleteItem.image) : Collectionimage} alt={deleteItem.name}
                className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = Collectionimage; }} />
              <div>
                <p className="text-white text-sm font-medium">{deleteItem.name}</p>
                <p className="text-white/40 text-xs capitalize">{deleteItem.category} · stored off-chain</p>
              </div>
            </div>

            <p className="text-white/50 text-sm">
              Are you sure you want to delete <span className="text-white font-medium">"{deleteItem.name}"</span>?
              This item has not been minted — it will be permanently removed from storage.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setDeleteItem(null)}
                className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                style={{ background: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.4)" }}>
                {deleteLoading ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NFTs;
