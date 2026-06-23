import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swords, Clock, Zap, Package, ShieldCheck, Lock } from "lucide-react";
import { BACKEND_BASE_URL } from "../../Config";

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

const MAX_DAILY = 5;

const STATUS_COLORS = {
  open:      { text: "text-green-400",  bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.25)" },
  accepted:  { text: "text-amber-300",  bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)" },
  completed: { text: "text-blue-400",   bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)" },
  cancelled: { text: "text-white/25",   bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
};

const formatTime = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const shortId = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : "—");
const shortAddr = (addr) =>
  addr && addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || "—";

function QuestTypeBadge({ questType }) {
  if (!questType) return null;
  const isRes = questType === "resources";
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
      style={{
        background: isRes ? "rgba(74,222,128,0.10)" : "rgba(251,191,36,0.10)",
        border: `1px solid ${isRes ? "rgba(74,222,128,0.22)" : "rgba(251,191,36,0.22)"}`,
        color: isRes ? "#4ade80" : "#fbbf24",
      }}
    >
      {isRes ? <Package className="w-2 h-2" /> : <Zap className="w-2 h-2" />}
      {isRes ? "Res" : "$$"}
    </span>
  );
}

function WaitBadge({ waitHours, buyerSavePercent }) {
  if (!waitHours) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1 py-0.5 rounded whitespace-nowrap"
      style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.18)", color: "rgba(56,189,248,0.8)" }}
    >
      <Clock className="w-2 h-2" />
      {waitHours}h
      {buyerSavePercent != null && <span className="text-green-400 ml-0.5">−{buyerSavePercent}%</span>}
    </span>
  );
}

