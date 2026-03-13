import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, Image_Base_Url } from "../Config";

// ─── Reusable field editors ────────────────────────────────────
function TextField({ field, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">{field.label}</label>
            <input
                type="text"
                value={field.value || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
        </div>
    );
}

function TextAreaField({ field, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-white text-sm font-medium">{field.label}</label>
            <textarea
                value={field.value || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                rows={4}
                className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
        </div>
    );
}

function ImageField({ field, sectionKey, onUploaded }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(field.value || "");

    useEffect(() => {
        setPreview(field.value || "");
    }, [field.value]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // local preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("fieldKey", field.key);

            const res = await axios.post(
                `${Dashboard_Base_Url}/v1/site-content/${sectionKey}/upload-image`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.data.success) {
                setPreview(res.data.imageUrl);
                onUploaded(field.key, res.data.imageUrl);
                toast.success(`${field.label} uploaded!`);
            }
        } catch (err) {
            console.error("Upload error:", err);
            const msg = err.response?.data?.detail || err.response?.data?.error || "Upload failed";
            toast.error(msg);
            setPreview(field.value || "");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">{field.label}</label>
            <div
                onClick={() => fileRef.current?.click()}
                className="relative cursor-pointer rounded-lg border-2 border-dashed border-white/20 hover:border-blue-500 transition-colors overflow-hidden flex items-center justify-center bg-white/5"
                style={{ width: "100%", maxWidth: "300px", height: "180px" }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt={field.label}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">Click to upload</span>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
    );
}

function ListField({ field, onChange }) {
    const items = Array.isArray(field.value) ? field.value : [];

    const updateItem = (index, key, val) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [key]: val };
        onChange(field.key, updated);
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-white text-sm font-medium">{field.label}</label>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-2"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-xs font-bold w-6">#{idx + 1}</span>
                        <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) => updateItem(idx, "title", e.target.value)}
                            placeholder="Title"
                            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <textarea
                        value={item.description || ""}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    />
                </div>
            ))}
        </div>
    );
}

// ─── Section Card ──────────────────────────────────────────────
function SectionCard({ section, onSave }) {
    const [fields, setFields] = useState(section.fields || []);
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setFields(section.fields || []);
    }, [section]);

    const handleFieldChange = (key, value) => {
        setFields((prev) =>
            prev.map((f) => (f.key === key ? { ...f, value } : f))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = fields
                .filter((f) => f.type !== "image") // images are uploaded separately
                .map((f) => ({ key: f.key, value: f.value }));

            const res = await axios.put(
                `${Dashboard_Base_Url}/v1/site-content/${section.sectionKey}`,
                { fields: updates }
            );

            if (res.data.success) {
                toast.success(`"${section.sectionLabel}" saved!`);
                onSave?.(res.data.section);
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/10 rounded-xl overflow-hidden">
            {/* Header — click to expand */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div>
                    <h3 className="text-white font-semibold text-base">
                        {section.sectionLabel}
                    </h3>
                    <span className="text-gray-500 text-xs">{section.sectionKey}</span>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Body */}
            {expanded && (
                <div className="px-5 pb-5 flex flex-col gap-4 border-t border-white/5 pt-4">
                    {fields.map((field) => {
                        switch (field.type) {
                            case "text":
                                return <TextField key={field.key} field={field} onChange={handleFieldChange} />;
                            case "textarea":
                                return <TextAreaField key={field.key} field={field} onChange={handleFieldChange} />;
                            case "image":
                                return (
                                    <ImageField
                                        key={field.key}
                                        field={field}
                                        sectionKey={section.sectionKey}
                                        onUploaded={handleFieldChange}
                                    />
                                );
                            case "list":
                                return <ListField key={field.key} field={field} onChange={handleFieldChange} />;
                            default:
                                return null;
                        }
                    })}

                    {/* Save button */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-[#002AA8] hover:bg-[#003BD4] text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function WebsiteEditor() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("home");

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const res = await axios.get(`${Dashboard_Base_Url}/v1/site-content`);
            if (res.data.success) {
                setSections(res.data.sections);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    const handleSectionSave = (updatedSection) => {
        setSections((prev) =>
            prev.map((s) =>
                s.sectionKey === updatedSection.sectionKey ? updatedSection : s
            )
        );
    };

    const filteredSections = sections.filter((s) => s.pageGroup === activeTab);
    const pageGroups = [...new Set(sections.map((s) => s.pageGroup))];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-3 border-white/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-6 overflow-hidden">

            <div className="relative z-10 max-w-[900px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-white font-bold text-2xl font-inter">
                        Website Content Editor
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Edit text and images for each section of the website. Changes are
                        live immediately after saving.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {pageGroups.map((group) => (
                        <button
                            key={group}
                            onClick={() => setActiveTab(group)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === group
                                ? "bg-[#002AA8] text-white"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {group} Page
                        </button>
                    ))}
                </div>

                {/* Section Cards */}
                <div className="flex flex-col gap-4">
                    {filteredSections.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg mb-2">No content sections found</p>
                            <p className="text-sm">
                                Run the seed script first:{" "}
                                <code className="bg-white/10 px-2 py-0.5 rounded text-xs">
                                    node scripts/seedSiteContent.js
                                </code>
                            </p>
                        </div>
                    ) : (
                        filteredSections.map((section) => (
                            <SectionCard
                                key={section.sectionKey}
                                section={section}
                                onSave={handleSectionSave}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
