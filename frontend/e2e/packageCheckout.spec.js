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

test("clicking a package reaches checkout without opening a purchase before the acknowledgement", async ({ page }) => {
  await mockPackageApis(page);
  await loginAs(page);

  let purchaseCalled = false;
  await page.route("**/api/v1/packages/purchase", (route) => {
    purchaseCalled = true;
    route.fulfill({ json: { success: true, purchase: { _id: "purchase_1", status: "pending_payment" } } });
  });

  await page.goto("/packages");
  await page.getByTestId("package-card").click();

  await expect(page).toHaveURL(/\/packages\/starter-pack/);
  await expect(page.getByText("Starter Pack")).toBeVisible();
  // The purchase is only opened after the buyer ticks the checkout
  // acknowledgement and presses pay, never just by landing on the page.
  expect(purchaseCalled).toBe(false);
  // No wallet connected in this mocked run, so checkout falls back to the
  // "connect a wallet" prompt rather than the pay button — actually signing
  // and sending USDC needs a real wallet and belongs in a manual test.
  await expect(page.getByText(/connect your wallet/i)).toBeVisible();
});
