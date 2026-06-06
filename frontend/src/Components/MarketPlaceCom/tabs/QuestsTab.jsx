import { useState, useEffect, useCallback } from "react";
import { Swords, Gamepad2, Clock, Zap, Package, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BACKEND_BASE_URL } from "../../../Config";

// ── Quest tier constants (mirrors backend/utils/questUtils.js) ────────────────
const QUEST_TIERS = {
  money: [
    { waitHours: 4,  buyerSavePercent: 3, playerSharePercent: 4,   platformSharePercent: 4   },
    { waitHours: 12, buyerSavePercent: 4, playerSharePercent: 3.5, platformSharePercent: 3.5 },
    { waitHours: 24, buyerSavePercent: 5, playerSharePercent: 3,   platformSharePercent: 3   },
  ],
  resources: [
    { waitHours: 4,  buyerSavePercent: 8,  playerSharePercent: 6, platformSharePercent: 6 },
    { waitHours: 12, buyerSavePercent: 10, playerSharePercent: 5, platformSharePercent: 5 },
    { waitHours: 24, buyerSavePercent: 12, playerSharePercent: 4, platformSharePercent: 4 },
  ],
};

const STATUS_COLORS = {
  open:      { text: "text-green-400",  bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.20)" },
  accepted:  { text: "text-amber-300",  bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.20)" },
  completed: { text: "text-blue-400",   bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.20)" },
  cancelled: { text: "text-white/25",   bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
};

const shortId = (id) => (id ? String(id).slice(-7).toUpperCase() : "—");

const shortAddr = (addr) =>
  addr && addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || "Open";

const formatElapsed = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h ${String(m).padStart(2, "0")}m`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

// ── Static preview data ───────────────────────────────────────────────────────
const PREVIEW_QUESTS = [
  {
    _id: "q-1098474", status: "accepted", title: "100usdc / 1M Oil",
    offering: "100 USDC", reward: 6, pickupPlanet: "Utfulyjhv", dropOffPlanet: "Wreerk",
    acceptedByWallet: "0xFireFly0000", questType: "money", waitHours: 4,
    buyerSavePercent: 3, playerSharePercent: 4, platformSharePercent: 4,
    createdAt: new Date(Date.now() - 14295000).toISOString(),
  },
  {
    _id: "q-1098469", status: "accepted", title: "1000usdc / 5M Food/Oil",
    offering: "1000 USDC", reward: 50, pickupPlanet: "Panhd", dropOffPlanet: "Ghgbvr",
    acceptedByWallet: "0xBumbleBee0000", questType: "money", waitHours: 12,
    buyerSavePercent: 4, playerSharePercent: 3.5, platformSharePercent: 3.5,
    createdAt: new Date(Date.now() - 42481000).toISOString(),
  },
  {
    _id: "q-1098453", status: "accepted", title: "750usdc / 2M Wood/Food",
    offering: "750 USDC", reward: 37, pickupPlanet: "Rbthfg5h65", dropOffPlanet: "Nbrtdv",
    acceptedByWallet: "0xKissMyA0000", questType: "resources", waitHours: 24,
    buyerSavePercent: 12, playerSharePercent: 4, platformSharePercent: 4,
    createdAt: new Date(Date.now() - 48840000).toISOString(),
  },
  {
    _id: "q-1098437", status: "accepted", title: "120usdc / 1M Food/Ore",
    offering: "120 USDC", reward: 7, pickupPlanet: "Z234", dropOffPlanet: "Bftyuhgdb",
    acceptedByWallet: "0xYoMomma0000", questType: "money", waitHours: 24,
    buyerSavePercent: 5, playerSharePercent: 3, platformSharePercent: 3,
    createdAt: new Date(Date.now() - 7792000).toISOString(),
  },
  {
    _id: "q-1098436", status: "open", title: "100usdc / 1M Ore",
    offering: "100 USDC", reward: 6, pickupPlanet: "V56h6k6", dropOffPlanet: "Jjnbfdb",
    acceptedByWallet: null, questType: "money", waitHours: 4,
    buyerSavePercent: 3, playerSharePercent: 4, platformSharePercent: 4,
    createdAt: new Date(Date.now() - 3703000).toISOString(),
  },
  {
    _id: "q-1098420", status: "open", title: "500usdc / 3M Goods",
    offering: "500 USDC", reward: 25, pickupPlanet: "Xtra7", dropOffPlanet: "Orbion",
    acceptedByWallet: null, questType: "resources", waitHours: 12,
    buyerSavePercent: 10, playerSharePercent: 5, platformSharePercent: 5,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
];

const STATUS_FILTERS = ["open", "accepted", "completed"];

// ── Quest type badge ──────────────────────────────────────────────────────────
function QuestTypeBadge({ questType }) {
  const { t } = useTranslation();
  if (!questType) return null;
  const isResources = questType === "resources";
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{
        background: isResources ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.12)",
        border: `1px solid ${isResources ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.25)"}`,
        color: isResources ? "#4ade80" : "#fbbf24",
      }}
    >
      {isResources ? <Package className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
      {isResources ? t("marketplace.quests.type.resources", "Resources") : t("marketplace.quests.type.money", "Money")}
    </span>
  );
}

