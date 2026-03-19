# HyperTek — Remaining Implementation Tasks

_Last updated: 2026-03-19_

This document tracks remaining engineering work that is either partially implemented or deferred for a future sprint. Everything here is functional at the "best-effort" level; the items below describe what's needed to reach full production quality.

---

## ✅ COMPLETED THIS SESSION

| Item | Status | Notes |
|---|---|---|
| Auto royalty USDC on-chain dispatch | ✅ Done | `RoyaltyService.js` — uses `PRIVATE_KEY` backend wallet + `BASE_USDC_ADDRESS` |
| HB cashout USDC (on-chain) | ✅ Done | `HBController.cashoutHB` — transfers USDC from backend wallet to user wallet |
| HB cashout bank (Stripe payout) | ✅ Done | Attempts `stripe.payouts.create()` + detailed admin email; admin processes manually |
| Materials/HB trade split | ✅ Done | `TradeModel` + `TradeController.completeTrade` — routes HB between users |
| Mobile layout fixes | ✅ Done | Withdraw HB cashout rows now `flex-col sm:flex-row`; `walletAddress` passed for USDC cashout |

---

## 🔴 HIGH PRIORITY — Requires Production Setup

### 1. Backend Wallet USDC Funding

**What:** The backend deployer wallet (`PRIVATE_KEY` in `Config/.env`) must hold USDC on Base Mainnet to send on-chain royalties and HB cashouts.

**Current state:** Transfers will fail with "Backend wallet USDC insufficient" until funded.

