import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";
import FullScreenLoader from "../components/common/Spinner";
import ImageCropModal from "../components/common/ImageCropModal";

const CARD = {
  background: "#0c0c18",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
};

function clip(str, n) {
  return str?.length > n ? str.slice(0, n) + "…" : (str || "");
}

function NewsPreview({ image, heading, description }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.04)" }}>
        {image ? (
          <img src={image} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-xs">No image</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,16,0.6) 0%, transparent 60%)" }} />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
          {date}
        </span>
        <h3 className="font-bold text-white text-[14px] leading-snug" style={{ fontFamily: "Goldman, sans-serif" }}>
          {clip(heading || "Your headline will appear here…", 65)}
        </h3>
        <p className="text-white/50 text-[12px] leading-relaxed">
          {clip(description || "Your description will appear here…", 110)}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#38bdf8", fontFamily: "Orbitron, sans-serif" }}>
          <span>Read</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 4h10M7 1l4 3-4 3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function UpdateNews() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [loading,      setLoading]      = useState(false);
  const [heading,      setHeading]      = useState("");
  const [description,  setDescription]  = useState("");
  const [preview,      setPreview]      = useState(null);
  const [file,         setFile]         = useState(null);
  const [cropSrc,      setCropSrc]      = useState(null);
  const [cropFileName, setCropFileName] = useState("");

  const handleFileSelect = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setCropFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(f);
  };

  const handleCropConfirm = (croppedFile) => {
    setCropSrc(null);
    setFile(croppedFile);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(croppedFile);
  };

  const handlePublish = async () => {
    if (!heading.trim())      { toast.error("Heading is required"); return; }
    if (!description.trim())  { toast.error("Description is required"); return; }
    if (!file)                { toast.error("Cover image is required"); return; }
    if (!Dashboard_Base_Url)  { toast.error("Base URL is required"); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append("heading",     heading.trim());
    formData.append("description", description.trim());
    formData.append("image",       file);

    try {
      const res = await axios.post(
        `${Dashboard_Base_Url}/v1/news/create`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.success) {
        toast.success("News published!");
        navigate(-1);
      } else {
        toast.error(res.data.message || "Failed to publish");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <>
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          fileName={cropFileName}
          aspect={16 / 9}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="w-full pb-16">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-white font-semibold text-[25px] leading-tight mb-1">Upload News</h1>
          <p className="text-white/40 text-sm">Share important updates and announcements with your audience.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Form ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Image upload */}
            <div style={{ ...CARD, padding: 16 }}>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Cover Image <span className="text-red-400">*</span></p>
              <div
                className="relative overflow-hidden flex items-center justify-center rounded-xl cursor-pointer group transition-all"
                style={{
                  height: 200,
                  border: "2px dashed rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.02)",
                }}
                onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
                onDragOver={e => e.preventDefault()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                      <span className="text-white text-xs font-semibold">Click to replace</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center px-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,42,168,0.3)" }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                        <path d="M12 5v14M5 12l7-7 7 7" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-white/60 text-sm"><span className="text-blue-400 font-semibold">Click to upload</span> or drag & drop</p>
                    <p className="text-white/30 text-xs">Recommended: 16:9 ratio · JPEG / PNG</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFileSelect(e.target.files[0])}
                />
              </div>
            </div>

            {/* Heading */}
            <div style={{ ...CARD, padding: 16 }}>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                Heading <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={heading}
                onChange={e => setHeading(e.target.value)}
                placeholder="News headline…"
                className="w-full h-11 px-4 rounded-lg text-white text-sm focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(0,80,255,0.6)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            {/* Description */}
            <div style={{ ...CARD, padding: 16 }}>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Write the article content…"
                rows={8}
                className="w-full px-4 py-3 rounded-lg text-white text-sm focus:outline-none transition-all resize-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={e => { e.target.style.borderColor = "rgba(0,80,255,0.6)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="flex-shrink-0" style={{ width: "min(320px, 100%)" }}>
            <div style={{ ...CARD, padding: 16 }}>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Preview</p>
              <NewsPreview image={preview} heading={heading} description={description} />
              <p className="text-white/25 text-[11px] mt-3 text-center">As it appears on the news page</p>
            </div>
          </div>
        </div>

        {/* ── Footer buttons ── */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
          >
            Publish
          </button>
        </div>
      </div>
    </>
  );
}

export default UpdateNews;
