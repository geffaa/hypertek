import { PURCHASE_ACK_VERSION } from "../Config/purchaseAcknowledgement.js";

function readAck(body) {
  const ack = body?.acknowledgement;
  if (!ack || ack.accepted !== true || ack.version !== PURCHASE_ACK_VERSION) return null;
  return { version: PURCHASE_ACK_VERSION, acceptedAt: new Date() };
}

// For requests that commit a buyer before any money moves (bids, offers,
// instant-buy, starting a package purchase): no acknowledgement, no request.
export function requireAcknowledgement(req, res, next) {
  const ack = readAck(req.body);
  if (!ack) {
    return res.status(400).json({
      success: false,
      error: "Please read and accept the purchase acknowledgement before continuing.",
      code: "ACK_REQUIRED",
      version: PURCHASE_ACK_VERSION,
    });
  }
  req.acknowledgement = ack;
  next();
}

// For requests that record a sale the buyer has already paid for on-chain.
// Rejecting here would leave the payment unrecorded, so the gate lives on the
// buy button; this only stores what the buyer agreed to.
export function captureAcknowledgement(req, _res, next) {
  req.acknowledgement = readAck(req.body);
  if (!req.acknowledgement) console.warn(`[ack] sale recorded without a current acknowledgement: ${req.originalUrl}`);
  next();
}