**How to fix:**
1. Identify the backend wallet address: load `0x1357...` private key to get `0x11Dd2233...`
2. Periodically transfer USDC from platform wallet (`0xb0EB...` — Don's Coinbase) to the backend wallet
3. Recommended: fund with $100–$500 USDC buffer; automate refill alert when balance drops below $20
4. Add `BASE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` is already in `Config/.env` ✅

**Files:** `backend/Config/.env`, `backend/services/RoyaltyService.js`, `backend/Controllers/HBController.js`

---

### 2. Stripe Connect — User Bank Payouts

**What:** Currently `stripe.payouts.create()` sends from the platform's Stripe balance to the *platform's own* bank account, not to the user's bank directly. For true user-to-user bank transfers, Stripe Connect is required.

**Current state:** Bank cashout creates a Stripe payout to Don's bank + sends admin email with user's bank details. Admin manually processes the second leg (platform → user bank transfer via Wise/SWIFT).

**How to implement full automation:**
1. Enable Stripe Connect on the HyperTek Stripe account (dashboard.stripe.com → Connect → Settings)
2. For each user requesting bank cashout:
   - Create a Stripe Connected Account: `stripe.accounts.create({ type: "express", country, email })`
   - Redirect user through Stripe onboarding: `stripe.accountLinks.create()`
   - Store `connectedAccountId` on `User` model
3. When user requests bank cashout:
   ```js
   // Transfer from platform to connected account
   const transfer = await stripe.transfers.create({
     amount: Math.round(usdAmount * 100),
     currency: "usd",
     destination: user.stripeConnectedAccountId,
   });
   // Then payout from connected account to their bank
   const payout = await stripe.payouts.create(
     { amount: Math.round(usdAmount * 100), currency: "usd" },
     { stripeAccount: user.stripeConnectedAccountId }
   );
   ```
4. Add `stripeConnectedAccountId` to `User` model
5. Add `/api/v1/hb/connect-bank` endpoint for Stripe onboarding flow

**Files to modify:** `backend/Models/User.js`, `backend/Controllers/HBController.js`, `backend/Routes/HBRoute.js`, `frontend/src/pages/DashboardPages/Withdraw.jsx`

---

### 3. Bank Details Verification (Admin Panel)

**What:** When a user submits bank details, `verified: false` is set. Currently only admin can verify manually. No admin UI exists.

**How to implement:**
1. Add admin endpoint: `PUT /api/v1/admin/users/:userId/verify-bank`
2. Add to admin panel `EditUser` page: bank details display + "Verify" button
3. Optional: Implement micro-deposit verification ($0.01 + $0.02 test deposits) via Stripe

**Files:** `admin/src/pages/EditUser.jsx`, `backend/Routes/AdminRoute.js`, `backend/Controllers/AdminController.js`

---

## 🟡 MEDIUM PRIORITY — Feature Complete But Needs Tuning

### 4. Royalty Dispatch for Stripe-Paid Sales

**What:** When a buyer pays with Stripe (fiat), the NFT is minted and transferred by the backend. The royalty is dispatched from `nftPurchaseService.js` via `dispatchRoyalty()`. This works IF the backend wallet has USDC (see item #1).

**Edge case:** When `paymentType = "bank"` is passed to `dispatchRoyalty`, the payout is marked pending and admin is emailed. Need to populate creator's `royaltyPaymentPreference` from `subCollection.royaltyPaymentPreference` and pass it through.

**Files:** `backend/Service/nftPurchaseService.js:228`, `backend/services/RoyaltyService.js`

---

### 5. Trade Listing Fee (500 HB) Deduction

**What:** Per Don's brief, creating a trade/quest listing costs 500 HB (≈ $2). The `listingFee` field exists on TradeModel but is never deducted from the poster's HB balance on creation.

**How to implement:**
```js
// In TradeController.createTrade, after validation:
const LISTING_FEE_HB = 500; // $2 = 500 HB
const poster = await User.findById(userId);
if ((poster.hyperBucks || 0) < LISTING_FEE_HB) {
  return res.status(400).json({ error: "You need 500 HB to post a listing" });
}
poster.hyperBucks -= LISTING_FEE_HB;
await poster.save();
await HBLedger.create({
  userId, type: "spend", amount: -LISTING_FEE_HB, balanceAfter: poster.hyperBucks,
  description: "Trade/Quest listing fee", reference: trade._id,
});
```

**Files:** `backend/Controllers/TradeController.js:44`

---

### 6. Buyback Reserve Price Enforcement

**What:** When `subCollection.minimumBuybackUSD > 0`, any sale below that price should be blocked (or at minimum flagged). Currently the buyback amount is incremented but the reserve is not enforced.

**How to implement:**
In `nftController.js` buy flow and `nftPurchaseService.js`:
```js
if (subCollection.isNFA && subCollection.minimumBuybackUSD > 0) {
  const reserveUSDC = subCollection.minimumBuybackUSD;
  if (priceUSDC < reserveUSDC) {
    return res.status(400).json({
      error: `Price below NFA reserve. Minimum: $${reserveUSDC}`,
      minimumBuybackUSD: reserveUSDC,
    });
  }
}
```

**Files:** `backend/Controllers/nftController.js`, `backend/Service/nftPurchaseService.js`

---

### 7. Admin Royalty Payout Panel

**What:** The `RoyaltyPayout` collection in MongoDB holds pending/failed payouts. No admin UI exists to view or manually process them.

**How to implement:**
1. Add admin endpoint: `GET /api/v1/admin/royalty-payouts` (filter by status)
2. Add `PUT /api/v1/admin/royalty-payouts/:id/mark-dispatched` endpoint
3. Add admin page `RoyaltyPayouts.jsx` listing pending payouts with "Mark Dispatched" button

**Files:** `admin/src/pages/RoyaltyPayouts.jsx` (new), `backend/Routes/AdminRoute.js`

---

## 🟢 LOW PRIORITY — Nice to Have

### 8. Google/Social Login

_On hold per user request (2026-03-19). Implement after core commerce features are stable._

**When ready:** Add Google OAuth via Passport.js or next-auth. `GOOGLE_CLIENT_ID` is already in `Config/.env` but blank.

---

### 9. Auto Smart Contract Interaction via Backend

**What:** The `Marketplace` smart contract has `withdrawSeller()` and `withdrawCreator()` functions. Currently users call these from the frontend. For Stripe-paid sales, the backend mints and transfers NFTs but doesn't interact with the marketplace contract's balance tracking.

**Investigation needed:** Determine if Stripe-paid NFT sales should also register on-chain via the Marketplace contract or if off-chain tracking in MongoDB is sufficient. Per Don's brief, the smart contract handles USDC payments only — Stripe is a separate off-chain path.

---

### 10. Quest Reward Escrow

**What:** Quest listings have a `reward` field in USDC. Currently the reward is stored as a number but no USDC is actually escrowed. When a quest is completed, no USDC transfer happens.

**How to implement (simplified):**
1. On quest creation: transfer `reward` USDC from poster's wallet to an escrow wallet (backend-controlled)
2. On `completeTrade`: release escrow USDC to `acceptedByWallet`
3. On `cancelTrade`: refund escrow to poster

---

## 📋 Environment Variables Checklist

All required variables for production operation:

```bash
# Config/.env (backend) — check these are set correctly
BASE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913  ✅ added
PRIVATE_KEY=0x...        # backend deployer wallet — must hold USDC for dispatches
STRIPE_SECRET_KEY=sk_live_51TAuP2H...    ✅
ADMIN_EMAIL=...          ✅
SMTP_HOST/PORT/USER/PASS ✅

# Missing / needs action:
# STRIPE_CONNECT_CLIENT_ID=  (needed for Connect onboarding — item #2)
```

---

## 🧪 Test Coverage Status

| Test File | Tests | Status |
|---|---|---|
| `backend/test/commission.test.js` | 21 | ✅ All passing |
| `backend/test/hb.test.js` | 35 | ✅ All passing |
| `backend/test/Market.test.js` | 1 | ✅ Deployment smoke test |
| Trade HB settlement | 0 | ⚠️ Missing — add to hb.test.js |
| Royalty dispatch (mocked) | 0 | ⚠️ Missing |

---

## 🏗 Architecture Notes

- **Backend wallet** (`PRIVATE_KEY`) = deployer wallet `0x0c40B9CC8e482432A357fB115a757c7D1b63A5C8` — used for minting, NFT transfers, and USDC royalty dispatch
- **Platform wallet** (`PLATFORM_WALLET_ADDRESS`) = Don's Coinbase wallet `0xb0EB...` — receives 20% platform fee on-chain via Marketplace contract; *we do not hold the private key*
- **Royalty flow**: Sale → `nftController/nftPurchaseService` calculates amounts → `dispatchRoyalty()` → on-chain USDC from backend wallet → creator
- **HB flow**: Game server calls `POST /api/v1/hb/earn` → user spends in marketplace → `POST /api/v1/hb/cashout` → USDC on-chain or Stripe bank
- **Stripe**: Live keys active. Inbound: PaymentIntent. Outbound: `payouts.create()` to platform bank. Full user payouts require Connect.
