import { useEffect, useState } from "react";
import { Swords, Gamepad2 } from "lucide-react";
import { BACKEND_BASE_URL } from "../../Config";

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

export default function ProfileQuestingTab({ wallet, token }) {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | posted | accepted

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }

    const fetchQuests = async () => {
      setLoading(true);
      try {
        // Fetch quests posted by this wallet
        const postedRes = await fetch(
          `${BACKEND_BASE_URL}/api/v1/trade?type=quest&posterWallet=${wallet}&limit=50`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const postedData = await postedRes.json();
        const posted = (postedData.trades || []).map((q) => ({ ...q, role: "posted" }));

        // Fetch quests accepted by this wallet
        const acceptedRes = await fetch(
          `${BACKEND_BASE_URL}/api/v1/trade?type=quest&acceptedByWallet=${wallet}&limit=50`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const acceptedData = await acceptedRes.json();
        const accepted = (acceptedData.trades || [])
          .filter((q) => !posted.find((p) => p._id === q._id))
          .map((q) => ({ ...q, role: "accepted" }));

        setQuests([...posted, ...accepted]);
      } catch (err) {
        console.error("ProfileQuestingTab fetch error:", err);
        setQuests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, [wallet, token]);

  const filtered =
    filter === "all"
      ? quests
      : quests.filter((q) => q.role === filter);

  // ── Empty / no wallet ──────────────────────────────────────────────────────
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

        {/* Filter */}
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

      {/* ── In-game note ── */}
      <div className="mb-5 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(180,120,0,0.06)", border: "1px solid rgba(180,120,0,0.15)" }}>
        <Gamepad2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-amber-300/60 text-xs leading-snug">
          Quests are generated in-game when sellers choose a reduced commission. Planet data will sync once the game goes live.
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
            className="grid min-w-[700px] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30"
            style={{
              background: "rgba(0,20,80,0.5)",
              gridTemplateColumns: "1fr 1.2fr 1.2fr 1.8fr 1.4fr 1fr 1.2fr",
            }}
          >
            <span>Quest No</span>
            <span>Pickup Planet</span>
            <span>Drop Off Planet</span>
            <span>Item / Goods</span>
            <span>Commission</span>
            <span>Time Active</span>
            <span>Assigned To</span>
          </div>

          {/* Rows */}
          {filtered.map((q, i) => {
            const colors = STATUS_COLORS[q.status] || STATUS_COLORS.open;
            const acceptedName =
              q.acceptedByWallet ? shortAddr(q.acceptedByWallet) : "—";

            return (
              <div
                key={q._id}
                className="grid min-w-[700px] px-4 py-3 items-center text-sm"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  gridTemplateColumns: "1fr 1.2fr 1.2fr 1.8fr 1.4fr 1fr 1.2fr",
                }}
              >
                {/* Quest No */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/80 text-xs font-mono">{shortId(q._id)}</span>
                  <span
                    className={`text-[10px] font-semibold capitalize ${colors.text}`}
                    style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, padding: "1px 5px", display: "inline-block", width: "fit-content" }}
                  >
                    {q.status}
                  </span>
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

                {/* Commission */}
                <span className="text-amber-300/80 text-xs font-semibold">
                  {q.reward > 0 ? `${q.reward} HB` : "—"}
                </span>

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
