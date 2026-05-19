import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

const CURRENT_YEAR = new Date().getFullYear();

const CARD = { background: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 };
const INPUT_STYLE = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  color: "#fff",
  outline: "none",
  width: "100%",
  padding: "10px 14px",
  fontSize: 14,
};

export default function CPIAdjustment() {
  const token = localStorage.getItem("token");

  const [cpiPercent, setCpiPercent] = useState("");
  const [year,       setYear]       = useState(String(CURRENT_YEAR));
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [confirmed,  setConfirmed]  = useState(false);

  const pctNum = parseFloat(cpiPercent);
  const isValid = !isNaN(pctNum) && pctNum > 0 && pctNum <= 20 && year && !isNaN(Number(year));

  const handleApply = async () => {
    if (!isValid) {
      toast.error("CPI % must be between 0.01 and 20, and year must be valid");
      return;
    }
    if (!confirmed) {
      toast.error("Check the confirmation box before applying");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${Dashboard_Base_Url}/v1/admin/nfa/apply-cpi`,
        { cpiPercent: pctNum, year: Number(year) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setResult(res.data);
        toast.success(`CPI applied to ${res.data.updated ?? 0} items`);
        setCpiPercent("");
        setConfirmed(false);
      } else {
        toast.error(res.data?.error || "Failed to apply CPI");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          CPI Adjustment
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Apply annual CPI inflation compound to all active NFA/NFC minimum buyback floors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* ── Left: Form ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Warning banner */}
          <div
            className="flex items-start gap-3 rounded-xl px-5 py-4"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 12 }}
          >
            <span className="text-yellow-400 text-lg mt-0.5">⚠</span>
            <div>
              <p className="text-yellow-300 text-sm font-semibold">Irreversible Operation</p>
              <p className="text-yellow-200/60 text-xs mt-0.5 leading-relaxed">
                Once applied, each item's minimum buyback floor is permanently increased.
                The system prevents double-application per year, but the increase itself cannot be undone.
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="flex flex-col gap-5 rounded-[14px] p-6" style={CARD}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              Adjustment Parameters
            </p>

            {/* Year */}
            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                min={2024}
                max={2100}
                style={INPUT_STYLE}
              />
              <p className="text-white/30 text-xs mt-1.5">
                Each year can only be applied once per item — duplicates are skipped automatically.
              </p>
            </div>

            {/* CPI % */}
            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                CPI Percent (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={cpiPercent}
                  onChange={e => { setCpiPercent(e.target.value); setConfirmed(false); }}
                  min={0.01}
                  max={20}
                  step={0.1}
                  placeholder="e.g. 2.5"
                  style={{ ...INPUT_STYLE, paddingRight: 36 }}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  %
                </span>
              </div>
              <p className="text-white/30 text-xs mt-1.5">
                Formula: new floor = old floor × (1 + {isNaN(pctNum) ? "X" : pctNum} / 100)
              </p>
            </div>

            {/* Live preview */}
            {isValid && (
              <div
                className="rounded-xl px-5 py-4"
                style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.18)", borderRadius: 12 }}
              >
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                  Preview
                </p>
                <div className="flex flex-col gap-2">
                  {[500, 1000, 2500, 5000].map(val => (
                    <div key={val} className="flex items-center justify-between text-xs">
                      <span className="text-white/40">${val.toLocaleString()} min BB</span>
                      <span className="text-white/25 mx-2">→</span>
                      <span className="text-white font-semibold">
                        ${(val * (1 + pctNum / 100)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <div
                onClick={() => isValid && setConfirmed(v => !v)}
                className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  background: confirmed ? "#002AA8" : "rgba(255,255,255,0.05)",
                  border: confirmed ? "1px solid #003fff" : "1px solid rgba(255,255,255,0.15)",
                  cursor: isValid ? "pointer" : "not-allowed",
                  opacity: isValid ? 1 : 0.4,
                }}
              >
                {confirmed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-white/50 text-xs leading-relaxed">
                I understand this will permanently increase minimum buyback floors for all active NFA/NFC items
                and cannot be reversed.
              </span>
            </label>

            {/* Apply button */}
            <button
              onClick={handleApply}
              disabled={loading || !isValid || !confirmed}
              className="w-full h-11 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
            >
              {loading
                ? "Applying…"
                : `Apply ${isNaN(pctNum) ? "?" : pctNum}% CPI for ${year}`
              }
            </button>
          </div>

          {/* Last result */}
          {result && (
            <div
              className="rounded-[14px] p-5"
              style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.18)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400 text-base">✓</span>
                <p className="text-green-400 font-semibold text-sm">Applied Successfully</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-white/40 block">Year</span>
                  <span className="text-white font-medium">{result.year}</span>
                </div>
                <div>
                  <span className="text-white/40 block">CPI Rate</span>
                  <span className="text-white font-medium">{result.cpiPercent}%</span>
                </div>
                <div>
                  <span className="text-white/40 block">Items Updated</span>
                  <span className="text-green-400 font-semibold">{result.updated}</span>
                </div>
                {result.skipped > 0 && (
                  <div>
                    <span className="text-white/40 block">Skipped</span>
                    <span className="text-amber-300 font-semibold">{result.skipped}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Info panel ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">

          {/* What is CPI */}
          <div className="rounded-[14px] p-5" style={CARD}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
              What is CPI Adjustment?
            </p>
            <div className="flex flex-col gap-3 text-xs text-white/50 leading-relaxed">
              <p>
                CPI (Consumer Price Index) adjustment compounds the minimum buyback floor
                of all active NFA and NFC items by a percentage reflecting annual inflation.
              </p>
              <p>
                This preserves the real-world value of HyperTek's buyback guarantee over time —
                so a $1,000 floor today maintains equivalent purchasing power next year.
              </p>
              <p>
                Each item tracks a <span className="text-white/70">cpiHistory</span> log,
                preventing duplicate application in the same calendar year.
              </p>
            </div>
          </div>

          {/* Scope */}
          <div className="rounded-[14px] p-5" style={CARD}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
              Scope
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "NFA items", desc: "Standalone + sub-collection", color: "#4ade80" },
                { label: "NFC items", desc: "Standalone + sub-collection", color: "#60a5fa" },
                { label: "Zeroed / removed", desc: "Excluded automatically", color: "rgba(255,255,255,0.2)" },
                { label: "Already applied", desc: "Skipped (same year)", color: "#fbbf24" },
              ].map(({ label, desc, color }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-white/80 text-xs font-medium">{label}</span>
                    <span className="text-white/30 text-xs block">{desc}</span>
                  </div>
                  <span
                    className="text-xs font-semibold mt-0.5 flex-shrink-0"
                    style={{ color }}
                  >
                    {color === "rgba(255,255,255,0.2)" ? "Skip" : color === "#fbbf24" ? "Skip" : "✓"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Typical range */}
          <div className="rounded-[14px] p-5" style={CARD}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
              Typical Range
            </p>
            <div className="flex flex-col gap-1.5 text-xs">
              {[
                { range: "1–3%", desc: "Low inflation years" },
                { range: "3–6%", desc: "Moderate inflation" },
                { range: "6–10%", desc: "High inflation" },
                { range: "> 10%", desc: "Crisis / exceptional" },
              ].map(({ range, desc }) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-white/70 font-semibold">{range}</span>
                  <span className="text-white/35">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
