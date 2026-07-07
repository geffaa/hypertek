// stripeConnect — shared Stripe Connect helpers for AU custom connected accounts.
//
// The platform Stripe account is AU/AUD. Stripe does NOT support cross-border payouts
// from an AU platform, so every connected account we create is AU and pays out in AUD.
// Both the HyperBucks cashout flow (HBController) and the artist royalty flow
// (RoyaltyService) use these helpers — previously each had its own near-identical copy.
//
// These helpers are persistence-agnostic: they return Stripe ids/objects; the caller is
// responsible for storing stripeConnectAccountId / stripeExternalAccountId on its model.

import Stripe from "stripe";

export const PLATFORM_COUNTRY = "AU";
export const PLATFORM_CURRENCY = "aud";

let _stripe = null;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: "2023-10-16" });
  return _stripe;
}

export function isTestMode() {
  return process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
}

/**
 * createConnectedAccount — create a custom AU connected account with manual payouts.
 * Returns the Stripe account object. Caller persists account.id.
 */
export async function createConnectedAccount(stripe, { email, fullName, productDescription, ip }) {
  const nameParts = (fullName || "").trim().split(" ");
  return stripe.accounts.create({
    type: "custom",
    country: PLATFORM_COUNTRY,
    email: email || undefined,
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    business_type: "individual",
    individual: {
      email: email || undefined,
      first_name: nameParts[0] || "User",
      last_name: nameParts.slice(1).join(" ") || "Account",
    },
    business_profile: {
      mcc: "7372",
      url: "https://hypertek100.com",
      product_description:
        productDescription || "In-game currency (Hyper Bucks) top-up and cashout for the Hyper Tek gaming ecosystem.",
    },
    tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: ip || "127.0.0.1" },
    settings: { payouts: { schedule: { interval: "manual" } } },
  });
}

/**
 * ensureTestCapabilities — in TEST mode, push Stripe's canonical AU test identity so the
 * `transfers` capability activates without a real KYC flow. Returns true if active.
 * No-op (returns true) outside test mode.
 */
export async function ensureTestCapabilities(stripe, accountId) {
  if (!isTestMode()) return true;
  try {
    const account = await stripe.accounts.retrieve(accountId);
    if (account.capabilities?.transfers === "active") return true;

    await stripe.accounts.update(accountId, {
      individual: {
        dob: { day: 1, month: 1, year: 1901 },
        address: { line1: "123 Main St", city: "Sydney", state: "NSW", postal_code: "2000", country: "AU" },
        phone: "+61200000000",
        id_number: "000000000", // test TFN
      },
      business_profile: {
        mcc: "7372",
        url: "https://hypertek100.com",
        product_description: "Hyper Tek gaming ecosystem payouts.",
      },
    });

    // Stripe activates capabilities asynchronously — wait for propagation.
    await new Promise((r) => setTimeout(r, 5000));
    const updated = await stripe.accounts.retrieve(accountId);
    return updated.capabilities?.transfers === "active";
  } catch (e) {
    console.warn("[stripeConnect] capability activation attempt failed:", e.message);
    return false;
  }
}

/** transfersActive — quick check that the connected account can receive transfers. */
export async function transfersActive(stripe, accountId) {
  const account = await stripe.accounts.retrieve(accountId);
  return account.capabilities?.transfers === "active";
}

async function removeExistingExternalAccount(stripe, accountId, externalAccountId) {
  if (!externalAccountId) return;
  try {
    await stripe.accounts.deleteExternalAccount(accountId, externalAccountId);
  } catch {
    /* already gone */
  }
}

/**
 * attachAuBankAccount — attach an Australian bank account (BSB + account number) as the
 * default AUD external account. Returns the new external account id.
 * `previousExternalId` (optional) is detached first.
 */
export async function attachAuBankAccount(stripe, accountId, { accountHolderName, bsb, accountNumber }, previousExternalId) {
  const token = await stripe.tokens.create({
    bank_account: {
      country: "AU",
      currency: "aud",
      account_holder_name: accountHolderName,
      account_holder_type: "individual",
      routing_number: String(bsb || "").replace(/[-\s]/g, ""), // BSB without dashes
      account_number: accountNumber,
    },
  });
  await removeExistingExternalAccount(stripe, accountId, previousExternalId);
  const ext = await stripe.accounts.createExternalAccount(accountId, {
    external_account: token.id,
    default_for_currency: true,
  });
  return ext.id;
}

/**
 * attachDebitCard — attach a Stripe card token (created on the frontend via Stripe.js) as
 * the default external account for instant payouts. Returns the new external account id.
 */
export async function attachDebitCard(stripe, accountId, cardToken, previousExternalId) {
  await removeExistingExternalAccount(stripe, accountId, previousExternalId);
  const ext = await stripe.accounts.createExternalAccount(accountId, {
    external_account: cardToken,
    default_for_currency: true,
  });
  return ext.id;
}
