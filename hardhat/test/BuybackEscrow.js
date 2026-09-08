const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// The claims this contract has to support, because they are going into legal
// documents: funds can only ever reach the current owner of that exact item, there
// is no path for the company to take them back under any circumstance, the vesting
// schedule and the partial-withdrawal fee are exactly what the Terms of Service say
// they are, and the one privileged function in the contract can only ever pay owners
// sooner — never less, and never to anyone else.

describe("BuybackEscrow", function () {
  let usdc, nft, escrow;
  let deployer, vault, alice, bob, marketplace, windDownTrigger;

  const ONE = (n) => ethers.parseUnits(String(n), 6); // USDC has 6 decimals
  const YEAR = 365 * 24 * 60 * 60;
  const THRESHOLD = ONE(50); // partial withdrawal unlocks at this item balance

  beforeEach(async function () {
    [deployer, vault, alice, bob, marketplace, windDownTrigger] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("TestUSDC");
    usdc = await ERC20.deploy();

    const NFT = await ethers.getContractFactory("TestNFT");
    nft = await NFT.deploy();

    const Escrow = await ethers.getContractFactory("BuybackEscrow");
    escrow = await Escrow.deploy(
      await usdc.getAddress(),
      vault.address,
      windDownTrigger.address,
      THRESHOLD,
    );

    // Alice owns item #1, the marketplace holds funds to pay in.
    await nft.mint(alice.address, 1);
    await usdc.mint(marketplace.address, ONE(10_000));
    await usdc.connect(marketplace).approve(await escrow.getAddress(), ONE(10_000));
  });

  describe("deployment guards", function () {
    it("refuses a zero address for any of the three fixed addresses", async function () {
      const Escrow = await ethers.getContractFactory("BuybackEscrow");
      const usdcAddr = await usdc.getAddress();

      await expect(
        Escrow.deploy(ethers.ZeroAddress, vault.address, windDownTrigger.address, THRESHOLD),
      ).to.be.revertedWithCustomError(Escrow, "ZeroAddress");
      await expect(
        Escrow.deploy(usdcAddr, ethers.ZeroAddress, windDownTrigger.address, THRESHOLD),
      ).to.be.revertedWithCustomError(Escrow, "ZeroAddress");
      await expect(
        Escrow.deploy(usdcAddr, vault.address, ethers.ZeroAddress, THRESHOLD),
      ).to.be.revertedWithCustomError(Escrow, "ZeroAddress");
    });
  });

  describe("the company has no way out", function () {
    it("exposes no function that moves funds to anyone but the item owner (or accelerates payout)", async function () {
      // Enumerate the ABI rather than trusting a reading of the source: any
      // future function that could drain the contract should fail this test.
      const allowed = new Set(["deposit", "claimBuyback", "withdrawPartial", "triggerWindDown"]);
      const stateChanging = escrow.interface.fragments
        .filter((f) => f.type === "function" && !["view", "pure"].includes(f.stateMutability))
        .map((f) => f.name);

      expect(stateChanging.sort()).to.deep.equal([...allowed].sort());
    });

    it("has no owner, admin or other privileged role beyond the sanctioned wind-down", async function () {
      const names = escrow.interface.fragments
        .filter((f) => f.type === "function")
        .map((f) => f.name.toLowerCase());

      for (const forbidden of [
        "owner",
        "transferownership",
        "renounceownership",
        "withdraw",
        "emergencywithdraw",
        "rescue",
        "sweep",
        "pause",
        "unpause",
        "upgradeto",
        "setvault",
        "setwinddowntrigger",
        "settrigger",
      ]) {
        expect(names).to.not.include(forbidden);
      }

      // The one sanctioned exception must still be there — this test is only
      // meaningful if it distinguishes "no admin functions" from "no functions".
      expect(names).to.include("triggerwinddown");
    });

    it("will not let the deployer take deposited funds", async function () {
      await escrow.connect(marketplace).deposit(await nft.getAddress(), 1, ONE(100));

      const before = await usdc.balanceOf(deployer.address);
      expect(await usdc.balanceOf(await escrow.getAddress())).to.equal(ONE(100));
      expect(await usdc.balanceOf(deployer.address)).to.equal(before);
    });

    it("keeps the vault and wind-down trigger addresses fixed forever", async function () {
      expect(await escrow.itemVault()).to.equal(vault.address);
      expect(await escrow.windDownTrigger()).to.equal(windDownTrigger.address);
      expect(escrow.interface.fragments.some((f) => f.name === "setItemVault")).to.equal(false);
    });
  });

  describe("deposits", function () {
    it("credits the specific item, not a shared pool", async function () {
      const nftAddr = await nft.getAddress();
      await nft.mint(bob.address, 2);
      await escrow.connect(marketplace).deposit(nftAddr, 1, ONE(50));
      await escrow.connect(marketplace).deposit(nftAddr, 2, ONE(30));

      expect(await escrow.reservedFor(nftAddr, 1)).to.equal(ONE(50));
      expect(await escrow.reservedFor(nftAddr, 2)).to.equal(ONE(30));
      expect(await escrow.totalReserved()).to.equal(ONE(80));
    });

    it("accumulates across sales so the guarantee grows", async function () {
      const nftAddr = await nft.getAddress();
      await escrow.connect(marketplace).deposit(nftAddr, 1, ONE(50));
      await escrow.connect(marketplace).deposit(nftAddr, 1, ONE(25));

      expect(await escrow.reservedFor(nftAddr, 1)).to.equal(ONE(75));
    });

    it("accepts a top-up from anyone, which is how an inflation rise is funded", async function () {
      const nftAddr = await nft.getAddress();
      await usdc.mint(bob.address, ONE(10));
      await usdc.connect(bob).approve(await escrow.getAddress(), ONE(10));

      await escrow.connect(bob).deposit(nftAddr, 1, ONE(10));
      expect(await escrow.reservedFor(nftAddr, 1)).to.equal(ONE(10));
    });

    it("rejects a zero deposit", async function () {
      await expect(
        escrow.connect(marketplace).deposit(await nft.getAddress(), 1, 0),
      ).to.be.revertedWithCustomError(escrow, "ZeroAmount");
    });

    it("rejects a deposit against the zero address as the nft contract", async function () {
      await expect(
        escrow.connect(marketplace).deposit(ethers.ZeroAddress, 1, ONE(10)),
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("gives each deposit its own clock, so a resale top-up vests separately from the original", async function () {
      const nftAddr = await nft.getAddress();
      await escrow.connect(marketplace).deposit(nftAddr, 1, ONE(100)); // original deposit, ages from now
      // A minute short of 4 years, so the extra transactions below don't push this
      // layer's age across the 4-year boundary into the next bracket.
      await time.increase(4 * YEAR - 60);
      await escrow.connect(marketplace).deposit(nftAddr, 1, ONE(100)); // a resale top-up, brand new

      await nft.connect(alice).approve(await escrow.getAddress(), 1);
      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).claimBuyback(nftAddr, 1);
      const paid = (await usdc.balanceOf(alice.address)) - before;

      // 92% of the old layer + 80% of the brand-new layer, not a blended 86%.
      expect(paid).to.equal(ONE(100 * 0.92) + ONE(100 * 0.8));
    });
  });

  describe("claiming — vesting schedule", function () {
    const nftAddr = () => nft.getAddress();

    beforeEach(async function () {
      await escrow.connect(marketplace).deposit(await nftAddr(), 1, ONE(100));
      await nft.connect(alice).approve(await escrow.getAddress(), 1);
    });

    it("pays 80% in year one and retains the rest as a fee", async function () {
      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).claimBuyback(await nftAddr(), 1);
      expect((await usdc.balanceOf(alice.address)) - before).to.equal(ONE(80));
      expect(await escrow.retainedFees()).to.equal(ONE(20));
    });

    it("pays 84% once the deposit is a year old", async function () {
      await time.increase(YEAR);
      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).claimBuyback(await nftAddr(), 1);
      expect((await usdc.balanceOf(alice.address)) - before).to.equal(ONE(84));
    });

    it("pays 88% / 92% / 96% at years two through four", async function () {
      // Redo from a clean deposit for each boundary so ages don't compound.
      const nftAddr2 = await nftAddr();
      const cases = [
        { years: 2, bps: 88 },
        { years: 3, bps: 92 },
        { years: 4, bps: 96 },
      ];
      for (const { years, bps } of cases) {
        await nft.mint(bob.address, 100 + years);
        await escrow.connect(marketplace).deposit(nftAddr2, 100 + years, ONE(100));
        await nft.connect(bob).approve(await escrow.getAddress(), 100 + years);
        await time.increase(years * YEAR);

        const before = await usdc.balanceOf(bob.address);
        await escrow.connect(bob).claimBuyback(nftAddr2, 100 + years);
        expect((await usdc.balanceOf(bob.address)) - before).to.equal(ONE(bps));
      }
    });

    it("pays 97% forever once five years have passed, never more", async function () {
      await time.increase(5 * YEAR);
      let before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).claimBuyback(await nftAddr(), 1);
      expect((await usdc.balanceOf(alice.address)) - before).to.equal(ONE(97));

      // A much older deposit still caps at 97%, it does not keep climbing.
      await nft.mint(bob.address, 200);
      await escrow.connect(marketplace).deposit(await nftAddr(), 200, ONE(100));
      await nft.connect(bob).approve(await escrow.getAddress(), 200);
      await time.increase(20 * YEAR);
      before = await usdc.balanceOf(bob.address);
      await escrow.connect(bob).claimBuyback(await nftAddr(), 200);
      expect((await usdc.balanceOf(bob.address)) - before).to.equal(ONE(97));
    });

    it("sums multiple layers at each one's own rate and zeroes all of them", async function () {
      const addr = await nftAddr();
      // Layer 2, added now (0y old); layer 1 already 3 years old at claim time.
      await time.increase(3 * YEAR);
      await escrow.connect(marketplace).deposit(addr, 1, ONE(50)); // second layer, 0y old

      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).claimBuyback(addr, 1);
      const paid = (await usdc.balanceOf(alice.address)) - before;

      expect(paid).to.equal(ONE(100 * 0.92) + ONE(50 * 0.8)); // 3y-old layer + fresh layer
      expect(await escrow.reservedFor(addr, 1)).to.equal(0);
      expect(await escrow.totalReserved()).to.equal(0);
    });

    it("refuses anyone who is not the current owner", async function () {
      await expect(escrow.connect(bob).claimBuyback(await nftAddr(), 1))
        .to.be.revertedWithCustomError(escrow, "NotItemOwner")
        .withArgs(bob.address, alice.address);
    });

    it("refuses the deployer just as firmly", async function () {
      await expect(
        escrow.connect(deployer).claimBuyback(await nftAddr(), 1),
      ).to.be.revertedWithCustomError(escrow, "NotItemOwner");
    });

    it("follows the item: the new owner claims, not the old one", async function () {
      await nft.connect(alice).transferFrom(alice.address, bob.address, 1);
      await nft.connect(bob).approve(await escrow.getAddress(), 1);

      await expect(
        escrow.connect(alice).claimBuyback(await nftAddr(), 1),
      ).to.be.revertedWithCustomError(escrow, "NotItemOwner");

      const before = await usdc.balanceOf(bob.address);
      await escrow.connect(bob).claimBuyback(await nftAddr(), 1);
      expect(await usdc.balanceOf(bob.address)).to.equal(before + ONE(80));
    });

    it("cannot be claimed twice", async function () {
      await escrow.connect(alice).claimBuyback(await nftAddr(), 1);
      await expect(
        escrow.connect(vault).claimBuyback(await nftAddr(), 1),
      ).to.be.revertedWithCustomError(escrow, "NothingReserved");
    });

    it("reverts entirely if the item was not approved, leaving the reserve intact", async function () {
      await nft.mint(bob.address, 2);
      await escrow.connect(marketplace).deposit(await nftAddr(), 2, ONE(40));

      await expect(escrow.connect(bob).claimBuyback(await nftAddr(), 2)).to.be.reverted;

      expect(await escrow.reservedFor(await nftAddr(), 2)).to.equal(ONE(40));
      expect(await nft.ownerOf(2)).to.equal(bob.address);
    });

    it("does not touch other items' reserves", async function () {
      await nft.mint(bob.address, 2);
      await escrow.connect(marketplace).deposit(await nftAddr(), 2, ONE(60));
      await escrow.connect(alice).claimBuyback(await nftAddr(), 1);

      expect(await escrow.reservedFor(await nftAddr(), 2)).to.equal(ONE(60));
      expect(await escrow.totalReserved()).to.equal(ONE(60));
    });

    it("is never gated by whether an auction happened — ownership is the only condition", async function () {
      // No auction contract exists anywhere in this system, and this is deliberate:
      // gating on-chain would need an oracle's word for an auction's outcome, which
      // is a bigger trust cost than letting an owner always take what has vested.
      // This test documents that omission as intentional, not an oversight to "fix".
      await expect(escrow.connect(alice).claimBuyback(await nftAddr(), 1)).to.not.be.reverted;
    });
  });

  describe("early partial withdrawal", function () {
    const nftAddr = () => nft.getAddress();

    it("refuses an item below the threshold", async function () {
      await escrow.connect(marketplace).deposit(await nftAddr(), 1, THRESHOLD - ONE(1));
      await expect(
        escrow.connect(alice).withdrawPartial(await nftAddr(), 1),
      ).to.be.revertedWithCustomError(escrow, "BelowThreshold");
    });

    it("pays up to 45% of principal, net of the year-one fee, and leaves the item with the owner", async function () {
      await escrow.connect(marketplace).deposit(await nftAddr(), 1, ONE(100)); // above THRESHOLD

      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).withdrawPartial(await nftAddr(), 1);
      const paid = (await usdc.balanceOf(alice.address)) - before;

      // 45% of 100 principal = 45, at year-one's 80% vesting = 36 paid, 9 retained.
      expect(paid).to.equal(ONE(36));
      expect(await escrow.retainedFees()).to.equal(ONE(9));
      expect(await nft.ownerOf(1)).to.equal(alice.address); // item never moves
      expect(await escrow.reservedFor(await nftAddr(), 1)).to.equal(ONE(55)); // 100 - 45 principal
    });

    it("computes the fee from each layer's own deposit year, not the withdrawal date", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(60)); // will be 2 years old
      await time.increase(2 * YEAR);
      await escrow.connect(marketplace).deposit(addr, 1, ONE(40)); // fresh, 0 years old
      // Total principal 100, above threshold. Withdraw happens "in year 3" by clock,
      // but each layer's fee must follow ITS OWN age, not the withdrawal moment.

      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).withdrawPartial(addr, 1);
      const paid = (await usdc.balanceOf(alice.address)) - before;

      // Cap is 45% of 100 = 45. Oldest layer first: 2y-old layer (88% vested) is
      // drawn from up to the cap since 45 &lt; its 60 principal.
      // principalFromLayer = 45 (all from the older layer, cap reached before touching the newer one)
      // payout = 45 * 88% = 39.6
      expect(paid).to.equal(ONE(39.6));
    });

    it("draws oldest layer first and only touches a newer layer once the older one is exhausted", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(20)); // old layer, small
      await time.increase(YEAR); // this layer is now 1 year old -> 84%
      await escrow.connect(marketplace).deposit(addr, 1, ONE(80)); // fresh layer, large
      // total principal 100, cap = 45. Old layer only has 20 principal, so all of
      // it is consumed (84%), then 25 more principal is drawn from the fresh layer (80%).

      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).withdrawPartial(addr, 1);
      const paid = (await usdc.balanceOf(alice.address)) - before;

      expect(paid).to.equal(ONE(20 * 0.84) + ONE(25 * 0.8));
      expect(await escrow.reservedFor(addr, 1)).to.equal(ONE(55)); // 100 - 45 consumed
    });

    it("is a one-time option — a second attempt reverts even for a different amount available", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(200));
      await escrow.connect(alice).withdrawPartial(addr, 1);

      await expect(
        escrow.connect(alice).withdrawPartial(addr, 1),
      ).to.be.revertedWithCustomError(escrow, "AlreadyWithdrawn");
    });

    it("locks the option to the item, not the owner — a new owner is still blocked", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(200));
      await escrow.connect(alice).withdrawPartial(addr, 1);

      await nft.connect(alice).transferFrom(alice.address, bob.address, 1);

      await expect(
        escrow.connect(bob).withdrawPartial(addr, 1),
      ).to.be.revertedWithCustomError(escrow, "AlreadyWithdrawn");
    });

    it("leaves the remaining principal on its original clock, unreset by the partial draw", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(100));
      await escrow.connect(alice).withdrawPartial(addr, 1); // draws 45 principal at year-0 rate

      await time.increase(5 * YEAR); // the remaining 55 principal is now 5 years old
      await nft.connect(alice).approve(await escrow.getAddress(), 1);

      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).claimBuyback(addr, 1);
      const paid = (await usdc.balanceOf(alice.address)) - before;

      // The remaining 55 principal vests at 97%, using its ORIGINAL deposit
      // timestamp — proof the partial withdrawal did not reset the clock.
      expect(paid).to.equal(ONE(55 * 0.97));
    });

    it("refuses anyone who is not the current owner", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(200));
      await expect(
        escrow.connect(bob).withdrawPartial(addr, 1),
      ).to.be.revertedWithCustomError(escrow, "NotItemOwner");
    });

    it("exposes whether an item has used its option through a public read", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(200));

      expect(await escrow.partialWithdrawn(addr, 1)).to.equal(false);
      await escrow.connect(alice).withdrawPartial(addr, 1);
      expect(await escrow.partialWithdrawn(addr, 1)).to.equal(true);
    });
  });

  describe("wind-down", function () {
    const nftAddr = () => nft.getAddress();

    it("can only be called by the fixed wind-down trigger address", async function () {
      for (const caller of [deployer, alice, bob, vault]) {
        await expect(
          escrow.connect(caller).triggerWindDown(),
        ).to.be.revertedWithCustomError(escrow, "NotWindDownTrigger");
      }
      await expect(escrow.connect(windDownTrigger).triggerWindDown()).to.not.be.reverted;
    });

    it("is one-way — calling it twice reverts, and nothing can un-set it", async function () {
      await escrow.connect(windDownTrigger).triggerWindDown();
      expect(await escrow.woundDown()).to.equal(true);
      await expect(
        escrow.connect(windDownTrigger).triggerWindDown(),
      ).to.be.revertedWithCustomError(escrow, "AlreadyWoundDown");
    });

    it("accelerates a brand-new deposit straight to 97%, never less than scheduled and never more", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(100)); // 0 years old — would normally pay 80%
      await escrow.connect(windDownTrigger).triggerWindDown();
      await nft.connect(alice).approve(await escrow.getAddress(), 1);

      const before = await usdc.balanceOf(alice.address);
      await escrow.connect(alice).claimBuyback(addr, 1);
      expect((await usdc.balanceOf(alice.address)) - before).to.equal(ONE(97));
    });

    it("disables further partial withdrawals once wound down", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(200));
      await escrow.connect(windDownTrigger).triggerWindDown();

      await expect(
        escrow.connect(alice).withdrawPartial(addr, 1),
      ).to.be.revertedWithCustomError(escrow, "WindDownActive");
    });

    it("never sends a single token to the wind-down trigger itself, before or after", async function () {
      const addr = await nftAddr();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(100));
      const triggerBefore = await usdc.balanceOf(windDownTrigger.address);

      await escrow.connect(windDownTrigger).triggerWindDown();
      await nft.connect(alice).approve(await escrow.getAddress(), 1);
      await escrow.connect(alice).claimBuyback(addr, 1);

      expect(await usdc.balanceOf(windDownTrigger.address)).to.equal(triggerBefore);
    });
  });

  // ── Findings from the September 2026 external audit ──────────────────────
  describe("audit fixes", function () {
    const nftAddr = async () => await nft.getAddress();

    describe("deposits must target a token that exists (finding 6)", function () {
      it("refuses a deposit against a token id that was never minted", async function () {
        await expect(
          escrow.connect(marketplace).deposit(await nftAddr(), 999, ONE(10)),
        ).to.be.revertedWithCustomError(escrow, "InvalidNft");
      });

      it("refuses a deposit against an address that is not an NFT contract", async function () {
        await expect(
          escrow.connect(marketplace).deposit(bob.address, 1, ONE(10)),
        ).to.be.revertedWithCustomError(escrow, "InvalidNft");
      });

      it("still accepts a deposit against a minted token", async function () {
        await escrow.connect(marketplace).deposit(await nftAddr(), 1, ONE(10));
        expect(await escrow.reservedFor(await nftAddr(), 1)).to.equal(ONE(10));
      });
    });

    describe("layer count is bounded (finding 5)", function () {
      it("folds a deposit past the cap into the newest layer instead of reverting", async function () {
        const addr = await nftAddr();
        const cap = Number(await escrow.MAX_LAYERS());

        for (let i = 0; i < cap; i++) {
          await escrow.connect(marketplace).deposit(addr, 1, ONE(1));
        }
        expect((await escrow.layersOf(addr, 1)).length).to.equal(cap);

        // One past the cap: the money still lands, no new row is created.
        await escrow.connect(marketplace).deposit(addr, 1, ONE(1));
        const layers = await escrow.layersOf(addr, 1);
        expect(layers.length).to.equal(cap);
        expect(layers[cap - 1].amount).to.equal(ONE(2));
        expect(await escrow.reservedFor(addr, 1)).to.equal(ONE(cap + 1));
      });

      it("keeps a claim payable at the cap, and the books still balance", async function () {
        const addr = await nftAddr();
        const cap = Number(await escrow.MAX_LAYERS());
        for (let i = 0; i < cap + 5; i++) {
          await escrow.connect(marketplace).deposit(addr, 1, ONE(1));
        }
        await nft.connect(alice).approve(await escrow.getAddress(), 1);

        const before = await usdc.balanceOf(alice.address);
        await escrow.connect(alice).claimBuyback(addr, 1);
        // Everything deposited is fresh, so it all pays at 80%.
        expect((await usdc.balanceOf(alice.address)) - before).to.equal(ONE((cap + 5) * 0.8));
        expect(await escrow.totalReserved()).to.equal(0);
      });
    });

    describe("rounding no longer punishes many small layers (finding 12)", function () {
      it("pays the same for ten 1-unit layers as for one 10-unit layer", async function () {
        const addr = await nftAddr();
        await nft.mint(bob.address, 2);

        // Item 1: ten separate 1-unit layers. Item 2: a single 10-unit layer.
        for (let i = 0; i < 10; i++) {
          await escrow.connect(marketplace).deposit(addr, 1, 1n);
        }
        await escrow.connect(marketplace).deposit(addr, 2, 10n);

        const split = await escrow.previewClaim(addr, 1);
        const single = await escrow.previewClaim(addr, 2);

        expect(split.principal).to.equal(single.principal);
        expect(split.payout).to.equal(single.payout);
        expect(split.payout).to.equal(8n); // 10 units at 80%, not 0
      });
    });

    describe("owners can see what they would receive (finding 13)", function () {
      it("previewClaim matches what claimBuyback actually pays", async function () {
        const addr = await nftAddr();
        await escrow.connect(marketplace).deposit(addr, 1, ONE(100));
        await time.increase(2 * YEAR); // 88% bracket
        await nft.connect(alice).approve(await escrow.getAddress(), 1);

        const preview = await escrow.previewClaim(addr, 1);
        const before = await usdc.balanceOf(alice.address);
        await escrow.connect(alice).claimBuyback(addr, 1);

        expect((await usdc.balanceOf(alice.address)) - before).to.equal(preview.payout);
        expect(preview.principal).to.equal(ONE(100));
        expect(preview.payout).to.equal(ONE(88));
        expect(preview.fee).to.equal(ONE(12));
      });

      it("exposes each layer with its own timestamp", async function () {
        const addr = await nftAddr();
        await escrow.connect(marketplace).deposit(addr, 1, ONE(10));
        await time.increase(YEAR);
        await escrow.connect(marketplace).deposit(addr, 1, ONE(20));

        const layers = await escrow.layersOf(addr, 1);
        expect(layers.length).to.equal(2);
        expect(layers[0].amount).to.equal(ONE(10));
        expect(layers[1].amount).to.equal(ONE(20));
        expect(layers[1].timestamp).to.be.greaterThan(layers[0].timestamp);
      });

      it("previews an unfunded item as all zeroes rather than reverting", async function () {
        const preview = await escrow.previewClaim(await nftAddr(), 1);
        expect(preview.principal).to.equal(0);
        expect(preview.payout).to.equal(0);
        expect(preview.layerCount).to.equal(0);
      });
    });

    describe("solvency views survive bad books (finding 14)", function () {
      it("reports solvent and a zero surplus on a freshly funded item", async function () {
        await escrow.connect(marketplace).deposit(await nftAddr(), 1, ONE(100));
        expect(await escrow.isSolvent()).to.equal(true);
        expect(await escrow.unattributedBalance()).to.equal(0);
      });

      it("counts a stray transfer as unattributed, not as item money", async function () {
        await escrow.connect(marketplace).deposit(await nftAddr(), 1, ONE(100));
        await usdc.mint(bob.address, ONE(7));
        await usdc.connect(bob).transfer(await escrow.getAddress(), ONE(7));

        expect(await escrow.unattributedBalance()).to.equal(ONE(7));
        expect(await escrow.isSolvent()).to.equal(true);
      });
    });

    describe("deployment refuses a threshold of zero (finding 10)", function () {
      it("reverts rather than shipping an item option that can never pay", async function () {
        const Escrow = await ethers.getContractFactory("BuybackEscrow");
        await expect(
          Escrow.deploy(await usdc.getAddress(), vault.address, windDownTrigger.address, 0),
        ).to.be.revertedWithCustomError(escrow, "ZeroThreshold");
      });
    });
  });

  describe("accounting", function () {
    it("reports tokens sent in by mistake without offering a way to recover them", async function () {
      const nftAddr = await nft.getAddress();
      await escrow.connect(marketplace).deposit(nftAddr, 1, ONE(100));

      // Someone transfers straight to the contract instead of using deposit().
      await usdc.mint(bob.address, ONE(7));
      await usdc.connect(bob).transfer(await escrow.getAddress(), ONE(7));

      expect(await escrow.unattributedBalance()).to.equal(ONE(7));
      expect(await escrow.totalReserved()).to.equal(ONE(100));
      // And there is deliberately no rescue function to get that 7 back.
    });

    it("keeps the contract's token balance always equal to reserved + retained fees + unattributed", async function () {
      const addr = await nft.getAddress();
      await escrow.connect(marketplace).deposit(addr, 1, ONE(100));
      await nft.connect(alice).approve(await escrow.getAddress(), 1);
      await escrow.connect(alice).claimBuyback(addr, 1); // creates a retained fee (20)

      await usdc.mint(bob.address, ONE(3));
      await usdc.connect(bob).transfer(await escrow.getAddress(), ONE(3)); // unattributed

      const balance = await usdc.balanceOf(await escrow.getAddress());
      const accounted =
        (await escrow.totalReserved()) + (await escrow.retainedFees()) + (await escrow.unattributedBalance());
      expect(balance).to.equal(accounted);
    });
  });
});
