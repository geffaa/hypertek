// Checkout acknowledgement every buyer must tick before bidding, offering or
// buying. Bump VERSION whenever the points change: purchases record which
// version the buyer agreed to, and the server rejects any other version.
// Keep in sync with frontend/src/data/purchaseAcknowledgement.js.
export const PURCHASE_ACK_VERSION = "2026-10-01";

export const PURCHASE_ACK_POINTS = [
  "I am buying a digital game item and any listed in-game benefits.",
  "The games are still in development. Any future use of this item in a game may depend on development and final game rules, and is not promised.",
  "This purchase is not an investment or a donation. No profit, income, payment or financial return is promised.",
  "Resale is not guaranteed.",
  "Any trade-in requires me to surrender the item, and the trade-in amount is always less than the amount originally allocated to the item.",
];
