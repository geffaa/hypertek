import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

const CURRENT_YEAR = new Date().getFullYear();

export default function CPIAdjustment() {
  const token = localStorage.getItem("token");

  const [cpiPercent, setCpiPercent] = useState("");
  const [year,       setYear]       = useState(String(CURRENT_YEAR));
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null); // last apply result

  const handleApply = async () => {
    const pct = parseFloat(cpiPercent);
    if (isNaN(pct) || pct <= 0 || pct > 20) {
      toast.error("CPI % must be between 0.01 and 20");
      return;
    }
    if (!year || isNaN(Number(year))) {
      toast.error("Enter a valid year");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${Dashboard_Base_Url}/api/v1/admin/nfa/apply-cpi`,
        { cpiPercent: pct, year: Number(year) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setResult(res.data);
        toast.success(`CPI applied to ${res.data.updated ?? "?"} items`);
        setCpiPercent("");
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
    <div className="p-6 max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white">
          CPI Adjustment
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Apply annual CPI inflation to all active NFA / NFC / NFT minimum buyback values.
          This compounds the existing min BB by the percentage entered.
        </p>
      </div>

      {/* Form card */}
      <div
        className="rounded-xl p-6 flex flex-col gap-5"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
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
            className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
          />
          <p className="text-white/30 text-xs mt-1">
            Prevents duplicate application — each year can only be applied once per item.
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
              onChange={e => setCpiPercent(e.target.value)}
              min={0.01}
              max={20}
              step={0.1}
              placeholder="e.g. 2.5"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none pr-10"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
          </div>
          <p className="text-white/30 text-xs mt-1">
            Formula: new min BB = old min BB × (1 + {cpiPercent || "X"} / 100)
          </p>
        </div>

        {/* Example */}
        {cpiPercent && !isNaN(parseFloat(cpiPercent)) && (
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,80,255,0.2)" }}
          >
            <p className="text-white/60 text-xs">
              Example: $1,000 min BB →{" "}
              <span className="text-white font-semibold">
                ${(1000 * (1 + parseFloat(cpiPercent) / 100)).toFixed(2)}
              </span>
            </p>
          </div>
        )}

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={loading || !cpiPercent || !year}
          className="w-full h-11 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
        >
          {loading ? "Applying…" : `Apply ${cpiPercent || "?"}% CPI for ${year}`}
        </button>
      </div>

      {/* Last result */}
      {result && (
        <div
          className="mt-6 rounded-xl p-5"
          style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}
        >
          <p className="text-green-400 font-semibold text-sm mb-2">Last Applied Successfully</p>
          <div className="flex flex-col gap-1 text-xs text-white/50">
            <span>Year: <span className="text-white">{result.year}</span></span>
            <span>CPI: <span className="text-white">{result.cpiPercent}%</span></span>
            <span>Items updated: <span className="text-white">{result.updated}</span></span>
            {result.skipped > 0 && (
              <span>Skipped (already applied): <span className="text-amber-300">{result.skipped}</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
