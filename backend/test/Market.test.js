import pkg from "hardhat";
const { ethers } = pkg;

describe("Market Contract", function () {
  let nftSystem, market;

  beforeEach(async function () {
    const NFTSystemFactory = await ethers.getContractFactory("MyNFT");
    nftSystem = await NFTSystemFactory.deploy();
    await nftSystem.waitForDeployment();

    // Marketplace constructor: (platformWallet, usdcAddress)
    const [deployer] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockERC20").catch(() => null);
    const usdcAddress = MockUSDC
      ? await (await MockUSDC.deploy()).getAddress()
      : deployer.address; // fallback to deployer address if no mock ERC20
    const MarketFactory = await ethers.getContractFactory("Marketplace");
    market = await MarketFactory.deploy(deployer.address, usdcAddress);
    await market.waitForDeployment();
  });

  it("Should deploy market", async function () {
    console.log("Market address:", await market.getAddress());
  });
});
