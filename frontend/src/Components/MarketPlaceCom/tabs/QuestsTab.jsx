import { useState, useEffect, useCallback } from "react";
import { Swords, Gamepad2, Clock, Zap, Package } from "lucide-react";
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
      {isResources ? "Resources" : "Money"}
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
  if (!q.questType || !q.waitHours) {
    return (
      <span className="text-amber-300/80 text-xs font-semibold">
        {q.reward > 0 ? `${q.reward} HB` : "—"}
      </span>
    );
  }

  const tiers = QUEST_TIERS[q.questType] || [];
  const tier = tiers.find((t) => t.waitHours === q.waitHours) || {};
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
          <span className="text-green-400/60">Buyer −{buyerSave}%</span>
          {" · "}
          <span className="text-amber-300/50">Player +{player}%</span>
          {" · "}
          <span className="text-white/30">Platform +{platform}%</span>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QuestsTab() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [, setTick] = useState(0);

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
        src="/avatar/lithionites-female.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-12 top-0 h-[700px] w-auto object-contain object-top"
        style={{ opacity: 0.06, zIndex: 0 }}
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-amber-400" />
          <h2 className="text-white font-bold text-lg">Quest Board</h2>
          <span className="text-white/30 text-sm">{total} quests</span>
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className="px-2.5 py-1 rounded-full text-xs capitalize"
              style={statusFilter === f
                ? { background: "rgba(180,120,0,0.6)", border: "1px solid rgba(200,140,0,0.4)", color: "#fff" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── In-game note + CTA ── */}
      <div className="mb-5 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 justify-between"
        style={{ background: "rgba(180,120,0,0.07)", border: "1px solid rgba(180,120,0,0.18)" }}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Gamepad2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300/80 text-xs font-semibold">In-Game Feature</p>
            <p className="text-white/35 text-[11px] leading-snug mt-0.5">
              Quests are auto-generated when sellers choose a reduced commission. Players can complete up to 5 quests per day.
              The commission pool is split between the buyer discount, the player reward, and the platform.
            </p>
          </div>
        </div>
        <span className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
          style={{ background: "rgba(180,120,0,0.35)", border: "1px solid rgba(220,150,0,0.4)", color: "rgba(255,200,80,0.95)", cursor: "default" }}>
          Want to earn from quests? Play the game →
        </span>
      </div>

      {/* ── Commission split legend ── */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Money quests */}
        <div className="rounded-xl px-4 py-3"
          style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300/80 text-xs font-semibold">Money Quests (11% pool)</span>
          </div>
          <div className="space-y-1">
            {QUEST_TIERS.money.map((t) => (
              <div key={t.waitHours} className="flex items-center gap-2 text-[10px]">
                <span className="text-white/30 w-6">{t.waitHours}h</span>
                <span className="text-green-400/70">Buyer −{t.buyerSavePercent}%</span>
                <span className="text-white/20">·</span>
                <span className="text-amber-300/60">Player +{t.playerSharePercent}%</span>
                <span className="text-white/20">·</span>
                <span className="text-white/30">Platform +{t.platformSharePercent}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Resource quests */}
        <div className="rounded-xl px-4 py-3"
          style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-300/80 text-xs font-semibold">Resource Quests (20% pool)</span>
          </div>
          <div className="space-y-1">
            {QUEST_TIERS.resources.map((t) => (
              <div key={t.waitHours} className="flex items-center gap-2 text-[10px]">
                <span className="text-white/30 w-6">{t.waitHours}h</span>
                <span className="text-green-400/70">Buyer −{t.buyerSavePercent}%</span>
                <span className="text-white/20">·</span>
                <span className="text-amber-300/60">Player +{t.playerSharePercent}%</span>
                <span className="text-white/20">·</span>
                <span className="text-white/30">Platform +{t.platformSharePercent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
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
          <p className="text-sm">No {statusFilter} quests</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Table header */}
          <div
            className="grid min-w-[820px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
            style={{
              background: "rgba(10,20,60,0.6)",
              gridTemplateColumns: "1fr 1.1fr 1.1fr 1.8fr 1.6fr 1fr 1.2fr",
            }}
          >
            <span>Questing No</span>
            <span>Pickup Planet</span>
            <span>Drop Off Planet</span>
            <span>Item / Goods</span>
            <span>Commission Split</span>
            <span>Questing Time</span>
            <span>Assigned To</span>
          </div>

          {/* Table rows */}
          {quests.map((q, i) => {
            const colors = STATUS_COLORS[q.status] || STATUS_COLORS.open;
            return (
              <div
                key={q._id}
                className="grid min-w-[820px] px-4 py-3 items-center"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  gridTemplateColumns: "1fr 1.1fr 1.1fr 1.8fr 1.6fr 1fr 1.2fr",
                }}
              >
                {/* Questing No */}
                <div className="flex flex-col gap-1">
                  <span className="text-white/70 text-xs font-mono">{shortId(q._id)}</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span
                      className={`text-[9px] font-semibold capitalize ${colors.text}`}
                      style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 3, padding: "1px 4px", display: "inline-block" }}
                    >
                      {q.status}
                    </span>
                    <WaitTierBadge waitHours={q.waitHours} buyerSavePercent={q.buyerSavePercent} />
                  </div>
                </div>

                {/* Pickup Planet */}
                <span className="text-white/50 text-xs">
                  {q.pickupPlanet || <span className="text-white/20 italic">In-game</span>}
                </span>

                {/* Drop Off Planet */}
                <span className="text-white/50 text-xs">
                  {q.dropOffPlanet || <span className="text-white/20 italic">In-game</span>}
                </span>

                {/* Item / Goods */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-white/80 text-xs font-medium truncate">{q.title || "—"}</span>
                  {q.offering && (
                    <span className="text-white/35 text-[10px] truncate">{q.offering}</span>
                  )}
                </div>

                {/* Commission Split */}
                <SplitInfo q={q} />

                {/* Questing Time */}
                <span className="text-white/40 text-xs font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 opacity-50" />
                  {formatElapsed(q.createdAt)}
                </span>

                {/* Assigned To */}
                <span className="text-white/50 text-xs font-mono">
                  {q.status === "open"
                    ? <span className="text-green-400/60 text-[11px]">Open</span>
                    : shortAddr(q.acceptedByWallet)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>Prev</button>
          <span className="text-white/30 text-xs">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>Next</button>
        </div>
      )}
    </div>
  );
}
