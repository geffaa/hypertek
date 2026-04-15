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
import { Gavel, ArrowRightLeft, CheckCircle2 } from "lucide-react";

const ASSET_BADGE = {
  NFA: { bg: "rgba(124,58,237,0.2)", border: "rgba(124,58,237,0.5)", text: "#c4b5fd" },
  NFC: { bg: "rgba(0,42,168,0.25)",  border: "rgba(0,80,255,0.4)",   text: "#93c5fd" },
  NFT: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.15)", text: "rgba(255,255,255,0.5)" },
};

const ALL_CATEGORIES = [
  "all", "skins", "military badges", "specialists", "weapons",
  "body armour", "spaceships", "racing vehicles", "artwork", "land and bases", "general",
];

// Step indicator dots for the multi-step listing modal
function ListingSteps({ step }) {
  const steps = [
    { key: "marketplace", label: "Marketplace" },
    { key: "auction",     label: "Auction"     },
    { key: "trade",       label: "Trade"        },
    { key: "hire",        label: "Hire"         },
  ];
  const currentIndex =
    step === "marketplace"                           ? 0 :
    step === "auction_prompt" || step === "auction_form" ? 1 :
    step === "trade_prompt"   || step === "trade_form"   ? 2 :
    3;

  return (
    <div className="flex items-center gap-1 justify-center mb-1">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-all ${i < currentIndex ? "bg-green-400" : i === currentIndex ? "bg-blue-400" : "bg-white/15"}`} />
          {i < steps.length - 1 && <div className="w-4 h-px bg-white/10" />}
        </div>
      ))}
      <span className="text-white/30 text-[10px] ml-2">{steps[currentIndex]?.label}</span>
    </div>
  );
}

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

  // — Multi-step marketplace listing modal
  const [listingItem, setListingItem]       = useState(null);
  // step: null | 'marketplace' | 'auction_prompt' | 'auction_form' | 'trade_prompt' | 'trade_form'
  const [listStep, setListStep]             = useState(null);
  const [listingPrice, setListingPrice]     = useState("");
  const [listingLoading, setListingLoading] = useState(false);

  // — Auction sub-step
  const [auctionForm, setAuctionForm]       = useState({ startPrice: "", durationHours: "24", reservePrice: "", instantBuyPrice: "" });
  const [auctionLoading, setAuctionLoading] = useState(false);

  // — Trade sub-step
  const [tradeForm, setTradeForm]           = useState({ reqItem: "", description: "", openOffer: false });
  const [tradeLoading, setTradeLoading]     = useState(false);

  // — Hire sub-step
  const [hireForm, setHireForm]             = useState({ pricePerDuration: "", durationHours: "24" });
  const [hireLoading, setHireLoading]       = useState(false);

  // — Unlist confirmation modal
  const [unlistItem, setUnlistItem]         = useState(null);
  const [unlistLoading, setUnlistLoading]   = useState(false);

  // — Edit modal
  const [editItem, setEditItem]             = useState(null);
  const [editName, setEditName]             = useState("");
  const [editDesc, setEditDesc]             = useState("");
  const [editCategory, setEditCategory]     = useState("");
  const [editFile, setEditFile]             = useState(null);
  const [editPreview, setEditPreview]       = useState(null);
  const [editLoading, setEditLoading]       = useState(false);

  // — Delete modal
  const [deleteItem, setDeleteItem]         = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    Promise.all([
      axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${encodeURIComponent(wallet)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      axios.get(`${BACKEND_BASE_URL}/api/v1/auction/seller/${wallet}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: [] })),
      axios.get(`${BACKEND_BASE_URL}/api/v1/trade`, {
        params: { type: "trade", posterWallet: wallet, status: "open", limit: 50 },
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { trades: [] } })),
    ]).then(([nftRes, auctionRes, tradeRes]) => {
      if (nftRes.data.success) {
        const auctions = Array.isArray(auctionRes.data) ? auctionRes.data : (auctionRes.data?.auctions || []);
        const trades   = tradeRes.data?.trades || [];
        const items = (nftRes.data.nfts || []).flatMap((col) =>
          (col.subCollections || [])
            .filter((sub) => sub.owner?.toLowerCase() === wallet.toLowerCase())
            .map((item) => ({
              ...item,
              parentId:  col._id,
              category:  col.category || "general",
              onAuction: auctions.some((a) => String(a.subCollectionId) === String(item._id) && a.status === "active"),
              onTrade:   trades.some((t) => t.offering === item.name && t.status === "open"),
            }))
        );
        setAllItems(items);
      }
    }).catch(() => toast.error("Failed to load items"))
      .finally(() => setLoading(false));
  }, [wallet, token]);

  // ── Close listing modal completely ─────────────────────────────────────────
  const closeListing = () => {
    setListingItem(null);
    setListStep(null);
    setListingPrice("");
    setAuctionForm({ startPrice: "", durationHours: "24", reservePrice: "", instantBuyPrice: "" });
    setTradeForm({ reqItem: "", description: "", openOffer: false });
    setHireForm({ pricePerDuration: "", durationHours: "24" });
  };

  // ── Open listing modal ─────────────────────────────────────────────────────
  const openListModal = (item) => {
    setListingItem(item);
    setListingPrice("");
    setListStep("marketplace");
  };

  // ── Step 1: List on Marketplace ────────────────────────────────────────────
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
      toast.success(`"${listingItem.name}" listed on Marketplace!`);
      // Proceed to offer auction listing
      setListStep("auction_prompt");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to list item");
    } finally {
      setListingLoading(false);
    }
  };

  // ── Step 2: Create Auction ─────────────────────────────────────────────────
  const handleCreateAuction = async () => {
    if (!auctionForm.startPrice || parseFloat(auctionForm.startPrice) <= 0)
      return toast.error("Enter a valid start price");
    try {
      setAuctionLoading(true);
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sellerWallet:    wallet,
          nftSystemId:     listingItem.parentId,
          subCollectionId: listingItem._id,
          title:           listingItem.name,
          description:     listingItem.description || "",
          image:           listingItem.image || "",
          category:        listingItem.category,
          startPrice:      parseFloat(auctionForm.startPrice),
          reservePrice:    auctionForm.reservePrice    ? parseFloat(auctionForm.reservePrice)    : undefined,
          instantBuyPrice: auctionForm.instantBuyPrice ? parseFloat(auctionForm.instantBuyPrice) : undefined,
          durationHours:   parseInt(auctionForm.durationHours) || 24,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setAllItems((prev) =>
        prev.map((i) => i._id === listingItem._id ? { ...i, onAuction: true } : i)
      );
      toast.success("Auction listing created!");
    } catch (err) {
      toast.error(err.message || "Failed to create auction");
    } finally {
      setAuctionLoading(false);
      setListStep("trade_prompt");
    }
  };

  // ── Step 3: Create Trade listing ───────────────────────────────────────────
  const handleCreateTrade = async () => {
    const requesting = tradeForm.openOffer ? "Make me an offer" : tradeForm.reqItem.trim();
    if (!tradeForm.openOffer && !requesting)
      return toast.error("Specify what you want in return, or enable open offer");
    try {
      setTradeLoading(true);
      const fd = new FormData();
      const posterName = user?.FullName || user?.Email?.split("@")[0] || "Trader";
      fd.append("type", "trade");
      fd.append("posterWallet", wallet);
      fd.append("posterName", posterName);
      fd.append("reward", "0");
      fd.append("title", `${listingItem.name} ↔ ${tradeForm.openOffer ? "Open Offer" : requesting}`);
      fd.append("description", tradeForm.description || "");
      fd.append("offering", listingItem.name);
      fd.append("requesting", requesting || "Make me an offer");
      fd.append("category", listingItem.category || "general");
      if (listingItem.image) fd.append("imageUrl", listingItem.image);
      const authToken = token || localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: fd,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setAllItems((prev) =>
        prev.map((i) => i._id === listingItem._id ? { ...i, onTrade: true } : i)
      );
      toast.success("Trade listing created!");
    } catch (err) {
      toast.error(err.message || "Failed to create trade listing");
    } finally {
      setTradeLoading(false);
      setListStep("hire_prompt");
    }
  };

  // ── Step 4: Create Hire listing ────────────────────────────────────────────
  const handleCreateHire = async () => {
    if (!hireForm.pricePerDuration || parseFloat(hireForm.pricePerDuration) <= 0)
      return toast.error("Enter a valid price per duration");
    try {
      setHireLoading(true);
      const authToken = token || localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/hire`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          type:             "hire",
          ownerWallet:      wallet,
          ownerName:        user?.FullName || user?.Email?.split("@")[0] || "User",
          itemTitle:        listingItem.name,
          itemDescription:  listingItem.description || "",
          image:            listingItem.image || "",
          category:         listingItem.category || "general",
          nftSystemId:      listingItem.parentId,
          subCollectionId:  listingItem._id,
          pricePerDuration: parseFloat(hireForm.pricePerDuration),
          durationHours:    parseInt(hireForm.durationHours),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setAllItems((prev) =>
        prev.map((i) => i._id === listingItem._id ? { ...i, onHire: true } : i)
      );
      toast.success("Item listed for hire!");
    } catch (err) {
      toast.error(err.message || "Failed to list for hire");
    } finally {
      setHireLoading(false);
      closeListing();
    }
  };

  // ── Confirm + execute unlist (cancels marketplace, auction, and trade) ──────
  const handleConfirmUnlist = async () => {
    if (!unlistItem) return;
    try {
      setUnlistLoading(true);
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/nft/sub-collection/listing/cancel`,
        { nftId: unlistItem.parentId, subId: unlistItem._id, seller: wallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllItems((prev) =>
        prev.map((i) => i._id === unlistItem._id ? { ...i, listed: false, priceETH: 0, onAuction: false, onTrade: false } : i)
      );
      const venues = res.data?.cancelledVenues;
      const extra  = venues?.length ? ` (also removed from ${venues.join(", ")})` : "";
      toast.success(`Listing cancelled${extra}`);
      setUnlistItem(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel listing");
    } finally {
      setUnlistLoading(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────
  const openEditModal = (item) => {
    if (item.listed) return toast.error("Cancel the listing first before editing");
    setEditItem(item);
    setEditName(item.name || "");
    setEditDesc(item.description || "");
    setEditCategory(item.category || ALL_CATEGORIES[1]);
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
    const categoryChanged = editCategory && editCategory !== editItem.category;
    try {
      setEditLoading(true);
      const form = new FormData();
      form.append("name", editName.trim());
      form.append("description", editDesc.trim());
      if (editCategory) form.append("category", editCategory);
      if (editFile) form.append("image", editFile);

      const { data } = await axios.put(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collection/${editItem.parentId}/sub-collection/${editItem._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      if (categoryChanged) {
        setAllItems((prev) => prev.filter((i) => i._id !== editItem._id));
      } else {
        setAllItems((prev) =>
          prev.map((i) =>
            i._id === editItem._id
              ? { ...i, name: editName.trim(), description: editDesc.trim(), image: data.subCollection?.image || i.image }
              : i
          )
        );
      }
      toast.success(categoryChanged ? "Item moved to new category" : "Item updated");
      setEditItem(null);

      if (categoryChanged && wallet) {
        axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${encodeURIComponent(wallet)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then((res) => {
          if (res.data.success) {
            const items = (res.data.nfts || []).flatMap((col) =>
              (col.subCollections || [])
                .filter((sub) => sub.owner?.toLowerCase() === wallet.toLowerCase())
                .map((item) => ({ ...item, parentId: col._id, category: col.category || "general" }))
            );
            setAllItems(items);
          }
        });
      }
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

  const inputStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" };
  const inputCls   = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none placeholder-white/25 focus:border-blue-500 transition-all";

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
              const aType = item.assetType || (item.isNFA ? "NFA" : "NFT");
              const badge = ASSET_BADGE[aType] || ASSET_BADGE.NFT;
              const isOnChain = !!item.tokenId;
              const isAnywhere = item.listed || item.onAuction || item.onTrade;
              return (
                <div key={item._id}
                  className="rounded-xl border overflow-hidden flex flex-col transition-all hover:brightness-110"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: isAnywhere ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)" }}>
                  <div className="relative h-[200px] sm:h-[220px]">
                    <img src={img} alt={item.name} className="w-full h-full object-cover object-top"
                      onError={(e) => { e.target.src = Collectionimage; }} />

                    {/* Asset type badge — top left */}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text }}>
                      {aType}
                    </span>

                    {/* Venue status badges — top right, stacked */}
                    <div className="absolute top-2 right-2 flex flex-col gap-0.5 items-end">
                      {item.listed && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-green-300"
                          style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}>
                          Market
                        </span>
                      )}
                      {item.onAuction && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300"
                          style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                          Auction
                        </span>
                      )}
                      {item.onTrade && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-300"
                          style={{ background: "rgba(0,80,255,0.15)", border: "1px solid rgba(0,80,255,0.3)" }}>
                          Trade
                        </span>
                      )}
                    </div>

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
                    {item.listed && item.priceETH > 0 && (
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
                      <button onClick={() => setUnlistItem(item)}
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

      {/* ── Multi-step List Modal ── */}
      {listingItem && listStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d1a] p-6 flex flex-col gap-4">

            {/* Step dots */}
            <ListingSteps step={listStep} />

            {/* ── Step 1: Marketplace price ── */}
            {listStep === "marketplace" && (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-white font-semibold text-base">List on Marketplace</h2>
                    <p className="text-white/40 text-xs mt-0.5">No gas fee now — minted on-chain when someone buys.</p>
                  </div>
                  <button onClick={closeListing} className="text-white/40 hover:text-white transition-colors mt-0.5"><FiX size={18} /></button>
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
                  <button onClick={closeListing}
                    className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">
                    Cancel
                  </button>
                  <button onClick={handleList} disabled={listingLoading}
                    className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
                    {listingLoading ? "Listing..." : "List Now →"}
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2a: Auction prompt ── */}
            {listStep === "auction_prompt" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-green-300 text-sm font-medium">Listed on Marketplace!</span>
                </div>

                <div className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Gavel className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-semibold text-sm">Also list on Auction?</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Auction listings let buyers bid competitively. You set a start price and duration.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setListStep("trade_prompt")}
                    className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">
                    No, skip
                  </button>
                  <button onClick={() => setListStep("auction_form")}
                    className="flex-1 h-10 rounded-lg text-white text-sm font-semibold transition-all"
                    style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)" }}>
                    Yes, set up →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2b: Auction form ── */}
            {listStep === "auction_form" && (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-400" />
                    <h2 className="text-white font-semibold text-base">Set Up Auction</h2>
                  </div>
                  <button onClick={() => setListStep("trade_prompt")} className="text-white/40 hover:text-white transition-colors"><FiX size={16} /></button>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/4 border border-white/6">
                  <img src={listingItem.image ? getImageUrl(listingItem.image) : Collectionimage} alt={listingItem.name}
                    className="w-8 h-8 rounded object-cover" onError={(e) => { e.target.src = Collectionimage; }} />
                  <p className="text-white/70 text-xs font-medium truncate">{listingItem.name}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Start Price (USDC) <span className="text-red-400">*</span></label>
                    <input type="number" placeholder="e.g. 50" min="0" value={auctionForm.startPrice}
                      onChange={(e) => setAuctionForm(f => ({ ...f, startPrice: e.target.value }))}
                      className={inputCls} style={inputStyle} autoFocus />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Duration</label>
                    <select value={auctionForm.durationHours}
                      onChange={(e) => setAuctionForm(f => ({ ...f, durationHours: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                      <option value="24">24 hours</option>
                      <option value="72">3 days</option>
                      <option value="168">7 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Instant Buy Price (USDC) <span className="text-white/25">optional</span></label>
                    <input type="number" placeholder="Allows immediate purchase" min="0" value={auctionForm.instantBuyPrice}
                      onChange={(e) => setAuctionForm(f => ({ ...f, instantBuyPrice: e.target.value }))}
                      className={inputCls} style={inputStyle} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setListStep("trade_prompt")}
                    className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all text-sm">
                    Skip
                  </button>
                  <button onClick={handleCreateAuction} disabled={auctionLoading}
                    className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    style={{ background: "rgba(251,191,36,0.25)", border: "1px solid rgba(251,191,36,0.45)" }}>
                    {auctionLoading ? "Creating..." : "Create Auction →"}
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3a: Trade prompt ── */}
            {listStep === "trade_prompt" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-green-300 text-sm font-medium">
                    {listingItem && allItems.find(i => i._id === listingItem._id)?.onAuction
                      ? "Listed on Marketplace & Auction!"
                      : "Listed on Marketplace!"}
                  </span>
                </div>

                <div className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ background: "rgba(0,80,255,0.07)", border: "1px solid rgba(0,80,255,0.2)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 font-semibold text-sm">Also list for Trading?</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Trade listings let other players propose item-for-item exchanges with you.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setListStep("hire_prompt")}
                    className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">
                    No, skip
                  </button>
                  <button onClick={() => setListStep("trade_form")}
                    className="flex-1 h-10 rounded-lg text-white text-sm font-semibold transition-all"
                    style={{ background: "rgba(0,80,255,0.25)", border: "1px solid rgba(0,80,255,0.4)" }}>
                    Yes, set up →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3b: Trade form ── */}
            {listStep === "trade_form" && (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                    <h2 className="text-white font-semibold text-base">Set Up Trade</h2>
                  </div>
                  <button onClick={() => setListStep("hire_prompt")} className="text-white/40 hover:text-white transition-colors"><FiX size={16} /></button>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/4 border border-white/6">
                  <img src={listingItem.image ? getImageUrl(listingItem.image) : Collectionimage} alt={listingItem.name}
                    className="w-8 h-8 rounded object-cover" onError={(e) => { e.target.src = Collectionimage; }} />
                  <div>
                    <p className="text-white/70 text-xs font-medium truncate">Offering: <span className="text-green-300">{listingItem.name}</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Open offer toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setTradeForm(f => ({ ...f, openOffer: !f.openOffer, reqItem: f.openOffer ? f.reqItem : "" }))}
                      className={`w-8 h-4 rounded-full transition-all relative ${tradeForm.openOffer ? "bg-blue-600" : "bg-white/15"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${tradeForm.openOffer ? "left-4.5 left-[18px]" : "left-0.5"}`} />
                    </div>
                    <span className="text-white/60 text-xs">Open offer — let anyone propose what they'll give</span>
                  </label>

                  {!tradeForm.openOffer && (
                    <div>
                      <label className="text-white/60 text-xs font-medium mb-1 block">What do you want in return? <span className="text-red-400">*</span></label>
                      <input type="text" placeholder="e.g. Rare Weapon Skin, Land Plot #42..." value={tradeForm.reqItem}
                        onChange={(e) => setTradeForm(f => ({ ...f, reqItem: e.target.value }))}
                        className={inputCls} style={inputStyle} autoFocus />
                    </div>
                  )}

                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Description <span className="text-white/25">optional</span></label>
                    <textarea rows={2} placeholder="Add any details about your trade..." value={tradeForm.description}
                      onChange={(e) => setTradeForm(f => ({ ...f, description: e.target.value }))}
                      className={`${inputCls} resize-none`} style={inputStyle} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setListStep("hire_prompt")}
                    className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all text-sm">
                    Skip
                  </button>
                  <button onClick={handleCreateTrade} disabled={tradeLoading}
                    className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}>
                    {tradeLoading ? "Creating..." : "Post Trade →"}
                  </button>
                </div>
              </>
            )}

            {/* ── Step 4a: Hire prompt ── */}
            {listStep === "hire_prompt" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-green-300 text-sm font-medium">Almost done!</span>
                </div>

                <div className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.22)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-300 text-base">🔑</span>
                    <span className="text-purple-300 font-semibold text-sm">Also list for Hire?</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Let other players rent this item for a set duration and price. It stays yours — they just use it temporarily.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={closeListing}
                    className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">
                    No, done
                  </button>
                  <button onClick={() => setListStep("hire_form")}
                    className="flex-1 h-10 rounded-lg text-white text-sm font-semibold transition-all"
                    style={{ background: "rgba(168,85,247,0.25)", border: "1px solid rgba(168,85,247,0.45)" }}>
                    Yes, set up →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 4b: Hire form ── */}
            {listStep === "hire_form" && (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-300 text-base">🔑</span>
                    <h2 className="text-white font-semibold text-base">Set Up Hire Listing</h2>
                  </div>
                  <button onClick={closeListing} className="text-white/40 hover:text-white transition-colors"><FiX size={16} /></button>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/4 border border-white/6">
                  <img src={listingItem.image ? getImageUrl(listingItem.image) : Collectionimage} alt={listingItem.name}
                    className="w-8 h-8 rounded object-cover" onError={(e) => { e.target.src = Collectionimage; }} />
                  <p className="text-white/70 text-xs font-medium truncate">{listingItem.name}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Price per Duration (USDC) <span className="text-red-400">*</span></label>
                    <div className="flex h-10 rounded-lg bg-white/5 border border-white/10 focus-within:border-purple-500 transition-all overflow-hidden">
                      <input type="number" placeholder="e.g. 10" min="0" value={hireForm.pricePerDuration}
                        onChange={(e) => setHireForm(f => ({ ...f, pricePerDuration: e.target.value }))}
                        className="flex-1 bg-transparent px-3 text-white text-sm outline-none placeholder-white/30" autoFocus />
                      <span className="flex items-center pr-3 text-white/30 text-sm font-medium">USDC</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-medium mb-1 block">Hire Duration</label>
                    <select value={hireForm.durationHours}
                      onChange={(e) => setHireForm(f => ({ ...f, durationHours: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, appearance: "none" }}>
                      <option value="8">8 hours</option>
                      <option value="24">24 hours (1 day)</option>
                      <option value="72">3 days</option>
                      <option value="168">7 days</option>
                      <option value="720">30 days</option>
                    </select>
                  </div>
                  <p className="text-white/25 text-[10px]">20% commission applies on each rental. Item stays in your wallet.</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={closeListing}
                    className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all text-sm">
                    Skip
                  </button>
                  <button onClick={handleCreateHire} disabled={hireLoading}
                    className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    style={{ background: "rgba(168,85,247,0.3)", border: "1px solid rgba(168,85,247,0.5)" }}>
                    {hireLoading ? "Listing..." : "List for Hire →"}
                  </button>
                </div>
              </>
            )}

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

            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all text-sm capitalize appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffffff60' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                {ALL_CATEGORIES.filter(c => c !== "all").map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0d0d1a] capitalize">{cat}</option>
                ))}
              </select>
              {editCategory !== editItem?.category && (
                <p className="text-yellow-400/60 text-[11px] mt-1">Item will be moved to the new category storage box.</p>
              )}
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

      {/* ── Unlist Confirmation Modal ── */}
      {unlistItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d1a] p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <FiAlertTriangle size={18} className="text-orange-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">Unlist Item</h2>
                  <p className="text-white/40 text-xs mt-0.5">This will remove all active listings.</p>
                </div>
              </div>
              <button onClick={() => setUnlistItem(null)} className="text-white/40 hover:text-white transition-colors"><FiX size={18} /></button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
              <img src={unlistItem.image ? getImageUrl(unlistItem.image) : Collectionimage} alt={unlistItem.name}
                className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = Collectionimage; }} />
              <div>
                <p className="text-white text-sm font-medium">{unlistItem.name}</p>
                <p className="text-white/40 text-xs capitalize">{unlistItem.category}</p>
              </div>
            </div>

            <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-3 flex flex-col gap-1.5">
              <p className="text-orange-300 text-xs font-semibold uppercase tracking-wide">What will be cancelled</p>
              <ul className="text-white/60 text-sm space-y-1 mt-1">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />Marketplace listing</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />Any active auction for this item</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />Any open trade offers for this item</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setUnlistItem(null)}
                className="flex-1 h-10 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleConfirmUnlist} disabled={unlistLoading}
                className="flex-1 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                style={{ background: "rgba(234,88,12,0.8)", border: "1px solid rgba(234,88,12,0.4)" }}>
                {unlistLoading ? "Unlisting..." : "Unlist All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NFTs;
