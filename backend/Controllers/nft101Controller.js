import Nft101 from "../Models/Nft101.js";

function getLocalizedNft101(doc, lang) {
  const base = {
    _id:          doc._id,
    title:        doc.title,
    description:  doc.description,
    contentBlocks: doc.contentBlocks,
    image:        doc.image,
    category:     doc.category,
    readTime:     doc.readTime,
    icon:         doc.icon,
    gradientFrom: doc.gradientFrom,
    gradientTo:   doc.gradientTo,
    link:         doc.link,
    order:        doc.order,
    status:       doc.status,
    createdAt:    doc.createdAt,
    updatedAt:    doc.updatedAt,
  };

  if (!lang || lang === "en" || lang === "en-US") return base;

  const translations = doc.translations;
  const trans = translations?.get ? translations.get(lang) : translations?.[lang];
  if (!trans) return base;

  return {
    ...base,
    title:         trans.title        || base.title,
    description:   trans.description  || base.description,
    contentBlocks: trans.contentBlocks?.length ? trans.contentBlocks : base.contentBlocks,
  };
}

export const getNft101Items = async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    const items = await Nft101.find({ status: "active" }).sort({ order: 1 });
    res.json({ success: true, items: items.map((d) => getLocalizedNft101(d, lang)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNft101ById = async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    const item = await Nft101.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, item: getLocalizedNft101(item, lang) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
