
import { ethers } from "ethers";

async function main() {
    const rpcUrl = "https://rpc.testnet.immutable.com";
    const walletAddress = "0x11Dd223303346021d21a72818c3188187eA07FD3";
    
    console.log(`Checking balance for ${walletAddress} on ${rpcUrl}...`);
    
    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balance = await provider.getBalance(walletAddress);
        console.log(`Balance: ${ethers.formatEther(balance)} IMX`);
    } catch (error) {
        console.error("Error fetching balance:", error.message);
    }
}

main();
