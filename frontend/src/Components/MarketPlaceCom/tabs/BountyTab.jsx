import { useState, useEffect, useCallback } from "react";
import { Target, Gamepad2, Swords, Clock, Zap } from "lucide-react";
import { BACKEND_BASE_URL } from "../../../Config";

// ── Helpers ───────────────────────────────────────────────────────────────────
const shortId   = (id)   => id   ? `#${String(id).slice(-6).toUpperCase()}`               : "—";
const shortAddr = (addr) => addr && addr.length > 10
  ? `${addr.slice(0, 6)}…${addr.slice(-4)}`
  : (addr || "—");

function rewardLabel(b) {
  if (b.rewardType === "materials") return b.rewardMaterials || "In-game materials";
  return b.reward > 0 ? `${b.reward} HB` : "—";
}

const STATUS_COLORS = {
  open:      { text: "text-green-400",   bg: "rgba(74,222,128,0.10)",   border: "rgba(74,222,128,0.25)" },
  claimed:   { text: "text-amber-300",   bg: "rgba(251,191,36,0.10)",   border: "rgba(251,191,36,0.25)" },
  completed: { text: "text-blue-400",    bg: "rgba(59,130,246,0.10)",   border: "rgba(59,130,246,0.25)" },
  cancelled: { text: "text-white/25",    bg: "rgba(255,255,255,0.04)",  border: "rgba(255,255,255,0.10)" },
  expired:   { text: "text-red-400/60",  bg: "rgba(239,68,68,0.06)",    border: "rgba(239,68,68,0.15)" },
};

// ── Preview data ──────────────────────────────────────────────────────────────
const PREVIEW_BOUNTIES = [
  {
    _id: "pb-1", status: "open",
    title: "Hit Contract: IronFist_99", targetName: "IronFist_99",
    reward: 150, rewardType: "hyperBucks",
    expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(),
    posterName: "Intel Division",
  },
  {
    _id: "pb-2", status: "open",
    title: "Hit Contract: Lt. Shadow Wolf", targetName: "Lt. Shadow Wolf",
    reward: 100, rewardType: "hyperBucks",
    expiresAt: new Date(Date.now() + 25 * 86400000).toISOString(),
    posterName: "Defence Ministry",
  },
  {
    _id: "pb-3", status: "open",
    title: "Hit Contract: WarHawk_Prime", targetName: "WarHawk_Prime",
    reward: 200, rewardType: "hyperBucks",
    expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
    posterName: "Cyber Division",
  },
  {
    _id: "pb-4", status: "claimed",
    title: "Hit Contract: Commander Vex", targetName: "Commander Vex",
    reward: 50, rewardType: "hyperBucks",
    expiresAt: new Date(Date.now() + 18 * 86400000).toISOString(),
    posterName: "HQ Command",
    claimedBy: "0xaB12…dF99",
  },
  {
    _id: "pb-5", status: "open",
    title: "Hit Contract: Renegade_Echo", targetName: "Renegade_Echo",
    reward: 0, rewardType: "materials", rewardMaterials: "5000 Barrels of Oil",
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    posterName: "Resistance HQ",
  },
  {
    _id: "pb-6", status: "completed",
    title: "Hit Contract: NeonRacer_Pro", targetName: "NeonRacer_Pro",
    reward: 0, rewardType: "materials", rewardMaterials: "1000 Energy Crystals",
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    posterName: "TrackOwner_1",
    claimedBy: "0x77cA…3E21",
  },
];

