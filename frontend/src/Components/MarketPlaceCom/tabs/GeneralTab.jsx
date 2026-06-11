import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../../Config";
import LineLayout from "../LineLayout";
import { FALLBACK_ITEMS } from "../marketplaceFallback";
import {
  GiBodySwapping, GiStarMedal, GiTargetLaser, GiCrossedSwords,
  GiChestArmor, GiSpaceship, GiRaceCar, GiDiamondHard,
  GiMilitaryFort, GiOpenTreasureChest,
} from "react-icons/gi";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" } }),
};

const CAT_ALIAS = {
  "military badges and collectables": "military badges",
  "vehicles":                         "racing vehicles",
  "land/bases":                       "land and bases",
};

const ICON_SIZE = 44;
const CATEGORY_DEFS = [
  { key: "skins",           i18nKey: "skins",          icon: <GiBodySwapping      size={ICON_SIZE} color="#38bdf8" style={{ filter: "drop-shadow(0 0 6px #38bdf888)" }} /> },
  { key: "military badges", i18nKey: "militaryBadges", icon: <GiStarMedal         size={ICON_SIZE} color="#fcd34d" style={{ filter: "drop-shadow(0 0 6px #fcd34d88)" }} /> },
  { key: "specialists",     i18nKey: "specialists",    icon: <GiTargetLaser       size={ICON_SIZE} color="#00ff88" style={{ filter: "drop-shadow(0 0 6px #00ff8888)" }} /> },
  { key: "weapons",         i18nKey: "weapons",        icon: <GiCrossedSwords     size={ICON_SIZE} color="#ff6464" style={{ filter: "drop-shadow(0 0 6px #ff646488)" }} /> },
  { key: "body armour",     i18nKey: "bodyArmour",     icon: <GiChestArmor        size={ICON_SIZE} color="#4f8fff" style={{ filter: "drop-shadow(0 0 6px #4f8fff88)" }} /> },
  { key: "spaceships",      i18nKey: "spaceships",     icon: <GiSpaceship         size={ICON_SIZE} color="#6eb4ff" style={{ filter: "drop-shadow(0 0 6px #6eb4ff88)" }} /> },
  { key: "racing vehicles", i18nKey: "racingVehicles", icon: <GiRaceCar           size={ICON_SIZE} color="#ff3264" style={{ filter: "drop-shadow(0 0 6px #ff326488)" }} /> },
  { key: "artwork",         i18nKey: "artwork",        icon: <GiDiamondHard       size={ICON_SIZE} color="#c864ff" style={{ filter: "drop-shadow(0 0 6px #c864ff88)" }} /> },
  { key: "land and bases",  i18nKey: "landAndBases",   icon: <GiMilitaryFort      size={ICON_SIZE} color="#4f8fff" style={{ filter: "drop-shadow(0 0 6px #4f8fff88)" }} /> },
  { key: "general",         i18nKey: "general",        icon: <GiOpenTreasureChest size={ICON_SIZE} color="#e2e8f0" style={{ filter: "drop-shadow(0 0 6px #e2e8f066)" }} /> },
];

function Gap({ children }) {
  if (!children) return <div className="h-px bg-white/[0.06] my-2" />;
  return (
    <div className="py-5 px-4 my-2 rounded-xl text-white/50 text-sm text-center"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {children}
    </div>
  );
}

export default function GeneralTab() {
  const { t } = useTranslation();
  const [catMap, setCatMap]       = useState({});
  const [loading, setLoading]     = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Always start with dummy content as the base for all categories
        const merged = {};
        Object.keys(FALLBACK_ITEMS).forEach((cat) => {
          merged[cat] = [...FALLBACK_ITEMS[cat]];
        });

        // Fetch real active marketplace listings and prepend them to the correct category
        try {
          const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/listings/marketplace`);
          const grouped = res.data.grouped || {};
          Object.entries(grouped).forEach(([cat, items]) => {
            if (!items.length) return;
            if (!merged[cat]) merged[cat] = [];
            // Real listings go first, dummy content follows
            merged[cat] = [...items, ...merged[cat]];
          });
        } catch {
          // If listings API fails, we still show dummy content — no action needed
        }

        setCatMap(merged);
      } catch (err) {
        console.error("GeneralTab fetch error:", err);
        setCatMap(FALLBACK_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCatMap = typeFilter === "ALL" ? catMap : Object.fromEntries(
    Object.entries(catMap).map(([key, items]) => [
      key,
      items.filter(item => {
        const tp = item.assetType || (item.isNFA ? "NFA" : "NFT");
        return tp === typeFilter;
      }),
    ])
  );

  const visibleCategories = CATEGORY_DEFS.filter((c) => filteredCatMap[c.key]?.length > 0);
  const hasAnyItems = visibleCategories.length > 0;

  return (
    <div className="py-8">
      <motion.div className="mb-10" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-white/40" />
          <span className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold">
            {t("marketplace.sectionLabel")}
          </span>
        </div>
        <h1 className="text-white font-[Goldman] font-bold text-2xl sm:text-3xl mb-1">
          {t("marketplace.general.heading")}
        </h1>
        <p className="text-white/50 text-sm max-w-xl leading-relaxed">
          {t("marketplace.general.subtitle")}
        </p>
      </motion.div>

      {/* Asset Type Filter */}
      <motion.div className="flex items-center gap-2 mb-8 flex-wrap" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        {[
          { value: "ALL", label: t("marketplace.general.filterAll") },
          { value: "NFA", label: "NFA" },
          { value: "NFC", label: "NFC" },
          { value: "NFT", label: "NFT" },
        ].map(({ value, label }) => {
          const active = typeFilter === value;
          const colors = {
            ALL: { active: "#fff",     inactive: "rgba(255,255,255,0.15)", text: active ? "#000" : "rgba(255,255,255,0.5)" },
            NFA: { active: "#7C3AED",  inactive: "rgba(124,58,237,0.15)", text: active ? "#fff" : "#c4b5fd" },
            NFC: { active: "#002AA8",  inactive: "rgba(0,42,168,0.2)",    text: active ? "#fff" : "#93c5fd" },
            NFT: { active: "rgba(255,255,255,0.12)", inactive: "rgba(255,255,255,0.05)", text: active ? "#fff" : "rgba(255,255,255,0.4)" },
          }[value];
          return (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active ? colors.active : colors.inactive,
                border: `1px solid ${active ? colors.active : "rgba(255,255,255,0.1)"}`,
                color: colors.text,
              }}
            >
              {label}
            </button>
          );
        })}
      </motion.div>


      {/* Lines */}
      {loading ? (
        <div className="flex flex-col gap-6">
          {CATEGORY_DEFS.map((_, i) => (
            <div key={i} className="h-[180px] rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : !hasAnyItems ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="text-4xl mb-1">🛒</div>
          <p className="text-white/50 text-sm">{t("marketplace.general.noItems")}</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {CATEGORY_DEFS.map((cat, i) => {
            const items = filteredCatMap[cat.key];
            if (!items?.length) return null;
            const label = t(`marketplace.general.categories.${cat.i18nKey}`);
            return (
              <div key={cat.key}>
                <LineLayout
                  category={cat.key}
                  label={label}
                  icon={cat.icon}
                  items={items}
                  direction={i % 2 === 0 ? "left" : "right"}
                />
                {i < CATEGORY_DEFS.length - 1 && <Gap />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
