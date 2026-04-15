import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, FRONTEND_BASE_URL } from "../Config";

/* ─── Icons ──────────────────────────────────────────────────── */
const IconSave = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);
const IconCheck = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconSearch = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconExtLink = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);
const IconUpload = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);
const IconClose = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/* ─── Section meta ────────────────────────────────────────────── */
const SECTION_META = {
    home_hero:         {
        icon: "🏠",
        label: "Welcome Banner",
        zone: "Homepage — very top",
        description: "The first thing visitors see. Edit the main title, subtitle, and the two action buttons.",
        what: "Main title · Subtitle · 2 buttons",
    },
    home_story:        {
        icon: "📖",
        label: "Story Section",
        zone: "Homepage — below welcome banner",
        description: "The background image, the center character, and the two story text columns.",
        what: "Background image · Character image · Left text · Right text",
    },
    home_about:        {
        icon: "📄",
        label: "About Section (legacy)",
        zone: "Homepage — About block",
        description: "An older About block. Currently not visible on the live site.",
        what: "Text · Image",
    },
    home_how_it_works: {
        icon: "⚙️",
        label: "How It Works",
        zone: "Homepage — step-by-step section",
        description: "The numbered step cards that explain how visitors get started (Connect Wallet, Explore, etc.).",
        what: "Section title · Step cards",
    },
    marketplace_banner: {
        icon: "🏪",
        label: "Marketplace Banner",
        zone: "Marketplace page — very top",
        description: "The heading and description shown at the top of the Marketplace page.",
        what: "Heading · Description",
    },
    profile_banner:    {
        icon: "👤",
        label: "Profile Banner",
        zone: "Every user's profile page",
        description: "The wide background image that appears at the top of every user profile.",
        what: "Background image",
    },
    about_top:         {
        icon: "🎯",
        label: "About — Top Section",
        zone: "About page — very top",
        description: "The main heading, subtitle, and hero image at the top of the About page.",
        what: "Heading · Subtitle · Hero image",
    },
    about_story:       {
        icon: "📜",
        label: "About — Our Story",
        zone: "About page — story blocks",
        description: "Three story blocks, each with its own image and text.",
        what: "3 × (image + text)",
    },
    about_war:         {
        icon: "⚔️",
        label: "About — Three Fronts of War",
        zone: "About page — game modes",
        description: "Three cards showing the game modes: HyperQuest, Racing, and Overlord.",
        what: "3 game-mode cards · Side image",
    },
    about_ecosystem:   {
        icon: "🌐",
        label: "About — Our Ecosystem",
        zone: "About page — features",
        description: "Three feature cards highlighting NFA, Game, and Marketplace.",
        what: "3 feature cards",
    },
};

/* ─── Field hints ─────────────────────────────────────────────── */
const FIELD_HINTS = {
    heading_line1:     "First line of the big heading shown at the top of this section.",
    heading_line2:     "Second line of the big heading (continues from line 1).",
    cta_button_1_text: "The text label on the first button (e.g. 'Explore Now').",
    cta_button_1_link: "The page or URL the first button opens when clicked (e.g. /market-place).",
    cta_button_2_text: "The text label on the second button.",
    cta_button_2_link: "The page or URL the second button opens when clicked.",
    background_image:  "The large background image that fills the entire section.",
    character_image:   "The character or focal image shown in the middle of the section.",
    vertical_label:    "A small sideways label on the left edge — usually decorative.",
    title:             "The main title shown at the top of this section.",
    body:              "The main body text. You can write multiple sentences here.",
    image_left:        "The large image on the left side.",
    image_right_1:     "The smaller image in the top-right area.",
    image_right_2:     "The smaller image in the bottom-right area.",
    section_title:     "The section heading shown above all other content.",
    section_subtitle:  "A short supporting line shown just below the section heading.",
    steps:             "The numbered step cards. Edit each card's title and description individually.",
    heading:           "The main heading for this section.",
    description:       "The paragraph of text shown below the heading.",
    subtitle:          "A supporting line shown below the main heading.",
    bg_image:          "The background image that fills this section.",
    char_image:        "The character or feature image used as the visual focal point.",
    story_image:       "The image for the first story block.",
    story2_image:      "The image for the second story block.",
    story3_image:      "The image for the third story block.",
    story2_body:       "The paragraph of text for the second story block.",
    story3_body:       "The paragraph of text for the third story block.",
    war_items:         "The three game-mode cards. Edit each card's title and description.",
    war_image:         "The image displayed beside the game-mode cards.",
    ecosystem_items:   "The three ecosystem feature cards (NFA, Game, Marketplace).",
    left_heading:      "The large heading shown in the left column.",
    left_subheading:   "A short tagline below the left column heading.",
    left_body:         "The body paragraph in the left column.",
    right_heading:     "The large heading shown in the right column.",
    right_subheading:  "A short tagline below the right column heading.",
    right_body:        "The body paragraph in the right column.",
};

