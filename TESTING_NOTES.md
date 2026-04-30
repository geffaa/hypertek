# Testing Notes — HyperTek Marketplace

## [IMPORTANT] Why the "Listed" Toggle Was Removed from the Dashboard

### What was changed
The toggle switch in the **NFA's Collection** (`/dashboard/collections`) and **Collection On Sale** (`/dashboard/collection-on-sale`) pages has been replaced with a **read-only status badge**.

### Why it was removed
The old toggle only updated a database flag (`listed: true/false`) without interacting with the blockchain smart contract. This caused a critical mismatch:

- **Database said**: item is listed ✓
- **Blockchain said**: no active listing exists ✗

As a result, buyers could see the item in the marketplace but could **not purchase it** — the on-chain transaction would fail because no listing existed in the smart contract.

### How listing now works (correct flow)

Listing status is now driven **entirely by on-chain state**. The `listed` flag in the database is only updated when a real blockchain transaction occurs.

```
1. Creator creates a collection via Dashboard → items start as Unlisted

2. Seller goes to /Profile (My Collectibles)
   → Sees their unlisted items
   → Clicks "Sell Now"

3. Seller connects wallet (MetaMask / RainbowKit)
   → Clicks "List Now"
   → Navigates to /buy-nfa

4. On /buy-nfa page, seller:
   a. Sets a price (USDC)
   b. Mints NFT on-chain (if not yet minted → gets a tokenId)
   c. Approves the marketplace contract (one-time, per wallet)
   d. Calls createListing(tokenId, price) on-chain
   e. Backend records: listed = true + tokenId saved

5. Item is now visible AND purchasable in the marketplace

6. To delist: go to /List → select item → Cancel Listing
   → Calls cancelListing() on-chain
   → Backend records: listed = false
```

### What the dashboard Status badge now shows

| Badge | Meaning |
|---|---|
| 🟢 `X Listed` | That many sub-items have an active on-chain listing |
| ⚪ `Unlisted` | No items in this collection are listed on-chain |
| 🟢 `On-chain Listed` | This specific item has an active listing on the smart contract |

### What testers should verify

- [ ] Items appear in the marketplace only after completing the full `/buy-nfa` listing flow
- [ ] The status badge in the dashboard reflects the actual on-chain state
- [ ] Cancelling a listing via `/List` correctly sets the item back to Unlisted
- [ ] Items that are Unlisted in the database do **not** appear to buyers in the marketplace
