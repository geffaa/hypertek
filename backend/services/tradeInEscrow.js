import { ethers } from "ethers";
import { getBlockchain } from "../Service/blockchain.js";
import { RoyaltyPayout } from "./RoyaltyService.js";

const ESCROW_ABI = [
  "function deposit(address nft, uint256 tokenId, uint256 amount)",
  "function reservedFor(address nft, uint256 tokenId) view returns (uint256)",
];
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

export function escrowAddress() {
  return process.env.BUYBACK_ESCROW_ADDRESS || null;
}

/**
 * Sends an item's trade-in share into the on-chain escrow, credited to that
 * exact token. Records a RoyaltyPayout (payoutType "trade_in_escrow") first so
 * a failed deposit stays visible and can be retried from the admin panel.
 */
export async function depositToEscrow({ subCollectionId, parentId, saleRecordId, tokenId, amount, note }) {
  if (!amount || amount <= 0) return null;

  const { nftContract } = getBlockchain();
  const payout = await RoyaltyPayout.create({
    subCollectionId,
    parentId,
    saleRecordId,
    creatorWallet: escrowAddress() || "escrow-not-configured",
    nftAddress: nftContract?.target,
    tokenId: tokenId != null ? String(tokenId) : undefined,
    amount: parseFloat(Number(amount).toFixed(6)),
    currency: "USDC",
    paymentType: "crypto",
    payoutType: "trade_in_escrow",
    status: "pending",
    note,
  });

  return sendDeposit(payout);
}

/** Performs (or retries) the on-chain deposit for an existing trade_in_escrow record. */
export async function sendDeposit(payout) {
  try {
    const escrowAddr = escrowAddress();
    const usdcAddr = process.env.BASE_USDC_ADDRESS;
    if (!escrowAddr || !usdcAddr) throw new Error("BUYBACK_ESCROW_ADDRESS or BASE_USDC_ADDRESS not set");
    if (payout.tokenId == null || !payout.nftAddress) {
      throw new Error("Item has no on-chain token yet; the escrow can only credit a minted token");
    }

    const { wallet } = getBlockchain();
    const usdc = new ethers.Contract(usdcAddr, ERC20_ABI, wallet);
    const escrow = new ethers.Contract(escrowAddr, ESCROW_ABI, wallet);
    const units = ethers.parseUnits(Number(payout.amount).toFixed(6), 6);

    const balance = await usdc.balanceOf(wallet.address);
    if (balance < units) {
      throw new Error(`Server wallet USDC insufficient. Has ${ethers.formatUnits(balance, 6)}, needs ${payout.amount}`);
    }

    // One unlimited approval: the escrow can only pull from us when we call
    // deposit(), and it has no path to send funds anywhere but item owners.
    if ((await usdc.allowance(wallet.address, escrowAddr)) < units) {
      await (await usdc.approve(escrowAddr, ethers.MaxUint256)).wait();
      // Load-balanced public RPCs can serve the next call from a node that has
      // not seen the approval yet, which makes deposit's gas estimate revert.
      for (let i = 0; i < 10 && (await usdc.allowance(wallet.address, escrowAddr)) < units; i++) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    const tx = await escrow.deposit(payout.nftAddress, BigInt(payout.tokenId), units);
    await tx.wait();

    console.log(`[TradeInEscrow] ${payout.amount} USDC → escrow for token #${payout.tokenId} | tx ${tx.hash}`);
    return RoyaltyPayout.findByIdAndUpdate(
      payout._id,
      { status: "dispatched", txHash: tx.hash, note: `Deposited to trade-in escrow at ${new Date().toISOString()}` },
      { new: true },
    );
  } catch (err) {
    console.error("[TradeInEscrow] deposit failed:", err.message);
    return RoyaltyPayout.findByIdAndUpdate(
      payout._id,
      { status: "failed", note: `Escrow deposit failed: ${err.message}` },
      { new: true },
    );
  }
}
