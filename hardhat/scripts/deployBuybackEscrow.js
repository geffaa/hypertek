// Deploys BuybackEscrow.
//
// All three addresses are immutable once set, so there is no fixing a mistake here
// afterwards. Read the checks below before running against a live network.
//
//   BASE_USDC_ADDRESS            USDC on the target chain
//   BUYBACK_ITEM_VAULT           where an item goes when its owner takes the buy-back
//   BUYBACK_WIND_DOWN_TRIGGER    the only address ever able to call triggerWindDown
//   BUYBACK_PARTIAL_THRESHOLD    minimum item balance (USDC units, e.g. 25000000000
//                                 for $25,000 at 6 decimals) before withdrawPartial unlocks
//
// Usage: npx hardhat run scripts/deployBuybackEscrow.js --network base

import pkg from "hardhat";
const { ethers, network } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Canonical USDC, so a typo in the env cannot quietly point the escrow at the
// wrong token and strand every deposit.
const KNOWN_USDC = {
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base mainnet
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
};

// Testnet only: the existing Base Sepolia Marketplace settles in this MockUSDC,
// so the escrow has to take the same token for sales to fund it end to end.
const TESTNET_EXTRA_TOKENS = {
  84532: ["0x59b47ddcbfd04bd5796332B38E1A62445Eb3985B"],
};

async function main() {
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const [deployer] = await ethers.getSigners();

  const usdc = process.env.BASE_USDC_ADDRESS || KNOWN_USDC[chainId];
  const vault = process.env.BUYBACK_ITEM_VAULT;
  const windDownTrigger = process.env.BUYBACK_WIND_DOWN_TRIGGER;
  const partialThreshold = process.env.BUYBACK_PARTIAL_THRESHOLD;

  console.log(`network        ${network.name} (chain ${chainId})`);
  console.log(`deployer       ${deployer.address}`);
  console.log(`balance        ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`payment        ${usdc}`);
  console.log(`item vault     ${vault}`);
  console.log(`wind-down key  ${windDownTrigger}`);
  console.log(`partial min    ${partialThreshold}\n`);

  if (!usdc) throw new Error("No USDC address for this chain. Set BASE_USDC_ADDRESS.");
  if (!vault) throw new Error("Set BUYBACK_ITEM_VAULT to the wallet that receives surrendered items.");
  if (!windDownTrigger) throw new Error("Set BUYBACK_WIND_DOWN_TRIGGER — this address is fixed forever once deployed.");
  if (!partialThreshold) throw new Error("Set BUYBACK_PARTIAL_THRESHOLD (in the payment token's smallest unit).");
  if (!ethers.isAddress(usdc) || !ethers.isAddress(vault) || !ethers.isAddress(windDownTrigger)) {
    throw new Error("Malformed address.");
  }

  const allowed = [KNOWN_USDC[chainId], ...(TESTNET_EXTRA_TOKENS[chainId] || [])].filter(Boolean);
  if (allowed.length && !allowed.some((a) => a.toLowerCase() === usdc.toLowerCase())) {
    throw new Error(`USDC mismatch. Expected ${KNOWN_USDC[chainId]} on chain ${chainId}.`);
  }
  if (vault.toLowerCase() === deployer.address.toLowerCase()) {
    throw new Error("Item vault must not be the deployer. Use the dedicated vault wallet.");
  }
  if (windDownTrigger.toLowerCase() === deployer.address.toLowerCase()) {
    throw new Error(
      "Wind-down trigger must not be the deployer's own key. Use the team's multisig — " +
      "this address is permanent and this is the one function in the contract with any privilege at all."
    );
  }
  if ((await ethers.provider.getCode(usdc)) === "0x") {
    throw new Error("No contract at the USDC address on this network.");
  }

  // "0" is a non-empty string, so the presence check above lets it through. A
  // zero threshold makes withdrawPartial available on an item holding nothing,
  // which burns that item's one-time option for a payout of zero. The contract
  // rejects this too; catching it here just fails before spending gas.
  if (BigInt(partialThreshold) === 0n) {
    throw new Error("BUYBACK_PARTIAL_THRESHOLD must be greater than 0.");
  }

  // A vault that cannot receive an ERC-721 makes every claimBuyback revert
  // forever, and nothing about the vault can be changed after deployment. An
  // EOA is always fine; a contract has to answer onERC721Received.
  const vaultCode = await ethers.provider.getCode(vault);
  if (vaultCode !== "0x") {
    const receiver = new ethers.Interface([
      "function onERC721Received(address,address,uint256,bytes) returns (bytes4)",
    ]);
    try {
      await ethers.provider.call({
        to: vault,
        data: receiver.encodeFunctionData("onERC721Received", [
          deployer.address,
          deployer.address,
          1,
          "0x",
        ]),
      });
    } catch {
      throw new Error(
        "Item vault is a contract that does not accept ERC-721 transfers. Every buy-back " +
        "claim would revert forever, and the vault address cannot be changed after deploy."
      );
    }
  }

  // A single-signer wind-down key is the accepted decision (11 Sep 2026): the
  // multisig option was dropped because the Safe app would not connect to the
  // owner's MetaMask. Its worst case is everyone being paid the maximum sooner.
  if ((await ethers.provider.getCode(windDownTrigger)) === "0x") {
    console.log("note           wind-down trigger is a single-signer wallet (accepted decision)\n");
  }

  const Escrow = await ethers.getContractFactory("BuybackEscrow");
  const escrow = await Escrow.deploy(usdc, vault, windDownTrigger, partialThreshold);
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  // Confirm what actually landed on chain, not what we intended to send.
  const [onChainToken, onChainVault, onChainTrigger, onChainThreshold] = await Promise.all([
    escrow.paymentToken(),
    escrow.itemVault(),
    escrow.windDownTrigger(),
    escrow.partialWithdrawalThreshold(),
  ]);
  if (onChainToken.toLowerCase() !== usdc.toLowerCase()) throw new Error("Deployed token mismatch.");
  if (onChainVault.toLowerCase() !== vault.toLowerCase()) throw new Error("Deployed vault mismatch.");
  if (onChainTrigger.toLowerCase() !== windDownTrigger.toLowerCase()) throw new Error("Deployed wind-down trigger mismatch.");
  if (onChainThreshold.toString() !== partialThreshold.toString()) throw new Error("Deployed partial threshold mismatch.");

  console.log(`BuybackEscrow deployed at ${address}`);
  console.log("verified on chain: payment token, item vault, wind-down trigger and partial threshold all match\n");

  const out = {
    network: network.name,
    chainId,
    buybackEscrow: address,
    paymentToken: onChainToken,
    itemVault: onChainVault,
    windDownTrigger: onChainTrigger,
    partialWithdrawalThreshold: onChainThreshold.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    note: "No admin, no withdrawal function for the company. The only privileged call, " +
      "triggerWindDown, can accelerate payouts but never redirect or reduce them.",
  };
  const file = path.join(__dirname, "..", `buyback-escrow.${network.name}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`details written to ${file}`);

  console.log(
    `\nverify with:\n  npx hardhat verify --network ${network.name} ${address} ${usdc} ${vault} ${windDownTrigger} ${partialThreshold}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
