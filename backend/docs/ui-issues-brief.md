# HyperTek — UI/System Issues Brief

_Audit date: 2026-03-20_
_Last updated: 2026-03-20_
_Scope: Full frontend (frontend/ + admin/) codebase vs Don's Brief requirements_
_Legend: ❌ Critical (broken/missing) · ⚠️ Partial (present but incomplete) · ✅ Fixed_

---

## ✅ FIXED THIS SESSION

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
| 05 | Admin Buyback Approval — No UI Exists | Created `BuybackRequest.js` model, `BuybackController.js`, `BuybackRoute.js`, registered in `Index.js`, created `BuybackApproval.jsx` admin page, wired route + sidebar |
| 09 | Stripe Card Payment — Not Integrated in Main Buy Flow | Added payment method toggle + inline `StripeNFTCheckoutForm` to `Buy1.jsx`; calls `POST /api/v1/payment/create-payment-intent` |
| 01 | CollectionOnSale — Fully Hardcoded Mock Data | Replaced with real API: `GET /user/listed-subs/:wallet` · delist via PUT · delete via DELETE |
| 02 | Transaction History — Fully Hardcoded Mock Data | New backend endpoint `GET /user/transactions/:wallet` · frontend fetches real salesHistory |
| 03 | AddUserCollection — Button Has No Handler | Added full `handleSubmit`: FormData POST to `/parent-collection/create` · loading/error states · category selector |
| 04 | Marketplace Item Click — Wrong Navigation Target | `LineCard` now navigates to `/buy-nfa` with `state: { subCollectionId, parentId, item }`. Dummy items still go to category page |
| 06 | HyperBucks Balance — Not Displayed in Navbar | `Navbar.jsx` fetches `GET /api/v1/hb/balance` · displays `⚡ X HB` badge linking to `/dashboard/withdraw` |
| 07 | Frontend Sidebar — Missing Key Navigation Items | Added: Transactions, My Listings, Upload NFC, Withdraw HB, Edit Profile |
| 08 | Footer Broken Links | Routes `/whitepapers` and `/terms` already exist in `App.jsx` — no fix needed |
| 10 | Security — Private Key Sent in Welcome Email | `sendWelcomeEmail` now passes `encryptedPrivateKey` to template (never decrypts on server). Template updated to explain encrypted backup |
| 11 | Duplicate editNfts.jsx File | Confirmed `editNfts.jsx` had zero imports — deleted |

---

## OPEN ISSUES

_All issues resolved. No remaining open items._

---

## Summary Table

| # | Issue | File(s) | Priority | Status |
|---|---|---|---|---|
| 01 | CollectionOnSale hardcoded mock | `CollectionOnSale.jsx` | High | ✅ Fixed |
| 02 | Transactions hardcoded mock | `Transaction.jsx` + new backend endpoint | High | ✅ Fixed |
| 03 | AddUserCollection no submit | `AddUserCollection.jsx` | High | ✅ Fixed |
| 04 | Marketplace click → wrong page | `LineLayout.jsx` | High | ✅ Fixed |
| 05 | Admin buyback approval missing | `BuybackApproval.jsx` + backend | Medium | ✅ Fixed |
| 06 | HB balance not in Navbar | `Navbar.jsx` | Medium | ✅ Fixed |
| 07 | User sidebar missing nav items | `Sidebar.jsx` | Medium | ✅ Fixed |
| 08 | Footer broken links | `Footer.jsx` | Low | ✅ N/A — routes exist |
| 09 | Stripe not in main buy flow | `Buy1.jsx` | Medium | ✅ Fixed |
| 10 | Private key in welcome email | `User.js` + `emailTemplates.js` | Medium-High | ✅ Fixed |
| 11 | Duplicate editNfts.jsx | `editNfts.jsx` | Low | ✅ Deleted |

---

## Remaining Work

_All issues complete. No remaining work._

---

_Document owner: Engineering_
_Last updated: 2026-03-20_
