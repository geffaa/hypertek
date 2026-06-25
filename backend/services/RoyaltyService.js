/**
 * RoyaltyService.js
 * Records and dispatches royalty payments to artists/creators after each sale.
 *
 * Behaviour:
 *   - Creates a RoyaltyPayout record
 *   - Crypto dispatch: sends USDC on-chain from backend wallet → creator wallet
 *     Requires: PRIVATE_KEY wallet holds USDC on Base Mainnet.
 *     Fund it with USDC from platform revenue (0xb0EB...) periodically.
 *   - Bank dispatch: paid out automatically via Stripe Connect (transfer + payout)
 *   - Falls back gracefully: on-chain tx failure → status "failed", admin notified
 */

import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { ethers } from "ethers";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Artist from "../Models/Artist.js";

// Minimal ERC-20 ABI — only transfer + balanceOf needed
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../Config/.env") });

// ── Payout model ──────────────────────────────────────────────────────────────
const royaltyPayoutSchema = new mongoose.Schema(
  {
    subCollectionId: String,
    parentId: String,
    saleRecordId: String,
    artistId: String, // set for artist_royalty payouts — used for Stripe bank payout & retry
    creatorWallet: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "USDC" },
    // "crypto" = send USDC to wallet | "bank" = automatic payout via Stripe Connect
    paymentType: { type: String, enum: ["crypto", "bank"], default: "crypto" },
    // "artist_royalty" = 4% to creator | "buyback_fund" = 5% to buyback wallet | "company_fee" = platform's share
    payoutType: { type: String, enum: ["artist_royalty", "buyback_fund", "company_fee"], default: "artist_royalty" },
    status: { type: String, enum: ["pending", "dispatched", "failed"], default: "pending" },
    txHash: String,
    note: String,
  },
  { timestamps: true },
);

export const RoyaltyPayout =
  mongoose.models.RoyaltyPayout ||
  mongoose.model("RoyaltyPayout", royaltyPayoutSchema);

// ── SMTP transporter ──────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

