// services/transakService.js
// Single, self-contained gateway to Transak's partner API.
// Responsibilities: access-token lifecycle, webhook JWT verification, order lookup (reconciliation),
// and status mapping. Nothing here touches HyperBucks or the DB — callers own that.
//
// Docs verified:
//   Access token: POST {base}/partners/api/v2/refresh-token  (header api-secret, body {apiKey}) → {accessToken, expiresAt}
//   Webhook:      body.data is a JWT signed with the access token → jwt.verify(body.data, accessToken)
//   Get order:    GET {base}/partners/api/v2/order/{orderId}   (headers x-api-key, access-token)
import axios from "axios";
import jwt from "jsonwebtoken";

const API_KEY = process.env.TRANSAK_API_KEY;
const API_SECRET = process.env.TRANSAK_API_SECRET;
const ENVIRONMENT = (process.env.TRANSAK_ENVIRONMENT || "STAGING").toUpperCase();

export function isStaging() {
  return ENVIRONMENT !== "PRODUCTION";
}

// API host (refresh-token, get-order).
export function apiBaseUrl() {
  return isStaging() ? "https://api-stg.transak.com" : "https://api.transak.com";
}

// API-gateway host (Create Widget URL / auth session) — different subdomain from apiBaseUrl.
export function gatewayBaseUrl() {
  return isStaging() ? "https://api-gateway-stg.transak.com" : "https://api-gateway.transak.com";
}

export function isConfigured() {
  return Boolean(API_KEY && API_SECRET);
}

// ── Access token cache ───────────────────────────────────────────────────────
// The token is a JWT valid ~7 days. Cache it and refresh when under 1 day remains.
let _token = null;
let _expiresAtMs = 0;
const REFRESH_MARGIN_MS = 24 * 60 * 60 * 1000; // refresh when <1 day left

export async function getAccessToken({ force = false } = {}) {
  if (!isConfigured()) {
    throw new Error("Transak is not configured (TRANSAK_API_KEY / TRANSAK_API_SECRET missing)");
  }
  const now = Date.now();
  if (!force && _token && now < _expiresAtMs - REFRESH_MARGIN_MS) {
    return _token;
  }

  const { data } = await axios.post(
    `${apiBaseUrl()}/partners/api/v2/refresh-token`,
    { apiKey: API_KEY },
    { headers: { "api-secret": API_SECRET, "content-type": "application/json", accept: "application/json" } }
  );

  // Response shape: { data: { accessToken, expiresAt } } (expiresAt is unix seconds).
  const payload = data?.data || data;
  _token = payload?.accessToken;
  if (!_token) throw new Error("Transak refresh-token returned no accessToken");
  _expiresAtMs = payload?.expiresAt ? payload.expiresAt * 1000 : now + 7 * 24 * 60 * 60 * 1000;
  return _token;
}

// ── Webhook verification ─────────────────────────────────────────────────────
// Transak POSTs { data: <signed JWT> }. Verify with the access token. On signature
// failure (token rotated), refresh once and retry before giving up.
// Returns { eventID, order } where order is the decoded webhookData.
export async function verifyWebhook(body) {
  const encoded = body?.data;
  if (!encoded || typeof encoded !== "string") {
    throw new Error("Transak webhook missing signed `data` field");
  }

  const decode = async ({ force }) => {
    const token = await getAccessToken({ force });
    return jwt.verify(encoded, token);
  };

  let decoded;
  try {
    decoded = await decode({ force: false });
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      decoded = await decode({ force: true }); // token may have rotated — refresh & retry once
    } else {
      throw err;
    }
  }

  const eventID = decoded?.eventID || body?.eventID;
  const order = decoded?.webhookData || decoded;
  return { eventID, order };
}

// ── Create Widget URL (mandatory API-based flow) ─────────────────────────────
// Transak deprecated building the widget URL client-side with apiKey+params. The URL must
// now be minted from the backend via the auth/session API; it embeds a single-use sessionId
// valid for 5 minutes. `widgetParams.referrerDomain` must be whitelisted in the dashboard.
export async function createWidgetUrl({ widgetParams, userIp }) {
  const token = await getAccessToken();
  const { data } = await axios.post(
    `${gatewayBaseUrl()}/api/v2/auth/session`,
    { widgetParams: { apiKey: API_KEY, ...widgetParams } },
    {
      headers: {
        "access-token": token,
        "x-api-key": API_KEY,
        "x-user-ip": userIp || "",
        "content-type": "application/json",
        accept: "application/json",
      },
    }
  );
  const url = (data?.data || data)?.widgetUrl;
  if (!url) throw new Error("Transak auth/session returned no widgetUrl");
  return url;
}

// ── Order lookup (reconciliation / polling) ──────────────────────────────────
export async function getOrder(transakOrderId) {
  const token = await getAccessToken();
  const { data } = await axios.get(`${apiBaseUrl()}/partners/api/v2/order/${transakOrderId}`, {
    headers: { "x-api-key": API_KEY, "access-token": token, accept: "application/json" },
  });
  return data?.data || data;
}

// ── Status mapping ───────────────────────────────────────────────────────────
// Transak status → our internal status + terminal flags. Applies to BUY and SELL.
const STATUS_MAP = {
  AWAITING_PAYMENT_FROM_USER: "CREATED",
  PAYMENT_DONE_MARKED_BY_USER: "PROCESSING",
  PROCESSING: "PROCESSING",
  PENDING_DELIVERY_FROM_TRANSAK: "PROCESSING",
  ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELLED: "FAILED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
};

export function mapStatus(transakStatus) {
  const internal = STATUS_MAP[transakStatus] || "PROCESSING";
  const success = internal === "COMPLETED";
  const failure = internal === "FAILED" || internal === "EXPIRED" || internal === "REFUNDED";
  return { internal, terminal: success || failure, success, failure };
}

// Map a webhook eventID directly to an internal status when the order body has no status.
export function statusFromEvent(eventID) {
  switch (eventID) {
    case "ORDER_CREATED": return "CREATED";
    case "ORDER_PAYMENT_VERIFYING":
    case "ORDER_PROCESSING": return "PROCESSING";
    case "ORDER_COMPLETED": return "COMPLETED";
    case "ORDER_FAILED": return "FAILED";
    case "ORDER_REFUNDED": return "REFUNDED";
    default: return null;
  }
}

export default {
  isStaging,
  isConfigured,
  apiBaseUrl,
  gatewayBaseUrl,
  getAccessToken,
  createWidgetUrl,
  verifyWebhook,
  getOrder,
  mapStatus,
  statusFromEvent,
};
