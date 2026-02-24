const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://rpc.testnet.immutable.com");
const nftAddress = "0x80C7F0656bbfCEE1dF99f2bc3440FaC0744C82Be";

const abi = [
    "function nextTokenId() view returns (uint256)",
    "function ownerOf(uint256) view returns (address)"
];

async function main() {
    const contract = new ethers.Contract(nftAddress, abi, provider);
    const nextTokenId = await contract.nextTokenId();
    console.log("Next Token ID:", nextTokenId.toString());
    
    if (nextTokenId > 0n) {
        const lastTokenId = nextTokenId - 1n;
        try {
            const owner = await contract.ownerOf(lastTokenId);
            console.log(`Owner of token ${lastTokenId}: ${owner}`);
        } catch (e) {
            console.error(`Error fetching owner for ${lastTokenId}:`, e.message);
        }
    }
}
main().catch(console.error);