async function notifyAdmin(payout) {
  try {
    await transporter.sendMail({
      from: `"HyperTek" <${process.env.SMTP_EMAIL}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
      subject: `[HyperTek] Royalty Payout Pending — ${payout.amount} USDC`,
      html: `
        <h2>Royalty Payout Queued</h2>
        <table>
          <tr><td><b>Amount</b></td><td>${payout.amount} USDC</td></tr>
          <tr><td><b>Creator Wallet</b></td><td>${payout.creatorWallet || "—"}</td></tr>
          <tr><td><b>Payment Type</b></td><td>${payout.paymentType}</td></tr>
          <tr><td><b>NFT ID</b></td><td>${payout.subCollectionId}</td></tr>
          <tr><td><b>Status</b></td><td>${payout.status}</td></tr>
        </table>
        <p>Log into the admin panel to process this payout.</p>
      `,
    });
  } catch (err) {
    console.warn("⚠️ [RoyaltyService] Admin notification email failed:", err.message);
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * dispatchRoyalty — call after every completed sale.
 *
 * @param {object} opts
 * @param {string} opts.subCollectionId
 * @param {string} opts.parentId
 * @param {string} opts.creatorWallet   — wallet address or "admin"
 * @param {number} opts.amount          — USDC amount (human-readable, e.g. 4.00)
 * @param {string} [opts.saleRecordId]
 * @param {string} [opts.paymentType]   — "crypto" | "bank" (default: "crypto")
 */
export async function dispatchRoyalty({
  subCollectionId,
  parentId,
  creatorWallet,
  amount,
  saleRecordId,
  artistId,
  paymentType = "crypto",
  payoutType = "artist_royalty",
  note,
}) {
  if (!amount || amount <= 0) return null;

  // Record the payout
  const payout = await RoyaltyPayout.create({
    subCollectionId,
    parentId,
    saleRecordId,
    artistId,
    creatorWallet,
    amount: parseFloat(amount.toFixed(6)),
    currency: "USDC",
    paymentType,
    payoutType,
    status: "pending",
    note,
  });

  console.log(
    `💰 [RoyaltyService] Payout queued: ${amount} USDC → ${creatorWallet} (ID: ${payout._id})`
  );

  if (paymentType === "crypto" && creatorWallet && creatorWallet !== "admin") {
    return await dispatchRoyaltyOnChain(payout);
  }

  // Bank payout — pay out automatically via Stripe Connect (artist royalties only)
  if (paymentType === "bank" && artistId) {
    return await dispatchRoyaltyViaStripe(payout);
  }

  // No automatic route available — notify admin to process manually
  await notifyAdmin(payout);
  return payout;
}

/**
 * dispatchRoyaltyOnChain — attempt on-chain USDC transfer for an existing RoyaltyPayout record.
 * Called automatically after sale, and also by the admin retry endpoint.
 *
 * @param {object} payout — RoyaltyPayout mongoose document
 */
export async function dispatchRoyaltyOnChain(payout) {
  try {
    const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
    const privateKey = process.env.PRIVATE_KEY;
    const usdcAddr = process.env.BASE_USDC_ADDRESS;

    if (!privateKey || !usdcAddr) {
      throw new Error("PRIVATE_KEY or BASE_USDC_ADDRESS not set in env");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const usdc = new ethers.Contract(usdcAddr, ERC20_ABI, signer);

    const amountUnits = ethers.parseUnits(payout.amount.toFixed(6), 6);

    const balance = await usdc.balanceOf(await signer.getAddress());
    if (balance < amountUnits) {
      throw new Error(
        `Backend wallet USDC balance insufficient. Has: ${ethers.formatUnits(balance, 6)}, needs: ${payout.amount}`
      );
    }

    const tx = await usdc.transfer(payout.creatorWallet, amountUnits);
    await tx.wait();

    const updated = await RoyaltyPayout.findByIdAndUpdate(
      payout._id,
      { status: "dispatched", txHash: tx.hash, note: `Auto-dispatched on-chain at ${new Date().toISOString()}` },
      { new: true }
    );

    console.log(`[RoyaltyService] USDC dispatched: ${payout.amount} USDC → ${payout.creatorWallet} | tx: ${tx.hash}`);
    return updated;
  } catch (dispatchErr) {
    console.error(" [RoyaltyService] On-chain dispatch failed:", dispatchErr.message);
    const updated = await RoyaltyPayout.findByIdAndUpdate(
      payout._id,
      { status: "failed", note: `Dispatch failed: ${dispatchErr.message}` },
      { new: true }
    );
    await notifyAdmin(updated);
    return updated;
  }
}

// ── Stripe Connect — automatic bank payouts for artists ───────────────────────
// Mirrors the proven HyperBucks cash-out flow (Controllers/HBController.js):
// connected account → attach bank account → transfers.create → payouts.create.
//
// NOTE (must verify in Stripe TEST mode before production):
//   • Funding: stripe.transfers.create draws from the platform Stripe balance, so the
//     company must keep that balance topped up.
//   • Currency/FX: amount is a USD/USDC figure; it is paid in the artist's bank currency.
//     Confirm settlement currency / conversion behaves as intended for each country.
//   • KYC: real connected accounts require the artist to complete Stripe onboarding
//     (hosted account links). The custom-account creation below works for test mode and
//     simple cases; production may need a hosted onboarding step.

let _stripe = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  return _stripe;
}

async function getOrCreateArtistConnectedAccount(artist, stripe) {
  if (artist.stripeConnectAccountId) return artist.stripeConnectAccountId;

  const nameParts = (artist.name || "").trim().split(" ");
  const account = await stripe.accounts.create({
    type: "custom",
    country: "AU", // connected account country = platform country (matches HyperBucks flow)
    email: artist.email || undefined,
    capabilities: { transfers: { requested: true } },
    business_type: "individual",
    individual: {
      email: artist.email || undefined,
      first_name: nameParts[0] || "Artist",
      last_name: nameParts.slice(1).join(" ") || "Account",
    },
    business_profile: {
      mcc: "7372",
      url: "https://hypertek100.com",
      product_description: "Artist royalty payouts for the Hyper Tek NFT gaming ecosystem.",
    },
    tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: "127.0.0.1" },
    settings: { payouts: { schedule: { interval: "manual" } } },
  });

  await Artist.findByIdAndUpdate(artist._id, { stripeConnectAccountId: account.id });
  return account.id;
}

async function attachArtistBankAccount(artist, stripe, accountId) {
  const bd = artist.bankDetails || {};
  const country = (bd.country || "AU").toUpperCase().slice(0, 2);
  const currency = (bd.currency || "USD").toLowerCase();

  const bankAccountParams = {
    country,
    currency,
    account_holder_name: bd.accountHolderName || artist.name,
    account_holder_type: "individual",
  };
  if (country === "US" && bd.routingNumber && bd.accountNumber) {
    bankAccountParams.routing_number = bd.routingNumber;
    bankAccountParams.account_number = bd.accountNumber;
  } else if (country === "AU" && bd.routingNumber && bd.accountNumber) {
    bankAccountParams.routing_number = bd.routingNumber.replace(/-/g, "");
    bankAccountParams.account_number = bd.accountNumber;
  } else if (bd.iban) {
    bankAccountParams.account_number = bd.iban;
  } else {
    bankAccountParams.account_number = bd.accountNumber;
  }

  const token = await stripe.tokens.create({ bank_account: bankAccountParams });
  const externalAccount = await stripe.accounts.createExternalAccount(accountId, {
    external_account: token.id,
    default_for_currency: true,
  });

  await Artist.findByIdAndUpdate(artist._id, { stripeExternalAccountId: externalAccount.id });
  return externalAccount.id;
}

/**
 * dispatchRoyaltyViaStripe — pay a bank-preference artist their royalty automatically
 * via Stripe Connect. Called on sale (bank path) and by the admin retry endpoint.
 * Never throws: on failure it marks the payout "failed" and notifies the admin.
 *
 * @param {object} payout — RoyaltyPayout mongoose document (must have artistId)
 */
export async function dispatchRoyaltyViaStripe(payout) {
  try {
    if (!payout.artistId) throw new Error("No artistId on payout");
    const artist = await Artist.findById(payout.artistId);
    if (!artist) throw new Error("Artist not found");

    const stripe = getStripe();
    const accountId = await getOrCreateArtistConnectedAccount(artist, stripe);

    // Ensure a bank account is attached to the connected account
    const fresh = await Artist.findById(payout.artistId);
    if (!fresh.stripeExternalAccountId) {
      await attachArtistBankAccount(fresh, stripe, accountId);
    }

    const currency = (artist.bankDetails?.currency || "USD").toLowerCase();
    const amountMinor = Math.round(payout.amount * 100);

    // 1) Platform balance → artist connected account
    const transfer = await stripe.transfers.create({
      amount: amountMinor,
      currency,
      destination: accountId,
      metadata: { payoutId: String(payout._id), artistId: String(artist._id), type: payout.payoutType },
    });

    // 2) Connected account balance → artist's bank account
    const stripePayout = await stripe.payouts.create(
      {
        amount: amountMinor,
        currency,
        statement_descriptor: "HYPERTEK",
        metadata: { payoutId: String(payout._id), transferId: transfer.id },
      },
      { stripeAccount: accountId }
    );

    const updated = await RoyaltyPayout.findByIdAndUpdate(
      payout._id,
      { status: "dispatched", txHash: stripePayout.id, note: `Auto-paid via Stripe at ${new Date().toISOString()}` },
      { new: true }
    );

    console.log(`[RoyaltyService] Stripe payout: ${payout.amount} ${currency} → artist ${artist._id} | payout ${stripePayout.id}`);
    return updated;
  } catch (err) {
    console.error("[RoyaltyService] Stripe payout failed:", err.message);
    const updated = await RoyaltyPayout.findByIdAndUpdate(
      payout._id,
      { status: "failed", note: `Stripe dispatch failed: ${err.message}` },
      { new: true }
    );
    await notifyAdmin(updated);
    return updated;
  }
}
