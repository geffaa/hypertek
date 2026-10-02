// Mirror of backend/Config/purchaseAcknowledgement.js. The server rejects any
// version other than its own, so bump both files together.
export const PURCHASE_ACK_VERSION = "2026-10-02";

export const PURCHASE_ACK_POINTS = [
  "I am buying a digital game item and any listed in-game benefits.",
  "The games are still in development. Any future use of this item in a game may depend on development and final game rules, and is not promised.",
  "This purchase is not an investment. No profit, income, payment or financial return is promised.",
  "Resale is not guaranteed.",
  "Any trade-in requires me to surrender the item, and the trade-in amount is always less than the amount originally allocated to the item.",
];

export const ackPayload = () => ({ accepted: true, version: PURCHASE_ACK_VERSION });
