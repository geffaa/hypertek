import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../../Config";
import FullScreenLoader from "../../Components/Common/Spinner";

function UploadNFC() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [collections, setCollections] = useState([]);
  const [parentId, setParentId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch available parent collections for the dropdown
  useEffect(() => {
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`)
      .then((res) => {
        if (res.data?.collections) setCollections(res.data.collections);
      })
      .catch(() => toast.error("Failed to load collections"));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parentId) return toast.error("Please select a collection");
    if (!name.trim()) return toast.error("Name is required");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("parentId", parentId);
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      if (imageFile) formData.append("image", imageFile);

      await axios.post(`${BACKEND_BASE_URL}/api/v1/nft/user-upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("NFC uploaded successfully!");
      navigate("/dashboard/collections");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-white/30 rounded-lg px-4 py-3 text-sm text-white " +
    "hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 outline-none";

  return (
    <div className="p-4 md:p-8 pb-16 flex flex-col gap-6 max-w-2xl mx-auto">
      {loading && <FullScreenLoader />}

      <div>
        <h1 className="text-white text-2xl font-semibold mb-1">Upload NFC</h1>
        <p className="text-gray-400 text-sm">
          Upload your NFC into an existing collection. No in-game bonus until a license is assigned (Phase 3).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Image Upload */}
        <div>
          <label className="block text-white font-medium mb-2">Image</label>
          <div
            className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="mx-auto max-h-48 rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                  +
                </div>
                <p className="text-gray-400 text-sm">
                  Drag & drop or <span className="text-blue-400 underline">browse</span>
                </p>
                <p className="text-gray-500 text-xs">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Collection */}
        <div>
          <label className="block text-white font-medium mb-2">Collection *</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className={inputClass + " bg-[#0a0a1a]"}
            required
          >
            <option value="">Select a collection</option>
            {collections.map((col) => (
              <option key={col._id} value={col._id}>
                {col.collection?.name} ({col.category})
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block text-white font-medium mb-2">NFC Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= 50) setName(e.target.value);
            }}
            placeholder="e.g. Fire Dragon #001"
            className={inputClass}
            required
          />
          <p className="text-gray-500 text-xs mt-1">{name.length}/50</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-white font-medium mb-2">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFC (optional)"
            className={inputClass}
          />
        </div>

        {/* Info box */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
          <p className="font-medium mb-1">ℹ️ What happens after upload?</p>
          <ul className="list-disc list-inside text-xs text-blue-400 space-y-1">
            <li>Your NFC will appear in the selected collection</li>
            <li>No blockchain mint — no gas required</li>
            <li>In-game bonuses require a license (coming in Phase 3)</li>
            <li>You can list it for sale once it's uploaded</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-[#002AA8] hover:bg-[#001f7a] disabled:opacity-50 transition-colors text-white font-medium text-sm"
          >
            Upload NFC
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadNFC;
