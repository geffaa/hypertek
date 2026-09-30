import { BACKEND_BASE_URL } from "../Config";

export const TRADE_IN_ESCROW_ABI = [
  { name: "previewClaim", type: "function", stateMutability: "view", inputs: [{ name: "nft", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [{ name: "principal", type: "uint256" }, { name: "payout", type: "uint256" }, { name: "fee", type: "uint256" }, { name: "layerCount", type: "uint256" }] },
  { name: "layersOf", type: "function", stateMutability: "view", inputs: [{ name: "nft", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "tuple[]", components: [{ name: "amount", type: "uint256" }, { name: "timestamp", type: "uint64" }] }] },
  { name: "partialWithdrawn", type: "function", stateMutability: "view", inputs: [{ name: "nft", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { name: "partialWithdrawalThreshold", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "woundDown", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "bool" }] },
  { name: "claimBuyback", type: "function", stateMutability: "nonpayable", inputs: [{ name: "nft", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [] },
  { name: "withdrawPartial", type: "function", stateMutability: "nonpayable", inputs: [{ name: "nft", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [] },
];

export const ERC721_APPROVAL_ABI = [
  { name: "getApproved", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "address" }] },
  { name: "isApprovedForAll", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "operator", type: "address" }], outputs: [{ name: "", type: "bool" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [] },
];

// Mirrors BuybackEscrow._vestedBps: 80% in year one, +4 points a year to 96%
// in year five, then 97% for good. The retained part is never paid out.
export const LOYALTY_TIERS = [80, 84, 88, 92, 96, 97];
const YEAR_SECONDS = 365 * 24 * 60 * 60;

export function loyaltyPct(depositSeconds, nowSeconds, woundDown = false) {
  if (woundDown) return 97;
  const years = Math.floor((nowSeconds - depositSeconds) / YEAR_SECONDS);
  return LOYALTY_TIERS[Math.min(Math.max(years, 0), 5)];
}

// The soonest date any of the item's deposits moves up a tier, if one is still coming.
export function nextTierChange(layers, nowSeconds, woundDown = false) {
  if (woundDown) return null;
  let soonest = null;
  for (const layer of layers) {
    const ts = Number(layer.timestamp);
    const years = Math.floor((nowSeconds - ts) / YEAR_SECONDS);
    if (years >= 5 || Number(layer.amount) === 0) continue;
    const at = ts + (years + 1) * YEAR_SECONDS;
    if (soonest === null || at < soonest.at) soonest = { at, pct: LOYALTY_TIERS[years + 1] };
  }
  return soonest ? { date: new Date(soonest.at * 1000), pct: soonest.pct } : null;
}

let configPromise = null;
export function getTradeInConfig() {
  if (!configPromise) {
    configPromise = fetch(`${BACKEND_BASE_URL}/api/v1/gmbb-claim/config`)
      .then((r) => r.json())
      .catch(() => ({ isLive: false }));
  }
  return configPromise;
}

export const formatUsdc = (units) => (Number(units) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 });
