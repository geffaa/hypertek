import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

// Verifies the real "User A sells, User B buys" ownership-transfer flow against
// the exact contract that is actually deployed live (backend/contracts/Marketplace.sol,
// PLATFORM_FEE_BPS = 1000 = 10%, confirmed by a live eth_call to the deployed contract
// on Base Sepolia). Runs entirely on Hardhat's ephemeral local network — no testnet
// faucet required.
describe("Marketplace ownership transfer (A sells -> B buys)", function () {
  let nft, usdc, market;
  let deployer, creator, userA, userB, platformWallet;
  const price = 1_000_000n; // 1 USDC (6 decimals)

  beforeEach(async function () {
    [deployer, creator, userA, userB, platformWallet] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const MyNFT = await ethers.getContractFactory("MyNFT");
    nft = await MyNFT.deploy();
    await nft.waitForDeployment();

    const Marketplace = await ethers.getContractFactory("Marketplace");
    market = await Marketplace.deploy(platformWallet.address, await usdc.getAddress());
    await market.waitForDeployment();

    // Authorize the marketplace to mark first-sale NFTs as sold (matches production setup).
    await nft.connect(deployer).setMarketplaceAuthorization(await market.getAddress(), true);

    // Fund userA and userB with mock USDC the same way the app's faucet-less MockUSDC works.
    await usdc.mint(userA.address, price * 10n);
    await usdc.mint(userB.address, price * 10n);
  });

  it("moves on-chain ownership from A to B and splits escrow 10% platform / 5% royalty / 85% seller on a real resale", async function () {
    // 1) Creator mints the NFT (5% royalty).
    const mintTx = await nft.connect(creator).mint(creator.address, "ipfs://token-1", 500);
    await mintTx.wait();
    const tokenId = 1;
    expect(await nft.ownerOf(tokenId)).to.equal(creator.address);

    // 2) First sale: creator lists, userA buys. First sale pays 100% to the creator.
    await nft.connect(creator).approve(await market.getAddress(), tokenId);
    await market.connect(creator).createListing(await nft.getAddress(), tokenId, price);
    await usdc.connect(userA).approve(await market.getAddress(), price);
    await market.connect(userA).buyNFT(await nft.getAddress(), tokenId);

    expect(await nft.ownerOf(tokenId)).to.equal(userA.address);
    expect(await market.creatorBalance(creator.address)).to.equal(price);
    expect(await market.platformBalance()).to.equal(0n);

    // 3) THE SCENARIO IN QUESTION: userA (now the owner) sells to userB.
    await nft.connect(userA).approve(await market.getAddress(), tokenId);
    await market.connect(userA).createListing(await nft.getAddress(), tokenId, price);

    await usdc.connect(userB).approve(await market.getAddress(), price);
    const tx = await market.connect(userB).buyNFT(await nft.getAddress(), tokenId);
    const receipt = await tx.wait();

    // Ownership assertion: the item is now User B's.
    expect(await nft.ownerOf(tokenId)).to.equal(userB.address);

    // Listing is closed so it can't be bought twice.
    const listing = await market.getListing(await nft.getAddress(), tokenId);
    expect(listing.active).to.equal(false);

    // Escrow split assertion, using the LIVE fee (10% platform) confirmed on-chain earlier.
    const royaltyAmount = (price * 500n) / 10000n; // 5%
    const platformAmount = (price * 1000n) / 10000n; // 10% (live PLATFORM_FEE_BPS)
    const sellerAmount = price - royaltyAmount - platformAmount; // 85%

    expect(await market.creatorBalance(creator.address)).to.equal(price + royaltyAmount);
    expect(await market.platformBalance()).to.equal(platformAmount);
    expect(await market.sellerBalance(userA.address)).to.equal(sellerAmount);

    // Confirm the NFTSold event actually reflects the same numbers (what the backend
    // listens to / reconciles against).
    const event = receipt.logs
      .map((log) => {
        try {
          return market.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e && e.name === "NFTSold");
    expect(event.args.buyer).to.equal(userB.address);
    expect(event.args.seller).to.equal(userA.address);
    expect(event.args.sellerAmount).to.equal(sellerAmount);
    expect(event.args.platformAmount).to.equal(platformAmount);
    expect(event.args.isFirstSale).to.equal(false);

    // Sanity: userB can now withdraw nothing (buyer, not owed escrow), and userA can
    // withdraw exactly their seller proceeds.
    await expect(market.connect(userA).withdrawSeller()).to.not.be.reverted;
    expect(await usdc.balanceOf(userA.address)).to.equal(price * 10n - price + sellerAmount);
  });

  it("rejects a second purchase attempt on the same (now-closed) listing", async function () {
    await nft.connect(creator).mint(creator.address, "ipfs://token-2", 500);
    const tokenId = 1;
    await nft.connect(creator).approve(await market.getAddress(), tokenId);
    await market.connect(creator).createListing(await nft.getAddress(), tokenId, price);
    await usdc.connect(userA).approve(await market.getAddress(), price);
    await market.connect(userA).buyNFT(await nft.getAddress(), tokenId);

    // userB tries to buy the same listing again after userA already bought it.
    await usdc.connect(userB).approve(await market.getAddress(), price);
    await expect(
      market.connect(userB).buyNFT(await nft.getAddress(), tokenId)
    ).to.be.revertedWith("Listing not active");

    // Ownership stays with userA, not duplicated/overwritten.
    expect(await nft.ownerOf(tokenId)).to.equal(userA.address);
  });

  it("NFTSold event log parses exactly the way marketplaceSyncService.verifySaleOnChain expects", async function () {
    // Same parsing approach as backend/services/marketplaceSyncService.js#verifySaleOnChain:
    // read the tx receipt, find the log emitted by the marketplace contract, parse it, and
    // pull buyer/seller/tokenId/price out. This is the highest-risk part to get wrong (field
    // names, decimals) since a mismatch there would make on-chain verification silently reject
    // every real sale.
    await nft.connect(creator).mint(creator.address, "ipfs://token-3", 500);
    const tokenId = 1;
    await nft.connect(creator).approve(await market.getAddress(), tokenId);
    await market.connect(creator).createListing(await nft.getAddress(), tokenId, price);
    await usdc.connect(userA).approve(await market.getAddress(), price);
    const tx = await market.connect(userA).buyNFT(await nft.getAddress(), tokenId);
    const receipt = await tx.wait();

    const marketAddress = (await market.getAddress()).toLowerCase();
    let parsedEvent = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== marketAddress) continue;
      let parsed;
      try {
        parsed = market.interface.parseLog(log);
      } catch {
        continue;
      }
      if (parsed?.name === "NFTSold") {
        parsedEvent = parsed.args;
        break;
      }
    }

    expect(parsedEvent, "NFTSold event should be present in the receipt logs").to.not.be.null;
    expect(parsedEvent.buyer.toLowerCase()).to.equal(userA.address.toLowerCase());
    expect(parsedEvent.seller.toLowerCase()).to.equal(creator.address.toLowerCase());
    expect(String(parsedEvent.tokenId)).to.equal(String(tokenId));
    expect(parseFloat(ethers.formatUnits(parsedEvent.price, 6))).to.equal(1); // price = 1_000_000n = 1 USDC
    expect(parsedEvent.isFirstSale).to.equal(true);

    // Also confirm the reconcile job's query approach (queryFilter, not just receipt.logs)
    // finds the same event — this is what findUnprocessedSales relies on.
    const queried = await market.queryFilter(market.filters.NFTSold(), 0, "latest");
    const match = queried.find((e) => e.transactionHash === receipt.hash);
    expect(match, "queryFilter should also find this NFTSold event").to.not.be.undefined;
    expect(match.args.tokenId).to.equal(parsedEvent.tokenId);
  });
});