/* ─── Page groups ─────────────────────────────────────────────── */
const PAGE_GROUP_META = {
    home:        { label: "Home Page",   icon: "🏠", description: "Main website homepage",  path: "/" },
    marketplace: { label: "Marketplace", icon: "🏪", description: "Marketplace page",       path: "/market-place" },
    profile:     { label: "Profile",     icon: "👤", description: "User profile page",      path: "/profile" },
    about:       { label: "About",       icon: "📄", description: "About page",             path: "/about" },
};

/* ─── Text field ──────────────────────────────────────────────── */
function TextField({ field, onChange }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">{field.label}</label>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/45 text-sm leading-relaxed border-l-2 border-blue-500/30 pl-3">{FIELD_HINTS[field.key]}</p>
            )}
            <input
                type="text"
                value={field.value || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={`Type the ${field.label.toLowerCase()} here...`}
                className="bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition-all placeholder:text-white/25"
            />
        </div>
    );
}

/* ─── Textarea field ──────────────────────────────────────────── */
function TextAreaField({ field, onChange }) {
    const charCount = (field.value || "").length;
    return (
        <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">{field.label}</label>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/45 text-sm leading-relaxed border-l-2 border-blue-500/30 pl-3">{FIELD_HINTS[field.key]}</p>
            )}
            <textarea
                value={field.value || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                rows={5}
                placeholder={`Type the ${field.label.toLowerCase()} here...`}
                className="bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition-all resize-none placeholder:text-white/25 leading-relaxed"
            />
            <p className="text-white/30 text-xs text-right">{charCount} characters</p>
        </div>
    );
}

/* ─── Image field ─────────────────────────────────────────────── */
function ImageField({ field, sectionKey, onUploaded }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(field.value || "");

    useEffect(() => { setPreview(field.value || ""); }, [field.value]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
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
                toast.success(`"${field.label}" image uploaded successfully!`);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.error || "Upload failed. Please try again.";
            toast.error(msg);
            setPreview(field.value || "");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">{field.label}</label>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/45 text-sm leading-relaxed border-l-2 border-blue-500/30 pl-3">{FIELD_HINTS[field.key]}</p>
            )}
            <div
                onClick={() => !uploading && fileRef.current?.click()}
                className="relative cursor-pointer rounded-xl overflow-hidden group transition-all"
                style={{
                    height: 220,
                    border: `2px dashed ${preview ? "rgba(255,255,255,0.15)" : "rgba(99,102,241,0.40)"}`,
                    background: preview ? "rgba(0,0,0,0.2)" : "rgba(99,102,241,0.04)",
                }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt={field.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <IconUpload />
                            </div>
                            <div className="text-center">
                                <p className="text-white text-sm font-semibold">Replace Image</p>
                                <p className="text-white/60 text-xs mt-1">Click to choose a new file</p>
                            </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Image set
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 group-hover:bg-indigo-500/5 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400/70 group-hover:border-indigo-400/40 transition-colors">
                            <IconUpload />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-white/70 text-sm font-semibold">Click here to upload an image</p>
                            <p className="text-white/35 text-xs mt-1.5">Accepted formats: PNG, JPG, WebP</p>
                            <p className="text-white/25 text-xs mt-0.5">Recommended: at least 1200px wide for best quality</p>
                        </div>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                        <div className="w-10 h-10 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
                        <p className="text-white text-sm font-medium">Uploading image...</p>
                        <p className="text-white/40 text-xs">Please wait, do not close this page</p>
                    </div>
                )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
    );
}

