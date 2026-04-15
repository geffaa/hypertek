import { useState, useEffect, useRef, useMemo } from "react";
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
const IconChevron = ({ open }) => (
    <svg className={`w-5 h-5 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2">
                    <span className="text-blue-400 text-sm mt-px shrink-0">💡</span>
                    <p className="text-blue-200/70 text-sm leading-relaxed">{FIELD_HINTS[field.key]}</p>
                </div>
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
                <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2">
                    <span className="text-blue-400 text-sm mt-px shrink-0">💡</span>
                    <p className="text-blue-200/70 text-sm leading-relaxed">{FIELD_HINTS[field.key]}</p>
                </div>
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
                <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2">
                    <span className="text-blue-400 text-sm mt-px shrink-0">💡</span>
                    <p className="text-blue-200/70 text-sm leading-relaxed">{FIELD_HINTS[field.key]}</p>
                </div>
            )}
            {/* Upload area */}
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
                        {/* Set badge */}
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
                <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2">
                    <span className="text-blue-400 text-sm mt-px shrink-0">💡</span>
                    <p className="text-blue-200/70 text-sm leading-relaxed">{FIELD_HINTS[field.key]}</p>
                </div>
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

/* ─── Section card ────────────────────────────────────────────── */
function SectionCard({ section, onSave, isHighlighted, defaultExpanded = false }) {
    const [fields, setFields] = useState(section.fields || []);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expanded, setExpanded] = useState(defaultExpanded);
    const cardRef = useRef(null);

    const meta = SECTION_META[section.sectionKey] || {
        icon: "📄",
        label: section.sectionLabel,
        zone: section.sectionLabel,
        description: "Edit the content for this section.",
        what: "",
    };

    useEffect(() => { setFields(section.fields || []); }, [section]);

    useEffect(() => {
        if (isHighlighted && cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            setExpanded(true);
        }
    }, [isHighlighted]);

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
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Could not save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const textFields  = fields.filter((f) => f.type === "text" || f.type === "textarea");
    const imageFields = fields.filter((f) => f.type === "image");
    const listFields  = fields.filter((f) => f.type === "list");
    const missingImages = imageFields.filter((f) => !f.value).length;

    return (
        <div
            ref={cardRef}
            id={`section-${section.sectionKey}`}
            className={`rounded-2xl overflow-hidden transition-all duration-200 ${
                isHighlighted ? "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#0a0b10]" : ""
            }`}
            style={{
                background: "rgba(255,255,255,0.03)",
                border: expanded ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.08)",
            }}
        >
            {/* Card header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-white/[0.025] transition-colors cursor-pointer"
            >
                <span className="text-2xl shrink-0 leading-none">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-bold text-base">{meta.label}</p>
                        {missingImages > 0 && (
                            <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full font-medium">
                                ⚠ {missingImages} image{missingImages > 1 ? "s" : ""} missing
                            </span>
                        )}
                        {saved && (
                            <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                Saved
                            </span>
                        )}
                    </div>
                    <p className="text-white/45 text-sm mt-0.5">
                        <span className="text-white/25">📍</span> {meta.zone}
                    </p>
                    {!expanded && meta.what && (
                        <p className="text-white/30 text-xs mt-1.5">Contains: {meta.what}</p>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-white/35 text-sm hidden sm:block">
                        {expanded ? "Close" : "Edit"}
                    </span>
                    <IconChevron open={expanded} />
                </div>
            </button>

            {/* Card body */}
            {expanded && (
                <div className="border-t border-white/8">

                    {/* "Where is this?" banner */}
                    <div className="mx-6 mt-5 mb-6 px-4 py-3.5 rounded-xl border border-blue-500/20 flex items-start gap-3" style={{ background: "rgba(37,99,235,0.07)" }}>
                        <span className="text-xl shrink-0 mt-0.5">{meta.icon}</span>
                        <div>
                            <p className="text-blue-200 text-sm font-semibold">{meta.label}</p>
                            <p className="text-white/50 text-sm mt-1 leading-relaxed">{meta.description}</p>
                        </div>
                    </div>

                    <div className="px-6 pb-6 flex flex-col gap-8">

                        {/* Text fields */}
                        {textFields.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-base shrink-0">✏️</div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">Text & Content</p>
                                        <p className="text-white/35 text-xs">Edit the words shown on your website</p>
                                    </div>
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
                                    <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-base shrink-0">🖼️</div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">Images</p>
                                        <p className="text-white/35 text-xs">Upload or replace images shown in this section</p>
                                    </div>
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
                                    <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-base shrink-0">📋</div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">Repeating Cards / Items</p>
                                        <p className="text-white/35 text-xs">Edit each card's title and description individually</p>
                                    </div>
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
                </div>
            )}
        </div>
    );
}

/* ─── Main page ───────────────────────────────────────────────── */
export default function WebsiteEditor() {
    const [sections,  setSections]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedSection, setHighlightedSection] = useState(null);

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

    const handleSectionSave = (updated) => {
        setSections((prev) => prev.map((s) => s.sectionKey === updated.sectionKey ? updated : s));
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

    const handleQuickNav = (sectionKey) => {
        setHighlightedSection(sectionKey);
        setTimeout(() => setHighlightedSection(null), 2500);
    };

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
                <div className="mb-8">
                    <h1 className="text-white font-bold text-2xl mb-2">Website Content Editor</h1>
                    <p className="text-white/50 text-base">
                        Use this page to update any text, image, or content on your website — no coding needed.
                    </p>
                </div>

                {/* Quick guide banner */}
                <div className="rounded-2xl border border-white/8 p-5 mb-8 flex flex-col sm:flex-row gap-4" style={{ background: "rgba(255,255,255,0.025)" }}>
                    <div className="flex-1">
                        <p className="text-white font-semibold text-sm mb-3">How to edit content</p>
                        <ol className="flex flex-col gap-2.5">
                            {[
                                { num: "1", text: "Choose a page tab below (Home, Marketplace, About…)" },
                                { num: "2", text: "Find the section you want to edit and click on it to open" },
                                { num: "3", text: "Update the text or upload a new image" },
                                { num: "4", text: "Click the blue Save Changes button — your website updates instantly" },
                            ].map((step) => (
                                <li key={step.num} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{step.num}</span>
                                    <span className="text-white/60 text-sm leading-relaxed">{step.text}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="sm:border-l sm:border-white/8 sm:pl-5 flex flex-col justify-center gap-2">
                        <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-wide">⚠ Good to know</p>
                        <p className="text-white/40 text-sm leading-relaxed">Changes go live on your website as soon as you save. Visitors will see the update immediately.</p>
                    </div>
                </div>

                <div className="flex gap-6">

                    {/* Sidebar — page navigation */}
                    <div className="hidden lg:block w-[200px] shrink-0">
                        <div className="sticky top-4">
                            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Choose a page</p>
                            <div className="flex flex-col gap-1">
                                {pageGroups.map((group) => {
                                    const gm = PAGE_GROUP_META[group] || { label: group, icon: "📄" };
                                    const isActive = activeTab === group;
                                    const subs = sections.filter((s) => s.pageGroup === group);
                                    const missingImgs = subs.reduce((acc, s) =>
                                        acc + (s.fields?.filter(f => f.type === "image" && !f.value).length || 0), 0);
                                    return (
                                        <div key={group}>
                                            <button
                                                onClick={() => { setActiveTab(group); setSearchQuery(""); }}
                                                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all ${
                                                    isActive
                                                        ? "bg-blue-600/20 text-white border border-blue-500/30"
                                                        : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                                                }`}
                                            >
                                                <span className="text-base">{gm.icon}</span>
                                                <span className="font-semibold text-sm flex-1">{gm.label}</span>
                                                {missingImgs > 0 && (
                                                    <span className="text-amber-400 text-xs shrink-0">⚠</span>
                                                )}
                                            </button>
                                            {isActive && (
                                                <div className="ml-4 mt-1 mb-2 flex flex-col gap-0.5 border-l-2 border-blue-500/20 pl-3">
                                                    {subs.map((s) => {
                                                        const sm = SECTION_META[s.sectionKey];
                                                        return (
                                                            <button
                                                                key={s.sectionKey}
                                                                onClick={() => handleQuickNav(s.sectionKey)}
                                                                className="text-left text-xs text-white/40 hover:text-white/80 py-1.5 transition-colors"
                                                            >
                                                                {sm?.icon || "·"} {sm?.label || s.sectionLabel}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                        {/* Mobile tabs */}
                        <div className="lg:hidden flex gap-2 mb-5 overflow-x-auto pb-1">
                            {pageGroups.map((group) => {
                                const gm = PAGE_GROUP_META[group] || { label: group, icon: "📄" };
                                return (
                                    <button
                                        key={group}
                                        onClick={() => { setActiveTab(group); setSearchQuery(""); }}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 flex items-center gap-2 transition-all ${
                                            activeTab === group
                                                ? "bg-blue-600/20 text-white border border-blue-500/30"
                                                : "bg-white/5 text-white/50 border border-transparent"
                                        }`}
                                    >
                                        {gm.icon} {gm.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Page bar: active page + search + view live */}
                        <div className="flex items-center gap-3 mb-5">
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

                        {/* Search */}
                        <div className="relative mb-5">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                <IconSearch />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                        {/* Section cards */}
                        <div className="flex flex-col gap-3">
                            {filteredSections.length === 0 ? (
                                <div className="text-center py-16 rounded-2xl border border-white/6" style={{ background: "rgba(255,255,255,0.015)" }}>
                                    {searchQuery ? (
                                        <>
                                            <p className="text-3xl mb-3">🔍</p>
                                            <p className="text-white/50 text-base font-semibold">No matching sections found</p>
                                            <p className="text-white/30 text-sm mt-1.5">Try searching with a different word</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-3xl mb-3">📭</p>
                                            <p className="text-white/50 text-base font-semibold">No sections available for this page</p>
                                            <p className="text-white/30 text-sm mt-1.5">Contact the technical team to set up content for this page</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                filteredSections.map((section, idx) => (
                                    <SectionCard
                                        key={section.sectionKey}
                                        section={section}
                                        onSave={handleSectionSave}
                                        isHighlighted={highlightedSection === section.sectionKey}
                                        defaultExpanded={filteredSections.length <= 2 || idx === 0}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
