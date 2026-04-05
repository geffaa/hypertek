import { useEffect, useState } from "react";
import { Target, Gamepad2 } from "lucide-react";
import { BACKEND_BASE_URL } from "../../Config";

const STATUS_COLORS = {
  open:      { text: "text-red-400",    bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.25)" },
  claimed:   { text: "text-amber-300",  bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)" },
  completed: { text: "text-blue-400",   bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)" },
  cancelled: { text: "text-white/25",   bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
};

const shortId = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : "—");
const shortAddr = (addr) =>
  addr && addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || "—";

export default function ProfileBountyTab({ wallet, token }) {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | posted | completed

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }

    const fetchBounties = async () => {
      setLoading(true);
      try {
        // Bounties posted by this wallet
        const postedRes = await fetch(
          `${BACKEND_BASE_URL}/api/v1/bounty?posterWallet=${wallet}&limit=50`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const postedData = await postedRes.json();
        const posted = (postedData.bounties || []).map((b) => ({ ...b, role: "posted" }));

        // Bounties completed by this wallet (claimed)
        const completedRes = await fetch(
          `${BACKEND_BASE_URL}/api/v1/bounty?claimedBy=${wallet}&limit=50`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const completedData = await completedRes.json();
        const completed = (completedData.bounties || [])
          .filter((b) => !posted.find((p) => p._id === b._id))
          .map((b) => ({ ...b, role: "completed" }));

        setBounties([...posted, ...completed]);
      } catch (err) {
        console.error("ProfileBountyTab fetch error:", err);
        setBounties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBounties();
  }, [wallet, token]);

  const filtered =
    filter === "all"
      ? bounties
      : bounties.filter((b) => b.role === filter);

  // ── Empty / no wallet ──────────────────────────────────────────────────────
  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
        <Target className="w-10 h-10 opacity-20" />
        <p className="text-sm">Connect your wallet to view bounty history</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-red-400" />
          <h3 className="text-white font-semibold text-base">Bounty History</h3>
          <span className="text-white/30 text-xs">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter */}
        <div className="flex gap-1">
          {["all", "posted", "completed"].map((f) => (
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

      {/* ── In-game note ── */}
      <div className="mb-5 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}>
        <Gamepad2 className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-red-300/50 text-xs leading-snug">
          Bounties are in-game contracts. Posted bounties and completions you've claimed will appear here.
        </p>
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
          <Target className="w-8 h-8 opacity-20" />
          <p className="text-sm">No bounty history yet</p>
          <p className="text-xs text-white/15">Post or complete bounties in-game to see them here</p>
        </div>
      ) : (
        /* ── Table ── */
        <div className="rounded-2xl overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Header */}
          <div
            className="grid min-w-[560px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
            style={{
              background: "rgba(0,20,80,0.5)",
              gridTemplateColumns: "1fr 1.5fr 1.5fr 1.2fr 1fr",
            }}
          >
            <span>Bounty No</span>
            <span>Hit On</span>
            <span>Rewards</span>
            <span>Completed By</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          {filtered.map((b, i) => {
            const colors = STATUS_COLORS[b.status] || STATUS_COLORS.open;
            const completedBy =
              b.claimedBy ? shortAddr(b.claimedBy) : "—";

            return (
              <div
                key={b._id}
                className="grid min-w-[560px] px-4 py-3 items-center"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  gridTemplateColumns: "1fr 1.5fr 1.5fr 1.2fr 1fr",
                }}
              >
                {/* Bounty No */}
                <span className="text-white/70 text-xs font-mono">{shortId(b._id)}</span>

                {/* Hit On */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-white/80 text-xs font-medium truncate">
                    {b.targetName || "—"}
                  </span>
                  {b.title && (
                    <span className="text-white/30 text-[10px] truncate">{b.title}</span>
                  )}
                </div>

                {/* Rewards */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-amber-300/80 text-xs font-semibold">
                    {b.reward > 0 ? `${b.reward} HB` : "—"}
                  </span>
                  {b.rewardType === "materials" && (
                    <span className="text-white/30 text-[10px]">Materials</span>
                  )}
                </div>

                {/* Completed By */}
                <span className="text-white/50 text-xs font-mono">
                  {b.status === "completed" ? completedBy : "—"}
                </span>

                {/* Status */}
                <span
                  className={`text-[10px] font-semibold capitalize ${colors.text}`}
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    padding: "2px 7px",
                    display: "inline-block",
                    width: "fit-content",
                  }}
                >
                  {b.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