/* ─── List field ──────────────────────────────────────────────── */
function ListField({ field, onChange }) {
    const items = Array.isArray(field.value) ? field.value : [];
    const updateItem = (index, key, val) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [key]: val };
        onChange(field.key, updated);
    };
    return (
        <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">{field.label}</label>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/45 text-sm leading-relaxed border-l-2 border-blue-500/30 pl-3">{FIELD_HINTS[field.key]}</p>
            )}
            <div className="flex flex-col gap-3 mt-1">
                {items.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-white/10 p-4 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/25 border border-blue-500/25 flex items-center justify-center text-blue-300 text-xs font-bold shrink-0">
                                {idx + 1}
                            </div>
                            <span className="text-white/50 text-xs font-medium">Item {idx + 1}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-white/60 text-xs font-medium uppercase tracking-wide">Title</label>
                            <input
                                type="text"
                                value={item.title || ""}
                                onChange={(e) => updateItem(idx, "title", e.target.value)}
                                placeholder="Enter the item title..."
                                className="bg-white/[0.06] border border-white/12 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/15 transition-all placeholder:text-white/20"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-white/60 text-xs font-medium uppercase tracking-wide">Description</label>
                            <textarea
                                value={item.description || ""}
                                onChange={(e) => updateItem(idx, "description", e.target.value)}
                                placeholder="Enter the item description..."
                                rows={2}
                                className="bg-white/[0.06] border border-white/12 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/15 resize-none transition-all placeholder:text-white/20"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Section edit body (shared by SectionCard + EditDrawer) ──── */
function SectionEditBody({ section, onSave }) {
    const [fields, setFields] = useState(section.fields || []);
    const [saving, setSaving]   = useState(false);
    const [saved,  setSaved]    = useState(false);

    const meta = SECTION_META[section.sectionKey] || {
        icon: "📄", label: section.sectionLabel,
        zone: section.sectionLabel, description: "Edit the content for this section.", what: "",
    };

    useEffect(() => { setFields(section.fields || []); }, [section]);

    const handleFieldChange = (key, value) => {
        setSaved(false);
        setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = fields
                .filter((f) => f.type !== "image")
                .map((f) => ({ key: f.key, value: f.value }));
            const res = await axios.put(
                `${Dashboard_Base_Url}/v1/site-content/${section.sectionKey}`,
                { fields: updates }
            );
            if (res.data.success) {
                toast.success(`"${meta.label}" saved! Your website has been updated.`);
                setSaved(true);
                setTimeout(() => setSaved(false), 5000);
                onSave?.(res.data.section);
            }
        } catch {
            toast.error("Could not save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const textFields  = fields.filter((f) => f.type === "text" || f.type === "textarea");
    const imageFields = fields.filter((f) => f.type === "image");
    const listFields  = fields.filter((f) => f.type === "list");

    return (
        <div className="flex flex-col gap-8">
            {/* "Where is this?" banner */}
            <div className="px-4 py-3.5 rounded-xl border border-blue-500/20" style={{ background: "rgba(37,99,235,0.07)" }}>
                <p className="text-blue-200 text-sm font-semibold mb-1">{meta.zone}</p>
                <p className="text-white/50 text-sm leading-relaxed">{meta.description}</p>
            </div>

            {/* Text fields */}
            {textFields.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest shrink-0">Text & Content</p>
                        <div className="h-px flex-1 bg-white/8" />
                    </div>
                    <div className="flex flex-col gap-6">
                        {textFields.map((field) =>
                            field.type === "text"
                                ? <TextField key={field.key} field={field} onChange={handleFieldChange} />
                                : <TextAreaField key={field.key} field={field} onChange={handleFieldChange} />
                        )}
                    </div>
                </div>
            )}

            {/* Image fields */}
            {imageFields.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest shrink-0">Images</p>
                        <div className="h-px flex-1 bg-white/8" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {imageFields.map((field) => (
                            <ImageField
                                key={field.key}
                                field={field}
                                sectionKey={section.sectionKey}
                                onUploaded={handleFieldChange}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* List fields */}
            {listFields.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest shrink-0">Cards & Items</p>
                        <div className="h-px flex-1 bg-white/8" />
                    </div>
                    <div className="flex flex-col gap-6">
                        {listFields.map((field) => (
                            <ListField key={field.key} field={field} onChange={handleFieldChange} />
                        ))}
                    </div>
                </div>
            )}

            {/* Save row */}
            <div className="flex flex-col gap-3 pt-2 border-t border-white/8">
                {saved ? (
                    <div className="flex items-center gap-2.5 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                        <svg className="w-5 h-5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <div>
                            <p className="text-emerald-400 text-sm font-semibold">Changes saved!</p>
                            <p className="text-white/40 text-xs mt-0.5">Your website has been updated and is visible to visitors now.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                        <svg className="w-5 h-5 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-white/40 text-sm">When you click <strong className="text-white/60">Save Changes</strong>, your updates will go live on the website immediately.</p>
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        saved
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                            : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                    }`}
                >
                    {saving ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving changes...</>
                    ) : saved ? (
                        <><IconCheck /> Saved — all good!</>
                    ) : (
                        <><IconSave /> Save Changes</>
                    )}
                </button>
            </div>
        </div>
    );
}

/* ─── Edit drawer ─────────────────────────────────────────────── */
function EditDrawer({ section, onClose, onSave }) {
    const meta = SECTION_META[section?.sectionKey] || {
        icon: "📄", label: section?.sectionLabel || "Section",
    };

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0"
                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)", zIndex: 9998 }}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                className="fixed right-0 top-0 bottom-0 flex flex-col w-full sm:max-w-[480px]"
                style={{
                    zIndex: 9999,
                    background: "#0d0e16",
                    borderLeft: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
                    animation: "slideInFromRight 0.25s cubic-bezier(0.22, 0.61, 0.36, 1)",
                }}
            >
                {/* Drawer header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 shrink-0"
                    style={{ background: "rgba(59,130,246,0.06)" }}>
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/25 flex items-center justify-center text-lg shrink-0">
                        {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-base leading-tight">{meta.label}</p>
                        <p className="text-white/40 text-xs mt-0.5">Click Save Changes when done</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0"
                        title="Close (Esc)"
                    >
                        <IconClose />
                    </button>
                </div>

                {/* Hint bar */}
                <div className="px-6 py-2.5 border-b border-white/6 flex items-center gap-2 shrink-0"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <svg className="w-3.5 h-3.5 text-blue-400/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white/35 text-xs">Press <kbd className="bg-white/10 text-white/50 px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd> or click outside to close without saving.</p>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <SectionEditBody section={section} onSave={onSave} />
                </div>
            </div>

            <style>{`
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); opacity: 0.5; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </>,
        document.body
    );
}

/* ─── Main page ───────────────────────────────────────────────── */
export default function WebsiteEditor() {
    const [sections,           setSections]           = useState([]);
    const [loading,            setLoading]            = useState(true);
    const [activeTab,          setActiveTab]          = useState("home");
    const [searchQuery,        setSearchQuery]        = useState("");
    const viewMode = "live";
    const [selectedSection,    setSelectedSection]    = useState(null);
    const [iframeKey,          setIframeKey]          = useState(0);   // bump to reload iframe
    const [iframeLoading,      setIframeLoading]      = useState(true);
    const iframeRef = useRef(null);

    useEffect(() => { fetchSections(); }, []);

    const fetchSections = async () => {
        try {
            const res = await axios.get(`${Dashboard_Base_Url}/v1/site-content`);
            if (res.data.success) setSections(res.data.sections);
        } catch {
            toast.error("Could not load content. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    // Keep a ref to sections so the message handler always sees latest data
    const sectionsRef = useRef(sections);
    useEffect(() => { sectionsRef.current = sections; }, [sections]);

    // Listen for section-click messages coming from the live-site iframe
    useEffect(() => {
        const handleMessage = (e) => {
            if (!e.data || e.data.type !== "hypertek-section-click") return;
            const sectionKey = e.data.key;
            const section = sectionsRef.current.find((s) => s.sectionKey === sectionKey);
            if (section) {
                setSelectedSection(section);
            } else {
                // Section key received but not found — log for debugging
                console.warn("[WebsiteEditor] Section not found for key:", sectionKey,
                    "| Available:", sectionsRef.current.map(s => s.sectionKey));
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []); // register once — uses ref for latest sections

    const handleSectionSave = (updated) => {
        setSections((prev) => prev.map((s) => s.sectionKey === updated.sectionKey ? updated : s));
        setSelectedSection((prev) => prev?.sectionKey === updated.sectionKey ? updated : prev);
        // In live mode: tell the iframe to clear its CMS cache then reload
        if (viewMode === "live") {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: "hypertek-refresh" }, "*");
            }
            // Give the iframe 300ms to clear cache, then reload it
            setTimeout(() => {
                setIframeLoading(true);
                setIframeKey((k) => k + 1);
            }, 300);
        }
    };

    const pageGroups = useMemo(() => [...new Set(sections.map((s) => s.pageGroup))], [sections]);

    const filteredSections = useMemo(() => {
        let list = sections.filter((s) => s.pageGroup === activeTab);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((s) =>
                s.sectionLabel.toLowerCase().includes(q) ||
                s.sectionKey.toLowerCase().includes(q) ||
                s.fields?.some((f) =>
                    f.label?.toLowerCase().includes(q) ||
                    (typeof f.value === "string" && f.value.toLowerCase().includes(q))
                )
            );
        }
        return list;
    }, [sections, activeTab, searchQuery]);



    const handleDrawerClose = () => setSelectedSection(null);

    const handleTabChange = (group) => {
        setActiveTab(group);
        setSearchQuery("");
        setSelectedSection(null);
    };

    // Build the live-site URL for the current page tab (with editor flag)
    const liveSiteUrl = useMemo(() => {
        const path = PAGE_GROUP_META[activeTab]?.path || "/";
        return `${FRONTEND_BASE_URL}${path}?_hedit=1`;
    }, [activeTab]);

    // Reload iframe when page tab changes in live mode
    useEffect(() => {
        if (viewMode === "live") {
            setIframeLoading(true);
            setIframeKey((k) => k + 1);
            setSelectedSection(null);
        }
    }, [activeTab, viewMode]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-white/50 text-base">Loading editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16">
            <div className="max-w-[1100px] mx-auto">

                {/* Page header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-white font-bold text-2xl mb-1.5">Website Content Editor</h1>
                        <p className="text-white/50 text-base">
                            You are looking at the real website. <strong className="text-white/70">Hover any section</strong> to highlight it — <strong className="text-white/70">click to edit</strong>.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0 self-start"
                        style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)" }}>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300 text-sm font-semibold">Live Site</span>
                    </div>
                </div>

                {/* Page tabs (shared between modes) */}
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                    {pageGroups.map((group) => {
                        const gm = PAGE_GROUP_META[group] || { label: group, icon: "📄" };
                        const isActive = activeTab === group;
                        const subs = sections.filter((s) => s.pageGroup === group);
                        const missingImgs = subs.reduce((acc, s) =>
                            acc + (s.fields?.filter(f => f.type === "image" && !f.value).length || 0), 0);
                        return (
                            <button
                                key={group}
                                onClick={() => handleTabChange(group)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 flex items-center gap-2 transition-all ${
                                    isActive
                                        ? "bg-blue-600/20 text-white border border-blue-500/30"
                                        : "text-white/50 hover:text-white border border-transparent hover:bg-white/5"
                                }`}
                            >
                                {gm.icon} {gm.label}
                                {missingImgs > 0 && <span className="text-amber-400 text-xs">⚠</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Active page bar + view live (hidden in live mode) */}
                {viewMode !== "live" && (
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-xl">{PAGE_GROUP_META[activeTab]?.icon || "📄"}</span>
                            <div>
                                <p className="text-white font-bold text-base">{PAGE_GROUP_META[activeTab]?.label || activeTab}</p>
                                <p className="text-white/35 text-xs">{filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""} on this page</p>
                            </div>
                        </div>
                        {PAGE_GROUP_META[activeTab]?.path && (
                            <a
                                href={`${FRONTEND_BASE_URL}${PAGE_GROUP_META[activeTab].path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/12 text-white/50 hover:text-white hover:border-white/25 transition-all"
                            >
                                <IconExtLink /> View Live Page
                            </a>
                        )}
                    </div>
                )}

                {/* Search (hidden in live mode) */}
                {viewMode !== "live" && (
                    <div className="relative mb-5">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                            <IconSearch />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setSelectedSection(null); }}
                            placeholder="Search for a section by name..."
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/25"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                            >✕</button>
                        )}
                    </div>
                )}

                {/* ── LIVE SITE MODE ── */}
                {(
                    <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(16,185,129,0.25)" }}>
                        {/* Toolbar bar above iframe */}
                        <div className="flex items-center gap-3 px-4 py-2.5"
                            style={{ background: "rgba(16,185,129,0.08)", borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
                            {/* Traffic-light dots */}
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                            </div>
                            {/* URL bar */}
                            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/40 font-mono"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="truncate">{liveSiteUrl.replace("?_hedit=1", "")}</span>
                            </div>
                            {/* Reload button */}
                            <button
                                onClick={() => { setIframeLoading(true); setIframeKey((k) => k + 1); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                                title="Reload page"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reload
                            </button>
                        </div>

                        {/* iframe spinner overlay */}
                        {iframeLoading && (
                            <div className="absolute inset-0 top-[44px] flex flex-col items-center justify-center gap-3 z-10"
                                style={{ background: "#0a0b10" }}>
                                <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
                                <p className="text-white/40 text-sm">Loading live site…</p>
                            </div>
                        )}

                        {/* The actual iframe */}
                        <iframe
                            key={iframeKey}
                            ref={iframeRef}
                            src={liveSiteUrl}
                            title="Live Site Editor"
                            onLoad={() => setIframeLoading(false)}
                            className="w-full block"
                            style={{
                                height: "calc(100vh - 220px)",
                                minHeight: 600,
                                border: "none",
                                background: "#060610",
                            }}
                            // Allow same-origin scripts; needed for postMessage to work
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                )}

            </div>

            {/* Edit drawer */}
            {selectedSection && (
                <EditDrawer
                    section={selectedSection}
                    onClose={handleDrawerClose}
                    onSave={handleSectionSave}
                />
            )}
        </div>
    );
}
