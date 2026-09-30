import { useTradeInPreview } from "../../hooks/useTradeInPreview";
import { formatUsdc } from "../../Web3/tradeInEscrow";

// An item's Programmatic Trade-In Value, shown as an item stat.
export default function TradeInStat({ tokenId }) {
  const t = useTradeInPreview(tokenId);
  if (t.loading || !t.live || !(t.principal > 0n)) return null;

  return (
    <div className="rounded-xl p-3 flex flex-col gap-1 text-xs" style={{ background: "rgba(0,42,168,0.12)", border: "1px solid rgba(0,80,255,0.2)" }}>
      <div className="flex justify-between">
        <span className="text-white/50">Programmatic Trade-In Value</span>
        <span className="text-green-400 font-semibold">{formatUsdc(t.amountNow)} USDC</span>
      </div>
      <div className="flex justify-between text-white/40">
        <span>Loyalty tier</span>
        <span>{t.pctNow}% of {formatUsdc(t.principal)} USDC</span>
      </div>
      {t.next && (
        <p className="text-white/35 text-[11px]">
          Rises to {t.next.pct}% on {t.next.date.toLocaleDateString()}. Trade-in requires surrendering the item.
        </p>
      )}
    </div>
  );
}
