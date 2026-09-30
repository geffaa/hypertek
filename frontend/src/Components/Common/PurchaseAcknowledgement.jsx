import { Link } from "react-router-dom";
import { PURCHASE_ACK_POINTS } from "../../data/purchaseAcknowledgement";

// Mandatory checkout acknowledgement. Callers keep their action button
// disabled until `checked` is true and send ackPayload() with the request.
export default function PurchaseAcknowledgement({ checked, onChange, light = false }) {
  const c = light
    ? { box: "rgba(255,255,255,0.6)", border: "rgba(0,0,0,0.1)", head: "text-gray-800", item: "text-gray-600", label: "text-gray-800", link: "text-indigo-700" }
    : { box: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", head: "text-white/70", item: "text-white/55", label: "text-white/80", link: "text-blue-300 hover:text-blue-200" };
  return (
    <div className="rounded-xl p-3 text-left" style={{ background: c.box, border: `1px solid ${c.border}` }}>
      <p className={`${c.head} text-xs font-semibold mb-2`}>Before you continue, please confirm:</p>
      <ul className="space-y-1.5 mb-3">
        {PURCHASE_ACK_POINTS.map((point) => (
          <li key={point} className={`flex gap-2 text-[11px] leading-snug ${c.item}`}>
            <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
            {point}
          </li>
        ))}
      </ul>
      <label className="flex items-start gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
        />
        <span className={`text-xs ${c.label}`}>
          I have read and understand the above and the{" "}
          <Link to="/terms" target="_blank" className={`underline ${c.link}`}>Terms of Service</Link>.
        </span>
      </label>
    </div>
  );
}
