// Unit tests for the Transak integration.
//   • Real code: transakService status mapping + webhook JWT verification (axios mocked).
//   • Pure mirrors: the webhook HB-credit rule and cashout HB math (matches this repo's
//     "mirror the controller logic" test style, since the controller needs Mongo + chain).
import { jest } from "@jest/globals";

// Mock axios BEFORE importing the service so getAccessToken() never hits the network.
const mockPost = jest.fn();
const mockGet = jest.fn();
jest.unstable_mockModule("axios", () => ({
  default: { post: mockPost, get: mockGet },
}));

process.env.TRANSAK_API_KEY = "test-key";
process.env.TRANSAK_API_SECRET = "test-secret";
process.env.TRANSAK_ENVIRONMENT = "STAGING";

const jwt = (await import("jsonwebtoken")).default;
const transak = (await import("../services/transakService.js")).default;

const ACCESS_TOKEN = "super-secret-access-token";

beforeEach(() => {
  mockPost.mockReset();
  mockGet.mockReset();
  // refresh-token endpoint returns our signing secret as the access token
  mockPost.mockResolvedValue({ data: { data: { accessToken: ACCESS_TOKEN, expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 } } });
});

// ─── Real: status mapping ────────────────────────────────────────────
describe("transakService.mapStatus", () => {
  test("COMPLETED is terminal success", () => {
    expect(transak.mapStatus("COMPLETED")).toEqual({ internal: "COMPLETED", terminal: true, success: true, failure: false });
  });
  test.each(["CANCELLED", "FAILED"])("%s maps to terminal FAILED", (s) => {
    const r = transak.mapStatus(s);
    expect(r.internal).toBe("FAILED");
    expect(r.failure).toBe(true);
    expect(r.success).toBe(false);
  });
  test("EXPIRED and REFUNDED are terminal failures", () => {
    expect(transak.mapStatus("EXPIRED")).toMatchObject({ internal: "EXPIRED", failure: true });
    expect(transak.mapStatus("REFUNDED")).toMatchObject({ internal: "REFUNDED", failure: true });
  });
  test.each(["AWAITING_PAYMENT_FROM_USER", "PROCESSING", "PENDING_DELIVERY_FROM_TRANSAK"])(
    "%s is non-terminal",
    (s) => {
      expect(transak.mapStatus(s).terminal).toBe(false);
    }
  );
  test("unknown status defaults to non-terminal PROCESSING", () => {
    expect(transak.mapStatus("SOMETHING_NEW")).toMatchObject({ internal: "PROCESSING", terminal: false });
  });
});

describe("transakService.statusFromEvent", () => {
  test("maps order events to internal statuses", () => {
    expect(transak.statusFromEvent("ORDER_CREATED")).toBe("CREATED");
    expect(transak.statusFromEvent("ORDER_PROCESSING")).toBe("PROCESSING");
    expect(transak.statusFromEvent("ORDER_COMPLETED")).toBe("COMPLETED");
    expect(transak.statusFromEvent("ORDER_FAILED")).toBe("FAILED");
    expect(transak.statusFromEvent("ORDER_REFUNDED")).toBe("REFUNDED");
    expect(transak.statusFromEvent("UNKNOWN")).toBeNull();
  });
});

// ─── Real: webhook verification ──────────────────────────────────────
describe("transakService.verifyWebhook", () => {
  test("rejects a body with no signed data", async () => {
    await expect(transak.verifyWebhook({})).rejects.toThrow(/missing signed/i);
  });

  test("verifies a JWT signed with the access token and returns eventID + order", async () => {
    const order = { partnerOrderId: "po-1", id: "tx-1", status: "COMPLETED", cryptoAmount: 4 };
    const data = jwt.sign({ eventID: "ORDER_COMPLETED", webhookData: order }, ACCESS_TOKEN);
    const result = await transak.verifyWebhook({ data });
    expect(result.eventID).toBe("ORDER_COMPLETED");
    expect(result.order).toMatchObject({ partnerOrderId: "po-1", status: "COMPLETED", cryptoAmount: 4 });
  });

  test("rejects a JWT signed with a different secret (bad signature)", async () => {
    // Signed with an attacker secret — must fail verification even after the forced-refresh retry.
    const forged = jwt.sign({ eventID: "ORDER_COMPLETED", webhookData: { partnerOrderId: "po-x" } }, "attacker-secret");
    await expect(transak.verifyWebhook({ data: forged })).rejects.toThrow();
  });
});

// ─── Mirror: cashout amount → USD (controller guard) ─────────────────
// Transak only moves USDC to/from the user's wallet now — no HB crediting in the controller.
// The one money-math guard left is the cashout minimum + HB→USD conversion.
const HB_TO_USD = 250;
const MIN_HB = 250;

function validateCashoutHb(hb) {
  return Number.isFinite(hb) && hb >= MIN_HB;
}
const hbToUsd = (hb) => parseFloat((hb / HB_TO_USD).toFixed(2));

describe("cashout HB guards (mirror)", () => {
  test.each([250, 500, 8956])("%d HB is a valid cashout amount", (v) => expect(validateCashoutHb(v)).toBe(true));
  test.each([0, 100, 249, NaN])("%d HB is below the minimum", (v) => expect(validateCashoutHb(v)).toBe(false));
  test("250 HB = $1.00", () => expect(hbToUsd(250)).toBe(1));
  test("8956 HB = $35.82", () => expect(hbToUsd(8956)).toBe(35.82));
});
