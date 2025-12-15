import pkg from "hardhat";
const { ethers } = pkg;

describe("Market Contract", function () {
  let nftSystem, market;

  beforeEach(async function () {
    const NFTSystemFactory = await ethers.getContractFactory("MyNFT");
    nftSystem = await NFTSystemFactory.deploy();
    await nftSystem.waitForDeployment();

    const MarketFactory = await ethers.getContractFactory("Marketplace");
    market = await MarketFactory.deploy(nftSystem.getAddress());
    await market.waitForDeployment();
  });

  it("Should deploy market", async function () {
    console.log("Market address:", await market.getAddress());
  });
});