// ── Wait tier badge ───────────────────────────────────────────────────────────
function WaitTierBadge({ waitHours, buyerSavePercent }) {
  if (!waitHours) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{
        background: "rgba(56,189,248,0.08)",
        border: "1px solid rgba(56,189,248,0.2)",
        color: "rgba(56,189,248,0.85)",
      }}
    >
      <Clock className="w-2.5 h-2.5" />
      {waitHours}h
      {buyerSavePercent != null && (
        <span className="text-green-400 ml-0.5">−{buyerSavePercent}%</span>
      )}
    </span>
  );
}

// ── Commission split tooltip content ─────────────────────────────────────────
function SplitInfo({ q }) {
  const { t } = useTranslation();
  if (!q.questType || !q.waitHours) {
    return (
      <span className="text-amber-300/80 text-xs font-semibold">
        {q.reward > 0 ? `${q.reward} HB` : "—"}
      </span>
    );
  }

  const tiers = QUEST_TIERS[q.questType] || [];
  const tier = tiers.find((ti) => ti.waitHours === q.waitHours) || {};
  const player = q.playerSharePercent ?? tier.playerSharePercent;
  const platform = q.platformSharePercent ?? tier.platformSharePercent;
  const buyerSave = q.buyerSavePercent ?? tier.buyerSavePercent;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-amber-300/80 text-xs font-semibold">
          {q.reward > 0 ? `${q.reward} HB` : "—"}
        </span>
        <QuestTypeBadge questType={q.questType} />
      </div>
      {player != null && (
        <div className="text-[9px] text-white/30 leading-tight">
          <span className="text-green-400/60">{t("marketplace.quests.buyer", "Buyer")} −{buyerSave}%</span>
          {" · "}
          <span className="text-amber-300/50">{t("marketplace.quests.player", "Player")} +{player}%</span>
          {" · "}
          <span className="text-white/30">{t("marketplace.quests.platform", "Platform")} +{platform}%</span>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QuestsTab() {
  const { t } = useTranslation();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [, setTick] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Tick every second so elapsed times update live
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const LIMIT = 20;

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: "quest", status: statusFilter, page, limit: LIMIT });
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/trade?${params}`);
      const data = await r.json();
      const fetched = data.trades || [];
      if (fetched.length > 0) {
        setQuests(fetched);
        setTotal(data.total || 0);
      } else if (page === 1) {
        setQuests(PREVIEW_QUESTS.filter((q) => q.status === statusFilter));
        setTotal(PREVIEW_QUESTS.length);
      } else {
        setQuests([]);
        setTotal(0);
      }
    } catch {
      if (page === 1) {
        setQuests(PREVIEW_QUESTS.filter((q) => q.status === statusFilter));
        setTotal(PREVIEW_QUESTS.length);
      } else {
        setQuests([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchQuests(); }, [fetchQuests]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6 relative overflow-hidden">
      {/* ── Background figure ── */}
      <img
        src="/avatar/lithionites-female.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-12 top-0 h-[700px] w-auto object-contain object-top"
        style={{ opacity: 0.06, zIndex: 0 }}
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-amber-400" />
          <h2 className="text-white font-bold text-lg">{t("marketplace.quests.heading")}</h2>
          <span className="text-white/30 text-sm">{total} {t("marketplace.quests.quests")}</span>
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className="px-2.5 py-1 rounded-full text-xs capitalize"
              style={statusFilter === f
                ? { background: "rgba(180,120,0,0.6)", border: "1px solid rgba(200,140,0,0.4)", color: "#fff" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
              {t(`marketplace.quests.status.${f}`, f)}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-card info row ── */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Card 1 — In-Game Feature */}
        <div className="rounded-xl px-4 py-3 flex flex-col justify-between gap-3"
          style={{ background: "rgba(180,120,0,0.07)", border: "1px solid rgba(180,120,0,0.18)" }}>
          <div className="flex items-start gap-3">
            <Gamepad2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300/80 text-xs font-semibold">{t("marketplace.quests.inGameFeature")}</p>
              <p className="text-white/35 text-[11px] leading-snug mt-0.5">
                {t("marketplace.quests.inGameDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowComingSoon(true)}
            className="self-center mx-auto px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-80"
            style={{ background: "rgba(180,120,0,0.35)", border: "1px solid rgba(220,150,0,0.4)", color: "rgba(255,200,80,0.95)" }}
          >
            {t("marketplace.quests.earnFromQuests")}
          </button>
        </div>

        {/* Card 2+3 — Money + Resource combined */}
        <div className="sm:col-span-2 rounded-xl px-4 py-3"
          style={{ background: "rgba(20,15,5,0.6)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <div className="grid grid-cols-2 gap-4 divide-x divide-white/10">

            {/* Money Quests */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 text-xs font-semibold">{t("marketplace.quests.moneyQuests")}</span>
              </div>
              <div className="space-y-1.5">
                {QUEST_TIERS.money.map((tier) => (
                  <div key={tier.waitHours} className="grid text-[10px]"
                    style={{ gridTemplateColumns: "2.2rem 5.5rem 6rem 6rem" }}>
                    <span className="text-white/50">{tier.waitHours}h</span>
                    <span className="text-red-400">{t("marketplace.quests.buyer", "Buyer")} −{tier.buyerSavePercent}%</span>
                    <span className="text-amber-300">{t("marketplace.quests.player", "Player")} +{tier.playerSharePercent}%</span>
                    <span className="text-white/60">{t("marketplace.quests.platform", "Platform")} +{tier.platformSharePercent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Quests */}
            <div className="pl-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Package className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-300 text-xs font-semibold">{t("marketplace.quests.resourceQuests")}</span>
              </div>
              <div className="space-y-1.5">
                {QUEST_TIERS.resources.map((tier) => (
                  <div key={tier.waitHours} className="grid text-[10px]"
                    style={{ gridTemplateColumns: "2.2rem 5.5rem 6rem 6rem" }}>
                    <span className="text-white/50">{tier.waitHours}h</span>
                    <span className="text-red-400">{t("marketplace.quests.buyer", "Buyer")} −{tier.buyerSavePercent}%</span>
                    <span className="text-amber-300">{t("marketplace.quests.player", "Player")} +{tier.playerSharePercent}%</span>
                    <span className="text-white/60">{t("marketplace.quests.platform", "Platform")} +{tier.platformSharePercent}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          {/* Footer notes */}
          <div className="mt-3 pt-2.5 border-t border-white/8 flex flex-wrap gap-x-8 gap-y-1">
            <p className="text-white/45 text-[9px]">{t("marketplace.quests.footerNote1")}</p>
            <p className="text-white/45 text-[9px]">{t("marketplace.quests.footerNote2")}</p>
          </div>
        </div>

      </div>

      {/* ── Table + lock overlay using CSS Grid overlap ── */}
      <div style={{ display: "grid" }}>
        {/* Table — dimmed while locked */}
        <div className="opacity-50 pointer-events-none select-none" style={{ gridRow: "1/1", gridColumn: "1/1" }}>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : quests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/25">
              <Swords className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">{t("marketplace.quests.noQuests", { filter: statusFilter })}</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-x-auto"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div
                className="grid min-w-[820px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
                style={{ background: "rgba(10,20,60,0.6)", gridTemplateColumns: "1fr 1.1fr 1.1fr 1.8fr 1.6fr 1fr 1.2fr" }}
              >
                <span>{t("marketplace.quests.table.questingNo")}</span>
                <span>{t("marketplace.quests.table.pickupPlanet")}</span>
                <span>{t("marketplace.quests.table.dropOffPlanet")}</span>
                <span>{t("marketplace.quests.table.itemGoods")}</span>
                <span>{t("marketplace.quests.table.commSplit")}</span>
                <span>{t("marketplace.quests.table.questingTime")}</span>
                <span>{t("marketplace.quests.table.assignedTo")}</span>
              </div>
              {quests.map((q, i) => {
                const colors = STATUS_COLORS[q.status] || STATUS_COLORS.open;
                return (
                  <div key={q._id} className="grid min-w-[820px] px-4 py-3 items-center"
                    style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1fr 1.1fr 1.1fr 1.8fr 1.6fr 1fr 1.2fr" }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-white/70 text-xs font-mono">{shortId(q._id)}</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className={`text-[9px] font-semibold capitalize ${colors.text}`}
                          style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 3, padding: "1px 4px", display: "inline-block" }}>
                          {t(`marketplace.quests.status.${q.status}`, q.status)}
                        </span>
                        <WaitTierBadge waitHours={q.waitHours} buyerSavePercent={q.buyerSavePercent} />
                      </div>
                    </div>
                    <span className="text-white/50 text-xs">{q.pickupPlanet || <span className="text-white/20 italic">{t("marketplace.quests.inGame")}</span>}</span>
                    <span className="text-white/50 text-xs">{q.dropOffPlanet || <span className="text-white/20 italic">{t("marketplace.quests.inGame")}</span>}</span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-white/80 text-xs font-medium truncate">{q.title || "—"}</span>
                      {q.offering && <span className="text-white/35 text-[10px] truncate">{q.offering}</span>}
                    </div>
                    <SplitInfo q={q} />
                    <span className="text-white/40 text-xs font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 opacity-50" />{formatElapsed(q.createdAt)}
                    </span>
                    <span className="text-white/50 text-xs font-mono">
                      {q.status === "open"
                        ? <span className="text-green-400/60 text-[11px]">{t("marketplace.quests.open")}</span>
                        : shortAddr(q.acceptedByWallet)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky lock message — overlaps table, stays centered in viewport */}
        <div className="pointer-events-none" style={{ gridRow: "1/1", gridColumn: "1/1", position: "sticky", top: "calc(50vh - 70px)", zIndex: 10, display: "flex", justifyContent: "center", alignSelf: "start" }}>
          <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl text-center"
            style={{ background: "rgba(6,8,22,0.82)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", maxWidth: 400 }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <Lock className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-white font-bold text-base leading-snug">{t("marketplace.hire.lockedTitle")}</p>
            <p className="text-white/55 text-sm leading-relaxed">{t("marketplace.hire.lockedDesc")}</p>
          </div>
        </div>
      </div>

      {/* ── Coming Soon modal ── */}
      {showComingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="flex flex-col items-center gap-4 rounded-2xl px-10 py-8 text-center"
            style={{ background: "#0a1230", border: "1px solid rgba(220,150,0,0.3)", boxShadow: "0 0 40px rgba(180,120,0,0.15)", maxWidth: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Gamepad2 className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-white font-bold text-base mb-1">{t("marketplace.quests.comingSoon.title")}</p>
              <p className="text-white/40 text-xs leading-relaxed">
                {t("marketplace.quests.comingSoon.desc")}
              </p>
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="px-5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ background: "rgba(180,120,0,0.35)", border: "1px solid rgba(220,150,0,0.4)", color: "rgba(255,200,80,0.95)" }}
            >
              {t("marketplace.quests.comingSoon.gotIt")}
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            {t("marketplace.quests.pagination.prev")}
          </button>
          <span className="text-white/30 text-xs">
            {t("marketplace.quests.pagination.page", { page, pages })}
          </span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            {t("marketplace.quests.pagination.next")}
          </button>
        </div>
      )}
    </div>
  );
}