function DailyLimitBar({ acceptedToday, remaining, limitReached, t }) {
  const pct = Math.round((acceptedToday / MAX_DAILY) * 100);
  return (
    <div className="flex items-center gap-3">
      <ShieldCheck className={`w-4 h-4 shrink-0 ${limitReached ? "text-red-400" : "text-green-400"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/50 font-semibold">{t("profile.questing.dailySlots", "Daily Quest Slots")}</span>
          <span className={`text-[10px] font-bold ${limitReached ? "text-red-400" : "text-green-400"}`}>
            {acceptedToday}/{MAX_DAILY} {t("profile.questing.used", "used")}
            {limitReached && <span className="ml-1 text-red-400/70">({t("profile.questing.limitReached", "limit reached")})</span>}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: limitReached
                ? "linear-gradient(90deg, #f87171, #ef4444)"
                : "linear-gradient(90deg, #4ade80, #22c55e)",
            }}
          />
        </div>
        <p className="text-[9px] text-white/25 mt-0.5">
          {limitReached
            ? t("profile.questing.resetsAt", "Resets at midnight UTC")
            : t("profile.questing.slotsRemaining", "{{count}} slots remaining today", { count: remaining })}
        </p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileQuestingTab({ wallet, token }) {
  const { t } = useTranslation();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dailyStats, setDailyStats] = useState(null);

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [postedRes, acceptedRes, statsRes] = await Promise.all([
          fetch(`${BACKEND_BASE_URL}/api/v1/trade?type=quest&posterWallet=${wallet}&limit=50`, { headers }),
          fetch(`${BACKEND_BASE_URL}/api/v1/trade?type=quest&acceptedByWallet=${wallet}&limit=50`, { headers }),
          fetch(`${BACKEND_BASE_URL}/api/v1/trade/stats/daily?wallet=${wallet}`, { headers }),
        ]);
        const [postedData, acceptedData, statsData] = await Promise.all([
          postedRes.json(), acceptedRes.json(), statsRes.json(),
        ]);
        const posted = (postedData.trades || []).map((q) => ({ ...q, role: "posted" }));
        const accepted = (acceptedData.trades || [])
          .filter((q) => !posted.find((p) => p._id === q._id))
          .map((q) => ({ ...q, role: "accepted" }));
        setQuests([...posted, ...accepted]);
        if (!statsData.error) setDailyStats(statsData);
      } catch (err) {
        console.error("ProfileQuestingTab fetch error:", err);
        setQuests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [wallet, token]);

  const filtered =
    filter === "all" ? quests : quests.filter((q) => q.role === filter);

  const FILTERS = [
    { key: "all",      label: t("profile.questing.filterAll",      "All")      },
    { key: "posted",   label: t("profile.questing.filterPosted",   "Posted")   },
    { key: "accepted", label: t("profile.questing.filterAccepted", "Accepted") },
  ];

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
        <Swords className="w-10 h-10 opacity-20" />
        <p className="text-sm">{t("profile.questing.connectWallet", "Connect your wallet to view quest history")}</p>
      </div>
    );
  }

  return (
    <div className="pt-1 pb-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-semibold text-base">{t("profile.questing.title", "Quest History")}</h3>
          <span className="text-white/30 text-xs">{filtered.length} {t("profile.activities.records", "records")}</span>
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1 rounded-lg text-xs transition-colors"
              style={
                filter === f.key
                  ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.4)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2-card info row: [Money+Resource combined] [Daily Slots] ── */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">

        {/* Card 1 — Money + Resource combined (spans 2 cols) */}
        <div className="sm:col-span-2 rounded-xl px-4 py-3"
          style={{ background: "rgba(20,15,5,0.6)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <div className="grid grid-cols-2 gap-4 divide-x divide-white/10">

            {/* Money Quests */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 text-xs font-semibold">{t("profile.questing.moneyQuestsTitle", "Money Quests (11% pool)")}</span>
              </div>
              <div className="space-y-1.5">
                {QUEST_TIERS.money.map((tier) => (
                  <div key={tier.waitHours} className="grid text-[10px]"
                    style={{ gridTemplateColumns: "2.2rem 5.5rem 6rem 6rem" }}>
                    <span className="text-white/50">{tier.waitHours}h</span>
                    <span className="text-red-400">{t("profile.questing.buyerLabel","Buyer")} −{tier.buyerSavePercent}%</span>
                    <span className="text-amber-300">{t("profile.questing.playerLabel","Player")} +{tier.playerSharePercent}%</span>
                    <span className="text-white/60">{t("profile.questing.platformLabel","Platform")} +{tier.platformSharePercent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Quests */}
            <div className="pl-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Package className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-300 text-xs font-semibold">{t("profile.questing.resourceQuestsTitle", "Resource Quests (20% pool)")}</span>
              </div>
              <div className="space-y-1.5">
                {QUEST_TIERS.resources.map((tier) => (
                  <div key={tier.waitHours} className="grid text-[10px]"
                    style={{ gridTemplateColumns: "2.2rem 5.5rem 6rem 6rem" }}>
                    <span className="text-white/50">{tier.waitHours}h</span>
                    <span className="text-red-400">{t("profile.questing.buyerLabel","Buyer")} −{tier.buyerSavePercent}%</span>
                    <span className="text-amber-300">{t("profile.questing.playerLabel","Player")} +{tier.playerSharePercent}%</span>
                    <span className="text-white/60">{t("profile.questing.platformLabel","Platform")} +{tier.platformSharePercent}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-white/8 flex flex-wrap gap-x-8 gap-y-1">
            <p className="text-white/45 text-[9px]"># {t("profile.questing.notePayouts", "Quests with combined payloads will be paid out using the separate table amounts.")}</p>
            <p className="text-white/45 text-[9px]"># {t("profile.questing.notePlanet", "Planet data will sync when the games go live.")}</p>
          </div>
        </div>

        {/* Card 2 — Daily Quest Slots */}
        <div className="rounded-xl px-4 py-3"
          style={{ background: "rgba(0,15,40,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {dailyStats ? (
            <DailyLimitBar
              acceptedToday={dailyStats.acceptedToday}
              remaining={dailyStats.remaining}
              limitReached={dailyStats.limitReached}
              t={t}
            />
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white/40 shrink-0" />
              <div>
                <p className="text-white/60 text-[10px] font-semibold">{t("profile.questing.dailySlots", "Daily Quest Slots")}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{t("profile.questing.slotsPerDay", "5 slots per day · resets midnight UTC")}</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Table section with lock overlay ── */}
      <div style={{ display: "grid" }}>
        {/* Content */}
        <div style={{ gridRow: "1/1", gridColumn: "1/1" }}>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : (
            <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "clip" }}>
              {/* Header */}
              <div className="overflow-x-auto" style={{ position: "sticky", top: 158, zIndex: 5, background: "rgba(4,8,28,0.98)" }}>
                <div className="grid min-w-[760px] px-4 py-5 text-[10px] font-semibold uppercase tracking-widest text-white/30"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.8fr 1.5fr 1fr 1.1fr" }}>
                  <span>{t("profile.questing.colQuestNo","Quest No")}</span>
                  <span>{t("profile.questing.colPickupPlanet","Pickup Planet")}</span>
                  <span>{t("profile.questing.colDropOffPlanet","Drop Off Planet")}</span>
                  <span>{t("profile.questing.colItemGoods","Item / Goods")}</span>
                  <span>{t("profile.questing.colSplit","Split")}</span>
                  <span>{t("profile.questing.colTimeActive","Time Active")}</span>
                  <span>{t("profile.questing.colAssignedTo","Assigned To")}</span>
                </div>
              </div>
              {/* Body */}
              <div className="overflow-x-auto">
                {filtered.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="grid min-w-[760px] px-4 py-4 items-center"
                      style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.8fr 1.5fr 1fr 1.1fr" }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <div key={j} className="h-3 rounded" style={{ background: "rgba(255,255,255,0.05)", width: "60%" }} />
                      ))}
                    </div>
                  ))
                ) : (
                  filtered.map((q, i) => {
                    const colors = STATUS_COLORS[q.status] || STATUS_COLORS.open;
                    const acceptedName = q.acceptedByWallet ? shortAddr(q.acceptedByWallet) : "—";
                    return (
                      <div key={q._id} className="grid min-w-[760px] px-4 py-3 items-center text-sm"
                        style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.04)", gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.8fr 1.5fr 1fr 1.1fr" }}>
                        <div className="flex flex-col gap-1">
                          <span className="text-white/80 text-xs font-mono">{shortId(q._id)}</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`text-[9px] font-semibold capitalize ${colors.text}`}
                              style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, padding: "1px 5px", display: "inline-block" }}>
                              {q.status}
                            </span>
                            <QuestTypeBadge questType={q.questType} />
                          </div>
                        </div>
                        <span className="text-white/55 text-xs">{q.pickupPlanet || <span className="italic text-white/35">{t("profile.questing.inGame","In-game")}</span>}</span>
                        <span className="text-white/55 text-xs">{q.dropOffPlanet || <span className="italic text-white/35">{t("profile.questing.inGame","In-game")}</span>}</span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-white/85 text-xs font-medium truncate">{q.title || "—"}</span>
                          {q.offering && <span className="text-white/55 text-[10px] truncate">{q.offering}</span>}
                        </div>
                        <div className="flex flex-col gap-1 items-start">
                          <WaitBadge waitHours={q.waitHours} buyerSavePercent={q.buyerSavePercent} />
                          {q.playerSharePercent != null && (
                            <div className="text-[9px] leading-tight">
                              <span className="text-amber-300">{t("profile.questing.playerLabel","Player")} +{q.playerSharePercent}%</span>
                              {" · "}
                              <span className="text-white/50">{t("profile.questing.platLabel","Plat")} +{q.platformSharePercent}%</span>
                            </div>
                          )}
                          {q.playerEarnsAmount != null && <span className="text-[9px] text-amber-300">{t("profile.questing.earned","Earned")}: {q.playerEarnsAmount} HB</span>}
                        </div>
                        <span className="text-white/60 text-xs font-mono">{formatTime(q.createdAt)}</span>
                        <span className="text-white/50 text-xs font-mono">
                          {q.status === "open" ? <span className="text-green-400/60">{t("profile.questing.statusOpen","Open")}</span> : acceptedName}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lock card — overlays only the table, same as For Hire */}
        {!loading && (
          <div className="pointer-events-none" style={{ gridRow: "1/1", gridColumn: "1/1", position: "sticky", top: "calc(50vh - 80px)", zIndex: 10, display: "flex", justifyContent: "center", alignSelf: "start" }}>
            <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl text-center"
              style={{ background: "rgba(6,8,22,0.82)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", maxWidth: 420 }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <Lock className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-white font-bold text-base leading-snug">Hyper Tek Gaming content for display purposes only.</p>
              <p className="text-white/55 text-sm leading-relaxed">This is part of Hyper Tek's genuine 'Play to Earn' system, where players can earn real cash rewards, and or Materials/Resources.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
