// Tests for depositToEscrow — the path that moves each sale's trade-in share
// into the on-chain escrow. What matters: the deposit is credited to the exact
// token sold, approval happens only when needed, and every failure leaves a
// visible "failed" record instead of silently losing the share.

import { jest } from "@jest/globals";

const records = new Map();
let nextId = 1;
const RoyaltyPayout = {
  create: jest.fn(async (data) => {
    const doc = { _id: `p${nextId++}`, ...data };
    records.set(doc._id, doc);
    return doc;
  }),
  findByIdAndUpdate: jest.fn(async (id, update) => {
    const doc = { ...records.get(id), ...update };
    records.set(id, doc);
    return doc;
  }),
};

jest.unstable_mockModule("../services/RoyaltyService.js", () => ({ RoyaltyPayout }));

const NFT = "0x00000000000000000000000000000000000000aa";
const chain = { balance: 0n, allowance: 0n, approveCalls: 0, deposits: [], depositError: null };

jest.unstable_mockModule("../Service/blockchain.js", () => ({
  getBlockchain: () => ({ nftContract: { target: NFT }, wallet: { address: "0xserver" } }),
  withServerWallet: (fn) => fn(),
}));

jest.unstable_mockModule("ethers", () => {
  class Contract {
    constructor(address, abi) {
      this.isEscrow = abi.some((f) => f.includes("deposit"));
    }
    async balanceOf() { return chain.balance; }
    async allowance() { return chain.allowance; }
    async approve() {
      chain.approveCalls++;
      chain.allowance = 2n ** 255n;
      return { wait: async () => {} };
    }
    async deposit(nft, tokenId, amount) {
      if (chain.depositError) throw new Error(chain.depositError);
      chain.deposits.push({ nft, tokenId, amount });
      return { hash: "0xdeposit", wait: async () => {} };
    }
  }
  const ethers = {
    Contract,
    MaxUint256: 2n ** 256n - 1n,
    parseUnits: (v) => BigInt(Math.round(Number(v) * 1e6)),
    formatUnits: (v) => (Number(v) / 1e6).toString(),
  };
  return { ethers, default: { ethers } };
});

process.env.BUYBACK_ESCROW_ADDRESS = "0x00000000000000000000000000000000000000e5";
process.env.BASE_USDC_ADDRESS = "0x00000000000000000000000000000000000000c0";

const { depositToEscrow } = await import("../services/tradeInEscrow.js");

beforeEach(() => {
  records.clear();
  Object.assign(chain, { balance: 1_000_000_000n, allowance: 0n, approveCalls: 0, deposits: [], depositError: null });
});

test("credits the share to the exact token sold and marks it dispatched", async () => {
  const out = await depositToEscrow({ subCollectionId: "s1", parentId: "p1", tokenId: 7, amount: 12.5 });
  expect(chain.deposits).toEqual([{ nft: NFT, tokenId: 7n, amount: 12_500_000n }]);
  expect(out.status).toBe("dispatched");
  expect(out.payoutType).toBe("trade_in_escrow");
  expect(out.txHash).toBe("0xdeposit");
});

test("approves once, then reuses the allowance", async () => {
  await depositToEscrow({ tokenId: 1, amount: 1 });
  await depositToEscrow({ tokenId: 2, amount: 1 });
  expect(chain.approveCalls).toBe(1);
  expect(chain.deposits).toHaveLength(2);
});

test("records a failure instead of throwing when the chain rejects the deposit", async () => {
  chain.depositError = "execution reverted";
  const out = await depositToEscrow({ tokenId: 3, amount: 5 });
  expect(out.status).toBe("failed");
  expect(out.note).toMatch(/execution reverted/);
});

test("fails visibly when the server wallet cannot cover the share", async () => {
  chain.balance = 1n;
  const out = await depositToEscrow({ tokenId: 3, amount: 5 });
  expect(out.status).toBe("failed");
  expect(chain.deposits).toHaveLength(0);
});

test("refuses an item with no on-chain token rather than depositing to token 0", async () => {
  const out = await depositToEscrow({ tokenId: undefined, amount: 5 });
  expect(out.status).toBe("failed");
  expect(out.note).toMatch(/no on-chain token/);
  expect(chain.deposits).toHaveLength(0);
});

test("does nothing for a zero share", async () => {
  expect(await depositToEscrow({ tokenId: 1, amount: 0 })).toBeNull();
  expect(RoyaltyPayout.create).not.toHaveBeenCalledWith(expect.objectContaining({ amount: 0 }));
});
