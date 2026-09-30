// Smoke test for the GMBB "Claim Now" page — the escrow contract isn't deployed
// yet, so this only checks the page is honest about that (disabled button,
// "coming soon" banner), not that a real claim works.
import { test, expect } from "@playwright/test";

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
      JSON.stringify({ user: { id: "user_1", WalletAddress: "0xabc123" }, token: jwt, isLoggedInUser: true }),
    );
  }, token);
}

test("claim page shows guaranteed amounts with claiming disabled while the contract isn't live", async ({ page }) => {
  await loginAs(page);
  await page.route("**/api/v1/gmbb-claim/config", (route) =>
    route.fulfill({ json: { success: true, isLive: false, contractAddress: null, chainId: 84532 } }),
  );
  await page.route("**/api/v1/gmbb-claim/items", (route) =>
    route.fulfill({
      json: {
        success: true,
        items: [{ parentId: "p1", subCollectionId: "s1", name: "Genesis Skin", assetType: "NFC", tokenId: 1, guaranteedUSD: 500 }],
      },
    }),
  );

  await page.goto("/claim");

  await expect(page.getByTestId("claim-not-live-banner")).toBeVisible();
  await expect(page.getByTestId("claim-item-row")).toContainText("Genesis Skin");
  await expect(page.getByTestId("claim-item-row")).toContainText("$500");
  await expect(page.getByTestId("claim-button")).toBeDisabled();
  await expect(page.getByTestId("claim-button")).toHaveText("Coming soon");
});
