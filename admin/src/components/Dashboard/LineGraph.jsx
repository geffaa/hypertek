import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dashboard_Base_Url } from "../../Config";
import toast from "react-hot-toast";

// ─── helpers ────────────────────────────────────────────────────────────────

const PERIODS = ["Today", "Week", "Month", "Year"];

const STATUS_FILTERS = [
  { key: "All",       lbl: "All"     },
  { key: "succeeded", lbl: "Success" },
  { key: "pending",   lbl: "Pending" },
  { key: "failed",    lbl: "Failed"  },
];

const STATUS_STYLE = {
  succeeded: { bg: "#12291a", text: "#22c55e", border: "rgba(34,197,94,0.25)" },
  failed:    { bg: "#2a1212", text: "#ef4444", border: "rgba(239,68,68,0.25)" },
  pending:   { bg: "#29220a", text: "#f59e0b", border: "rgba(245,158,11,0.25)" },
};

function filterByPeriod(data, period) {
  const now = new Date();
  return data.filter((item) => {
    const d = new Date(item.createdAt);
    if (period === "Today") return d.toDateString() === now.toDateString();
    if (period === "Week")  return now - d < 7 * 86400000;
    if (period === "Month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === "Year")  return d.getFullYear() === now.getFullYear();
    return true;
  });
}

function filterPrevPeriod(data, period) {
  const now = new Date();
  return data.filter((item) => {
    const d = new Date(item.createdAt);
    if (period === "Today") {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return d.toDateString() === y.toDateString();
    }
    if (period === "Week") {
      const diff = now - d;
      return diff >= 7 * 86400000 && diff < 14 * 86400000;
    }
    if (period === "Month") {
      const pm = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === pm.getMonth() && d.getFullYear() === pm.getFullYear();
    }
    if (period === "Year") return d.getFullYear() === now.getFullYear() - 1;
    return false;
  });
}

function buildChartPoints(data, period) {
  const now = new Date();

  if (period === "Today") {
    const map = {};
    for (let h = 0; h <= now.getHours(); h++) map[h] = 0;
    data.forEach((item) => {
      const d = new Date(item.createdAt);
      if (d.toDateString() === now.toDateString()) map[d.getHours()] = (map[d.getHours()] || 0) + (item.amount || 0);
    });
    return Object.entries(map).map(([h, v]) => ({ label: `${h}:00`, value: v }));
  }

  if (period === "Week") {
    const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const entries = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i));
      return { key: d.toDateString(), label: DAYS[d.getDay()], value: 0 };
    });
    data.forEach((item) => {
      const key = new Date(item.createdAt).toDateString();
      const e = entries.find((x) => x.key === key);
      if (e) e.value += item.amount || 0;
    });
    return entries;
  }

  if (period === "Month") {
    const map = {};
    for (let d = 1; d <= now.getDate(); d++) map[d] = 0;
    data.forEach((item) => {
      const d = new Date(item.createdAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        map[d.getDate()] = (map[d.getDate()] || 0) + (item.amount || 0);
      }
    });
    return Object.entries(map).map(([d, v]) => ({ label: String(d), value: v }));
  }

  if (period === "Year") {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const map = {};
    for (let m = 0; m <= now.getMonth(); m++) map[m] = 0;
    data.forEach((item) => {
      const d = new Date(item.createdAt);
      if (d.getFullYear() === now.getFullYear()) {
        map[d.getMonth()] = (map[d.getMonth()] || 0) + (item.amount || 0);
      }
    });
    return Object.entries(map).map(([m, v]) => ({ label: MONTHS[Number(m)], value: v }));
  }

  return [];
}

function calcPctChange(cur, prev) {
  const a = cur.reduce((s, x) => s + (x.amount || 0), 0);
  const b = prev.reduce((s, x) => s + (x.amount || 0), 0);
  if (b === 0) return a > 0 ? 100 : 0;
  return ((a - b) / b) * 100;
}

