import { motion } from "framer-motion";
import popularFallback from "../../assets/images/popular/popolar.webp";
import LazyImage from "../Common/LazyImage";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

// TODO: Replace with admin-curated API endpoint (e.g. GET /api/v1/admin/featured-nfa)
export const DUMMY_FEATURED_NFA = [
  { id: 1, name: "Shadow Blade NFA",     category: "Weapons",       price: 2500, image: null, hasBuyback: true,  minBuyback: 875 },
  { id: 2, name: "Storm Sentinel NFA",   category: "Skins",         price: 1800, image: null, hasBuyback: true,  minBuyback: 630 },
  { id: 3, name: "Void Crystal NFA",     category: "General",       price: 950,  image: null, hasBuyback: false, minBuyback: 0   },
  { id: 4, name: "Iron Titan NFA",       category: "Skins",         price: 3200, image: null, hasBuyback: true,  minBuyback: 1120 },
  { id: 5, name: "Aurora Station NFA",   category: "Land And Bases", price: 4500, image: null, hasBuyback: true,  minBuyback: 1575 },
  { id: 6, name: "Cyber District NFA",   category: "Land And Bases", price: 2100, image: null, hasBuyback: false, minBuyback: 0   },
];

// Standalone NFA items grid — rendered inside PopularCollections card
export function NFAItemsSection() {
  const { t } = useTranslation();
  const items = DUMMY_FEATURED_NFA;

  return (
    <>
      {/* Header row */}
      <div className="flex items-center gap-4 px-8 py-4"
        style={{ borderTop: "1px solid rgba(56,189,248,0.1)", borderBottom: "1px solid rgba(56,189,248,0.1)", background: "rgba(56,189,248,0.03)" }}>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-[2px] bg-white/50" />
          <span className="text-white/70 font-bold text-xs tracking-[0.3em] uppercase">{t("homeMarket.featured")}</span>
        </div>
        <div className="flex-1 h-px" style={{ background: "rgba(56,189,248,0.15)" }} />
        <h2 className="text-white font-[Goldman] font-bold text-xl sm:text-2xl uppercase whitespace-nowrap">
          {t("homeMarket.sectionTitle")}
        </h2>
        <div className="flex-1 h-px" style={{ background: "rgba(56,189,248,0.15)" }} />
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#50C878] bg-[#50C878]/10 border border-[#50C878]/30 rounded-full px-3 py-1 shrink-0">
          <span>✦</span> {t("homeMarket.buybackBadge")}
        </span>
      </div>

      <div className="px-8 pt-3 pb-1">
        <p className="text-white/70 text-sm sm:text-base font-semibold">{t("homeMarket.urgency")}</p>
      </div>

      {/* Preview-only notice — marketplace is browsable but purchasing is locked until launch */}
      <div className="px-8 pt-3">
        <div
          className="flex items-center gap-2.5 rounded-lg px-4 py-2.5"
          style={{
            background: "linear-gradient(135deg, rgba(56,189,248,0.10) 0%, rgba(56,189,248,0.03) 100%)",
            border: "1px solid rgba(56,189,248,0.30)",
          }}
        >
          <span className="text-cyan-300 text-sm leading-none">🔒</span>
          <span className="text-cyan-100/90 text-[12px] sm:text-[13px] font-semibold tracking-wide">
            {t("homeMarket.previewNotice", { defaultValue: "Preview only — buying opens at official launch" })}
          </span>
        </div>
      </div>

      {/* Items grid */}
      <div className="px-8 pb-8 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6 mt-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className="snap-start flex-shrink-0 w-[45vw] sm:w-auto rounded-xl overflow-hidden flex flex-col text-white"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            variants={fadeUp} custom={index + 1}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="relative">
              <LazyImage
                src={item.image || popularFallback}
                alt={item.name || "Item"}
                fallback={popularFallback}
                className="h-[110px] sm:h-[130px] lg:h-[150px] bg-black"
                imgClassName="object-contain"
              />
              <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: "#FF6B3580", border: "1px solid #FF6B35" }}>
                NFA
              </span>
              {item.hasBuyback && (
                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#50C87880] border border-[#50C878]">
                  BB ✦
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5 p-2.5 sm:p-3 flex-1">
              <h3 className="text-white font-semibold text-xs sm:text-sm truncate">{item.name || "Unnamed Item"}</h3>
              {item.category && (
                <span className="text-white/40 text-[10px] capitalize truncate">{item.category}</span>
              )}
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[10px]">{t("homeMarket.price")}</span>
                <span className="text-white font-semibold text-[10px] sm:text-xs">{item.price} USDC</span>
              </div>
              {item.hasBuyback && item.minBuyback > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[#50C878]/70 text-[9px]">{t("homeMarket.minBuyback")}</span>
                  <span className="text-[#50C878] font-semibold text-[9px]">${item.minBuyback} USD</span>
                </div>
              )}
              <div className="mt-auto pt-2">
                <button
                  disabled
                  className="w-full py-1.5 flex items-center justify-center gap-1.5 bg-white/5 text-white/50 font-semibold text-[10px] sm:text-xs rounded-md border border-white/10 cursor-not-allowed"
                >
                  <span className="leading-none">🔒</span>
                  {t("homeMarket.comingAtLaunch", { defaultValue: "Coming at launch" })}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

// Original standalone component (still used where needed)
function FeaturedMarketplace() {
  return (
    <section className="relative z-10 w-full px-6 pb-20">
      <div className="mx-auto max-w-[1400px]">
        <NFAItemsSection />
      </div>
    </section>
  );
}

export default FeaturedMarketplace;
