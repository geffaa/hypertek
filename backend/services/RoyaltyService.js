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
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getStripe,
  createConnectedAccount,
  ensureTestCapabilities,
  attachAuBankAccount,
} from "./stripeConnect.js";
import { convertUsdToAud } from "./fxService.js";
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

// Shared, AU-only Connect logic lives in ./stripeConnect.js. These wrappers add Artist
// persistence on top (mirrors the HyperBucks cashout flow).
async function getOrCreateArtistConnectedAccount(artist, stripe) {
  if (artist.stripeConnectAccountId) {
    await ensureTestCapabilities(stripe, artist.stripeConnectAccountId);
    return artist.stripeConnectAccountId;
  }
  const account = await createConnectedAccount(stripe, {
    email: artist.email,
    fullName: artist.name,
    productDescription: "Artist royalty payouts for the Hyper Tek NFT gaming ecosystem.",
  });
  await Artist.findByIdAndUpdate(artist._id, { stripeConnectAccountId: account.id });
  await ensureTestCapabilities(stripe, account.id);
  return account.id;
}

// AU-only: bankDetails.routingNumber holds the BSB, accountNumber the account number.
async function attachArtistBankAccount(artist, stripe, accountId) {
  const bd = artist.bankDetails || {};
  const extId = await attachAuBankAccount(
    stripe,
    accountId,
    { accountHolderName: bd.accountHolderName || artist.name, bsb: bd.routingNumber, accountNumber: bd.accountNumber },
    artist.stripeExternalAccountId
  );
  await Artist.findByIdAndUpdate(artist._id, { stripeExternalAccountId: extId });
  return extId;
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

    // Bank royalty payouts are AU-only (platform is an AU Stripe account; no cross-border).
    if ((artist.bankDetails?.country || "").toUpperCase() !== "AU") {
      throw new Error("Artist bank is not Australian — automatic Stripe payout is AU-only. Pay manually or via crypto.");
    }

    const stripe = getStripe();
    const accountId = await getOrCreateArtistConnectedAccount(artist, stripe);

    // Ensure a bank account is attached to the connected account
    const fresh = await Artist.findById(payout.artistId);
    if (!fresh.stripeExternalAccountId) {
      await attachArtistBankAccount(fresh, stripe, accountId);
    }

    // payout.amount is a USD figure (the royalty value); convert to AUD for the AU payout.
    const { rate: fxRate, aud } = await convertUsdToAud(payout.amount);
    const amountMinor = Math.round(aud * 100);

    // 1) Platform balance → artist connected account (AUD)
    const transfer = await stripe.transfers.create({
      amount: amountMinor,
      currency: "aud",
      destination: accountId,
      metadata: { payoutId: String(payout._id), artistId: String(artist._id), type: payout.payoutType, usd: String(payout.amount), fxRate: String(fxRate) },
    });

    // 2) Connected account balance → artist's bank account (AUD)
    const stripePayout = await stripe.payouts.create(
      {
        amount: amountMinor,
        currency: "aud",
        statement_descriptor: "HYPERTEK",
        metadata: { payoutId: String(payout._id), transferId: transfer.id },
      },
      { stripeAccount: accountId }
    );

    const updated = await RoyaltyPayout.findByIdAndUpdate(
      payout._id,
      { status: "dispatched", txHash: stripePayout.id, note: `Auto-paid A$${aud} (USD ${payout.amount} @ ${fxRate}) via Stripe at ${new Date().toISOString()}` },
      { new: true }
    );

    console.log(`[RoyaltyService] Stripe payout: A$${aud} (USD ${payout.amount}) → artist ${artist._id} | payout ${stripePayout.id}`);
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
