import pkg from "hardhat";
const { ethers } = pkg;

describe("NFTSystem Contract", function () {
  let nftSystem;

  beforeEach(async function () {
    const NFTSystemFactory = await ethers.getContractFactory("MyNFT");
    nftSystem = await NFTSystemFactory.deploy(); // ✅ deploy contract
    await nftSystem.waitForDeployment();         // ✅ wait until deployed
  });

  it("Should deploy successfully", async function () {
    console.log("NFTSystem address:", await nftSystem.getAddress());
  });
});
