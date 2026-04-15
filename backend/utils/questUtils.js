/**
 * Quest Commission Logic
 * ──────────────────────
 * Two quest types:
 *
 * MONEY  — applies to 11% platform commission (2nd sale onward, NFC/NFT money transactions)
 *   4h  wait → buyer saves 3%, shared 8%  (player 4%,   platform 4%)   → total 11%
 *  12h  wait → buyer saves 4%, shared 7%  (player 3.5%, platform 3.5%) → total 11%
 *  24h  wait → buyer saves 5%, shared 6%  (player 3%,   platform 3%)   → total 11%
 *
 * RESOURCES — applies to 20% platform commission (resource-based listings)
 *   4h  wait → buyer saves 8%,  shared 12% (player 6%, platform 6%) → total 20%
 *  12h  wait → buyer saves 10%, shared 10% (player 5%, platform 5%) → total 20%
 *  24h  wait → buyer saves 12%, shared 8%  (player 4%, platform 4%) → total 20%
 */

export const QUEST_TYPES = ["money", "resources"];

export const QUEST_TIERS = {
  money: [
    { waitHours: 4,  buyerSavePercent: 3, playerSharePercent: 4,   platformSharePercent: 4   },
    { waitHours: 12, buyerSavePercent: 4, playerSharePercent: 3.5, platformSharePercent: 3.5 },
    { waitHours: 24, buyerSavePercent: 5, playerSharePercent: 3,   platformSharePercent: 3   },
  ],
  resources: [
    { waitHours: 4,  buyerSavePercent: 8,  playerSharePercent: 6, platformSharePercent: 6 },
    { waitHours: 12, buyerSavePercent: 10, playerSharePercent: 5, platformSharePercent: 5 },
    { waitHours: 24, buyerSavePercent: 12, playerSharePercent: 4, platformSharePercent: 4 },
  ],
};

export const VALID_WAIT_HOURS = [4, 12, 24];
export const MAX_DAILY_QUEST_ACCEPTS = 5;

/**
 * Returns the tier config for a given questType + waitHours.
 * Throws if invalid.
 */
export function getTier(questType, waitHours) {
  const tiers = QUEST_TIERS[questType];
  if (!tiers) throw new Error(`Invalid questType "${questType}". Must be "money" or "resources".`);
  const tier = tiers.find((t) => t.waitHours === Number(waitHours));
  if (!tier) throw new Error(`Invalid waitHours "${waitHours}". Must be 4, 12, or 24.`);
  return tier;
}

/**
 * Calculate the actual USD/HB amounts for a quest given the sale price.
 *
 * @param {number} salePrice     — full sale price (USD or HB)
 * @param {"money"|"resources"} questType
 * @param {4|12|24} waitHours
 * @returns {{
 *   buyerSaves: number,
 *   playerEarns: number,
 *   platformEarns: number,
 *   totalQuestPool: number,
 *   tier: object
 * }}
 */
export function calculateQuestSplit(salePrice, questType, waitHours) {
  const tier = getTier(questType, waitHours);
  const buyerSaves    = +(salePrice * tier.buyerSavePercent    / 100).toFixed(4);
  const playerEarns   = +(salePrice * tier.playerSharePercent  / 100).toFixed(4);
  const platformEarns = +(salePrice * tier.platformSharePercent / 100).toFixed(4);
  const totalQuestPool = +(buyerSaves + playerEarns + platformEarns).toFixed(4);

  return { buyerSaves, playerEarns, platformEarns, totalQuestPool, tier };
}

/**
 * Build a UTC date key (YYYY-MM-DD) for daily quest limit tracking.
 */
export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
