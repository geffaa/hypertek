# HyperTek — UI/System Issues Brief

_Audit date: 2026-03-20_
_Scope: Full frontend (frontend/ + admin/) codebase vs Don's Brief requirements_
_Legend: ❌ Critical (broken/missing) · ⚠️ Partial (present but incomplete) · ✅ Done this session_

---

## ✅ COMPLETED THIS SESSION

| # | Issue | Fix Applied |
|---|---|---|
| S1 | Wrong USDC address in Platform Treasury (`0x595BdF...`) | Fixed → `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| S2 | No Artist model / admin CRUD | Created `Artist.js`, `ArtistController.js`, `ArtistRoute.js`, registered in `Index.js` |
| S3 | No admin Royalty Payouts panel | Created `RoyaltyPayouts.jsx` + endpoints in `AdminNFA.js` |
| S4 | NFA buyback reserve not enforced on purchase | Added check in `nftPurchaseService.js` — blocks sale below `minimumBuybackUSD` |
| S5 | Trade/Quest listing fee (500 HB) never deducted | Implemented in `TradeController.createTrade` — deducts 500 HB + writes HBLedger |
| S6 | No Artist management UI in admin | Created `Artists.jsx` (list) + `ArtistForm.jsx` (add/edit) |
| S7 | EditSubCollection missing royalty payment preference | Added `royaltyPaymentPreference` toggle + bank details fields |
| S8 | App.jsx missing routes for new pages | Added `/artists`, `/artist-form`, `/royalty-payouts` |
| S9 | Sidebar missing Artist + Royalty Payouts menu items | Added both items with icons |

---

## OPEN ISSUES

---

### ❌ ISSUE-01: CollectionOnSale — Fully Hardcoded Mock Data

**File:** `frontend/src/Components/DashboardPages/CollectionOnSale.jsx`

**Actual behavior:**
- Page displays 3 hardcoded items: "Knight Armor", "Mage Staff", "Warrior Shield"
- Prices, token IDs, and status are all static mock strings
- Toggle switch only updates local state — no API call on status change
- No data is ever fetched from the backend

**Expected behavior (Don's brief):**
- Show all NFTs the logged-in user currently has listed for sale on the marketplace
- Fetch from `GET /api/v1/nft/user/owned-with-subs/:wallet` (filter `listed: true`)
- "Delist" toggle should call `PUT /api/v1/nft/delist/:subId`

**Fix approach:**
1. Replace mock array with `useEffect` → `GET /api/v1/nft/user/owned-with-subs/:wallet` (wallet from `useSelector`)
2. Filter results: `item.listed === true`
3. Toggle → `PUT /api/v1/nft/parent-collection/:parentId/sub-collection/:subId` with `{ listed: false }`
4. Refetch after toggle

**Priority:** High — users cannot see or manage their own listings

---

### ❌ ISSUE-02: Transaction History — Fully Hardcoded Mock Data

**File:** `frontend/src/Components/DashboardPages/Transactions.jsx` (or `frontend/src/pages/DashboardPages/Transactions.jsx`)

**Actual behavior:**
- 8 hardcoded fake transactions with mock tx hashes (`0xabc123...`, `0xdef456...`)
- Static dates, amounts, and item names
- Zero backend connection

**Expected behavior:**
- Show real buy/sell history for the logged-in user
- Source: `subCollection.salesHistory[]` array (populated on every purchase in `nftPurchaseService.js`)
- Show: date, item name, price (USDC), buyer/seller wallet, tx hash (link to BaseScan)

**Fix approach:**
1. Backend: Add `GET /api/v1/nft/user/transactions/:wallet` — aggregate all `salesHistory` entries where `buyer` or `seller` === wallet, sorted by `createdAt` desc
2. Frontend: Replace mock data with API call + loading/empty states
3. Tx hash → `https://basescan.org/tx/${hash}` link

**Priority:** High — users cannot verify their own purchase/sale history

---

### ❌ ISSUE-03: AddUserCollection — Button Has No Handler

**File:** `frontend/src/Components/DashboardPages/AddUserCollection.jsx`

**Actual behavior:**
- Form renders with Name, Description, Image upload fields
- "Add to Collection" button has **no `onClick` handler** — clicking does nothing

