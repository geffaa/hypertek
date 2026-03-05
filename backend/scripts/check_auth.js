import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const myNFTAddress = "0x9943ADE61Eba288cc0c8F6c3e35dc0D0D886Fa60";
    const marketplaceAddress = "0x08C05937428c53b6fE248fd96C6DADD511cBC1b3";

    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.attach(myNFTAddress);

    const isAuthorized = await myNFT.isMarketplaceAuthorized(marketplaceAddress);
    console.log("Marketplace is authorized:", isAuthorized);

    if (!isAuthorized) {
        console.log("Authorizing...");
        const tx = await myNFT.setMarketplaceAuthorization(marketplaceAddress, true);
        await tx.wait();
        console.log("Authorized.");
    }
}
main().catch(console.error);
