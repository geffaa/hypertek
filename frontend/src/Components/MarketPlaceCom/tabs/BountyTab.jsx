import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { Target, Plus, X, Clock, CheckCircle2, Gamepad2, Info, Swords, Shield, Zap, Lock } from "lucide-react";
import { BACKEND_BASE_URL, getImageUrl } from "../../../Config";
import LazyImage from "../../Common/LazyImage";
import popularFallback from "../../../assets/images/popular/popolar.png";

// ── Reward display helper ─────────────────────────────────────────────────────
function rewardLabel(bounty) {
  if (bounty.rewardType === "materials") return bounty.rewardMaterials || "In-game materials";
  return `${bounty.reward} Hyper Bucks`;
}
function netRewardLabel(bounty) {
  if (bounty.rewardType === "materials") return `${bounty.rewardMaterials} (after 20% commission)`;
  const net = Math.round(bounty.reward * 0.8);
  return `${net} HB (after 20%)`;
}

// ── Battle Modal ──────────────────────────────────────────────────────────────
function BattleModal({ bounty, onClose }) {
  // phase: "confirm" | "fighting" | "victory" | "defeat"
  const [phase, setPhase] = useState("confirm");
  const [countdown, setCountdown] = useState(3);

  function startBattle() {
    setPhase("fighting");
    let c = 3;
    setCountdown(3);
    const tick = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(tick);
        // random outcome weighted 55% victory for demo
        setTimeout(() => {
          setPhase(Math.random() < 0.55 ? "victory" : "defeat");
        }, 600);
      }
    }, 900);
  }

  const net = bounty.rewardType === "materials"
    ? (bounty.rewardMaterials || "materials")
    : `${Math.round(bounty.reward * 0.8)} Hyper Bucks`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        style={{ background: "#080916", border: "1px solid rgba(255,60,60,0.25)" }}
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/30 hover:text-white z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── CONFIRM phase ── */}
        {phase === "confirm" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />
              <span className="text-white font-bold text-sm">Accept Hit Contract</span>
            </div>

            <div
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Target</p>
              <p className="text-red-300 font-bold">{bounty.targetName}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mt-1">Reward if victorious</p>
              <p className="text-amber-300 font-bold text-sm">{net}</p>
            </div>

            <div
              className="rounded-xl p-3 flex flex-col gap-1.5"
              style={{ background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.12)" }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300/80 text-[11px] font-semibold">How battle works</span>
              </div>
              <p className="text-white/40 text-[10px] leading-relaxed">
                Your top 5 officers will be automatically deployed against{" "}
                <span className="text-red-300/80">{bounty.targetName}</span>'s officers in an
                animated strength battle. The system determines the winner — no manual action
                required. Result is logged to your mail slot.
              </p>
            </div>

            <button
              onClick={startBattle}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, rgba(180,20,20,0.9), rgba(120,10,10,0.9))", border: "1px solid rgba(255,60,60,0.3)" }}
            >
              <Swords className="w-4 h-4" />
              Deploy Officers
            </button>
            <p className="text-white/20 text-[10px] text-center">20% platform commission applies on reward</p>
          </div>
        )}

        {/* ── FIGHTING phase ── */}
        {phase === "fighting" && (
          <div className="p-8 flex flex-col items-center gap-6">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,40,40,0.1)",
                  border: "2px solid rgba(255,40,40,0.3)",
                  animation: "pulse 0.8s ease-in-out infinite",
                }}
              >
                <Swords className="w-9 h-9 text-red-400" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white font-bold">Battle in progress…</p>
              <p className="text-white/40 text-xs">Officers deployed — calculating strength</p>
              {countdown > 0 && (
                <span
                  className="text-4xl font-[Goldman] font-bold mt-2"
                  style={{ color: "rgba(255,80,80,0.9)" }}
                >
                  {countdown}
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "rgba(255,60,60,0.7)",
                    animation: `bounce 0.6s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── VICTORY phase ── */}
        {phase === "victory" && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,180,80,0.15)", border: "2px solid rgba(0,220,100,0.4)" }}
            >
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p
                className="text-2xl font-[Goldman] font-bold mb-1"
                style={{ color: "rgba(80,255,140,0.95)" }}
              >
                VICTORY
              </p>
              <p className="text-white/50 text-xs">Your officers defeated {bounty.targetName}</p>
            </div>
            <div
              className="w-full rounded-xl p-4"
              style={{ background: "rgba(0,180,80,0.08)", border: "1px solid rgba(0,220,100,0.2)" }}
            >
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Reward Earned</p>
              <p className="text-green-300 font-bold text-lg">{net}</p>
              <p className="text-white/30 text-[10px] mt-1">Credited after 20% platform commission</p>
            </div>
            <p className="text-white/30 text-[11px]">
              Battle report sent to your mail slot. Full replay available at game launch.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(0,140,60,0.6)", border: "1px solid rgba(0,200,80,0.3)" }}
            >
              Close
            </button>
          </div>
        )}

        {/* ── DEFEAT phase ── */}
        {phase === "defeat" && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(200,30,30,0.15)", border: "2px solid rgba(255,60,60,0.4)" }}
            >
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p
                className="text-2xl font-[Goldman] font-bold mb-1"
                style={{ color: "rgba(255,80,80,0.95)" }}
              >
                DEFEATED
              </p>
              <p className="text-white/50 text-xs">{bounty.targetName} repelled your officers</p>
            </div>
            <div
              className="w-full rounded-xl p-4"
              style={{ background: "rgba(255,40,40,0.06)", border: "1px solid rgba(255,60,60,0.18)" }}
            >
              <p className="text-white/50 text-[11px] leading-relaxed">
                The contract remains <span className="text-green-400 font-semibold">open</span>.
                Strengthen your officers and try again, or let another bounty hunter claim it.
              </p>
            </div>
            <p className="text-white/30 text-[11px]">
              Battle report sent to your mail slot. Full replay available at game launch.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(160,30,30,0.6)", border: "1px solid rgba(255,60,60,0.3)" }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ── Bounty card ───────────────────────────────────────────────────────────────
function BountyCard({ bounty, onClaim: _onClaim, currentWallet }) {
  const isPoster = bounty.posterWallet === currentWallet;
  const statusColor = {
    open: "text-green-400", claimed: "text-amber-300",
    completed: "text-blue-400", cancelled: "text-white/25", expired: "text-red-400",
  }[bounty.status] || "text-white/40";

  const expiresIn = bounty.expiresAt
    ? Math.max(0, Math.round((new Date(bounty.expiresAt) - Date.now()) / 86400000))
    : null;

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,80,80,0.2)",
      }}
    >
      {bounty.image && (
        <LazyImage
          src={getImageUrl(bounty.image)}
          alt={bounty.title}
          fallback={popularFallback}
          className="w-full h-28"
          imgClassName="object-cover"
        />
      )}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase text-red-400"
            style={{ background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.2)" }}
          >
            BOUNTY
          </span>
          <span className={`text-[10px] font-bold uppercase ${statusColor}`}>{bounty.status}</span>
        </div>

        <p className="text-white/90 text-sm font-semibold truncate">{bounty.title}</p>

        <div className="flex items-center gap-1.5">
          <span className="text-white/40 text-[10px]">Target:</span>
          <span className="text-red-300/80 text-[11px] font-semibold truncate">{bounty.targetName}</span>
        </div>

        {bounty.description && (
          <p className="text-white/40 text-[11px] line-clamp-2">{bounty.description}</p>
        )}

        {/* Reward */}
        <div className="flex items-end justify-between mt-auto pt-1">
          <div>
            <p className="text-white/40 text-[10px]">Reward</p>
            <p className="text-amber-300 font-bold text-sm">{rewardLabel(bounty)}</p>
            <p className="text-white/30 text-[9px]">{netRewardLabel(bounty)}</p>
          </div>
          {expiresIn !== null && bounty.status === "open" && (
            <div className="text-right">
              <p className="text-white/40 text-[10px]">Expires in</p>
              <p className="text-white/60 text-xs">{expiresIn}d</p>
            </div>
          )}
        </div>

        <p className="text-white/25 text-[10px]">Posted by {bounty.posterName}</p>

        {/* Action */}
        {/* Button visible but disabled — onClick re-enabled once in-game battle system is live */}
        {bounty.status === "open" && !isPoster && (
          <button
            disabled
            className="mt-1 w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)" }}
          >
            <Swords className="w-3 h-3" />
            Claim Bounty
          </button>
        )}
        {bounty.status === "open" && isPoster && (
          <p className="text-white/25 text-[10px] italic mt-1 text-center">Your contract</p>
        )}
        {bounty.status === "claimed" && (
          <p className="text-amber-300/60 text-xs italic mt-1 text-center">Battle in progress</p>
        )}
        {bounty.status === "completed" && (
          <p className="text-blue-300/60 text-xs italic mt-1 text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </p>
        )}
      </div>
    </div>
  );
}

// ── Create modal ──────────────────────────────────────────────────────────────
const REWARD_PRESETS = [20, 50, 100, 200, 500];

function CreateModal({ onClose, onSuccess, wallet }) {
  const [form, setForm] = useState({
    title: "", description: "", targetName: "", targetWallet: "",
    reward: 50, rewardType: "hyperBucks", rewardMaterials: "", image: "", category: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!wallet) return setErr("Connect wallet first");
    setLoading(true); setErr("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/bounty`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, posterWallet: wallet, reward: Number(form.reward) }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      onSuccess();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const iCls = "w-full px-3 py-2 rounded-lg text-sm text-white outline-none placeholder-white/25";
  const iSt = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 relative my-auto" style={{ background: "#0a0b1a", border: "1px solid rgba(255,255,255,0.12)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-red-400" /> Post Hit Contract
        </h3>
        <p className="text-white/30 text-[11px] mb-4">Free to post · Battle resolved automatically · 20% commission on reward</p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required placeholder="Contract title *" value={form.title} onChange={e => set("title", e.target.value)} className={iCls} style={iSt} />
          <textarea placeholder="Why this target? (optional)" value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={iCls} style={iSt} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Target Player Name *</label>
              <input required placeholder="Player IGN" value={form.targetName} onChange={e => set("targetName", e.target.value)} className={iCls} style={iSt} />
            </div>
            <div>
              <label className="text-white/40 text-[10px] mb-1 block">Target Player ID</label>
              <input placeholder="HTQ... (optional)" value={form.targetWallet} onChange={e => set("targetWallet", e.target.value)} className={iCls} style={iSt} />
            </div>
          </div>

          {/* Reward type */}
          <div>
            <label className="text-white/40 text-[10px] mb-2 block">Reward Type</label>
            <div className="flex gap-2 mb-2">
              {["hyperBucks", "materials"].map(t => (
                <button
                  key={t} type="button"
                  onClick={() => set("rewardType", t)}
                  className="px-3 py-1.5 rounded-lg text-xs capitalize"
                  style={form.rewardType === t
                    ? { background: "rgba(200,140,0,0.3)", border: "1px solid rgba(255,180,0,0.5)", color: "rgba(255,200,80,0.95)" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                  }
                >
                  {t === "hyperBucks" ? "Hyper Bucks" : "Materials"}
                </button>
              ))}
            </div>

            {form.rewardType === "hyperBucks" ? (
              <div>
                <label className="text-white/40 text-[10px] mb-1.5 block">Amount (Hyper Bucks)</label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {REWARD_PRESETS.map(p => (
                    <button
                      key={p} type="button"
                      onClick={() => set("reward", p)}
                      className="px-2.5 py-1 rounded-lg text-xs"
                      style={form.reward === p
                        ? { background: "rgba(200,140,0,0.3)", border: "1px solid rgba(255,180,0,0.4)", color: "rgba(255,200,80,0.9)" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                      }
                    >
                      {p} HB
                    </button>
                  ))}
                </div>
                <input
                  type="number" min="1" placeholder="Custom amount"
                  value={form.reward} onChange={e => set("reward", Number(e.target.value))}
                  className={iCls} style={iSt}
                />
                {form.reward > 0 && (
                  <p className="text-white/30 text-[10px] mt-1">
                    Claimer receives {Math.round(form.reward * 0.8)} HB after 20% commission
                  </p>
                )}
              </div>
            ) : (
              <input
                placeholder="e.g. 1000 Energy Crystals, 50 Barrels of Oil"
                value={form.rewardMaterials} onChange={e => set("rewardMaterials", e.target.value)}
                className={iCls} style={iSt}
              />
            )}
          </div>

          <input placeholder="Category (pvp, raid, intel…)" value={form.category} onChange={e => set("category", e.target.value)} className={iCls} style={iSt} />

          <div
            className="rounded-xl p-3 flex items-start gap-2"
            style={{ background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.12)" }}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-white/40 text-[10px] leading-relaxed">
              When a hunter accepts, your top 5 officers will automatically battle their officers.
              The system determines the winner — result is sent to both players' mail slots.
            </p>
          </div>

          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button
            type="submit" disabled={loading}
            className="py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "rgba(160,30,30,0.8)" }}
          >
            {loading ? "Posting…" : "Post Contract — Free"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Investor Note Banner ──────────────────────────────────────────────────────
function InvestorBanner() {
  return (
    <div
      className="mb-6 rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(160,30,30,0.1) 0%, rgba(0,42,168,0.06) 100%)",
        border: "1px solid rgba(255,60,60,0.15)",
      }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <Gamepad2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-300/90 text-xs font-semibold">In-Game Feature Preview</p>
          <p className="text-white/40 text-[11px] leading-snug">
            The Bounty Board will be fully live in-game at launch. Battle animations and officer mechanics shown here are samples for investor/user showcase.
          </p>
        </div>
        <Info className="w-4 h-4 text-white/20 flex-shrink-0" />
      </div>
    </div>
  );
}

// ── Static preview data ───────────────────────────────────────────────────────
const PREVIEW_BOUNTIES = [
  { _id: "pb-1", status: "open", title: "Hit Contract: IronFist_99", targetName: "IronFist_99", description: "Raided our base and eliminated our best officers. Your top officers vs theirs — automated battle decides the winner.", reward: 150, rewardType: "hyperBucks", commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Intel Division" },
  { _id: "pb-2", status: "open", title: "Hit Contract: Lt. Shadow Wolf", targetName: "Lt. Shadow Wolf", description: "Former ally turned rogue. Attacking smaller factions unprovoked. Send your officers to neutralise this threat.", reward: 100, rewardType: "hyperBucks", commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Defence Ministry" },
  { _id: "pb-3", status: "open", title: "Hit Contract: WarHawk_Prime", targetName: "WarHawk_Prime", description: "Large faction bully targeting new players. Officers will go head-to-head in a strength battle — animated result provided.", reward: 200, rewardType: "hyperBucks", commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Cyber Division" },
  { _id: "pb-4", status: "open", title: "Hit Contract: Commander Vex", targetName: "Commander Vex", description: "High-priority target in Sector 9. Known for ambushing smaller players. Deploy your best 5 officers into battle.", reward: 50, rewardType: "hyperBucks", commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "HQ Command" },
  { _id: "pb-5", status: "open", title: "Hit Contract: Renegade_Echo", targetName: "Renegade_Echo", description: "Disrupting trade routes and raiding merchant factions. Any hunter who defeats their officers earns this reward.", reward: 0, rewardType: "materials", rewardMaterials: "5000 Barrels of Oil", commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "Resistance HQ" },
  { _id: "pb-6", status: "open", title: "Hit Contract: NeonRacer_Pro", targetName: "NeonRacer_Pro", description: "Racing champion sabotaging rivals. Officers will challenge their squad in a battle of power. Accept to engage.", reward: 0, rewardType: "materials", rewardMaterials: "1000 Energy Crystals", commission: 0.2, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), posterName: "TrackOwner_1" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["open", "claimed", "completed"];

export default function BountyTab() {
  const { user, isLoggedInUser } = useSelector(s => s.auth);
  const { address: wagmiAddress } = useAccount();
  const wallet = wagmiAddress || user?.WalletAddress || user?.MetaMaskAddress || "";

  const [bounties, setBounties]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [battleBounty, setBattleBounty] = useState(null);
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const LIMIT = 12;

  const fetchBounties = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND_BASE_URL}/api/v1/bounty?status=${statusFilter}&page=${page}&limit=${LIMIT}`);
      const data = await r.json();
      const fetched = data.bounties || [];
      if (fetched.length > 0) {
        setBounties(fetched); setTotal(data.total || 0);
      } else if (statusFilter === "open" && page === 1) {
        setBounties(PREVIEW_BOUNTIES); setTotal(PREVIEW_BOUNTIES.length);
      } else {
        setBounties([]); setTotal(0);
      }
    } catch {
      if (statusFilter === "open" && page === 1) {
        setBounties(PREVIEW_BOUNTIES); setTotal(PREVIEW_BOUNTIES.length);
      } else { setBounties([]); }
    }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchBounties(); }, [fetchBounties]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  function handleClaim(bounty) {
    if (!isLoggedInUser) return alert("Log in first");
    setBattleBounty(bounty);
  }

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="py-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-red-400/80" />
          <h2 className="text-white font-bold text-lg">Bounty Board</h2>
          <span className="text-white/30 text-sm">{total} contracts</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f} onClick={() => setStatusFilter(f)}
                className="px-2.5 py-1 rounded-full text-xs capitalize"
                style={statusFilter === f
                  ? { background: "rgba(160,30,30,0.8)", border: "1px solid rgba(255,60,60,0.4)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
                }
              >{f}</button>
            ))}
          </div>
          {isLoggedInUser && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "rgba(160,30,30,0.7)", border: "1px solid rgba(255,60,60,0.35)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Post Contract
            </button>
          )}
        </div>
      </div>

      {/* Investor note */}
      <InvestorBanner />

      {/* Info bar */}
      <div
        className="mb-6 px-4 py-3 rounded-xl text-xs text-white/40 flex flex-wrap gap-x-6 gap-y-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span><Swords className="w-3 h-3 inline mr-0.5" />Free to post</span>
        <span><Zap className="w-3 h-3 inline mr-0.5" />Battle resolved automatically</span>
        <span><Clock className="w-3 h-3 inline mr-0.5" />Expires in 30 days</span>
        <span><Target className="w-3 h-3 inline mr-0.5" />20% commission on reward</span>
      </div>

      {/* Grid — semi-transparent while locked */}
      <div className="opacity-50 pointer-events-none select-none">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl h-48 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : bounties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/25">
            <Target className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No {statusFilter} contracts</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bounties.map(b => (
              <BountyCard key={b._id} bounty={b} currentWallet={wallet} onClaim={handleClaim} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Prev</button>
          <span className="text-white/30 text-xs">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded text-xs text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.07)" }}>Next</button>
        </div>
      )}

      {/* Centered lock message box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
        <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl text-center"
          style={{ background: "rgba(6,8,22,0.82)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", maxWidth: 400 }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Lock className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white font-bold text-base leading-snug">
            Hyper Tek Gaming content for display purposes only.
          </p>
          <p className="text-white/55 text-sm leading-relaxed">
            This section is locked until games have been finalised.
          </p>
        </div>
      </div>

      {showCreate && (
        <CreateModal
          wallet={wallet}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchBounties(); }}
        />
      )}

      {battleBounty && (
        <BattleModal
          bounty={battleBounty}
          onClose={() => { setBattleBounty(null); fetchBounties(); }}
        />
      )}
    </div>
  );
}