**Expected behavior (Don's brief):**
- Creators can upload their own NFC items for sale
- On submit: `POST /api/v1/nft/parent-collection` + `POST /api/v1/nft/parent-collection/:id/sub-collection`
- After creation, item appears in user's "My NFTs" list

**Fix approach:**
1. Add `handleSubmit` function: upload image → create parent collection (or find existing by user) → add sub-collection
2. Add `onClick={handleSubmit}` to button
3. Add loading + error states
4. Show success toast → navigate to user's collection

**Priority:** High — creator NFC upload workflow is completely non-functional

---

### ❌ ISSUE-04: Marketplace Item Click — Wrong Navigation Target

**File:** `frontend/src/Components/MarketPlaceCom/LineLayout.jsx` (or current GeneralTab/card component)

**Actual behavior:**
- Clicking an item card navigates to `/collections/${category}` — the category browse page
- User ends up on a list page, not the buy flow for the specific item

**Expected behavior (Don's brief):**
- Clicking an item card opens the item detail/buy page
- Should navigate to the Buy page with item context: `navigate('/buy-nfa', { state: { subCollectionId, parentId, ... } })`
- Or: `navigate('/buy-1', { state: { item, parentId } })`

**Fix approach:**
In the item card `onClick`:
```js
navigate('/buy-nfa', {
  state: {
    subCollectionId: item._id,
    parentId: item.parentId,
    item,
  }
});
```
Check existing Buy page routes: `Buy1.jsx` uses `useLocation().state` — pass compatible shape.

**Priority:** High — the core purchase flow is unreachable from the marketplace

---

### ❌ ISSUE-05: Admin Buyback Approval — No UI Exists

**Actual behavior:**
- `minimumBuybackUSD` is stored on each NFA sub-collection
- The 5% buyback fund is dispatched to `BUYBACK_WALLET_ADDRESS` via `dispatchRoyalty()` on every NFA sale
- No admin page exists to: view buyback fund balance, see pending buyback requests, or approve/process them

**Expected behavior (Don's brief):**
> "The artist can then request a buyback from HyperTek who has accumulated a buyback reserve from the 5% contribution"

**Fix approach:**
1. Backend: `GET /api/v1/admin/buyback/pending` — find all `RoyaltyPayout` records with `note: "NFA buyback fund 5%"` + any buyback request model
2. Consider adding `BuybackRequest` model: `{ userId, subCollectionId, requestedAt, status, approvedAt, txHash }`
3. Admin page `BuybackApproval.jsx`: list pending requests, "Approve & Pay" button → triggers USDC transfer from buyback wallet to requester

**Priority:** Medium — the financial mechanism exists on-chain but admin cannot manage it

---

### ⚠️ ISSUE-06: HyperBucks Balance — Not Displayed in Navbar

**File:** `frontend/src/Components/Common/Navbar.jsx`

**Actual behavior:**
- Navbar shows user avatar and name when logged in
- HB balance is not displayed anywhere in the Navbar or header area

**Expected behavior (Don's brief):**
> "HyperBucks are visible in the user's account dashboard and can be spent in the marketplace"

**Fix approach:**
1. `useSelector(state => state.user.hyperBucks)` or fetch from `GET /api/v1/hb/balance`
2. Display as `⚡ {balance} HB` in Navbar next to username
3. Click → navigate to `/hb-dashboard` or `/withdraw`

**Priority:** Medium — users cannot see their HB balance without navigating to dashboard

---

### ⚠️ ISSUE-07: Frontend Sidebar — Missing Key Navigation Items

**File:** `frontend/src/Components/Common/Navbar.jsx` or user dashboard sidebar

**Actual behavior:**
- User dashboard sidebar only has 3 items: Create NFA's, NFA's Collection, Support
- Missing: Withdraw, Upload NFC, Edit Profile, Transaction History, My Listings

**Expected behavior:**
- Full navigation per Don's brief:
  - My NFTs / Collections
  - Transactions
  - My Listings (CollectionOnSale)
  - Withdraw (HB cashout)
  - Upload NFC (AddUserCollection)
  - Edit Profile
  - Support

**Fix approach:**
Add missing `<NavLink>` items in the user-facing sidebar/dashboard navigation component pointing to their respective route paths.

**Priority:** Medium — users cannot discover or navigate to key features

---

### ❌ ISSUE-08: Footer Broken Links

**File:** `frontend/src/Components/Common/Footer.jsx`

**Actual behavior:**
- Footer contains links to `/whitepapers` and `/terms`
- Neither route exists in `frontend/src/App.jsx`
- Clicking navigates to the catch-all 404/redirect

**Expected behavior:**
- Either: Create placeholder pages for these routes
- Or: Remove links until pages are built

**Fix approach (quick):**
In `Footer.jsx`, replace non-existent route links with `#` or `coming-soon` anchors, OR create simple placeholder page components and add routes.

**Priority:** Low — cosmetic, but creates a broken UX impression

---

### ⚠️ ISSUE-09: Stripe Card Payment — Not Integrated in Main Buy Flow

**File:** `frontend/src/pages/Buy1.jsx` (or main buy page)

**Actual behavior:**
- The primary buy flow (`Buy1.jsx`) only handles USDC/crypto wallet payment
- Stripe card payment exists as a separate route (`/buy-stripe` or similar) but is not offered as an option within the standard buy flow
- Users who don't have crypto must navigate to a separate page

**Expected behavior (Don's brief):**
- Buy page should offer two payment methods: USDC wallet OR credit/debit card (Stripe)
- Both options should be available on the same page

**Fix approach:**
1. In `Buy1.jsx`: add a payment method selector (`crypto` | `card`)
2. When `card` selected: render Stripe `<CardElement>` inline (or redirect to Stripe Checkout)
3. On `card` confirm: `POST /api/v1/nft/stripe/buy` with `{ subCollectionId, parentId, buyerWallet }`
4. Reuse existing `nftPurchaseService.finalizeNFAPurchase` on backend

**Priority:** Medium — limits accessibility for non-crypto users

---

### ⚠️ ISSUE-10: Security — Private Key Sent in Welcome Email

**File:** `backend/Models/User.js` → `sendWelcomeEmail()` function

**Actual behavior:**
- On user registration, the wallet's private key is **decrypted** and sent as **plaintext** in the welcome email
- Email body contains the raw private key string

**Expected behavior (Don's brief):**
> "Encrypted private key backup" — key should be delivered in encrypted form or via a secure download link, not as plaintext email

**Fix approach:**
Option A (minimum): Send the **encrypted** private key (the value already stored in `encryptedPrivateKey` field) along with instructions to decrypt using their password. Never decrypt on the server side for email.

Option B (preferred): Generate a one-time secure download link (`/api/v1/auth/private-key-download/:token`) valid for 24 hours. Send the link in the email, not the key itself.

**Priority:** Medium-High — plaintext private key in email is a security risk (email interception, server-side mail logs)

---

### ⚠️ ISSUE-11: Duplicate editNfts.jsx File

**Files:**
- `admin/src/pages/editNfts.jsx`
- `admin/src/pages/EditCollection2.jsx` (likely the same or similar component)

**Actual behavior:**
- Both files appear to serve the NFT edit functionality
- Unclear which is the canonical file actually used by routing

**Expected behavior:**
- Single canonical edit page wired to `/edit-collection-item` route (currently `EditCollection2`)

**Fix approach:**
1. Confirm `App.jsx` route: `edit-collection-item` → `EditCollection2` ✅
2. Check if `editNfts.jsx` is imported anywhere — if not, delete it

**Priority:** Low — code hygiene, no functional impact

---

## Summary Table

| # | Issue | File(s) | Priority | Effort |
|---|---|---|---|---|
| 01 | CollectionOnSale hardcoded mock | `CollectionOnSale.jsx` | High | Medium |
| 02 | Transactions hardcoded mock | `Transactions.jsx` | High | Medium |
| 03 | AddUserCollection no submit | `AddUserCollection.jsx` | High | Small |
| 04 | Marketplace click → wrong page | `LineLayout.jsx` / cards | High | Small |
| 05 | Admin buyback approval missing | (new page needed) | Medium | Large |
| 06 | HB balance not in Navbar | `Navbar.jsx` | Medium | Small |
| 07 | User sidebar missing nav items | sidebar/nav component | Medium | Small |
| 08 | Footer broken links | `Footer.jsx` | Low | Small |
| 09 | Stripe not in main buy flow | `Buy1.jsx` | Medium | Medium |
| 10 | Private key in welcome email | `User.js` | Medium-High | Small |
| 11 | Duplicate editNfts.jsx | `editNfts.jsx` | Low | Trivial |

---

## Fix Order (Recommended)

### Sprint 1 — Core Commerce Flows (Issues 01–04)
These block the fundamental buy/sell user journey.
1. **ISSUE-04** (item click → buy page) — 1h
2. **ISSUE-03** (AddUserCollection submit handler) — 2h
3. **ISSUE-01** (CollectionOnSale real data) — 3h
4. **ISSUE-02** (Transactions real data + backend endpoint) — 4h

### Sprint 2 — Security + Navigation (Issues 06–07, 10)
5. **ISSUE-10** (private key email) — 1h
6. **ISSUE-06** (HB balance in Navbar) — 1h
7. **ISSUE-07** (user sidebar nav items) — 1h

### Sprint 3 — Payment + Admin (Issues 05, 09)
8. **ISSUE-09** (Stripe in main buy flow) — 4h
9. **ISSUE-05** (admin buyback approval UI) — 6h

### Sprint 4 — Cleanup (Issues 08, 11)
10. **ISSUE-08** (footer broken links) — 30min
11. **ISSUE-11** (duplicate file cleanup) — 15min

---

_Total remaining estimate: ~23h of engineering work_
_Document owner: Engineering_
_Last updated: 2026-03-20_
