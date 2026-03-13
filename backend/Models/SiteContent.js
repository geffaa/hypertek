import mongoose from "mongoose";

/**
 * SiteContent Model
 * 
 * Stores editable website content (text + images) per page section.
 * Each document represents one section/page, identified by a unique `sectionKey`.
 * 
 * sectionKey examples:
 *   "home_hero"          → Home page hero banner
 *   "home_about"         → Home page "About HyperTek" section
 *   "home_how_it_works"  → Home page "How It Works" section
 *   "about_top"          → About page top section
 *   "about_story"        → About page story section
 *   "about_war"          → About page war/games section
 *   "about_ecosystem"    → About page ecosystem section
 * 
 * `fields` is a flexible array of key-value content items.
 * Each field has a type (text, textarea, image, list) so the admin editor
 * knows how to render the edit control.
 */
const fieldSchema = new mongoose.Schema(
    {
        key: { type: String, required: true },      // e.g. "heading", "body", "image_hero"
        label: { type: String, required: true },     // Human label: "Hero Heading"
        type: {
            type: String,
            required: true,
            enum: ["text", "textarea", "image", "list"],
        },
        value: { type: mongoose.Schema.Types.Mixed, default: "" },
        // For images: value = Cloudinary URL string
        // For list:   value = [ { title, description, icon? }, ... ]
        // For text/textarea: value = plain string
    },
    { _id: false }
);

const siteContentSchema = new mongoose.Schema(
    {
        sectionKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        sectionLabel: { type: String, required: true }, // "Hero Banner"
        pageGroup: { type: String, required: true },    // "home" or "about"
        fields: [fieldSchema],
    },
    { timestamps: true }
);

const SiteContent = mongoose.model("SiteContent", siteContentSchema);
export default SiteContent;
