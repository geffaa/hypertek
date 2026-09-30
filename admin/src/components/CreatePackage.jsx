import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { FiUploadCloud, FiImage, FiArrowLeft, FiInfo, FiPlus, FiX } from "react-icons/fi";
import { Dashboard_Base_Url, getImageUrl } from "../Config";
import ImageCropModal from "./common/ImageCropModal";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/30 text-sm";
const labelClass = "text-white/70 text-sm font-medium mb-1.5 block";

const ASSET_COLORS = {
  NFA: "bg-amber-500/15 text-amber-300",
  NFC: "bg-purple-500/15 text-purple-300",
  NFT: "bg-white/10 text-white/60",
};

function CreatePackage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get("id");
  const admin = useSelector((state) => state.admin.admin);
  const token = localStorage.getItem("token");

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [selected, setSelected] = useState([]); // [{ parentId, subCollectionId, ...display }]

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropFileName, setCropFileName] = useState("");
  const [originalFile, setOriginalFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(Boolean(editingId));

  // ── Pricing preview (server-computed) ───────────────────────────────────────
  const [preview, setPreview] = useState(null);
  const [pricing, setPricing] = useState(false);

  // ── Item picker ─────────────────────────────────────────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerItems, setPickerItems] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  // ── Load an existing package when editing ───────────────────────────────────
  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/packages/${editingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pkg = res.data.data;
        setName(pkg.name || "");
        setDescription(pkg.description || "");
        setBadge(pkg.badge || "");
        setPriceInput(String(pkg.priceUSD ?? ""));
        setExistingImage(pkg.image || "");
        setSelected(
          (pkg.items || []).map((i) => ({
            parentId: String(i.parentId),
            subCollectionId: String(i.subCollectionId),
            name: i.name,
            image: i.image,
            assetType: i.assetType,
            priceETH: i.basePriceUSD,
            minimumBuybackUSD: i.floorUSD,
          })),
        );
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load package");
      } finally {
        setLoadingPackage(false);
      }
    })();
  }, [editingId, token]);

  // ── Live pricing: ask the server to split the price across the items ────────
  // Debounced because it runs on every keystroke in the price field.
  const debounceRef = useRef(null);
  const runPreview = useCallback(() => {
    if (selected.length === 0 || !priceInput) {
      setPreview(null);
      return;
    }
    setPricing(true);
    axios
      .post(
        `${Dashboard_Base_Url}/v1/admin/packages/preview-pricing`,
        {
          items: selected.map((s) => ({
            parentId: s.parentId,
            subCollectionId: s.subCollectionId,
          })),
          priceUSD: Number(priceInput),
          excludePackageId: editingId || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then((res) => setPreview(res.data.data))
      .catch((err) => {
        setPreview(null);
        toast.error(err.response?.data?.message || "Could not price this package");
      })
      .finally(() => setPricing(false));
  }, [selected, priceInput, editingId, token]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runPreview, 400);
    return () => clearTimeout(debounceRef.current);
  }, [runPreview]);

  // ── Item picker ─────────────────────────────────────────────────────────────
  const openPicker = async () => {
    setPickerOpen(true);
    setPickerLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (pickerSearch) params.set("search", pickerSearch);
      const res = await axios.get(`${Dashboard_Base_Url}/v1/admin/nfa/items?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPickerItems(res.data.data || []);
    } catch {
      toast.error("Failed to load items");
    } finally {
      setPickerLoading(false);
    }
  };

  const toggleItem = (item) => {
    const id = String(item._id);
    setSelected((prev) =>
      prev.some((s) => s.subCollectionId === id)
        ? prev.filter((s) => s.subCollectionId !== id)
        : [
            ...prev,
            {
              parentId: String(item.parentId),
              subCollectionId: id,
              name: item.name,
              image: item.image,
              assetType: item.assetType,
              priceETH: item.priceETH,
              minimumBuybackUSD: item.minimumBuybackUSD,
            },
          ],
    );
  };

  const removeItem = (subCollectionId) =>
    setSelected((prev) => prev.filter((s) => s.subCollectionId !== subCollectionId));

  // ── Image ───────────────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image file");
    if (file.size > 25 * 1024 * 1024) return toast.error("Image must be under 25MB");
    setOriginalFile(file);
    setCropFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = (croppedFile) => {
    setCropSrc(null);
    setImageFile(croppedFile);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(croppedFile);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const blockedItems = preview?.blocked || [];
  const canSave =
    Boolean(name.trim()) &&
    selected.length > 0 &&
    Boolean(priceInput) &&
    preview?.ok === true &&
    !saving;

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Package name is required");
    if (selected.length === 0) return toast.error("Add at least one item");
    if (!priceInput || Number(priceInput) <= 0) return toast.error("Set a package price");
    if (!preview?.ok) return toast.error(preview?.message || "Fix the pricing before saving");

    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("description", description.trim());
      form.append("badge", badge.trim());
      form.append("priceUSD", String(Number(priceInput)));
      form.append(
        "items",
        JSON.stringify(
          selected.map((s) => ({
            parentId: s.parentId,
            subCollectionId: s.subCollectionId,
          })),
        ),
      );
      if (imageFile) form.append("image", imageFile);
      else if (existingImage) form.append("image", existingImage);

      const url = `${Dashboard_Base_Url}/v1/admin/packages${editingId ? `/${editingId}` : ""}`;
      const method = editingId ? "put" : "post";

      const res = await axios[method](url, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      toast.success(res.data?.message || "Package saved");
      navigate(`/${admin?._id}/packages`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.blocked?.length) {
        toast.error(`${data.blocked[0].itemName || "An item"}: ${data.blocked[0].reason}`, {
          duration: 6000,
        });
      } else {
        toast.error(data?.message || "Failed to save package");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingPackage) {
    return <div className="px-4 md:px-10 pt-10 text-white/40 text-sm">Loading package…</div>;
  }

  const previewImage = imagePreview || (existingImage ? getImageUrl(existingImage) : null);

  return (
    <div className="px-4 md:px-10 pt-6 pb-16">
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          fileName={cropFileName}
          originalFile={originalFile}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-[22px]">
            {editingId ? "Edit Package" : "Create Package"}
          </h1>
          <p className="text-white/40 text-xs mt-0.5">
            Bundle items you have already created and sell them together at a discount.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT — image */}
        <div className="lg:w-[280px] flex-shrink-0">
          <p className={labelClass}>Package Image</p>
          <div
            className={`relative w-full aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group
              ${dragOver ? "border-blue-500 bg-blue-500/10" : previewImage ? "border-white/20" : "border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/5"}`}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById("admin-package-img").click()}
          >
            {previewImage ? (
              <>
                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <FiUploadCloud size={24} className="text-white" />
                  <span className="text-white text-xs font-medium">Change Image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FiImage size={20} className="text-white/40" />
                </div>
                <div>
                  <p className="text-white/60 text-sm font-medium">Drop image here</p>
                  <p className="text-white/30 text-xs mt-1">or click to browse</p>
                </div>
                <p className="text-white/20 text-[11px]">PNG, JPG, WebP · max 25MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              id="admin-package-img"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 flex flex-col gap-5">
          <div>
            <label className={labelClass}>
              Package Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Starter Pack"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              placeholder="What is in this package…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-500 transition-all placeholder-white/30 text-sm resize-none"
            />
          </div>

          <div>
            <label className={labelClass}>
              Badge <span className="text-white/30 font-normal text-[11px]">(optional label on the card)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Best Value"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* ── Items ─────────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`${labelClass} mb-0`}>
                Items in this package <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={openPicker}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiPlus size={13} /> Add items
              </button>
            </div>

            {selected.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
                <p className="text-white/30 text-sm">No items yet</p>
                <button
                  type="button"
                  onClick={openPicker}
                  className="text-[#4d7aff] text-xs font-semibold mt-1 hover:underline cursor-pointer"
                >
                  Pick items to bundle
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selected.map((item) => {
                  const blocked = blockedItems.find(
                    (b) => String(b.subCollectionId) === item.subCollectionId,
                  );
                  const warning = (preview?.warnings || []).find(
                    (w) => String(w.subCollectionId) === item.subCollectionId,
                  );
                  return (
                    <div
                      key={item.subCollectionId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                        blocked ? "border-red-500/40 bg-red-500/5" : "border-white/8 bg-white/[0.02]"
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt=""
                          className="w-9 h-9 rounded object-cover border border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-white/5 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{item.name}</p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ASSET_COLORS[item.assetType] || ASSET_COLORS.NFT}`}
                          >
                            {item.assetType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-white/40 text-[11px]">
                            ${Number(item.priceETH || 0).toFixed(2)}
                          </span>
                          {Number(item.minimumBuybackUSD) > 0 && (
                            <span className="text-amber-400/70 text-[11px]">
                              floor ${Number(item.minimumBuybackUSD).toFixed(2)}
                            </span>
                          )}
                        </div>
                        {blocked ? (
                          <p className="text-red-400 text-[11px] mt-1">{blocked.reason}</p>
                        ) : warning ? (
                          <p className="text-amber-400/70 text-[11px] mt-1">{warning.reason}</p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.subCollectionId)}
                        className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <FiX size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Pricing ───────────────────────────────────────────────────── */}
          <div
            className="flex flex-col gap-4 px-4 py-4 rounded-xl border border-amber-500/20"
            style={{ background: "rgba(245,158,11,0.05)" }}
          >
            <p className="text-amber-300/80 text-xs font-semibold flex items-center gap-1.5">
              <FiInfo size={13} /> Package Pricing
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Package Price (USD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 250.00"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className={`${inputClass} pl-7`}
                  />
                </div>
                <p className="text-white/25 text-[11px] mt-1">What the buyer pays for everything</p>
              </div>

              <div>
                <label className={labelClass}>Normally</label>
                <div className="h-10 flex items-center gap-2">
                  <span className="text-white/40 text-sm line-through">
                    ${Number(preview?.basePriceTotalUSD ?? 0).toFixed(2)}
                  </span>
                  {preview?.discountPercent > 0 && (
                    <span className="text-green-400 text-sm font-bold">
                      save {preview.discountPercent}%
                    </span>
                  )}
                </div>
                <p className="text-white/25 text-[11px] mt-1">Sum of the items on their own</p>
              </div>
            </div>

            {/* The floor rule made visible. This is what stops a package being
                saved at a price that would fail at delivery time. */}
            {preview && !preview.pricingOk && preview.minFeasiblePriceUSD > 0 && (
              <div className="px-3 py-2.5 rounded-lg border border-red-500/40 bg-red-500/10">
                <p className="text-red-300 text-xs font-semibold">
                  This package cannot be priced below ${Number(preview.minFeasiblePriceUSD).toFixed(2)}
                </p>
                <p className="text-red-300/70 text-[11px] mt-1">
                  Its items carry guaranteed minimum buy-backs, and a package can never sell for
                  less than those add up to.
                </p>
              </div>
            )}

            {/* Per-item split, so the admin can see exactly where the discount lands */}
            {preview?.allocations?.length > 0 && preview.pricingOk && (
              <div className="rounded-lg border border-white/8 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["Item", "Normal", "Floor", "In this package"].map((h) => (
                        <th key={h} className="px-3 py-2 text-white/40 font-semibold text-[10px] uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.allocations.map((a) => (
                      <tr key={a.subCollectionId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-3 py-2 text-white/80 text-xs truncate max-w-[180px]">{a.name}</td>
                        <td className="px-3 py-2 text-white/40 text-xs">${Number(a.basePriceUSD).toFixed(2)}</td>
                        <td className="px-3 py-2 text-amber-400/70 text-xs">
                          {Number(a.floorUSD) > 0 ? `$${Number(a.floorUSD).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-white text-xs font-semibold">
                          ${Number(a.allocatedPriceUSD).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pricing && <p className="text-white/30 text-[11px]">Calculating…</p>}
          </div>

          {/* Info */}
          <div
            className="px-4 py-3 rounded-lg"
            style={{ background: "rgba(0,42,168,0.10)", border: "1px solid rgba(0,80,255,0.18)" }}
          >
            <p className="text-white/70 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <FiInfo size={12} /> How packages work
            </p>
            <ul className="text-white/40 text-[11px] space-y-1 leading-relaxed">
              <li>• A package is saved as a draft first. Activate it from the Packages page when it is ready.</li>
              <li>• Items in a package are reserved for it and cannot be listed individually at the same time.</li>
              <li>• The discount is spread across the items, but never below any item's guaranteed buy-back.</li>
              <li>• Items with limited editions can be sold in a package more than once, up to their supply.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5 mt-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 h-10 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium cursor-pointer"
            >
              <FiArrowLeft size={14} /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSave}
              className="flex items-center gap-2 px-6 h-10 rounded-lg text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              style={{
                background: !canSave ? "rgba(255,255,255,0.05)" : "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                border: "1px solid rgba(0,80,255,0.3)",
              }}
            >
              {saving ? "Saving…" : editingId ? "Save Changes" : "Save as Draft →"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Item picker modal ────────────────────────────────────────────── */}
      {pickerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
          <div
            className="rounded-xl border border-white/10 w-full max-w-[720px] max-h-[80vh] flex flex-col"
            style={{ background: "#0d0e1f" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="text-white font-semibold text-base">Add items to the package</h2>
              <button
                onClick={() => setPickerOpen(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-white/8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  openPicker();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search items…"
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="px-4 h-10 rounded-lg text-xs font-semibold bg-[#002AA8] text-white flex-shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {pickerLoading ? (
                <p className="text-white/40 text-sm text-center py-10">Loading items…</p>
              ) : pickerItems.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-10">No items found</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {pickerItems.map((item) => {
                    const id = String(item._id);
                    const isSelected = selected.some((s) => s.subCollectionId === id);
                    const isListed = Boolean(item.listed);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "border-[#002AA8] bg-[#002AA8]/15"
                            : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-[#002AA8] border-[#002AA8]" : "border-white/25"
                          }`}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>

                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt=""
                            className="w-9 h-9 rounded object-cover border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-white/5 flex-shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium truncate">{item.name}</p>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ASSET_COLORS[item.assetType] || ASSET_COLORS.NFT}`}
                            >
                              {item.assetType}
                            </span>
                            {isListed && (
                              <span className="text-amber-400/60 text-[10px]">
                                will be unlisted when the package goes live
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-white/40 text-[11px]">
                              ${Number(item.priceETH || 0).toFixed(2)}
                            </span>
                            {Number(item.minimumBuybackUSD) > 0 && (
                              <span className="text-amber-400/70 text-[11px]">
                                floor ${Number(item.minimumBuybackUSD).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
              <span className="text-white/40 text-xs">{selected.length} selected</span>
              <button
                onClick={() => setPickerOpen(false)}
                className="px-5 h-9 rounded-lg text-white text-sm font-semibold cursor-pointer"
                style={{
                  background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                  border: "1px solid rgba(0,80,255,0.3)",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePackage;
