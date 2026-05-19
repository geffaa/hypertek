import UserIcon         from "../../assets/BarGraph/UserIcon.png";
import TotalBuyIcon     from "../../assets/BarGraph/totalBuy.png";
import totalSellIcon    from "../../assets/BarGraph/totalSell.png";
import TotalNfaIcon     from "../../assets/BarGraph/nfa.png";
import TotalCollectionIcon from "../../assets/BarGraph/collection.png";
import TotalOfferIcon   from "../../assets/BarGraph/totalOffer.png";

const CONFIGS = [
  { key: "users",       label: "Total Users",      icon: UserIcon            },
  { key: "buy",         label: "Total Buy",         icon: TotalBuyIcon        },
  { key: "sell",        label: "Total Sell",        icon: totalSellIcon       },
  { key: "nfa",         label: "Total NFA",         icon: TotalNfaIcon        },
  { key: "collections", label: "Total Collections", icon: TotalCollectionIcon },
  { key: "offers",      label: "Total Offers",      icon: TotalOfferIcon      },
];

// months: null = all-time, number = how many months back
const PERIOD_MONTHS = { all: null, "1m": 1, "3m": 3, "6m": 6, "1y": 12 };

function getFilteredCount(data, totalCount, periodKey) {
  if (periodKey === "all") return totalCount;
  if (!Array.isArray(data) || data.length === 0) return 0;
  const months = PERIOD_MONTHS[periodKey];
  if (!months) return totalCount;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return data.filter((item) => new Date(item.createdAt) >= cutoff).length;
}

function getPctChange(data, periodKey) {
  if (!Array.isArray(data) || data.length < 2) return null;

  if (periodKey === "all") {
    // Compare first half vs second half (chronological) — overall growth since inception
    const sorted = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const mid   = Math.floor(sorted.length / 2);
    const first = mid;
    const second = sorted.length - mid;
    if (first === 0) return null;
    return ((second - first) / first) * 100;
  }

  const months = PERIOD_MONTHS[periodKey];
  if (!months) return null;

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  const prevCutoff = new Date(cutoff);
  prevCutoff.setMonth(prevCutoff.getMonth() - months);

  const cur  = data.filter((d) => new Date(d.createdAt) >= cutoff).length;
  const prev = data.filter((d) => {
    const t = new Date(d.createdAt);
    return t >= prevCutoff && t < cutoff;
  }).length;

  if (cur === 0 && prev === 0) return null;
  if (prev === 0) return cur > 0 ? 100 : null;
  return ((cur - prev) / prev) * 100;
}

function StatCard({ config, data, totalCount, period }) {
  const count     = getFilteredCount(data, totalCount, period);
  const pct       = getPctChange(data, period);
  const isUp      = pct !== null && pct >= 0;
  const showTrend = pct !== null;

  return (
    <div
      style={{
        background: "#0c0c18",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        minHeight: "88px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "11px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <img
          src={config.icon}
          alt={config.label}
          style={{ width: "17px", height: "17px", filter: "brightness(0) invert(0.65)" }}
        />
      </div>

      {/* Label + Count */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "10.5px", fontWeight: 500, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
          {config.label}
        </p>
        <p style={{ fontSize: "30px", fontWeight: 800, color: "white", margin: "5px 0 0", letterSpacing: "-1px", lineHeight: 1 }}>
          {count.toLocaleString()}
        </p>
      </div>

      {/* Trend */}
      {showTrend && (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              style={{ transform: isUp ? "none" : "rotate(180deg)" }}
            >
              <path d="M5 1.5L9 8H1L5 1.5Z" fill={isUp ? "#22c55e" : "#ef4444"} />
            </svg>
            <span style={{ fontSize: "15px", fontWeight: 700, color: isUp ? "#22c55e" : "#ef4444" }}>
              {isUp ? "+" : ""}{pct.toFixed(1)}%
            </span>
          </div>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", margin: "3px 0 0" }}>
            {period === "all" ? "since inception" : "vs prev period"}
          </p>
        </div>
      )}
    </div>
  );
}

function BarCard({
  userSendData = [],       userCount = 0,
  totalBuySendData = [],   totalBuyerCount = 0,
  totalSellSendData = [],  totalSellCount = 0,
  totalNfaSend = [],       totalNfaCount = 0,
  totalCollectionSend = [], totalCollectionCount = 0,
  totalOfferSend = [],     totalOfferCount = 0,
  period = "all",
}) {
  const cards = [
    { config: CONFIGS[0], data: userSendData,        totalCount: userCount          },
    { config: CONFIGS[1], data: totalBuySendData,    totalCount: totalBuyerCount    },
    { config: CONFIGS[2], data: totalSellSendData,   totalCount: totalSellCount     },
    { config: CONFIGS[3], data: totalNfaSend,        totalCount: totalNfaCount      },
    { config: CONFIGS[4], data: totalCollectionSend, totalCount: totalCollectionCount },
    { config: CONFIGS[5], data: totalOfferSend,      totalCount: totalOfferCount    },
  ];

  return (
    <>
      {cards.map(({ config, data, totalCount }) => (
        <StatCard
          key={config.key}
          config={config}
          data={data}
          totalCount={totalCount}
          period={period}
        />
      ))}
    </>
  );
}

export default BarCard;
