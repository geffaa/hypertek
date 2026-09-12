// Smoke tests for the package-purchase flow (listing -> checkout intent creation).
// Backend is mocked at the route level so these run without Mongo/Stripe live —
// they check the frontend wiring, not the actual payment settlement, which
// belongs in the backend's own tests (test/gmbbSaleSplit.test.js etc).
import { test, expect } from "@playwright/test";

const mockPackage = {
  _id: "pkg_1",
  slug: "starter-pack",
  name: "Starter Pack",
  description: "A great way to begin.",
  image: "",
  badge: "Best Value",
  type: "bundle",
  priceUSD: 49,
  basePriceTotalUSD: 70,
  discountPercent: 30,
  currency: "USDC",
  items: [],
  availableStock: 5,
};

async function mockPackageApis(page) {
  await page.route("**/api/v1/packages", (route) =>
    route.fulfill({ json: { success: true, packages: [mockPackage] } }),
  );
  await page.route("**/api/v1/packages/starter-pack", (route) =>
    route.fulfill({ json: { success: true, package: mockPackage } }),
  );
  await page.route("**/api/v1/packages/purchase", (route) =>
    route.fulfill({
      json: { success: true, purchase: { _id: "purchase_1", status: "pending_payment" } },
    }),
  );
  await page.route("**/api/v1/payment/create-payment-intent", (route) =>
    route.fulfill({
      json: { clientSecret: "pi_test_mock_secret_123_secret_abc" },
    }),
  );
}

// Navbar.jsx decodes the token client-side (jwtDecode) to check expiry and
// logs out on anything that doesn't parse — so the mock token needs to be a
// real (unsigned) JWT shape, not just any string.
function makeFakeJwt() {
  const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const header = b64url({ alg: "none", typ: "JWT" });
  const payload = b64url({ sub: "user_1", exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${header}.${payload}.fakesignature`;
}

async function loginAs(page) {
  const token = makeFakeJwt();
  await page.addInitScript((jwt) => {
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: { id: "user_1", Email: "buyer@example.com", WalletAddress: "0xabc123" },
        token: jwt,
        isLoggedInUser: true,
      }),
    );
  }, token);
}

test("packages page lists active packages from the API", async ({ page }) => {
  await mockPackageApis(page);
  await page.goto("/packages");

  const card = page.getByTestId("package-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Starter Pack");
  await expect(card).toContainText("$49");
});

test("clicking a package starts a purchase intent and reaches checkout", async ({ page }) => {
  await mockPackageApis(page);
  await loginAs(page);

  let purchaseCalled = false;
  let intentCalled = false;
  await page.route("**/api/v1/packages/purchase", (route) => {
    purchaseCalled = true;
    route.fulfill({ json: { success: true, purchase: { _id: "purchase_1", status: "pending_payment" } } });
  });
  await page.route("**/api/v1/payment/create-payment-intent", (route) => {
    intentCalled = true;
    route.fulfill({ json: { clientSecret: "pi_test_mock_secret_123_secret_abc" } });
  });

  await page.goto("/packages");
  await page.getByTestId("package-card").click();

  await expect(page).toHaveURL(/\/packages\/starter-pack/);
  await expect(page.getByText("Starter Pack")).toBeVisible();
  await expect.poll(() => purchaseCalled).toBe(true);
  await expect.poll(() => intentCalled).toBe(true);
});
