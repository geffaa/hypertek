import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url, FRONTEND_BASE_URL } from "../Config";

/* ─── Icons ──────────────────────────────────────────────────── */
const IconSave = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);
const IconCheck = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconSearch = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconChevron = ({ open }) => (
    <svg className={`w-4 h-4 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);
const IconText = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
    </svg>
);
const IconImage = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
);
const IconList = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);
const IconExtLink = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

/* ─── Section meta ────────────────────────────────────────────── */
// Satu accent color (#2563EB) untuk semua section — warna hanya dipakai
// untuk indikator semantik (hijau=ok, kuning=warning, merah=error).
const SECTION_META = {
    home_hero:         { icon: "🏠", zone: "Homepage — bagian PALING ATAS",        description: "Heading utama + 2 tombol yang tampil pertama kali saat pengunjung buka website" },
    home_story:        { icon: "📖", zone: "Homepage — Story Section (di bawah hero)", description: "Gambar background, karakter tengah, dan dua kolom teks cerita" },
    home_about:        { icon: "📄", zone: "Homepage — About (legacy)",             description: "Bagian About HyperTek dengan teks dan gambar (tidak aktif)" },
    home_how_it_works: { icon: "⚙️",  zone: "Homepage — 'How It Works'",            description: "Kartu langkah-langkah: Connect Wallet, Explore, dll." },
    marketplace_banner:{ icon: "🏪", zone: "Marketplace — banner paling atas",     description: "Heading dan deskripsi di bagian atas halaman Marketplace" },
    profile_banner:    { icon: "👤", zone: "Halaman Profile User",                  description: "Gambar background yang muncul di atas profil setiap pengguna" },
    about_top:         { icon: "🎯", zone: "About Page — bagian PALING ATAS",       description: "Heading, subjudul, dan gambar hero di halaman About" },
    about_story:       { icon: "📜", zone: "About Page — Our Story",               description: "3 blok cerita masing-masing dengan gambar + teks" },
    about_war:         { icon: "⚔️", zone: "About Page — Three Fronts of War",     description: "3 kartu mode game: HyperQuest, Racing, Overlord" },
    about_ecosystem:   { icon: "🌐", zone: "About Page — Our Ecosystem",           description: "3 kartu fitur: NFA, Game, Marketplace" },
};

/* ─── Field hints ─────────────────────────────────────────────── */
const FIELD_HINTS = {
    heading_line1:     "Baris pertama heading besar (contoh: 'Hyper Tek 100:')",
    heading_line2:     "Baris kedua heading besar (contoh: 'WHERE LEGENDS Are Forged.')",
    cta_button_1_text: "Teks label tombol pertama",
    cta_button_1_link: "Link URL ketika tombol pertama diklik (contoh: '/market-place')",
    cta_button_2_text: "Teks label tombol kedua",
    cta_button_2_link: "Link URL ketika tombol kedua diklik",
    background_image:  "Gambar latar belakang full-width",
    character_image:   "Gambar karakter yang tampil di tengah section",
    vertical_label:    "Teks kecil di samping kiri (rotated)",
    title:             "Judul utama section ini",
    body:              "Teks paragraf utama — bisa beberapa baris",
    image_left:        "Gambar besar di sisi kiri",
    image_right_1:     "Gambar kecil pertama di sisi kanan",
    image_right_2:     "Gambar kecil kedua di sisi kanan",
    section_title:     "Judul yang tampil di atas section",
    section_subtitle:  "Teks singkat di bawah judul section",
    steps:             "Daftar kartu langkah — masing-masing punya judul dan deskripsi",
    heading:           "Teks judul utama section ini",
    description:       "Paragraf teks di bawah judul",
    subtitle:          "Teks pendukung di bawah judul utama",
    bg_image:          "Gambar latar belakang full-width section ini",
    char_image:        "Gambar karakter sebagai focal point",
    story_image:       "Gambar untuk blok cerita pertama",
    story2_image:      "Gambar untuk blok cerita kedua",
    story3_image:      "Gambar untuk blok cerita ketiga",
    story2_body:       "Teks untuk blok cerita kedua",
    story3_body:       "Teks untuk blok cerita ketiga",
    war_items:         "Daftar kartu mode game — masing-masing punya judul dan deskripsi",
    war_image:         "Gambar di samping section mode game",
    ecosystem_items:   "Daftar kartu ekosistem (NFA, Game, Marketplace)",
    left_heading:      "Heading besar di kolom kiri",
    left_subheading:   "Tagline kecil di bawah heading kiri",
    left_body:         "Paragraf teks di kolom kiri",
    right_heading:     "Heading besar di kolom kanan",
    right_subheading:  "Tagline kecil di bawah heading kanan",
    right_body:        "Paragraf teks di kolom kanan",
};

/* ─── Page groups ─────────────────────────────────────────────── */
const PAGE_GROUP_META = {
    home:        { label: "Home Page",   icon: "🏠", description: "Halaman utama website",  path: "/" },
    marketplace: { label: "Marketplace", icon: "🏪", description: "Halaman marketplace",    path: "/market-place" },
    profile:     { label: "Profile",     icon: "👤", description: "Halaman profil pengguna", path: "/profile" },
    about:       { label: "About",       icon: "📄", description: "Halaman About",           path: "/about" },
};

/* ─── Page map (visual layout guide) ─────────────────────────── */
const PAGE_MAP = {
    home: [
        { key: "home_hero",          num: 1, label: "Hero Banner",   hint: "Heading utama + 2 tombol — tampil paling atas" },
        { key: "home_story",         num: 2, label: "Story Section", hint: "Gambar background + teks cerita kiri & kanan" },
        { key: "home_how_it_works",  num: 3, label: "How It Works",  hint: "Kartu langkah-langkah di bawah story" },
    ],
    marketplace: [
        { key: "marketplace_banner", num: 1, label: "Marketplace Banner", hint: "Heading + deskripsi di paling atas" },
    ],
    profile: [
        { key: "profile_banner",     num: 1, label: "Profile Banner",     hint: "Gambar background di halaman profil user" },
    ],
    about: [
        { key: "about_top",          num: 1, label: "Top Section",    hint: "Heading + gambar hero paling atas" },
        { key: "about_story",        num: 2, label: "Our Story",      hint: "3 blok cerita dengan gambar" },
        { key: "about_war",          num: 3, label: "Three Fronts",   hint: "3 kartu mode game" },
        { key: "about_ecosystem",    num: 4, label: "Our Ecosystem",  hint: "3 kartu fitur ekosistem" },
    ],
};

/* ─── Field editors ───────────────────────────────────────────── */
function TextField({ field, onChange }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-white/40 text-[10px] font-medium uppercase tracking-wider">
                    <IconText /> Teks
                </span>
                <label className="text-white/90 text-sm font-medium">{field.label}</label>
            </div>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/35 text-xs leading-relaxed">{FIELD_HINTS[field.key]}</p>
            )}
            <input
                type="text"
                value={field.value || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                className="bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-white/20"
            />
        </div>
    );
}

function TextAreaField({ field, onChange }) {
    const charCount = (field.value || "").length;
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-white/40 text-[10px] font-medium uppercase tracking-wider">
                    <IconText /> Paragraf
                </span>
                <label className="text-white/90 text-sm font-medium">{field.label}</label>
            </div>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/35 text-xs leading-relaxed">{FIELD_HINTS[field.key]}</p>
            )}
            <textarea
                value={field.value || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                rows={4}
                placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                className="bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none placeholder:text-white/20 leading-relaxed"
            />
            <p className="text-white/25 text-[10px] text-right">{charCount} karakter</p>
        </div>
    );
}

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
                toast.success(`${field.label} berhasil diupload!`);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.error || "Upload gagal";
            toast.error(msg);
            setPreview(field.value || "");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Label row */}
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-white/40 text-[10px] font-medium uppercase tracking-wider">
                    <IconImage /> Gambar
                </span>
                <label className="text-white/90 text-sm font-medium">{field.label}</label>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    preview
                        ? "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/12 text-amber-400 border border-amber-500/20"
                }`}>
                    {preview ? "✓ Gambar sudah diset" : "⚠ Belum ada gambar"}
                </span>
            </div>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/35 text-xs leading-relaxed">{FIELD_HINTS[field.key]}</p>
            )}
            {/* Upload area */}
            <div
                onClick={() => fileRef.current?.click()}
                className="relative cursor-pointer rounded-xl overflow-hidden flex items-center justify-center group transition-all"
                style={{
                    height: 180,
                    border: `2px dashed ${preview ? "rgba(255,255,255,0.12)" : "rgba(245,158,11,0.35)"}`,
                    background: preview ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.2)",
                }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt={field.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <IconImage />
                            <span className="text-white text-xs font-medium">Klik untuk ganti gambar</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-white/30 group-hover:text-white/50 transition-colors select-none">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-medium text-amber-400/80">Belum ada gambar</p>
                            <p className="text-[10px] text-white/25 mt-0.5">Klik di sini untuk upload — PNG, JPG, WebP</p>
                        </div>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                        <div className="w-7 h-7 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
                        <span className="text-blue-400 text-xs font-medium">Mengupload...</span>
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
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-white/40 text-[10px] font-medium uppercase tracking-wider">
                    <IconList /> Daftar
                </span>
                <label className="text-white/90 text-sm font-medium">{field.label}</label>
                <span className="text-white/25 text-xs">({items.length} item)</span>
            </div>
            {FIELD_HINTS[field.key] && (
                <p className="text-white/35 text-xs leading-relaxed">{FIELD_HINTS[field.key]}</p>
            )}
            <div className="flex flex-col gap-2.5 mt-1">
                {items.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-white/8 p-4 flex flex-col gap-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-white/8 flex items-center justify-center text-white/50 text-xs font-bold shrink-0">
                                {idx + 1}
                            </div>
                            <input
                                type="text"
                                value={item.title || ""}
                                onChange={(e) => updateItem(idx, "title", e.target.value)}
                                placeholder="Judul item"
                                className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/60 transition-all placeholder:text-white/20"
                            />
                        </div>
                        <textarea
                            value={item.description || ""}
                            onChange={(e) => updateItem(idx, "description", e.target.value)}
                            placeholder="Deskripsi item"
                            rows={2}
                            className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/60 resize-none transition-all placeholder:text-white/20"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Page Map ────────────────────────────────────────────────── */
function PageMap({ pageGroup, onJump }) {
    const blocks = PAGE_MAP[pageGroup] || [];
    if (!blocks.length) return null;
    return (
        <div className="rounded-xl border border-white/8 p-4 mb-5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-3">
                Layout Halaman — klik section untuk langsung edit
            </p>
            {/* Mini browser */}
            <div className="rounded-lg overflow-hidden border border-white/8 mx-auto" style={{ maxWidth: 400, background: "#080910" }}>
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/6" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="w-2 h-2 rounded-full bg-white/15" />
                    <div className="w-2 h-2 rounded-full bg-white/15" />
                    <div className="w-2 h-2 rounded-full bg-white/15" />
                    <div className="ml-2 flex-1 rounded bg-white/6 px-3 py-0.5 text-[9px] text-white/20">
                        hypertek100.com{PAGE_GROUP_META[pageGroup]?.path || "/"}
                    </div>
                </div>
                {/* Sections */}
                <div className="flex flex-col gap-1 p-2">
                    {blocks.map((block) => (
                        <button
                            key={block.key}
                            onClick={() => onJump(block.key)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left group transition-all hover:bg-white/[0.06] border border-transparent hover:border-white/10 cursor-pointer"
                        >
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-white/50 text-[10px] font-bold shrink-0">
                                {block.num}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-xs font-semibold">{block.label}</p>
                                <p className="text-white/30 text-[10px] truncate mt-0.5">{block.hint}</p>
                            </div>
                            <span className="text-blue-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                Edit →
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Section Card ────────────────────────────────────────────── */
function SectionCard({ section, onSave, isHighlighted, defaultExpanded = false }) {
    const [fields, setFields] = useState(section.fields || []);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expanded, setExpanded] = useState(defaultExpanded);
    const cardRef = useRef(null);

    const meta = SECTION_META[section.sectionKey] || {
        icon: "📄",
        zone: section.sectionLabel,
        description: "Bagian konten yang dapat diedit",
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
                toast.success(`"${section.sectionLabel}" berhasil disimpan!`);
                setSaved(true);
                setTimeout(() => setSaved(false), 4000);
                onSave?.(res.data.section);
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Gagal menyimpan perubahan");
        } finally {
            setSaving(false);
        }
    };

    const textFields  = fields.filter((f) => f.type === "text" || f.type === "textarea");
    const imageFields = fields.filter((f) => f.type === "image");
    const listFields  = fields.filter((f) => f.type === "list");

    const hasUnsaved = !saved;

    return (
        <div
            ref={cardRef}
            id={`section-${section.sectionKey}`}
            className={`rounded-xl overflow-hidden transition-all duration-200 ${
                isHighlighted ? "ring-2 ring-blue-500/40 ring-offset-1 ring-offset-black" : ""
            }`}
            style={{
                background: "rgba(255,255,255,0.025)",
                border: expanded ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.07)",
            }}
        >
            {/* Card header — clickable */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
                <span className="text-xl shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{section.sectionLabel}</p>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{meta.zone}</p>
                </div>
                {/* Field type counts */}
                <div className="hidden sm:flex items-center gap-3 text-white/25 text-[10px] mr-2">
                    {textFields.length > 0 && (
                        <span className="flex items-center gap-1"><IconText />{textFields.length} teks</span>
                    )}
                    {imageFields.length > 0 && (
                        <span className={`flex items-center gap-1 ${imageFields.some(f => !f.value) ? "text-amber-400/60" : ""}`}>
                            <IconImage />{imageFields.length} gambar
                            {imageFields.some(f => !f.value) && " ⚠"}
                        </span>
                    )}
                    {listFields.length > 0 && (
                        <span className="flex items-center gap-1"><IconList />{listFields.length} daftar</span>
                    )}
                </div>
                <IconChevron open={expanded} />
            </button>

            {/* Card body */}
            {expanded && (
                <div className="px-5 pb-6 border-t border-white/6">

                    {/* Context banner — where is this on the website */}
                    <div className="mt-4 mb-5 px-3 py-2.5 rounded-lg border border-blue-500/15 flex items-start gap-2.5" style={{ background: "rgba(37,99,235,0.06)" }}>
                        <span className="text-blue-400 text-sm mt-0.5 shrink-0">📍</span>
                        <div>
                            <p className="text-blue-300 text-xs font-semibold">{meta.zone}</p>
                            <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{meta.description}</p>
                        </div>
                    </div>

                    {/* Text fields */}
                    {textFields.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">Konten Teks</span>
                                <div className="h-px flex-1 bg-white/6" />
                            </div>
                            <div className="flex flex-col gap-5">
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
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">Gambar & Media</span>
                                <div className="h-px flex-1 bg-white/6" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">Daftar Item</span>
                                <div className="h-px flex-1 bg-white/6" />
                            </div>
                            <div className="flex flex-col gap-5">
                                {listFields.map((field) => (
                                    <ListField key={field.key} field={field} onChange={handleFieldChange} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save row */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/6">
                        <div className="text-xs">
                            {saved ? (
                                <span className="text-emerald-400 flex items-center gap-1.5">
                                    <IconCheck /> Perubahan sudah aktif di website
                                </span>
                            ) : (
                                <span className="text-white/30 flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Setelah simpan, perubahan langsung aktif di website
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                saved
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                            }`}
                        >
                            {saving ? (
                                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                            ) : saved ? (
                                <><IconCheck /> Tersimpan!</>
                            ) : (
                                <><IconSave /> Simpan & Publish</>
                            )}
                        </button>
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
            toast.error("Gagal memuat konten");
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
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-white/40 text-sm">Memuat konten website...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-[1100px] mx-auto">

                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-white font-bold text-xl mb-1">Website Content Editor</h1>
                    <p className="text-white/40 text-sm">
                        Edit teks, gambar, dan konten di seluruh halaman website
                    </p>
                </div>

                <div className="flex gap-6">

                    {/* Sidebar */}
                    <div className="hidden lg:block w-[220px] shrink-0">
                        <div className="sticky top-4 flex flex-col gap-3">

                            {/* Page nav */}
                            <div className="rounded-xl border border-white/8 p-3" style={{ background: "rgba(255,255,255,0.025)" }}>
                                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2 px-1">Pilih Halaman</p>
                                <div className="flex flex-col gap-0.5">
                                    {pageGroups.map((group) => {
                                        const gm = PAGE_GROUP_META[group] || { label: group, icon: "📄" };
                                        const isActive = activeTab === group;
                                        const subs = sections.filter((s) => s.pageGroup === group);
                                        return (
                                            <div key={group}>
                                                <button
                                                    onClick={() => { setActiveTab(group); setSearchQuery(""); }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                                                        isActive
                                                            ? "bg-blue-600/20 text-white border border-blue-500/25"
                                                            : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                                                    }`}
                                                >
                                                    <span>{gm.icon}</span>
                                                    <span className="font-medium">{gm.label}</span>
                                                    <span className="ml-auto text-[10px] text-white/25">{subs.length}</span>
                                                </button>
                                                {isActive && (
                                                    <div className="ml-5 mt-0.5 mb-1.5 flex flex-col gap-0 border-l border-white/6 pl-3">
                                                        {subs.map((s) => {
                                                            const sm = SECTION_META[s.sectionKey];
                                                            return (
                                                                <button
                                                                    key={s.sectionKey}
                                                                    onClick={() => handleQuickNav(s.sectionKey)}
                                                                    className="text-left text-[11px] text-white/35 hover:text-white/70 py-1 transition-colors truncate"
                                                                >
                                                                    {sm?.icon || "·"} {s.sectionLabel}
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

                            {/* How to use */}
                            <div className="rounded-xl border border-white/8 p-3" style={{ background: "rgba(255,255,255,0.025)" }}>
                                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2.5 px-1">Cara Pakai</p>
                                <ol className="flex flex-col gap-2 px-1">
                                    {[
                                        "Pilih halaman dari daftar di atas",
                                        "Klik section di diagram layout untuk langsung buka editor",
                                        "Edit teks atau upload gambar sesuai kebutuhan",
                                        "Klik Simpan & Publish — perubahan langsung aktif",
                                        "Klik Lihat Halaman untuk cek hasilnya",
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[11px] text-white/40 leading-relaxed">
                                            <span className="text-blue-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                                <div className="mt-3 pt-3 border-t border-white/6">
                                    <p className="text-amber-400/60 text-[10px] leading-relaxed">
                                        ⚠ Perubahan akan langsung dilihat oleh pengunjung website setelah disimpan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                        {/* Mobile tabs */}
                        <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
                            {pageGroups.map((group) => {
                                const gm = PAGE_GROUP_META[group] || { label: group, icon: "📄" };
                                return (
                                    <button
                                        key={group}
                                        onClick={() => { setActiveTab(group); setSearchQuery(""); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                                            activeTab === group
                                                ? "bg-blue-600/20 text-white border border-blue-500/25"
                                                : "bg-white/5 text-white/50 border border-transparent"
                                        }`}
                                    >
                                        {gm.icon} {gm.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Top bar: page info + search + view live */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                        <IconSearch />
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari section atau field..."
                                        className="w-full bg-white/[0.04] border border-white/8 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/25"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors text-xs"
                                        >✕</button>
                                    )}
                                </div>
                            </div>
                            {PAGE_GROUP_META[activeTab]?.path && (
                                <a
                                    href={`${FRONTEND_BASE_URL}${PAGE_GROUP_META[activeTab].path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <IconExtLink /> Lihat Halaman
                                </a>
                            )}
                        </div>

                        {/* Page header */}
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">{PAGE_GROUP_META[activeTab]?.icon || "📄"}</span>
                            <div>
                                <h2 className="text-white font-semibold text-sm">
                                    {PAGE_GROUP_META[activeTab]?.label || activeTab}
                                </h2>
                                <p className="text-white/35 text-xs">{filteredSections.length} section tersedia</p>
                            </div>
                        </div>

                        {/* Page layout map */}
                        {!searchQuery && <PageMap pageGroup={activeTab} onJump={handleQuickNav} />}

                        {/* Section cards */}
                        <div className="flex flex-col gap-3">
                            {filteredSections.length === 0 ? (
                                <div className="text-center py-14 rounded-xl border border-white/6" style={{ background: "rgba(255,255,255,0.015)" }}>
                                    {searchQuery ? (
                                        <>
                                            <p className="text-2xl mb-2">🔍</p>
                                            <p className="text-white/40 text-sm font-medium">Tidak ada section yang cocok</p>
                                            <p className="text-white/25 text-xs mt-1">Coba kata kunci lain</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-2xl mb-2">📭</p>
                                            <p className="text-white/40 text-sm font-medium">Section belum tersedia</p>
                                            <p className="text-white/25 text-xs mt-1">Hubungi tim teknis untuk mengaktifkan konten halaman ini</p>
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
