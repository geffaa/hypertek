import { useEffect, useState } from "react";
import { Swords, Clock, Zap, Package, ShieldCheck } from "lucide-react";
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

// ── Daily limit progress bar ──────────────────────────────────────────────────
function DailyLimitBar({ acceptedToday, remaining, limitReached }) {
  const pct = Math.round((acceptedToday / MAX_DAILY) * 100);
  return (
    <div className="flex items-center gap-3">
      <ShieldCheck className={`w-4 h-4 shrink-0 ${limitReached ? "text-red-400" : "text-green-400"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/50 font-semibold">Daily Quest Slots</span>
          <span className={`text-[10px] font-bold ${limitReached ? "text-red-400" : "text-green-400"}`}>
            {acceptedToday}/{MAX_DAILY} used
            {limitReached && <span className="ml-1 text-red-400/70">(limit reached)</span>}
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
            ? "Resets at midnight UTC"
            : `${remaining} slot${remaining !== 1 ? "s" : ""} remaining today`}
        </p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileQuestingTab({ wallet, token }) {
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

        // Fetch quests posted by + accepted by this wallet, and daily stats — all in parallel
        const [postedRes, acceptedRes, statsRes] = await Promise.all([
          fetch(`${BACKEND_BASE_URL}/api/v1/trade?type=quest&posterWallet=${wallet}&limit=50`, { headers }),
          fetch(`${BACKEND_BASE_URL}/api/v1/trade?type=quest&acceptedByWallet=${wallet}&limit=50`, { headers }),
          fetch(`${BACKEND_BASE_URL}/api/v1/trade/stats/daily?wallet=${wallet}`, { headers }),
        ]);

        const [postedData, acceptedData, statsData] = await Promise.all([
          postedRes.json(),
          acceptedRes.json(),
          statsRes.json(),
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

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
        <Swords className="w-10 h-10 opacity-20" />
        <p className="text-sm">Connect your wallet to view quest history</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-semibold text-base">Quest History</h3>
          <span className="text-white/30 text-xs">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex gap-1">
          {["all", "posted", "accepted"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-lg text-xs capitalize transition-colors"
              style={
                filter === f
                  ? { background: "rgba(0,42,168,0.8)", border: "1px solid rgba(0,80,255,0.4)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-card info row ── */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Card 1 — Daily Quest Slots */}
        <div className="rounded-xl px-4 py-3"
          style={{ background: "rgba(0,15,40,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {dailyStats ? (
            <DailyLimitBar
              acceptedToday={dailyStats.acceptedToday}
              remaining={dailyStats.remaining}
              limitReached={dailyStats.limitReached}
            />
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white/20 shrink-0" />
              <div>
                <p className="text-white/40 text-[10px] font-semibold">Daily Quest Slots</p>
                <p className="text-white/20 text-[10px] mt-0.5">5 slots per day · resets midnight UTC</p>
              </div>
            </div>
          )}
        </div>

        {/* Card 2 — Money Quests */}
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

        {/* Card 3 — Resource Quests */}
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
          <p className="text-white/20 text-[9px] mt-2">Planet data will sync once the game goes live.</p>
        </div>

      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/25 gap-3">
          <Swords className="w-8 h-8 opacity-20" />
          <p className="text-sm">No quest history yet</p>
          <p className="text-xs text-white/15">Complete quests in-game to see them here</p>
        </div>
      ) : (
        /* ── Table ── */
        <div className="rounded-2xl overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Header */}
          <div
            className="grid min-w-[760px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
            style={{
              background: "rgba(0,20,80,0.95)",
              gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.8fr 1.5fr 1fr 1.1fr",
              position: "sticky", top: 0, zIndex: 10,
              backdropFilter: "blur(8px)",
            }}
          >
            <span>Quest No</span>
            <span>Pickup Planet</span>
            <span>Drop Off Planet</span>
            <span>Item / Goods</span>
            <span>Split</span>
            <span>Time Active</span>
            <span>Assigned To</span>
          </div>

          {/* Rows */}
          {filtered.map((q, i) => {
            const colors = STATUS_COLORS[q.status] || STATUS_COLORS.open;
            const acceptedName = q.acceptedByWallet ? shortAddr(q.acceptedByWallet) : "—";

            return (
              <div
                key={q._id}
                className="grid min-w-[760px] px-4 py-3 items-center text-sm"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.8fr 1.5fr 1fr 1.1fr",
                }}
              >
                {/* Quest No */}
                <div className="flex flex-col gap-1">
                  <span className="text-white/80 text-xs font-mono">{shortId(q._id)}</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span
                      className={`text-[9px] font-semibold capitalize ${colors.text}`}
                      style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, padding: "1px 5px", display: "inline-block" }}
                    >
                      {q.status}
                    </span>
                    <QuestTypeBadge questType={q.questType} />
                  </div>
                </div>

                {/* Pickup Planet */}
                <span className="text-white/35 text-xs">
                  {q.pickupPlanet || <span className="italic text-white/20">In-game</span>}
                </span>

                {/* Drop Off Planet */}
                <span className="text-white/35 text-xs">
                  {q.dropOffPlanet || <span className="italic text-white/20">In-game</span>}
                </span>

                {/* Item / Goods */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-white/80 text-xs font-medium truncate">{q.title || "—"}</span>
                  {q.offering && (
                    <span className="text-white/35 text-[10px] truncate">{q.offering}</span>
                  )}
                </div>

                {/* Split */}
                <div className="flex flex-col gap-1">
                  <WaitBadge waitHours={q.waitHours} buyerSavePercent={q.buyerSavePercent} />
                  {q.playerSharePercent != null && (
                    <div className="text-[9px] text-white/30 leading-tight">
                      <span className="text-amber-300/55">Player +{q.playerSharePercent}%</span>
                      {" · "}
                      <span className="text-white/25">Plat +{q.platformSharePercent}%</span>
                    </div>
                  )}
                  {q.playerEarnsAmount != null && (
                    <span className="text-[9px] text-amber-300/60">
                      Earned: {q.playerEarnsAmount} HB
                    </span>
                  )}
                </div>

                {/* Time Active */}
                <span className="text-white/40 text-xs font-mono">
                  {formatTime(q.createdAt)}
                </span>

                {/* Assigned To */}
                <span className="text-white/50 text-xs font-mono">
                  {q.status === "open" ? (
                    <span className="text-green-400/60">Open</span>
                  ) : (
                    acceptedName
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
