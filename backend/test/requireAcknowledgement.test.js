import { requireAcknowledgement, captureAcknowledgement } from "../Middleware/requireAcknowledgement.js";
import { PURCHASE_ACK_VERSION } from "../Config/purchaseAcknowledgement.js";

function run(mw, body) {
  const req = { body, originalUrl: "/test" };
  const res = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
  let nexted = false;
  mw(req, res, () => { nexted = true; });
  return { req, res, nexted };
}

const valid = { acknowledgement: { accepted: true, version: PURCHASE_ACK_VERSION } };

describe("requireAcknowledgement", () => {
  test("lets a request with the current acknowledgement through and stamps it", () => {
    const { req, nexted } = run(requireAcknowledgement, valid);
    expect(nexted).toBe(true);
    expect(req.acknowledgement.version).toBe(PURCHASE_ACK_VERSION);
    expect(req.acknowledgement.acceptedAt).toBeInstanceOf(Date);
  });

  test.each([
    ["missing", {}],
    ["unticked", { acknowledgement: { accepted: false, version: PURCHASE_ACK_VERSION } }],
    ["an old version", { acknowledgement: { accepted: true, version: "2020-01-01" } }],
    ["a truthy non-boolean", { acknowledgement: { accepted: "yes", version: PURCHASE_ACK_VERSION } }],
  ])("rejects %s with 400 ACK_REQUIRED", (_label, body) => {
    const { res, nexted } = run(requireAcknowledgement, body);
    expect(nexted).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe("ACK_REQUIRED");
    expect(res.body.version).toBe(PURCHASE_ACK_VERSION);
  });
});

describe("captureAcknowledgement", () => {
  test("never blocks an already-paid sale, but records the acknowledgement when present", () => {
    expect(run(captureAcknowledgement, valid).req.acknowledgement.version).toBe(PURCHASE_ACK_VERSION);
    const missing = run(captureAcknowledgement, {});
    expect(missing.nexted).toBe(true);
    expect(missing.req.acknowledgement).toBeNull();
  });
});
