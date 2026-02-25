const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const NFTSystem = await ethers.getContractFactory("MyNFT");
  const nftAddress = process.env.MYNFT_ADDRESS || "0xC40f17FfF5591dbb12CD4279111C22bb33425244";
  const nft = NFTSystem.attach(nftAddress);
  
  const nextTokenId = await nft.nextTokenId();
  console.log("Next Token ID:", nextTokenId.toString());

  for (let i = 1; i < nextTokenId; i++) {
    try {
      const sold = await nft.hasBeenSold(i);
      console.log(`Token ${i} hasBeenSold: ${sold}`);
      if (!sold) {
          console.log(`Fixing Token ${i}...`);
          const tx = await nft.markAsSold(i);
          await tx.wait();
          console.log(`Token ${i} successfully marked as sold!`);
      }
    } catch (e) {
      console.error(`Error checking token ${i}:`, e.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