function fmtAmount(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── chart ──────────────────────────────────────────────────────────────────

function Chart({ points }) {
  const cvs = useRef(null);
  const box = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    setProg(0);
    let raf;
    const tick = () => {
      setProg((p) => {
        if (p >= 1) return 1;
        raf = requestAnimationFrame(tick);
        return Math.min(p + 0.05, 1);
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points]);

  useEffect(() => {
    const canvas = cvs.current;
    const wrap   = box.current;
    if (!canvas || !wrap || points.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = width  + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const PAD = { top: 16, right: 16, bottom: 38, left: 58 };
    const cw = width  - PAD.left - PAD.right;
    const ch = height - PAD.top  - PAD.bottom;
    const max  = Math.max(...points.map((p) => p.value), 1) * 1.15;
    const xGap = cw / (points.length - 1);

    const xy = (i, animated) => ({
      x: PAD.left + i * xGap,
      y: PAD.top + ch - (points[i].value / max) * ch * (animated ? prog : 1),
    });

    // Grid
    const GRID = 5;
    for (let i = 0; i <= GRID; i++) {
      const y   = PAD.top + (ch / GRID) * i;
      const val = Math.round(max - (max / GRID) * i);

      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(width - PAD.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "10.5px Inter";
      ctx.textAlign = "right";
      ctx.fillText(fmtAmount(val).replace("$", ""), PAD.left - 8, y + 4);
    }

    // Animated curve points
    const pts = points.map((_, i) => xy(i, true));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, PAD.top, 0, height - PAD.bottom);
    grad.addColorStop(0, "rgba(0,42,168,0.35)");
    grad.addColorStop(1, "rgba(0,42,168,0)");

    const bezierCurve = (ctx, pts) => {
      pts.forEach((p, i) => {
        if (i === 0) return;
        const prev = pts[i - 1];
        const cx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, p.y, p.x, p.y);
      });
    };

    ctx.beginPath();
    ctx.moveTo(pts[0].x, height - PAD.bottom);
    ctx.lineTo(pts[0].x, pts[0].y);
    bezierCurve(ctx, pts);
    ctx.lineTo(pts[pts.length - 1].x, height - PAD.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    bezierCurve(ctx, pts);
    ctx.strokeStyle = "#4d7aff";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    if (prog > 0.8) {
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#4d7aff";
        ctx.fill();
        ctx.strokeStyle = "#0c0c18";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });
    }

    // X labels — skip to avoid overlap
    const step = Math.max(1, Math.ceil(points.length / 12));
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.font = "10.5px Inter";
    ctx.textAlign = "center";
    points.forEach((p, i) => {
      if (i % step !== 0 && i !== points.length - 1) return;
      ctx.fillText(p.label, PAD.left + i * xGap, height - PAD.bottom + 18);
    });
  }, [points, prog]);

  const onMouseMove = (e) => {
    if (!box.current || points.length < 2) return;
    const { left, width, height } = box.current.getBoundingClientRect();
    const PAD = { left: 58, right: 16, top: 16, bottom: 38 };
    const cw  = width  - PAD.left - PAD.right;
    const ch  = height - PAD.top  - PAD.bottom;
    const mx  = e.clientX - left - PAD.left;
    const idx = Math.max(0, Math.min(points.length - 1, Math.round(mx / (cw / (points.length - 1)))));
    const max = Math.max(...points.map((p) => p.value), 1) * 1.15;
    setTooltip({
      x:     PAD.left + idx * (cw / (points.length - 1)),
      y:     PAD.top  + ch - (points[idx].value / max) * ch,
      label: points[idx].label,
      value: points[idx].value,
    });
  };

  if (points.length < 2) {
    return (
      <div style={{ height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Inter", fontSize: "13px", color: "rgba(255,255,255,0.2)" }}>
          No data for this period
        </p>
      </div>
    );
  }

  return (
    <div
      ref={box}
      style={{ position: "relative", height: "240px", width: "100%" }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      <canvas ref={cvs} style={{ width: "100%", height: "100%" }} />
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top:  tooltip.y,
            transform: "translate(-50%, -115%)",
            background: "#111126",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "10px",
            padding: "8px 14px",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <p style={{ fontFamily: "Inter", fontSize: "10px", color: "rgba(255,255,255,0.38)", margin: 0 }}>
            {tooltip.label}
          </p>
          <p style={{ fontFamily: "Inter", fontSize: "16px", fontWeight: 800, color: "white", margin: "3px 0 0", letterSpacing: "-0.5px" }}>
            ${tooltip.value.toLocaleString()}
          </p>
          {/* Arrow */}
          <div style={{ position: "absolute", bottom: -6, left: "50%", width: 10, height: 10, background: "#111126", border: "1px solid rgba(255,255,255,0.14)", borderTop: "none", borderLeft: "none", transform: "translateX(-50%) rotate(45deg)" }} />
        </div>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

function LineGraph() {
  const navigate = useNavigate();
  const [period, setPeriod]             = useState("Month");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rawData, setRawData]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [userData, setUserData]         = useState(null);

  useEffect(() => {
    axios
      .get(`${Dashboard_Base_Url}/dashboard/payments`)
      .then((res) => { if (res.data.success) setRawData(res.data.data); })
      .catch((err) => console.error("Payments fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const d = localStorage.getItem("admin_data");
      if (d) setUserData(JSON.parse(d));
    } catch {}
  }, []);

  const curData  = useMemo(() => filterByPeriod(rawData, period),     [rawData, period]);
  const prevData = useMemo(() => filterPrevPeriod(rawData, period),    [rawData, period]);
  const points   = useMemo(() => buildChartPoints(rawData, period),    [rawData, period]);

  const totalVolume = curData.reduce((s, x) => s + (x.amount || 0), 0);
  const txCount     = curData.length;
  const pctChange   = calcPctChange(curData, prevData);
  const isUp        = pctChange >= 0;

  const tableRows = rawData
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .slice(0, 8);

  const handleViewAll = () => {
    if (!userData?._id) { toast.error("Not authenticated"); return; }
    navigate(`/${userData._id}/transactions`);
  };

  // Shared font + text style shortcuts
  const F = "Inter, sans-serif";
  const label  = { fontFamily: F, fontSize: "10.5px", fontWeight: 500, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 };
  const bigNum = { fontFamily: F, fontSize: "26px", fontWeight: 800, color: "white", margin: "6px 0 0", letterSpacing: "-0.8px" };

  return (
    <div style={{ width: "100%", fontFamily: F }}>

      {/* ── header: label + period tabs ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <p style={{ ...label, fontSize: "11px", letterSpacing: "0.08em" }}>
          Transaction Overview
        </p>
        <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px" }}>
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: "5px 14px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: F, fontWeight: 600, fontSize: "12px", background: period === p ? "#002AA8" : "transparent", color: period === p ? "white" : "rgba(255,255,255,0.4)", transition: "all 0.15s" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── summary stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "16px" }}>
        <div style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px" }}>
          <p style={label}>Total Volume</p>
          <p style={bigNum}>{loading ? "—" : fmtAmount(totalVolume)}</p>
        </div>
        <div style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px" }}>
          <p style={label}>Transactions</p>
          <p style={bigNum}>{loading ? "—" : txCount.toLocaleString()}</p>
        </div>
        <div style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px" }}>
          <p style={label}>vs Prev {period}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
            <p style={{ ...bigNum, margin: 0, color: isUp ? "#22c55e" : "#ef4444" }}>
              {loading ? "—" : `${isUp ? "+" : ""}${pctChange.toFixed(1)}%`}
            </p>
            {!loading && (
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{ transform: isUp ? "none" : "rotate(180deg)" }}>
                <path d="M5 1.5L9 8H1L5 1.5Z" fill={isUp ? "#22c55e" : "#ef4444"} />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ── chart ── */}
      <div style={{ background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px 16px 10px" }}>
        {loading ? (
          <div style={{ height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: F, fontSize: "13px", color: "rgba(255,255,255,0.2)" }}>Loading chart…</p>
          </div>
        ) : (
          <Chart points={points} />
        )}
      </div>

      {/* ── recent transactions table ── */}
      <div style={{ marginTop: "16px", background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden" }}>

        {/* toolbar */}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ fontFamily: F, fontWeight: 700, fontSize: "14px", color: "white", margin: 0 }}>
            Recent Transactions
          </p>
          <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px" }}>
            {STATUS_FILTERS.map(({ key, lbl }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                style={{ padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: F, fontWeight: 500, fontSize: "11px", background: statusFilter === key ? "#002AA8" : "transparent", color: statusFilter === key ? "white" : "rgba(255,255,255,0.4)", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Item", "Date", "Amount", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontFamily: F, fontWeight: 600, fontSize: "10.5px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "36px 20px", textAlign: "center", fontFamily: F, fontSize: "13px", color: "rgba(255,255,255,0.18)" }}>
                    No transactions found
                  </td>
                </tr>
              ) : tableRows.map((row, i) => {
                const s = STATUS_STYLE[row.status] || { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)" };
                return (
                  <tr key={i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.12s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "13px 20px", fontFamily: F, fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.78)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.gameTitle || "—"}
                    </td>
                    <td style={{ padding: "13px 20px", fontFamily: F, fontSize: "12px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                      {new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "13px 20px", fontFamily: F, fontSize: "13px", fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
                      ${(row.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "13px 20px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "6px", background: s.bg, color: s.text, border: `1px solid ${s.border}`, fontFamily: F, fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {row.status === "succeeded" ? "Success" : row.status === "failed" ? "Failed" : row.status === "pending" ? "Pending" : row.status || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleViewAll}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", fontFamily: F, fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            View All Transactions
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LineGraph;
