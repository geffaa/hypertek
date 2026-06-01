import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, ChevronUp } from "lucide-react";
import axios from "axios";
import { BACKEND_BASE_URL } from "../Config";

// ── Category badge colors ─────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Basics:     { bg: "rgba(0,80,200,0.25)",  border: "rgba(0,100,255,0.35)",  text: "rgba(120,180,255,0.9)"  },
  Security:   { bg: "rgba(0,150,120,0.2)",  border: "rgba(0,180,150,0.35)", text: "rgba(80,220,190,0.9)"   },
  Blockchain: { bg: "rgba(120,50,200,0.2)", border: "rgba(150,80,230,0.35)", text: "rgba(200,150,255,0.9)" },
  HyperTek:   { bg: "rgba(200,80,0,0.2)",   border: "rgba(230,100,0,0.35)", text: "rgba(255,160,80,0.9)"  },
};
function categoryStyle(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Basics;
}

export default function Nft101Article() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const lang = i18n.language || "en";
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/nft101/${id}?lang=${lang}`)
      .then((res) => {
        if (res.data.success) setArticle(res.data.item);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, i18n.language]);

  // Show/hide scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goBack = () => navigate("/market-place?tab=nfa101");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/50 text-sm">{t("nft101Article.notFound")}</p>
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t("nft101Article.backToArticles")}
        </button>
      </div>
    );
  }

  const cs = categoryStyle(article.category);
  const hasContentBlocks = article.contentBlocks && article.contentBlocks.length > 0;
  const hasSections = article.sections && article.sections.length > 0;

  return (
    <>
      {/* ── Sticky top bar ───────────────────────────────────────────── */}
      <div
        className="sticky top-[72px] z-30 w-full mt-[72px]"
        style={{
          background: "linear-gradient(180deg, rgba(6,6,16,0.98) 60%, rgba(6,6,16,0))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-[700px] mx-auto px-5 py-3 flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-xs font-medium transition-all duration-200 px-3 py-2 rounded-lg group"
            style={{
              color: "rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.55)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("nft101Article.backToMarketplace")}
          </button>

          <span className="text-white/25 text-[10px] tracking-widest uppercase font-semibold hidden sm:block">
            {t("nft101Article.sectionLabel")}
          </span>
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────────────────── */}
      <motion.article
        className="max-w-[700px] mx-auto px-5 pb-20 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Hero image */}
        <div
          className="w-full rounded-2xl overflow-hidden mb-8"
          style={{ aspectRatio: "16/9", maxHeight: 400 }}
        >
          {!imgError && article.image ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: article.image.includes('logo-t-white') 
                  ? `linear-gradient(135deg, ${article.gradientFrom || "#1a4fd6"}, ${article.gradientTo || "#0e2d8a"})`
                  : 'transparent'
              }}
            >
              <img
                src={article.image}
                alt={article.title}
                onError={() => setImgError(true)}
                className={`w-full h-full ${article.image.includes('logo-t-white') ? 'object-contain p-16 drop-shadow-2xl' : 'object-cover'}`}
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-6xl"
              style={{
                background: `linear-gradient(135deg, ${article.gradientFrom || "#1a4fd6"}, ${article.gradientTo || "#0e2d8a"})`,
              }}
            >
              {article.icon || "📚"}
            </div>
          )}
        </div>

        {/* Meta line */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{
              background: cs.bg,
              border: `1px solid ${cs.border}`,
              color: cs.text,
            }}
          >
            {article.category || "Basics"}
          </span>
          <span className="flex items-center gap-1 text-white/30 text-[10px]">
            <Clock className="w-3 h-3" />
            {article.readTime || 3} {t("nft101Article.minRead")}
          </span>
          <span className="flex items-center gap-1 text-white/30 text-[10px]">
            <BookOpen className="w-3 h-3" />
            {t("nft101Article.sectionLabel")}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-white font-bold text-2xl sm:text-3xl md:text-[2.1rem] mb-5 leading-tight"
          style={{ fontFamily: "'Goldman', sans-serif" }}
        >
          {article.title}
        </h1>

        {/* Lead / description */}
        <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-8 italic">
          {article.description}
        </p>

        {/* Divider */}
        <div className="mb-10" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

        {/* ── Content ──────────────────────────────────────────────────── */}
        {hasContentBlocks ? (
          <div className="flex flex-col gap-6">
            {article.contentBlocks.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2
                    key={i}
                    className="text-white/90 font-semibold text-xl mt-6 mb-1"
                    style={{ fontFamily: "'Goldman', sans-serif" }}
                  >
                    {block.value}
                  </h2>
                );
              }
              if (block.type === "image") {
                return (
                  <figure key={i} className="my-4">
                    <div
                      className="rounded-xl overflow-hidden flex items-center justify-center"
                      style={{
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: block.value.includes('logo-t-white') 
                          ? `linear-gradient(135deg, ${article.gradientFrom || "#1a4fd6"}, ${article.gradientTo || "#0e2d8a"})`
                          : 'transparent'
                      }}
                    >
                      <img
                        src={block.value}
                        alt={block.caption || article.title}
                        className={`w-full h-auto ${block.value.includes('logo-t-white') ? 'object-contain p-12 drop-shadow-2xl' : 'object-cover'}`}
                        style={{ maxHeight: 440 }}
                        loading="lazy"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="text-white/30 text-xs mt-2.5 text-center italic">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              /* type === "text" */
              return (
                <p
                  key={i}
                  className="text-white/65 text-[15px] sm:text-base leading-[1.95] text-justify"
                >
                  {block.value}
                </p>
              );
            })}
          </div>
        ) : hasSections ? (
          <div className="flex flex-col gap-10">
            {article.sections.map((section, si) => (
              <div key={si}>
                <h2
                  className="text-white/90 font-semibold text-xl mb-4"
                  style={{ fontFamily: "'Goldman', sans-serif" }}
                >
                  {section.heading}
                </h2>
                <div className="flex flex-col gap-4">
                  {(section.paragraphs || []).map((para, pi) => (
                    <p
                      key={pi}
                      className="text-white/65 text-[15px] sm:text-base leading-[1.95] text-justify"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {(article.body || []).map((para, i) => (
              <p
                key={i}
                className="text-white/65 text-[15px] sm:text-base leading-[1.95] text-justify"
              >
                {para}
              </p>
            ))}
          </div>
        )}

        {/* ── Bottom navigation ──────────────────────────────────────── */}
        <div
          className="mt-16 pt-8 flex justify-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-sm font-medium transition-all duration-200 px-6 py-3 rounded-xl"
            style={{
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("nft101Article.backToMarketplace")}
          </button>
        </div>
      </motion.article>

      {/* ── Scroll to top FAB ────────────────────────────────────────── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
          }}
          data-tooltip="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 text-white/60" />
        </button>
      )}
    </>
  );
}
