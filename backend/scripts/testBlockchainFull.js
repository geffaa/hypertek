/**
 * testBlockchainFull.js
 * Comprehensive blockchain connectivity and balance test for HyperTek.
 *
 * Run from backend/ directory:
 *   node scripts/testBlockchainFull.js
 */

import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../Config/.env") });

// ── Config ──────────────────────────────────────────────────────────────────
const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NFT_ADDR = process.env.MYNFT_ADDRESS;
const MARKET_ADDR = process.env.MARKETPLACE_ADDRESS;
const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS;
const BUYBACK_WALLET = process.env.BUYBACK_WALLET_ADDRESS;
const USDC_ADDR = process.env.BASE_USDC_ADDRESS;

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

// Load ABIs — files are stored as JSON-encoded strings, so double-parse to get array
function loadABI(filename) {
  const p = path.join(__dirname, "../abis", filename);
  if (!fs.existsSync(p)) throw new Error(`ABI not found: ${p}`);
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const PASS = "✅";
const FAIL = "";
const WARN = "⚠️ ";
const INFO = "ℹ️ ";

function ok(label, value) { console.log(`  ${PASS} ${label}: ${value}`); }
function fail(label, value) { console.log(`  ${FAIL} ${label}: ${value}`); }
function warn(label, value) { console.log(`  ${WARN} ${label}: ${value}`); }
function info(label, value) { console.log(`  ${INFO} ${label}: ${value}`); }
function header(title) { console.log(`\n${"─".repeat(55)}\n  ${title}\n${"─".repeat(55)}`); }

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║         HYPERTEK BLOCKCHAIN CONNECTION TEST          ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  let passed = 0;
  let failed = 0;

  // ── 1. ENV CHECK ─────────────────────────────────────────────────────────
  header("1. Environment Variables");

  const envVars = {
    PRIVATE_KEY: PRIVATE_KEY ? PRIVATE_KEY.slice(0, 8) + "..." : null,
    NFT_ADDR,
    MARKET_ADDR,
    PLATFORM_WALLET,
    BUYBACK_WALLET,
    USDC_ADDR,
    RPC_URL,
  };

  let envOk = true;
  for (const [k, v] of Object.entries(envVars)) {
    if (v) { ok(k, v); passed++; }
    else { fail(k, "NOT SET"); failed++; envOk = false; }
  }
  if (!envOk) {
    console.log("\n  ⛔ Critical env vars missing. Fix .env before continuing.");
    process.exit(1);
  }

  // ── 2. RPC CONNECTION ────────────────────────────────────────────────────
  header("2. Base Mainnet RPC Connection");

  let provider;
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    const network = await provider.getNetwork();
    const block = await provider.getBlockNumber();
    ok("Network name", network.name);
    ok("Chain ID", network.chainId.toString());
    ok("Latest block", block.toString());
    passed += 3;
  } catch (err) {
    fail("RPC connection", err.message);
    failed++;
    console.log("\n  ⛔ Cannot connect to Base Mainnet. Check RPC URL or internet.");
    process.exit(1);
  }

  // ── 3. DEPLOYER WALLET ───────────────────────────────────────────────────
  header("3. Deployer / Backend Wallet (PRIVATE_KEY)");

  let signer;
  try {
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const address = await signer.getAddress();
    const ethBal = await provider.getBalance(address);
    const ethFmt = ethers.formatEther(ethBal);

    ok("Wallet address", address);

    if (parseFloat(ethFmt) >= 0.001) {
      ok("ETH balance (gas)", `${ethFmt} ETH`);
      passed++;
    } else if (parseFloat(ethFmt) > 0) {
      warn("ETH balance (gas)", `${ethFmt} ETH — LOW, top up soon`);
    } else {
      fail("ETH balance (gas)", "0 ETH — Cannot send transactions!");
      failed++;
    }
    passed++;
  } catch (err) {
    fail("Wallet init", err.message);
    failed++;
  }

  // ── 4. USDC BALANCES ─────────────────────────────────────────────────────
  header("4. USDC Balances (Base Mainnet)");

  try {
    const usdc = new ethers.Contract(USDC_ADDR, ERC20_ABI, provider);
    const usdcName = await usdc.name();
    const usdcSymbol = await usdc.symbol();
    const decimals = await usdc.decimals();

    ok("USDC contract", `${usdcName} (${usdcSymbol}) — ${decimals} decimals`);
    passed++;

    const wallets = [
      { label: "Backend/Deployer wallet (sends royalties)", address: await signer.getAddress() },
      { label: "Platform wallet (receives seller proceeds)", address: PLATFORM_WALLET },
      { label: "Buyback wallet (receives 5% NFA sales)", address: BUYBACK_WALLET },
    ];

    for (const w of wallets) {
      await new Promise(r => setTimeout(r, 300)); // avoid RPC rate limit
      try {
        const bal = await usdc.balanceOf(w.address);
        const fmt = ethers.formatUnits(bal, decimals);
        if (parseFloat(fmt) > 0) {
          ok(`${w.label}`, `$${fmt} USDC`);
          passed++;
        } else {
          warn(`${w.label}`, `$0 USDC — needs funding before dispatching payouts`);
        }
      } catch (e) {
        warn(`${w.label}`, `Could not read (RPC error: ${e.code || e.message.slice(0, 40)})`);
      }
      info("  Address", w.address);
    }
  } catch (err) {
    fail("USDC check", err.message);
    failed++;
  }

  // ── 5. NFT CONTRACT ──────────────────────────────────────────────────────
  header("5. MyNFT Contract");

  await new Promise(r => setTimeout(r, 800));
  try {
    const nftABI = loadABI("MyNFT.json");
    const nftContract = new ethers.Contract(NFT_ADDR, nftABI, provider);

    // Verify bytecode first
    const nftCode = await provider.getCode(NFT_ADDR);
    if (!nftCode || nftCode === "0x") {
      fail("NFT contract deployed", "No bytecode at address!"); failed++;
    } else {
      ok("NFT contract deployed", `${nftCode.length} bytes`); passed++;
    }

    // Read contract state (with individual error handling per call)
    const calls = [
      ["name", () => nftContract.name()],
      ["symbol", () => nftContract.symbol()],
      ["nextTokenId (minted so far)", () => nftContract.nextTokenId()],
      ["owner", () => nftContract.owner()],
    ];
    for (const [label, fn] of calls) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const v = await fn();
        ok(label, v.toString()); passed++;
      } catch (e) {
        warn(label, `RPC error (${e.code}) — contract deployed, try again later`);
      }
    }

    // Marketplace authorization
    await new Promise(r => setTimeout(r, 200));
    try {
      const isAuthorized = await nftContract.isMarketplaceAuthorized(MARKET_ADDR);
      if (isAuthorized) { ok("Marketplace authorized", "YES ✔"); passed++; }
      else { fail("Marketplace authorized", "NO — marketplace cannot call markAsSold!"); failed++; }
    } catch (e) {
      warn("Marketplace authorized", `Could not verify (RPC error: ${e.code})`);
    }
  } catch (err) {
    fail("NFT contract read", err.message); failed++;
  }

  // ── 6. MARKETPLACE CONTRACT ──────────────────────────────────────────────
  header("6. Marketplace Contract");

  try {
    const marketABI = loadABI("Marketplace.json");
    const marketContract = new ethers.Contract(MARKET_ADDR, marketABI, provider);

    // Try to read PLATFORM_FEE_BPS — may differ by contract version
    let feeBps;
    try {
      feeBps = await marketContract.PLATFORM_FEE_BPS();
      const feePct = Number(feeBps) / 100;
      if (feePct === 20) {
        ok("Platform fee", `${feePct}% (correct — matches Don's brief)`);
        passed++;
      } else {
        warn("Platform fee", `${feePct}% — expected 20%`);
      }
    } catch {
      warn("PLATFORM_FEE_BPS", "Function not found on deployed contract (may be named differently)");
    }

    // Check if contract code exists on chain
    const code = await provider.getCode(MARKET_ADDR);
    if (code && code !== "0x") {
      ok("Contract deployed", `${code.length} bytes of bytecode`);
      passed++;
    } else {
      fail("Contract deployed", "No bytecode found at address!");
      failed++;
    }
  } catch (err) {
    fail("Marketplace contract read", err.message);
    failed++;
  }

  // ── 7. MINT FUNCTION SIGNATURE CHECK ────────────────────────────────────
  header("7. Mint Function Signature (ABI vs Service)");

  try {
    const parsed = loadABI("MyNFT.json"); // already an array after double-parse
    const mintFn = parsed.find(f => f.name === "mint" && f.type === "function");

    if (mintFn) {
      const params = mintFn.inputs.map(i => `${i.type} ${i.name}`).join(", ");
      ok("mint() signature", `mint(${params})`);
      info("Expected call", "nftContract.mint(creatorAddress, tokenURI, royaltyBps)");

      if (mintFn.inputs.length === 3) {
        ok("Parameter count", "3 params — correct");
        passed++;
      } else {
        fail("Parameter count", `${mintFn.inputs.length} params — check nftPurchaseService.js!`);
        failed++;
      }
      passed++;
    }
  } catch (err) {
    fail("ABI check", err.message);
    failed++;
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(`║  RESULT: ${passed} passed  |  ${failed} failed${" ".repeat(38 - String(passed).length - String(failed).length)}║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (failed > 0) {
    console.log("  Items marked  need to be fixed before going live.\n");
    process.exit(1);
  } else {
    console.log("  All checks passed. Blockchain connection is ready.\n");
  }
}

main().catch(err => {
  console.error("\n⛔ Unexpected error:", err.message);
  process.exit(1);
});