const STATUS_FILTERS = ["open", "claimed", "completed"];
const LIMIT = 20;

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BountyTab() {
  const [bounties, setBounties]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);

  const fetchBounties = useCallback(async () => {
    setLoading(true);
    try {
      const r    = await fetch(`${BACKEND_BASE_URL}/api/v1/bounty?status=${statusFilter}&page=${page}&limit=${LIMIT}`);
      const data = await r.json();
      const fetched = data.bounties || [];
      if (fetched.length > 0) {
        setBounties(fetched);
        setTotal(data.total || 0);
      } else if (page === 1) {
        const preview = PREVIEW_BOUNTIES.filter((b) => b.status === statusFilter);
        setBounties(preview);
        setTotal(preview.length);
      } else {
        setBounties([]);
        setTotal(0);
      }
    } catch {
      if (page === 1) {
        const preview = PREVIEW_BOUNTIES.filter((b) => b.status === statusFilter);
        setBounties(preview);
        setTotal(preview.length);
      } else {
        setBounties([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchBounties(); }, [fetchBounties]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-red-400/80" />
          <h2 className="text-white font-bold text-lg">Bounty Board</h2>
          <span className="text-white/30 text-sm">{total} contract{total !== 1 ? "s" : ""}</span>
        </div>

        {/* Status filters */}
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="px-2.5 py-1 rounded-full text-xs capitalize"
              style={statusFilter === f
                ? { background: "rgba(160,30,30,0.8)", border: "1px solid rgba(255,60,60,0.4)", color: "#fff" }
                : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── In-game notice ── */}
      <div className="mb-6 rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: "rgba(255,60,60,0.05)", border: "1px solid rgba(255,60,60,0.14)" }}>
        <Gamepad2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-300/80 text-xs font-semibold mb-0.5">In-Game Feature — View Only</p>
          <p className="text-white/35 text-[11px] leading-snug">
            Bounties are created by game players and the game system. Accepting and completing
            bounties happens in-game only. This board is shown for transparency and to
            encourage new players to join.
          </p>
        </div>
      </div>

      {/* ── Info strip ── */}
      <div className="mb-6 px-4 py-2.5 rounded-xl text-xs text-white/35 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span><Swords className="w-3 h-3 inline mr-1" />Battle resolved in-game automatically</span>
        <span><Zap className="w-3 h-3 inline mr-1" />20% platform commission on reward</span>
        <span><Clock className="w-3 h-3 inline mr-1" />Contracts expire in 30 days</span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : bounties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/25 gap-3">
          <Target className="w-10 h-10 opacity-20" />
          <p className="text-sm">No {statusFilter} contracts</p>
          <p className="text-xs text-white/15">Bounties are posted by game players and the game system</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Table header */}
          <div
            className="grid min-w-[640px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
            style={{
              background: "rgba(30,10,10,0.6)",
              gridTemplateColumns: "1fr 1.6fr 1.4fr 1.2fr 1.2fr 0.8fr",
            }}
          >
            <span>Bounty No</span>
            <span>Target (Hit On)</span>
            <span>Reward</span>
            <span>Posted By</span>
            <span>Claimed By</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          {bounties.map((b, i) => {
            const colors    = STATUS_COLORS[b.status] || STATUS_COLORS.open;
            const expiresIn = b.expiresAt
              ? Math.max(0, Math.round((new Date(b.expiresAt) - Date.now()) / 86400000))
              : null;

            return (
              <div
                key={b._id}
                className="grid min-w-[640px] px-4 py-3 items-center"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  gridTemplateColumns: "1fr 1.6fr 1.4fr 1.2fr 1.2fr 0.8fr",
                }}
              >
                {/* Bounty No */}
                <span className="text-white/60 text-xs font-mono">{shortId(b._id)}</span>

                {/* Target */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-red-300/80 text-xs font-semibold truncate">
                    {b.targetName || b.title || "—"}
                  </span>
                  {expiresIn !== null && b.status === "open" && (
                    <span className="text-white/25 text-[9px]">Expires in {expiresIn}d</span>
                  )}
                </div>

                {/* Reward */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-amber-300/80 text-xs font-semibold">
                    {rewardLabel(b)}
                  </span>
                  {b.rewardType === "hyperBucks" && b.reward > 0 && (
                    <span className="text-white/25 text-[9px]">
                      {Math.round(b.reward * 0.8)} HB net
                    </span>
                  )}
                </div>

                {/* Posted By */}
                <span className="text-white/50 text-xs truncate">
                  {b.posterName || shortAddr(b.posterWallet)}
                </span>

                {/* Claimed By */}
                <span className="text-white/40 text-xs font-mono">
                  {b.claimedBy ? shortAddr(b.claimedBy) : "—"}
                </span>

                {/* Status badge */}
                <span
                  className={`text-[10px] font-semibold capitalize inline-block w-fit ${colors.text}`}
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    padding: "2px 7px",
                  }}
                >
                  {b.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            Prev
          </button>
          <span className="text-white/30 text-xs">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
